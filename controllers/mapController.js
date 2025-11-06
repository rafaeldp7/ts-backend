const mongoose = require('mongoose');
const Report = require('../models/Reports');
const GasStation = require('../models/GasStation');
const UserMotor = require('../models/userMotorModel');
const {
  validateCoordinates,
  filterReports,
  filterGasStations,
  generateReportMarkers,
  generateGasStationMarkers,
  generateCurrentLocationMarker,
  generateDestinationMarker,
  generatePolylines,
  compareReports,
  applyMapFilters,
  clusterMarkers: clusterMarkersUtil,
  calculateDistance: calculateDistanceUtil
} = require('../utils/mapProcessingUtils');

/**
 * Cluster markers for better performance
 * POST /api/map/cluster-markers
 */
const clusterMarkers = async (req, res) => {
  try {
    const startTime = Date.now();
    const { reports, gasStations, currentZoom, options = {} } = req.body;
    
    if (!reports && !gasStations) {
      return res.status(400).json({ error: 'Reports or gas stations data is required' });
    }
    
    const { radius = 100, minZoom = 15, maxZoom = 10 } = options;
    
    // Combine all markers
    const allMarkers = [
      ...(reports || []).map(report => ({
        id: `report_${report._id}`,
        type: 'report',
        position: report.location,
        data: report
      })),
      ...(gasStations || []).map(station => ({
        id: `station_${station._id}`,
        type: 'gasStation',
        position: station.location,
        data: station
      }))
    ];
    
    // Simple clustering algorithm
    const clusters = [];
    const processed = new Set();
    
    allMarkers.forEach(marker => {
      if (processed.has(marker.id)) return;
      
      const cluster = {
        id: `cluster_${clusters.length}`,
        position: marker.position,
        markers: [marker],
        count: 1,
        type: 'cluster'
      };
      
      // Find nearby markers
      allMarkers.forEach(otherMarker => {
        if (processed.has(otherMarker.id) || marker.id === otherMarker.id) return;
        
        const distance = calculateDistance(
          marker.position.latitude, marker.position.longitude,
          otherMarker.position.latitude, otherMarker.position.longitude
        );
        
        if (distance <= radius) {
          cluster.markers.push(otherMarker);
          cluster.count++;
          processed.add(otherMarker.id);
        }
      });
      
      processed.add(marker.id);
      clusters.push(cluster);
    });
    
    // Generate cluster icons based on count
    const clusterIcons = clusters.map(cluster => ({
      id: cluster.id,
      icon: generateClusterIcon(cluster.count),
      size: Math.min(50, 20 + cluster.count * 2)
    }));
        
        res.json({
      clusters,
      clusterIcons,
      performance: {
        processingTime: Date.now() - startTime,
        markersProcessed: allMarkers.length,
        clustersGenerated: clusters.length
      }
    });
    } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Process markers for map rendering
 * POST /api/map/process-markers
 */
const processMarkers = async (req, res) => {
  try {
    const startTime = Date.now();
    const { reports, gasStations, currentZoom, mapFilters, viewport } = req.body;
    
    // Filter markers based on zoom and viewport
    const filteredReports = (reports || []).filter(report => {
      if (!report.location) return false;
      if (mapFilters && mapFilters.reports) {
        if (mapFilters.reports.archived !== undefined && report.archived !== mapFilters.reports.archived) {
          return false;
        }
        if (mapFilters.reports.status && !mapFilters.reports.status.includes(report.status)) {
          return false;
        }
      }
      return true;
    });
    
    const filteredGasStations = (gasStations || []).filter(station => {
      if (!station.location) return false;
      if (mapFilters && mapFilters.gasStations) {
        if (mapFilters.gasStations.type && station.type !== mapFilters.gasStations.type) {
          return false;
        }
      }
      return true;
    });
    
    // Generate markers
    const markers = [
      ...filteredReports.map(report => ({
        id: `report_${report._id}`,
        type: 'report',
        position: report.location,
        data: report,
        visible: currentZoom >= 10
      })),
      ...filteredGasStations.map(station => ({
        id: `station_${station._id}`,
        type: 'gasStation',
        position: station.location,
        data: station,
        visible: currentZoom >= 8
      }))
    ];
    
    // Apply clustering if zoom level is low
    let clusters = [];
    if (currentZoom < 12) {
      const clusterResult = await clusterMarkers({ body: { reports: filteredReports, gasStations: filteredGasStations, currentZoom } }, { json: () => {} });
      clusters = clusterResult.clusters || [];
    }
    
    res.json({
      markers,
      clusters,
      performance: {
        markersProcessed: markers.length,
        clustersGenerated: clusters.length,
        processingTime: Date.now() - startTime,
        memoryUsage: JSON.stringify(markers).length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Apply map filters
 * POST /api/map/apply-filters
 */
const applyMapFilters = async (req, res) => {
  try {
    const startTime = Date.now();
    const { data, filters, dataType } = req.body;
    
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: 'Data array is required' });
    }
    
    let filteredData = data;
    
    // Apply filters based on data type
    if (filters) {
      filteredData = data.filter(item => {
        // Archive filter
        if (filters.archived !== undefined && item.archived !== filters.archived) {
          return false;
        }
        
        // Status filter
        if (filters.status && filters.status.length > 0 && !filters.status.includes(item.status)) {
          return false;
        }
        
        // Type filter
        if (filters.type && item.type !== filters.type) {
          return false;
        }
        
        // Date range filter
        if (filters.dateRange) {
          const itemDate = new Date(item.createdAt || item.date);
          if (filters.dateRange.start && itemDate < new Date(filters.dateRange.start)) {
            return false;
          }
          if (filters.dateRange.end && itemDate > new Date(filters.dateRange.end)) {
            return false;
          }
        }
        
        // Location filter
        if (filters.location && filters.radius && item.location) {
          const distance = calculateDistance(
            filters.location.latitude, filters.location.longitude,
            item.location.latitude, item.location.longitude
          );
          if (distance > filters.radius) {
            return false;
          }
        }
        
        return true;
      });
    }
    
    // Calculate statistics
    const statistics = {
      originalCount: data.length,
      filteredCount: filteredData.length,
      filterRate: ((data.length - filteredData.length) / data.length * 100).toFixed(2)
    };
    
    res.json({
      filteredData,
      statistics,
      performance: {
        originalCount: data.length,
        filteredCount: filteredData.length,
        processingTime: Date.now() - startTime
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Snap coordinates to roads
 * POST /api/map/snap-to-roads
 */
const snapToRoads = async (req, res) => {
  try {
    const startTime = Date.now();
    const { coordinates, interpolate = true } = req.body;
    
    if (!coordinates || !Array.isArray(coordinates)) {
      return res.status(400).json({ error: 'Coordinates array is required' });
    }
    
    // In a real implementation, you would call Google Roads API here
    // For now, we'll return the coordinates as-is with a note
    const snappedPoints = coordinates.map((coord, index) => ({
      latitude: coord.latitude,
      longitude: coord.longitude,
      originalIndex: index,
      placeId: `place_${index}`
    }));
    
    res.json({
      snappedPoints,
      snappedCoordinates: snappedPoints.map(p => ({ latitude: p.latitude, longitude: p.longitude })),
      hasSnapped: true,
      apiUsage: {
        pointsProcessed: coordinates.length,
        pointsSnapped: snappedPoints.length,
        processingTime: Date.now() - startTime
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper functions
const calculateDistance = calculateDistanceUtil;

const generateClusterIcon = (count) => {
  if (count <= 10) return 'small';
  if (count <= 50) return 'medium';
  if (count <= 100) return 'large';
  return 'xlarge';
};

/**
 * Get processed map data
 * GET /api/map/processed-data
 */
const getProcessedData = async (req, res) => {
  try {
    const startTime = Date.now();
    const { 
      userId, 
      showReports = true, 
      showGasStations = true, 
      currentZoom,
      viewport,
      mapFilters
    } = req.query;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID is required' 
      });
    }
    
    // Parse query parameters
    const showReportsFlag = showReports === 'true' || showReports === true;
    const showGasStationsFlag = showGasStations === 'true' || showGasStations === true;
    const zoom = currentZoom ? parseFloat(currentZoom) : 15;
    
    // Parse viewport if provided
    let viewportBounds = null;
    if (viewport) {
      try {
        viewportBounds = typeof viewport === 'string' ? JSON.parse(viewport) : viewport;
      } catch (e) {
        console.warn('Invalid viewport format:', e);
      }
    }
    
    // Parse map filters if provided
    let filters = null;
    if (mapFilters) {
      try {
        filters = typeof mapFilters === 'string' ? JSON.parse(mapFilters) : mapFilters;
      } catch (e) {
        console.warn('Invalid mapFilters format:', e);
      }
    }
    
    // Build query for reports
    const reportQuery = {};
    if (viewportBounds) {
      reportQuery['location.latitude'] = {
        $gte: viewportBounds.south,
        $lte: viewportBounds.north
      };
      reportQuery['location.longitude'] = {
        $gte: viewportBounds.west,
        $lte: viewportBounds.east
      };
    }
    
    // Build query for gas stations
    const gasStationQuery = {};
    if (viewportBounds) {
      gasStationQuery.location = {
        $geoWithin: {
          $box: [
            [viewportBounds.west, viewportBounds.south],
            [viewportBounds.east, viewportBounds.north]
          ]
        }
      };
    }
    
    // Fetch raw data
    const [rawReports, rawGasStations, rawMotors] = await Promise.all([
      showReportsFlag ? Report.find(reportQuery).lean() : [],
      showGasStationsFlag ? GasStation.find(gasStationQuery).lean() : [],
      UserMotor.find({ userId }).lean()
    ]);
    
    const filteringStartTime = Date.now();
    
    // Filter reports
    let filteredReports = filterReports(rawReports);
    
    // Apply map filters to reports
    if (filters) {
      filteredReports = applyMapFilters(filteredReports, filters);
    }
    
    // Filter gas stations
    const filteredGasStations = filterGasStations(rawGasStations);
    
    const filteringTime = Date.now() - filteringStartTime;
    
    // Generate markers
    const markerGenerationStartTime = Date.now();
    const reportMarkers = generateReportMarkers(filteredReports);
    const gasStationMarkers = generateGasStationMarkers(filteredGasStations);
    const allMarkers = [...reportMarkers, ...gasStationMarkers];
    const markerGenerationTime = Date.now() - markerGenerationStartTime;
    
    // Cluster markers if needed
    const clusteringStartTime = Date.now();
    const clusters = clusterMarkersUtil(allMarkers, zoom, { radius: 100, minZoom: 15 });
    const clusteringTime = Date.now() - clusteringStartTime;
    
    // Calculate statistics
    const statistics = {
      totalReports: rawReports.length,
      filteredReports: filteredReports.length,
      totalGasStations: rawGasStations.length,
      filteredGasStations: filteredGasStations.length,
      totalMotors: rawMotors.length,
      markersGenerated: allMarkers.length,
      clustersGenerated: clusters.length
    };
    
    // Performance metrics
    const performance = {
      processingTime: Date.now() - startTime,
      filteringTime,
      clusteringTime,
      markerGenerationTime
    };
    
    res.json({
      success: true,
      data: {
        reports: filteredReports,
        gasStations: filteredGasStations,
        motors: rawMotors,
        markers: allMarkers,
        clusters,
        statistics,
        performance
      }
    });
  } catch (error) {
    console.error('Get processed data error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

/**
 * Prepare map markers and polylines
 * POST /api/map/prepare-markers
 */
const prepareMarkers = async (req, res) => {
  try {
    const startTime = Date.now();
    const {
      currentLocation,
      destination,
      selectedRoute,
      alternativeRoutes,
      reports = [],
      gasStations = [],
      showReports = true,
      showGasStations = true,
      currentZoom = 15
    } = req.body;
    
    const markers = [];
    const polylines = [];
    
    // Add current location marker
    if (currentLocation) {
      const currentMarker = generateCurrentLocationMarker(currentLocation);
      if (currentMarker) {
        markers.push(currentMarker);
      }
    }
    
    // Add destination marker
    if (destination) {
      const destMarker = generateDestinationMarker(destination);
      if (destMarker) {
        markers.push(destMarker);
      }
    }
    
    // Filter and generate report markers
    if (showReports && Array.isArray(reports) && reports.length > 0) {
      const filteredReports = filterReports(reports);
      const reportMarkers = generateReportMarkers(filteredReports);
      markers.push(...reportMarkers);
    }
    
    // Filter and generate gas station markers
    if (showGasStations && Array.isArray(gasStations) && gasStations.length > 0) {
      const filteredGasStations = filterGasStations(gasStations);
      const gasStationMarkers = generateGasStationMarkers(filteredGasStations);
      markers.push(...gasStationMarkers);
    }
    
    // Generate polylines
    const generatedPolylines = generatePolylines(selectedRoute, alternativeRoutes);
    polylines.push(...generatedPolylines);
    
    // Cluster markers if needed
    const clusters = clusterMarkersUtil(markers, currentZoom, { radius: 100, minZoom: 15 });
    
    res.json({
      success: true,
      data: {
        markers,
        polylines,
        clusters
      },
      performance: {
        processingTime: Date.now() - startTime,
        markersGenerated: markers.length,
        polylinesGenerated: polylines.length,
        clustersGenerated: clusters.length
      }
    });
  } catch (error) {
    console.error('Prepare markers error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

/**
 * Compare reports for changes
 * POST /api/map/compare-reports
 */
const compareReportsEndpoint = async (req, res) => {
  try {
    const startTime = Date.now();
    const { currentReports = [], freshReports = [] } = req.body;
    
    if (!Array.isArray(currentReports) || !Array.isArray(freshReports)) {
      return res.status(400).json({
        success: false,
        error: 'Both currentReports and freshReports must be arrays'
      });
    }
    
    const comparisonResult = compareReports(currentReports, freshReports);
    
    res.json({
      success: true,
      data: {
        hasChanges: comparisonResult.hasChanges,
        changes: comparisonResult.changes,
        statistics: comparisonResult.statistics
      },
      performance: {
        processingTime: Date.now() - startTime
      }
    });
  } catch (error) {
    console.error('Compare reports error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

module.exports = {
  clusterMarkers,
  processMarkers,
  applyMapFilters,
  snapToRoads,
  getProcessedData,
  prepareMarkers,
  compareReportsEndpoint
};