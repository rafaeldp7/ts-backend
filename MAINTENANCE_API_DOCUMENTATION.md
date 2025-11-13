# Maintenance API - Complete Documentation

## Overview

This guide provides complete documentation for the Maintenance Records API. The API allows users to create, view, update, and manage maintenance records for their motorcycles including oil changes, tune-ups, refuels, repairs, and other maintenance activities.

---

## Table of Contents

1. [API Endpoints](#api-endpoints)
2. [Base URL](#base-url)
3. [Authentication](#authentication)
4. [Maintenance Types](#maintenance-types)
5. [Get Maintenance Records](#get-maintenance-records)
6. [Get Last Maintenance Records](#get-last-maintenance-records)
7. [Get Oil Change Countdown](#get-oil-change-countdown)
8. [Refuel Endpoint](#refuel-endpoint)
9. [Create Maintenance Record](#create-maintenance-record)
10. [Update Maintenance Record](#update-maintenance-record)
11. [Delete Maintenance Record](#delete-maintenance-record)
12. [Get Maintenance by Motor](#get-maintenance-by-motor)
13. [Get Maintenance Analytics](#get-maintenance-analytics)
14. [Data Models](#data-models)
15. [Error Handling](#error-handling)
16. [Frontend Integration Examples](#frontend-integration-examples)

---

## Base URL

```
/api/maintenance-records
```

---

## Authentication

Most endpoints support authentication but can also work with `userId` in the request body for backward compatibility. When authentication is available, the `userId` is automatically extracted from the authenticated user.

**Header Format (if required):**
```
Authorization: Bearer <your-jwt-token>
```

**Example:**
```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

---

## Maintenance Types

The following maintenance types are supported:

- `refuel` - Fuel refilling
- `oil_change` - Oil change service
- `tune_up` - Tune-up service
- `repair` - Repair service
- `other` - Other maintenance activities

---

## Get Maintenance Records

### Get All Maintenance Records

**Endpoint:**
```
GET /api/maintenance-records
```

**Description:**
Returns all maintenance records with optional filtering, pagination, and sorting. If authenticated, returns records for the authenticated user. Otherwise, can filter by query parameters.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | `1` | Page number for pagination |
| `limit` | number | `10` | Number of records per page |
| `type` | string | `null` | Filter by maintenance type (`refuel`, `oil_change`, `tune_up`, `repair`, `other`) |
| `motorId` | string | `null` | Filter by motor ID |
| `sortBy` | string | `timestamp` | Field to sort by |
| `sortOrder` | string | `desc` | Sort order (`asc` or `desc`) |
| `startDate` | string (ISO 8601) | `null` | Start date for date range filter |
| `endDate` | string (ISO 8601) | `null` | End date for date range filter |

**Example Request:**
```javascript
// Get all maintenance records (first page)
GET /api/maintenance-records

// Get records with pagination
GET /api/maintenance-records?page=2&limit=20

// Filter by type
GET /api/maintenance-records?type=oil_change

// Filter by motor and type
GET /api/maintenance-records?motorId=507f1f77bcf86cd799439013&type=refuel

// Filter by date range
GET /api/maintenance-records?startDate=2024-01-01T00:00:00.000Z&endDate=2024-01-31T23:59:59.999Z

// Sort by cost (ascending)
GET /api/maintenance-records?sortBy=details.cost&sortOrder=asc
```

**Success Response (200 OK):**
```json
{
  "records": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "motorId": {
        "_id": "507f1f77bcf86cd799439013",
        "nickname": "My Motorcycle",
        "brand": "Honda",
        "model": "CBR150R"
      },
      "type": "oil_change",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "location": {
        "lat": 14.5995,
        "lng": 120.9842,
        "latitude": 14.5995,
        "longitude": 120.9842
      },
      "details": {
        "cost": 500,
        "quantity": 1,
        "notes": "Regular oil change"
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "totalPages": 5,
  "currentPage": 1,
  "total": 45
}
```

---

### Get Maintenance Records by User

**Endpoint:**
```
GET /api/maintenance-records/user/:userId
```

**Description:**
Returns all maintenance records for a specific user. Returns an array directly (not paginated).

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | string | Yes | User ID |

**Example Request:**
```javascript
GET /api/maintenance-records/user/507f1f77bcf86cd799439012
```

**Success Response (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "motorId": {
      "_id": "507f1f77bcf86cd799439013",
      "nickname": "My Motorcycle",
      "plateNumber": "ABC-1234"
    },
    "type": "oil_change",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "location": {
      "lat": 14.5995,
      "lng": 120.9842
    },
    "details": {
      "cost": 500,
      "quantity": 1,
      "notes": "Regular oil change"
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

---

### Get Single Maintenance Record

**Endpoint:**
```
GET /api/maintenance-records/:id
```

**Description:**
Returns a single maintenance record by ID. If authenticated, only returns records belonging to the authenticated user.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Maintenance record ID |

**Example Request:**
```javascript
GET /api/maintenance-records/507f1f77bcf86cd799439011
```

**Success Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439012",
  "motorId": {
    "_id": "507f1f77bcf86cd799439013",
    "nickname": "My Motorcycle",
    "brand": "Honda",
    "model": "CBR150R"
  },
  "type": "oil_change",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "location": {
    "lat": 14.5995,
    "lng": 120.9842,
    "latitude": 14.5995,
    "longitude": 120.9842
  },
  "details": {
    "cost": 500,
    "quantity": 1,
    "notes": "Regular oil change"
  },
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Response (404 Not Found):**
```json
{
  "message": "Maintenance record not found"
}
```

---

## Create Maintenance Record

**Endpoint:**
```
POST /api/maintenance-records
```

**Description:**
Creates a new maintenance record. The `userId` can be provided in the request body or extracted from the authenticated user. For `refuel` type records, the motor's fuel level is automatically updated.

**Request Body:**

```json
{
  "userId": "507f1f77bcf86cd799439012",
  "motorId": "507f1f77bcf86cd799439013",
  "type": "oil_change",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "odometer": 10000,
  "location": {
    "lat": 14.5995,
    "lng": 120.9842,
    "address": "Honda Service Center, Quezon City"
  },
  "details": {
    "cost": 500,
    "quantity": 1,
    "notes": "Regular oil change",
    "oilType": "Synthetic",
    "oilViscosity": "10W-40",
    "serviceProvider": "Honda Service Center",
    "warranty": false,
    "nextServiceDate": "2024-04-15T10:00:00.000Z",
    "nextServiceOdometer": 13000
  }
}
```

**Request Body Fields:**

| Field | Type | Required | Description | Valid Values |
|-------|------|----------|-------------|--------------|
| `userId` | string | Yes* | User ID | MongoDB ObjectId (*can be from auth token) |
| `motorId` | string | Yes | Motor ID | MongoDB ObjectId |
| `type` | string | Yes | Maintenance type | `refuel`, `oil_change`, `tune_up`, `repair`, `other` |
| `timestamp` | string/number | No | Timestamp (ISO 8601 or milliseconds) | Default: current time |
| `odometer` | number | No | Odometer reading (auto-captured from UserMotor if not provided) | |
| `location` | object | No | Location coordinates | |
| `location.lat` | number | No | Latitude | -90 to 90 |
| `location.lng` | number | No | Longitude | -180 to 180 |
| `location.latitude` | number | No | Latitude (alternative format) | -90 to 90 |
| `location.longitude` | number | No | Longitude (alternative format) | -180 to 180 |
| `location.address` | string | No | Address where maintenance was performed | |
| `details` | object | Yes | Maintenance details | |
| `details.cost` | number | Yes | Cost of maintenance | |
| `details.quantity` | number | Conditional | Quantity (required for `oil_change`, required for `refuel` if no `costPerLiter`) | |
| `details.costPerLiter` | number | Conditional | Cost per liter (required for `refuel` if no `quantity`) | |
| `details.notes` | string | No | Additional notes | |
| `details.oilType` | string | No | Type of oil used (for oil_change) | e.g., "Synthetic", "Conventional" |
| `details.oilViscosity` | string | No | Oil viscosity (for oil_change) | e.g., "10W-40", "5W-30" |
| `details.serviceProvider` | string | No | Name of service provider/mechanic | |
| `details.warranty` | boolean | No | Whether service is under warranty | Default: false |
| `details.nextServiceDate` | string (ISO 8601) | No | Recommended next service date | |
| `details.nextServiceOdometer` | number | No | Recommended next service odometer reading | |

**Type-Specific Requirements:**

- **`refuel`**: Either `quantity` or `costPerLiter` is required
- **`oil_change`**: `quantity` is required
- **`tune_up`**, **`repair`**, **`other`**: Only `cost` is required

**Note:** The `odometer` field is automatically captured from the UserMotor's `currentOdometer` if not provided in the request. This ensures accurate historical tracking of maintenance activities.

**Example Request:**
```javascript
POST /api/maintenance-records
Content-Type: application/json
Authorization: Bearer <token>

{
  "motorId": "507f1f77bcf86cd799439013",
  "type": "refuel",
  "location": {
    "lat": 14.5995,
    "lng": 120.9842
  },
  "details": {
    "cost": 500,
    "quantity": 5,
    "costPerLiter": 100,
    "notes": "Full tank refuel"
  }
}
```

**Success Response (201 Created):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439012",
  "motorId": {
    "_id": "507f1f77bcf86cd799439013",
    "nickname": "My Motorcycle",
    "brand": "Honda",
    "model": "CBR150R"
  },
  "type": "refuel",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "odometer": 12345,
  "location": {
    "lat": 14.5995,
    "lng": 120.9842,
    "latitude": 14.5995,
    "longitude": 120.9842,
    "address": "Shell Gas Station, EDSA"
  },
  "details": {
    "cost": 500,
    "quantity": 5,
    "costPerLiter": 100,
    "notes": "Full tank refuel",
    "serviceProvider": "Shell"
  },
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**

**400 Bad Request - Missing User ID:**
```json
{
  "message": "User ID is required"
}
```

**400 Bad Request - Missing Motor ID:**
```json
{
  "message": "Motor ID is required"
}
```

**400 Bad Request - Missing Type:**
```json
{
  "message": "Maintenance type is required"
}
```

**400 Bad Request - Invalid Type:**
```json
{
  "message": "Invalid maintenance type. Must be: refuel, oil_change, or tune_up"
}
```

**400 Bad Request - Missing Cost:**
```json
{
  "message": "Cost is required"
}
```

**400 Bad Request - Missing Quantity (for refuel):**
```json
{
  "message": "For refuel type, either quantity or costPerLiter is required"
}
```

**400 Bad Request - Missing Quantity (for oil_change):**
```json
{
  "message": "Quantity is required for oil change type"
}
```

**400 Bad Request - Validation Error:**
```json
{
  "message": "Validation error",
  "errors": ["Error message 1", "Error message 2"]
}
```

---

## Update Maintenance Record

**Endpoint:**
```
PUT /api/maintenance-records/:id
```

**Description:**
Updates an existing maintenance record. Only provided fields will be updated. If authenticated, only allows updating records belonging to the authenticated user.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Maintenance record ID |

**Request Body:**

```json
{
  "type": "tune_up",
  "details": {
    "cost": 1000,
    "notes": "Updated notes"
  }
}
```

**Request Body Fields:**

All fields are optional. Only include fields you want to update.

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | Updated maintenance type |
| `timestamp` | string/number | Updated timestamp |
| `location` | object | Updated location |
| `details` | object | Updated details |
| `details.cost` | number | Updated cost |
| `details.quantity` | number | Updated quantity |
| `details.costPerLiter` | number | Updated cost per liter |
| `details.notes` | string | Updated notes |

**Example Request:**
```javascript
PUT /api/maintenance-records/507f1f77bcf86cd799439011
Content-Type: application/json
Authorization: Bearer <token>

{
  "details": {
    "cost": 600,
    "notes": "Updated maintenance notes"
  }
}
```

**Success Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439012",
  "motorId": {
    "_id": "507f1f77bcf86cd799439013",
    "nickname": "My Motorcycle",
    "brand": "Honda",
    "model": "CBR150R"
  },
  "type": "oil_change",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "location": {
    "lat": 14.5995,
    "lng": 120.9842
  },
  "details": {
    "cost": 600,
    "quantity": 1,
    "notes": "Updated maintenance notes"
  },
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

**Error Response (404 Not Found):**
```json
{
  "message": "Maintenance record not found"
}
```

---

## Delete Maintenance Record

**Endpoint:**
```
DELETE /api/maintenance-records/:id
```

**Description:**
Permanently deletes a maintenance record. If authenticated, only allows deleting records belonging to the authenticated user.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Maintenance record ID |

**Example Request:**
```javascript
DELETE /api/maintenance-records/507f1f77bcf86cd799439011
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "message": "Maintenance record deleted successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "message": "Maintenance record not found"
}
```

---

## Get Maintenance by Motor

**Endpoint:**
```
GET /api/maintenance-records/motor/:motorId
```

**Description:**
Returns all maintenance records for a specific motor with pagination and filtering options. If authenticated, only returns records belonging to the authenticated user.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `motorId` | string | Yes | Motor ID |

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | `1` | Page number for pagination |
| `limit` | number | `10` | Number of records per page |
| `type` | string | `null` | Filter by maintenance type |
| `sortBy` | string | `timestamp` | Field to sort by |
| `sortOrder` | string | `desc` | Sort order (`asc` or `desc`) |

**Example Request:**
```javascript
GET /api/maintenance-records/motor/507f1f77bcf86cd799439013?page=1&limit=20&type=refuel
```

**Success Response (200 OK):**
```json
{
  "records": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "motorId": {
        "_id": "507f1f77bcf86cd799439013",
        "nickname": "My Motorcycle",
        "brand": "Honda",
        "model": "CBR150R"
      },
      "type": "refuel",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "details": {
        "cost": 500,
        "quantity": 5
      }
    }
  ],
  "totalPages": 3,
  "currentPage": 1,
  "total": 25
}
```

---

## Get Last Maintenance Records

### Get Last Refuel, Oil Change, and Tune-Up

**Endpoint:**
```
GET /api/maintenance-records/last/:userId
```

**Description:**
Returns the last refuel, oil change, and tune-up records for a specific user. This endpoint is useful for quickly accessing the most recent maintenance activities.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | string | Yes | User ID |

**Example Request:**
```javascript
GET /api/maintenance-records/last/507f1f77bcf86cd799439012
```

**Success Response (200 OK):**
```json
{
  "lastRefuel": {
    "date": "2025-11-14T00:00:00.000Z",
    "odometer": 12345
  },
  "lastOilChange": {
    "date": "2025-10-10T00:00:00.000Z",
    "odometer": 10000
  },
  "lastTuneUp": {
    "date": "2025-09-01T00:00:00.000Z",
    "odometer": 9500
  }
}
```

**Note:** If a maintenance type has no records, the corresponding field will be `null`. Odometer values are now stored directly in maintenance records for accurate historical tracking.

---

## Get Oil Change Countdown

### Get Oil Change Countdown for Motor

**Endpoint:**
```
GET /api/maintenance-records/oil-change/countdown/:motorId
```

**Description:**
Returns oil change countdown information for a specific motor. Determines if an oil change is needed based on:
- Distance traveled ≥ 3000 km since the last oil change, OR
- 90 days (3 months) have passed since the last oil change

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `motorId` | string | Yes | Motor ID (UserMotor ID) |

**Example Request:**
```javascript
GET /api/maintenance-records/oil-change/countdown/507f1f77bcf86cd799439013
```

**Success Response (200 OK):**
```json
{
  "motorId": "507f1f77bcf86cd799439013",
  "kmSinceLastOilChange": 2750,
  "daysSinceLastOilChange": 65,
  "needsOilChange": false,
  "remainingKm": 250,
  "remainingDays": 25,
  "lastOilChangeDate": "2025-10-10T00:00:00.000Z"
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `motorId` | string | Motor ID |
| `kmSinceLastOilChange` | number | Kilometers traveled since last oil change (calculated from trip distances) |
| `daysSinceLastOilChange` | number | Days since last oil change |
| `needsOilChange` | boolean | Whether oil change is needed (true if ≥3000 km OR ≥90 days) |
| `remainingKm` | number | Remaining kilometers before oil change is needed |
| `remainingDays` | number | Remaining days before oil change is needed |
| `lastOilChangeDate` | string (ISO 8601) | Date of last oil change |

**Response when no previous oil change found:**
```json
{
  "motorId": "507f1f77bcf86cd799439013",
  "kmSinceLastOilChange": null,
  "daysSinceLastOilChange": null,
  "needsOilChange": true,
  "remainingKm": 3000,
  "remainingDays": 90,
  "message": "No previous oil change record found"
}
```

**Note:** The `kmSinceLastOilChange` is calculated by summing the distances from all completed trips since the last oil change date. This provides an accurate measure of distance traveled.

---

## Refuel Endpoint

### Refuel with Automatic Quantity Calculation

**Endpoint:**
```
POST /api/maintenance-records/refuel
```

**Description:**
Creates a refuel maintenance record with automatic quantity calculation and fuel level update. This endpoint:
1. Calculates quantity from price and cost per liter
2. Retrieves fuel tank capacity from the motorcycle
3. Calculates refueled percentage
4. Updates the motor's current fuel level
5. Creates a maintenance record

**Request Body:**

```json
{
  "userMotorId": "507f1f77bcf86cd799439013",
  "price": 150,
  "costPerLiter": 75,
  "location": {
    "lat": 14.5995,
    "lng": 120.9842,
    "address": "Shell Gas Station, EDSA"
  },
  "notes": "Full tank refuel",
  "serviceProvider": "Shell"
}
```

**Request Body Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userMotorId` | string | Yes | UserMotor ID |
| `price` | number | Yes | Total price paid (must be positive) |
| `costPerLiter` | number | Yes | Price per liter (must be positive) |
| `location` | object | No | Location where refuel occurred |
| `location.lat` | number | No | Latitude |
| `location.lng` | number | No | Longitude |
| `location.address` | string | No | Address of refuel location |
| `notes` | string | No | Additional notes about the refuel |
| `serviceProvider` | string | No | Name of gas station/service provider |

**Example Request:**
```javascript
POST /api/maintenance-records/refuel
Content-Type: application/json

{
  "userMotorId": "507f1f77bcf86cd799439013",
  "price": 150,
  "costPerLiter": 75
}
```

**Success Response (201 Created):**
```json
{
  "userMotorId": "507f1f77bcf86cd799439013",
  "quantity": 2,
  "fuelTank": 8,
  "refueledPercent": 25,
  "newFuelLevel": 75,
  "maintenanceRecord": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "motorId": "507f1f77bcf86cd799439013",
    "type": "refuel",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "odometer": 12345,
    "location": {
      "lat": 14.5995,
      "lng": 120.9842,
      "latitude": 14.5995,
      "longitude": 120.9842,
      "address": "Shell Gas Station, EDSA"
    },
    "details": {
      "cost": 150,
      "quantity": 2,
      "costPerLiter": 75,
      "fuelTank": 8,
      "refueledPercent": 25,
      "fuelLevelBefore": 50,
      "fuelLevelAfter": 75,
      "notes": "Full tank refuel",
      "serviceProvider": "Shell"
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `userMotorId` | string | UserMotor ID |
| `quantity` | number | Calculated quantity in liters (price / costPerLiter) |
| `fuelTank` | number | Fuel tank capacity in liters |
| `refueledPercent` | number | Percentage of tank refueled (quantity / fuelTank * 100) |
| `newFuelLevel` | number | New fuel level percentage (capped at 100%) |
| `maintenanceRecord` | object | Created maintenance record |

**Error Responses:**

**400 Bad Request - Missing userMotorId:**
```json
{
  "message": "userMotorId is required"
}
```

**400 Bad Request - Invalid price:**
```json
{
  "message": "price must be a positive number"
}
```

**400 Bad Request - Invalid costPerLiter:**
```json
{
  "message": "costPerLiter must be a positive number"
}
```

**404 Not Found:**
```json
{
  "message": "UserMotor not found"
}
```

**400 Bad Request - Missing motorcycle info:**
```json
{
  "message": "Motorcycle information not found for this motor"
}
```

**400 Bad Request - Invalid fuel tank:**
```json
{
  "message": "Fuel tank capacity is missing or invalid"
}
```

**Logic:**
1. **Quantity Calculation:** `quantity = price / costPerLiter`
2. **Refueled Percentage:** `refueledPercent = (quantity / fuelTank) * 100`
3. **New Fuel Level:** `newFuelLevel = Math.min(currentFuelLevel + refueledPercent, 100)`
4. The motor's `currentFuelLevel` is automatically updated in the UserMotor model
5. A maintenance record is created with the refuel details

---

## Get Maintenance Analytics

**Endpoint:**
```
GET /api/maintenance-records/analytics/summary
```

**Description:**
Returns maintenance analytics summary. Note: This endpoint expects `motorId` and `userId` from query parameters or authentication. The analytics are calculated for a specific period.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `motorId` | string | Required | Motor ID |
| `period` | string | `30d` | Time period (`7d`, `30d`, `90d`) |

**Example Request:**
```javascript
GET /api/maintenance-records/analytics/summary?motorId=507f1f77bcf86cd799439013&period=30d
```

**Success Response (200 OK):**
```json
{
  "period": "30d",
  "totalRecords": 15,
  "totalCost": 7500,
  "totalFuelAdded": 50,
  "avgCostPerRefuel": 500,
  "refuelCount": 10,
  "oilChangeCount": 3,
  "tuneUpCount": 2,
  "recordsByType": {
    "refuel": 10,
    "oil_change": 3,
    "tune_up": 2
  },
  "recentRecords": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "type": "refuel",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "details": {
        "cost": 500,
        "quantity": 5
      }
    }
  ]
}
```

**Note:** The analytics endpoint implementation may vary. Check the controller for exact behavior.

---

## Data Models

### Maintenance Record Schema

```javascript
{
  _id: ObjectId,                    // MongoDB document ID
  userId: ObjectId,                  // User who created the record (ref: User)
  motorId: ObjectId,                 // Motor ID (ref: UserMotor)
  type: String,                      // "refuel" | "oil_change" | "tune_up" | "repair" | "other"
  timestamp: Date,                   // Maintenance timestamp (default: Date.now)
  odometer: Number,                  // Odometer reading at time of maintenance (auto-captured if not provided)
  location: {
    lat: Number,                     // Latitude
    lng: Number,                     // Longitude
    latitude: Number,                 // Latitude (alternative format)
    longitude: Number,               // Longitude (alternative format)
    address: String                  // Address where maintenance was performed
  },
  details: {
    // Basic fields
    cost: Number,                    // Cost of maintenance
    quantity: Number,                // Quantity (e.g., liters for refuel, units for oil)
    costPerLiter: Number,            // Cost per liter (for refuel type)
    notes: String,                   // Additional notes
    
    // Refuel-specific fields
    fuelTank: Number,                // Fuel tank capacity in liters
    refueledPercent: Number,         // Percentage of tank refueled
    fuelLevelBefore: Number,         // Fuel level before refuel (percentage)
    fuelLevelAfter: Number,          // Fuel level after refuel (percentage)
    
    // Oil change specific fields
    oilType: String,                 // Type of oil used (e.g., "Synthetic", "Conventional")
    oilViscosity: String,            // Oil viscosity (e.g., "10W-40", "5W-30")
    
    // General maintenance fields
    serviceProvider: String,         // Name of service provider/mechanic
    warranty: Boolean,               // Whether service is under warranty (default: false)
    nextServiceDate: Date,          // Recommended next service date
    nextServiceOdometer: Number     // Recommended next service odometer reading
  },
  createdAt: Date,                  // Document creation date
  updatedAt: Date                   // Document last update date
}
```

---

## Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "message": "Error message describing the issue"
}
```

**404 Not Found:**
```json
{
  "message": "Maintenance record not found"
}
```

**500 Internal Server Error:**
```json
{
  "message": "Server error [operation] maintenance record"
}
```

### Error Handling Best Practices

1. **Always check response status** before processing data
2. **Handle network errors** with try-catch blocks
3. **Display user-friendly error messages** to users
4. **Log errors** for debugging purposes
5. **Validate input** before making API calls

---

## Frontend Integration Examples

### React/JavaScript Examples

#### 1. Get All Maintenance Records

```javascript
const getMaintenanceRecords = async (options = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      type = null,
      motorId = null,
      startDate = null,
      endDate = null
    } = options;

    const queryParams = new URLSearchParams();
    queryParams.append('page', page);
    queryParams.append('limit', limit);
    if (type) queryParams.append('type', type);
    if (motorId) queryParams.append('motorId', motorId);
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    const response = await fetch(
      `http://your-api-url/api/maintenance-records?${queryParams.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const result = await response.json();

    if (response.ok) {
      return result;
    } else {
      throw new Error(result.message || 'Failed to get maintenance records');
    }
  } catch (error) {
    console.error('Error getting maintenance records:', error);
    throw error;
  }
};
```

#### 2. Create Maintenance Record

```javascript
const createMaintenanceRecord = async (recordData, token = null) => {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('http://your-api-url/api/maintenance-records', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        motorId: recordData.motorId,
        type: recordData.type,
        timestamp: recordData.timestamp || new Date().toISOString(),
        odometer: recordData.odometer, // Optional - auto-captured if not provided
        location: {
          lat: recordData.latitude || recordData.lat,
          lng: recordData.longitude || recordData.lng,
          address: recordData.address
        },
        details: {
          cost: recordData.cost,
          quantity: recordData.quantity,
          costPerLiter: recordData.costPerLiter,
          notes: recordData.notes,
          // Oil change specific fields
          oilType: recordData.oilType,
          oilViscosity: recordData.oilViscosity,
          // General maintenance fields
          serviceProvider: recordData.serviceProvider,
          warranty: recordData.warranty || false,
          nextServiceDate: recordData.nextServiceDate,
          nextServiceOdometer: recordData.nextServiceOdometer
        }
      })
    });

    const result = await response.json();

    if (response.ok) {
      console.log('Maintenance record created successfully:', result);
      return result;
    } else {
      throw new Error(result.message || 'Failed to create maintenance record');
    }
  } catch (error) {
    console.error('Error creating maintenance record:', error);
    throw error;
  }
};

// Usage example - Oil Change
const handleCreateOilChange = async () => {
  try {
    const token = localStorage.getItem('token');
    const recordData = {
      motorId: '507f1f77bcf86cd799439013',
      type: 'oil_change',
      odometer: 10000,
      latitude: 14.5995,
      longitude: 120.9842,
      address: 'Honda Service Center, Quezon City',
      cost: 500,
      quantity: 1,
      notes: 'Regular oil change',
      oilType: 'Synthetic',
      oilViscosity: '10W-40',
      serviceProvider: 'Honda Service Center',
      warranty: false,
      nextServiceDate: '2024-04-15T10:00:00.000Z',
      nextServiceOdometer: 13000
    };

    const record = await createMaintenanceRecord(recordData, token);
    alert('Maintenance record created successfully!');
    return record;
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
};
```

#### 3. Get Maintenance Records by User

```javascript
const getUserMaintenanceRecords = async (userId) => {
  try {
    const response = await fetch(
      `http://your-api-url/api/maintenance-records/user/${userId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const result = await response.json();

    if (response.ok) {
      return result;
    } else {
      throw new Error('Failed to get user maintenance records');
    }
  } catch (error) {
    console.error('Error getting user maintenance records:', error);
    throw error;
  }
};
```

#### 4. Update Maintenance Record

```javascript
const updateMaintenanceRecord = async (recordId, updates, token = null) => {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(
      `http://your-api-url/api/maintenance-records/${recordId}`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify(updates)
      }
    );

    const result = await response.json();

    if (response.ok) {
      return result;
    } else {
      throw new Error(result.message || 'Failed to update maintenance record');
    }
  } catch (error) {
    console.error('Error updating maintenance record:', error);
    throw error;
  }
};
```

#### 5. Delete Maintenance Record

```javascript
const deleteMaintenanceRecord = async (recordId, token = null) => {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(
      `http://your-api-url/api/maintenance-records/${recordId}`,
      {
        method: 'DELETE',
        headers
      }
    );

    const result = await response.json();

    if (response.ok) {
      return result;
    } else {
      throw new Error(result.message || 'Failed to delete maintenance record');
    }
  } catch (error) {
    console.error('Error deleting maintenance record:', error);
    throw error;
  }
};
```

#### 6. Get Maintenance by Motor

```javascript
const getMotorMaintenance = async (motorId, options = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      type = null
    } = options;

    const queryParams = new URLSearchParams();
    queryParams.append('page', page);
    queryParams.append('limit', limit);
    if (type) queryParams.append('type', type);

    const response = await fetch(
      `http://your-api-url/api/maintenance-records/motor/${motorId}?${queryParams.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const result = await response.json();

    if (response.ok) {
      return result;
    } else {
      throw new Error('Failed to get motor maintenance records');
    }
  } catch (error) {
    console.error('Error getting motor maintenance:', error);
    throw error;
  }
};
```

---

## Best Practices

### 1. Maintenance Record Creation

- **Always provide motorId**: Maintenance records require a valid motor ID
- **Include cost information**: Always provide the cost of maintenance
- **Use appropriate types**: Choose the most accurate maintenance type
- **Include location when possible**: Helps track where maintenance was performed
- **For refuel records**: The motor's fuel level is automatically updated

### 2. Filtering and Querying

- **Use pagination**: For large datasets, use pagination to improve performance
- **Filter by type**: Use type filters to show only relevant records
- **Filter by date range**: Use date range filters for time-based queries
- **Filter by motor**: Use motor filters to show records for specific motorcycles

### 3. Data Validation

- **Validate required fields**: Ensure all required fields are provided
- **Validate maintenance types**: Only use valid maintenance types
- **Validate quantities**: For `refuel` and `oil_change`, ensure quantity is provided
- **Validate costs**: Ensure cost is always provided

### 4. Performance

- **Use pagination**: For large datasets, implement pagination
- **Cache results**: Cache frequently accessed records
- **Filter on server**: Use query parameters to filter on the server side

### 5. Security

- **Validate user input**: Always validate and sanitize user input
- **Handle authentication**: Include tokens when required
- **Error handling**: Never expose sensitive error details to users

---

## Special Features

### Automatic Fuel Level Update

When a maintenance record of type `refuel` is created with a `quantity` value, the system automatically updates the motor's fuel level:

- Calculates new fuel level based on tank capacity
- Updates the motor's `currentFuelLevel` field
- Updates the motor's analytics timestamp

This feature ensures that fuel levels stay synchronized with refuel records.

---

## Support

For issues or questions regarding the Maintenance Records API, please contact the development team or refer to the main API documentation.

---

**Last Updated:** January 2024  
**API Version:** 1.0

