# Complete API Documentation - TrafficSlight Admin Dashboard

## Overview
This document provides comprehensive documentation for all API endpoints implemented for the TrafficSlight Admin Dashboard backend.

## Base URL
```
https://ts-backend-1-jyit.onrender.com/api
```

## Authentication
Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## 1. Authentication & User Management APIs

### Authentication Endpoints

#### POST /api/auth/register
Register a new user
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

#### POST /api/auth/login
Login user
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### POST /api/auth/logout
Logout user (requires authentication)

#### GET /api/auth/verify-token
Verify JWT token (requires authentication)

#### POST /api/auth/reset-password
Request password reset
```json
{
  "email": "user@example.com"
}
```

#### POST /api/auth/change-password
Change user password (requires authentication)
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

### User Analytics Endpoints

#### GET /api/auth/user-growth
Get user growth data for dashboard (requires authentication)
**Response:**
```json
{
  "monthlyData": [5, 12, 8, 15, 22, 18, 25, 30, 28, 35, 42, 38]
}
```

#### GET /api/auth/user-count
Get user count statistics (requires authentication)
**Response:**
```json
{
  "totalUsers": 1250,
  "newUsersThisMonth": 45
}
```

#### GET /api/auth/users
Get all users with pagination (requires authentication)
**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `search` (optional)
- `sortBy` (default: 'createdAt')
- `sortOrder` (default: 'desc')

#### GET /api/auth/first-user-name
Get first user's name for dashboard (requires authentication)
**Response:**
```json
{
  "firstName": "John"
}
```

---

## 2. Dashboard APIs

### Dashboard Overview

#### GET /api/dashboard/overview
Get dashboard overview statistics (requires authentication)
**Response:**
```json
{
  "totalUsers": 1250,
  "totalReports": 3500,
  "totalGasStations": 150,
  "totalMotors": 800,
  "totalTrips": 12000,
  "newUsersThisMonth": 45,
  "newReportsThisMonth": 120,
  "newTripsThisMonth": 800
}
```

#### GET /api/dashboard/stats
Get detailed dashboard statistics (requires authentication)
**Response:**
```json
{
  "userGrowth": [5, 12, 8, 15, 22, 18, 25, 30, 28, 35, 42, 38],
  "reportTrends": [10, 15, 12, 20, 25, 18, 30, 35, 28, 40, 45, 42],
  "reportsByType": {
    "traffic": 1200,
    "accident": 800,
    "hazard": 600,
    "closure": 400
  },
  "gasStationsByBrand": {
    "Shell": 45,
    "Petron": 38,
    "Caltex": 32,
    "Total": 25
  }
}
```

#### GET /api/dashboard/analytics
Get analytics data (requires authentication)
**Query Parameters:**
- `period` (default: '30d') - Options: '7d', '30d', '90d'

---

## 3. Reports Management APIs

### Reports CRUD Operations

#### GET /api/reports
Get all reports with pagination (requires authentication)
**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `type` (optional)
- `status` (optional)
- `search` (optional)

#### GET /api/reports/:id
Get specific report (requires authentication)

#### POST /api/reports
Create new report (requires authentication)
```json
{
  "title": "Traffic Jam on Main Street",
  "description": "Heavy traffic due to road construction",
  "type": "traffic",
  "location": {
    "latitude": 14.5995,
    "longitude": 120.9842,
    "barangay": "Makati",
    "city": "Makati City"
  }
}
```

#### PUT /api/reports/:id
Update report (requires authentication)

#### DELETE /api/reports/:id
Delete report (requires authentication)

#### PUT /api/reports/:id/archive
Archive report (requires authentication)

#### PUT /api/reports/:id/verify
Verify report (requires authentication)

#### GET /api/reports/count
Get total report count (requires authentication)

### Reports Analytics

#### GET /api/reports/analytics
Get reports analytics (requires authentication)

#### GET /api/reports/statistics
Get reports statistics (requires authentication)

#### GET /api/reports/geographic-data
Get geographic data for reports (requires authentication)

---

## 4. Gas Stations Management APIs

### Gas Stations CRUD

#### GET /api/gas-stations
Get all gas stations with pagination (requires authentication)

#### GET /api/gas-stations/:id
Get specific gas station (requires authentication)

#### POST /api/gas-stations
Create new gas station (requires authentication)
```json
{
  "name": "Shell Station Makati",
  "brand": "Shell",
  "location": {
    "latitude": 14.5995,
    "longitude": 120.9842,
    "barangay": "Makati",
    "city": "Makati City"
  },
  "fuelPrices": {
    "gasoline": 45.50,
    "diesel": 42.30
  }
}
```

#### PUT /api/gas-stations/:id
Update gas station (requires authentication)

#### DELETE /api/gas-stations/:id
Delete gas station (requires authentication)

#### GET /api/gas-stations/count
Get total gas station count (requires authentication)

### Gas Stations Analytics

#### GET /api/gas-stations/analytics
Get gas stations analytics (requires authentication)

#### GET /api/gas-stations/statistics
Get gas stations statistics (requires authentication)

#### GET /api/gas-stations/price-trends
Get fuel price trends (requires authentication)

---

## 5. Motorcycles Management APIs

### Motorcycles CRUD

#### GET /api/motorcycles
Get all motorcycles with pagination (requires authentication)

#### GET /api/motorcycles/:id
Get specific motorcycle (requires authentication)

#### POST /api/motorcycles
Create new motorcycle (requires authentication)
```json
{
  "model": "Honda CBR150R",
  "brand": "Honda",
  "engineDisplacement": "149.4cc",
  "power": "17.1 PS",
  "torque": "14.4 Nm",
  "fuelTank": "12L",
  "fuelConsumption": "35 km/L"
}
```

#### PUT /api/motorcycles/:id
Update motorcycle (requires authentication)

#### DELETE /api/motorcycles/:id
Delete motorcycle (requires authentication)

#### GET /api/motorcycles/count
Get total motorcycle count (requires authentication)

### Motorcycles Analytics

#### GET /api/motorcycles/analytics
Get motorcycles analytics (requires authentication)

#### GET /api/motorcycles/statistics
Get motorcycles statistics (requires authentication)

#### GET /api/motorcycles/popular-models
Get popular motorcycle models (requires authentication)

---

## 6. User Motors Management APIs

### User Motors CRUD

#### GET /api/user-motors
Get all user motors with pagination (requires authentication)

#### GET /api/user-motors/:id
Get specific user motor (requires authentication)

#### POST /api/user-motors
Create new user motor (requires authentication)
```json
{
  "userId": "user_id",
  "motorcycleId": "motorcycle_id",
  "nickname": "My Bike"
}
```

#### PUT /api/user-motors/:id
Update user motor (requires authentication)

#### DELETE /api/user-motors/:id
Delete user motor (requires authentication)

#### GET /api/user-motors/count
Get total user motor count (requires authentication)

### User Motors Analytics

#### GET /api/user-motors/analytics
Get user motors analytics (requires authentication)

#### GET /api/user-motors/statistics
Get user motors statistics (requires authentication)

#### GET /api/user-motors/user-distribution
Get user distribution for motors (requires authentication)

---

## 7. Trips Management APIs

### Trips CRUD

#### GET /api/trips
Get all trips with pagination (requires authentication)

#### GET /api/trips/:id
Get specific trip (requires authentication)

#### POST /api/trips
Create new trip (requires authentication)
```json
{
  "userId": "user_id",
  "startLocation": {
    "latitude": 14.5995,
    "longitude": 120.9842,
    "barangay": "Makati",
    "city": "Makati City"
  },
  "endLocation": {
    "latitude": 14.6042,
    "longitude": 120.9822,
    "barangay": "Makati",
    "city": "Makati City"
  },
  "distance": 5.2,
  "duration": 15
}
```

#### PUT /api/trips/:id
Update trip (requires authentication)

#### DELETE /api/trips/:id
Delete trip (requires authentication)

#### GET /api/trips/count
Get total trip count (requires authentication)

### Trips Analytics

#### GET /api/trips/analytics
Get trips analytics (requires authentication)

#### GET /api/trips/statistics
Get trips statistics (requires authentication)

#### GET /api/trips/monthly-stats
Get monthly trip statistics (requires authentication)

#### GET /api/trips/overall-stats
Get overall trip statistics (requires authentication)

#### GET /api/trips/user/:userId
Get trips for specific user (requires authentication)

---

## 8. Admin Management APIs

### Admin CRUD & Role Management

#### GET /api/admin-management/admins
Get all admins with pagination (requires authentication)

#### GET /api/admin-management/admin-roles
Get all admin roles (requires authentication)

#### POST /api/admin-management/admins
Create new admin (requires authentication)
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "password123",
  "roleId": "role_id"
}
```

#### PUT /api/admin-management/admins/:id/role
Update admin role (requires authentication)
```json
{
  "roleId": "new_role_id"
}
```

#### PUT /api/admin-management/admins/:id/deactivate
Deactivate admin (requires authentication)

#### GET /api/admin-management/admin-logs
Get all admin activity logs (requires authentication)

#### GET /api/admin-management/my-admin-logs
Get current admin's activity logs (requires authentication)

#### POST /api/admin-management/admin-roles
Create new admin role (requires authentication)

---

## 9. Geographic Data APIs

### Geography Endpoints

#### GET /api/geography
Get geographic data (requires authentication)
**Query Parameters:**
- `type` (default: 'all') - Options: 'all', 'reports', 'gas-stations'

#### GET /api/geography/barangay/:barangay
Get data for specific barangay (requires authentication)

#### GET /api/geography/statistics
Get geographic statistics (requires authentication)

---

## 10. Search APIs

### Advanced Search

#### GET /api/search/users
Search users (requires authentication)
**Query Parameters:**
- `q` (required) - Search query
- `page` (default: 1)
- `limit` (default: 20)

#### GET /api/search/reports
Search reports (requires authentication)
**Query Parameters:**
- `q` (required) - Search query
- `page` (default: 1)
- `limit` (default: 20)
- `type` (optional)
- `status` (optional)

#### GET /api/search/gas-stations
Search gas stations (requires authentication)
**Query Parameters:**
- `q` (required) - Search query
- `page` (default: 1)
- `limit` (default: 20)
- `brand` (optional)

#### GET /api/search/motorcycles
Search motorcycles (requires authentication)
**Query Parameters:**
- `q` (required) - Search query
- `page` (default: 1)
- `limit` (default: 20)

#### GET /api/search/trips
Search trips (requires authentication)
**Query Parameters:**
- `q` (required) - Search query
- `page` (default: 1)
- `limit` (default: 20)
- `userId` (optional)

---

## 11. Export APIs

### Data Export

#### GET /api/export/users
Export users data (requires authentication)
**Query Parameters:**
- `format` (default: 'csv') - Options: 'csv', 'json'

#### GET /api/export/reports
Export reports data (requires authentication)
**Query Parameters:**
- `format` (default: 'csv') - Options: 'csv', 'json'

#### GET /api/export/gas-stations
Export gas stations data (requires authentication)
**Query Parameters:**
- `format` (default: 'csv') - Options: 'csv', 'json'

#### GET /api/export/trips
Export trips data (requires authentication)
**Query Parameters:**
- `format` (default: 'csv') - Options: 'csv', 'json'

---

## 12. Settings APIs

### System Configuration

#### GET /api/settings
Get system settings (requires authentication)

#### PUT /api/settings
Update system settings (requires authentication)
```json
{
  "settings": {
    "app": {
      "name": "TrafficSlight Admin Dashboard",
      "version": "1.0.0"
    },
    "features": {
      "userManagement": true,
      "reportManagement": true
    }
  }
}
```

#### GET /api/settings/theme
Get theme settings (requires authentication)

#### PUT /api/settings/theme
Update theme settings (requires authentication)
```json
{
  "theme": {
    "primaryColor": "#1976d2",
    "secondaryColor": "#dc004e",
    "mode": "light",
    "fontFamily": "Roboto"
  }
}
```

---

## 13. Fuel Management APIs

### Fuel Logs

#### GET /api/fuel-logs
Get fuel logs (requires authentication)

#### POST /api/fuel-logs
Create fuel log (requires authentication)

#### PUT /api/fuel-logs/:id
Update fuel log (requires authentication)

#### DELETE /api/fuel-logs/:id
Delete fuel log (requires authentication)

### Fuel Analytics

#### GET /api/fuel/combined
Get combined fuel data (requires authentication)

#### GET /api/fuel/efficiency
Get fuel efficiency analytics (requires authentication)

#### GET /api/fuel/cost-analysis
Get fuel cost analysis (requires authentication)

---

## 14. Map APIs

### Google Maps Integration

#### POST /api/map/geocode
Geocode address to coordinates (requires authentication)

#### POST /api/map/reverse-geocode
Reverse geocode coordinates to address (requires authentication)

#### POST /api/map/routes
Get routes between points (requires authentication)

#### POST /api/map/directions
Get detailed directions (requires authentication)

### Server-side Clustering

#### GET /api/map/clustered-markers
Get clustered markers for map display (requires authentication)

#### GET /api/map/statistics
Get map statistics (requires authentication)

#### GET /api/map/nearby-gas-stations
Get nearby gas stations with prices (requires authentication)

---

## 15. Notifications APIs

### Notifications Management

#### GET /api/notifications
Get notifications (requires authentication)

#### POST /api/notifications
Create notification (requires authentication)

#### PUT /api/notifications/:id/read
Mark notification as read (requires authentication)

#### DELETE /api/notifications/:id
Delete notification (requires authentication)

---

## 16. Saved Destinations APIs

### Saved Destinations Management

#### GET /api/saved-destinations
Get saved destinations (requires authentication)

#### POST /api/saved-destinations
Create saved destination (requires authentication)

#### PUT /api/saved-destinations/:id
Update saved destination (requires authentication)

#### DELETE /api/saved-destinations/:id
Delete saved destination (requires authentication)

---

## 17. Analytics APIs

### Daily Analytics

#### GET /api/daily-analytics
Get daily analytics (requires authentication)

#### POST /api/daily-analytics
Create daily analytics (requires authentication)

### Fuel Statistics

#### GET /api/fuel-stats
Get fuel statistics (requires authentication)

### General Analytics

#### GET /api/general-analytics
Get general analytics (requires authentication)

#### POST /api/general-analytics
Create general analytics (requires authentication)

### Leaderboard Analytics

#### GET /api/leaderboard-analytics
Get leaderboard analytics (requires authentication)

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Invalid request parameters"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "Something went wrong"
}
```

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- **Authentication endpoints**: 5 requests per minute
- **General endpoints**: 100 requests per minute
- **Search endpoints**: 50 requests per minute

---

## CORS Configuration

The API supports CORS for the following origins:
- `http://localhost:3000` (development)
- `https://your-frontend-domain.com` (production)

---

## Environment Variables

Required environment variables:
```bash
# Database
DB_HOST=your-database-host
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=your-database-name
DB_PORT=your-database-port

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# Google Maps
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# CORS
CORS_ORIGIN=http://localhost:3000,https://your-frontend-domain.com
```

This comprehensive API documentation covers all the endpoints implemented for the TrafficSlight Admin Dashboard backend.
