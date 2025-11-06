/**
 * Map Processing Utilities
 * Utility functions for filtering and processing map data
 */

/**
 * Validate coordinates
 * @param {Object} location - Location object with latitude and longitude
 * @returns {boolean} - True if coordinates are valid
 */
const validateCoordinates = (location) => {
  if (!location) return false;
  
  const { latitude, longitude } = location;
  
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
};

/**
 * Filter reports based on validation rules
 * @param {Array} reports - Array of report objects
 * @returns {Array} - Filtered reports
 */
const filterReports = (reports) => {
  if (!Array.isArray(reports)) return [];
  
  return reports.filter(report => {
    // 1. Check if report has location
    if (!report?.location) return false;
    
    // 2. Filter out archived reports
    if (report.archived === true) return false;
    
    // 3. Filter out reports with invalid status (if status field exists)
    if (report.status && (report.status === 'archived' || report.status === 'deleted')) {
      return false;
    }
    
    // 4. Validate coordinates
    return validateCoordinates(report.location);
  });
};

/**
 * Filter gas stations based on validation rules
 * @param {Array} stations - Array of gas station objects
 * @returns {Array} - Filtered gas stations
 */
const filterGasStations = (stations) => {
  if (!Array.isArray(stations)) return [];
  
  return stations.filter(station => {
    const coords = station?.location?.coordinates;
    
    // 1. Check if coordinates array exists and has at least 2 elements
    if (!coords || !Array.isArray(coords) || coords.length < 2) return false;
    
    // 2. Validate coordinates (convert from [lng, lat] to {lat, lng})
    return validateCoordinates({
      latitude: Number(coords[1]),  // Second element is latitude
      longitude: Number(coords[0]), // First element is longitude
    });
  });
};

/**
 * Generate map markers from reports
 * @param {Array} reports - Array of filtered reports
 * @returns {Array} - Array of marker objects
 */
const generateReportMarkers = (reports) => {
  if (!Array.isArray(reports)) return [];
  
  return reports.map(report => {
    // Determine pin color based on report type
    const pinColors = {
      'Accident': '#e74c3c',
      'Traffic Jam': '#f39c12',
      'Road Closure': '#9b59b6',
      'Hazard': '#e67e22',
      'default': '#3498db'
    };
    
    return {
      id: report._id?.toString() || `report_${Date.now()}_${Math.random()}`,
      coordinate: {
        latitude: report.location.latitude,
        longitude: report.location.longitude
      },
      title: report.reportType || 'Report',
      description: report.description || '',
      pinColor: pinColors[report.reportType] || pinColors.default,
      type: 'report',
      report: report
    };
  });
};

/**
 * Generate map markers from gas stations
 * @param {Array} stations - Array of filtered gas stations
 * @returns {Array} - Array of marker objects
 */
const generateGasStationMarkers = (stations) => {
  if (!Array.isArray(stations)) return [];
  
  return stations.map(station => {
    const coords = station.location.coordinates;
    
    // Determine pin color based on brand
    const brandColors = {
      'Shell': '#FF0000',
      'Petron': '#FFD700',
      'Caltex': '#FFA500',
      'Unioil': '#0000FF',
      'default': '#95a5a6'
    };
    
    return {
      id: station._id?.toString() || `station_${Date.now()}_${Math.random()}`,
      coordinate: {
        latitude: coords[1],
        longitude: coords[0]
      },
      title: station.name || 'Gas Station',
      description: station.address || station.fullAddress || '',
      pinColor: brandColors[station.brand] || brandColors.default,
      type: 'gasStation',
      gasStation: station
    };
  });
};

/**
 * Generate current location marker
 * @param {Object} currentLocation - Current location object
 * @returns {Object|null} - Marker object or null
 */
const generateCurrentLocationMarker = (currentLocation) => {
  if (!currentLocation || !validateCoordinates(currentLocation)) return null;
  
  return {
    id: 'current-location',
    coordinate: currentLocation,
    title: 'Current Location',
    description: 'Your current position',
    pinColor: '#00ADB5',
    type: 'current'
  };
};

/**
 * Generate destination marker
 * @param {Object} destination - Destination object
 * @returns {Object|null} - Marker object or null
 */
const generateDestinationMarker = (destination) => {
  if (!destination || !validateCoordinates(destination)) return null;
  
  return {
    id: 'destination',
    coordinate: {
      latitude: destination.latitude,
      longitude: destination.longitude
    },
    title: 'Destination',
    description: destination.address || 'Selected destination',
    pinColor: '#e74c3c',
    type: 'destination'
  };
};

/**
 * Generate route polylines
 * @param {Object} selectedRoute - Selected route object
 * @param {Array} alternativeRoutes - Array of alternative routes
 * @returns {Array} - Array of polyline objects
 */
const generatePolylines = (selectedRoute, alternativeRoutes = []) => {
  const polylines = [];
  
  // Selected route
  if (selectedRoute?.coordinates && Array.isArray(selectedRoute.coordinates) && selectedRoute.coordinates.length > 0) {
    polylines.push({
      id: 'selected-route',
      coordinates: selectedRoute.coordinates,
      strokeColor: '#1e3a8a', // Dark blue
      strokeWidth: 8,
      type: 'route'
    });
  }
  
  // Alternative routes
  if (Array.isArray(alternativeRoutes)) {
    alternativeRoutes.forEach((route, index) => {
      if (route?.coordinates && Array.isArray(route.coordinates) && route.coordinates.length > 0) {
        polylines.push({
          id: `alternative-route-${index}`,
          coordinates: route.coordinates,
          strokeColor: '#3b82f6', // Lighter blue
          strokeWidth: 4,
          type: 'alternative'
        });
      }
    });
  }
  
  return polylines;
};

/**
 * Compare reports for changes
 * @param {Array} currentReports - Current reports array
 * @param {Array} freshReports - Fresh reports array
 * @returns {Object} - Comparison result with changes
 */
const compareReports = (currentReports, freshReports) => {
  const result = {
    hasChanges: false,
    changes: {
      added: [],
      removed: [],
      modified: []
    },
    statistics: {
      currentCount: currentReports?.length || 0,
      freshCount: freshReports?.length || 0,
      addedCount: 0,
      removedCount: 0,
      modifiedCount: 0
    }
  };
  
  if (!Array.isArray(currentReports) || !Array.isArray(freshReports)) {
    result.hasChanges = true;
    return result;
  }
  
  // Quick length check
  if (currentReports.length !== freshReports.length) {
    result.hasChanges = true;
  }
  
  // Create maps for efficient comparison
  const currentMap = new Map();
  const freshMap = new Map();
  
  currentReports.forEach(report => {
    if (report._id) {
      currentMap.set(report._id.toString(), {
        status: report.status || report.reportType || '',
        archived: report.archived || false,
        updatedAt: report.updatedAt || report.timestamp,
        location: report.location
      });
    }
  });
  
  freshReports.forEach(report => {
    if (report._id) {
      freshMap.set(report._id.toString(), {
        status: report.status || report.reportType || '',
        archived: report.archived || false,
        updatedAt: report.updatedAt || report.timestamp,
        location: report.location
      });
    }
  });
  
  // Check for removed reports
  for (const [id, currentData] of currentMap) {
    const freshData = freshMap.get(id);
    if (!freshData) {
      result.hasChanges = true;
      result.changes.removed.push(id);
      result.statistics.removedCount++;
    }
  }
  
  // Check for new reports and modifications
  for (const [id, freshData] of freshMap) {
    const currentData = currentMap.get(id);
    
    if (!currentData) {
      // New report added
      result.hasChanges = true;
      result.changes.added.push(id);
      result.statistics.addedCount++;
    } else {
      // Check for modifications
      const modifications = {};
      let hasModifications = false;
      
      // Check status changes
      if (currentData.status !== freshData.status) {
        modifications.status = {
          from: currentData.status,
          to: freshData.status
        };
        hasModifications = true;
      }
      
      // Check archived changes
      if (currentData.archived !== freshData.archived) {
        modifications.archived = {
          from: currentData.archived,
          to: freshData.archived
        };
        hasModifications = true;
      }
      
      // Check location changes (threshold: 0.0001 degrees)
      if (currentData.location && freshData.location) {
        const latDiff = Math.abs(currentData.location.latitude - freshData.location.latitude);
        const lngDiff = Math.abs(currentData.location.longitude - freshData.location.longitude);
        if (latDiff > 0.0001 || lngDiff > 0.0001) {
          modifications.location = {
            from: currentData.location,
            to: freshData.location
          };
          hasModifications = true;
        }
      }
      
      if (hasModifications) {
        result.hasChanges = true;
        result.changes.modified.push({
          id,
          changes: modifications
        });
        result.statistics.modifiedCount++;
      }
    }
  }
  
  return result;
};

/**
 * Apply map filters to reports
 * @param {Array} reports - Array of reports
 * @param {Object} filters - Filter object
 * @returns {Array} - Filtered reports
 */
const applyMapFilters = (reports, filters) => {
  if (!Array.isArray(reports) || !filters) return reports;
  
  return reports.filter(report => {
    // Filter by report types
    if (filters.types && Array.isArray(filters.types) && filters.types.length > 0) {
      if (!filters.types.includes(report.reportType)) {
        return false;
      }
    }
    
    // Filter by status (if status field exists)
    if (filters.status && Array.isArray(filters.status) && filters.status.length > 0) {
      const reportStatus = report.status || report.reportType || '';
      if (!filters.status.includes(reportStatus)) {
        return false;
      }
    }
    
    // Filter by show flags
    if (filters.showTrafficReports !== undefined && !filters.showTrafficReports) {
      if (report.reportType === 'Traffic Jam') return false;
    }
    
    if (filters.showAccidents !== undefined && !filters.showAccidents) {
      if (report.reportType === 'Accident') return false;
    }
    
    if (filters.showRoadwork !== undefined && !filters.showRoadwork) {
      if (report.reportType === 'Road Closure') return false;
    }
    
    if (filters.showHazards !== undefined && !filters.showHazards) {
      if (report.reportType === 'Hazard') return false;
    }
    
    return true;
  });
};

/**
 * Simple clustering algorithm for markers
 * @param {Array} markers - Array of marker objects
 * @param {number} zoom - Current zoom level
 * @param {Object} options - Clustering options
 * @returns {Array} - Array of cluster objects
 */
const clusterMarkers = (markers, zoom = 15, options = {}) => {
  if (!Array.isArray(markers) || markers.length === 0) return [];
  
  const { radius = 100, minZoom = 15 } = options;
  
  // Don't cluster if zoom is high enough
  if (zoom >= minZoom) return [];
  
  const clusters = [];
  const processed = new Set();
  
  markers.forEach(marker => {
    if (processed.has(marker.id)) return;
    
    const cluster = {
      id: `cluster_${clusters.length}`,
      coordinate: marker.coordinate,
      markers: [marker],
      count: 1,
      type: marker.type === 'report' ? 'report' : marker.type === 'gasStation' ? 'gasStation' : 'mixed'
    };
    
    // Find nearby markers
    markers.forEach(otherMarker => {
      if (processed.has(otherMarker.id) || marker.id === otherMarker.id) return;
      
      const distance = calculateDistance(
        marker.coordinate.latitude,
        marker.coordinate.longitude,
        otherMarker.coordinate.latitude,
        otherMarker.coordinate.longitude
      );
      
      if (distance <= radius) {
        cluster.markers.push(otherMarker);
        cluster.count++;
        processed.add(otherMarker.id);
        
        // Update cluster type if mixed
        if (cluster.type !== otherMarker.type && cluster.type !== 'mixed') {
          cluster.type = 'mixed';
        }
      }
    });
    
    processed.add(marker.id);
    
    // Only create cluster if it has multiple markers
    if (cluster.count > 1) {
      clusters.push(cluster);
    }
  });
  
  return clusters;
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} - Distance in meters
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return R * c;
};

module.exports = {
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
  clusterMarkers,
  calculateDistance
};

