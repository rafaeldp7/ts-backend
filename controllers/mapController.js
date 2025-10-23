const axios = require('axios');
const Report = require('../models/Reports');
const GasStation = require('../models/GasStation');
const cache = require('memory-cache');

class MapController {
  // ====================== GOOGLE MAPS API METHODS ======================
  
  // Geocode address to coordinates
  async geocodeAddress(req, res) {
    try {
      const { address } = req.body;

      if (!address) {
        return res.status(400).json({ message: 'Address is required' });
      }

      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ message: 'Google Maps API key not configured' });
      }

      const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          address: address,
          key: apiKey
        }
      });

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const result = response.data.results[0];
        const location = result.geometry.location;
        
        res.json({
          address: result.formatted_address,
          coordinates: {
            latitude: location.lat,
            longitude: location.lng
          },
          placeId: result.place_id
        });
      } else {
        res.status(404).json({ message: 'Address not found' });
      }
    } catch (error) {
      console.error('Geocode address error:', error);
      res.status(500).json({ message: 'Server error geocoding address' });
    }
  }

  // Reverse geocode coordinates to address
  async reverseGeocode(req, res) {
    try {
      const { latitude, longitude } = req.body;

      if (!latitude || !longitude) {
        return res.status(400).json({ message: 'Latitude and longitude are required' });
      }

      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ message: 'Google Maps API key not configured' });
      }

      const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          latlng: `${latitude},${longitude}`,
          key: apiKey
        }
      });

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const result = response.data.results[0];
        
        res.json({
          address: result.formatted_address,
          coordinates: {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude)
          },
          placeId: result.place_id
        });
      } else {
        res.status(404).json({ message: 'Location not found' });
      }
    } catch (error) {
      console.error('Reverse geocode error:', error);
      res.status(500).json({ message: 'Server error reverse geocoding' });
    }
  }

  // Get routes between two points
  async getRoutes(req, res) {
    try {
      const { origin, destination, waypoints, travelMode = 'DRIVING' } = req.body;

      if (!origin || !destination) {
        return res.status(400).json({ message: 'Origin and destination are required' });
      }

      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ message: 'Google Maps API key not configured' });
      }

      const params = {
        origin: typeof origin === 'string' ? origin : `${origin.latitude},${origin.longitude}`,
        destination: typeof destination === 'string' ? destination : `${destination.latitude},${destination.longitude}`,
        travelMode,
        key: apiKey
      };

      if (waypoints && waypoints.length > 0) {
        params.waypoints = waypoints.map(wp => 
          typeof wp === 'string' ? wp : `${wp.latitude},${wp.longitude}`
        ).join('|');
      }

      const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
        params
      });

      if (response.data.status === 'OK' && response.data.routes.length > 0) {
        const routes = response.data.routes.map(route => ({
          id: route.overview_polyline.points,
          summary: route.summary,
          distance: route.legs.reduce((sum, leg) => sum + leg.distance.value, 0),
          duration: route.legs.reduce((sum, leg) => sum + leg.duration.value, 0),
          polyline: route.overview_polyline.points,
          steps: route.legs.flatMap(leg => leg.steps),
          bounds: route.bounds
        }));

        res.json({ routes });
      } else {
        res.status(404).json({ message: 'No routes found' });
      }
    } catch (error) {
      console.error('Get routes error:', error);
      res.status(500).json({ message: 'Server error getting routes' });
    }
  }

  // Get directions with detailed steps
  async getDirections(req, res) {
    try {
      const { origin, destination, travelMode = 'DRIVING' } = req.body;

      if (!origin || !destination) {
        return res.status(400).json({ message: 'Origin and destination are required' });
      }

      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ message: 'Google Maps API key not configured' });
      }

      const params = {
        origin: typeof origin === 'string' ? origin : `${origin.latitude},${origin.longitude}`,
        destination: typeof destination === 'string' ? destination : `${destination.latitude},${destination.longitude}`,
        travelMode,
        key: apiKey
      };

      const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
        params
      });

      if (response.data.status === 'OK' && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        const directions = {
          summary: route.summary,
          distance: route.legs.reduce((sum, leg) => sum + leg.distance.value, 0),
          duration: route.legs.reduce((sum, leg) => sum + leg.duration.value, 0),
          polyline: route.overview_polyline.points,
          steps: route.legs.flatMap(leg => leg.steps.map(step => ({
            instruction: step.html_instructions,
            distance: step.distance.value,
            duration: step.duration.value,
            startLocation: {
              latitude: step.start_location.lat,
              longitude: step.start_location.lng
            },
            endLocation: {
              latitude: step.end_location.lat,
              longitude: step.end_location.lng
            }
          }))),
          bounds: route.bounds
        };

        res.json({ directions });
      } else {
        res.status(404).json({ message: 'No directions found' });
      }
    } catch (error) {
      console.error('Get directions error:', error);
      res.status(500).json({ message: 'Server error getting directions' });
    }
  }

  // ====================== SERVER-SIDE CLUSTERING METHODS ======================

  // Get clustered markers for map display
  async getClusteredMarkers(req, res) {
    try {
      const { lat, lng, radius = 1000, zoom = 15, reportTypes, gasStationBrands } = req.query;
      
      // Check cache first
      const cacheKey = `clustered_markers_${lat}_${lng}_${radius}_${zoom}_${reportTypes || 'all'}_${gasStationBrands || 'all'}`;
      const cached = cache.get(cacheKey);
      if (cached) {
        console.log('[MapController] Returning cached clustered markers');
        return res.json(cached);
      }

      // Build filters
      const reportFilter = {
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
            $maxDistance: parseInt(radius)
          }
        },
        status: { $ne: 'archived' }
      };

      const gasStationFilter = {
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
            $maxDistance: parseInt(radius)
          }
        }
      };

      // Add type filters if specified
      if (reportTypes && reportTypes !== 'all') {
        const types = reportTypes.split(',');
        reportFilter.type = { $in: types };
      }

      if (gasStationBrands && gasStationBrands !== 'all') {
        const brands = gasStationBrands.split(',');
        gasStationFilter.brand = { $in: brands };
      }

      // Fetch markers in parallel
      const [reports, gasStations] = await Promise.all([
        Report.find(reportFilter).limit(100),
        GasStation.find(gasStationFilter).limit(100)
      ]);

      // Server-side clustering
      const clusters = this.clusterMarkers(reports, gasStations, parseFloat(zoom));

      const result = {
        clusters,
        metadata: {
          totalReports: reports.length,
          totalGasStations: gasStations.length,
          totalClusters: clusters.length,
          center: { lat: parseFloat(lat), lng: parseFloat(lng) },
          radius: parseInt(radius),
          zoom: parseFloat(zoom),
          generatedAt: new Date(),
          cacheExpiry: new Date(Date.now() + 2 * 60 * 1000) // 2 minutes
        }
      };

      // Cache for 2 minutes
      cache.put(cacheKey, result, 2 * 60 * 1000);
      
      console.log(`[MapController] Generated ${clusters.length} clusters for ${reports.length} reports and ${gasStations.length} gas stations`);
      res.json(result);

    } catch (error) {
      console.error('[MapController] Error getting clustered markers:', error);
      res.status(500).json({ 
        message: 'Server error getting clustered markers',
        error: error.message 
      });
    }
  }

  // Get map statistics
  async getMapStatistics(req, res) {
    try {
      const { lat, lng, radius = 1000 } = req.query;

      // Check cache first
      const cacheKey = `map_stats_${lat}_${lng}_${radius}`;
      const cached = cache.get(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      // Build filters
      const reportFilter = {
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
            $maxDistance: parseInt(radius)
          }
        }
      };

      const gasStationFilter = {
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
            $maxDistance: parseInt(radius)
          }
        }
      };

      // Get counts
      const [reportCount, gasStationCount] = await Promise.all([
        Report.countDocuments(reportFilter),
        GasStation.countDocuments(gasStationFilter)
      ]);

      // Get reports by type
      const reportsByType = await Report.aggregate([
        { $match: reportFilter },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]);

      // Get gas stations by brand
      const gasStationsByBrand = await GasStation.aggregate([
        { $match: gasStationFilter },
        { $group: { _id: '$brand', count: { $sum: 1 } } }
      ]);

      const result = {
        center: { lat: parseFloat(lat), lng: parseFloat(lng) },
        radius: parseInt(radius),
        totalReports: reportCount,
        totalGasStations: gasStationCount,
        reportsByType: reportsByType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        gasStationsByBrand: gasStationsByBrand.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        metadata: {
          generatedAt: new Date(),
          cacheExpiry: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
        }
      };

      // Cache for 5 minutes
      cache.put(cacheKey, result, 5 * 60 * 1000);
      
      res.json(result);

    } catch (error) {
      console.error('[MapController] Error getting map statistics:', error);
      res.status(500).json({ 
        message: 'Server error getting map statistics',
        error: error.message 
      });
    }
  }

  // Get nearby gas stations with prices
  async getNearbyGasStations(req, res) {
    try {
      const { lat, lng, radius = 2000, brands } = req.query;

      // Check cache first
      const cacheKey = `nearby_gas_${lat}_${lng}_${radius}_${brands || 'all'}`;
      const cached = cache.get(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      // Build filter
      const filter = {
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
            $maxDistance: parseInt(radius)
          }
        }
      };

      if (brands && brands !== 'all') {
        const brandList = brands.split(',');
        filter.brand = { $in: brandList };
      }

      // Get gas stations with prices
      const gasStations = await GasStation.find(filter)
        .select('name brand location prices services')
        .limit(50)
        .sort({ 'location.coordinates': 1 });

      // Calculate distances and sort by proximity
      const stationsWithDistance = gasStations.map(station => {
        const distance = this.calculateDistance(
          { latitude: parseFloat(lat), longitude: parseFloat(lng) },
          { 
            latitude: station.location.coordinates[1], 
            longitude: station.location.coordinates[0] 
          }
        );

        return {
          ...station.toObject(),
          distance: Math.round(distance),
          pricePerLiter: station.prices?.gasoline || 0
        };
      }).sort((a, b) => a.distance - b.distance);

      const result = {
        stations: stationsWithDistance,
        metadata: {
          center: { lat: parseFloat(lat), lng: parseFloat(lng) },
          radius: parseInt(radius),
          totalStations: stationsWithDistance.length,
          generatedAt: new Date(),
          cacheExpiry: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
        }
      };

      // Cache for 10 minutes
      cache.put(cacheKey, result, 10 * 60 * 1000);
      
      res.json(result);

    } catch (error) {
      console.error('[MapController] Error getting nearby gas stations:', error);
      res.status(500).json({ 
        message: 'Server error getting nearby gas stations',
        error: error.message 
      });
    }
  }

  // ====================== HELPER METHODS ======================

  // Server-side marker clustering algorithm
  clusterMarkers(reports, gasStations, zoom) {
    const clusters = [];
    const processed = new Set();
    const clusterRadius = this.getClusterRadius(zoom);

    // Convert reports to markers
    const reportMarkers = reports.map(report => ({
      id: `report_${report._id}`,
      type: 'report',
      coordinate: {
        latitude: report.location.coordinates[1],
        longitude: report.location.coordinates[0]
      },
      data: report
    }));

    // Convert gas stations to markers
    const gasStationMarkers = gasStations.map(station => ({
      id: `gas_${station._id}`,
      type: 'gasStation',
      coordinate: {
        latitude: station.location.coordinates[1],
        longitude: station.location.coordinates[0]
      },
      data: station
    }));

    const allMarkers = [...reportMarkers, ...gasStationMarkers];

    // Cluster markers
    allMarkers.forEach((marker, index) => {
      if (processed.has(marker.id)) return;

      const cluster = {
        id: `cluster_${index}`,
        coordinate: marker.coordinate,
        count: 1,
        markers: [marker],
        type: marker.type,
        radius: clusterRadius
      };

      // Find nearby markers to cluster
      allMarkers.forEach((otherMarker, otherIndex) => {
        if (otherIndex <= index || processed.has(otherMarker.id)) return;

        const distance = this.calculateDistance(
          marker.coordinate,
          otherMarker.coordinate
        );

        if (distance <= clusterRadius) {
          cluster.markers.push(otherMarker);
          cluster.count++;
          processed.add(otherMarker.id);

          // Update cluster center
          cluster.coordinate = this.calculateClusterCenter(cluster.markers);
          
          // Update cluster type
          if (cluster.markers.some(m => m.type === 'report') && 
              cluster.markers.some(m => m.type === 'gasStation')) {
            cluster.type = 'mixed';
          }
        }
      });

      processed.add(marker.id);
      clusters.push(cluster);
    });

    return clusters;
  }

  // Calculate distance between two coordinates
  calculateDistance(coord1, coord2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (coord1.latitude * Math.PI) / 180;
    const φ2 = (coord2.latitude * Math.PI) / 180;
    const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
    const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  // Calculate cluster center
  calculateClusterCenter(markers) {
    const totalLat = markers.reduce((sum, marker) => sum + marker.coordinate.latitude, 0);
    const totalLng = markers.reduce((sum, marker) => sum + marker.coordinate.longitude, 0);
    
    return {
      latitude: totalLat / markers.length,
      longitude: totalLng / markers.length
    };
  }

  // Get cluster radius based on zoom level
  getClusterRadius(zoom) {
    if (zoom >= 15) return 50;   // 50 meters
    if (zoom >= 12) return 100;  // 100 meters
    if (zoom >= 10) return 200;  // 200 meters
    if (zoom >= 8) return 500;   // 500 meters
    return 1000; // 1 kilometer
  }
}

module.exports = new MapController();