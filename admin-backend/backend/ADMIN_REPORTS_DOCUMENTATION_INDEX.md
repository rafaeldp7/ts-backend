# Admin Backend Reports - Complete Documentation Index

## Overview

This document serves as a comprehensive index for all Admin Backend Reports API documentation. All documentation is located in the `admin-backend/backend` folder.

---

## 📚 Documentation Files

### 1. Main Admin Reports API Documentation
**File:** `ADMIN_REPORTS_API_DOCUMENTATION.md` (Root folder)

**Content:**
- Complete API reference for all admin report endpoints
- Authentication and access instructions
- CRUD operations (Create, Read, Update, Delete)
- Report verification and resolution workflow
- Advanced filtering and search
- Location-based queries
- Reverse geocoding support
- Report statistics and analytics
- Comment system
- Archive management
- Data models
- Error handling
- Frontend integration examples
- Best practices

**Endpoints Covered:**
- `GET /api/admin-reports` - Get all reports
- `GET /api/admin-reports/:id` - Get single report
- `POST /api/admin-reports` - Create report
- `PUT /api/admin-reports/:id` - Update report
- `DELETE /api/admin-reports/:id` - Delete report
- `PUT /api/admin-reports/:id/verify` - Verify report
- `PUT /api/admin-reports/:id/resolve` - Resolve report
- `POST /api/admin-reports/:id/comments` - Add comment
- `GET /api/admin-reports/location` - Get reports by location
- `GET /api/admin-reports/stats` - Get report statistics
- `PUT /api/admin-reports/:id/archive` - Archive report
- `GET /api/admin-reports/reverse-geocode` - Reverse geocode
- `POST /api/admin-reports/bulk-reverse-geocode` - Bulk reverse geocode
- `PUT /api/admin-reports/:id/auto-reverse-geocode` - Auto reverse geocode

---

### 2. Report Count API Documentation
**File:** `admin-backend/backend/REPORT_COUNT_API_DOCUMENTATION.md`

**Content:**
- Complete documentation for report count endpoints
- Total, active, and archived report counts
- Active and archived reports data endpoints
- Frontend integration examples (React, RTK Query, cURL)
- Error handling
- Logic confirmation
- Best practices

**Endpoints Covered:**
- `GET /api/admin-reports/count/total` - Get total report count
- `GET /api/admin-reports/count/active` - Get active report count
- `GET /api/admin-reports/count/archived` - Get archived report count
- `GET /api/admin-reports/active` - Get all active reports
- `GET /api/admin-reports/archived` - Get all archived reports

**Key Features:**
- Count endpoints for dashboard statistics
- Active reports filtering (archived = false)
- Archived reports filtering (archived = true)
- Full pagination and filtering support
- Mathematical relationship: `totalCount = activeCount + archivedCount`

---

### 3. Report Count Implementation Guide
**File:** `admin-backend/backend/REPORT_COUNT_IMPLEMENTATION_GUIDE.md`

**Content:**
- Quick reference guide for report count endpoints
- Implementation details
- File locations and code references
- Quick usage examples
- Testing commands
- Logic confirmation

**Use Cases:**
- Quick lookup for developers
- Implementation reference
- Testing guide
- Code examples

---

## 📋 Complete Endpoint List

### Report Management Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/admin-reports` | Get all reports (with filters) | ✅ Admin |
| `GET` | `/api/admin-reports/:id` | Get single report | ✅ Admin |
| `POST` | `/api/admin-reports` | Create new report | ✅ Admin |
| `PUT` | `/api/admin-reports/:id` | Update report | ✅ Admin |
| `DELETE` | `/api/admin-reports/:id` | Delete report | ✅ Admin |

### Report Workflow Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `PUT` | `/api/admin-reports/:id/verify` | Verify report | ✅ Admin |
| `PUT` | `/api/admin-reports/:id/resolve` | Resolve report | ✅ Admin |
| `PUT` | `/api/admin-reports/:id/archive` | Archive report | ✅ Admin |
| `POST` | `/api/admin-reports/:id/comments` | Add comment | ✅ Admin |

### Report Count Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/admin-reports/count/total` | Get total count | ✅ Admin |
| `GET` | `/api/admin-reports/count/active` | Get active count | ✅ Admin |
| `GET` | `/api/admin-reports/count/archived` | Get archived count | ✅ Admin |
| `GET` | `/api/admin-reports/active` | Get active reports | ✅ Admin |
| `GET` | `/api/admin-reports/archived` | Get archived reports | ✅ Admin |

### Report Query Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/admin-reports/location` | Get reports by location | ✅ Admin |
| `GET` | `/api/admin-reports/stats` | Get report statistics | ✅ Admin |

### Geocoding Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/admin-reports/reverse-geocode` | Reverse geocode coordinates | Public |
| `POST` | `/api/admin-reports/bulk-reverse-geocode` | Bulk reverse geocode | ✅ Admin |
| `PUT` | `/api/admin-reports/:id/auto-reverse-geocode` | Auto reverse geocode report | ✅ Admin |

**Total: 18 Endpoints**

---

## 🔑 Authentication

All admin endpoints require authentication via JWT token:

```javascript
Authorization: Bearer <admin-jwt-token>
```

**How to Get Token:**
1. Login via `POST /api/admin-auth/admin-login` or `POST /api/admin-auth/login`
2. Extract token from response
3. Include in `Authorization` header for all requests

See `ADMIN_REPORTS_API_DOCUMENTATION.md` for detailed authentication instructions.

---

## 📖 Quick Start Guide

### 1. Get Report Counts

```javascript
// Get all counts in parallel
const [total, active, archived] = await Promise.all([
  fetch('/api/admin-reports/count/total', {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json()),
  fetch('/api/admin-reports/count/active', {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json()),
  fetch('/api/admin-reports/count/archived', {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json())
]);
```

### 2. Get Active Reports

```javascript
const activeReports = await fetch('/api/admin-reports/active?page=1&limit=10', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());
```

### 3. Get Archived Reports

```javascript
const archivedReports = await fetch('/api/admin-reports/archived?page=1&limit=10', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());
```

### 4. Verify a Report

```javascript
await fetch(`/api/admin-reports/${reportId}/verify`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ notes: 'Report verified' })
});
```

---

## 📁 File Structure

```
admin-backend/
└── backend/
    ├── controllers/
    │   └── reportController.js          # All report controllers
    ├── routes/
    │   └── reports.js                    # All report routes
    ├── REPORT_COUNT_API_DOCUMENTATION.md # Count endpoints docs
    └── REPORT_COUNT_IMPLEMENTATION_GUIDE.md # Quick guide

Root folder:
└── ADMIN_REPORTS_API_DOCUMENTATION.md    # Main API documentation
```

---

## 🎯 Use Cases by Documentation

### Use `ADMIN_REPORTS_API_DOCUMENTATION.md` when you need:
- Complete API reference
- Authentication setup
- CRUD operations
- Workflow management (verify, resolve, archive)
- Geocoding operations
- Statistics and analytics
- Data models
- Error handling patterns

### Use `REPORT_COUNT_API_DOCUMENTATION.md` when you need:
- Report count endpoints
- Dashboard statistics
- Active vs archived filtering
- Count endpoint implementation
- Frontend integration for counts

### Use `REPORT_COUNT_IMPLEMENTATION_GUIDE.md` when you need:
- Quick reference
- Code location references
- Fast implementation examples
- Testing commands

---

## 🔍 Logic Summary

### Report Filtering Logic

1. **Total Reports** - All reports (no filter)
   - Filter: `{}`
   - Result: Active + Archived

2. **Active Reports** - Non-archived reports
   - Filter: `archived = false` (isArchived != true OR archived != true)
   - Result: Only non-archived reports

3. **Archived Reports** - Archived reports only
   - Filter: `archived = true` (isArchived == true OR archived == true)
   - Result: Only archived reports

### Mathematical Relationship

```
totalCount = activeCount + archivedCount
```

---

## 📝 Response Format

All endpoints return standardized responses:

**Success:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error message"
}
```

---

## 🚀 Getting Started

1. **Read Authentication Section** in `ADMIN_REPORTS_API_DOCUMENTATION.md`
2. **Get Admin Token** via login endpoint
3. **Start with Count Endpoints** using `REPORT_COUNT_API_DOCUMENTATION.md`
4. **Implement Report Management** using main documentation
5. **Reference Implementation Guide** for quick lookups

---

## 📞 Support

For questions or issues:
1. Check the relevant documentation file
2. Review code examples in documentation
3. Verify authentication token is valid
4. Check endpoint URLs and parameters

---

## 📅 Last Updated

- **Main Documentation:** January 2024
- **Count Documentation:** Current
- **Implementation Guide:** Current

---

**All documentation is located in:**
- `admin-backend/backend/` folder (for count endpoints)
- Root folder (for main API documentation)

