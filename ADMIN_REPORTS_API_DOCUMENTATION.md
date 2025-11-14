# Admin Reports API - Complete Documentation

## Overview

This guide provides complete documentation for the Admin Reports API. The API allows administrators to manage, verify, resolve, and analyze traffic reports submitted by users. All endpoints require admin authentication.

**Key Features:**
- Comprehensive report management (CRUD operations)
- Report verification and resolution workflow
- Advanced filtering and search capabilities
- Location-based report queries
- Reverse geocoding support
- Report statistics and analytics
- Comment system for reports
- Archive management

---

## Table of Contents

1. [API Endpoints](#api-endpoints)
2. [Base URL](#base-url)
3. [How to Access](#how-to-access)
4. [Authentication](#authentication)
5. [Get All Reports](#get-all-reports)
6. [Get Single Report](#get-single-report)
7. [Create Report](#create-report)
8. [Update Report](#update-report)
9. [Delete Report](#delete-report)
10. [Verify Report](#verify-report)
11. [Resolve Report](#resolve-report)
12. [Add Comment to Report](#add-comment-to-report)
13. [Get Reports by Location](#get-reports-by-location)
14. [Get Report Statistics](#get-report-statistics)
15. [Archive Report](#archive-report)
16. [Reverse Geocode Report](#reverse-geocode-report)
17. [Bulk Reverse Geocode Reports](#bulk-reverse-geocode-reports)
18. [Auto Reverse Geocode Report](#auto-reverse-geocode-report)
19. [Data Models](#data-models)
20. [Error Handling](#error-handling)
21. [Frontend Integration Examples](#frontend-integration-examples)
22. [Best Practices](#best-practices)

---

## Base URL

```
/api/admin-reports
```

**Full API Base URL:**
```
http://your-server-url/api/admin-reports
```

**Example:**
```
http://localhost:5000/api/admin-reports
```

---

## How to Access

### Prerequisites

Before accessing the Admin Reports API, you need:

1. **Admin Account**: A valid admin account with appropriate permissions
2. **Admin Authentication Token**: A JWT token obtained through admin login
3. **API Base URL**: The base URL of your backend server

### Step 1: Admin Login

To access the Admin Reports API, you must first authenticate as an admin and obtain a JWT token.

**Login Endpoint:**
```
POST /api/admin-auth/admin-login
```

**Alternative Login Endpoint:**
```
POST /api/admin-auth/login
```

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "your-admin-password"
}
```

**Example Request:**
```javascript
// Using fetch API
const loginAdmin = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/admin-auth/admin-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'your-admin-password'
      })
    });

    const data = await response.json();
    
    if (data.success) {
      // Store the token for future requests
      localStorage.setItem('adminToken', data.data.token);
      console.log('Admin logged in successfully!');
      return data.data.token;
    } else {
      throw new Error(data.message || 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Admin login successful",
  "data": {
    "admin": {
      "id": "507f1f77bcf86cd799439011",
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@example.com",
      "role": {
        "name": "super_admin",
        "permissions": {
          "canCreate": true,
          "canRead": true,
          "canUpdate": true,
          "canDelete": true
        }
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### Step 2: Store the Authentication Token

After successful login, store the token securely:

```javascript
// Store token in localStorage (for web applications)
localStorage.setItem('adminToken', token);

// Or store in sessionStorage (cleared when browser closes)
sessionStorage.setItem('adminToken', token);

// Or store in memory (for React Native/mobile apps)
let adminToken = token;
```

### Step 3: Use the Token in API Requests

Include the token in the `Authorization` header for all Admin Reports API requests:

```javascript
// Example: Get all reports
const getReports = async () => {
  const token = localStorage.getItem('adminToken');
  
  const response = await fetch('http://localhost:5000/api/admin-reports', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();
  return data;
};
```

### Step 4: Handle Token Expiration

If your token expires, you'll receive a 401 Unauthorized response. Handle this by:

```javascript
// Example: Handle token expiration
const makeAuthenticatedRequest = async (url, options = {}) => {
  let token = localStorage.getItem('adminToken');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  });

  // If token expired, try to refresh or re-login
  if (response.status === 401) {
    // Attempt to re-login
    const newToken = await loginAdmin();
    localStorage.setItem('adminToken', newToken);
    
    // Retry the request with new token
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${newToken}`
      }
    });
  }

  return response;
};
```

### Complete Setup Example

```javascript
// Complete setup example for React/JavaScript
class AdminReportsAPI {
  constructor(baseURL = 'http://localhost:5000') {
    this.baseURL = baseURL;
    this.token = null;
  }

  // Login and get token
  async login(email, password) {
    try {
      const response = await fetch(`${this.baseURL}/api/admin-auth/admin-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      if (data.success) {
        this.token = data.data.token;
        localStorage.setItem('adminToken', this.token);
        return { success: true, token: this.token, admin: data.data.admin };
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Make authenticated request
  async request(endpoint, options = {}) {
    if (!this.token) {
      this.token = localStorage.getItem('adminToken');
    }

    if (!this.token) {
      throw new Error('No authentication token. Please login first.');
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
        ...options.headers
      }
    });

    // Handle token expiration
    if (response.status === 401) {
      throw new Error('Token expired. Please login again.');
    }

    return response.json();
  }

  // Get all reports
  async getReports(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.request(`/api/admin-reports?${queryParams}`);
  }

  // Verify report
  async verifyReport(reportId, notes) {
    return this.request(`/api/admin-reports/${reportId}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ notes })
    });
  }

  // Resolve report
  async resolveReport(reportId, notes, actions) {
    return this.request(`/api/admin-reports/${reportId}/resolve`, {
      method: 'PUT',
      body: JSON.stringify({ notes, actions })
    });
  }
}

// Usage example
const api = new AdminReportsAPI('http://localhost:5000');

// Login first
await api.login('admin@example.com', 'password123');

// Then use the API
const reports = await api.getReports({ status: 'pending' });
console.log(reports);
```

### cURL Examples

**1. Admin Login:**
```bash
curl -X POST http://localhost:5000/api/admin-auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your-admin-password"
  }'
```

**2. Get All Reports (with token):**
```bash
curl -X GET "http://localhost:5000/api/admin-reports?status=pending&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

**3. Verify Report:**
```bash
curl -X PUT http://localhost:5000/api/admin-reports/507f1f77bcf86cd799439011/verify \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Report verified by admin"
  }'
```

### Environment Configuration

For production, configure your API base URL:

```javascript
// config.js
const config = {
  development: {
    apiBaseURL: 'http://localhost:5000'
  },
  production: {
    apiBaseURL: 'https://api.yourdomain.com'
  }
};

const API_BASE_URL = config[process.env.NODE_ENV || 'development'].apiBaseURL;
```

### Security Best Practices

1. **Never expose tokens in client-side code**: Store tokens securely
2. **Use HTTPS in production**: Always use HTTPS for API requests
3. **Implement token refresh**: Refresh tokens before they expire
4. **Handle logout**: Clear tokens on logout
5. **Validate tokens**: Verify token validity before making requests

```javascript
// Logout function
const logout = () => {
  localStorage.removeItem('adminToken');
  // Optionally call logout endpoint
  fetch('/api/admin-auth/logout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
    }
  });
};
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

**Getting the Token:**
1. Login using `/api/admin-auth/admin-login` or `/api/admin-auth/login`
2. Extract the `token` from the response
3. Include it in the `Authorization` header for all subsequent requests

**Token Expiration:**
- Tokens may expire after a certain period
- Handle 401 responses by re-authenticating
- Store tokens securely and refresh as needed

---

## Get All Reports

### Endpoint Description

**Purpose:** Retrieves a paginated list of all reports with advanced filtering options. Supports filtering by status, type, priority, location, date range, and text search.

**When to Use:** Use this endpoint when you need to:
- Display a list of reports in the admin dashboard
- Filter reports by various criteria
- Implement pagination for large datasets
- Search for specific reports

### Request Method and URL

**HTTP Method:** `GET`

**Endpoint URL:**
```
GET /api/admin-reports
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
// Basic request - get all reports
GET /api/admin-reports

// With pagination
GET /api/admin-reports?page=2&limit=20

// Filter by status
GET /api/admin-reports?status=pending

// Filter by type and status
GET /api/admin-reports?type=Accident&status=verified

// Filter by date range
GET /api/admin-reports?dateFrom=2024-01-01T00:00:00.000Z&dateTo=2024-01-31T23:59:59.999Z

// Search reports
GET /api/admin-reports?search=accident

// Combined filters
GET /api/admin-reports?status=pending&type=Accident&city=Manila&page=1&limit=10
```

### Response Schema

**Success Response (200 OK):**
```json
{
  "success": true,
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
| `data.reports` | array | Array of report objects |
| `data.pagination.current` | number | Current page number |
| `data.pagination.pages` | number | Total number of pages |
| `data.pagination.total` | number | Total number of reports matching filters |

**Note:** Archived reports are automatically excluded from results unless explicitly included.

---

## Get Single Report

### Endpoint Description

**Purpose:** Retrieves detailed information about a specific report, including all comments and related user information. Automatically increments the view count.

**When to Use:** Use this endpoint when you need to:
- Display detailed report information
- Show report comments
- View reporter information
- Track report views

### Request Method and URL

**HTTP Method:** `GET`

**Endpoint URL:**
```
GET /api/admin-reports/:id
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Report MongoDB ObjectId |

### Example Request

```javascript
GET /api/admin-reports/507f1f77bcf86cd799439011
```

### Response Schema

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "report": {
      "_id": "507f1f77bcf86cd799439011",
      "reporter": {
        "_id": "507f1f77bcf86cd799439012",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "+1234567890"
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
      "attachments": [
        {
          "type": "image",
          "filename": "accident.jpg",
          "url": "https://example.com/accident.jpg"
        }
      ],
      "comments": [
        {
          "_id": "507f1f77bcf86cd799439013",
          "author": {
            "_id": "507f1f77bcf86cd799439014",
            "firstName": "Admin",
            "lastName": "User"
          },
          "content": "Investigating the incident",
          "createdAt": "2024-01-15T11:00:00.000Z"
        }
      ],
      "verifiedBy": null,
      "verifiedAt": null,
      "resolvedBy": null,
      "resolvedAt": null,
      "resolutionActions": [],
      "isArchived": false,
      "views": 5,
      "reportedAt": "2024-01-15T10:30:00.000Z",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Report not found"
}
```

---

## Create Report

### Endpoint Description

**Purpose:** Creates a new report. The reporter is automatically set to the authenticated admin user.

**When to Use:** Use this endpoint when you need to:
- Create reports on behalf of users
- Import reports from external sources
- Manually add reports to the system

### Request Method and URL

**HTTP Method:** `POST`

**Endpoint URL:**
```
POST /api/admin-reports
```

### Request Body

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

**Request Body Fields:**

| Field | Type | Required | Description | Valid Values |
|-------|------|----------|-------------|--------------|
| `reportType` | string | Yes | Type of report | `Accident`, `Traffic Jam`, `Road Closure`, `Hazard` |
| `title` | string | Yes | Report title | Max 200 characters |
| `description` | string | Yes | Report description | Max 2000 characters |
| `location` | object | Yes | Location information | - |
| `location.address` | string | Yes | Street address | - |
| `location.barangay` | string | No | Barangay name | - |
| `location.city` | string | Yes | City name | - |
| `location.province` | string | No | Province name | - |
| `location.coordinates.lat` | number | Yes | Latitude | -90 to 90 |
| `location.coordinates.lng` | number | Yes | Longitude | -180 to 180 |
| `priority` | string | No | Priority level | `low`, `medium`, `high`, `urgent` |
| `attachments` | array | No | File attachments | Array of attachment objects |

### Response Schema

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Report created successfully",
  "data": {
    "report": {
      "_id": "507f1f77bcf86cd799439011",
      "reporter": {
        "_id": "507f1f77bcf86cd799439012",
        "firstName": "Admin",
        "lastName": "User",
        "email": "admin@example.com"
      },
      "reportType": "Accident",
      "title": "Car Accident on Main Street",
      "description": "Two vehicles collided at the intersection",
      "status": "pending",
      "priority": "high",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

---

## Update Report

### Endpoint Description

**Purpose:** Updates an existing report. Only provided fields will be updated. All changes are logged in the admin action logs.

**When to Use:** Use this endpoint when you need to:
- Update report details
- Change report status or priority
- Correct report information
- Update location data

### Request Method and URL

**HTTP Method:** `PUT`

**Endpoint URL:**
```
PUT /api/admin-reports/:id
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Report MongoDB ObjectId |

### Request Body

```json
{
  "title": "Updated Report Title",
  "description": "Updated description",
  "status": "verified",
  "priority": "medium",
  "location": {
    "city": "Updated City"
  }
}
```

**Request Body Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | No | Updated title |
| `description` | string | No | Updated description |
| `status` | string | No | Updated status |
| `priority` | string | No | Updated priority |
| `reportType` | string | No | Updated report type |
| `location` | object | No | Updated location data |

**Note:** The following fields cannot be updated directly: `_id`, `createdAt`, `updatedAt`, `reporter`

### Response Schema

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Report updated successfully",
  "data": {
    "report": {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Updated Report Title",
      "description": "Updated description",
      "status": "verified",
      "priority": "medium",
      "updatedAt": "2024-01-15T11:00:00.000Z"
    }
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Report not found"
}
```

**Error Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Not authorized to update this report"
}
```

---

## Delete Report

### Endpoint Description

**Purpose:** Permanently deletes a report from the database. This action is logged in the admin action logs.

**When to Use:** Use this endpoint when you need to:
- Remove duplicate reports
- Delete invalid or spam reports
- Clean up test data

**Warning:** This action cannot be undone. Consider archiving instead of deleting.

### Request Method and URL

**HTTP Method:** `DELETE`

**Endpoint URL:**
```
DELETE /api/admin-reports/:id
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Report MongoDB ObjectId |

### Example Request

```javascript
DELETE /api/admin-reports/507f1f77bcf86cd799439011
Authorization: Bearer <admin-token>
```

### Response Schema

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Report deleted successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Report not found"
}
```

---

## Verify Report

### Endpoint Description

**Purpose:** Verifies a report, changing its status from `pending` to `verified`. This action sends a notification to the reporter and is logged in admin action logs.

**When to Use:** Use this endpoint when you need to:
- Confirm that a report is accurate
- Mark reports as verified after investigation
- Update report status in the workflow

### Request Method and URL

**HTTP Method:** `PUT`

**Endpoint URL:**
```
PUT /api/admin-reports/:id/verify
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Report MongoDB ObjectId |

### Request Body

```json
{
  "notes": "Report verified by admin after investigation"
}
```

**Request Body Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `notes` | string | No | Verification notes |

### Example Request

```javascript
PUT /api/admin-reports/507f1f77bcf86cd799439011/verify
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "notes": "Report verified by admin after investigation"
}
```

### Response Schema

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Report verified successfully",
  "data": {
    "report": {
      "_id": "507f1f77bcf86cd799439011",
      "status": "verified",
      "verifiedBy": "507f1f77bcf86cd799439014",
      "verifiedAt": "2024-01-15T11:00:00.000Z"
    }
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Report not found"
}
```

**Note:** This action automatically sends a notification to the report's creator.

---

## Resolve Report

### Endpoint Description

**Purpose:** Resolves a report, changing its status from `verified` to `resolved`. This action sends a notification to the reporter and is logged in admin action logs.

**When to Use:** Use this endpoint when you need to:
- Mark reports as resolved after taking action
- Close completed reports
- Update report status in the workflow

### Request Method and URL

**HTTP Method:** `PUT`

**Endpoint URL:**
```
PUT /api/admin-reports/:id/resolve
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Report MongoDB ObjectId |

### Request Body

```json
{
  "notes": "Issue resolved",
  "actions": [
    "Traffic cleared",
    "Road reopened",
    "Emergency services notified"
  ]
}
```

**Request Body Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `notes` | string | No | Resolution notes |
| `actions` | array | No | List of actions taken to resolve the issue |

### Example Request

```javascript
PUT /api/admin-reports/507f1f77bcf86cd799439011/resolve
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "notes": "Issue resolved",
  "actions": [
    "Traffic cleared",
    "Road reopened"
  ]
}
```

### Response Schema

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Report resolved successfully",
  "data": {
    "report": {
      "_id": "507f1f77bcf86cd799439011",
      "status": "resolved",
      "resolvedBy": "507f1f77bcf86cd799439014",
      "resolvedAt": "2024-01-15T12:00:00.000Z",
      "resolutionActions": [
        "Traffic cleared",
        "Road reopened"
      ]
    }
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Report not found"
}
```

**Note:** This action automatically sends a notification to the report's creator.

---

## Add Comment to Report

### Endpoint Description

**Purpose:** Adds a comment to a report. Comments can be used for internal communication, notes, or updates.

**When to Use:** Use this endpoint when you need to:
- Add notes or observations about a report
- Communicate with other admins about a report
- Track investigation progress

### Request Method and URL

**HTTP Method:** `POST`

**Endpoint URL:**
```
POST /api/admin-reports/:id/comments
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Report MongoDB ObjectId |

### Request Body

```json
{
  "content": "Investigating the incident. Will update soon."
}
```

**Request Body Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `content` | string | Yes | Comment content |

### Response Schema

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "report": {
      "_id": "507f1f77bcf86cd799439011",
      "comments": [
        {
          "_id": "507f1f77bcf86cd799439015",
          "author": {
            "_id": "507f1f77bcf86cd799439014",
            "firstName": "Admin",
            "lastName": "User"
          },
          "content": "Investigating the incident. Will update soon.",
          "createdAt": "2024-01-15T11:30:00.000Z"
        }
      ]
    }
  }
}
```

---

## Get Reports by Location

### Endpoint Description

**Purpose:** Retrieves reports within a specified radius of a given location using geospatial queries.

**When to Use:** Use this endpoint when you need to:
- Find reports near a specific location
- Display reports on a map
- Get reports within a geographic area

### Request Method and URL

**HTTP Method:** `GET`

**Endpoint URL:**
```
GET /api/admin-reports/location
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `lat` | number | Yes | Latitude coordinate |
| `lng` | number | Yes | Longitude coordinate |
| `radius` | number | No | Search radius in meters (default: 1000) |

### Example Request

```javascript
GET /api/admin-reports/location?lat=14.5995&lng=120.9842&radius=2000
```

### Response Schema

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "reportType": "Accident",
        "title": "Car Accident on Main Street",
        "location": {
          "coordinates": {
            "lat": 14.5995,
            "lng": 120.9842
          }
        },
        "status": "pending"
      }
    ]
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Latitude and longitude are required"
}
```

---

## Get Report Statistics

### Endpoint Description

**Purpose:** Retrieves comprehensive statistics about reports, including counts by status, type, and average resolution times.

**When to Use:** Use this endpoint when you need to:
- Display dashboard statistics
- Generate analytics reports
- Monitor report trends
- Track performance metrics

### Request Method and URL

**HTTP Method:** `GET`

**Endpoint URL:**
```
GET /api/admin-reports/stats
```

### Example Request

```javascript
GET /api/admin-reports/stats
Authorization: Bearer <admin-token>
```

### Response Schema

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "overall": {
      "totalReports": 150,
      "pendingReports": 45,
      "verifiedReports": 60,
      "resolvedReports": 40,
      "archivedReports": 5,
      "avgResolutionTime": 2.5
    },
    "byType": [
      {
        "_id": "Accident",
        "count": 50,
        "pending": 15,
        "verified": 20,
        "resolved": 15
      },
      {
        "_id": "Traffic Jam",
        "count": 40,
        "pending": 12,
        "verified": 18,
        "resolved": 10
      },
      {
        "_id": "Road Closure",
        "count": 35,
        "pending": 10,
        "verified": 15,
        "resolved": 10
      },
      {
        "_id": "Hazard",
        "count": 25,
        "pending": 8,
        "verified": 7,
        "resolved": 5
      }
    ]
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `overall.totalReports` | number | Total number of reports |
| `overall.pendingReports` | number | Number of pending reports |
| `overall.verifiedReports` | number | Number of verified reports |
| `overall.resolvedReports` | number | Number of resolved reports |
| `overall.archivedReports` | number | Number of archived reports |
| `overall.avgResolutionTime` | number | Average resolution time in days |
| `byType` | array | Statistics grouped by report type |

---

## Archive Report

### Endpoint Description

**Purpose:** Archives a report, marking it as archived. Archived reports are excluded from default queries but can still be accessed.

**When to Use:** Use this endpoint when you need to:
- Remove reports from active view without deleting them
- Store old or completed reports
- Maintain report history

### Request Method and URL

**HTTP Method:** `PUT`

**Endpoint URL:**
```
PUT /api/admin-reports/:id/archive
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Report MongoDB ObjectId |

### Example Request

```javascript
PUT /api/admin-reports/507f1f77bcf86cd799439011/archive
Authorization: Bearer <admin-token>
```

### Response Schema

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Report archived successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Report not found"
}
```

---

## Reverse Geocode Report

### Endpoint Description

**Purpose:** Converts coordinates to a human-readable address using Google Maps Geocoding API. This is a utility endpoint that doesn't modify any reports.

**When to Use:** Use this endpoint when you need to:
- Get address from coordinates
- Preview geocoding results
- Test geocoding functionality

### Request Method and URL

**HTTP Method:** `GET`

**Endpoint URL:**
```
GET /api/admin-reports/reverse-geocode
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `lat` | number | Yes | Latitude coordinate |
| `lng` | number | Yes | Longitude coordinate |

### Example Request

```javascript
GET /api/admin-reports/reverse-geocode?lat=14.5995&lng=120.9842
```

### Response Schema

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Address retrieved successfully",
  "data": {
    "coordinates": {
      "lat": 14.5995,
      "lng": 120.9842
    },
    "address": {
      "formatted": "123 Main Street, Manila, Metro Manila, Philippines",
      "street": "Main Street",
      "city": "Manila",
      "province": "Metro Manila",
      "country": "Philippines"
    },
    "geocodedAddress": "123 Main Street, Manila, Metro Manila, Philippines",
    "geocodingStatus": "success"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Latitude and longitude are required"
}
```

---

## Bulk Reverse Geocode Reports

### Endpoint Description

**Purpose:** Reverse geocodes multiple reports at once. This is useful for batch processing reports that need addresses.

**When to Use:** Use this endpoint when you need to:
- Process multiple reports in bulk
- Update addresses for existing reports
- Batch geocoding operations

### Request Method and URL

**HTTP Method:** `POST`

**Endpoint URL:**
```
POST /api/admin-reports/bulk-reverse-geocode
```

### Request Body

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

### Example Request

```javascript
POST /api/admin-reports/bulk-reverse-geocode
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "reportIds": [
    "507f1f77bcf86cd799439011",
    "507f1f77bcf86cd799439012"
  ]
}
```

### Response Schema

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Bulk reverse geocoding completed",
  "data": {
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
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "reportIds array is required"
}
```

---

## Auto Reverse Geocode Report

### Endpoint Description

**Purpose:** Automatically reverse geocodes a specific report and saves the result. This updates the report's geocoded address.

**When to Use:** Use this endpoint when you need to:
- Update a single report's address
- Fix missing geocoded addresses
- Refresh geocoding for a report

### Request Method and URL

**HTTP Method:** `PUT`

**Endpoint URL:**
```
PUT /api/admin-reports/:id/auto-reverse-geocode
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Report MongoDB ObjectId |

### Example Request

```javascript
PUT /api/admin-reports/507f1f77bcf86cd799439011/auto-reverse-geocode
Authorization: Bearer <admin-token>
```

### Response Schema

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Report reverse geocoded successfully",
  "data": {
    "report": {
      "_id": "507f1f77bcf86cd799439011",
      "geocodedAddress": "123 Main Street, Manila, Metro Manila, Philippines",
      "address": "123 Main Street, Manila",
      "geocodingStatus": "success",
      "geocodingError": null
    }
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Report not found"
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Report does not have valid coordinates"
}
```

---

## Data Models

### Report Schema (Admin)

```javascript
{
  _id: ObjectId,                    // MongoDB document ID
  reporter: ObjectId,              // Reference to User (who created the report)
  reportType: String,              // "Accident" | "Traffic Jam" | "Road Closure" | "Hazard"
  title: String,                   // Report title (required, max 200 chars)
  description: String,             // Report description (required, max 2000 chars)
  location: {
    address: String,               // Street address
    barangay: String,              // Barangay name
    city: String,                  // City name
    province: String,              // Province name
    coordinates: {
      lat: Number,                 // Latitude (-90 to 90)
      lng: Number                  // Longitude (-180 to 180)
    }
  },
  status: String,                  // "pending" | "verified" | "resolved" (default: "pending")
  priority: String,                // "low" | "medium" | "high" | "urgent"
  attachments: [{
    type: String,                  // "image" | "video" | "document"
    filename: String,
    url: String
  }],
  comments: [{
    author: ObjectId,              // Reference to User
    content: String,              // Comment content
    createdAt: Date
  }],
  verifiedBy: ObjectId,            // Reference to User (admin who verified)
  verifiedAt: Date,               // Verification timestamp
  resolvedBy: ObjectId,            // Reference to User (admin who resolved)
  resolvedAt: Date,               // Resolution timestamp
  resolutionActions: [String],     // Actions taken to resolve
  isArchived: Boolean,             // Archive flag (default: false)
  archivedAt: Date,                // Archive timestamp
  archivedBy: ObjectId,           // Reference to User (admin who archived)
  views: Number,                   // View count (default: 0)
  reportedAt: Date,               // Report creation timestamp
  createdAt: Date,                 // Document creation date
  updatedAt: Date                  // Document last update date
}
```

### Valid Report Types

- `Accident` - Vehicle accidents or collisions
- `Traffic Jam` - Heavy traffic or congestion
- `Road Closure` - Closed roads or construction
- `Hazard` - Road hazards or dangerous conditions

### Valid Status Values

- `pending` - Report is pending verification
- `verified` - Report has been verified by admin
- `resolved` - Report has been resolved

### Valid Priority Values

- `low` - Low priority
- `medium` - Medium priority (default)
- `high` - High priority
- `urgent` - Urgent priority

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

**404 Not Found:**
```json
{
  "success": false,
  "message": "Report not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Server error message",
  "error": "Error details"
}
```

---

## Frontend Integration Examples

### React/JavaScript Example

#### 1. Get All Reports with Filters

```javascript
// Get reports function
const getReports = async (filters = {}, token) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.priority) queryParams.append('priority', filters.priority);
    if (filters.city) queryParams.append('city', filters.city);
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);

    const response = await fetch(
      `/api/admin-reports?${queryParams.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch reports');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
};

// Usage example
const loadReports = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    const reportsData = await getReports({
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

#### 2. Verify Report

```javascript
// Verify report function
const verifyReport = async (reportId, notes, token) => {
  try {
    const response = await fetch(`/api/admin-reports/${reportId}/verify`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ notes })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to verify report');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error verifying report:', error);
    throw error;
  }
};

// Usage example
const handleVerify = async (reportId) => {
  try {
    const token = localStorage.getItem('adminToken');
    const notes = prompt('Enter verification notes:');
    
    if (notes) {
      await verifyReport(reportId, notes, token);
      alert('Report verified successfully!');
      // Refresh reports list
      await loadReports();
    }
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
};
```

#### 3. Resolve Report

```javascript
// Resolve report function
const resolveReport = async (reportId, notes, actions, token) => {
  try {
    const response = await fetch(`/api/admin-reports/${reportId}/resolve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ notes, actions })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to resolve report');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error resolving report:', error);
    throw error;
  }
};

// Usage example
const handleResolve = async (reportId) => {
  try {
    const token = localStorage.getItem('adminToken');
    const notes = 'Issue resolved';
    const actions = [
      'Traffic cleared',
      'Road reopened'
    ];
    
    await resolveReport(reportId, notes, actions, token);
    alert('Report resolved successfully!');
    await loadReports();
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
};
```

#### 4. Get Report Statistics

```javascript
// Get report statistics function
const getReportStats = async (token) => {
  try {
    const response = await fetch('/api/admin-reports/stats', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch statistics');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching statistics:', error);
    throw error;
  }
};

// Usage example
const loadStatistics = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    const stats = await getReportStats(token);
    
    setOverallStats(stats.overall);
    setTypeStats(stats.byType);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## Best Practices

### 1. Report Management

- **Use appropriate statuses**: Follow the workflow (pending → verified → resolved)
- **Add meaningful notes**: Include detailed notes when verifying or resolving
- **Archive instead of delete**: Archive old reports rather than deleting them
- **Track resolution actions**: Document all actions taken to resolve issues

### 2. Filtering and Search

- **Use pagination**: Always implement pagination for large datasets
- **Combine filters**: Use multiple filters to narrow down results
- **Cache statistics**: Cache report statistics to reduce API calls
- **Optimize queries**: Use appropriate filters to reduce database load

### 3. Geocoding

- **Batch process**: Use bulk geocoding for multiple reports
- **Handle failures**: Implement retry logic for failed geocoding
- **Cache results**: Cache geocoded addresses to reduce API calls
- **Validate coordinates**: Ensure coordinates are valid before geocoding

### 4. Security

- **Validate admin tokens**: Always verify admin authentication
- **Log all actions**: All admin actions are automatically logged
- **Handle errors gracefully**: Don't expose sensitive error details
- **Rate limiting**: Implement rate limiting for bulk operations

### 5. Performance

- **Use pagination**: Limit results per page
- **Index queries**: Ensure database indexes are in place
- **Cache frequently accessed data**: Cache statistics and common queries
- **Optimize filters**: Use efficient filter combinations

---

## Support

For issues or questions regarding the Admin Reports API, please refer to the main API documentation or contact the development team.

---

**Last Updated:** January 2024  
**API Version:** 1.0

