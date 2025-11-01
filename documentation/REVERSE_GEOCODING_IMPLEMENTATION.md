# Reverse Geocoding Implementation for Gas Station Model

## ✅ **Real Reverse Geocoding Added!**

### **Summary**
The GasStation model now includes a method that performs actual reverse geocoding using the Google Maps Geocoding API to convert coordinates into real addresses.

---

## 🔧 **Implementation Details**

### **Method: `getAddressFromCoordinates()`**

**Purpose:** Converts GPS coordinates (latitude, longitude) into a formatted address using Google Maps API

**Usage:**
```javascript
const GasStation = require('./models/GasStation');
const station = await GasStation.findById(id);

// Get actual address from coordinates
const addressInfo = await station.getAddressFromCoordinates();

if (addressInfo.success) {
  console.log(addressInfo.formattedAddress);
  // Output: "EDSA, Quezon City, Metro Manila, Philippines"
  
  console.log(addressInfo.address);
  // Output: {
  //   full: "EDSA, Quezon City, Metro Manila, Philippines",
  //   street: "EDSA",
  //   city: "Quezon City",
  //   state: "Metro Manila",
  //   country: "Philippines",
  //   postalCode: "1100"
  // }
}
```

---

## 📋 **Return Format**

### **Success Response:**
```json
{
  "success": true,
  "formattedAddress": "EDSA, Quezon City, Metro Manila, Philippines",
  "address": {
    "full": "EDSA, Quezon City, Metro Manila, Philippines",
    "street": "EDSA",
    "city": "Quezon City",
    "state": "Metro Manila",
    "country": "Philippines",
    "postalCode": "1100"
  },
  "coordinates": {
    "latitude": 14.604200,
    "longitude": 121.027500
  },
  "placeId": "ChIJ3y...",
  "types": ["route"]
}
```

### **Failure Response (No API Key):**
```json
{
  "success": false,
  "message": "Google Maps API key not configured",
  "fallback": {
    "formatted": "14.604200, 121.027500",
    "coordinates": {
      "latitude": 14.604200,
      "longitude": 121.027500
    }
  }
}
```

### **Failure Response (API Error):**
```json
{
  "success": false,
  "message": "Geocoding failed",
  "error": "API request failed",
  "fallback": {
    "formatted": "14.604200, 121.027500",
    "coordinates": {
      "latitude": 14.604200,
      "longitude": 121.027500
    }
  }
}
```

---

## ⚙️ **Setup Required**

### **1. Install axios (if not installed):**
```bash
npm install axios
```

### **2. Add Google Maps API Key to .env:**
```env
GOOGLE_MAPS_API_KEY=your_api_key_here
```

### **3. Enable Google Maps Geocoding API:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Enable "Geocoding API"
4. Generate an API key
5. Add it to your `.env` file

---

## 🎯 **Usage Examples**

### **Example 1: Get Address from Coordinates**
```javascript
const GasStation = require('./models/GasStation');

// Create or find a gas station with coordinates
const station = await GasStation.findById('507f1f77bcf86cd799439011');

// Get reverse geocoded address
const addressInfo = await station.getAddressFromCoordinates();

if (addressInfo.success) {
  console.log('Address:', addressInfo.formattedAddress);
  console.log('City:', addressInfo.address.city);
  console.log('Country:', addressInfo.address.country);
} else {
  console.log('Geocoding failed:', addressInfo.message);
}
```

### **Example 2: Update Station with Reverse Geocoded Address**
```javascript
const GasStation = require('./models/GasStation');

const station = await GasStation.findById(id);
const addressInfo = await station.getAddressFromCoordinates();

if (addressInfo.success) {
  // Update station address fields with geocoded data
  station.address = addressInfo.address.street || '';
  station.city = addressInfo.address.city || '';
  station.state = addressInfo.address.state || '';
  station.country = addressInfo.address.country || '';
  station.postalCode = addressInfo.address.postalCode || '';
  
  await station.save();
}
```

### **Example 3: Use in Controller**
```javascript
// In gasStationController.js
const createGasStation = async (req, res) => {
  try {
    const station = new GasStation(req.body);
    
    // If only coordinates provided, get address from reverse geocoding
    if (station.location?.coordinates && !station.address) {
      const addressInfo = await station.getAddressFromCoordinates();
      
      if (addressInfo.success) {
        station.address = addressInfo.address.street || addressInfo.formattedAddress;
        station.city = addressInfo.address.city || '';
        station.state = addressInfo.address.state || '';
        station.country = addressInfo.address.country || '';
        station.postalCode = addressInfo.address.postalCode || '';
      }
    }
    
    await station.save();
    
    res.status(201).json({
      success: true,
      message: 'Gas station created successfully',
      data: { station }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create gas station',
      error: error.message
    });
  }
};
```

---

## 🔍 **What Gets Reverse Geocoded**

### **Input:**
- GPS coordinates (latitude, longitude)
- Example: `[121.027500, 14.604200]` (GeoJSON format: [lng, lat])

### **Output:**
- **Formatted Address:** Full formatted address string
- **Address Components:**
  - Street/Route name
  - City/Locality
  - State/Province
  - Country
  - Postal Code
- **Additional Data:**
  - Place ID (Google Maps identifier)
  - Address types

---

## ⚠️ **Error Handling**

### **1. No Coordinates**
```javascript
if (!this.location || !this.location.coordinates) {
  return { success: false, message: 'No coordinates available' };
}
```

### **2. No API Key**
```javascript
if (!apiKey) {
  return {
    success: false,
    message: 'Google Maps API key not configured',
    fallback: { /* coordinates only */ }
  };
}
```

### **3. API Error**
```javascript
catch (error) {
  console.error('Reverse geocoding error:', error.message);
  return {
    success: false,
    message: 'Reverse geocoding failed',
    error: error.message,
    fallback: { /* coordinates only */ }
  };
}
```

---

## 💡 **Benefits**

### **1. Automatic Address Lookup**
- Convert GPS coordinates to addresses automatically
- No manual address entry needed
- Accurate location data

### **2. Data Consistency**
- Standardized address format
- Separated address components
- Validated postal codes and city names

### **3. User Experience**
- Users can create stations by pinning on map
- Address fills automatically from coordinates
- No typing required

### **4. Data Quality**
- Verified addresses from Google
- Correct city, state, country names
- Proper postal codes

---

## 📊 **Integration with Gas Station Controller**

### **Automatic Address Population:**
```javascript
// When creating a gas station with coordinates only
const station = await GasStation.create({
  name: "New Station",
  brand: "Shell",
  location: {
    type: "Point",
    coordinates: [121.027500, 14.604200] // [lng, lat]
  }
  // No address field
});

// Get address from coordinates
const addressInfo = await station.getAddressFromCoordinates();
if (addressInfo.success) {
  station.address = addressInfo.formattedAddress;
  station.city = addressInfo.address.city;
  station.state = addressInfo.address.state;
  station.country = addressInfo.address.country;
  station.postalCode = addressInfo.address.postalCode;
  await station.save();
}
```

---

## ✅ **Summary**

### **Features:**
- ✅ Real reverse geocoding with Google Maps API
- ✅ Extracts street, city, state, country, postal code
- ✅ Returns formatted full address
- ✅ Comprehensive error handling
- ✅ Fallback to coordinates if geocoding fails
- ✅ Place ID and address types included

### **Requirements:**
- ✅ `axios` package (already installed)
- ✅ Google Maps API Key (add to `.env`)
- ✅ Enable Geocoding API in Google Cloud Console

### **Usage:**
```javascript
const addressInfo = await station.getAddressFromCoordinates();
```

**The GasStation model now has real reverse geocoding capability!** 🚀✨
