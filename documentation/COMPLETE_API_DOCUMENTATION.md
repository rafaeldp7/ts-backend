# 🚀 Complete API Documentation & Implementation Guide

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Getting Started](#getting-started)
3. [Authentication](#authentication)
4. [API Endpoints](#api-endpoints)
5. [Data Models](#data-models)
6. [Error Handling](#error-handling)
7. [Implementation Examples](#implementation-examples)
8. [Best Practices](#best-practices)

---

## 🎯 System Overview

This is a **Traffic Management System** backend built with **Node.js**, **Express**, and **MongoDB**. The system provides APIs for:

- **User Management** - Registration, authentication, profile management
- **Admin Management** - Admin authentication, admin CRUD operations, role-based permissions
- **Trip Tracking** - Create, view, and manage user trips
- **Traffic Reports** - Create and manage traffic incident reports
- **Gas Station Management** - Find, manage, and review gas stations
- **Motorcycle Management** - Manage motorcycle catalog and user motorcycles
- **Analytics & Dashboard** - Get statistics and analytics data
- **Maintenance Records** - Track motorcycle maintenance
- **Fuel Logs** - Track fuel consumption and expenses
- **Notifications** - User notification system

### **Technology Stack**
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose)
- **Authentication:** JWT (JSON Web Tokens)
- **Security:** bcryptjs for password hashing

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### **Installation Steps**

1. **Clone/Download the project:**
```bash
cd ts-backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
Create a `.env` file in the root directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb://localhost:27017/trafficslight
# OR use MongoDB Atlas
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/trafficslight

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production

# Google Maps API (Optional - for geocoding)
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Email Configuration (Optional)
SENDGRID_API_KEY=your-sendgrid-api-key
```

4. **Start the server:**
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

5. **Verify server is running:**
```bash
# Open browser or use curl
curl http://localhost:5000/
# Expected response: "🚀 Server is running!"
```

### **Initial Setup Scripts**

Run these scripts to set up default admin accounts and roles:

```bash
# Create default admin roles
node createDefaultRoles.js

# Create default admin account
node createDefaultAdmin.js

# Complete admin system setup
node setupAdminSystem.js
```

---

## 🔐 Authentication

### **User Authentication**

All user endpoints require JWT token authentication (except registration and login).

#### **Register User**
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
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "68fc328dc01badc2522d6c48",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890"
  }
}
```

#### **User Login**
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

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "68fc328dc01badc2522d6c48",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "preferences": {
      "units": "metric",
      "language": "en",
      "notifications": true
    }
  }
}
```

#### **Using JWT Token**
Include the token in the Authorization header for protected endpoints:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Admin Authentication**

Admin endpoints require admin JWT token.

#### **Admin Login**
```http
POST /api/admin-auth/admin-login
```

**Request Body:**
```json
{
  "email": "admin@trafficslight.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin login successful",
  "data": {
    "admin": {
      "id": "admin_id",
      "email": "admin@trafficslight.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": {
        "name": "super_admin",
        "displayName": "Super Admin"
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### **Verify Token**
```http
GET /api/admin-auth/verify-token
```

**Headers:**
```http
Authorization: Bearer <admin-token>
```

---

## 📡 API Endpoints

### **Base URL**
```
http://localhost:5000/api
```

---

## 🔑 User Endpoints (`/api/auth`)

### **Register**
```http
POST /api/auth/register
```

**Parameters:**
- `firstName` (string, required)
- `lastName` (string, required)
- `email` (string, required, unique)
- `password` (string, required, min 6 characters)
- `phone` (string, optional)

### **Login**
```http
POST /api/auth/login
```

**Parameters:**
- `email` (string, required)
- `password` (string, required)

### **Reset Password**
```http
POST /api/auth/reset-password
```

**Parameters:**
- `email` (string, required)

### **Verify Reset Token**
```http
POST /api/auth/verify-reset
```

**Parameters:**
- `token` (string, required)
- `email` (string, required)

### **Change Password**
```http
POST /api/auth/change-password
```

**Parameters:**
- `token` (string, required)
- `email` (string, required)
- `newPassword` (string, required)

### **Get Profile** (Auth Required)
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### **Logout** (Auth Required)
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

### **Verify Token**
```http
GET /api/auth/verify-token
Authorization: Bearer <token>
```

### **Get User Analytics**
```http
GET /api/auth/user-growth
GET /api/auth/user-count
GET /api/auth/new-users-this-month
GET /api/auth/users
```

---

## 👤 User Management Endpoints (`/api/users`)

All endpoints require authentication.

### **Get Profile**
```http
GET /api/users/profile
GET /api/users/profile/:userId
Authorization: Bearer <token>
```

### **Update Profile**
```http
PUT /api/users/profile
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "city": "Manila",
  "province": "Metro Manila",
  "barangay": "Barangay 1",
  "street": "123 Main St"
}
```

### **Get User Statistics**
```http
GET /api/users/stats
GET /api/users/stats/:userId
Authorization: Bearer <token>
```

### **Get Dashboard Data**
```http
GET /api/users/dashboard
GET /api/users/dashboard/:userId
Authorization: Bearer <token>
```

### **Get Activity Log**
```http
GET /api/users/activity
GET /api/users/activity/:userId
Authorization: Bearer <token>
```

### **Get User Preferences**
```http
GET /api/users/preferences
PUT /api/users/preferences
Authorization: Bearer <token>
```

**Update Preferences Body:**
```json
{
  "units": "metric",
  "language": "en",
  "notifications": true,
  "theme": "auto"
}
```

### **Change Password**
```http
PUT /api/users/change-password
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

### **Account Management**
```http
PUT /api/users/deactivate          # Deactivate account
PUT /api/users/reactivate          # Reactivate account
DELETE /api/users/delete           # Delete account
Authorization: Bearer <token>
```

### **Export User Data**
```http
GET /api/users/export
Authorization: Bearer <token>
```

---

## 🛡️ Admin Authentication Endpoints (`/api/admin-auth`)

### **Admin Register**
```http
POST /api/admin-auth/register
```

**Request Body:**
```json
{
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@example.com",
  "password": "admin123",
  "phone": "+1234567890"
}
```

### **Admin Login**
```http
POST /api/admin-auth/login
POST /api/admin-auth/admin-login
```

**Request Body:**
```json
{
  "email": "admin@trafficslight.com",
  "password": "admin123"
}
```

### **Get Admin Profile** (Auth Required)
```http
GET /api/admin-auth/profile
Authorization: Bearer <admin-token>
```

### **Update Admin Profile** (Auth Required)
```http
PUT /api/admin-auth/profile
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "firstName": "Admin",
  "lastName": "User",
  "phone": "+1234567890"
}
```

### **Change Password** (Auth Required)
```http
PUT /api/admin-auth/change-password
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

### **Logout** (Auth Required)
```http
POST /api/admin-auth/logout
Authorization: Bearer <admin-token>
```

---

## 👥 Admin User Management (`/api/admin-users`)

All endpoints require admin authentication.

### **Get All Users**
```http
GET /api/admin-users?page=1&limit=1000&search=john&city=Manila&isActive=true
Authorization: Bearer <admin-token>
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 1000)
- `search` (string) - Search in firstName, lastName, email, name
- `city` (string) - Filter by city
- `barangay` (string) - Filter by barangay
- `isActive` (boolean) - Filter by active status

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "68fc328dc01badc2522d6c48",
        "name": "John Doe",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "city": "Manila",
        "province": "Metro Manila",
        "isActive": true,
        "isVerified": false,
        "createdAt": "2025-10-25T02:14:44.000Z"
      }
    ],
    "pagination": {
      "current": 1,
      "pages": 1,
      "total": 8
    }
  }
}
```

### **Get User Statistics**
```http
GET /api/admin-users/stats
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overall": {
      "totalUsers": 8,
      "activeUsers": 8,
      "inactiveUsers": 0,
      "newUsersThisMonth": 8
    },
    "distribution": {
      "byCity": [
        { "_id": "Manila", "count": 5 },
        { "_id": "Quezon City", "count": 3 }
      ],
      "byProvince": [
        { "_id": "Metro Manila", "count": 8 }
      ]
    }
  }
}
```

### **Get Users by Location**
```http
GET /api/admin-users/location?city=Manila&province=Metro Manila
Authorization: Bearer <admin-token>
```

### **Get Single User**
```http
GET /api/admin-users/:id
Authorization: Bearer <admin-token>
```

### **Create User**
```http
POST /api/admin-users
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "city": "Manila",
  "province": "Metro Manila",
  "barangay": "Barangay 1",
  "street": "123 Main St",
  "isActive": true
}
```

### **Update User**
```http
PUT /api/admin-users/:id
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "city": "Manila",
  "isActive": true
}
```

### **Delete User**
```http
DELETE /api/admin-users/:id
Authorization: Bearer <admin-token>
```

---

## 🏍️ Admin Motor Management (`/api/admin-motors`)

All endpoints require admin authentication.

### **Get All Motors**
```http
GET /api/admin-motors?page=1&limit=1000&brand=Honda&search=cbr
Authorization: Bearer <admin-token>
```

**Query Parameters:**
- `page` (number)
- `limit` (number)
- `brand` (string) - Filter by brand
- `search` (string) - Search in model, brand
- `fuelType` (string) - Filter by fuel type

**Response:**
```json
{
  "success": true,
  "data": {
    "motors": [
      {
        "_id": "motor_id",
        "model": "Honda CBR 600RR",
        "engineDisplacement": 600,
        "power": "80 HP",
        "torque": "60 Nm",
        "fuelTank": 15,
        "fuelConsumption": 20,
        "isDeleted": false,
        "createdAt": "2025-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "current": 1,
      "pages": 1,
      "total": 5
    }
  }
}
```

### **Get Motor Statistics**
```http
GET /api/admin-motors/stats
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overall": {
      "totalMotors": 50,
      "activeMotors": 48,
      "inactiveMotors": 2,
      "newMotorsThisMonth": 5
    },
    "distribution": {
      "byBrand": [
        { "_id": "Honda", "count": 20 },
        { "_id": "Yamaha", "count": 15 }
      ],
      "byYear": [
        { "_id": 2023, "count": 10 },
        { "_id": 2024, "count": 5 }
      ],
      "byFuelType": [
        { "_id": "gasoline", "count": 45 },
        { "_id": "diesel", "count": 5 }
      ]
    }
  }
}
```

### **Get Motors by Brand**
```http
GET /api/admin-motors/brand/:brand
Authorization: Bearer <admin-token>
```

### **Get User's Motors**
```http
GET /api/admin-motors/user/:userId
Authorization: Bearer <admin-token>
```

### **Get Single Motor**
```http
GET /api/admin-motors/:id
Authorization: Bearer <admin-token>
```

### **Create Motor**
```http
POST /api/admin-motors
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "model": "Honda CBR 600RR",
  "engineDisplacement": 600,
  "power": "80 HP",
  "torque": "60 Nm",
  "fuelTank": 15,
  "fuelConsumption": 20
}
```

### **Update Motor**
```http
PUT /api/admin-motors/:id
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "model": "Honda CBR 600RR Updated",
  "fuelConsumption": 22
}
```

### **Delete Motor** (Soft Delete)
```http
DELETE /api/admin-motors/:id
Authorization: Bearer <admin-token>
```

### **Restore Motor**
```http
PUT /api/admin-motors/restore/:id
Authorization: Bearer <admin-token>
```

---

## 📊 Admin Dashboard (`/api/admin-dashboard`)

All endpoints require admin authentication.

### **Get Admin Dashboard**
```http
GET /api/admin-dashboard/admin
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 100,
      "totalTrips": 500,
      "totalReports": 50,
      "totalGasStations": 33
    },
    "recentActivity": [...],
    "statistics": {
      "users": {...},
      "trips": {...},
      "reports": {...}
    }
  }
}
```

---

## 📝 Admin Reports (`/api/admin-reports`)

All endpoints require admin authentication.

### **Get All Reports**
```http
GET /api/admin-reports?page=1&limit=10&status=pending&type=Accident
Authorization: Bearer <admin-token>
```

**Query Parameters:**
- `page` (number)
- `limit` (number)
- `status` (string) - pending, verified, resolved
- `type` (string) - Accident, Traffic, etc.
- `city` (string)
- `barangay` (string)
- `dateFrom` (date)
- `dateTo` (date)
- `search` (string)

### **Get Single Report**
```http
GET /api/admin-reports/:id
Authorization: Bearer <admin-token>
```

### **Create Report**
```http
POST /api/admin-reports
Authorization: Bearer <admin-token>
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
  "priority": "high"
}
```

### **Update Report**
```http
PUT /api/admin-reports/:id
Authorization: Bearer <admin-token>
```

### **Delete Report**
```http
DELETE /api/admin-reports/:id
Authorization: Bearer <admin-token>
```

### **Verify Report**
```http
PUT /api/admin-reports/:id/verify
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "notes": "Report verified by admin"
}
```

### **Resolve Report**
```http
PUT /api/admin-reports/:id/resolve
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "notes": "Issue resolved",
  "actions": ["Traffic cleared", "Road reopened"]
}
```

### **Archive Report**
```http
PUT /api/admin-reports/:id/archive
Authorization: Bearer <admin-token>
```

### **Reverse Geocode Report**
```http
GET /api/admin-reports/reverse-geocode?lat=14.5995&lng=120.9842
```

### **Auto Reverse Geocode Report**
```http
PUT /api/admin-reports/:id/auto-reverse-geocode
Authorization: Bearer <admin-token>
```

### **Bulk Reverse Geocode Reports**
```http
POST /api/admin-reports/bulk-reverse-geocode
Authorization: Bearer <admin-token>
```

---

## 🗺️ Admin Trips (`/api/admin-trips`)

All endpoints require admin authentication.

### **Get All Trips**
```http
GET /api/admin-trips?page=1&limit=10&userId=user_id&dateFrom=2025-01-01&dateTo=2025-01-31
Authorization: Bearer <admin-token>
```

**Query Parameters:**
- `page` (number)
- `limit` (number)
- `userId` (string) - Filter by user
- `dateFrom` (date)
- `dateTo` (date)
- `search` (string)

### **Get Single Trip**
```http
GET /api/admin-trips/:id
Authorization: Bearer <admin-token>
```

### **Get User Trips**
```http
GET /api/admin-trips/user/:userId
Authorization: Bearer <admin-token>
```

### **Get Trips by Date Range**
```http
GET /api/admin-trips/date-range?startDate=2025-01-01&endDate=2025-01-31
Authorization: Bearer <admin-token>
```

### **Create Trip**
```http
POST /api/admin-trips
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "userId": "user_id",
  "motorId": "motor_id",
  "origin": {
    "address": "Origin Address",
    "coordinates": { "lat": 14.5995, "lng": 120.9842 }
  },
  "destination": {
    "address": "Destination Address",
    "coordinates": { "lat": 14.6042, "lng": 120.9822 }
  },
  "distance": 15.5,
  "duration": 30,
  "startTime": "2025-01-15T10:00:00.000Z",
  "endTime": "2025-01-15T10:30:00.000Z"
}
```

### **Update Trip**
```http
PUT /api/admin-trips/:id
Authorization: Bearer <admin-token>
```

### **Delete Trip**
```http
DELETE /api/admin-trips/:id
Authorization: Bearer <admin-token>
```

---

## ⛽ Admin Gas Stations (`/api/admin-gas-stations`)

All endpoints require admin authentication.

### **Get All Gas Stations**
```http
GET /api/admin-gas-stations?page=1&limit=10&brand=Shell&city=Manila
Authorization: Bearer <admin-token>
```

**Query Parameters:**
- `page` (number)
- `limit` (number)
- `brand` (string)
- `city` (string)
- `search` (string)

### **Get Single Gas Station**
```http
GET /api/admin-gas-stations/:id
Authorization: Bearer <admin-token>
```

### **Get Nearby Gas Stations**
```http
GET /api/admin-gas-stations/nearby?lat=14.5995&lng=120.9842&radius=5000
```

**Query Parameters:**
- `lat` (number, required) - Latitude
- `lng` (number, required) - Longitude
- `radius` (number, default: 5000) - Radius in meters

### **Get Gas Stations by Brand**
```http
GET /api/admin-gas-stations/brand/:brand
Authorization: Bearer <admin-token>
```

### **Get Gas Stations by City**
```http
GET /api/admin-gas-stations/city/:city
Authorization: Bearer <admin-token>
```

### **Get Gas Station Statistics**
```http
GET /api/admin-gas-stations/stats
Authorization: Bearer <admin-token>
```

### **Create Gas Station**
```http
POST /api/admin-gas-stations
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
    "monday": { "open": "06:00", "close": "22:00", "is24Hours": false }
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

### **Update Gas Station**
```http
PUT /api/admin-gas-stations/:id
Authorization: Bearer <admin-token>
```

### **Delete Gas Station**
```http
DELETE /api/admin-gas-stations/:id
Authorization: Bearer <admin-token>
```

### **Update Fuel Prices**
```http
PUT /api/admin-gas-stations/:id/fuel-prices
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "gasoline": {
    "regular": 45.50,
    "premium": 48.00
  },
  "diesel": {
    "regular": 42.00
  }
}
```

### **Verify Gas Station**
```http
PUT /api/admin-gas-stations/:id/verify
Authorization: Bearer <admin-token>
```

### **Archive Gas Station**
```http
PUT /api/admin-gas-stations/:id/archive
Authorization: Bearer <admin-token>
```

### **Reverse Geocode**
```http
GET /api/admin-gas-stations/reverse-geocode?lat=14.5995&lng=120.9842
```

### **Auto Reverse Geocode Station**
```http
PUT /api/admin-gas-stations/:id/auto-reverse-geocode
Authorization: Bearer <admin-token>
```

### **Bulk Reverse Geocode Stations**
```http
POST /api/admin-gas-stations/bulk-reverse-geocode
Authorization: Bearer <admin-token>
```

### **Auto Reverse Geocode All Stations**
```http
POST /api/admin-gas-stations/auto-reverse-geocode-all
Authorization: Bearer <admin-token>
```

---

## 👨‍💼 Admin Management (`/api/admin-management`)

All endpoints require admin authentication.

### **Get All Admins**
```http
GET /api/admin-management?page=1&limit=10&role=admin&isActive=true
Authorization: Bearer <admin-token>
```

**Query Parameters:**
- `page` (number)
- `limit` (number)
- `role` (string)
- `isActive` (boolean)

### **Get Admin Statistics**
```http
GET /api/admin-management/stats
Authorization: Bearer <admin-token>
```

### **Get Single Admin**
```http
GET /api/admin-management/:id
Authorization: Bearer <admin-token>
```

### **Create Admin** (Requires `canManageAdmins` permission)
```http
POST /api/admin-management
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@example.com",
  "password": "admin123",
  "phone": "+1234567890",
  "role": "role_id"
}
```

### **Update Admin** (Requires `canManageAdmins` permission)
```http
PUT /api/admin-management/:id
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "firstName": "Admin",
  "lastName": "User",
  "phone": "+1234567890",
  "isActive": true
}
```

### **Delete Admin** (Requires `canManageAdmins` permission)
```http
DELETE /api/admin-management/:id
Authorization: Bearer <admin-token>
```

### **Get Admin Roles** (Public - No auth required)
```http
GET /api/admin-management/roles
```

**Response:**
```json
{
  "success": true,
  "data": {
    "roles": [
      {
        "_id": "role_id",
        "name": "super_admin",
        "displayName": "Super Admin",
        "description": "Full system access",
        "permissions": {
          "canCreate": true,
          "canRead": true,
          "canUpdate": true,
          "canDelete": true,
          "canManageAdmins": true,
          "canManageUsers": true,
          "canViewAnalytics": true
        },
        "level": 1
      }
    ]
  }
}
```

### **Change Admin Password**
```http
PUT /api/admin-management/:id/change-password
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "newPassword": "newpassword123"
}
```

### **Change Own Password**
```http
PUT /api/admin-management/change-password
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

### **Reset Admin Password** (Requires Super Admin)
```http
PUT /api/admin-management/:id/reset-password
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "newPassword": "newpassword123"
}
```

---

## 🚗 User Trip Endpoints (`/api/trips`)

### **Get All Trips** (Public)
```http
GET /api/trips
```

### **Get Paginated Trips** (Public)
```http
GET /api/trips/paginate?page=1&limit=10
```

### **Get User Trips** (Auth Required)
```http
GET /api/trips/user/:userId
Authorization: Bearer <token>
```

### **Get Trip Analytics** (Public)
```http
GET /api/trips/analytics/summary
GET /api/trips/analytics/monthly
```

### **Get Trip Insights** (Public)
```http
GET /api/trips/insights/top-users
GET /api/trips/insights/top-motors
```

### **Get Single Trip** (Auth Required)
```http
GET /api/trips/:id
Authorization: Bearer <token>
```

### **Create Trip** (Auth Required)
```http
POST /api/trips
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "userId": "user_id",
  "motorId": "motor_id",
  "origin": {
    "address": "Origin Address",
    "coordinates": { "lat": 14.5995, "lng": 120.9842 }
  },
  "destination": {
    "address": "Destination Address",
    "coordinates": { "lat": 14.6042, "lng": 120.9822 }
  },
  "distance": 15.5,
  "duration": 30,
  "startTime": "2025-01-15T10:00:00.000Z",
  "endTime": "2025-01-15T10:30:00.000Z",
  "route": [
    { "lat": 14.5995, "lng": 120.9842 },
    { "lat": 14.6042, "lng": 120.9822 }
  ]
}
```

### **Add Route Point** (Auth Required)
```http
POST /api/trips/:id/route-points
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "lat": 14.6010,
  "lng": 120.9830
}
```

### **Add Expense** (Auth Required)
```http
POST /api/trips/:id/expenses
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "type": "fuel",
  "amount": 500,
  "description": "Fuel refill",
  "date": "2025-01-15T10:30:00.000Z"
}
```

---

## 📋 User Reports (`/api/reports`)

### **Get All Reports** (Public)
```http
GET /api/reports?page=1&limit=10&status=pending&type=Accident&city=Manila
```

**Query Parameters:**
- `page` (number)
- `limit` (number)
- `status` (string) - pending, verified, resolved
- `type` (string)
- `city` (string)
- `barangay` (string)
- `dateFrom` (date)
- `dateTo` (date)
- `search` (string)

### **Get Report Statistics** (Public)
```http
GET /api/reports/stats
```

### **Get Reports by Location** (Public)
```http
GET /api/reports/location?lat=14.5995&lng=120.9842&radius=5000
```

### **Get Single Report** (Public)
```http
GET /api/reports/:id
```

### **Create Report** (Auth Required)
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
  "attachments": []
}
```

### **Add Comment** (Auth Required)
```http
POST /api/reports/:id/comments
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "comment": "This is a comment"
}
```

---

## ⛽ Gas Stations (`/api/gas-stations`)

### **Get All Gas Stations** (Public)
```http
GET /api/gas-stations?page=1&limit=10&brand=Shell&city=Manila
```

### **Get Nearby Gas Stations** (Public)
```http
GET /api/gas-stations/nearby?lat=14.5995&lng=120.9842&radius=5000
```

### **Get Gas Stations by Brand** (Public)
```http
GET /api/gas-stations/brand/:brand
```

### **Get Gas Stations by City** (Public)
```http
GET /api/gas-stations/city/:city
```

### **Get Gas Station Statistics** (Public)
```http
GET /api/gas-stations/stats
```

### **Get Single Gas Station** (Public)
```http
GET /api/gas-stations/:id
```

### **Get Fuel Price Trends** (Public)
```http
GET /api/gas-stations/:id/price-trends
```

### **Add Review** (Auth Required)
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

---

## ⛽ Fuel Logs (`/api/fuel-logs`)

### **Get All Fuel Logs** (Public)
```http
GET /api/fuel-logs
```

### **Get Fuel Log Count** (Public)
```http
GET /api/fuel-logs/count
```

**Response:**
```json
{
  "totalFuelLogs": 150
}
```

### **Get Fuel Logs by User**
```http
GET /api/fuel-logs/:userId
```

**Response:**
```json
{
  "fuelLogs": [
    {
      "_id": "log_id",
      "userId": "user_id",
      "motorId": "motor_id",
      "motor": {
        "model": "Honda CBR 600RR",
        "nickname": "My Bike"
      },
      "liters": 10.5,
      "pricePerLiter": 45.50,
      "totalCost": 477.75,
      "notes": "Full tank refill",
      "date": "2025-01-15T10:30:00.000Z",
      "createdAt": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

### **Create Fuel Log** (Auth Required)
```http
POST /api/fuel-logs
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "userId": "user_id",
  "motorId": "motor_id",
  "liters": 10.5,
  "pricePerLiter": 45.50,
  "notes": "Full tank refill"
}
```

**Response:**
```json
{
  "message": "Fuel log created successfully",
  "fuelLog": {
    "_id": "log_id",
    "userId": "user_id",
    "motorId": "motor_id",
    "liters": 10.5,
    "pricePerLiter": 45.50,
    "totalCost": 477.75,
    "date": "2025-01-15T10:30:00.000Z"
  }
}
```

### **Update Fuel Log** (Auth Required)
```http
PUT /api/fuel-logs/:id
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "liters": 12.0,
  "pricePerLiter": 46.00,
  "notes": "Updated notes"
}
```

### **Delete Fuel Log** (Auth Required)
```http
DELETE /api/fuel-logs/:id
Authorization: Bearer <token>
```

### **Admin Analytics - Fuel Overview**
```http
GET /api/fuel-logs/admin/overview
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "totalLogs": 150,
  "totalLiters": 1250.5,
  "totalSpent": 56847.75
}
```

### **Admin Analytics - Average Fuel per Motor**
```http
GET /api/fuel-logs/admin/avg-per-motor
Authorization: Bearer <admin-token>
```

### **Admin Analytics - Top Fuel Spenders**
```http
GET /api/fuel-logs/admin/top-spenders
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "topSpenders": [
    {
      "userId": "user_id",
      "user": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "totalSpent": 5000.00,
      "totalLiters": 110.5
    }
  ]
}
```

### **Admin Analytics - Monthly Fuel Usage**
```http
GET /api/fuel-logs/admin/monthly-usage
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "monthlyUsage": [
    {
      "month": "2025-01",
      "totalLiters": 500.5,
      "totalCost": 22773.75
    }
  ]
}
```

---

## 🔧 Fuel Management (`/api/fuel`)

### **Get Combined Fuel Data**
```http
GET /api/fuel/combined?userId=user_id&motorId=motor_id
```

### **Get Fuel Efficiency Analytics**
```http
GET /api/fuel/efficiency?userId=user_id&motorId=motor_id
```

### **Get Fuel Cost Analysis**
```http
GET /api/fuel/cost-analysis?userId=user_id&motorId=motor_id&period=30d
```

### **Calculate Fuel Consumption**
```http
POST /api/fuel/calculate
```

**Request Body:**
```json
{
  "distance": 100,
  "fuelUsed": 5.5,
  "motorId": "motor_id"
}
```

### **Calculate Fuel After Refuel**
```http
POST /api/fuel/calculate-after-refuel
```

**Request Body:**
```json
{
  "currentFuelLevel": 5.0,
  "refuelAmount": 10.0,
  "tankCapacity": 15.0
}
```

### **Calculate Drivable Distance**
```http
POST /api/fuel/calculate-drivable-distance
```

**Request Body:**
```json
{
  "currentFuelLevel": 10.0,
  "fuelConsumption": 20
}
```

---

## 📊 Fuel Stats (`/api/fuel-stats`)

### **Get Fuel Stats by Motor**
```http
GET /api/fuel-stats/:motorId
```

**Response:**
```json
{
  "motorId": "motor_id",
  "totalLiters": 150.5,
  "totalCost": 6847.75,
  "averagePrice": 45.50,
  "averageEfficiency": 18.5,
  "totalDistance": 2784.25
}
```

---

## 🛠️ Maintenance Records (`/api/maintenance-records`)

### **Get All Maintenance Records**
```http
GET /api/maintenance-records?userId=user_id&motorId=motor_id
```

**Query Parameters:**
- `userId` (string) - Filter by user
- `motorId` (string) - Filter by motor
- `type` (string) - Filter by type (oil_change, tire_rotation, brake_service, other)

### **Get Maintenance Records by Motor**
```http
GET /api/maintenance-records/motor/:motorId
```

### **Get Single Maintenance Record**
```http
GET /api/maintenance-records/:id
```

### **Create Maintenance Record** (Auth Required)
```http
POST /api/maintenance-records
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "userId": "user_id",
  "motorId": "motor_id",
  "type": "oil_change",
  "description": "Regular oil change",
  "cost": 500,
  "mileage": 5000,
  "nextServiceDate": "2025-04-15T10:00:00.000Z",
  "serviceDate": "2025-01-15T10:00:00.000Z"
}
```

### **Update Maintenance Record** (Auth Required)
```http
PUT /api/maintenance-records/:id
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "description": "Updated description",
  "cost": 600,
  "nextServiceDate": "2025-05-15T10:00:00.000Z"
}
```

### **Delete Maintenance Record** (Auth Required)
```http
DELETE /api/maintenance-records/:id
Authorization: Bearer <token>
```

### **Get Maintenance Analytics**
```http
GET /api/maintenance-records/analytics/summary?userId=user_id
```

**Response:**
```json
{
  "totalRecords": 25,
  "totalCost": 12500,
  "byType": {
    "oil_change": 10,
    "tire_rotation": 5,
    "brake_service": 7,
    "other": 3
  },
  "upcomingServices": [
    {
      "motorId": "motor_id",
      "nextServiceDate": "2025-02-15T10:00:00.000Z",
      "type": "oil_change"
    }
  ]
}
```

---

## 🔔 Notifications (`/api/notifications`)

### **Get All Notifications** (Public for testing)
```http
GET /api/notifications
```

### **Get User Notifications**
```http
GET /api/notifications/:userId
```

**Query Parameters:**
- `isRead` (boolean) - Filter by read status
- `type` (string) - Filter by type (trip, fuel, maintenance, system)

**Response:**
```json
{
  "notifications": [
    {
      "_id": "notification_id",
      "userId": "user_id",
      "type": "trip",
      "title": "Trip Completed",
      "message": "Your trip has been completed successfully",
      "isRead": false,
      "metadata": {
        "tripId": "trip_id"
      },
      "createdAt": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

### **Create Notification** (Auth Required)
```http
POST /api/notifications
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "userId": "user_id",
  "type": "trip",
  "title": "Trip Completed",
  "message": "Your trip has been completed successfully",
  "metadata": {
    "tripId": "trip_id"
  }
}
```

### **Mark Notification as Read** (Auth Required)
```http
PUT /api/notifications/read/:id
Authorization: Bearer <token>
```

### **Delete Notification** (Auth Required)
```http
DELETE /api/notifications/:id
Authorization: Bearer <token>
```

---

## 🏍️ Motorcycle Management (`/api/motorcycles`)

### **Get All Motorcycles**
```http
GET /api/motorcycles
```

**Response:**
```json
{
  "motorcycles": [
    {
      "_id": "motorcycle_id",
      "model": "Honda CBR 600RR",
      "engineDisplacement": 600,
      "power": "80 HP",
      "torque": "60 Nm",
      "fuelTank": 15,
      "fuelConsumption": 20,
      "isDeleted": false,
      "createdAt": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

### **Get All Motorcycles (Including Deleted)** (Admin)
```http
GET /api/motorcycles/all
```

### **Get Motorcycle Count**
```http
GET /api/motorcycles/count
```

### **Get Single Motorcycle**
```http
GET /api/motorcycles/:id
```

### **Create Motorcycle** (Auth Required)
```http
POST /api/motorcycles
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "model": "Yamaha R1",
  "engineDisplacement": 998,
  "power": "200 HP",
  "torque": "112 Nm",
  "fuelTank": 17,
  "fuelConsumption": 15
}
```

### **Update Motorcycle** (Auth Required)
```http
PUT /api/motorcycles/:id
Authorization: Bearer <token>
```

### **Delete Motorcycle** (Soft Delete) (Auth Required)
```http
DELETE /api/motorcycles/:id
Authorization: Bearer <token>
```

### **Restore Motorcycle** (Auth Required)
```http
PUT /api/motorcycles/restore/:id
Authorization: Bearer <token>
```

---

## 🚗 User Motors (`/api/user-motors`)

### **Get All User Motors**
```http
GET /api/user-motors
```

### **Get User Motor Count**
```http
GET /api/user-motors/count
```

### **Get User Motors by User ID**
```http
GET /api/user-motors/user/:id
```

### **Get Single User Motor**
```http
GET /api/user-motors/:id
```

### **Create User Motor** (Auth Required)
```http
POST /api/user-motors
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "userId": "user_id",
  "motorcycleId": "motorcycle_id",
  "nickname": "My Bike",
  "brand": "Honda",
  "model": "CBR 600RR",
  "year": 2023,
  "color": "Red",
  "licensePlate": "ABC-1234",
  "fuelTank": 15,
  "fuelConsumption": 20,
  "currentFuelLevel": 10,
  "odometer": 5000
}
```

### **Update User Motor** (Auth Required)
```http
PUT /api/user-motors/:id
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "nickname": "Updated Nickname",
  "currentFuelLevel": 12,
  "odometer": 5500
}
```

### **Update Fuel Level** (Auth Required)
```http
PUT /api/user-motors/:id/fuel
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentFuelLevel": 10.5
}
```

### **Update Efficiency** (Auth Required)
```http
PUT /api/user-motors/:id/updateEfficiency
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "fuelConsumption": 22
}
```

### **Delete User Motor** (Auth Required)
```http
DELETE /api/user-motors/:id
Authorization: Bearer <token>
```

### **Get User Overview Analytics**
```http
GET /api/user-motors/user-overview/:userId
```

**Response:**
```json
{
  "userId": "user_id",
  "totalMotors": 2,
  "totalDistance": 5000,
  "totalFuelUsed": 250,
  "averageEfficiency": 20
}
```

### **Get Motor Overview Analytics**
```http
GET /api/user-motors/motor-overview/:motorId
```

### **Log Oil Change** (Auth Required)
```http
POST /api/user-motors/:id/oil-change
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "date": "2025-01-15T10:00:00.000Z",
  "mileage": 5000,
  "cost": 500,
  "notes": "Regular oil change"
}
```

### **Log Tune Up** (Auth Required)
```http
POST /api/user-motors/:id/tune-up
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "date": "2025-01-15T10:00:00.000Z",
  "mileage": 10000,
  "cost": 1000,
  "notes": "Full tune up"
}
```

### **Recalculate All Motor Analytics** (Admin)
```http
PUT /api/user-motors/fix-motor-analytics
Authorization: Bearer <admin-token>
```

---

## 📍 Saved Destinations (`/api/saved-destinations`)

### **Get User Destinations**
```http
GET /api/saved-destinations/:userId
```

**Response:**
```json
{
  "destinations": [
    {
      "_id": "destination_id",
      "userId": "user_id",
      "name": "Home",
      "address": "123 Main St, Manila",
      "location": {
        "lat": 14.5995,
        "lng": 120.9842
      },
      "isFavorite": true,
      "createdAt": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

### **Add Destination** (Auth Required)
```http
POST /api/saved-destinations
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "userId": "user_id",
  "name": "Home",
  "address": "123 Main St, Manila",
  "location": {
    "lat": 14.5995,
    "lng": 120.9842
  },
  "isFavorite": true
}
```

### **Update Destination** (Auth Required)
```http
PUT /api/saved-destinations/:id
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Home Updated",
  "isFavorite": false
}
```

### **Delete Destination** (Auth Required)
```http
DELETE /api/saved-destinations/:id
Authorization: Bearer <token>
```

---

## 📊 Analytics Endpoints

### **Analytics** (`/api/analytics`)

#### **Generate Daily Analytics**
```http
GET /api/analytics/generate-daily
```

#### **Get Motor Daily Analytics History**
```http
GET /api/analytics/daily-history/:motorId
```

#### **Get User Analytics Timeline**
```http
GET /api/analytics/user-timeline/:userId
```

#### **Get User Fuel Log Trend**
```http
GET /api/analytics/fuel-log-trend/:userId
```

### **Daily Analytics** (`/api/daily-analytics`)

#### **Get Motor Daily Analytics**
```http
GET /api/daily-analytics/:motorId
```

**Response:**
```json
{
  "motorId": "motor_id",
  "dailyAnalytics": [
    {
      "date": "2025-01-15",
      "distance": 100,
      "fuelUsed": 5.0,
      "efficiency": 20,
      "trips": 5
    }
  ]
}
```

### **General Analytics** (`/api/general-analytics`)

#### **Get All Analytics**
```http
GET /api/general-analytics
```

#### **Get Analytics by Key**
```http
GET /api/general-analytics/:key
```

**Response:**
```json
{
  "key": "user_growth",
  "value": {
    "totalUsers": 100,
    "growthRate": 15.5
  },
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

#### **Create or Update Analytics**
```http
POST /api/general-analytics
```

**Request Body:**
```json
{
  "key": "user_growth",
  "value": {
    "totalUsers": 100,
    "growthRate": 15.5
  }
}
```

### **Leaderboard Analytics** (`/api/leaderboard-analytics`)

#### **Get Leaderboard Data**
```http
GET /api/leaderboard-analytics?type=users&period=30d
```

**Query Parameters:**
- `type` (string) - users, trips, fuel, distance
- `period` (string) - 7d, 30d, 90d, all

---

## 📊 Dashboard Endpoints (`/api/dashboard`)

### **Get Dashboard Overview** (Auth Required)
```http
GET /api/dashboard/overview
Authorization: Bearer <token>
```

**Response:**
```json
{
  "overview": {
    "totalTrips": 50,
    "totalDistance": 2500,
    "totalFuelCost": 5000,
    "activeMotors": 2
  }
}
```

### **Get Dashboard Statistics** (Auth Required)
```http
GET /api/dashboard/stats?period=30d
Authorization: Bearer <token>
```

**Query Parameters:**
- `period` (string) - 7d, 30d, 90d, all

### **Get Dashboard Analytics** (Auth Required)
```http
GET /api/dashboard/analytics?type=trips&period=30d
Authorization: Bearer <token>
```

---

## ⚙️ Admin Settings (`/api/admin-settings`)

All endpoints require admin authentication.

### **Get Dashboard Settings**
```http
GET /api/admin-settings/dashboard-settings
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "widgets": ["users", "trips", "reports", "gasStations"],
    "refreshInterval": 30000,
    "defaultPeriod": "30d"
  }
}
```

### **Update Dashboard Settings**
```http
PUT /api/admin-settings/dashboard-settings
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "widgets": ["users", "trips", "reports"],
  "refreshInterval": 60000,
  "defaultPeriod": "7d"
}
```

### **Get System Statistics**
```http
GET /api/admin-settings/system-stats
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 100,
    "totalAdmins": 5,
    "totalTrips": 500,
    "totalReports": 50,
    "systemUptime": "7 days",
    "databaseSize": "250 MB"
  }
}
```

### **Get Activity Summary**
```http
GET /api/admin-settings/activity-summary?period=30d
Authorization: Bearer <admin-token>
```

### **Reset Admin Password**
```http
PUT /api/admin-settings/reset-password/:adminId
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "newPassword": "newpassword123"
}
```

---

## 📋 Admin Logs (`/api/admin-logs`)

All endpoints require admin authentication.

### **Get All Admin Logs**
```http
GET /api/admin-logs?page=1&limit=50&adminId=admin_id&action=CREATE&resource=USER
Authorization: Bearer <admin-token>
```

**Query Parameters:**
- `page` (number)
- `limit` (number)
- `adminId` (string) - Filter by admin
- `action` (string) - CREATE, UPDATE, DELETE, READ
- `resource` (string) - USER, MOTOR, TRIP, REPORT, etc.
- `startDate` (date)
- `endDate` (date)

**Response:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "_id": "log_id",
        "adminId": "admin_id",
        "admin": {
          "name": "Admin User",
          "email": "admin@example.com"
        },
        "action": "CREATE",
        "resource": "USER",
        "resourceId": "user_id",
        "changes": {
          "before": null,
          "after": {
            "email": "john@example.com"
          }
        },
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0...",
        "createdAt": "2025-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "current": 1,
      "pages": 10,
      "total": 500
    }
  }
}
```

### **Get Admin Logs Statistics**
```http
GET /api/admin-logs/stats
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalLogs": 1000,
    "byAction": {
      "CREATE": 200,
      "UPDATE": 500,
      "DELETE": 100,
      "READ": 200
    },
    "byResource": {
      "USER": 300,
      "MOTOR": 250,
      "TRIP": 200,
      "REPORT": 250
    },
    "byAdmin": [
      {
        "adminId": "admin_id",
        "count": 500
      }
    ]
  }
}
```

### **Get Single Admin Log**
```http
GET /api/admin-logs/:id
Authorization: Bearer <admin-token>
```

### **Delete Admin Log** (Requires `canManageAdmins` permission)
```http
DELETE /api/admin-logs/:id
Authorization: Bearer <admin-token>
```

### **Clean Old Logs** (Requires `canManageAdmins` permission)
```http
POST /api/admin-logs/clean
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "daysToKeep": 90
}
```

---

## 📊 Admin Statistics Endpoints

### **User Statistics** (`/api/admin-user-stats`)

All endpoints require admin authentication.

#### **Get Total Users**
```http
GET /api/admin-user-stats/total
Authorization: Bearer <admin-token>
```

#### **Get Users This Month**
```http
GET /api/admin-user-stats/this-month
Authorization: Bearer <admin-token>
```

#### **Get User Statistics**
```http
GET /api/admin-user-stats/statistics
Authorization: Bearer <admin-token>
```

#### **Get User Growth**
```http
GET /api/admin-user-stats/growth?period=30d
Authorization: Bearer <admin-token>
```

### **Motor Statistics** (`/api/admin-motor-stats`)

All endpoints require admin authentication.

#### **Get Total Motors**
```http
GET /api/admin-motor-stats/total
Authorization: Bearer <admin-token>
```

#### **Get Total Motor Models**
```http
GET /api/admin-motor-stats/models
Authorization: Bearer <admin-token>
```

#### **Get Motor Statistics**
```http
GET /api/admin-motor-stats/statistics
Authorization: Bearer <admin-token>
```

#### **Get Motor Growth**
```http
GET /api/admin-motor-stats/growth?period=30d
Authorization: Bearer <admin-token>
```

#### **Get Motor Models List**
```http
GET /api/admin-motor-stats/models-list
Authorization: Bearer <admin-token>
```

---

## 🔧 Setup Endpoints (`/api/setup`)

Public endpoints - No authentication required.

### **Check Setup Status**
```http
GET /api/setup/status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isSetupComplete": false,
    "hasAdmin": false,
    "hasRoles": false
  }
}
```

### **Get Available Roles**
```http
GET /api/setup/roles
```

**Response:**
```json
{
  "success": true,
  "data": {
    "roles": [
      {
        "_id": "role_id",
        "name": "super_admin",
        "displayName": "Super Admin",
        "description": "Full system access",
        "permissions": {...}
      }
    ]
  }
}
```

### **Create First Admin**
```http
POST /api/setup/first-admin
```

**Request Body:**
```json
{
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@trafficslight.com",
  "password": "admin123",
  "phone": "+1234567890",
  "role": "super_admin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "First admin created successfully",
  "data": {
    "admin": {
      "id": "admin_id",
      "email": "admin@trafficslight.com"
    },
    "token": "jwt_token"
  }
}
```

---

## 🛠️ Utility Endpoints

### **Calculations** (`/api/calculations`)

#### **Calculate Distance**
```http
POST /api/calculations/distance
```

**Request Body:**
```json
{
  "origin": { "lat": 14.5995, "lng": 120.9842 },
  "destination": { "lat": 14.6042, "lng": 120.9822 }
}
```

#### **Calculate Fuel Consumption**
```http
POST /api/calculations/fuel-consumption
```

**Request Body:**
```json
{
  "distance": 100,
  "fuelUsed": 5.0,
  "motorId": "motor_id"
}
```

#### **Calculate Trip Statistics**
```http
POST /api/calculations/trip-statistics
```

### **Data Processing** (`/api/data`)

#### **Filter and Aggregate**
```http
POST /api/data/filter-aggregate
```

#### **Get Aggregated Data**
```http
GET /api/data/aggregated
```

#### **Get Aggregated Cached Data**
```http
GET /api/data/aggregated-cached
```

### **Cache Management** (`/api/cache`)

#### **Get Cache Performance**
```http
GET /api/cache/cache-performance
```

#### **Predictive Analysis**
```http
POST /api/cache/predictive-analysis
```

### **Location Processing** (`/api/location`)

#### **Process Background Location**
```http
POST /api/location/process-background
```

#### **Snap to Roads**
```http
POST /api/location/snap-roads
```

### **Map Processing** (`/api/map`)

#### **Cluster Markers**
```http
POST /api/map/cluster-markers
```

#### **Process Markers**
```http
POST /api/map/process-markers
```

#### **Apply Map Filters**
```http
POST /api/map/apply-filters
```

#### **Snap to Roads**
```http
POST /api/map/snap-to-roads
```

### **Route Processing** (`/api/routes`)

#### **Process Directions**
```http
POST /api/routes/process-directions
```

#### **Process Traffic Analysis**
```http
POST /api/routes/process-traffic-analysis
```

#### **Process Routes**
```http
POST /api/routes/process
```

### **Tracking** (`/api/tracking`)

#### **Process Location Update**
```http
POST /api/tracking/process-location
```

### **Performance** (`/api/performance`)

#### **Monitor Performance**
```http
POST /api/performance/monitor
```

### **Motor Analytics** (`/api/motor`)

#### **Process Motor Analytics**
```http
POST /api/motor/analytics-processing
```

#### **Get Motor Analytics Aggregated**
```http
GET /api/motor/analytics-aggregated
```

### **Permissions** (`/api/permissions`)

#### **Manage Location Permissions**
```http
POST /api/permissions/location-management
```

---

## 📍 Tracking Routes (`/api/tracking`)

### **Start Trip**
```http
POST /api/tracking/start-trip
```

**Request Body:**
```json
{
  "userId": "user_id",
  "motorId": "motor_id",
  "origin": {
    "lat": 14.5995,
    "lng": 120.9842
  },
  "destination": {
    "lat": 14.6042,
    "lng": 120.9822
  }
}
```

### **Update Location**
```http
POST /api/tracking/update-location
```

**Request Body:**
```json
{
  "userId": "user_id",
  "tripId": "trip_id",
  "location": {
    "lat": 14.6010,
    "lng": 120.9830
  },
  "speed": 50,
  "heading": 90
}
```

### **Get Nearby Gas Stations**
```http
GET /api/tracking/nearby-gas?lat=14.5995&lng=120.9842&radius=5000
```

**Query Parameters:**
- `lat` (number, required) - Latitude
- `lng` (number, required) - Longitude
- `radius` (number, default: 5000) - Radius in meters

---

## 🏪 Gas Stations Additional Endpoints (`/api/gas-stations`)

### **Import Gas Stations from Google**
```http
GET /api/gas-stations/import?location=Manila&radius=10000
```

**Query Parameters:**
- `location` (string, required) - Location name
- `radius` (number, default: 10000) - Search radius in meters

### **Get Gas Station Analytics**
```http
GET /api/gas-stations/analytics
```

### **Get Price History by Station**
```http
GET /api/gas-stations/history/:id
```

**Response:**
```json
{
  "gasStationId": "station_id",
  "priceHistory": [
    {
      "date": "2025-01-15T10:30:00.000Z",
      "gasoline": {
        "regular": 45.50,
        "premium": 48.00
      },
      "diesel": {
        "regular": 42.00
      }
    }
  ]
}
```

---

## 🗺️ Geography Endpoints (`/api/geography`)

### **Get Geography Data**
```http
GET /api/geography?city=Manila&province=Metro Manila
```

**Query Parameters:**
- `city` (string) - Filter by city
- `province` (string) - Filter by province

### **Get Barangay Data**
```http
GET /api/geography/barangay/:barangay
```

### **Get Geography Statistics**
```http
GET /api/geography/statistics?city=Manila
```

---

## 🔍 Search Endpoints (`/api/search`)

### **Search Users**
```http
GET /api/search/users?q=john&limit=10
```

**Query Parameters:**
- `q` (string, required) - Search query
- `limit` (number, default: 10)

### **Search Reports**
```http
GET /api/search/reports?q=accident&status=pending&limit=10
```

**Query Parameters:**
- `q` (string, required) - Search query
- `status` (string) - Filter by status
- `limit` (number, default: 10)

### **Search Gas Stations**
```http
GET /api/search/gas-stations?q=shell&city=Manila&limit=10
```

**Query Parameters:**
- `q` (string, required) - Search query
- `city` (string) - Filter by city
- `limit` (number, default: 10)

### **Search Motorcycles**
```http
GET /api/search/motorcycles?q=honda&limit=10
```

**Query Parameters:**
- `q` (string, required) - Search query
- `limit` (number, default: 10)

### **Search Trips**
```http
GET /api/search/trips?q=manila&userId=user_id&limit=10
```

**Query Parameters:**
- `q` (string, required) - Search query
- `userId` (string) - Filter by user
- `limit` (number, default: 10)

---

## 📥 Export Endpoints (`/api/export`)

### **Export Users**
```http
GET /api/export/users?format=csv&city=Manila
```

**Query Parameters:**
- `format` (string, default: csv) - csv, json, xlsx
- `city` (string) - Filter by city
- `province` (string) - Filter by province
- `startDate` (date) - Start date filter
- `endDate` (date) - End date filter

### **Export Reports**
```http
GET /api/export/reports?format=json&status=pending
```

**Query Parameters:**
- `format` (string, default: csv) - csv, json, xlsx
- `status` (string) - Filter by status
- `type` (string) - Filter by type
- `startDate` (date) - Start date filter
- `endDate` (date) - End date filter

### **Export Gas Stations**
```http
GET /api/export/gas-stations?format=xlsx&brand=Shell
```

**Query Parameters:**
- `format` (string, default: csv) - csv, json, xlsx
- `brand` (string) - Filter by brand
- `city` (string) - Filter by city

### **Export Trips**
```http
GET /api/export/trips?format=csv&userId=user_id&startDate=2025-01-01&endDate=2025-01-31
```

**Query Parameters:**
- `format` (string, default: csv) - csv, json, xlsx
- `userId` (string) - Filter by user
- `startDate` (date) - Start date filter
- `endDate` (date) - End date filter

---

## 📤 Upload Endpoints (`/api/upload`)

### **Upload Image**
```http
POST /api/upload/images
Content-Type: multipart/form-data
```

**Form Data:**
- `image` (file, required) - Image file

**Response:**
```json
{
  "success": true,
  "url": "https://example.com/uploads/image.jpg",
  "filename": "image.jpg"
}
```

### **Upload Document**
```http
POST /api/upload/documents
Content-Type: multipart/form-data
```

**Form Data:**
- `document` (file, required) - Document file

### **Upload Multiple Files**
```http
POST /api/upload/multiple
Content-Type: multipart/form-data
```

**Form Data:**
- `files` (files, max 5) - Array of files

**Response:**
```json
{
  "success": true,
  "files": [
    {
      "url": "https://example.com/uploads/file1.jpg",
      "filename": "file1.jpg"
    }
  ]
}
```

### **Get Uploaded File**
```http
GET /api/upload/:filename
```

### **Delete Uploaded File**
```http
DELETE /api/upload/:filename
```

---

## ⚙️ Settings Endpoints (`/api/settings`)

### **Get Settings**
```http
GET /api/settings
Authorization: Bearer <token>
```

### **Update Settings**
```http
PUT /api/settings
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "notifications": {
    "email": true,
    "push": true,
    "sms": false
  },
  "units": "metric",
  "language": "en",
  "theme": "auto"
}
```

### **Get Theme Settings**
```http
GET /api/settings/theme
Authorization: Bearer <token>
```

### **Update Theme Settings**
```http
PUT /api/settings/theme
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "theme": "dark",
  "primaryColor": "#3b82f6",
  "secondaryColor": "#10b981"
}
```

---

## 🔄 Gas Sessions (`/api/gas-sessions`)

### **Create Gas Session**
```http
POST /api/gas-sessions
```

**Request Body:**
```json
{
  "userId": "user_id",
  "gasStationId": "station_id",
  "motorId": "motor_id",
  "fuelType": "gasoline",
  "liters": 10.5,
  "pricePerLiter": 45.50,
  "totalCost": 477.75
}
```

### **Get All Gas Sessions**
```http
GET /api/gas-sessions/all
```

### **Get Gas Sessions by User**
```http
GET /api/gas-sessions/:userId
```

### **Get Total Gas Consumption**
```http
GET /api/gas-sessions/gasConsumption
```

**Response:**
```json
{
  "totalFuelUsed": 1250.5
}
```

### **Get Gas Sessions Count**
```http
GET /api/gas-sessions
```

**Response:**
```json
{
  "count": 150
}
```

---

## 👑 General Admin Routes (`/api/admin`)

All endpoints require admin authentication.

### **Get All Admins**
```http
GET /api/admin?page=1&limit=10&search=admin&role=super_admin&isActive=true
Authorization: Bearer <admin-token>
```

**Query Parameters:**
- `page` (number)
- `limit` (number)
- `search` (string) - Search in firstName, lastName, email
- `role` (string) - Filter by role
- `isActive` (boolean) - Filter by active status

### **Get Admin Statistics**
```http
GET /api/admin/stats
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overall": {
      "totalAdmins": 5,
      "activeAdmins": 5,
      "verifiedAdmins": 5,
      "avgLogins": 10
    },
    "roleDistribution": [
      {
        "role": {
          "name": "super_admin",
          "displayName": "Super Admin"
        },
        "count": 2
      }
    ]
  }
}
```

### **Get Admin Roles**
```http
GET /api/admin/roles
Authorization: Bearer <admin-token>
```

### **Create Admin Role**
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

### **Get Single Admin**
```http
GET /api/admin/:id
Authorization: Bearer <admin-token>
```

### **Create Admin**
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
  "phone": "+1234567890",
  "role": "role_id"
}
```

### **Update Admin**
```http
PUT /api/admin/:id
Authorization: Bearer <admin-token>
```

### **Update Admin Role**
```http
PUT /api/admin/roles/:id
Authorization: Bearer <admin-token>
```

### **Delete Admin**
```http
DELETE /api/admin/:id
Authorization: Bearer <admin-token>
```

### **Delete Admin Role**
```http
DELETE /api/admin/roles/:id
Authorization: Bearer <admin-token>
```

---

## 🔐 Alternative Admin Auth (`/api/admin-auth-alt`)

This is an alternative admin authentication endpoint (same functionality as `/api/admin-auth`).

### **Admin Login**
```http
POST /api/admin-auth-alt/login
```

**Request Body:**
```json
{
  "email": "admin@trafficslight.com",
  "password": "admin123"
}
```

### **Admin Register**
```http
POST /api/admin-auth-alt/register
```

---

## 🚗 Trip Optimization Routes (`/api/trip`)

Note: This is different from `/api/trips`. These are optimization-specific endpoints.

### **Process Trip Optimization**
```http
POST /api/trip/optimize
```

**Request Body:**
```json
{
  "origin": {
    "lat": 14.5995,
    "lng": 120.9842
  },
  "destination": {
    "lat": 14.6042,
    "lng": 120.9822
  },
  "waypoints": [
    {
      "lat": 14.6010,
      "lng": 120.9830
    }
  ],
  "preferences": {
    "avoidTolls": false,
    "avoidHighways": false,
    "optimizeFor": "time"
  }
}
```

---

## 📊 Data Models

### **User Model**
```json
{
  "_id": "ObjectId",
  "firstName": "String (required)",
  "lastName": "String (required)",
  "name": "String (auto-generated)",
  "email": "String (required, unique)",
  "password": "String (hashed, required)",
  "phone": "String",
  "street": "String",
  "barangay": "String",
  "city": "String",
  "province": "String",
  "location": {
    "type": "Point",
    "coordinates": [Number, Number] // [lng, lat]
  },
  "isActive": "Boolean (default: true)",
  "isVerified": "Boolean (default: false)",
  "preferences": {
    "units": "String (default: 'metric')",
    "language": "String (default: 'en')",
    "notifications": "Boolean (default: true)",
    "theme": "String"
  },
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### **Admin Model**
```json
{
  "_id": "ObjectId",
  "firstName": "String (required)",
  "lastName": "String (required)",
  "email": "String (required, unique)",
  "password": "String (hashed, required)",
  "phone": "String",
  "role": "ObjectId (ref: AdminRole)",
  "isActive": "Boolean (default: true)",
  "lastLogin": "Date",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### **Motor Model**
```json
{
  "_id": "ObjectId",
  "model": "String (required)",
  "engineDisplacement": "Number",
  "power": "String",
  "torque": "String",
  "fuelTank": "Number",
  "fuelConsumption": "Number (required)",
  "isDeleted": "Boolean (default: false)",
  "deletedAt": "Date",
  "deletedBy": "ObjectId",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### **Trip Model**
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: User, required)",
  "motorId": "ObjectId (ref: Motor)",
  "origin": {
    "address": "String",
    "coordinates": {
      "lat": "Number",
      "lng": "Number"
    }
  },
  "destination": {
    "address": "String",
    "coordinates": {
      "lat": "Number",
      "lng": "Number"
    }
  },
  "distance": "Number",
  "duration": "Number",
  "startTime": "Date",
  "endTime": "Date",
  "route": [
    {
      "lat": "Number",
      "lng": "Number"
    }
  ],
  "expenses": [
    {
      "type": "String",
      "amount": "Number",
      "description": "String",
      "date": "Date"
    }
  ],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### **Report Model**
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: User)",
  "reportType": "String (required)",
  "title": "String (required)",
  "description": "String",
  "location": {
    "address": "String",
    "barangay": "String",
    "city": "String",
    "province": "String",
    "coordinates": {
      "lat": "Number",
      "lng": "Number"
    }
  },
  "status": "String (default: 'pending')",
  "priority": "String",
  "attachments": [
    {
      "type": "String",
      "filename": "String",
      "url": "String"
    }
  ],
  "comments": [
    {
      "userId": "ObjectId",
      "comment": "String",
      "createdAt": "Date"
    }
  ],
  "verifiedBy": "ObjectId",
  "verifiedAt": "Date",
  "resolvedBy": "ObjectId",
  "resolvedAt": "Date",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### **Gas Station Model**
```json
{
  "_id": "ObjectId",
  "name": "String (required)",
  "brand": "String",
  "location": {
    "address": "String (required)",
    "barangay": "String",
    "city": "String",
    "province": "String",
    "coordinates": {
      "lat": "Number",
      "lng": "Number"
    },
    "type": "Point",
    "coordinates": [Number, Number] // [lng, lat]
  },
  "contact": {
    "phone": "String",
    "email": "String"
  },
  "operatingHours": {
    "monday": {
      "open": "String",
      "close": "String",
      "is24Hours": "Boolean"
    }
  },
  "fuelPrices": {
    "gasoline": {
      "regular": "Number",
      "premium": "Number"
    },
    "diesel": {
      "regular": "Number"
    }
  },
  "services": {
    "fuel": {
      "gasoline": "Boolean",
      "diesel": "Boolean"
    },
    "convenience": {
      "store": "Boolean",
      "atm": "Boolean",
      "restroom": "Boolean"
    }
  },
  "reviews": [
    {
      "userId": "ObjectId",
      "rating": "Number",
      "comment": "String",
      "createdAt": "Date"
    }
  ],
  "isVerified": "Boolean (default: false)",
  "isActive": "Boolean (default: true)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

## ⚠️ Error Handling

### **Standard Error Response Format**
```json
{
  "success": false,
  "message": "Error message description",
  "error": "Detailed error information (development only)"
}
```

### **HTTP Status Codes**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors, missing parameters)
- `401` - Unauthorized (invalid or missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

### **Common Error Responses**

#### **401 Unauthorized**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

#### **401 Token Missing**
```json
{
  "success": false,
  "message": "No token provided"
}
```

#### **403 Forbidden**
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

#### **404 Not Found**
```json
{
  "success": false,
  "message": "User not found"
}
```

#### **400 Validation Error**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

---

## 💻 Implementation Examples

### **JavaScript/Node.js Example**

```javascript
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// User Registration
async function registerUser(userData) {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error.response.data);
    throw error;
  }
}

// User Login
async function loginUser(email, password) {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password
    });
    // Store token for future requests
    const token = response.data.token;
    return { ...response.data, token };
  } catch (error) {
    console.error('Login error:', error.response.data);
    throw error;
  }
}

// Make Authenticated Request
async function getUserProfile(token) {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Get profile error:', error.response.data);
    throw error;
  }
}

// Admin Login
async function adminLogin(email, password) {
  try {
    const response = await axios.post(`${API_BASE_URL}/admin-auth/admin-login`, {
      email,
      password
    });
    return response.data;
  } catch (error) {
    console.error('Admin login error:', error.response.data);
    throw error;
  }
}

// Get All Users (Admin)
async function getAllUsers(adminToken, filters = {}) {
  try {
    const params = new URLSearchParams(filters);
    const response = await axios.get(
      `${API_BASE_URL}/admin-users?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Get users error:', error.response.data);
    throw error;
  }
}

// Usage Example
(async () => {
  try {
    // Register a new user
    const registrationResult = await registerUser({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      phone: '+1234567890'
    });
    console.log('User registered:', registrationResult);

    // Login
    const loginResult = await loginUser('john@example.com', 'password123');
    console.log('Login successful:', loginResult);
    
    // Get profile
    const profile = await getUserProfile(loginResult.token);
    console.log('User profile:', profile);

    // Admin login
    const adminResult = await adminLogin('admin@trafficslight.com', 'admin123');
    console.log('Admin login:', adminResult);

    // Get all users as admin
    const users = await getAllUsers(adminResult.data.token, {
      page: 1,
      limit: 10,
      city: 'Manila'
    });
    console.log('Users:', users);
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
```

### **React/JavaScript Frontend Example**

```javascript
// api.js
const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
    this.adminToken = localStorage.getItem('adminToken');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  setAdminToken(token) {
    this.adminToken = token;
    localStorage.setItem('adminToken', token);
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    if (this.token && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
      config.headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth methods
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' });
    this.token = null;
    localStorage.removeItem('token');
  }

  // User methods
  async getProfile() {
    return this.request('/users/profile');
  }

  async updateProfile(profileData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Admin methods
  async adminLogin(email, password) {
    const data = await this.request('/admin-auth/admin-login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.data?.token) {
      this.setAdminToken(data.data.token);
    }
    return data;
  }

  async getUsers(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/admin-users?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.adminToken}`,
      },
    });
  }

  async getUserStats() {
    return this.request('/admin-users/stats', {
      headers: {
        'Authorization': `Bearer ${this.adminToken}`,
      },
    });
  }

  // Trip methods
  async getTrips(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/trips?${params}`);
  }

  async createTrip(tripData) {
    return this.request('/trips', {
      method: 'POST',
      body: JSON.stringify(tripData),
    });
  }

  // Report methods
  async getReports(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/reports?${params}`);
  }

  async createReport(reportData) {
    return this.request('/reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  // Gas Station methods
  async getGasStations(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/gas-stations?${params}`);
  }

  async getNearbyGasStations(lat, lng, radius = 5000) {
    return this.request(`/gas-stations/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
  }
}

export default new ApiService();
```

### **Usage in React Component**

```javascript
import React, { useState, useEffect } from 'react';
import api from './api';

function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminToken, setAdminToken] = useState(null);

  useEffect(() => {
    // Admin login
    const login = async () => {
      try {
        const result = await api.adminLogin('admin@trafficslight.com', 'admin123');
        setAdminToken(result.data.token);
      } catch (error) {
        console.error('Admin login failed:', error);
      }
    };

    login();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!adminToken) return;
      
      try {
        setLoading(true);
        const result = await api.getUsers({ page: 1, limit: 10 });
        setUsers(result.data.users);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [adminToken]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Users List</h1>
      <ul>
        {users.map(user => (
          <li key={user._id}>
            {user.name} - {user.email} - {user.city}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UsersList;
```

### **cURL Examples**

```bash
# User Registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "+1234567890"
  }'

# User Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'

# Get User Profile (with token)
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Admin Login
curl -X POST http://localhost:5000/api/admin-auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@trafficslight.com",
    "password": "admin123"
  }'

# Get All Users (Admin)
curl -X GET "http://localhost:5000/api/admin-users?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"

# Get User Statistics (Admin)
curl -X GET http://localhost:5000/api/admin-users/stats \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"

# Get All Motors (Admin)
curl -X GET "http://localhost:5000/api/admin-motors?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"

# Create Trip
curl -X POST http://localhost:5000/api/trips \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "userId": "user_id",
    "origin": {
      "address": "Origin Address",
      "coordinates": { "lat": 14.5995, "lng": 120.9842 }
    },
    "destination": {
      "address": "Destination Address",
      "coordinates": { "lat": 14.6042, "lng": 120.9822 }
    },
    "distance": 15.5,
    "duration": 30
  }'

# Get Reports
curl -X GET "http://localhost:5000/api/reports?page=1&limit=10&status=pending" \
  -H "Content-Type: application/json"

# Get Nearby Gas Stations
curl -X GET "http://localhost:5000/api/gas-stations/nearby?lat=14.5995&lng=120.9842&radius=5000" \
  -H "Content-Type: application/json"
```

---

## ✅ Best Practices

### **1. Authentication**
- Always store JWT tokens securely (localStorage, sessionStorage, or httpOnly cookies)
- Include tokens in Authorization header: `Bearer <token>`
- Implement token refresh mechanism for long-lived sessions
- Clear tokens on logout

### **2. Error Handling**
- Always check response status before processing data
- Handle network errors gracefully
- Display user-friendly error messages
- Log errors for debugging in development

### **3. Request Management**
- Use pagination for large data sets
- Implement request cancellation for fast user interactions
- Add loading states for better UX
- Cache responses when appropriate

### **4. Security**
- Never expose tokens in URLs or logs
- Use HTTPS in production
- Validate and sanitize all user inputs
- Implement rate limiting on sensitive endpoints

### **5. Performance**
- Use query parameters for filtering and pagination
- Request only necessary data fields
- Implement proper caching strategies
- Optimize database queries

### **6. Testing**
- Test all endpoints with valid and invalid data
- Test authentication and authorization
- Test error scenarios
- Use proper test data that can be cleaned up

---

## 📚 Additional Resources

### **Environment Variables**
- `PORT` - Server port (default: 5000)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `GOOGLE_MAPS_API_KEY` - Google Maps API key (optional)
- `NODE_ENV` - Environment (development/production)

### **Database Models**
All models are located in the `models/` directory:
- `User.js` - User model
- `Admin.js` - Admin model
- `AdminRole.js` - Admin role model
- `Motor.js` / `motorcycleModel.js` - Motorcycle models
- `TripModel.js` - Trip model
- `Reports.js` - Report model
- `GasStation.js` - Gas station model
- And more...

### **Middleware**
- `authMiddleware.js` - User authentication middleware
- `adminMiddleware.js` - Admin authentication middleware
- `errorMiddleware.js` - Error handling middleware
- `rateLimitMiddleware.js` - Rate limiting middleware

---

## 🆘 Troubleshooting

### **Common Issues**

1. **Connection Refused**
   - Check if server is running on correct port
   - Verify MongoDB connection
   - Check firewall settings

2. **401 Unauthorized**
   - Verify token is included in Authorization header
   - Check token expiration
   - Verify token format: `Bearer <token>`

3. **403 Forbidden**
   - Verify admin permissions
   - Check if user has required role
   - Verify route permissions

4. **404 Not Found**
   - Verify endpoint URL
   - Check route registration in `index.js`
   - Verify HTTP method (GET, POST, PUT, DELETE)

5. **500 Internal Server Error**
   - Check server logs
   - Verify database connection
   - Check environment variables

---

## 📞 Support

For issues, questions, or contributions, please refer to the project documentation or contact the development team.

---

## 📝 License

This project is proprietary software. All rights reserved.

---

**Last Updated:** 2025-01-15
**Version:** 1.0.0

