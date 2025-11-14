# API Endpoints Quick Reference Guide

## Overview

This document provides a quick reference for commonly used API endpoints including voting, report updates, route directions, fuel level updates, and gas price management.

---

## Table of Contents

1. [Vote on Reports (Upvote/Downvote)](#vote-on-reports-upvotedownvote)
2. [Update Report](#update-report)
3. [Get Google Maps Route (Point A to Point B)](#get-google-maps-route-point-a-to-point-b)
4. [Update Fuel Level](#update-fuel-level)
5. [Update Gas Price](#update-gas-price)
6. [Get Gas Prices](#get-gas-prices)

---

## Vote on Reports (Upvote/Downvote)

### Endpoint
```
POST /api/reports/:id/vote
```

### Description
Vote on a report (upvote or downvote). If a user votes the same way again, the vote is removed. If they vote differently, the vote is switched.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Report ID |

### Request Body

```json
{
  "userId": "507f1f77bcf86cd799439012",
  "vote": 1
}
```

**Request Body Fields:**

| Field | Type | Required | Description | Valid Values |
|-------|------|----------|-------------|--------------|
| `userId` | string | Yes | User ID who is voting | Valid MongoDB ObjectId |
| `vote` | number | Yes | Vote value | `1` (upvote) or `-1` (downvote) |

### Response

**Success Response (200 OK):**
```json
{
  "report": {
    "_id": "507f1f77bcf86cd799439011",
    "reportType": "Accident",
    "description": "Car accident on main road",
    "votes": [
      {
        "userId": "507f1f77bcf86cd799439012",
        "vote": 1
      }
    ],
    ...
  },
  "totalVotes": 5
}
```

### Example Request

```javascript
// Upvote
POST /api/reports/507f1f77bcf86cd799439011/vote
Content-Type: application/json

{
  "userId": "507f1f77bcf86cd799439012",
  "vote": 1
}

// Downvote
POST /api/reports/507f1f77bcf86cd799439011/vote
Content-Type: application/json

{
  "userId": "507f1f77bcf86cd799439012",
  "vote": -1
}
```

### Frontend Example

```javascript
const voteOnReport = async (reportId, userId, vote) => {
  try {
    const response = await fetch(
      `http://your-api-url/api/reports/${reportId}/vote`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          vote // 1 for upvote, -1 for downvote
        })
      }
    );

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error voting on report:', error);
    throw error;
  }
};

// Usage
await voteOnReport('report-id', 'user-id', 1); // Upvote
await voteOnReport('report-id', 'user-id', -1); // Downvote
```

---

## Update Report

### Endpoint
```
PUT /api/reports/:id
```

### Description
Update an existing report. Only certain fields can be updated.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Report ID |

### Request Body

```json
{
  "description": "Updated description",
  "reportType": "Traffic Jam",
  "address": "Updated address"
}
```

**Request Body Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `description` | string | No | Report description (max 500 chars) |
| `reportType` | string | No | Type of report | `Accident`, `Traffic Jam`, `Road Closure`, `Hazard` |
| `address` | string | No | Report address |

**Note:** Fields like `_id`, `createdAt`, `updatedAt` cannot be updated.

### Response

**Success Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "reportType": "Traffic Jam",
  "description": "Updated description",
  "address": "Updated address",
  "location": {
    "latitude": 14.5995,
    "longitude": 120.9842
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  ...
}
```

### Example Request

```javascript
PUT /api/reports/507f1f77bcf86cd799439011
Content-Type: application/json

{
  "description": "Heavy traffic on EDSA",
  "reportType": "Traffic Jam"
}
```

### Frontend Example

```javascript
const updateReport = async (reportId, updates) => {
  try {
    const response = await fetch(
      `http://your-api-url/api/reports/${reportId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      }
    );

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error updating report:', error);
    throw error;
  }
};

// Usage
await updateReport('report-id', {
  description: 'Updated description',
  reportType: 'Traffic Jam'
});
```

---

## Get Google Maps Route (Point A to Point B)

### Endpoint
```
POST /api/routes/process-directions
```

### Description
Get route directions from point A (origin) to point B (destination) using Google Maps Directions API. Returns route information including distance, duration, traffic conditions, and fuel estimates.

### Request Body

```json
{
  "origin": "Manila, Philippines",
  "destination": "Makati, Philippines",
  "motorData": {
    "fuelEfficiency": 50
  },
  "options": {
    "alternatives": true,
    "trafficModel": "best_guess",
    "avoid": []
  }
}
```

**Request Body Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `origin` | string | Yes | Starting point (address or coordinates) |
| `destination` | string | Yes | Destination point (address or coordinates) |
| `motorData` | object | No | Motor data for fuel calculations |
| `motorData.fuelEfficiency` | number | No | Fuel efficiency in km/L |
| `options` | object | No | Route options |
| `options.alternatives` | boolean | No | Include alternative routes (default: true) |
| `options.trafficModel` | string | No | Traffic model (default: "best_guess") |
| `options.avoid` | array | No | Things to avoid (e.g., ["tolls", "highways"]) |

### Response

**Success Response (200 OK):**
```json
{
  "routes": [
    {
      "id": "route_1",
      "summary": "Fastest route",
      "distance": {
        "value": 15000,
        "text": "15.0 km"
      },
      "duration": {
        "value": 1200,
        "text": "20 mins"
      },
      "duration_in_traffic": {
        "value": 1500,
        "text": "25 mins"
      },
      "legs": [
        {
          "distance": {
            "value": 15000,
            "text": "15.0 km"
          },
          "duration": {
            "value": 1200,
            "text": "20 mins"
          },
          "duration_in_traffic": {
            "value": 1500,
            "text": "25 mins"
          },
          "start_address": "Manila, Philippines",
          "end_address": "Makati, Philippines"
        }
      ],
      "overview_polyline": {
        "points": "encoded_polyline_string"
      },
      "fuelConsumed": 0.3,
      "fuelCost": 0.45,
      "efficiency": 50
    }
  ],
  "mainRoute": { ... },
  "alternatives": [ ... ],
  "fuelEstimates": [
    {
      "routeId": "route_1",
      "fuelConsumed": 0.3,
      "fuelCost": 0.45
    }
  ],
  "trafficAnalysis": {
    "currentConditions": "moderate",
    "delays": [
      {
        "routeId": "route_1",
        "delay": 300,
        "delayPercentage": 25
      }
    ],
    "recommendations": [ ... ]
  },
  "performance": {
    "routesProcessed": 1,
    "processingTime": 45,
    "apiCalls": 1
  }
}
```

### Example Request

```javascript
POST /api/routes/process-directions
Content-Type: application/json

{
  "origin": "14.5995,120.9842",
  "destination": "14.5547,121.0244",
  "motorData": {
    "fuelEfficiency": 50
  },
  "options": {
    "alternatives": true
  }
}
```

### Frontend Example

```javascript
const getRoute = async (origin, destination, motorData = null) => {
  try {
    const response = await fetch(
      'http://your-api-url/api/routes/process-directions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          origin,
          destination,
          motorData,
          options: {
            alternatives: true,
            trafficModel: 'best_guess'
          }
        })
      }
    );

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error getting route:', error);
    throw error;
  }
};

// Usage with addresses
await getRoute('Manila, Philippines', 'Makati, Philippines', {
  fuelEfficiency: 50
});

// Usage with coordinates
await getRoute('14.5995,120.9842', '14.5547,121.0244', {
  fuelEfficiency: 50
});
```

---

## Update Fuel Level

### Endpoint
```
PUT /api/user-motors/:id/fuel
```

### Description
Update the fuel level for a user's motor. The fuel level is a percentage (0-100).

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | User Motor ID |

### Request Body

```json
{
  "currentFuelLevel": 75
}
```

**Request Body Fields:**

| Field | Type | Required | Description | Valid Range |
|-------|------|----------|-------------|-------------|
| `currentFuelLevel` | number | Yes | Fuel level percentage | 0-100 |

### Response

**Success Response (200 OK):**
```json
{
  "msg": "Fuel level updated successfully (backend)",
  "motor": {
    "_id": "507f1f77bcf86cd799439011",
    "nickname": "My Motorcycle",
    "currentFuelLevel": 75,
    "totalDrivableDistance": 600,
    "totalDrivableDistanceWithCurrentGas": 450,
    "isLowFuel": false
  }
}
```

### Example Request

```javascript
PUT /api/user-motors/507f1f77bcf86cd799439011/fuel
Content-Type: application/json

{
  "currentFuelLevel": 75
}
```

### Frontend Example

```javascript
const updateFuelLevel = async (motorId, fuelLevel) => {
  try {
    const response = await fetch(
      `http://your-api-url/api/user-motors/${motorId}/fuel`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentFuelLevel: fuelLevel // 0-100
        })
      }
    );

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error updating fuel level:', error);
    throw error;
  }
};

// Usage
await updateFuelLevel('motor-id', 75); // Set fuel level to 75%
```

---

## Update Gas Price

### Endpoint
```
PUT /api/gas-stations/:id/price
```

### Description
Update the price of a specific fuel type for a gas station. Automatically tracks price changes in the price history. **Requires authentication.**

### Authentication
This endpoint requires authentication. Include a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Gas Station ID |

### Request Body

```json
{
  "fuelType": "gasoline",
  "newPrice": 65.50
}
```

**Request Body Fields:**

| Field | Type | Required | Description | Valid Values |
|-------|------|----------|-------------|--------------|
| `fuelType` | string | Yes | Type of fuel | `gasoline`, `diesel`, `premium_gasoline`, `premium_diesel`, `lpg` |
| `newPrice` | number | Yes | New price per liter | Must be a positive number |

### Response

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Price updated successfully",
  "data": {
    "station": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Shell Station",
      "prices": [
        {
          "fuelType": "gasoline",
          "price": 65.50,
          "currency": "PHP",
          "lastUpdated": "2024-01-15T10:30:00.000Z"
        }
      ],
      "priceHistory": [
        {
          "fuelType": "gasoline",
          "oldPrice": 64.50,
          "newPrice": 65.50,
          "updatedBy": {
            "_id": "507f1f77bcf86cd799439012",
            "name": "John Doe",
            "email": "john@example.com"
          },
          "updatedAt": "2024-01-15T10:30:00.000Z"
        }
      ],
      "lastUpdated": "2024-01-15T10:30:00.000Z"
    },
    "update": {
      "fuelType": "gasoline",
      "oldPrice": 64.50,
      "newPrice": 65.50,
      "changed": true
    }
  }
}
```

### Example Request

```javascript
PUT /api/gas-stations/507f1f77bcf86cd799439011/price
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "fuelType": "gasoline",
  "newPrice": 65.50
}
```

### Frontend Example

```javascript
const updateGasPrice = async (stationId, fuelType, newPrice, token) => {
  try {
    const response = await fetch(
      `http://your-api-url/api/gas-stations/${stationId}/price`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fuelType,
          newPrice
        })
      }
    );

    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Error updating gas price:', error);
    throw error;
  }
};

// Usage
const token = localStorage.getItem('token');
await updateGasPrice('station-id', 'gasoline', 65.50, token);
```

---

## Get Gas Prices

### Endpoint
```
GET /api/gas-stations/:id/prices
```

### Description
Get all current prices for a specific gas station.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Gas Station ID |

### Response

**Success Response (200 OK):**
```json
[
  {
    "fuelType": "gasoline",
    "price": 65.50,
    "currency": "PHP",
    "lastUpdated": "2024-01-15T10:30:00.000Z"
  },
  {
    "fuelType": "diesel",
    "price": 58.75,
    "currency": "PHP",
    "lastUpdated": "2024-01-15T09:15:00.000Z"
  },
  {
    "fuelType": "premium_gasoline",
    "price": 70.25,
    "currency": "PHP",
    "lastUpdated": "2024-01-15T08:00:00.000Z"
  }
]
```

### Example Request

```javascript
GET /api/gas-stations/507f1f77bcf86cd799439011/prices
```

### Frontend Example

```javascript
const getGasPrices = async (stationId) => {
  try {
    const response = await fetch(
      `http://your-api-url/api/gas-stations/${stationId}/prices`
    );

    const prices = await response.json();
    return prices;
  } catch (error) {
    console.error('Error getting gas prices:', error);
    throw error;
  }
};

// Usage
const prices = await getGasPrices('station-id');

// Get specific fuel type price
const gasolinePrice = prices.find(p => p.fuelType === 'gasoline')?.price;
```

---

## Summary Table

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/reports/:id/vote` | POST | No | Vote on report (upvote/downvote) |
| `/api/reports/:id` | PUT | No | Update report |
| `/api/routes/process-directions` | POST | No | Get Google Maps route from point A to B |
| `/api/user-motors/:id/fuel` | PUT | No | Update fuel level |
| `/api/gas-stations/:id/price` | PUT | Yes | Update gas price |
| `/api/gas-stations/:id/prices` | GET | No | Get gas prices |

---

## Error Handling

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "msg": "Validation error message",
  "error": "Detailed error message"
}
```

### 404 Not Found
```json
{
  "msg": "Resource not found",
  "error": "Detailed error message"
}
```

### 401 Unauthorized (for protected endpoints)
```json
{
  "success": false,
  "message": "Authentication required. Please login."
}
```

### 500 Internal Server Error
```json
{
  "msg": "Server error",
  "error": "Detailed error message"
}
```

---

## Notes

1. **Vote Endpoint**: 
   - Voting the same way again removes the vote
   - Voting differently switches the vote
   - Returns total votes in response

2. **Update Report**:
   - Cannot update `_id`, `createdAt`, `updatedAt`
   - Description max length is 500 characters

3. **Route Directions**:
   - Origin and destination can be addresses or coordinates
   - Returns multiple routes if alternatives are enabled
   - Includes fuel estimates if motor data is provided

4. **Fuel Level**:
   - Fuel level is a percentage (0-100)
   - Automatically calculates drivable distance

5. **Gas Price Update**:
   - Requires authentication
   - Automatically tracks price history
   - Only adds to history if price actually changes

6. **Get Gas Prices**:
   - Returns array of all fuel types and their prices
   - Includes last updated timestamp for each price

---

## Quick Reference Examples

### Vote on Report
```javascript
POST /api/reports/:id/vote
{ "userId": "...", "vote": 1 } // 1 = upvote, -1 = downvote
```

### Update Report
```javascript
PUT /api/reports/:id
{ "description": "...", "reportType": "Traffic Jam" }
```

### Get Route
```javascript
POST /api/routes/process-directions
{ "origin": "...", "destination": "...", "motorData": { "fuelEfficiency": 50 } }
```

### Update Fuel Level
```javascript
PUT /api/user-motors/:id/fuel
{ "currentFuelLevel": 75 } // 0-100
```

### Update Gas Price
```javascript
PUT /api/gas-stations/:id/price
Authorization: Bearer <token>
{ "fuelType": "gasoline", "newPrice": 65.50 }
```

### Get Gas Prices
```javascript
GET /api/gas-stations/:id/prices
```

---

For more detailed documentation, please refer to:
- `API_ENDPOINTS_GUIDE.md` - Complete API documentation
- `GAS_PRICE_UPDATE_API_DOCUMENTATION.md` - Gas price update guide





