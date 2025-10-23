# Traffic Slight Backend API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://api.trafficslight.com/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "city": "New York",
  "province": "NY",
  "barangay": "Manhattan",
  "street": "123 Main St"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### POST /auth/login
Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### POST /auth/reset-password
Request password reset.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

### POST /auth/change-password
Change user password (requires authentication).

**Request Body:**
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

---

## 🏍️ Motorcycle Management

### GET /motors
Get all motorcycles for authenticated user.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sortBy` (optional): Sort field (default: 'createdAt')
- `sortOrder` (optional): Sort order (default: 'desc')

**Response:**
```json
{
  "motorcycles": [...],
  "totalPages": 5,
  "currentPage": 1,
  "total": 50
}
```

### GET /motors/:id
Get specific motorcycle details.

**Response:**
```json
{
  "_id": "motor_id",
  "nickname": "My Bike",
  "brand": "Honda",
  "model": "CBR600RR",
  "year": 2020,
  "currentFuelLevel": 15.0,
  "analytics": {
    "totalDistance": 1500,
    "totalTrips": 25,
    "lastUpdated": "2024-01-15T10:30:00Z"
  }
}
```

### POST /motors
Create new motorcycle.

**Request Body:**
```json
{
  "nickname": "My Bike",
  "brand": "Honda",
  "model": "CBR600RR",
  "year": 2020,
  "engineDisplacement": 600,
  "fuelCapacity": 18.5,
  "currentFuelLevel": 15.0
}
```

### PUT /motors/:id
Update motorcycle details.

### DELETE /motors/:id
Soft delete motorcycle.

### PUT /motors/:id/fuel
Update fuel level.

**Request Body:**
```json
{
  "fuelLevel": 12.5,
  "distanceTraveled": 50,
  "tripId": "trip_id_optional"
}
```

### GET /motors/:id/analytics
Get motorcycle analytics.

**Query Parameters:**
- `period`: 7d, 30d, 90d (default: 30d)

---

## 🗺️ Trip Management

### GET /trips
Get user trips.

**Query Parameters:**
- `status`: planned, in_progress, completed, cancelled
- `motorId`: Filter by motorcycle
- `startDate`: Start date filter
- `endDate`: End date filter
- `page`: Page number
- `limit`: Items per page

### POST /trips
Start new trip.

**Request Body:**
```json
{
  "motorId": "motor_id",
  "destination": "Downtown",
  "startLocation": {
    "address": "123 Main St",
    "lat": 40.7128,
    "lng": -74.0060
  },
  "endLocation": {
    "address": "456 Broadway",
    "lat": 40.7589,
    "lng": -73.9851
  }
}
```

### PUT /trips/:id/complete
Complete trip.

**Request Body:**
```json
{
  "actualDistance": 25.5,
  "actualFuelUsedMin": 2.1,
  "actualFuelUsedMax": 2.3,
  "duration": 45,
  "kmph": 65
}
```

### PUT /trips/:id/cancel
Cancel trip.

---

## ⛽ Fuel Management

### GET /fuel-logs/:userId
Get fuel logs for user.

**Response:**
```json
[
  {
    "_id": "log_id",
    "motorId": "motor_id",
    "liters": 15.5,
    "pricePerLiter": 1.25,
    "totalCost": 19.38,
    "date": "2024-01-15T10:30:00Z",
    "notes": "Full tank at Shell"
  }
]
```

### POST /fuel-logs
Create fuel log entry.

**Request Body:**
```json
{
  "motorId": "motor_id",
  "liters": 15.5,
  "pricePerLiter": 1.25,
  "notes": "Full tank at Shell"
}
```

### PUT /fuel-logs/:id
Update fuel log.

### DELETE /fuel-logs/:id
Delete fuel log.

### GET /fuel-stats/:motorId
Get fuel statistics for motorcycle.

**Response:**
```json
{
  "motorId": "motor_id",
  "totalLogs": 25,
  "fuelStats": {
    "average": 12.5,
    "min": 8.0,
    "max": 18.5
  }
}
```

---

## 📊 Analytics

### GET /analytics/dashboard
Get dashboard analytics.

**Query Parameters:**
- `period`: 7d, 30d, 90d (default: 30d)

**Response:**
```json
{
  "period": "30d",
  "trips": {
    "total": 45,
    "completed": 42,
    "totalDistance": 1250.5,
    "avgDistancePerTrip": 27.8,
    "totalFuelUsed": 85.2,
    "avgFuelEfficiency": 14.7
  },
  "maintenance": {
    "totalCost": 450.75,
    "refuelCount": 12,
    "oilChangeCount": 2,
    "totalRecords": 15
  },
  "motors": {
    "total": 3,
    "active": 2
  }
}
```

### GET /analytics/trips
Get trip analytics.

**Query Parameters:**
- `period`: 7d, 30d, 90d
- `motorId`: Filter by motorcycle

### GET /analytics/fuel
Get fuel analytics.

### GET /analytics/maintenance
Get maintenance analytics.

### GET /analytics/performance
Get performance analytics.

### GET /analytics/reports
Get report analytics.

### GET /analytics/export
Export analytics data.

**Query Parameters:**
- `format`: json, csv (default: json)
- `period`: 7d, 30d, 90d

---

## 🔧 Maintenance

### GET /maintenance
Get maintenance records.

### POST /maintenance
Create maintenance record.

**Request Body:**
```json
{
  "motorId": "motor_id",
  "type": "oil_change",
  "details": {
    "description": "Regular oil change",
    "cost": 45.50,
    "quantity": 3.5,
    "notes": "Used synthetic oil"
  }
}
```

### PUT /maintenance/:id
Update maintenance record.

### DELETE /maintenance/:id
Delete maintenance record.

---

## 📱 Notifications

### GET /notifications/:userId
Get user notifications.

### POST /notifications
Create notification.

**Request Body:**
```json
{
  "userId": "user_id",
  "message": "Maintenance due soon",
  "type": "maintenance_reminder"
}
```

### PUT /notifications/read/:id
Mark notification as read.

### DELETE /notifications/:id
Delete notification.

---

## 🗺️ Saved Destinations

### GET /saved-destinations/:userId
Get user saved destinations.

### POST /saved-destinations
Save destination.

**Request Body:**
```json
{
  "userId": "user_id",
  "label": "Home",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "category": "Home"
}
```

### PUT /saved-destinations/:id
Update saved destination.

### DELETE /saved-destinations/:id
Delete saved destination.

---

## 🏆 Leaderboards

### GET /leaderboard-analytics/monthly
Get monthly leaderboard.

**Response:**
```json
{
  "leaderboard": [
    {
      "_id": "user_id",
      "totalDistance": 2500,
      "tripCount": 45
    }
  ]
}
```

---

## 🛠️ Admin Endpoints

### GET /fuel-logs/admin/overview
Get fuel overview (admin only).

### GET /fuel-logs/admin/avg-per-motor
Get average fuel by motor (admin only).

### GET /fuel-logs/admin/top-spenders
Get top fuel spenders (admin only).

### GET /fuel-logs/admin/monthly-usage
Get monthly fuel usage (admin only).

---

## 📈 Daily Analytics

### GET /daily-analytics/:motorId
Get daily analytics for motorcycle.

**Response:**
```json
[
  {
    "date": "2024-01-15",
    "totalDistance": 45.2,
    "totalFuelUsed": 3.2,
    "kmphAverage": 55.5,
    "trips": 3,
    "alerts": ["High average speed"]
  }
]
```

---

## 🔍 General Analytics

### GET /general-analytics
Get all analytics entries (admin).

### GET /general-analytics/:key
Get analytics by key.

### POST /general-analytics
Create or update analytics entry.

**Request Body:**
```json
{
  "key": "trafficTrends",
  "data": {
    "peakHours": [7, 8, 17, 18],
    "avgSpeed": 45.5
  },
  "description": "Traffic pattern analysis"
}
```

---

## 🚨 Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation error",
  "details": ["Field is required"]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Not authorized, no token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Not authorized as an admin"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Server error"
}
```

---

## 📝 Rate Limiting

- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 requests per 15 minutes
- **File Upload**: 10 requests per 15 minutes

---

## 🔒 Security Headers

All responses include security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`

---

## 📊 Response Pagination

Paginated responses include:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```
