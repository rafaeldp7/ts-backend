const mongoose = require('mongoose');

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
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
      Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const generateClusterIcon = (count) => {
  if (count <= 10) return 'small';
  if (count <= 50) return 'medium';
  if (count <= 100) return 'large';
  return 'xlarge';
};

module.exports = {
  clusterMarkers,
  processMarkers,
  applyMapFilters,
  snapToRoads
};