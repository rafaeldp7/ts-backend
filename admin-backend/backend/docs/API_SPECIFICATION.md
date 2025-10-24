# Traffic Management System - API Specification

## Overview

This document provides comprehensive API documentation for the Traffic Management System backend. The API follows RESTful principles and provides endpoints for user management, traffic reporting, trip tracking, gas station management, and administrative functions.

## Base URL

```
https://your-domain.com/api
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this format:

```json
{
  "success": true|false,
  "message": "Response message",
  "data": {}, // Response data (if any)
  "pagination": {}, // Pagination info (if applicable)
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Error Handling

Errors are returned with appropriate HTTP status codes:

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "barangay": "Barangay 1",
    "city": "Manila",
    "province": "Metro Manila",
    "zipCode": "1000",
    "coordinates": {
      "lat": 14.5995,
      "lng": 120.9842
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "token": "jwt_token"
  }
}
```

#### Login User
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Admin Login
```http
POST /api/auth/admin/login
```

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

### Reports

#### Get All Reports
```http
GET /api/reports?page=1&limit=10&status=pending&type=Accident&city=Manila
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `status` - Filter by status (pending, verified, resolved, etc.)
- `type` - Filter by report type
- `city` - Filter by city
- `barangay` - Filter by barangay
- `dateFrom` - Start date filter
- `dateTo` - End date filter
- `search` - Search term

#### Create Report
```http
POST /api/reports
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "reportType": "Accident",
  "title": "Car Accident on Main Street",
  "description": "Two vehicles collided at the intersection",
  "location": {
    "address": "Main Street, Manila",
    "barangay": "Barangay 1",
    "city": "Manila",
    "province": "Metro Manila",
    "coordinates": {
      "lat": 14.5995,
      "lng": 120.9842
    }
  },
  "priority": "high",
  "attachments": [
    {
      "type": "image",
      "filename": "accident.jpg",
      "url": "https://example.com/accident.jpg"
    }
  ]
}
```

#### Update Report
```http
PUT /api/reports/:id
Authorization: Bearer <token>
```

#### Delete Report
```http
DELETE /api/reports/:id
Authorization: Bearer <token>
```

#### Verify Report (Admin)
```http
PUT /api/reports/:id/verify
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "notes": "Report verified by admin"
}
```

#### Resolve Report (Admin)
```http
PUT /api/reports/:id/resolve
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "notes": "Issue resolved",
  "actions": ["Traffic cleared", "Road reopened"]
}
```

### Trips

#### Get All Trips
```http
GET /api/trips?page=1&limit=10&userId=user_id&status=completed
```

#### Create Trip
```http
POST /api/trips
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Trip to Mall",
  "description": "Shopping trip",
  "startLocation": {
    "address": "Home, Manila",
    "coordinates": {
      "lat": 14.5995,
      "lng": 120.9842
    }
  },
  "endLocation": {
    "address": "Mall of Asia, Pasay",
    "coordinates": {
      "lat": 14.5355,
      "lng": 120.9815
    }
  },
  "distance": 15.5,
  "duration": 30,
  "startTime": "2024-01-15T08:00:00.000Z",
  "endTime": "2024-01-15T08:30:00.000Z",
  "motorcycle": "motorcycle_id"
}
```

#### Get Trip Analytics
```http
GET /api/trips/analytics/summary?userId=user_id
```

#### Get Monthly Trip Summary
```http
GET /api/trips/analytics/monthly?year=2024&month=1&userId=user_id
```

### Gas Stations

#### Get All Gas Stations
```http
GET /api/gas-stations?page=1&limit=10&brand=Shell&city=Manila
```

#### Get Nearby Gas Stations
```http
GET /api/gas-stations/nearby?lat=14.5995&lng=120.9842&radius=5000
```

#### Create Gas Station (Admin)
```http
POST /api/gas-stations
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "name": "Shell Station",
  "brand": "Shell",
  "location": {
    "address": "EDSA, Quezon City",
    "barangay": "Barangay 1",
    "city": "Quezon City",
    "province": "Metro Manila",
    "coordinates": {
      "lat": 14.5995,
      "lng": 120.9842
    }
  },
  "contact": {
    "phone": "+1234567890",
    "email": "station@shell.com"
  },
  "operatingHours": {
    "monday": { "open": "06:00", "close": "22:00", "is24Hours": false },
    "tuesday": { "open": "06:00", "close": "22:00", "is24Hours": false }
  },
  "fuelPrices": {
    "gasoline": {
      "regular": 45.50,
      "premium": 48.00
    },
    "diesel": {
      "regular": 42.00
    }
  },
  "services": {
    "fuel": {
      "gasoline": true,
      "diesel": true
    },
    "convenience": {
      "store": true,
      "atm": true,
      "restroom": true
    }
  }
}
```

#### Add Review
```http
POST /api/gas-stations/:id/reviews
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Great service and clean facilities",
  "categories": {
    "fuelQuality": 5,
    "service": 5,
    "cleanliness": 4,
    "price": 3
  }
}
```

### Dashboard

#### Get Dashboard Overview
```http
GET /api/dashboard/overview
Authorization: Bearer <token>
```

#### Get Dashboard Statistics
```http
GET /api/dashboard/stats?period=30d
```

#### Get User Dashboard
```http
GET /api/dashboard/user
Authorization: Bearer <token>
```

#### Get Admin Dashboard
```http
GET /api/dashboard/admin
Authorization: Bearer <admin-token>
```

#### Get Analytics
```http
GET /api/dashboard/analytics?type=users&period=30d
```

### Users (Admin Only)

#### Get All Users
```http
GET /api/users?page=1&limit=10&search=john&city=Manila
Authorization: Bearer <admin-token>
```

#### Get User by ID
```http
GET /api/users/:id
Authorization: Bearer <admin-token>
```

#### Update User
```http
PUT /api/users/:id
Authorization: Bearer <admin-token>
```

#### Delete User
```http
DELETE /api/users/:id
Authorization: Bearer <admin-token>
```

### Admin Management

#### Get All Admins
```http
GET /api/admin?page=1&limit=10&role=admin&isActive=true
Authorization: Bearer <admin-token>
```

#### Create Admin
```http
POST /api/admin
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@example.com",
  "password": "admin123",
  "role": "role_id",
  "phone": "+1234567890"
}
```

#### Get Admin Roles
```http
GET /api/admin/roles
Authorization: Bearer <admin-token>
```

#### Create Admin Role
```http
POST /api/admin/roles
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "name": "moderator",
  "displayName": "Moderator",
  "description": "Moderate content and reports",
  "permissions": {
    "canCreate": true,
    "canRead": true,
    "canUpdate": true,
    "canDelete": false,
    "canManageReports": true,
    "canViewAnalytics": true
  },
  "level": 3
}
```

## Data Models

### User Model
```json
{
  "id": "user_id",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "barangay": "Barangay 1",
    "city": "Manila",
    "province": "Metro Manila",
    "zipCode": "1000",
    "coordinates": {
      "lat": 14.5995,
      "lng": 120.9842
    }
  },
  "isActive": true,
  "isVerified": false,
  "preferences": {
    "notifications": {
      "email": true,
      "push": true,
      "sms": false
    },
    "theme": "auto",
    "language": "en"
  },
  "stats": {
    "totalTrips": 0,
    "totalDistance": 0,
    "totalReports": 0
  },
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### Report Model
```json
{
  "id": "report_id",
  "reportType": "Accident",
  "title": "Car Accident on Main Street",
  "description": "Two vehicles collided at the intersection",
  "location": {
    "address": "Main Street, Manila",
    "barangay": "Barangay 1",
    "city": "Manila",
    "province": "Metro Manila",
    "coordinates": {
      "lat": 14.5995,
      "lng": 120.9842
    }
  },
  "reporter": "user_id",
  "status": "pending",
  "priority": "high",
  "verifiedBy": "admin_id",
  "verifiedAt": "2024-01-15T10:30:00.000Z",
  "resolvedBy": "admin_id",
  "resolvedAt": "2024-01-15T11:00:00.000Z",
  "attachments": [
    {
      "type": "image",
      "filename": "accident.jpg",
      "url": "https://example.com/accident.jpg"
    }
  ],
  "stats": {
    "views": 0,
    "shares": 0,
    "confirmations": 0
  },
  "reportedAt": "2024-01-15T10:00:00.000Z",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

### Trip Model
```json
{
  "id": "trip_id",
  "user": "user_id",
  "motorcycle": "motorcycle_id",
  "title": "Trip to Mall",
  "description": "Shopping trip",
  "startLocation": {
    "address": "Home, Manila",
    "coordinates": {
      "lat": 14.5995,
      "lng": 120.9842
    }
  },
  "endLocation": {
    "address": "Mall of Asia, Pasay",
    "coordinates": {
      "lat": 14.5355,
      "lng": 120.9815
    }
  },
  "distance": 15.5,
  "duration": 30,
  "averageSpeed": 31.0,
  "maxSpeed": 45.0,
  "fuelConsumption": 1.2,
  "fuelCost": 54.60,
  "fuelEfficiency": 12.92,
  "startTime": "2024-01-15T08:00:00.000Z",
  "endTime": "2024-01-15T08:30:00.000Z",
  "status": "completed",
  "weather": {
    "condition": "sunny",
    "temperature": 28,
    "humidity": 65
  },
  "traffic": {
    "level": "moderate",
    "delays": [
      {
        "location": "EDSA",
        "duration": 5,
        "reason": "Traffic jam"
      }
    ]
  },
  "expenses": [
    {
      "type": "fuel",
      "amount": 54.60,
      "description": "Gasoline",
      "location": "Shell Station",
      "timestamp": "2024-01-15T08:15:00.000Z"
    }
  ],
  "stats": {
    "views": 0,
    "shares": 0,
    "likes": 0
  },
  "createdAt": "2024-01-15T08:00:00.000Z",
  "updatedAt": "2024-01-15T08:30:00.000Z"
}
```

### Gas Station Model
```json
{
  "id": "station_id",
  "name": "Shell Station",
  "brand": "Shell",
  "location": {
    "address": "EDSA, Quezon City",
    "barangay": "Barangay 1",
    "city": "Quezon City",
    "province": "Metro Manila",
    "coordinates": {
      "lat": 14.5995,
      "lng": 120.9842
    }
  },
  "contact": {
    "phone": "+1234567890",
    "email": "station@shell.com",
    "website": "https://shell.com"
  },
  "operatingHours": {
    "monday": { "open": "06:00", "close": "22:00", "is24Hours": false },
    "tuesday": { "open": "06:00", "close": "22:00", "is24Hours": false }
  },
  "fuelPrices": {
    "gasoline": {
      "regular": 45.50,
      "premium": 48.00
    },
    "diesel": {
      "regular": 42.00
    },
    "lastUpdated": "2024-01-15T10:30:00.000Z"
  },
  "services": {
    "fuel": {
      "gasoline": true,
      "diesel": true,
      "lpg": false
    },
    "convenience": {
      "store": true,
      "atm": true,
      "restroom": true,
      "carWash": false,
      "airPump": true
    }
  },
  "status": "active",
  "isVerified": true,
  "stats": {
    "totalVisits": 0,
    "totalReviews": 0,
    "averageRating": 0
  },
  "reviews": [
    {
      "user": "user_id",
      "rating": 5,
      "comment": "Great service!",
      "categories": {
        "fuelQuality": 5,
        "service": 5,
        "cleanliness": 4,
        "price": 3
      },
      "timestamp": "2024-01-15T10:30:00.000Z"
    }
  ],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **General endpoints**: 100 requests per 15 minutes
- **Authentication endpoints**: 10 requests per 15 minutes
- **File upload endpoints**: 20 requests per 15 minutes

## Pagination

Most list endpoints support pagination:

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

Response includes pagination metadata:

```json
{
  "pagination": {
    "current": 1,
    "pages": 10,
    "total": 100,
    "limit": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Filtering and Search

Many endpoints support filtering and search:

- `search` - Text search across relevant fields
- `status` - Filter by status
- `type` - Filter by type
- `city` - Filter by city
- `barangay` - Filter by barangay
- `dateFrom` - Start date filter
- `dateTo` - End date filter

## Sorting

List endpoints support sorting:

- `sort` - Sort field (e.g., `createdAt`, `name`)
- `order` - Sort order (`asc` or `desc`)

## Webhooks

The API supports webhooks for real-time notifications:

- **Report created** - When a new report is submitted
- **Report verified** - When a report is verified by admin
- **Report resolved** - When a report is resolved
- **Trip completed** - When a trip is completed
- **Gas station updated** - When gas station information is updated

## Error Codes

| Code | Description |
|------|-------------|
| 1001 | Validation error |
| 1002 | Authentication required |
| 1003 | Insufficient permissions |
| 1004 | Resource not found |
| 1005 | Duplicate resource |
| 1006 | Rate limit exceeded |
| 1007 | File upload error |
| 1008 | External service error |

## SDKs and Libraries

Official SDKs are available for:

- **JavaScript/Node.js** - `npm install traffic-management-sdk`
- **Python** - `pip install traffic-management-sdk`
- **PHP** - `composer require traffic-management/sdk`
- **Java** - Available in Maven Central

## Support

For API support and questions:

- **Email**: api-support@trafficmanagement.com
- **Documentation**: https://docs.trafficmanagement.com
- **Status Page**: https://status.trafficmanagement.com
