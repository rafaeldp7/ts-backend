const axios = require('axios');

class MapController {
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

  // Optimize route with waypoints
  async optimizeRoute(req, res) {
    try {
      const { origin, destination, waypoints } = req.body;

      if (!origin || !destination || !waypoints || waypoints.length === 0) {
        return res.status(400).json({ message: 'Origin, destination, and waypoints are required' });
      }

      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ message: 'Google Maps API key not configured' });
      }

      // Use Google Maps Directions API with optimize:true
      const params = {
        origin: typeof origin === 'string' ? origin : `${origin.latitude},${origin.longitude}`,
        destination: typeof destination === 'string' ? destination : `${destination.latitude},${destination.longitude}`,
        waypoints: waypoints.map(wp => 
          typeof wp === 'string' ? wp : `${wp.latitude},${wp.longitude}`
        ).join('|'),
        optimize: true,
        key: apiKey
      };

      const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
        params
      });

      if (response.data.status === 'OK' && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        const optimizedRoute = {
          id: route.overview_polyline.points,
          summary: route.summary,
          distance: route.legs.reduce((sum, leg) => sum + leg.distance.value, 0),
          duration: route.legs.reduce((sum, leg) => sum + leg.duration.value, 0),
          polyline: route.overview_polyline.points,
          steps: route.legs.flatMap(leg => leg.steps),
          bounds: route.bounds,
          waypointOrder: response.data.routes[0].waypoint_order
        };

        res.json({ route: optimizedRoute });
      } else {
        res.status(404).json({ message: 'No optimized route found' });
      }
    } catch (error) {
      console.error('Optimize route error:', error);
      res.status(500).json({ message: 'Server error optimizing route' });
    }
  }

  // Get nearby places
  async getNearbyPlaces(req, res) {
    try {
      const { latitude, longitude, radius = 1000, type } = req.query;

      if (!latitude || !longitude) {
        return res.status(400).json({ message: 'Latitude and longitude are required' });
      }

      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ message: 'Google Maps API key not configured' });
      }

      const params = {
        location: `${latitude},${longitude}`,
        radius: radius,
        key: apiKey
      };

      if (type) {
        params.type = type;
      }

      const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
        params
      });

      if (response.data.status === 'OK') {
        const places = response.data.results.map(place => ({
          id: place.place_id,
          name: place.name,
          address: place.vicinity,
          coordinates: {
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng
          },
          rating: place.rating,
          types: place.types
        }));

        res.json({ places });
      } else {
        res.status(404).json({ message: 'No places found' });
      }
    } catch (error) {
      console.error('Get nearby places error:', error);
      res.status(500).json({ message: 'Server error getting nearby places' });
    }
  }

  // Snap coordinates to roads
  async snapToRoads(req, res) {
    try {
      const { coordinates } = req.body;

      if (!coordinates || coordinates.length === 0) {
        return res.status(400).json({ message: 'Coordinates are required' });
      }

      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ message: 'Google Maps API key not configured' });
      }

      const path = coordinates.map(coord => `${coord.latitude},${coord.longitude}`).join('|');

      const response = await axios.get('https://roads.googleapis.com/v1/snapToRoads', {
        params: {
          path,
          interpolate: true,
          key: apiKey
        }
      });

      if (response.data.snappedPoints) {
        const snappedCoordinates = response.data.snappedPoints.map(point => ({
          latitude: point.location.latitude,
          longitude: point.location.longitude
        }));

        res.json({ coordinates: snappedCoordinates });
      } else {
        res.status(404).json({ message: 'No snapped coordinates found' });
      }
    } catch (error) {
      console.error('Snap to roads error:', error);
      res.status(500).json({ message: 'Server error snapping to roads' });
    }
  }

  // Get traffic data
  async getTrafficData(req, res) {
    try {
      const { latitude, longitude, radius = 1000 } = req.query;

      if (!latitude || !longitude) {
        return res.status(400).json({ message: 'Latitude and longitude are required' });
      }

      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ message: 'Google Maps API key not configured' });
      }

      // This would typically use Google Maps Traffic Layer or Roads API
      // For now, return mock data
      res.json({
        trafficLevel: 'moderate',
        congestion: 0.3,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Get traffic data error:', error);
      res.status(500).json({ message: 'Server error getting traffic data' });
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
}

module.exports = new MapController();
