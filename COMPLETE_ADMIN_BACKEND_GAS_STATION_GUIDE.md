# Complete Admin-Backend Gas Station Management Guide

## 📋 **Overview**
This comprehensive guide covers everything you need to know about managing gas stations in the admin-backend system, including API endpoints, data models, authentication, logging, and best practices.

---

## 🏗️ **System Architecture**

### **File Structure:**
```
admin-backend/
├── backend/
│   ├── controllers/
│   │   └── gasStationController.js    # Main controller logic
│   ├── routes/
│   │   └── gasStations.js             # Route definitions
│   └── middleware/
│       ├── adminAuth.js               # Admin authentication
│       └── validation.js              # Response standardization
├── models/
│   └── GasStation.js                  # Database schema
└── index.js                          # Route mounting
```

### **Key Components:**
- **Controller:** Business logic and API handlers
- **Routes:** HTTP endpoint definitions
- **Model:** Database schema and methods
- **Middleware:** Authentication and validation
- **Logging:** Admin action tracking

---

## 🔌 **API Endpoints Reference**

### **Base URL:** `/api/admin-gas-stations`

### **Public Endpoints (No Authentication Required):**
```javascript
GET    /api/admin-gas-stations                    // Get all gas stations with filtering
GET    /api/admin-gas-stations/nearby             // Get nearby gas stations
GET    /api/admin-gas-stations/brand/:brand        // Get stations by brand
GET    /api/admin-gas-stations/city/:city          // Get stations by city
GET    /api/admin-gas-stations/stats               // Get gas station statistics
GET    /api/admin-gas-stations/:id                 // Get single gas station
GET    /api/admin-gas-stations/:id/price-trends    // Get fuel price trends
```

### **Protected Endpoints (User Authentication Required):**
```javascript
POST   /api/admin-gas-stations/:id/reviews         // Add review to gas station
```

### **Admin Endpoints (Admin Authentication Required):**
```javascript
POST   /api/admin-gas-stations                     // Create new gas station
PUT    /api/admin-gas-stations/:id                  // Update gas station
DELETE /api/admin-gas-stations/:id                  // Delete gas station
PUT    /api/admin-gas-stations/:id/fuel-prices      // Update fuel prices
PUT    /api/admin-gas-stations/:id/verify           // Verify gas station
PUT    /api/admin-gas-stations/:id/archive          // Archive gas station
```

---

## 📊 **Data Model Reference**

### **GasStation Schema:**
```javascript
{
  // Basic Information
  name: String,                    // Station name (required)
  brand: String,                   // Brand (e.g., "Shell", "Petron")
  
  // Location Information
  location: {
    type: "Point",                 // GeoJSON type
    coordinates: [Number, Number]   // [longitude, latitude]
  },
  address: String,                 // Full address (required)
  city: String,                    // City name
  state: String,                   // State/Province
  country: String,                  // Country (default: "Philippines")
  postalCode: String,              // Postal/ZIP code
  
  // Contact Information
  phone: String,                   // Phone number
  email: String,                   // Email address
  website: String,                 // Website URL
  
  // Services & Amenities
  services: {
    gasoline: Boolean,             // Gasoline available
    diesel: Boolean,               // Diesel available
    premium: Boolean,              // Premium fuel available
    carWash: Boolean,              // Car wash service
    convenienceStore: Boolean,     // Convenience store
    atm: Boolean,                  // ATM available
    restaurant: Boolean,           // Restaurant/food
    parking: Boolean,              // Parking available
    airPump: Boolean,              // Air pump for tires
    restroom: Boolean              // Restroom available
  },
  
  // Fuel Prices
  fuelPrices: {
    gasoline: Number,              // Gasoline price per liter
    diesel: Number,                // Diesel price per liter
    premium: Number,               // Premium fuel price per liter
    lastUpdated: Date              // Last price update
  },
  
  // Operating Hours
  operatingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String },
    is24Hours: Boolean             // 24/7 operation
  },
  
  // Status & Verification
  status: {
    type: String,
    enum: ['pending', 'active', 'inactive', 'archived'],
    default: 'pending'
  },
  isVerified: Boolean,             // Admin verification status
  verifiedBy: ObjectId,            // Admin who verified
  verifiedAt: Date,                // Verification timestamp
  
  // Archiving
  isArchived: Boolean,             // Archive status
  archivedBy: ObjectId,            // Admin who archived
  archivedAt: Date,                // Archive timestamp
  
  // Reviews & Ratings
  reviews: [{
    user: ObjectId,                // User who wrote review
    rating: Number,                // Rating (1-5)
    comment: String,               // Review comment
    categories: [String],          // Review categories
    createdAt: Date                // Review timestamp
  }],
  
  // Statistics
  stats: {
    averageRating: Number,         // Average rating
    totalReviews: Number,          // Total review count
    totalVisits: Number,          // Total visits
    lastVisit: Date               // Last visit timestamp
  },
  
  // Timestamps
  createdAt: Date,                // Creation timestamp
  updatedAt: Date                 // Last update timestamp
}
```

---

## 🔐 **Authentication & Authorization**

### **Authentication Levels:**

#### **1. Public Access:**
- View gas stations
- Search and filter stations
- Get statistics
- View fuel price trends

#### **2. User Authentication (JWT Token):**
- Add reviews to gas stations
- Rate gas stations

#### **3. Admin Authentication (Admin JWT Token):**
- Create new gas stations
- Update gas station information
- Delete gas stations
- Update fuel prices
- Verify gas stations
- Archive gas stations

### **Authentication Headers:**
```javascript
// For user authentication
headers: {
  'Authorization': `Bearer ${userToken}`,
  'Content-Type': 'application/json'
}

// For admin authentication
headers: {
  'Authorization': `Bearer ${adminToken}`,
  'Content-Type': 'application/json'
}
```

---

## 📝 **API Usage Examples**

### **1. Get All Gas Stations with Filtering:**
```javascript
// Basic request
GET /api/admin-gas-stations

// With filtering
GET /api/admin-gas-stations?page=1&limit=10&brand=Shell&city=Manila&search=station

// Response
{
  "success": true,
  "data": {
    "stations": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Shell Station Makati",
        "brand": "Shell",
        "location": {
          "type": "Point",
          "coordinates": [121.0174, 14.5547]
        },
        "address": "123 Makati Avenue, Makati City",
        "city": "Makati",
        "fuelPrices": {
          "gasoline": 45.50,
          "diesel": 42.30,
          "premium": 48.75
        },
        "status": "active",
        "isVerified": true,
        "stats": {
          "averageRating": 4.2,
          "totalReviews": 156
        }
      }
    ],
    "pagination": {
      "current": 1,
      "pages": 5,
      "total": 50
    }
  }
}
```

### **2. Create New Gas Station (Admin Only):**
```javascript
POST /api/admin-gas-stations
Authorization: Bearer ${adminToken}
Content-Type: application/json

{
  "name": "Petron Station Quezon City",
  "brand": "Petron",
  "location": {
    "type": "Point",
    "coordinates": [121.0568, 14.6760]
  },
  "address": "456 Quezon Avenue, Quezon City",
  "city": "Quezon City",
  "phone": "+63-2-1234-5678",
  "services": {
    "gasoline": true,
    "diesel": true,
    "premium": true,
    "carWash": true,
    "convenienceStore": true
  },
  "fuelPrices": {
    "gasoline": 44.50,
    "diesel": 41.30,
    "premium": 47.75
  },
  "operatingHours": {
    "monday": { "open": "06:00", "close": "22:00" },
    "tuesday": { "open": "06:00", "close": "22:00" },
    "wednesday": { "open": "06:00", "close": "22:00" },
    "thursday": { "open": "06:00", "close": "22:00" },
    "friday": { "open": "06:00", "close": "22:00" },
    "saturday": { "open": "06:00", "close": "22:00" },
    "sunday": { "open": "06:00", "close": "22:00" },
    "is24Hours": false
  }
}

// Response
{
  "success": true,
  "message": "Gas station created successfully",
  "data": {
    "station": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Petron Station Quezon City",
      "brand": "Petron",
      "status": "pending",
      "isVerified": false,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### **3. Update Gas Station (Admin Only):**
```javascript
PUT /api/admin-gas-stations/507f1f77bcf86cd799439012
Authorization: Bearer ${adminToken}
Content-Type: application/json

{
  "name": "Petron Station Quezon City - Updated",
  "phone": "+63-2-1234-5679",
  "fuelPrices": {
    "gasoline": 45.00,
    "diesel": 42.00,
    "premium": 48.00
  }
}

// Response
{
  "success": true,
  "message": "Gas station updated successfully",
  "data": {
    "station": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Petron Station Quezon City - Updated",
      "phone": "+63-2-1234-5679",
      "fuelPrices": {
        "gasoline": 45.00,
        "diesel": 42.00,
        "premium": 48.00
      },
      "updatedAt": "2024-01-15T11:00:00.000Z"
    }
  }
}
```

### **4. Update Fuel Prices (Admin Only):**
```javascript
PUT /api/admin-gas-stations/507f1f77bcf86cd799439012/fuel-prices
Authorization: Bearer ${adminToken}
Content-Type: application/json

{
  "prices": {
    "gasoline": 46.50,
    "diesel": 43.30,
    "premium": 49.75
  }
}

// Response
{
  "success": true,
  "message": "Fuel prices updated successfully",
  "data": {
    "station": {
      "_id": "507f1f77bcf86cd799439012",
      "fuelPrices": {
        "gasoline": 46.50,
        "diesel": 43.30,
        "premium": 49.75,
        "lastUpdated": "2024-01-15T12:00:00.000Z"
      }
    }
  }
}
```

### **5. Verify Gas Station (Admin Only):**
```javascript
PUT /api/admin-gas-stations/507f1f77bcf86cd799439012/verify
Authorization: Bearer ${adminToken}

// Response
{
  "success": true,
  "message": "Gas station verified successfully",
  "data": {
    "station": {
      "_id": "507f1f77bcf86cd799439012",
      "status": "active",
      "isVerified": true,
      "verifiedBy": "507f1f77bcf86cd799439013",
      "verifiedAt": "2024-01-15T12:30:00.000Z"
    }
  }
}
```

### **6. Get Nearby Gas Stations:**
```javascript
GET /api/admin-gas-stations/nearby?lat=14.5547&lng=121.0174&radius=5000&limit=10

// Response
{
  "success": true,
  "data": {
    "stations": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Shell Station Makati",
        "brand": "Shell",
        "location": {
          "type": "Point",
          "coordinates": [121.0174, 14.5547]
        },
        "address": "123 Makati Avenue, Makati City",
        "distance": 0.5,  // Distance in kilometers
        "fuelPrices": {
          "gasoline": 45.50,
          "diesel": 42.30,
          "premium": 48.75
        }
      }
    ]
  }
}
```

### **7. Add Review (User Authentication Required):**
```javascript
POST /api/admin-gas-stations/507f1f77bcf86cd799439012/reviews
Authorization: Bearer ${userToken}
Content-Type: application/json

{
  "rating": 4,
  "comment": "Great service and clean facilities!",
  "categories": ["service", "cleanliness", "fuel_quality"]
}

// Response
{
  "success": true,
  "message": "Review added successfully",
  "data": {
    "station": {
      "_id": "507f1f77bcf86cd799439012",
      "reviews": [
        {
          "_id": "507f1f77bcf86cd799439014",
          "user": "507f1f77bcf86cd799439015",
          "rating": 4,
          "comment": "Great service and clean facilities!",
          "categories": ["service", "cleanliness", "fuel_quality"],
          "createdAt": "2024-01-15T13:00:00.000Z"
        }
      ],
      "stats": {
        "averageRating": 4.1,
        "totalReviews": 157
      }
    }
  }
}
```

---

## 🔍 **Query Parameters & Filtering**

### **Available Query Parameters:**

#### **Pagination:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

#### **Filtering:**
- `brand` - Filter by brand (e.g., "Shell", "Petron")
- `city` - Filter by city
- `state` - Filter by state/province
- `status` - Filter by status (pending, active, inactive, archived)
- `isVerified` - Filter by verification status (true/false)
- `search` - Search in name and address

#### **Services Filtering:**
- `services` - Comma-separated services (e.g., "gasoline,diesel,carWash")

#### **Location Filtering:**
- `lat` - Latitude for nearby search
- `lng` - Longitude for nearby search
- `radius` - Search radius in meters (default: 5000)

#### **Price Filtering:**
- `minPrice` - Minimum fuel price
- `maxPrice` - Maximum fuel price
- `fuelType` - Fuel type (gasoline, diesel, premium)

### **Example Filtering Queries:**
```javascript
// Get Shell stations in Manila
GET /api/admin-gas-stations?brand=Shell&city=Manila

// Get verified stations with car wash service
GET /api/admin-gas-stations?isVerified=true&services=carWash

// Search for stations with "Makati" in name or address
GET /api/admin-gas-stations?search=Makati

// Get stations with gasoline price between 40-50
GET /api/admin-gas-stations?fuelType=gasoline&minPrice=40&maxPrice=50

// Get nearby stations within 2km
GET /api/admin-gas-stations/nearby?lat=14.5547&lng=121.0174&radius=2000
```

---

## 📊 **Statistics & Analytics**

### **Get Gas Station Statistics:**
```javascript
GET /api/admin-gas-stations/stats

// Response
{
  "success": true,
  "data": {
    "stats": {
      "totalStations": 1250,
      "activeStations": 1100,
      "verifiedStations": 950,
      "pendingStations": 150,
      "archivedStations": 50,
      "avgRating": 4.2,
      "totalReviews": 15600,
      "stationsByBrand": {
        "Shell": 450,
        "Petron": 380,
        "Caltex": 320,
        "Total": 100
      },
      "stationsByCity": {
        "Manila": 200,
        "Quezon City": 180,
        "Makati": 150,
        "Taguig": 120
      },
      "priceRanges": {
        "gasoline": {
          "min": 42.50,
          "max": 48.75,
          "avg": 45.20
        },
        "diesel": {
          "min": 39.30,
          "max": 45.50,
          "avg": 42.10
        }
      }
    }
  }
}
```

### **Get Fuel Price Trends:**
```javascript
GET /api/admin-gas-stations/507f1f77bcf86cd799439012/price-trends?fuelType=gasoline&days=30

// Response
{
  "success": true,
  "data": {
    "trends": {
      "stationId": "507f1f77bcf86cd799439012",
      "fuelType": "gasoline",
      "days": 30,
      "prices": [
        { "date": "2024-01-01", "price": 45.50 },
        { "date": "2024-01-02", "price": 45.75 },
        { "date": "2024-01-03", "price": 46.00 },
        { "date": "2024-01-04", "price": 45.80 }
      ],
      "trend": "increasing",
      "changePercent": 0.66
    }
  }
}
```

---

## 🔒 **Admin Action Logging**

### **Logged Admin Actions:**
All admin operations are automatically logged with detailed context:

#### **1. Gas Station Creation:**
```json
{
  "adminId": "507f1f77bcf86cd799439013",
  "adminName": "John Admin",
  "adminEmail": "admin@trafficslight.com",
  "action": "CREATE",
  "resource": "GAS_STATION",
  "description": "Created new gas station: Shell Station Makati (Shell)",
  "details": {
    "stationId": "507f1f77bcf86cd799439011",
    "stationName": "Shell Station Makati",
    "stationBrand": "Shell",
    "stationLocation": "123 Makati Avenue, Makati City",
    "stationCity": "Makati"
  },
  "ipAddress": "192.168.1.100",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### **2. Gas Station Update:**
```json
{
  "adminId": "507f1f77bcf86cd799439013",
  "adminName": "John Admin",
  "adminEmail": "admin@trafficslight.com",
  "action": "UPDATE",
  "resource": "GAS_STATION",
  "description": "Updated gas station: Shell Station Makati (Shell)",
  "details": {
    "stationId": "507f1f77bcf86cd799439011",
    "stationName": "Shell Station Makati",
    "stationBrand": "Shell",
    "changes": {
      "before": {
        "name": "Shell Station Makati",
        "phone": "+63-2-1234-5678"
      },
      "after": {
        "name": "Shell Station Makati - Updated",
        "phone": "+63-2-1234-5679"
      }
    }
  },
  "ipAddress": "192.168.1.100",
  "timestamp": "2024-01-15T11:00:00.000Z"
}
```

#### **3. Fuel Price Update:**
```json
{
  "adminId": "507f1f77bcf86cd799439013",
  "adminName": "John Admin",
  "adminEmail": "admin@trafficslight.com",
  "action": "UPDATE",
  "resource": "GAS_STATION",
  "description": "Updated fuel prices for gas station: Shell Station Makati (Shell)",
  "details": {
    "stationId": "507f1f77bcf86cd799439011",
    "stationName": "Shell Station Makati",
    "stationBrand": "Shell",
    "changes": {
      "before": {
        "gasoline": 45.50,
        "diesel": 42.30,
        "premium": 48.75
      },
      "after": {
        "gasoline": 46.50,
        "diesel": 43.30,
        "premium": 49.75
      }
    }
  },
  "ipAddress": "192.168.1.100",
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

---

## ⚠️ **Error Handling**

### **Standardized Error Responses:**

#### **400 Bad Request:**
```json
{
  "success": false,
  "message": "Latitude and longitude are required"
}
```

#### **401 Unauthorized:**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

#### **403 Forbidden:**
```json
{
  "success": false,
  "message": "Admin access required"
}
```

#### **404 Not Found:**
```json
{
  "success": false,
  "message": "Gas station not found"
}
```

#### **500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Failed to get gas stations",
  "error": "Detailed error message (development only)"
}
```

### **Common Error Scenarios:**

#### **1. Invalid Coordinates:**
```javascript
// Request with invalid coordinates
POST /api/admin-gas-stations
{
  "location": {
    "coordinates": [200, 100]  // Invalid longitude/latitude
  }
}

// Response
{
  "success": false,
  "message": "Invalid coordinates"
}
```

#### **2. Missing Required Fields:**
```javascript
// Request missing required fields
POST /api/admin-gas-stations
{
  "brand": "Shell"
  // Missing name, location, address
}

// Response
{
  "success": false,
  "message": "Name, location, and address are required"
}
```

#### **3. Duplicate Gas Station:**
```javascript
// Request creating duplicate station
POST /api/admin-gas-stations
{
  "name": "Existing Station",
  "location": {
    "coordinates": [121.0174, 14.5547]
  }
}

// Response
{
  "success": false,
  "message": "Gas station with this location already exists"
}
```

---

## 🚀 **Best Practices**

### **1. Data Validation:**
- Always validate coordinates (longitude: -180 to 180, latitude: -90 to 90)
- Ensure required fields are present (name, location, address)
- Validate fuel prices are positive numbers
- Check phone numbers and email formats

### **2. Security:**
- Always use HTTPS in production
- Validate admin tokens before allowing modifications
- Sanitize user inputs to prevent injection attacks
- Log all admin actions for audit trails

### **3. Performance:**
- Use pagination for large datasets
- Implement proper database indexing
- Cache frequently accessed data
- Use geospatial indexes for location queries

### **4. Error Handling:**
- Provide clear, actionable error messages
- Log errors for debugging
- Don't expose sensitive information in error responses
- Use appropriate HTTP status codes

### **5. API Design:**
- Use consistent response formats
- Provide meaningful error messages
- Include pagination metadata
- Use RESTful URL patterns

---

## 🔧 **Development & Testing**

### **Local Development Setup:**
```bash
# Install dependencies
npm install

# Set environment variables
export MONGODB_URI="mongodb://localhost:27017/trafficslight"
export JWT_SECRET="your-secret-key"
export NODE_ENV="development"

# Start development server
npm run dev
```

### **Testing Endpoints:**
```bash
# Test public endpoints
curl -X GET "http://localhost:5000/api/admin-gas-stations"

# Test admin endpoints (with token)
curl -X POST "http://localhost:5000/api/admin-gas-stations" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Station", "location": {"coordinates": [121.0174, 14.5547]}, "address": "Test Address"}'
```

### **Database Indexes:**
```javascript
// Recommended indexes for GasStation collection
db.gasstations.createIndex({ "location": "2dsphere" });
db.gasstations.createIndex({ "brand": 1 });
db.gasstations.createIndex({ "city": 1 });
db.gasstations.createIndex({ "status": 1 });
db.gasstations.createIndex({ "isVerified": 1 });
db.gasstations.createIndex({ "name": "text", "address": "text" });
```

---

## 📈 **Monitoring & Maintenance**

### **Key Metrics to Monitor:**
- API response times
- Error rates
- Database query performance
- Admin action frequency
- Gas station verification rates

### **Regular Maintenance Tasks:**
- Clean up old archived stations
- Update fuel prices regularly
- Verify new station submissions
- Monitor review quality
- Update operating hours

### **Log Analysis:**
- Monitor admin action logs for suspicious activity
- Track error patterns for system improvements
- Analyze user review trends
- Monitor API usage patterns

---

## 🎯 **Summary**

The admin-backend gas station system provides:

✅ **Complete CRUD Operations** - Create, read, update, delete gas stations
✅ **Advanced Filtering** - Search by location, brand, services, prices
✅ **Geospatial Queries** - Find nearby stations using coordinates
✅ **Admin Authentication** - Secure access control for admin operations
✅ **Comprehensive Logging** - Full audit trail of all admin actions
✅ **Standardized Responses** - Consistent API response format
✅ **Error Handling** - Robust error handling with clear messages
✅ **Statistics & Analytics** - Detailed statistics and price trends
✅ **Review System** - User reviews and ratings
✅ **Verification System** - Admin verification workflow

**The system is production-ready and provides a complete solution for managing gas stations in the admin-backend!** 🚀✨
