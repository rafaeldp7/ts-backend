# API Endpoints Guide - Reports & Map Data Processing

## Overview

This guide provides complete documentation for the backend API endpoints related to reports, gas stations, and map data processing. All endpoints have been updated to filter archived and invalid data by default.

---

## Table of Contents

1. [Reports API](#reports-api)
2. [Gas Stations API](#gas-stations-api)
3. [Map Data Processing API](#map-data-processing-api)
4. [Response Formats](#response-formats)
5. [Error Handling](#error-handling)
6. [Frontend Integration Examples](#frontend-integration-examples)

---

## Reports API

### Base URL
```
/api/reports
```

---

### 1. Get All Non-Archived Reports (Default)

**Endpoint:** `GET /api/reports`

**Description:** Returns all reports that are not archived and have valid coordinates. This is the default behavior - archived and invalid reports are automatically filtered out.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `includeArchived` | boolean | `false` | Set to `true` to include archived reports |
| `includeInvalid` | boolean | `false` | Set to `true` to include reports with invalid coordinates |
| `filters` | JSON string | `null` | Filter object (see Filter Options below) |
| `viewport` | JSON string | `null` | Viewport bounds for filtering (see Viewport Options below) |

**Filter Options:**
```json
{
  "types": ["Accident", "Traffic Jam", "Road Closure", "Hazard"],
  "status": ["active", "resolved"]
}
```

**Viewport Options:**
```json
{
  "north": 14.7,
  "south": 14.5,
  "east": 121.1,
  "west": 120.9
}
```

**Example Request:**
```javascript
// Basic request - get all non-archived reports
GET /api/reports

// With filters
GET /api/reports?filters={"types":["Accident","Traffic Jam"]}

// With viewport
GET /api/reports?viewport={"north":14.7,"south":14.5,"east":121.1,"west":120.9}

// Include archived reports
GET /api/reports?includeArchived=true

// Combine parameters
GET /api/reports?includeArchived=false&filters={"types":["Accident"]}&viewport={"north":14.7,"south":14.5,"east":121.1,"west":120.9}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "reportType": "Accident",
      "description": "Car accident on main road",
      "address": "123 Main Street",
      "geocodedAddress": "123 Main Street, Manila, Philippines",
      "verified": {
        "verifiedByAdmin": 0,
        "verifiedByUser": 5
      },
      "votes": [
        {
          "userId": "507f1f77bcf86cd799439013",
          "vote": 1
        }
      ],
      "location": {
        "latitude": 14.5995,
        "longitude": 120.9842
      },
      "archived": false,
      "timestamp": "2024-01-15T10:30:00.000Z",
      "geocodingStatus": "success",
      "geocodingError": null
    }
  ],
  "statistics": {
    "total": 100,
    "filtered": 95,
    "removed": 5
  }
}
```

**Response Fields:**
- `success`: Boolean indicating if the request was successful
- `data`: Array of report objects
- `statistics`: Object containing filtering statistics
  - `total`: Total number of reports found
  - `filtered`: Number of reports after filtering
  - `removed`: Number of reports removed by filters

---

### 2. Get Archived Reports

**Endpoint:** `GET /api/reports/archived/all`

**Description:** Returns all archived reports.

**Example Request:**
```javascript
GET /api/reports/archived/all
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "reportType": "Accident",
    "archived": true,
    ...
  }
]
```

---

### 3. Get Reports by Type

**Endpoint:** `GET /api/reports/type/:type`

**Description:** Returns reports filtered by type.

**Path Parameters:**
- `type`: Report type (`Accident`, `Traffic Jam`, `Road Closure`, `Hazard`)

**Example Request:**
```javascript
GET /api/reports/type/Accident
```

---

### 4. Get Reports by User

**Endpoint:** `GET /api/reports/user/:userId`

**Description:** Returns all reports created by a specific user.

**Path Parameters:**
- `userId`: User ID

**Example Request:**
```javascript
GET /api/reports/user/507f1f77bcf86cd799439012
```

---

### 5. Get Reports by Date Range

**Endpoint:** `POST /api/reports/daterange`

**Description:** Returns reports within a specific date range.

**Request Body:**
```json
{
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-01-31T23:59:59.999Z"
}
```

**Example Request:**
```javascript
POST /api/reports/daterange
Content-Type: application/json

{
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-01-31T23:59:59.999Z"
}
```

---

### 6. Create Report

**Endpoint:** `POST /api/reports`

**Request Body:**
```json
{
  "reportType": "Accident",
  "description": "Car accident on main road",
  "location": {
    "latitude": 14.5995,
    "longitude": 120.9842
  },
  "address": "123 Main Street",
  "userId": "507f1f77bcf86cd799439012",
  "verified": {
    "verifiedByAdmin": 0,
    "verifiedByUser": 0
  }
}
```

---

### 7. Update Report

**Endpoint:** `PUT /api/reports/:id`

**Path Parameters:**
- `id`: Report ID

**Request Body:**
```json
{
  "description": "Updated description",
  "reportType": "Traffic Jam"
}
```

---

### 8. Archive Report

**Endpoint:** `PUT /api/reports/:id/archive`

**Path Parameters:**
- `id`: Report ID

**Example Request:**
```javascript
PUT /api/reports/507f1f77bcf86cd799439011/archive
```

---

### 9. Delete Report

**Endpoint:** `DELETE /api/reports/:id`

**Path Parameters:**
- `id`: Report ID

---

### 10. Vote on Report

**Endpoint:** `POST /api/reports/:id/vote`

**Path Parameters:**
- `id`: Report ID

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439012",
  "vote": 1
}
```

**Note:** `vote` can be `1` (upvote) or `-1` (downvote)

---

## Gas Stations API

### Base URL
```
/api/gas-stations
```

---

### 1. Get All Gas Stations (Filtered)

**Endpoint:** `GET /api/gas-stations`

**Description:** Returns all gas stations with valid coordinates. Invalid stations are automatically filtered out.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | `1` | Page number for pagination |
| `limit` | number | `20` | Number of results per page |
| `name` | string | `null` | Filter by name (case-insensitive) |
| `brand` | string | `null` | Filter by brand (case-insensitive) |
| `sortBy` | string | `name` | Field to sort by |
| `sortOrder` | string | `asc` | Sort order (`asc` or `desc`) |
| `lat` | number | `null` | Latitude for nearby search |
| `lng` | number | `null` | Longitude for nearby search |
| `radius` | number | `10` | Search radius in kilometers |
| `includeInvalid` | boolean | `false` | Set to `true` to include invalid stations |
| `viewport` | JSON string | `null` | Viewport bounds for filtering |

**Example Request:**
```javascript
// Basic request
GET /api/gas-stations

// With pagination
GET /api/gas-stations?page=1&limit=20

// Search nearby
GET /api/gas-stations?lat=14.5995&lng=120.9842&radius=5

// With viewport
GET /api/gas-stations?viewport={"north":14.7,"south":14.5,"east":121.1,"west":120.9}

// Filter by brand
GET /api/gas-stations?brand=Shell
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Shell Station",
      "brand": "Shell",
      "location": {
        "type": "Point",
        "coordinates": [120.9842, 14.5995]
      },
      "address": "123 Main Street",
      "city": "Manila",
      "state": "Metro Manila",
      "country": "Philippines",
      "isActive": true,
      "isVerified": true
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

---

### 2. Get Nearby Gas Stations

**Endpoint:** `GET /api/gas-stations/nearby`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `lat` | number | Yes | Latitude |
| `lng` | number | Yes | Longitude |
| `radius` | number | No | Search radius in kilometers (default: 5) |
| `limit` | number | No | Maximum number of results (default: 20) |

**Example Request:**
```javascript
GET /api/gas-stations/nearby?lat=14.5995&lng=120.9842&radius=5&limit=20
```

---

### 3. Get Single Gas Station

**Endpoint:** `GET /api/gas-stations/:id`

**Path Parameters:**
- `id`: Gas station ID

---

## Map Data Processing API

### Base URL
```
/api/map
```

---

### 1. Get Processed Map Data

**Endpoint:** `GET /api/map/processed-data`

**Description:** Returns all processed map data including filtered reports, gas stations, motors, markers, and clusters. This is a single endpoint that replaces multiple frontend processing steps.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `userId` | string | **Required** | User ID |
| `showReports` | boolean | `true` | Include reports in response |
| `showGasStations` | boolean | `true` | Include gas stations in response |
| `currentZoom` | number | `15` | Current map zoom level |
| `viewport` | JSON string | `null` | Viewport bounds for filtering |
| `mapFilters` | JSON string | `null` | Map filter options |

**Map Filters:**
```json
{
  "showTrafficReports": true,
  "showGasStations": true,
  "showAccidents": true,
  "showRoadwork": true,
  "showCongestion": true,
  "showHazards": true,
  "types": ["Accident", "Traffic Jam"],
  "status": ["active"]
}
```

**Example Request:**
```javascript
// Basic request
GET /api/map/processed-data?userId=507f1f77bcf86cd799439012

// With zoom and filters
GET /api/map/processed-data?userId=507f1f77bcf86cd799439012&currentZoom=12&mapFilters={"showAccidents":true,"showTrafficReports":false}

// With viewport
GET /api/map/processed-data?userId=507f1f77bcf86cd799439012&viewport={"north":14.7,"south":14.5,"east":121.1,"west":120.9}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "reportType": "Accident",
        "location": {
          "latitude": 14.5995,
          "longitude": 120.9842
        },
        ...
      }
    ],
    "gasStations": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Shell Station",
        "location": {
          "coordinates": [120.9842, 14.5995]
        },
        ...
      }
    ],
    "motors": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "nickname": "My Motorcycle",
        "currentFuelLevel": 75,
        ...
      }
    ],
    "markers": [
      {
        "id": "report_507f1f77bcf86cd799439011",
        "coordinate": {
          "latitude": 14.5995,
          "longitude": 120.9842
        },
        "title": "Accident",
        "description": "Car accident on main road",
        "pinColor": "#e74c3c",
        "type": "report",
        "report": { ... }
      },
      {
        "id": "station_507f1f77bcf86cd799439011",
        "coordinate": {
          "latitude": 14.5995,
          "longitude": 120.9842
        },
        "title": "Shell Station",
        "pinColor": "#FF0000",
        "type": "gasStation",
        "gasStation": { ... }
      }
    ],
    "clusters": [
      {
        "id": "cluster_0",
        "coordinate": {
          "latitude": 14.5995,
          "longitude": 120.9842
        },
        "count": 5,
        "markers": [...],
        "type": "report"
      }
    ],
    "statistics": {
      "totalReports": 100,
      "filteredReports": 95,
      "totalGasStations": 50,
      "filteredGasStations": 48,
      "totalMotors": 2,
      "markersGenerated": 143,
      "clustersGenerated": 5
    },
    "performance": {
      "processingTime": 45,
      "filteringTime": 12,
      "clusteringTime": 8,
      "markerGenerationTime": 15
    }
  }
}
```

---

### 2. Prepare Map Markers and Polylines

**Endpoint:** `POST /api/map/prepare-markers`

**Description:** Generates map markers and polylines from provided data.

**Request Body:**
```json
{
  "currentLocation": {
    "latitude": 14.5995,
    "longitude": 120.9842
  },
  "destination": {
    "latitude": 14.6042,
    "longitude": 120.9822,
    "address": "123 Main Street"
  },
  "selectedRoute": {
    "id": "route_1",
    "coordinates": [
      {
        "latitude": 14.5995,
        "longitude": 120.9842
      },
      {
        "latitude": 14.6042,
        "longitude": 120.9822
      }
    ]
  },
  "alternativeRoutes": [
    {
      "id": "route_2",
      "coordinates": [...]
    }
  ],
  "reports": [...],
  "gasStations": [...],
  "showReports": true,
  "showGasStations": true,
  "currentZoom": 15
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "markers": [...],
    "polylines": [
      {
        "id": "selected-route",
        "coordinates": [...],
        "strokeColor": "#1e3a8a",
        "strokeWidth": 8,
        "type": "route"
      },
      {
        "id": "alternative-route-0",
        "coordinates": [...],
        "strokeColor": "#3b82f6",
        "strokeWidth": 4,
        "type": "alternative"
      }
    ],
    "clusters": [...]
  },
  "performance": {
    "processingTime": 25,
    "markersGenerated": 50,
    "polylinesGenerated": 2,
    "clustersGenerated": 3
  }
}
```

---

### 3. Compare Reports for Changes

**Endpoint:** `POST /api/map/compare-reports`

**Description:** Compares two sets of reports to detect changes (added, removed, modified).

**Request Body:**
```json
{
  "currentReports": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "status": "active",
      "archived": false,
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "location": {
        "latitude": 14.5995,
        "longitude": 120.9842
      }
    }
  ],
  "freshReports": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "status": "resolved",
      "archived": false,
      "updatedAt": "2024-01-15T11:30:00.000Z",
      "location": {
        "latitude": 14.5995,
        "longitude": 120.9842
      }
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "hasChanges": true,
    "changes": {
      "added": ["507f1f77bcf86cd799439012"],
      "removed": ["507f1f77bcf86cd799439013"],
      "modified": [
        {
          "id": "507f1f77bcf86cd799439011",
          "changes": {
            "status": {
              "from": "active",
              "to": "resolved"
            }
          }
        }
      ]
    },
    "statistics": {
      "currentCount": 100,
      "freshCount": 101,
      "addedCount": 1,
      "removedCount": 1,
      "modifiedCount": 1
    }
  },
  "performance": {
    "processingTime": 15
  }
}
```

---

## Response Formats

### Success Response
All successful responses follow this format:
```json
{
  "success": true,
  "data": [...],
  "statistics": {...},
  "performance": {...}
}
```

### Error Response
All error responses follow this format:
```json
{
  "success": false,
  "error": "Error message",
  "message": "Human-readable error message"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request |
| `404` | Not Found |
| `500` | Internal Server Error |

---

## Error Handling

### Common Errors

1. **Missing Required Parameters**
   ```json
   {
     "success": false,
     "error": "User ID is required"
   }
   ```

2. **Invalid Data Format**
   ```json
   {
     "success": false,
     "error": "Invalid viewport format"
   }
   ```

3. **Not Found**
   ```json
   {
     "success": false,
     "error": "Report not found"
   }
   ```

---

## Frontend Integration Examples

### React/JavaScript Example

```javascript
// Get all non-archived reports
const fetchReports = async () => {
  try {
    const response = await fetch('http://your-api-url/api/reports');
    const result = await response.json();
    
    if (result.success) {
      const reports = result.data;
      console.log(`Found ${reports.length} reports`);
      return reports;
    } else {
      console.error('Error:', result.error);
      return [];
    }
  } catch (error) {
    console.error('Network error:', error);
    return [];
  }
};

// Get filtered reports
const fetchFilteredReports = async (filters) => {
  try {
    const queryParams = new URLSearchParams({
      filters: JSON.stringify(filters)
    });
    
    const response = await fetch(
      `http://your-api-url/api/reports?${queryParams}`
    );
    const result = await response.json();
    
    return result.success ? result.data : [];
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};

// Get processed map data
const fetchMapData = async (userId, options = {}) => {
  try {
    const {
      showReports = true,
      showGasStations = true,
      currentZoom = 15,
      viewport = null,
      mapFilters = null
    } = options;
    
    const queryParams = new URLSearchParams({
      userId,
      showReports,
      showGasStations,
      currentZoom
    });
    
    if (viewport) {
      queryParams.append('viewport', JSON.stringify(viewport));
    }
    
    if (mapFilters) {
      queryParams.append('mapFilters', JSON.stringify(mapFilters));
    }
    
    const response = await fetch(
      `http://your-api-url/api/map/processed-data?${queryParams}`
    );
    const result = await response.json();
    
    if (result.success) {
      return {
        reports: result.data.reports,
        gasStations: result.data.gasStations,
        markers: result.data.markers,
        clusters: result.data.clusters,
        statistics: result.data.statistics
      };
    } else {
      console.error('Error:', result.error);
      return null;
    }
  } catch (error) {
    console.error('Network error:', error);
    return null;
  }
};

// Compare reports
const compareReports = async (currentReports, freshReports) => {
  try {
    const response = await fetch('http://your-api-url/api/map/compare-reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        currentReports,
        freshReports
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      console.error('Error:', result.error);
      return null;
    }
  } catch (error) {
    console.error('Network error:', error);
    return null;
  }
};

// Usage examples
const main = async () => {
  // Get all non-archived reports
  const reports = await fetchReports();
  
  // Get filtered reports
  const filteredReports = await fetchFilteredReports({
    types: ['Accident', 'Traffic Jam']
  });
  
  // Get processed map data
  const mapData = await fetchMapData('user-id-123', {
    currentZoom: 12,
    viewport: {
      north: 14.7,
      south: 14.5,
      east: 121.1,
      west: 120.9
    },
    mapFilters: {
      showAccidents: true,
      showTrafficReports: true
    }
  });
  
  // Compare reports
  const comparison = await compareReports(currentReports, freshReports);
  if (comparison?.hasChanges) {
    console.log('Changes detected:', comparison.changes);
  }
};
```

### Axios Example

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://your-api-url/api';

// Get all non-archived reports
const getReports = async (params = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/reports`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
};

// Get processed map data
const getProcessedMapData = async (userId, options = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/map/processed-data`, {
      params: {
        userId,
        ...options
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching map data:', error);
    throw error;
  }
};

// Compare reports
const compareReports = async (currentReports, freshReports) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/map/compare-reports`,
      {
        currentReports,
        freshReports
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error comparing reports:', error);
    throw error;
  }
};
```

---

## Filtering Rules

### Report Filtering Rules

Reports are automatically filtered if:
1. `report.location` is missing or null
2. `report.archived === true`
3. `report.status === 'archived'` or `report.status === 'deleted'` (if status field exists)
4. Coordinates are invalid:
   - `latitude` is not a number or NaN
   - `longitude` is not a number or NaN
   - `latitude` < -90 or > 90
   - `longitude` < -180 or > 180

### Gas Station Filtering Rules

Gas stations are automatically filtered if:
1. `station.location.coordinates` is missing or null
2. `coordinates` is not an array
3. `coordinates.length < 2`
4. Coordinates are invalid:
   - `coordinates[0]` (longitude) is not a number or NaN
   - `coordinates[1]` (latitude) is not a number or NaN
   - `latitude` < -90 or > 90
   - `longitude` < -180 or > 180

---

## Best Practices

1. **Always check `success` field** in responses before using data
2. **Handle errors gracefully** - network errors, API errors, etc.
3. **Use viewport filtering** when possible to reduce data transfer
4. **Cache processed data** on the frontend to reduce API calls
5. **Use the processed-data endpoint** instead of multiple separate calls
6. **Monitor performance metrics** returned in responses
7. **Validate data** on the frontend before sending to API

---

## Notes

- All endpoints filter archived and invalid data by default
- Coordinates are validated automatically
- Viewport filtering uses MongoDB geospatial queries for efficiency
- Clustering is applied automatically based on zoom level
- All timestamps are in ISO 8601 format (UTC)

---

## Support

For questions or issues, please refer to the backend team or check the migration guide documentation.

