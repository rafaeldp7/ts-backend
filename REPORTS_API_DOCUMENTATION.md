# Reports API - Complete Documentation

## Overview

This guide provides complete documentation for the Reports API. The API allows users to create, view, update, and manage traffic reports including accidents, traffic jams, road closures, and hazards. All endpoints automatically filter archived and invalid reports by default.

---

## Table of Contents

1. [API Endpoints](#api-endpoints)
2. [Authentication](#authentication)
3. [Report Types](#report-types)
4. [Get Reports](#get-reports)
5. [Create Report](#create-report)
6. [Update Report](#update-report)
7. [Delete Report](#delete-report)
8. [Archive Report](#archive-report)
9. [Vote on Report](#vote-on-report)
10. [Verification](#verification)
11. [Reverse Geocoding](#reverse-geocoding)
12. [Frontend Integration Examples](#frontend-integration-examples)
13. [Error Handling](#error-handling)
14. [Data Models](#data-models)
15. [Best Practices](#best-practices)

---

## API Endpoints

### Base URL
```
/api/reports
```

---

## Authentication

Most endpoints are public and do not require authentication. However, some operations (like creating, updating, or deleting reports) may require authentication depending on your application's security requirements.

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

## Report Types

The following report types are supported:

- `Accident` - Vehicle accidents or collisions
- `Traffic Jam` - Heavy traffic or congestion
- `Road Closure` - Closed roads or construction
- `Hazard` - Road hazards or dangerous conditions

---

## Get Reports

### Get All Reports

**Endpoint:**
```
GET /api/reports
```

**Description:**
Returns all non-archived reports with valid coordinates. Archived and invalid reports are automatically filtered out by default.

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
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "reportType": "Accident",
      "description": "Car accident on main road",
      "address": "123 Main Street, Manila",
      "geocodedAddress": "123 Main Street, Manila, Philippines",
      "location": {
        "latitude": 14.5995,
        "longitude": 120.9842
      },
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
      "archived": false,
      "timestamp": "2024-01-15T10:30:00.000Z",
      "geocodingStatus": "success",
      "geocodingError": null
    }
  ],
  "statistics": {
    "total": 150,
    "filtered": 145,
    "removed": 5
  }
}
```

---

### Get Report Count

**Endpoint:**
```
GET /api/reports/count
```

**Description:**
Returns the total count of all reports in the database.

**Example Request:**
```javascript
GET /api/reports/count
```

**Success Response (200 OK):**
```json
{
  "totalReports": 150
}
```

---

### Get Reports by Type

**Endpoint:**
```
GET /api/reports/type/:type
```

**Description:**
Returns all reports of a specific type.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | Yes | Report type (`Accident`, `Traffic Jam`, `Road Closure`, `Hazard`) |

**Example Request:**
```javascript
GET /api/reports/type/Accident
```

**Success Response (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "reportType": "Accident",
    "description": "Car accident on main road",
    "location": {
      "latitude": 14.5995,
      "longitude": 120.9842
    },
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
]
```

---

### Get Reports by Date Range

**Endpoint:**
```
POST /api/reports/daterange
```

**Description:**
Returns reports within a specific date range.

**Request Body:**
```json
{
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-01-31T23:59:59.999Z"
}
```

**Request Body Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `startDate` | string (ISO 8601) | Yes | Start date of the range |
| `endDate` | string (ISO 8601) | Yes | End date of the range |

**Example Request:**
```javascript
POST /api/reports/daterange
Content-Type: application/json

{
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-01-31T23:59:59.999Z"
}
```

**Success Response (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "reportType": "Accident",
    "description": "Car accident on main road",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
]
```

---

### Get Reports by User

**Endpoint:**
```
GET /api/reports/user/:userId
```

**Description:**
Returns all reports created by a specific user.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | string | Yes | User ID |

**Example Request:**
```javascript
GET /api/reports/user/507f1f77bcf86cd799439012
```

**Success Response (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "reportType": "Accident",
    "description": "Car accident on main road",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
]
```

---

### Get All Report Locations

**Endpoint:**
```
GET /api/reports/locations/all
```

**Description:**
Returns all report locations with minimal data (location, reportType, description, createdAt).

**Example Request:**
```javascript
GET /api/reports/locations/all
```

**Success Response (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "location": {
      "latitude": 14.5995,
      "longitude": 120.9842
    },
    "reportType": "Accident",
    "description": "Car accident on main road",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

---

### Get Archived Reports

**Endpoint:**
```
GET /api/reports/archived/all
```

**Description:**
Returns all archived reports.

**Example Request:**
```javascript
GET /api/reports/archived/all
```

**Success Response (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "reportType": "Accident",
    "description": "Car accident on main road",
    "archived": true,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
]
```

---

## Create Report

### Endpoint
```
POST /api/reports
```

### Description
Creates a new traffic report. The report will be automatically reverse geocoded if coordinates are provided.

### Request Body

```json
{
  "reportType": "Accident",
  "description": "Car accident on main road",
  "location": {
    "latitude": 14.5995,
    "longitude": 120.9842
  },
  "address": "123 Main Street, Manila",
  "userId": "507f1f77bcf86cd799439012",
  "verified": {
    "verifiedByAdmin": 0,
    "verifiedByUser": 0
  }
}
```

**Request Body Fields:**

| Field | Type | Required | Description | Valid Values |
|-------|------|----------|-------------|--------------|
| `reportType` | string | Yes | Type of report | `Accident`, `Traffic Jam`, `Road Closure`, `Hazard` |
| `description` | string | Yes | Report description | Max 500 characters |
| `location` | object | Yes | Location coordinates | Must contain `latitude` and `longitude` |
| `location.latitude` | number | Yes | Latitude coordinate | -90 to 90 |
| `location.longitude` | number | Yes | Longitude coordinate | -180 to 180 |
| `address` | string | No | Manual address | Will be auto-generated if not provided |
| `userId` | string | No | User ID who created the report | MongoDB ObjectId |
| `verified` | object | No | Verification counts | Default: `{ verifiedByAdmin: 0, verifiedByUser: 0 }` |

### Response

**Success Response (201 Created):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439012",
  "reportType": "Accident",
  "description": "Car accident on main road",
  "address": "123 Main Street, Manila",
  "geocodedAddress": "123 Main Street, Manila, Philippines",
  "location": {
    "latitude": 14.5995,
    "longitude": 120.9842
  },
  "verified": {
    "verifiedByAdmin": 0,
    "verifiedByUser": 0
  },
  "votes": [],
  "archived": false,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "geocodingStatus": "success",
  "geocodingError": null,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Response (400 Bad Request):**
```json
{
  "message": "Missing or invalid fields"
}
```

**Error Response (400 Bad Request - Description too long):**
```json
{
  "message": "Description too long"
}
```

---

## Update Report

### Endpoint
```
PUT /api/reports/:id
```

### Description
Updates an existing report. Only provided fields will be updated.

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
| `description` | string | No | Updated description | Max 100 characters |
| `reportType` | string | No | Updated report type | `Accident`, `Traffic Jam`, `Road Closure`, `Hazard` |
| `address` | string | No | Updated address | |
| `location` | object | No | Updated location | Must contain `latitude` and `longitude` |

**Note:** The following fields cannot be updated: `_id`, `createdAt`, `updatedAt`

### Response

**Success Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "reportType": "Traffic Jam",
  "description": "Updated description",
  "address": "Updated address",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

**Error Response (404 Not Found):**
```json
{
  "msg": "Report not found"
}
```

**Error Response (400 Bad Request - Description too long):**
```json
{
  "msg": "Description too long"
}
```

---

## Delete Report

### Endpoint
```
DELETE /api/reports/:id
```

### Description
Permanently deletes a report from the database.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Report ID |

### Response

**Success Response (200 OK):**
```json
{
  "msg": "Report deleted successfully",
  "deleted": {
    "_id": "507f1f77bcf86cd799439011",
    "reportType": "Accident",
    "description": "Car accident on main road"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "msg": "Report not found"
}
```

---

## Archive Report

### Endpoint
```
PUT /api/reports/:id/archive
```

### Description
Archives a report. Archived reports are excluded from default queries unless `includeArchived=true` is specified.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Report ID |

### Response

**Success Response (200 OK):**
```json
{
  "msg": "Report archived",
  "report": {
    "_id": "507f1f77bcf86cd799439011",
    "archived": true,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "msg": "Invalid or missing report ID"
}
```

**Error Response (404 Not Found):**
```json
{
  "msg": "Report not found"
}
```

---

## Vote on Report

### Endpoint
```
POST /api/reports/:id/vote
```

### Description
Allows users to vote on a report (upvote or downvote). If a user votes the same way again, the vote is removed. If a user switches their vote, it is updated.

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
| `userId` | string | Yes | User ID who is voting | MongoDB ObjectId |
| `vote` | number | Yes | Vote value | `1` (upvote) or `-1` (downvote) |

### Response

**Success Response (200 OK):**
```json
{
  "report": {
    "_id": "507f1f77bcf86cd799439011",
    "votes": [
      {
        "userId": "507f1f77bcf86cd799439012",
        "vote": 1
      }
    ]
  },
  "totalVotes": 1
}
```

**Error Response (400 Bad Request):**
```json
{
  "msg": "Vote must be 1 or -1"
}
```

**Error Response (404 Not Found):**
```json
{
  "msg": "Report not found"
}
```

---

## Verification

### Update Verification

**Endpoint:**
```
PUT /api/reports/:id/verify
```

**Description:**
Updates the verification counts for a report. Can update either `verifiedByAdmin` or `verifiedByUser` or both.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Report ID |

**Request Body:**
```json
{
  "verifiedByAdmin": 1,
  "verifiedByUser": 5
}
```

**Request Body Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `verifiedByAdmin` | number | No | Admin verification count |
| `verifiedByUser` | number | No | User verification count |

**Example Request:**
```javascript
PUT /api/reports/507f1f77bcf86cd799439011/verify
Content-Type: application/json

{
  "verifiedByUser": 5
}
```

**Success Response (200 OK):**
```json
{
  "msg": "Verification updated successfully",
  "verified": {
    "verifiedByAdmin": 0,
    "verifiedByUser": 5
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "msg": "Report not found"
}
```

---

## Reverse Geocoding

### Reverse Geocode Single Report

**Endpoint:**
```
POST /api/reports/:reportId/reverse-geocode
```

**Description:**
Reverse geocodes a single report to get its address from coordinates using Google Maps Geocoding API.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `reportId` | string | Yes | Report ID |

**Example Request:**
```javascript
POST /api/reports/507f1f77bcf86cd799439011/reverse-geocode
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "reportId": "507f1f77bcf86cd799439011",
  "geocodedAddress": "123 Main Street, Manila, Philippines",
  "geocodingStatus": "success"
}
```

**Error Response (404 Not Found):**
```json
{
  "message": "Report not found"
}
```

**Error Response (400 Bad Request):**
```json
{
  "message": "Report does not have valid coordinates"
}
```

---

### Reverse Geocode Multiple Reports

**Endpoint:**
```
POST /api/reports/reverse-geocode/bulk
```

**Description:**
Reverse geocodes multiple reports at once.

**Request Body:**
```json
{
  "reportIds": [
    "507f1f77bcf86cd799439011",
    "507f1f77bcf86cd799439012",
    "507f1f77bcf86cd799439013"
  ]
}
```

**Request Body Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `reportIds` | array | Yes | Array of report IDs to geocode |

**Example Request:**
```javascript
POST /api/reports/reverse-geocode/bulk
Content-Type: application/json

{
  "reportIds": [
    "507f1f77bcf86cd799439011",
    "507f1f77bcf86cd799439012"
  ]
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Reverse geocoding completed: 2 successful, 0 failed",
  "results": [
    {
      "reportId": "507f1f77bcf86cd799439011",
      "success": true,
      "address": "123 Main Street, Manila, Philippines"
    },
    {
      "reportId": "507f1f77bcf86cd799439012",
      "success": true,
      "address": "456 Second Street, Quezon City, Philippines"
    }
  ],
  "summary": {
    "total": 2,
    "successful": 2,
    "failed": 0
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "message": "Report IDs array is required"
}
```

---

### Get Reports Needing Geocoding

**Endpoint:**
```
GET /api/reports/geocoding/pending
```

**Description:**
Returns reports that need reverse geocoding (pending or failed status).

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 20 | Number of reports per page |

**Example Request:**
```javascript
GET /api/reports/geocoding/pending?page=1&limit=20
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "reports": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "reportType": "Accident",
      "description": "Car accident on main road",
      "location": {
        "latitude": 14.5995,
        "longitude": 120.9842
      },
      "geocodingStatus": "pending",
      "timestamp": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "current": 1,
    "pages": 5,
    "total": 100
  }
}
```

---

### Bulk Reverse Geocode

**Endpoint:**
```
POST /api/reports/geocoding/bulk
```

**Description:**
Bulk reverse geocodes all pending reports up to a specified limit.

**Request Body:**
```json
{
  "limit": 50
}
```

**Request Body Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `limit` | number | No | Maximum number of reports to process | Default: 50 |

**Example Request:**
```javascript
POST /api/reports/geocoding/bulk
Content-Type: application/json

{
  "limit": 50
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Bulk reverse geocoding completed: 45 successful, 5 failed",
  "results": [
    {
      "reportId": "507f1f77bcf86cd799439011",
      "success": true,
      "address": "123 Main Street, Manila, Philippines"
    }
  ],
  "summary": {
    "total": 50,
    "successful": 45,
    "failed": 5
  }
}
```

---

### Get Geocoding Statistics

**Endpoint:**
```
GET /api/reports/geocoding/stats
```

**Description:**
Returns statistics about geocoding status across all reports.

**Example Request:**
```javascript
GET /api/reports/geocoding/stats
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "stats": {
    "totalReports": 150,
    "reportsWithCoordinates": 145,
    "geocodingStatus": {
      "pending": 10,
      "success": 130,
      "failed": 5
    },
    "geocodingRate": "89.66%"
  }
}
```

---

## Frontend Integration Examples

### React/JavaScript Example

#### 1. Create Report

```javascript
// Create report function
const createReport = async (reportData, token = null) => {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('http://your-api-url/api/reports', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        reportType: reportData.type,
        description: reportData.description,
        location: {
          latitude: reportData.latitude,
          longitude: reportData.longitude
        },
        address: reportData.address,
        userId: reportData.userId
      })
    });

    const result = await response.json();

    if (response.ok) {
      console.log('Report created successfully:', result);
      return result;
    } else {
      throw new Error(result.message || 'Failed to create report');
    }
  } catch (error) {
    console.error('Error creating report:', error);
    throw error;
  }
};

// Usage example
const handleCreateReport = async () => {
  try {
    const token = localStorage.getItem('token');
    const reportData = {
      type: 'Accident',
      description: 'Car accident on main road',
      latitude: 14.5995,
      longitude: 120.9842,
      address: '123 Main Street, Manila',
      userId: '507f1f77bcf86cd799439012'
    };

    const report = await createReport(reportData, token);
    alert('Report created successfully!');
    return report;
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
};
```

#### 2. Get All Reports with Filters

```javascript
// Get reports function
const getReports = async (options = {}) => {
  try {
    const {
      includeArchived = false,
      includeInvalid = false,
      filters = null,
      viewport = null
    } = options;

    const queryParams = new URLSearchParams();
    if (includeArchived) queryParams.append('includeArchived', 'true');
    if (includeInvalid) queryParams.append('includeInvalid', 'true');
    if (filters) queryParams.append('filters', JSON.stringify(filters));
    if (viewport) queryParams.append('viewport', JSON.stringify(viewport));

    const response = await fetch(
      `http://your-api-url/api/reports?${queryParams.toString()}`
    );

    const result = await response.json();

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message || 'Failed to get reports');
    }
  } catch (error) {
    console.error('Error getting reports:', error);
    throw error;
  }
};

// Usage example
const loadReports = async () => {
  try {
    // Get all reports
    const allReports = await getReports();

    // Get reports with filters
    const filteredReports = await getReports({
      filters: {
        types: ['Accident', 'Traffic Jam'],
        status: ['active']
      }
    });

    // Get reports in viewport
    const viewportReports = await getReports({
      viewport: {
        north: 14.7,
        south: 14.5,
        east: 121.1,
        west: 120.9
      }
    });

    setReports(filteredReports);
  } catch (error) {
    console.error('Error loading reports:', error);
  }
};
```

#### 3. Vote on Report

```javascript
// Vote on report function
const voteReport = async (reportId, userId, vote, token = null) => {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(
      `http://your-api-url/api/reports/${reportId}/vote`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userId,
          vote // 1 for upvote, -1 for downvote
        })
      }
    );

    const result = await response.json();

    if (response.ok) {
      return result;
    } else {
      throw new Error(result.msg || 'Failed to vote on report');
    }
  } catch (error) {
    console.error('Error voting on report:', error);
    throw error;
  }
};

// Usage example
const handleVote = async (reportId, isUpvote) => {
  try {
    const token = localStorage.getItem('token');
    const userId = getCurrentUserId(); // Your function to get current user ID
    const vote = isUpvote ? 1 : -1;

    const result = await voteReport(reportId, userId, vote, token);
    setTotalVotes(result.totalVotes);
    alert('Vote recorded!');
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
};
```

#### 4. Update Report

```javascript
// Update report function
const updateReport = async (reportId, updates, token = null) => {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(
      `http://your-api-url/api/reports/${reportId}`,
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
      throw new Error(result.msg || 'Failed to update report');
    }
  } catch (error) {
    console.error('Error updating report:', error);
    throw error;
  }
};

// Usage example
const handleUpdateReport = async (reportId) => {
  try {
    const token = localStorage.getItem('token');
    const updates = {
      description: 'Updated description',
      reportType: 'Traffic Jam'
    };

    const updatedReport = await updateReport(reportId, updates, token);
    alert('Report updated successfully!');
    return updatedReport;
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
};
```

#### 5. Archive Report

```javascript
// Archive report function
const archiveReport = async (reportId, token = null) => {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(
      `http://your-api-url/api/reports/${reportId}/archive`,
      {
        method: 'PUT',
        headers
      }
    );

    const result = await response.json();

    if (response.ok) {
      return result;
    } else {
      throw new Error(result.msg || 'Failed to archive report');
    }
  } catch (error) {
    console.error('Error archiving report:', error);
    throw error;
  }
};

// Usage example
const handleArchiveReport = async (reportId) => {
  try {
    const token = localStorage.getItem('token');
    const result = await archiveReport(reportId, token);
    alert('Report archived successfully!');
    return result;
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
};
```

#### 6. Reverse Geocode Report

```javascript
// Reverse geocode report function
const reverseGeocodeReport = async (reportId) => {
  try {
    const response = await fetch(
      `http://your-api-url/api/reports/${reportId}/reverse-geocode`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const result = await response.json();

    if (result.success) {
      return result;
    } else {
      throw new Error(result.message || 'Failed to reverse geocode report');
    }
  } catch (error) {
    console.error('Error reverse geocoding report:', error);
    throw error;
  }
};

// Usage example
const handleReverseGeocode = async (reportId) => {
  try {
    const result = await reverseGeocodeReport(reportId);
    console.log('Geocoded address:', result.geocodedAddress);
    return result;
  } catch (error) {
    console.error('Error:', error.message);
  }
};
```

---

## Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "message": "Missing or invalid fields"
}
```

**404 Not Found:**
```json
{
  "msg": "Report not found"
}
```

**500 Internal Server Error:**
```json
{
  "msg": "Server error",
  "error": "Error message details"
}
```

### Error Handling Best Practices

1. **Always check response status** before processing data
2. **Handle network errors** with try-catch blocks
3. **Display user-friendly error messages** to users
4. **Log errors** for debugging purposes
5. **Validate input** before making API calls

**Example:**
```javascript
const handleApiCall = async () => {
  try {
    const response = await fetch('/api/reports');
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    if (error.name === 'TypeError') {
      console.error('Network error:', error);
      alert('Network error. Please check your connection.');
    } else {
      console.error('API error:', error);
      alert(`Error: ${error.message}`);
    }
    throw error;
  }
};
```

---

## Data Models

### Report Schema

```javascript
{
  _id: ObjectId,                    // MongoDB document ID
  userId: ObjectId,                 // User who created the report (optional)
  reportType: String,               // "Accident" | "Traffic Jam" | "Road Closure" | "Hazard"
  description: String,              // Report description (max 500 characters)
  address: String,                  // Manual address (optional)
  geocodedAddress: String,          // Auto-generated address from coordinates
  verified: {
    verifiedByAdmin: Number,        // Admin verification count
    verifiedByUser: Number          // User verification count
  },
  votes: [                          // Array of votes
    {
      userId: ObjectId,             // User who voted
      vote: Number                  // 1 (upvote) or -1 (downvote)
    }
  ],
  location: {
    latitude: Number,               // Latitude coordinate (-90 to 90)
    longitude: Number               // Longitude coordinate (-180 to 180)
  },
  archived: Boolean,                // Whether report is archived (default: false)
  timestamp: Date,                   // Report creation timestamp
  geocodingStatus: String,          // "pending" | "success" | "failed"
  geocodingError: String,           // Error message if geocoding failed
  createdAt: Date,                  // Document creation date
  updatedAt: Date                   // Document last update date
}
```

### Virtual Fields

The Report model includes the following virtual fields:

- **totalVotes**: Sum of all votes (upvotes - downvotes)
- **displayAddress**: Returns `geocodedAddress` if available, otherwise `address`, otherwise "Address not available"

---

## Best Practices

### 1. Report Creation

- **Always provide coordinates**: Reports require valid latitude and longitude
- **Keep descriptions concise**: Maximum 500 characters
- **Use appropriate report types**: Choose the most accurate type
- **Include address when possible**: Helps with verification

### 2. Filtering and Querying

- **Use viewport filtering**: When displaying reports on a map, use viewport bounds to only fetch visible reports
- **Filter by type**: Use type filters to show only relevant reports
- **Exclude archived by default**: Archived reports are excluded by default unless needed

### 3. Voting

- **Prevent duplicate votes**: The API automatically handles vote toggling
- **Show vote counts**: Display total votes to users
- **Update UI immediately**: Optimistically update UI, then sync with server

### 4. Geocoding

- **Automatic geocoding**: Reports are automatically geocoded on creation
- **Bulk geocoding**: Use bulk endpoints for processing multiple reports
- **Handle failures gracefully**: Some geocoding requests may fail due to API limits or invalid coordinates

### 5. Performance

- **Use pagination**: For large datasets, implement pagination
- **Cache results**: Cache frequently accessed reports
- **Filter on server**: Use query parameters to filter on the server side

### 6. Security

- **Validate user input**: Always validate and sanitize user input
- **Handle authentication**: Include tokens when required
- **Error handling**: Never expose sensitive error details to users

---

## Rate Limiting

Currently, there are no explicit rate limits documented. However, it's recommended to:

- **Throttle requests**: Implement client-side throttling for frequent operations
- **Batch operations**: Use bulk endpoints when processing multiple items
- **Cache responses**: Cache frequently accessed data to reduce API calls

---

## Support

For issues or questions regarding the Reports API, please contact the development team or refer to the main API documentation.

---

**Last Updated:** January 2024
**API Version:** 1.0




