# Admin Reports Count API - Implementation Documentation

## Overview

This documentation provides complete details for the new Report Count endpoints added to the Admin Reports API. These endpoints allow administrators to quickly retrieve report counts and active reports for dashboard displays and analytics.

**Key Features:**
- Get total report count (all reports)
- Get active (non-archived) report count (archived = false)
- Get archived report count (archived = true)
- Get all active reports with filtering and pagination (archived = false)
- Get all archived reports with filtering and pagination (archived = true)

---

## Table of Contents

1. [Base URL](#base-url)
2. [Authentication](#authentication)
3. [Get Total Report Count](#1-get-total-report-count)
4. [Get Active Report Count](#2-get-active-report-count)
5. [Get Archived Report Count](#3-get-archived-report-count)
6. [Get All Active Reports](#4-get-all-active-reports)
7. [Get All Archived Reports](#5-get-all-archived-reports)
8. [Frontend Integration Examples](#frontend-integration-examples)
9. [Error Handling](#error-handling)
10. [Logic Confirmation](#logic-confirmation)

---

## Base URL

```
/api/admin-reports
```

**Full API Base URL:**
```
https://ts-backend-1-jyit.onrender.com/api/admin-reports
```

---

## Authentication

**All endpoints require admin authentication.**

**Header Format:**
```
Authorization: Bearer <admin-jwt-token>
```

**Example:**
```javascript
headers: {
  'Authorization': `Bearer ${adminToken}`,
  'Content-Type': 'application/json'
}
```

---

## 1. Get Total Report Count

### Endpoint Description

**Purpose:** Retrieves the total count of all reports in the system, including both active and archived reports.

**When to Use:** Use this endpoint when you need to:
- Display total reports in dashboard
- Show overall system statistics
- Calculate percentages or ratios

### Request Method and URL

**HTTP Method:** `GET`

**Endpoint URL:**
```
GET /api/admin-reports/count/total
```

### Example Request

```javascript
GET /api/admin-reports/count/total
Authorization: Bearer <admin-token>
```

### Response Schema

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Total report count retrieved successfully",
  "data": {
    "totalCount": 150
  }
}
```

**Response Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Indicates if the request was successful |
| `message` | string | Success message |
| `data.totalCount` | number | Total number of reports (active + archived) |

---

## 2. Get Active Report Count

### Endpoint Description

**Purpose:** Retrieves the count of active (non-archived) reports in the system.

**When to Use:** Use this endpoint when you need to:
- Display active reports count in dashboard
- Show current workload
- Calculate active vs archived ratio

### Request Method and URL

**HTTP Method:** `GET`

**Endpoint URL:**
```
GET /api/admin-reports/count/active
```

### Example Request

```javascript
GET /api/admin-reports/count/active
Authorization: Bearer <admin-token>
```

### Response Schema

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Active report count retrieved successfully",
  "data": {
    "activeCount": 135
  }
}
```

**Response Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Indicates if the request was successful |
| `message` | string | Success message |
| `data.activeCount` | number | Number of active (non-archived) reports |

**Note:** Active reports are those where `isArchived` is not `true` or `archived` is not `true`.

---

## 3. Get Archived Report Count

### Endpoint Description

**Purpose:** Retrieves the count of archived reports in the system.

**When to Use:** Use this endpoint when you need to:
- Display archived reports count in dashboard
- Show historical data statistics
- Calculate archive percentage

### Request Method and URL

**HTTP Method:** `GET`

**Endpoint URL:**
```
GET /api/admin-reports/count/archived
```

### Example Request

```javascript
GET /api/admin-reports/count/archived
Authorization: Bearer <admin-token>
```

### Response Schema

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Archived report count retrieved successfully",
  "data": {
    "archivedCount": 15
  }
}
```

**Response Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Indicates if the request was successful |
| `message` | string | Success message |
| `data.archivedCount` | number | Number of archived reports |

**Note:** Archived reports are those where `isArchived` is `true` or `archived` is `true`.

---

## 4. Get All Active Reports

### Endpoint Description

**Purpose:** Retrieves a paginated list of all active (non-archived) reports with advanced filtering options. This is similar to the main `GET /api/admin-reports` endpoint but explicitly excludes archived reports.

**When to Use:** Use this endpoint when you need to:
- Display only active reports in a list
- Filter active reports by various criteria
- Implement pagination for active reports only
- Search within active reports

### Request Method and URL

**HTTP Method:** `GET`

**Endpoint URL:**
```
GET /api/admin-reports/active
```

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 10 | Number of results per page |
| `status` | string | - | Filter by status (`pending`, `verified`, `resolved`) |
| `type` | string | - | Filter by report type (`Accident`, `Traffic Jam`, `Road Closure`, `Hazard`) |
| `priority` | string | - | Filter by priority (`low`, `medium`, `high`, `urgent`) |
| `city` | string | - | Filter by city (case-insensitive partial match) |
| `barangay` | string | - | Filter by barangay (case-insensitive partial match) |
| `dateFrom` | string (ISO 8601) | - | Start date for date range filter |
| `dateTo` | string (ISO 8601) | - | End date for date range filter |
| `search` | string | - | Search in title, description, and address (case-insensitive) |

### Example Requests

```javascript
// Basic request - get all active reports
GET /api/admin-reports/active

// With pagination
GET /api/admin-reports/active?page=2&limit=20

// Filter by status
GET /api/admin-reports/active?status=pending

// Filter by type and status
GET /api/admin-reports/active?type=Accident&status=verified

// Filter by date range
GET /api/admin-reports/active?dateFrom=2024-01-01T00:00:00.000Z&dateTo=2024-01-31T23:59:59.999Z

// Search active reports
GET /api/admin-reports/active?search=accident

// Combined filters
GET /api/admin-reports/active?status=pending&type=Accident&city=Manila&page=1&limit=10
```

### Response Schema

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Active reports retrieved successfully",
  "data": {
    "reports": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "reporter": {
          "_id": "507f1f77bcf86cd799439012",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com"
        },
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
        "status": "pending",
        "priority": "high",
        "attachments": [],
        "comments": [],
        "verifiedBy": null,
        "verifiedAt": null,
        "resolvedBy": null,
        "resolvedAt": null,
        "isArchived": false,
        "reportedAt": "2024-01-15T10:30:00.000Z",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
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

**Response Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Indicates if the request was successful |
| `message` | string | Success message |
| `data.reports` | array | Array of active report objects |
| `data.pagination.current` | number | Current page number |
| `data.pagination.pages` | number | Total number of pages |
| `data.pagination.total` | number | Total number of active reports matching filters |

**Note:** Archived reports are automatically excluded from results.

---

## 5. Get All Archived Reports

### Endpoint Description

**Purpose:** Retrieves a paginated list of all archived reports with advanced filtering options. This endpoint explicitly includes only archived reports.

**When to Use:** Use this endpoint when you need to:
- Display archived reports in a list
- Filter archived reports by various criteria
- Implement pagination for archived reports only
- Search within archived reports
- View historical/completed reports

### Request Method and URL

**HTTP Method:** `GET`

**Endpoint URL:**
```
GET /api/admin-reports/archived
```

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 10 | Number of results per page |
| `status` | string | - | Filter by status (`pending`, `verified`, `resolved`) |
| `type` | string | - | Filter by report type (`Accident`, `Traffic Jam`, `Road Closure`, `Hazard`) |
| `priority` | string | - | Filter by priority (`low`, `medium`, `high`, `urgent`) |
| `city` | string | - | Filter by city (case-insensitive partial match) |
| `barangay` | string | - | Filter by barangay (case-insensitive partial match) |
| `dateFrom` | string (ISO 8601) | - | Start date for date range filter |
| `dateTo` | string (ISO 8601) | - | End date for date range filter |
| `search` | string | - | Search in title, description, and address (case-insensitive) |

### Example Requests

```javascript
// Basic request - get all archived reports
GET /api/admin-reports/archived

// With pagination
GET /api/admin-reports/archived?page=2&limit=20

// Filter by status
GET /api/admin-reports/archived?status=resolved

// Filter by type and status
GET /api/admin-reports/archived?type=Accident&status=resolved

// Filter by date range
GET /api/admin-reports/archived?dateFrom=2024-01-01T00:00:00.000Z&dateTo=2024-01-31T23:59:59.999Z

// Search archived reports
GET /api/admin-reports/archived?search=accident

// Combined filters
GET /api/admin-reports/archived?status=resolved&type=Accident&city=Manila&page=1&limit=10
```

### Response Schema

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Archived reports retrieved successfully",
  "data": {
    "reports": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "reporter": {
          "_id": "507f1f77bcf86cd799439012",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com"
        },
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
        "status": "resolved",
        "priority": "high",
        "attachments": [],
        "comments": [],
        "verifiedBy": {
          "_id": "507f1f77bcf86cd799439014",
          "firstName": "Admin",
          "lastName": "User"
        },
        "verifiedAt": "2024-01-15T11:00:00.000Z",
        "resolvedBy": {
          "_id": "507f1f77bcf86cd799439014",
          "firstName": "Admin",
          "lastName": "User"
        },
        "resolvedAt": "2024-01-15T12:00:00.000Z",
        "isArchived": true,
        "archived": true,
        "archivedAt": "2024-01-20T10:00:00.000Z",
        "archivedBy": {
          "_id": "507f1f77bcf86cd799439014",
          "firstName": "Admin",
          "lastName": "User"
        },
        "reportedAt": "2024-01-15T10:30:00.000Z",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-20T10:00:00.000Z"
      }
    ],
    "pagination": {
      "current": 1,
      "pages": 2,
      "total": 15
    }
  }
}
```

**Response Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Indicates if the request was successful |
| `message` | string | Success message |
| `data.reports` | array | Array of archived report objects |
| `data.pagination.current` | number | Current page number |
| `data.pagination.pages` | number | Total number of pages |
| `data.pagination.total` | number | Total number of archived reports matching filters |

**Note:** Only archived reports are included in results. Results are sorted by `archivedAt` (most recently archived first).

---

## Frontend Integration Examples

### React/JavaScript Examples

#### 1. Get Total Report Count

```javascript
// Get total report count function
const getTotalReportCount = async (token) => {
  try {
    const response = await fetch('/api/admin-reports/count/total', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch total report count');
    }

    const data = await response.json();
    return data.data.totalCount;
  } catch (error) {
    console.error('Error fetching total report count:', error);
    throw error;
  }
};

// Usage example
const loadTotalCount = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    const totalCount = await getTotalReportCount(token);
    setTotalReports(totalCount);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

#### 2. Get Active Report Count

```javascript
// Get active report count function
const getActiveReportCount = async (token) => {
  try {
    const response = await fetch('/api/admin-reports/count/active', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch active report count');
    }

    const data = await response.json();
    return data.data.activeCount;
  } catch (error) {
    console.error('Error fetching active report count:', error);
    throw error;
  }
};

// Usage example
const loadActiveCount = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    const activeCount = await getActiveReportCount(token);
    setActiveReports(activeCount);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

#### 3. Get Archived Report Count

```javascript
// Get archived report count function
const getArchivedReportCount = async (token) => {
  try {
    const response = await fetch('/api/admin-reports/count/archived', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch archived report count');
    }

    const data = await response.json();
    return data.data.archivedCount;
  } catch (error) {
    console.error('Error fetching archived report count:', error);
    throw error;
  }
};

// Usage example
const loadArchivedCount = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    const archivedCount = await getArchivedReportCount(token);
    setArchivedReports(archivedCount);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

#### 4. Get All Active Reports

```javascript
// Get active reports function
const getActiveReports = async (filters = {}, token) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.priority) queryParams.append('priority', filters.priority);
    if (filters.city) queryParams.append('city', filters.city);
    if (filters.barangay) queryParams.append('barangay', filters.barangay);
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);

    const response = await fetch(
      `/api/admin-reports/active?${queryParams.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch active reports');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching active reports:', error);
    throw error;
  }
};

// Usage example
const loadActiveReports = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    const reportsData = await getActiveReports({
      status: 'pending',
      type: 'Accident',
      page: 1,
      limit: 20
    }, token);
    
    setReports(reportsData.reports);
    setPagination(reportsData.pagination);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

#### 5. Get All Archived Reports

```javascript
// Get archived reports function
const getArchivedReports = async (filters = {}, token) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.priority) queryParams.append('priority', filters.priority);
    if (filters.city) queryParams.append('city', filters.city);
    if (filters.barangay) queryParams.append('barangay', filters.barangay);
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);

    const response = await fetch(
      `/api/admin-reports/archived?${queryParams.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch archived reports');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching archived reports:', error);
    throw error;
  }
};

// Usage example
const loadArchivedReports = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    const reportsData = await getArchivedReports({
      status: 'resolved',
      type: 'Accident',
      page: 1,
      limit: 20
    }, token);
    
    setReports(reportsData.reports);
    setPagination(reportsData.pagination);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

#### 5. Complete Dashboard Example (React Hook)

```javascript
import { useState, useEffect } from 'react';

const useReportCounts = (token) => {
  const [counts, setCounts] = useState({
    total: 0,
    active: 0,
    archived: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setCounts(prev => ({ ...prev, loading: true, error: null }));

        // Fetch all counts in parallel
        const [totalRes, activeRes, archivedRes] = await Promise.all([
          fetch('/api/admin-reports/count/total', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/admin-reports/count/active', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/admin-reports/count/archived', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        const [totalData, activeData, archivedData] = await Promise.all([
          totalRes.json(),
          activeRes.json(),
          archivedRes.json()
        ]);

        setCounts({
          total: totalData.data.totalCount,
          active: activeData.data.activeCount,
          archived: archivedData.data.archivedCount,
          loading: false,
          error: null
        });
      } catch (error) {
        setCounts(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      }
    };

    if (token) {
      fetchCounts();
    }
  }, [token]);

  return counts;
};

// Usage in component
const Dashboard = () => {
  const token = localStorage.getItem('adminToken');
  const { total, active, archived, loading, error } = useReportCounts(token);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Report Statistics</h2>
      <div>
        <p>Total Reports: {total}</p>
        <p>Active Reports: {active}</p>
        <p>Archived Reports: {archived}</p>
      </div>
    </div>
  );
};
```

### RTK Query Examples (Redux Toolkit Query)

```javascript
// In your API slice (src/state/api.js)

// Get total report count
useGetTotalReportCountQuery: builder.query({
  query: () => ({
    url: '/api/admin-reports/count/total',
    method: 'GET',
  }),
  transformResponse: (response) => response.data.totalCount,
}),

// Get active report count
useGetActiveReportCountQuery: builder.query({
  query: () => ({
    url: '/api/admin-reports/count/active',
    method: 'GET',
  }),
  transformResponse: (response) => response.data.activeCount,
}),

// Get archived report count
useGetArchivedReportCountQuery: builder.query({
  query: () => ({
    url: '/api/admin-reports/count/archived',
    method: 'GET',
  }),
  transformResponse: (response) => response.data.archivedCount,
}),

// Get active reports
useGetActiveReportsQuery: builder.query({
  query: (params = {}) => ({
    url: '/api/admin-reports/active',
    method: 'GET',
    params: {
      page: params.page || 1,
      limit: params.limit || 10,
      status: params.status,
      type: params.type,
      priority: params.priority,
      city: params.city,
      barangay: params.barangay,
      search: params.search,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
    },
  }),
  transformResponse: (response) => response.data,
}),

// Get archived reports
useGetArchivedReportsQuery: builder.query({
  query: (params = {}) => ({
    url: '/api/admin-reports/archived',
    method: 'GET',
    params: {
      page: params.page || 1,
      limit: params.limit || 10,
      status: params.status,
      type: params.type,
      priority: params.priority,
      city: params.city,
      barangay: params.barangay,
      search: params.search,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
    },
  }),
  transformResponse: (response) => response.data,
}),

// Usage in component
const Dashboard = () => {
  const { data: totalCount } = useGetTotalReportCountQuery();
  const { data: activeCount } = useGetActiveReportCountQuery();
  const { data: archivedCount } = useGetArchivedReportCountQuery();
  const { data: activeReports } = useGetActiveReportsQuery({ page: 1, limit: 10 });
  const { data: archivedReports } = useGetArchivedReportsQuery({ page: 1, limit: 10 });

  return (
    <div>
      <h2>Report Statistics</h2>
      <p>Total: {totalCount}</p>
      <p>Active: {activeCount}</p>
      <p>Archived: {archivedCount}</p>
    </div>
  );
};
```

### cURL Examples

#### 1. Get Total Report Count
```bash
curl -X GET "https://ts-backend-1-jyit.onrender.com/api/admin-reports/count/total" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

#### 2. Get Active Report Count
```bash
curl -X GET "https://ts-backend-1-jyit.onrender.com/api/admin-reports/count/active" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

#### 3. Get Archived Report Count
```bash
curl -X GET "https://ts-backend-1-jyit.onrender.com/api/admin-reports/count/archived" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

#### 4. Get All Active Reports
```bash
curl -X GET "https://ts-backend-1-jyit.onrender.com/api/admin-reports/active?page=1&limit=10&status=pending" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

#### 5. Get All Archived Reports
```bash
curl -X GET "https://ts-backend-1-jyit.onrender.com/api/admin-reports/archived?page=1&limit=10&status=resolved" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Validation error message"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Not authorized to perform this action"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Failed to get report count",
  "error": "Error details"
}
```

### Error Handling Example

```javascript
const getReportCounts = async (token) => {
  try {
    const [totalRes, activeRes, archivedRes] = await Promise.all([
      fetch('/api/admin-reports/count/total', {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch('/api/admin-reports/count/active', {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch('/api/admin-reports/count/archived', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
    ]);

    // Check for errors
    if (!totalRes.ok || !activeRes.ok || !archivedRes.ok) {
      throw new Error('Failed to fetch report counts');
    }

    const [totalData, activeData, archivedData] = await Promise.all([
      totalRes.json(),
      activeRes.json(),
      archivedRes.json()
    ]);

    return {
      total: totalData.data.totalCount,
      active: activeData.data.activeCount,
      archived: archivedData.data.archivedCount
    };
  } catch (error) {
    console.error('Error fetching report counts:', error);
    // Handle error (show notification, retry, etc.)
    throw error;
  }
};
```

---

## Best Practices

### 1. Caching Counts
- Cache count results to reduce database queries
- Refresh counts after creating, updating, or archiving reports
- Use React Query or similar for automatic caching and refetching

### 2. Performance Optimization
- Use `countDocuments()` for counts (faster than `find().length`)
- Fetch multiple counts in parallel using `Promise.all()`
- Consider using aggregation for complex count queries

### 3. Error Handling
- Always handle errors gracefully
- Show user-friendly error messages
- Implement retry logic for failed requests

### 4. Data Consistency
- Ensure counts are updated after report operations
- Use optimistic updates for better UX
- Refresh counts after mutations

---

## Implementation Checklist

- [x] Controller functions created
- [x] Routes added
- [x] Authentication middleware applied
- [x] Error handling implemented
- [x] Response format standardized
- [x] Documentation created

---

## Logic Confirmation

### ✅ Confirmed Logic

1. **Total Reports Count** (`GET /api/admin-reports/count/total`)
   - **Logic:** Counts ALL reports in the database
   - **Filter:** `{}` (no filter - includes both active and archived)
   - **Result:** Total count of all reports regardless of archive status

2. **Active Reports Count** (`GET /api/admin-reports/count/active`)
   - **Logic:** Counts reports where `archived = false`
   - **Filter:** `{ $or: [{ isArchived: { $ne: true } }, { archived: { $ne: true } }, ...] }`
   - **Result:** Count of non-archived reports

3. **Active Reports Data** (`GET /api/admin-reports/active`)
   - **Logic:** Returns reports where `archived = false`
   - **Filter:** Same as active count - excludes archived reports
   - **Result:** Paginated list of active (non-archived) reports

4. **Archived Reports Count** (`GET /api/admin-reports/count/archived`)
   - **Logic:** Counts reports where `archived = true`
   - **Filter:** `{ $or: [{ isArchived: true }, { archived: true }] }`
   - **Result:** Count of archived reports

5. **Archived Reports Data** (`GET /api/admin-reports/archived`)
   - **Logic:** Returns reports where `archived = true`
   - **Filter:** Same as archived count - includes only archived reports
   - **Result:** Paginated list of archived reports

### Field Compatibility

The implementation handles both field formats for backward compatibility:
- `isArchived` (admin format)
- `archived` (legacy format)

Both fields are checked to ensure accurate filtering regardless of which field is used.

### Mathematical Relationship

```
totalCount = activeCount + archivedCount
```

This relationship should always hold true:
- Total reports = Active reports + Archived reports

---

## Summary

All five endpoints are now available:

1. ✅ **GET /api/admin-reports/count/total** - Get total report count (all reports)
2. ✅ **GET /api/admin-reports/count/active** - Get active report count (archived = false)
3. ✅ **GET /api/admin-reports/active** - Get all active reports data (archived = false)
4. ✅ **GET /api/admin-reports/count/archived** - Get archived report count (archived = true)
5. ✅ **GET /api/admin-reports/archived** - Get all archived reports data (archived = true)

All endpoints require admin authentication and return standardized responses.

---

**Last Updated:** Current  
**API Version:** 1.0

