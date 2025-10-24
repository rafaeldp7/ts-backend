const axios = require('axios');

// Google Maps API configuration
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const GOOGLE_MAPS_BASE_URL = 'https://maps.googleapis.com/maps/api';

// Geocode address to coordinates
const geocodeAddress = async (address) => {
  try {
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error('Google Maps API key not configured');
    }

    const response = await axios.get(`${GOOGLE_MAPS_BASE_URL}/geocode/json`, {
      params: {
        address: address,
        key: GOOGLE_MAPS_API_KEY
      }
    });

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const result = response.data.results[0];
      const location = result.geometry.location;
      const addressComponents = result.address_components;
      
      return {
        success: true,
        coordinates: {
          lat: location.lat,
          lng: location.lng
        },
        formattedAddress: result.formatted_address,
        addressComponents: parseAddressComponents(addressComponents),
        placeId: result.place_id
      };
    } else {
      return {
        success: false,
        error: response.data.error_message || 'Geocoding failed'
      };
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Reverse geocode coordinates to address
const reverseGeocode = async (lat, lng) => {
  try {
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error('Google Maps API key not configured');
    }

    const response = await axios.get(`${GOOGLE_MAPS_BASE_URL}/geocode/json`, {
      params: {
        latlng: `${lat},${lng}`,
        key: GOOGLE_MAPS_API_KEY
      }
    });

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const result = response.data.results[0];
      const addressComponents = result.address_components;
      
      return {
        success: true,
        formattedAddress: result.formatted_address,
        addressComponents: parseAddressComponents(addressComponents),
        placeId: result.place_id
      };
    } else {
      return {
        success: false,
        error: response.data.error_message || 'Reverse geocoding failed'
      };
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get place details
const getPlaceDetails = async (placeId) => {
  try {
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error('Google Maps API key not configured');
    }

    const response = await axios.get(`${GOOGLE_MAPS_BASE_URL}/place/details/json`, {
      params: {
        place_id: placeId,
        fields: 'name,formatted_address,geometry,formatted_phone_number,website,opening_hours,rating,reviews',
        key: GOOGLE_MAPS_API_KEY
      }
    });

    if (response.data.status === 'OK') {
      const result = response.data.result;
      return {
        success: true,
        place: {
          name: result.name,
          formattedAddress: result.formatted_address,
          coordinates: {
            lat: result.geometry.location.lat,
            lng: result.geometry.location.lng
          },
          phone: result.formatted_phone_number,
          website: result.website,
          openingHours: result.opening_hours,
          rating: result.rating,
          reviews: result.reviews
        }
      };
    } else {
      return {
        success: false,
        error: response.data.error_message || 'Place details not found'
      };
    }
  } catch (error) {
    console.error('Get place details error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Search places
const searchPlaces = async (query, location = null, radius = 5000, type = null) => {
  try {
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error('Google Maps API key not configured');
    }

    const params = {
      query: query,
      key: GOOGLE_MAPS_API_KEY
    };

    if (location) {
      params.location = `${location.lat},${location.lng}`;
      params.radius = radius;
    }

    if (type) {
      params.type = type;
    }

    const response = await axios.get(`${GOOGLE_MAPS_BASE_URL}/place/textsearch/json`, {
      params: params
    });

    if (response.data.status === 'OK') {
      const places = response.data.results.map(place => ({
        placeId: place.place_id,
        name: place.name,
        formattedAddress: place.formatted_address,
        coordinates: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng
        },
        rating: place.rating,
        priceLevel: place.price_level,
        types: place.types
      }));

      return {
        success: true,
        places: places
      };
    } else {
      return {
        success: false,
        error: response.data.error_message || 'Place search failed'
      };
    }
  } catch (error) {
    console.error('Search places error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get nearby places
const getNearbyPlaces = async (lat, lng, radius = 5000, type = null) => {
  try {
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error('Google Maps API key not configured');
    }

    const params = {
      location: `${lat},${lng}`,
      radius: radius,
      key: GOOGLE_MAPS_API_KEY
    };

    if (type) {
      params.type = type;
    }

    const response = await axios.get(`${GOOGLE_MAPS_BASE_URL}/place/nearbysearch/json`, {
      params: params
    });

    if (response.data.status === 'OK') {
      const places = response.data.results.map(place => ({
        placeId: place.place_id,
        name: place.name,
        formattedAddress: place.vicinity,
        coordinates: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng
        },
        rating: place.rating,
        priceLevel: place.price_level,
        types: place.types,
        photos: place.photos
      }));

      return {
        success: true,
        places: places
      };
    } else {
      return {
        success: false,
        error: response.data.error_message || 'Nearby places search failed'
      };
    }
  } catch (error) {
    console.error('Get nearby places error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get directions
const getDirections = async (origin, destination, mode = 'driving') => {
  try {
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error('Google Maps API key not configured');
    }

    const response = await axios.get(`${GOOGLE_MAPS_BASE_URL}/directions/json`, {
      params: {
        origin: origin,
        destination: destination,
        mode: mode,
        key: GOOGLE_MAPS_API_KEY
      }
    });

    if (response.data.status === 'OK' && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      const leg = route.legs[0];
      
      return {
        success: true,
        directions: {
          distance: leg.distance,
          duration: leg.duration,
          startAddress: leg.start_address,
          endAddress: leg.end_address,
          steps: leg.steps.map(step => ({
            instruction: step.html_instructions,
            distance: step.distance,
            duration: step.duration,
            startLocation: step.start_location,
            endLocation: step.end_location
          }))
        }
      };
    } else {
      return {
        success: false,
        error: response.data.error_message || 'Directions not found'
      };
    }
  } catch (error) {
    console.error('Get directions error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Parse address components
const parseAddressComponents = (addressComponents) => {
  const components = {};
  
  addressComponents.forEach(component => {
    const types = component.types;
    if (types.includes('street_number')) {
      components.streetNumber = component.long_name;
    } else if (types.includes('route')) {
      components.streetName = component.long_name;
    } else if (types.includes('locality')) {
      components.city = component.long_name;
    } else if (types.includes('administrative_area_level_2')) {
      components.province = component.long_name;
    } else if (types.includes('administrative_area_level_1')) {
      components.region = component.long_name;
    } else if (types.includes('country')) {
      components.country = component.long_name;
    } else if (types.includes('postal_code')) {
      components.postalCode = component.long_name;
    }
  });
  
  return components;
};

// Calculate distance between two points
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Calculate bearing between two points
const calculateBearing = (lat1, lng1, lat2, lng2) => {
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const lat1Rad = lat1 * Math.PI / 180;
  const lat2Rad = lat2 * Math.PI / 180;
  const y = Math.sin(dLng) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
};

// Validate coordinates
const isValidCoordinates = (lat, lng) => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

// Format coordinates
const formatCoordinates = (lat, lng, precision = 6) => {
  return {
    lat: parseFloat(lat.toFixed(precision)),
    lng: parseFloat(lng.toFixed(precision))
  };
};

module.exports = {
  geocodeAddress,
  reverseGeocode,
  getPlaceDetails,
  searchPlaces,
  getNearbyPlaces,
  getDirections,
  parseAddressComponents,
  calculateDistance,
  calculateBearing,
  isValidCoordinates,
  formatCoordinates
};
