# Gas Station Model Virtual Data Additions

## ✅ **New Virtual Fields Added to GasStation Model**

### **Summary**
Added 3 new virtual fields to the GasStation model to calculate and format data based on coordinates:

1. **`addressFromCoords`** - Formatted coordinate display
2. **`formattedCoordinates`** - Structured coordinate data
3. **`googleMapsLink`** - Direct link to Google Maps

---

## 📋 **Virtual Fields Details**

### **1. `addressFromCoords` Virtual**

**Purpose:** Returns a formatted string with coordinates from the location field

**Usage:**
```javascript
const station = await GasStation.findById(id);
console.log(station.addressFromCoords);
// Output: "Lat: 14.604200, Lng: 121.027500"
```

**Returns:**
- Formatted string with latitude and longitude
- Null if coordinates are not available

---

### **2. `formattedCoordinates` Virtual**

**Purpose:** Returns structured coordinate data with separate fields

**Usage:**
```javascript
const station = await GasStation.findById(id);
console.log(station.formattedCoordinates);
// Output: {
//   latitude: 14.604200,
//   longitude: 121.027500,
//   formatted: "14.604200, 121.027500"
// }
```

**Returns:**
- Object with `latitude`, `longitude`, and `formatted` properties
- Null if coordinates are not available

---

### **3. `googleMapsLink` Virtual**

**Purpose:** Generates a Google Maps link for the gas station location

**Usage:**
```javascript
const station = await GasStation.findById(id);
console.log(station.googleMapsLink);
// Output: "https://www.google.com/maps?q=14.604200,121.027500"
```

**Returns:**
- Google Maps URL
- Null if coordinates are not available

---

### **4. Existing: `fullAddress` Virtual**

**Purpose:** Returns formatted full address from address fields

**Usage:**
```javascript
const station = await GasStation.findById(id);
console.log(station.fullAddress);
// Output: "123 Main St, Quezon City, NCR, 1100, Philippines"
```

**Returns:**
- Concatenated address from address, city, state, postalCode, country fields

---

## 🔧 **Technical Implementation**

### **Location Schema Structure**
```javascript
location: {
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: {
    type: [Number],  // [longitude, latitude] - GeoJSON format
    required: true
  }
}
```

### **Coordinate Extraction**
All virtuals extract coordinates using:
```javascript
const [lng, lat] = this.location.coordinates;
```

**Note:** GeoJSON uses `[longitude, latitude]` order (NOT latitude, longitude)

---

## 📊 **Usage Examples**

### **Example 1: Get Formatted Address from Coordinates**
```javascript
const GasStation = require('./models/GasStation');

const station = await GasStation.findById('507f1f77bcf86cd799439011');

// Display coordinates
console.log(station.addressFromCoords);
// "Lat: 14.604200, Lng: 121.027500"

// Get structured data
console.log(station.formattedCoordinates);
// {
//   latitude: 14.604200,
//   longitude: 121.027500,
//   formatted: "14.604200, 121.027500"
// }

// Get Google Maps link
console.log(station.googleMapsLink);
// "https://www.google.com/maps?q=14.604200,121.027500"
```

### **Example 2: Include Virtuals in API Response**
```javascript
// Virtuals are automatically included when using toJSON()
const station = await GasStation.findById(id);

// Regular JSON
const stationJson = station.toJSON();
console.log(stationJson.addressFromCoords);
console.log(stationJson.formattedCoordinates);
console.log(stationJson.googleMapsLink);
console.log(stationJson.fullAddress);

// API Response
res.json({
  success: true,
  data: {
    station: station.toJSON()  // Includes all virtuals
  }
});
```

### **Example 3: Method to Get Address from Coordinates**
```javascript
const GasStation = require('./models/GasStation');

const station = await GasStation.findById('507f1f77bcf86cd799439011');
const addressInfo = await station.getAddressFromCoordinates();

console.log(addressInfo);
// {
//   success: true,
//   formatted: "14.604200, 121.027500",
//   coordinates: {
//     latitude: 14.604200,
//     longitude: 121.027500
//   },
//   note: 'For actual address, use a reverse geocoding service like Google Maps API'
// }
```

---

## 🎯 **Benefits**

### **1. Convenience**
- Extract and format coordinates without manual parsing
- Get ready-to-use Google Maps links
- Access structured coordinate data

### **2. Consistency**
- All coordinate data uses the same format
- Consistent decimal precision (6 decimals)
- Handles missing coordinates gracefully

### **3. Integration Ready**
- Google Maps link ready for frontend
- Structured data for map components
- Formatted strings for display

---

## 🔗 **Integration with Controllers**

### **Controller Usage Example**
```javascript
// In gasStationController.js
const getGasStation = async (req, res) => {
  try {
    const station = await GasStation.findById(req.params.id);
    
    if (!station) {
      return sendErrorResponse(res, 404, 'Gas station not found');
    }

    // Virtuals are automatically included
    const stationData = station.toJSON();
    
    res.json({
      success: true,
      data: {
        station: stationData,
        // All virtuals are already included:
        // - addressFromCoords
        // - formattedCoordinates
        // - googleMapsLink
        // - fullAddress
      }
    });
  } catch (error) {
    sendErrorResponse(res, 500, 'Failed to get gas station', error);
  }
};
```

---

## 📝 **API Response Example**

```json
{
  "success": true,
  "data": {
    "station": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Shell EDSA",
      "brand": "Shell",
      "location": {
        "type": "Point",
        "coordinates": [121.027500, 14.604200]
      },
      "address": "EDSA, Quezon City",
      "city": "Quezon City",
      "state": "NCR",
      "country": "Philippines",
      "postalCode": "1100",
      "rating": 4.5,
      "isActive": true,
      "addressFromCoords": "Lat: 14.604200, Lng: 121.027500",
      "formattedCoordinates": {
        "latitude": 14.604200,
        "longitude": 121.027500,
        "formatted": "14.604200, 121.027500"
      },
      "googleMapsLink": "https://www.google.com/maps?q=14.604200,121.027500",
      "fullAddress": "EDSA, Quezon City, NCR, 1100, Philippines",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

---

## 🔒 **Error Handling**

All virtuals safely handle missing data:

```javascript
// If location is missing or invalid
const station = await GasStation.create({
  name: "Test Station",
  address: "123 Main St"
  // No location coordinates
});

console.log(station.addressFromCoords);      // null
console.log(station.formattedCoordinates);   // null
console.log(station.googleMapsLink);         // null
console.log(station.fullAddress);            // "123 Main St, , , , Philippines"
```

---

## ✅ **Summary**

### **Added Virtuals:**
1. ✅ **`addressFromCoords`** - Formatted coordinate string
2. ✅ **`formattedCoordinates`** - Structured coordinate object
3. ✅ **`googleMapsLink`** - Google Maps URL
4. ✅ **`fullAddress`** - Full formatted address (existing)

### **Added Method:**
1. ✅ **`getAddressFromCoordinates()`** - Helper method for coordinate data

### **Configuration:**
1. ✅ **Virtuals enabled** in JSON and Object output
2. ✅ **No linter errors**
3. ✅ **Model tests passing**

**All virtuals are now available and ready to use in your gas station controller!** 🚀✨
