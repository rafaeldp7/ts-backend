# Reverse Geocoding Implementation Guide

## **Architecture Decision: Model vs Controller**

### **✅ Current Implementation: Hybrid Approach (Recommended)**

We've implemented reverse geocoding in **both** the model and controller for maximum flexibility:

---

## **1. Model Implementation (Primary)**

**Location:** `models/GasStation.js`

**Method:** `getAddressFromCoordinates()`

```javascript
// Usage in any controller or service
const station = await GasStation.findById(id);
const addressInfo = await station.getAddressFromCoordinates();

if (addressInfo.success) {
  console.log('Address:', addressInfo.formattedAddress);
  // "EDSA, Quezon City, Metro Manila, Philippines"
}
```

**Advantages:**
- ✅ **Reusable** across all controllers
- ✅ **Data-centric** - belongs to the data layer
- ✅ **Consistent** logic everywhere
- ✅ **Easy to test** - pure function
- ✅ **Separation of concerns**

---

## **2. Controller Implementation (API Endpoint)**

**Location:** `admin-backend/backend/controllers/gasStationController.js`

**Method:** `reverseGeocode()`

**Endpoint:** `GET /api/admin-gas-stations/reverse-geocode?lat=14.5995&lng=120.9842`

```javascript
// API Usage
const response = await fetch('/api/admin-gas-stations/reverse-geocode?lat=14.5995&lng=120.9842');
const data = await response.json();

if (data.success) {
  console.log('Address:', data.data.formattedAddress);
}
```

**Advantages:**
- ✅ **HTTP API access** for frontend
- ✅ **Standardized response** format
- ✅ **Error handling** with proper HTTP codes
- ✅ **Public endpoint** (no authentication required)

---

## **3. Route Configuration**

**Location:** `admin-backend/backend/routes/gasStations.js`

```javascript
// Public reverse geocoding endpoint
router.get('/reverse-geocode', reverseGeocode);
```

**Route Order:** Placed before `/:id` to avoid conflicts

---

## **API Reference**

### **Reverse Geocoding Endpoint**

```http
GET /api/admin-gas-stations/reverse-geocode?lat={latitude}&lng={longitude}
```

**Parameters:**
- `lat` (required): Latitude coordinate
- `lng` (required): Longitude coordinate

**Response:**
```json
{
  "success": true,
  "message": "Address retrieved successfully",
  "data": {
    "coordinates": {
      "lat": 14.5995,
      "lng": 120.9842
    },
    "address": {
      "full": "EDSA, Quezon City, Metro Manila, Philippines",
      "street": "EDSA",
      "city": "Quezon City",
      "state": "Metro Manila",
      "country": "Philippines",
      "postalCode": ""
    },
    "formattedAddress": "EDSA, Quezon City, Metro Manila, Philippines",
    "placeId": "ChIJ...",
    "types": ["route"]
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Reverse geocoding failed",
  "error": "API key not configured"
}
```

---

## **Usage Examples**

### **1. Frontend Integration**

```javascript
// React component
const getAddressFromCoords = async (lat, lng) => {
  try {
    const response = await fetch(
      `/api/admin-gas-stations/reverse-geocode?lat=${lat}&lng=${lng}`
    );
    const data = await response.json();
    
    if (data.success) {
      return data.data.formattedAddress;
    } else {
      console.error('Geocoding failed:', data.message);
      return `${lat}, ${lng}`; // Fallback
    }
  } catch (error) {
    console.error('Error:', error);
    return `${lat}, ${lng}`; // Fallback
  }
};
```

### **2. Backend Service Usage**

```javascript
// In any controller
const GasStation = require('../models/GasStation');

const processLocation = async (coordinates) => {
  const tempStation = new GasStation({
    location: {
      type: 'Point',
      coordinates: [coordinates.lng, coordinates.lat]
    }
  });
  
  const addressInfo = await tempStation.getAddressFromCoordinates();
  
  if (addressInfo.success) {
    return {
      address: addressInfo.formattedAddress,
      city: addressInfo.address.city,
      state: addressInfo.address.state
    };
  }
  
  return null;
};
```

### **3. Gas Station Creation with Auto-Address**

```javascript
// Create gas station with coordinates, auto-populate address
const createStationWithCoords = async (stationData) => {
  const station = new GasStation(stationData);
  
  // If only coordinates provided, get address
  if (station.location.coordinates && !station.address) {
    const addressInfo = await station.getAddressFromCoordinates();
    
    if (addressInfo.success) {
      station.address = addressInfo.formattedAddress;
      station.city = addressInfo.address.city;
      station.state = addressInfo.address.state;
      station.country = addressInfo.address.country;
    }
  }
  
  await station.save();
  return station;
};
```

---

## **Configuration Requirements**

### **1. Environment Variables**

Add to `.env` file:
```env
GOOGLE_MAPS_API_KEY=AIzaSyAzFeqvqzZUO9kfLVZZOrlOwP5Fg4LpLf4
```

### **2. Google Cloud Console Setup**

1. Enable **Geocoding API**
2. Restrict API key to specific domains
3. Set usage quotas

---

## **Error Handling**

### **Model Method Errors**
```javascript
const addressInfo = await station.getAddressFromCoordinates();

if (!addressInfo.success) {
  console.log('Error:', addressInfo.message);
  console.log('Fallback:', addressInfo.fallback);
}
```

### **API Endpoint Errors**
```javascript
// HTTP status codes
// 400: Missing lat/lng parameters
// 400: Geocoding failed (API error)
// 500: Server error
```

---

## **Performance Considerations**

### **Caching Strategy**
```javascript
// Consider caching results for same coordinates
const cacheKey = `geocode_${lat}_${lng}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);
```

### **Rate Limiting**
- Google Maps API has usage limits
- Consider implementing rate limiting for the endpoint
- Monitor API usage in Google Cloud Console

---

## **Security Considerations**

1. **API Key Protection**
   - Never expose API key in frontend
   - Use environment variables
   - Restrict API key to specific domains

2. **Input Validation**
   - Validate coordinate ranges
   - Sanitize input parameters
   - Implement rate limiting

3. **Error Information**
   - Don't expose sensitive error details
   - Log errors server-side only

---

## **Testing**

### **Unit Tests**
```javascript
describe('GasStation Reverse Geocoding', () => {
  it('should get address from coordinates', async () => {
    const station = new GasStation({
      location: {
        type: 'Point',
        coordinates: [120.9842, 14.5995]
      }
    });
    
    const result = await station.getAddressFromCoordinates();
    expect(result.success).toBe(true);
    expect(result.formattedAddress).toContain('Quezon City');
  });
});
```

### **API Tests**
```javascript
describe('Reverse Geocoding API', () => {
  it('should return address for valid coordinates', async () => {
    const response = await request(app)
      .get('/api/admin-gas-stations/reverse-geocode')
      .query({ lat: 14.5995, lng: 120.9842 });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

---

## **Summary**

✅ **Model Implementation**: Core logic, reusable, testable
✅ **Controller Implementation**: HTTP API access, standardized responses
✅ **Route Configuration**: Public endpoint for frontend access
✅ **Error Handling**: Comprehensive error management
✅ **Documentation**: Complete usage examples

**Best of both worlds**: Model for backend logic, Controller for API access! 🚀
