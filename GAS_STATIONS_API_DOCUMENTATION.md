# Gas Stations API - Complete Documentation

## Overview

This guide provides complete documentation for the Gas Stations API. The API allows users to find, view, and interact with gas stations, including viewing current fuel prices, price history, and location-based searches. The API supports geospatial queries for finding nearby gas stations and comprehensive price tracking.

---

## Table of Contents

1. [API Endpoints](#api-endpoints)
2. [Base URL](#base-url)
3. [Authentication](#authentication)
4. [Get All Gas Stations](#get-all-gas-stations)
5. [Get Nearby Gas Stations](#get-nearby-gas-stations)
6. [Get Gas Station by ID](#get-gas-station-by-id)
7. [Get Gas Station Prices](#get-gas-station-prices)
8. [Update Gas Station Price](#update-gas-station-price)
9. [Get Price History](#get-price-history)
10. [Get Price History by Station (Alternative)](#get-price-history-by-station-alternative)
11. [Get Gas Station Analytics](#get-gas-station-analytics)
12. [Import Gas Stations from Google](#import-gas-stations-from-google)
13. [Data Models](#data-models)
14. [Error Handling](#error-handling)
15. [Frontend Integration Examples](#frontend-integration-examples)
16. [Best Practices](#best-practices)

---

## Base URL

```
/api/gas-stations
```

---

## Authentication

Most endpoints are public and do not require authentication. However, some operations (like updating prices) may require authentication depending on your application's security requirements.

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

## Get All Gas Stations

### Endpoint Description

**Purpose:** Retrieves a list of all gas stations with optional filtering, pagination, and location-based queries. Supports filtering by name, brand, location radius, and viewport bounds.

**When to Use:** Use this endpoint when you need to:
- Display a list of gas stations in your application
- Filter gas stations by brand or name
- Get gas stations within a specific area or radius
- Implement pagination for large datasets
- Filter stations within a map viewport

### Request Method and URL

**HTTP Method:** `GET`

**Endpoint URL:**
```
GET /api/gas-stations
```

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 20 | Number of results per page |
| `name` | string | - | Filter by station name (case-insensitive partial match) |
| `brand` | string | - | Filter by brand name (case-insensitive partial match) |
| `sortBy` | string | "name" | Field to sort by (`name`, `brand`, `createdAt`, `updatedAt`) |
| `sortOrder` | string | "asc" | Sort order (`asc` or `desc`) |
| `lat` | number | - | Latitude for location-based filtering |
| `lng` | number | - | Longitude for location-based filtering |
| `radius` | number | 10 | Radius in kilometers for location-based filtering (requires lat/lng) |
| `includeInvalid` | boolean | false | Include stations with invalid coordinates |
| `viewport` | JSON string | - | Viewport bounds for filtering (see Viewport Options below) |

**Viewport Options:**
```json
{
  "north": 14.7,
  "south": 14.5,
  "east": 121.1,
  "west": 120.9
}
```

### Example Requests

```javascript
// Basic request - get all gas stations
GET /api/gas-stations

// With pagination
GET /api/gas-stations?page=1&limit=10

// Filter by brand
GET /api/gas-stations?brand=Shell

// Filter by name
GET /api/gas-stations?name=Station

// Location-based search (within 5km radius)
GET /api/gas-stations?lat=14.5995&lng=120.9842&radius=5

// With viewport bounds
GET /api/gas-stations?viewport={"north":14.7,"south":14.5,"east":121.1,"west":120.9}

// Sort by brand descending
GET /api/gas-stations?sortBy=brand&sortOrder=desc
```

### Response Schema

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Shell Station EDSA",
      "brand": "Shell",
      "location": {
        "type": "Point",
        "coordinates": [120.9842, 14.5995]
      },
      "address": "EDSA, Quezon City",
      "city": "Quezon City",
      "state": "Metro Manila",
      "country": "Philippines",
      "postalCode": "1100",
      "phone": "+6321234567",
      "email": "station@shell.com",
      "website": "https://www.shell.com",
      "services": ["fuel", "car_wash", "convenience_store", "atm"],
      "fuelTypes": ["gasoline", "diesel", "premium_gasoline"],
      "prices": [
        {
          "fuelType": "gasoline",
          "price": 65.50,
          "currency": "PHP",
          "lastUpdated": "2024-01-15T10:30:00.000Z"
        },
        {
          "fuelType": "diesel",
          "price": 62.00,
          "currency": "PHP",
          "lastUpdated": "2024-01-15T10:30:00.000Z"
        }
      ],
      "operatingHours": {
        "monday": {
          "open": "06:00",
          "close": "22:00",
          "is24Hours": false
        },
        "tuesday": {
          "open": "06:00",
          "close": "22:00",
          "is24Hours": false
        }
      },
      "amenities": ["parking", "restroom", "wifi", "security"],
      "rating": 4.5,
      "reviewCount": 120,
      "isVerified": true,
      "isActive": true,
      "lastUpdated": "2024-01-15T10:30:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "totalPages": 5,
  "currentPage": 1,
  "total": 100,
  "statistics": {
    "total": 100,
    "filtered": 95,
    "removed": 5
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Indicates if the request was successful |
| `data` | array | Array of gas station objects |
| `totalPages` | number | Total number of pages |
| `currentPage` | number | Current page number |
| `total` | number | Total number of gas stations matching the filter |
| `statistics.total` | number | Total stations before filtering invalid ones |
| `statistics.filtered` | number | Total stations after filtering invalid ones |
| `statistics.removed` | number | Number of invalid stations removed |

### Error Handling

**Error Response (500 Internal Server Error):**
```json
{
  "success": false,
  "message": "Server error getting gas stations",
  "error": "Error details here"
}
```

---

## Get Nearby Gas Stations

### Endpoint Description

**Purpose:** Finds gas stations near a specific location using geospatial queries. This is optimized for location-based searches and returns stations sorted by distance.

**When to Use:** Use this endpoint when you need to:
- Find gas stations near the user's current location
- Display nearby stations on a map
- Show the closest gas stations to a destination
- Implement location-based recommendations

### Request Method and URL

**HTTP Method:** `GET`

**Endpoint URL:**
```
GET /api/gas-stations/nearby
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `lat` | number | Yes | Latitude coordinate |
| `lng` | number | Yes | Longitude coordinate |
| `radius` | number | No | Search radius in kilometers (default: 5) |
| `limit` | number | No | Maximum number of results (default: 20) |

### Example Requests

```javascript
// Find nearby stations (default 5km radius)
GET /api/gas-stations/nearby?lat=14.5995&lng=120.9842

// Find nearby stations within 10km
GET /api/gas-stations/nearby?lat=14.5995&lng=120.9842&radius=10

// Find nearby stations with limit
GET /api/gas-stations/nearby?lat=14.5995&lng=120.9842&radius=5&limit=10
```

### Response Schema

**Success Response (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Shell Station EDSA",
    "brand": "Shell",
    "location": {
      "type": "Point",
      "coordinates": [120.9842, 14.5995]
    },
    "address": "EDSA, Quezon City",
    "prices": [
      {
        "fuelType": "gasoline",
        "price": 65.50,
        "currency": "PHP"
      }
    ],
    "isActive": true
  }
]
```

**Error Response (400 Bad Request):**
```json
{
  "message": "Latitude and longitude are required"
}
```

---

## Get Gas Station by ID

### Endpoint Description

**Purpose:** Retrieves detailed information about a specific gas station by its ID.

**When to Use:** Use this endpoint when you need to:
- Display detailed information about a specific gas station
- Show full station details on a detail page
- Get complete price and service information

### Request Method and URL

**HTTP Method:** `GET`

**Endpoint URL:**
```
GET /api/gas-stations/:id
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Gas station MongoDB ObjectId |

### Example Request

```javascript
GET /api/gas-stations/507f1f77bcf86cd799439011
```

### Response Schema

**Success Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Shell Station EDSA",
  "brand": "Shell",
  "location": {
    "type": "Point",
    "coordinates": [120.9842, 14.5995]
  },
  "address": "EDSA, Quezon City",
  "city": "Quezon City",
  "state": "Metro Manila",
  "country": "Philippines",
  "postalCode": "1100",
  "phone": "+6321234567",
  "email": "station@shell.com",
  "website": "https://www.shell.com",
  "services": ["fuel", "car_wash", "convenience_store", "atm"],
  "fuelTypes": ["gasoline", "diesel", "premium_gasoline"],
  "prices": [
    {
      "fuelType": "gasoline",
      "price": 65.50,
      "currency": "PHP",
      "lastUpdated": "2024-01-15T10:30:00.000Z"
    },
    {
      "fuelType": "diesel",
      "price": 62.00,
      "currency": "PHP",
      "lastUpdated": "2024-01-15T10:30:00.000Z"
    }
  ],
  "operatingHours": {
    "monday": {
      "open": "06:00",
      "close": "22:00",
      "is24Hours": false
    }
  },
  "amenities": ["parking", "restroom", "wifi", "security"],
  "rating": 4.5,
  "reviewCount": 120,
  "isVerified": true,
  "isActive": true,
  "lastUpdated": "2024-01-15T10:30:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Response (404 Not Found):**
```json
{
  "message": "Gas station not found"
}
```

---

## Get Gas Station Prices

### Endpoint Description

**Purpose:** Retrieves only the current fuel prices for a specific gas station.

**When to Use:** Use this endpoint when you need to:
- Display only price information without full station details
- Update price displays quickly
- Show prices in a compact format

### Request Method and URL

**HTTP Method:** `GET`

**Endpoint URL:**
```
GET /api/gas-stations/:id/prices
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Gas station MongoDB ObjectId |

### Example Request

```javascript
GET /api/gas-stations/507f1f77bcf86cd799439011/prices
```

### Response Schema

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
    "price": 62.00,
    "currency": "PHP",
    "lastUpdated": "2024-01-15T10:30:00.000Z"
  },
  {
    "fuelType": "premium_gasoline",
    "price": 68.00,
    "currency": "PHP",
    "lastUpdated": "2024-01-15T10:30:00.000Z"
  }
]
```

**Error Response (404 Not Found):**
```json
{
  "message": "Gas station not found"
}
```

---

## Update Gas Station Price

### Endpoint Description

**Purpose:** Updates the price of a specific fuel type for a gas station and automatically tracks the change in price history. This endpoint requires authentication.

**When to Use:** Use this endpoint when you need to:
- Allow users to update fuel prices
- Track price changes over time
- Maintain accurate price information

**Note:** This endpoint requires authentication. The user ID is automatically extracted from the authenticated user.

### Request Method and URL

**HTTP Method:** `PUT`

**Endpoint URL:**
```
PUT /api/gas-stations/:id/price
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Gas station MongoDB ObjectId |

### Request Body

```json
{
  "fuelType": "gasoline",
  "newPrice": 66.50
}
```

**Request Body Fields:**

| Field | Type | Required | Description | Valid Values |
|-------|------|----------|-------------|--------------|
| `fuelType` | string | Yes | Type of fuel to update | `gasoline`, `diesel`, `premium_gasoline`, `premium_diesel`, `lpg` |
| `newPrice` | number | Yes | New price value | Must be a positive number |

### Example Request

```javascript
PUT /api/gas-stations/507f1f77bcf86cd799439011/price
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "fuelType": "gasoline",
  "newPrice": 66.50
}
```

### Response Schema

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Price updated successfully",
  "data": {
    "station": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Shell Station EDSA",
      "prices": [
        {
          "fuelType": "gasoline",
          "price": 66.50,
          "currency": "PHP",
          "lastUpdated": "2024-01-15T11:00:00.000Z"
        }
      ],
      "priceHistory": [
        {
          "fuelType": "gasoline",
          "oldPrice": 65.50,
          "newPrice": 66.50,
          "updatedBy": {
            "_id": "507f1f77bcf86cd799439012",
            "name": "John Doe",
            "email": "john@example.com"
          },
          "updatedAt": "2024-01-15T11:00:00.000Z"
        }
      ],
      "lastUpdated": "2024-01-15T11:00:00.000Z"
    },
    "update": {
      "fuelType": "gasoline",
      "oldPrice": 65.50,
      "newPrice": 66.50,
      "changed": true
    }
  }
}
```

**Error Responses:**

**400 Bad Request - Missing Fields:**
```json
{
  "success": false,
  "message": "fuelType and newPrice are required"
}
```

**400 Bad Request - Invalid Fuel Type:**
```json
{
  "success": false,
  "message": "Invalid fuelType. Must be one of: gasoline, diesel, premium_gasoline, premium_diesel, lpg"
}
```

**400 Bad Request - Invalid Price:**
```json
{
  "success": false,
  "message": "newPrice must be a positive number"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Authentication required. Please login."
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Gas station not found"
}
```

---

## Get Price History

### Endpoint Description

**Purpose:** Retrieves the price history for a specific gas station. This endpoint returns price changes tracked in the gas station's embedded price history.

**When to Use:** Use this endpoint when you need to:
- Display price trends over time
- Show price change history
- Analyze price fluctuations
- Create price charts and graphs

### Request Method and URL

**HTTP Method:** `GET`

**Endpoint URL:**
```
GET /api/gas-stations/:id/price-history
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Gas station MongoDB ObjectId |

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `fuelType` | string | - | Filter by fuel type (`gasoline`, `diesel`, `premium_gasoline`, `premium_diesel`, `lpg`) |
| `limit` | number | 50 | Maximum number of history entries to return |

### Example Requests

```javascript
// Get all price history
GET /api/gas-stations/507f1f77bcf86cd799439011/price-history

// Get price history for gasoline only
GET /api/gas-stations/507f1f77bcf86cd799439011/price-history?fuelType=gasoline

// Get last 20 price changes
GET /api/gas-stations/507f1f77bcf86cd799439011/price-history?limit=20

// Get gasoline price history with limit
GET /api/gas-stations/507f1f77bcf86cd799439011/price-history?fuelType=gasoline&limit=30
```

### Response Schema

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "stationId": "507f1f77bcf86cd799439011",
    "stationName": "Shell Station EDSA",
    "history": [
      {
        "fuelType": "gasoline",
        "oldPrice": 65.50,
        "newPrice": 66.50,
        "updatedBy": {
          "_id": "507f1f77bcf86cd799439012",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "updatedAt": "2024-01-15T11:00:00.000Z"
      },
      {
        "fuelType": "gasoline",
        "oldPrice": 64.50,
        "newPrice": 65.50,
        "updatedBy": {
          "_id": "507f1f77bcf86cd799439013",
          "name": "Jane Smith",
          "email": "jane@example.com"
        },
        "updatedAt": "2024-01-14T10:30:00.000Z"
      }
    ],
    "count": 2
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Indicates if the request was successful |
| `data.stationId` | string | Gas station ID |
| `data.stationName` | string | Gas station name |
| `data.history` | array | Array of price history entries |
| `data.history[].fuelType` | string | Type of fuel |
| `data.history[].oldPrice` | number | Previous price |
| `data.history[].newPrice` | number | New price |
| `data.history[].updatedBy` | object | User who updated the price |
| `data.history[].updatedAt` | string | Date and time of update |
| `data.count` | number | Number of history entries returned |

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Gas station not found"
}
```

---

## Get Price History by Station (Alternative)

### Endpoint Description

**Purpose:** Alternative endpoint to retrieve price history using the PriceHistory collection. This endpoint returns history entries from a separate collection that tracks all price updates.

**When to Use:** Use this endpoint when you need to:
- Access comprehensive price history from a dedicated collection
- Get history entries with source information (admin, user, scraped)
- View price updates with date information

### Request Method and URL

**HTTP Method:** `GET`

**Endpoint URL:**
```
GET /api/gas-stations/history/:id
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Gas station MongoDB ObjectId |

### Example Request

```javascript
GET /api/gas-stations/history/507f1f77bcf86cd799439011
```

### Response Schema

**Success Response (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439014",
    "stationId": "507f1f77bcf86cd799439011",
    "updatedBy": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "prices": {
      "gasoline": 66.50,
      "diesel": 62.00,
      "premium": 68.00
    },
    "source": "user",
    "date": "2024-01-15T11:00:00.000Z",
    "createdAt": "2024-01-15T11:00:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439015",
    "stationId": "507f1f77bcf86cd799439011",
    "updatedBy": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Admin User",
      "email": "admin@example.com"
    },
    "prices": {
      "gasoline": 65.50,
      "diesel": 62.00,
      "premium": 68.00
    },
    "source": "admin",
    "date": "2024-01-14T10:30:00.000Z",
    "createdAt": "2024-01-14T10:30:00.000Z",
    "updatedAt": "2024-01-14T10:30:00.000Z"
  }
]
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `_id` | string | Price history entry ID |
| `stationId` | string | Gas station ID |
| `updatedBy` | object | User who updated the prices |
| `prices` | object | Price object with fuel types and values |
| `prices.gasoline` | number | Gasoline price |
| `prices.diesel` | number | Diesel price |
| `prices.premium` | number | Premium fuel price |
| `source` | string | Source of update (`admin`, `user`, `scraped`) |
| `date` | string | Date of price update |
| `createdAt` | string | Entry creation date |
| `updatedAt` | string | Entry last update date |

**Error Response (404 Not Found):**
```json
{
  "msg": "No history found for this station."
}
```

---

## Get Gas Station Analytics

### Endpoint Description

**Purpose:** Retrieves analytics and statistics about gas stations in the database, including total count, brand distribution, and average prices.

**When to Use:** Use this endpoint when you need to:
- Display dashboard statistics
- Show brand distribution
- Calculate average fuel prices
- Generate analytics reports

### Request Method and URL

**HTTP Method:** `GET`

**Endpoint URL:**
```
GET /api/gas-stations/analytics
```

### Example Request

```javascript
GET /api/gas-stations/analytics
```

### Response Schema

**Success Response (200 OK):**
```json
{
  "total": 150,
  "brands": [
    {
      "_id": "Shell",
      "count": 45
    },
    {
      "_id": "Petron",
      "count": 38
    },
    {
      "_id": "Caltex",
      "count": 32
    },
    {
      "_id": "Phoenix",
      "count": 20
    },
    {
      "_id": "Unioil",
      "count": 15
    }
  ],
  "avgPrices": {
    "avgGasoline": 65.25,
    "avgDiesel": 61.80
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `total` | number | Total number of gas stations |
| `brands` | array | Array of brand distribution |
| `brands[]._id` | string | Brand name |
| `brands[].count` | number | Number of stations for this brand |
| `avgPrices` | object | Average price statistics |
| `avgPrices.avgGasoline` | number | Average gasoline price across all stations |
| `avgPrices.avgDiesel` | number | Average diesel price across all stations |

---

## Import Gas Stations from Google

### Endpoint Description

**Purpose:** Imports gas stations from Google Places API based on a location. This endpoint searches for gas stations near the provided coordinates and saves new stations to the database.

**When to Use:** Use this endpoint when you need to:
- Populate the database with gas stations from Google
- Import stations for a new area
- Sync with Google Places data

**Note:** This endpoint requires a Google Maps API key configured in the environment.

### Request Method and URL

**HTTP Method:** `GET`

**Endpoint URL:**
```
GET /api/gas-stations/import
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `lat` | number | Yes | Latitude coordinate |
| `lng` | number | Yes | Longitude coordinate |

### Example Request

```javascript
GET /api/gas-stations/import?lat=14.5995&lng=120.9842
```

### Response Schema

**Success Response (200 OK):**
```json
{
  "msg": "Imported 15 new gas station(s)"
}
```

**Error Response (400 Bad Request):**
```json
{
  "msg": "Latitude and longitude are required"
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "msg": "Import failed",
  "error": "Error details here"
}
```

---

## Data Models

### Gas Station Schema

```javascript
{
  _id: ObjectId,                    // MongoDB document ID
  name: String,                     // Station name (required)
  brand: String,                    // Brand name (e.g., "Shell", "Petron")
  location: {
    type: String,                   // Always "Point"
    coordinates: [Number, Number]    // [longitude, latitude]
  },
  address: String,                   // Street address
  city: String,                     // City name
  state: String,                    // State/Province
  country: String,                   // Country (default: "Philippines")
  postalCode: String,               // Postal/ZIP code
  phone: String,                    // Phone number
  email: String,                    // Email address
  website: String,                  // Website URL
  services: [String],               // Available services
  fuelTypes: [String],              // Available fuel types
  prices: [{                        // Current prices
    fuelType: String,               // "gasoline", "diesel", etc.
    price: Number,                  // Price value
    currency: String,               // Currency code (default: "PHP")
    lastUpdated: Date               // Last update timestamp
  }],
  priceHistory: [{                   // Embedded price history
    fuelType: String,
    oldPrice: Number,
    newPrice: Number,
    updatedBy: ObjectId,           // Reference to User
    updatedAt: Date
  }],
  operatingHours: {
    monday: {
      open: String,                 // Opening time (HH:mm)
      close: String,                 // Closing time (HH:mm)
      is24Hours: Boolean            // 24/7 operation flag
    },
    // ... other days
  },
  amenities: [String],              // Available amenities
  rating: Number,                   // Average rating (0-5)
  reviewCount: Number,             // Number of reviews
  isVerified: Boolean,              // Verification status
  isActive: Boolean,               // Active status
  lastUpdated: Date,                // Last update timestamp
  createdAt: Date,                  // Creation timestamp
  updatedAt: Date                   // Last modification timestamp
}
```

### Price History Schema (Separate Collection)

```javascript
{
  _id: ObjectId,                    // MongoDB document ID
  stationId: ObjectId,              // Reference to GasStation
  updatedBy: ObjectId,              // Reference to User
  prices: {
    gasoline: Number,               // Gasoline price
    diesel: Number,                // Diesel price
    premium: Number                 // Premium fuel price
  },
  source: String,                   // "admin" | "user" | "scraped"
  date: Date,                       // Price update date
  createdAt: Date,                  // Entry creation date
  updatedAt: Date                   // Entry last update date
}
```

### Valid Fuel Types

- `gasoline` - Regular gasoline
- `diesel` - Regular diesel
- `premium_gasoline` - Premium gasoline
- `premium_diesel` - Premium diesel
- `lpg` - Liquefied Petroleum Gas

### Valid Services

- `fuel` - Fuel service
- `car_wash` - Car wash service
- `convenience_store` - Convenience store
- `restaurant` - Restaurant
- `atm` - ATM machine
- `air_pump` - Air pump
- `tire_service` - Tire service

### Valid Amenities

- `parking` - Parking available
- `restroom` - Restroom facilities
- `wifi` - WiFi available
- `security` - Security services
- `lighting` - Good lighting
- `covered` - Covered area
- `accessible` - Accessible for disabled

---

## Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "message": "Latitude and longitude are required"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Authentication required. Please login."
}
```

**404 Not Found:**
```json
{
  "message": "Gas station not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Server error getting gas stations",
  "error": "Error details here"
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

### React/JavaScript Example

#### 1. Get Nearby Gas Stations

```javascript
// Get nearby gas stations function
const getNearbyGasStations = async (latitude, longitude, radius = 5) => {
  try {
    const response = await fetch(
      `/api/gas-stations/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch nearby gas stations');
    }

    const stations = await response.json();
    return stations;
  } catch (error) {
    console.error('Error fetching nearby gas stations:', error);
    throw error;
  }
};

// Usage example
const loadNearbyStations = async () => {
  try {
    // Get user's current location
    const position = await getCurrentPosition();
    const stations = await getNearbyGasStations(
      position.coords.latitude,
      position.coords.longitude,
      10 // 10km radius
    );
    
    setGasStations(stations);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

#### 2. Get Gas Station Details

```javascript
// Get gas station details function
const getGasStationDetails = async (stationId) => {
  try {
    const response = await fetch(`/api/gas-stations/${stationId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch gas station details');
    }

    const station = await response.json();
    return station;
  } catch (error) {
    console.error('Error fetching gas station details:', error);
    throw error;
  }
};

// Usage example
const loadStationDetails = async (stationId) => {
  try {
    const station = await getGasStationDetails(stationId);
    setSelectedStation(station);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

#### 3. Get Price History

```javascript
// Get price history function
const getPriceHistory = async (stationId, fuelType = null, limit = 50) => {
  try {
    let url = `/api/gas-stations/${stationId}/price-history?limit=${limit}`;
    if (fuelType) {
      url += `&fuelType=${fuelType}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch price history');
    }

    const data = await response.json();
    return data.data.history;
  } catch (error) {
    console.error('Error fetching price history:', error);
    throw error;
  }
};

// Usage example
const loadPriceHistory = async (stationId) => {
  try {
    const history = await getPriceHistory(stationId, 'gasoline', 30);
    setPriceHistory(history);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

#### 4. Update Gas Station Price

```javascript
// Update gas station price function
const updateGasStationPrice = async (stationId, fuelType, newPrice, token) => {
  try {
    const response = await fetch(`/api/gas-stations/${stationId}/price`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        fuelType,
        newPrice
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update price');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error updating price:', error);
    throw error;
  }
};

// Usage example
const handleUpdatePrice = async (stationId, fuelType, newPrice) => {
  try {
    const token = localStorage.getItem('token');
    const result = await updateGasStationPrice(stationId, fuelType, newPrice, token);
    
    alert('Price updated successfully!');
    // Refresh station data
    await loadStationDetails(stationId);
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
};
```

#### 5. React Hook for Gas Stations

```javascript
import { useState, useEffect } from 'react';

function useGasStations(filters = {}) {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        
        if (filters.page) queryParams.append('page', filters.page);
        if (filters.limit) queryParams.append('limit', filters.limit);
        if (filters.brand) queryParams.append('brand', filters.brand);
        if (filters.name) queryParams.append('name', filters.name);
        if (filters.lat && filters.lng) {
          queryParams.append('lat', filters.lat);
          queryParams.append('lng', filters.lng);
          if (filters.radius) queryParams.append('radius', filters.radius);
        }

        const response = await fetch(`/api/gas-stations?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch gas stations');
        }

        const data = await response.json();
        setStations(data.data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, [filters]);

  return { stations, loading, error };
}

// Usage in component
function GasStationList({ filters }) {
  const { stations, loading, error } = useGasStations(filters);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {stations.map(station => (
        <div key={station._id}>
          <h3>{station.name}</h3>
          <p>{station.brand}</p>
          <p>{station.address}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## Best Practices

### 1. Location-Based Queries

- **Use nearby endpoint** for location-based searches (more efficient)
- **Cache location data** to reduce API calls
- **Implement proper error handling** for location permission denials

### 2. Price Updates

- **Validate prices** before submitting
- **Show confirmation** before updating prices
- **Display price history** to users for transparency
- **Handle authentication** gracefully

### 3. Performance

- **Use pagination** for large datasets
- **Implement caching** for frequently accessed data
- **Filter on server side** using query parameters
- **Limit history queries** to reasonable amounts

### 4. User Experience

- **Show loading states** during API calls
- **Display error messages** clearly
- **Provide fallback data** when possible
- **Update UI optimistically** when appropriate

### 5. Data Validation

- **Validate coordinates** before making requests
- **Check fuel type** validity
- **Verify price ranges** are reasonable
- **Handle missing data** gracefully

---

## Support

For issues or questions regarding the Gas Stations API, please refer to the main API documentation or contact the development team.

---

**Last Updated:** January 2024  
**API Version:** 1.0

