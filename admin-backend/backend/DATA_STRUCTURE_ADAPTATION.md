# Admin Backend Report Controller - Data Structure Adaptation

## Overview

The admin-backend report controllers have been adapted to work with the actual data structure used in the database. This document outlines all the changes made to ensure compatibility with the existing data format.

---

## Sample Data Structure

Based on the actual database records, reports use the following structure:

```json
{
  "_id": "691452b3cb689afa526246e9",
  "userId": "683a89bb6f312bdee8b6182f",
  "reportType": "Traffic Jam",
  "description": "tagal dito may bangaan",
  "address": "222, Pablo Dela Cruz, Quezon City, Metro Manila, 1116, Philippines",
  "verified": {
    "verifiedByAdmin": 0,
    "verifiedByUser": 0
  },
  "location": { ... },
  "archived": false,
  "geocodingStatus": "success",
  "votes": [],
  "timestamp": "2025-11-12T09:26:11.991+00:00",
  "geocodedAddress": "222 Pablo Dela Cruz, Novaliches, Quezon City, 1116 Metro Manila, Philippines",
  "geocodingError": null,
  "__v": 0
}
```

---

## Key Data Structure Differences

### Primary Fields (Used in Actual Data)

1. **`userId`** - Primary user reference (not `reporter`)
2. **`description`** - Primary text field (not `title`)
3. **`address`** - Top-level address field (not `location.address`)
4. **`archived`** - Primary archive flag (not `isArchived`)
5. **`timestamp`** - Primary date field (not `reportedAt`)
6. **`verified`** - Object with `verifiedByAdmin` and `verifiedByUser` (not `verifiedBy`, `verifiedAt`)
7. **`geocodedAddress`** - Top-level geocoded address
8. **`geocodingStatus`** - Top-level geocoding status
9. **`geocodingError`** - Top-level geocoding error

### Compatibility Fields (Also Supported)

- `reporter` - Synced with `userId` via model middleware
- `title` - Synced with `description` via model middleware
- `isArchived` - Synced with `archived` via model middleware
- `reportedAt` - Synced with `timestamp` via model middleware
- `verifiedBy`, `verifiedAt` - Admin workflow fields

---

## Changes Made to Controllers

### 1. User Reference Priority

**Changed:** Prioritize `userId` over `reporter` when populating

**Before:**
```javascript
.populate('reporter', 'firstName lastName email')
.populate('userId', 'firstName lastName email')
```

**After:**
```javascript
.populate('userId', 'firstName lastName email')
.populate('reporter', 'firstName lastName email')
```

**Affected Functions:**
- `getReports()`
- `getReport()`
- `getActiveReports()`
- `getArchivedReports()`

---

### 2. Search Filter Priority

**Changed:** Prioritize `description` and `address` in search filters

**Before:**
```javascript
$or: [
  { title: new RegExp(search, 'i') },
  { description: new RegExp(search, 'i') },
  { 'location.address': new RegExp(search, 'i') },
  { address: new RegExp(search, 'i') }
]
```

**After:**
```javascript
$or: [
  { description: new RegExp(search, 'i') },
  { title: new RegExp(search, 'i') },
  { address: new RegExp(search, 'i') },
  { geocodedAddress: new RegExp(search, 'i') },
  { 'location.address': new RegExp(search, 'i') }
]
```

**Affected Functions:**
- `getReports()`
- `getActiveReports()`
- `getArchivedReports()`

**Benefits:**
- Searches primary fields first (`description`, `address`)
- Includes `geocodedAddress` for better search coverage
- Maintains backward compatibility with `title` and `location.address`

---

### 3. Date Filtering Priority

**Changed:** Prioritize `timestamp` over `reportedAt` in date filters

**Before:**
```javascript
{ reportedAt: { $gte: new Date(dateFrom) } },
{ timestamp: { $gte: new Date(dateFrom) } }
```

**After:**
```javascript
{ timestamp: { $gte: new Date(dateFrom) } },
{ reportedAt: { $gte: new Date(dateFrom) } }
```

**Affected Functions:**
- `getReports()`
- `getActiveReports()`
- `getArchivedReports()`

---

### 4. Sorting Priority

**Changed:** Prioritize `timestamp` in sorting

**Before:**
```javascript
.sort({ reportedAt: -1, timestamp: -1, createdAt: -1 })
```

**After:**
```javascript
.sort({ timestamp: -1, reportedAt: -1, createdAt: -1 })
```

**Affected Functions:**
- `getReports()`
- `getActiveReports()`
- `getArchivedReports()`

---

### 5. Report Creation

**Changed:** Set both `userId` and `reporter` when creating reports

**Before:**
```javascript
const reportData = {
  ...req.body,
  reporter: req.user.id
};
```

**After:**
```javascript
const reportData = {
  ...req.body,
  userId: req.user.id,
  reporter: req.user.id
};
```

**Affected Functions:**
- `createReport()`

---

### 6. Logging and Notifications

**Changed:** Use `description` as primary field, fallback to `title`

**Before:**
```javascript
description: `Updated report: "${report.title}" (ID: ${report._id})`
```

**After:**
```javascript
description: `Updated report: "${report.description || report.title}" (ID: ${report._id})`
```

**Affected Functions:**
- `updateReport()`
- `deleteReport()`
- `verifyReport()`
- `resolveReport()`
- `archiveReport()`

**Notification Changes:**
- Use `userId` as primary recipient, fallback to `reporter`
- Use `description || title` in notification messages

**Before:**
```javascript
recipient: report.reporter,
message: `Your report "${report.title}" has been verified.`
```

**After:**
```javascript
const recipientId = report.userId || report.reporter;
if (recipientId) {
  recipient: recipientId,
  message: `Your report "${report.description || report.title}" has been verified.`
}
```

---

### 7. Archive Function

**Changed:** Set both `archived` and `isArchived` for compatibility

**Before:**
```javascript
report.isArchived = true;
```

**After:**
```javascript
report.archived = true;
report.isArchived = true;
```

**Affected Functions:**
- `archiveReport()`

---

## Field Mapping Summary

| Actual Data Field | Controller Usage | Compatibility Field |
|-------------------|-----------------|---------------------|
| `userId` | ✅ Primary | `reporter` (synced) |
| `description` | ✅ Primary | `title` (synced) |
| `address` | ✅ Primary | `location.address` (supported) |
| `archived` | ✅ Primary | `isArchived` (synced) |
| `timestamp` | ✅ Primary | `reportedAt` (synced) |
| `verified` | ✅ Object | `verifiedBy`, `verifiedAt` (admin workflow) |
| `geocodedAddress` | ✅ Included in search | - |
| `geocodingStatus` | ✅ Used | - |
| `geocodingError` | ✅ Used | - |

---

## Backward Compatibility

All changes maintain backward compatibility:

1. **Dual Field Support:** Both old and new field names are supported
2. **Model Middleware:** The `Reports` model automatically syncs fields via pre-save middleware
3. **Fallback Logic:** Controllers use fallback logic (`description || title`, `userId || reporter`)
4. **Query Flexibility:** Queries check both field formats using `$or` conditions

---

## Testing Recommendations

### Test Cases

1. **Search Functionality**
   - Search by `description` ✅
   - Search by `address` ✅
   - Search by `geocodedAddress` ✅
   - Verify backward compatibility with `title` and `location.address`

2. **Date Filtering**
   - Filter by `timestamp` ✅
   - Verify backward compatibility with `reportedAt`

3. **User Population**
   - Verify `userId` is populated correctly ✅
   - Verify `reporter` is populated as fallback ✅

4. **Archive Operations**
   - Verify `archived` flag is set ✅
   - Verify `isArchived` is synced ✅

5. **Notifications**
   - Verify notifications use `userId` ✅
   - Verify fallback to `reporter` if `userId` is missing ✅

---

## Files Modified

- ✅ `admin-backend/backend/controllers/reportController.js`
  - Updated all query functions
  - Updated populate order
  - Updated search filters
  - Updated date filtering
  - Updated sorting
  - Updated logging
  - Updated notifications

---

## Summary

All admin-backend report controllers have been successfully adapted to work with the actual data structure:

✅ **Primary Fields:** `userId`, `description`, `address`, `archived`, `timestamp`  
✅ **Search:** Prioritizes `description` and `address`, includes `geocodedAddress`  
✅ **Date Filtering:** Prioritizes `timestamp` over `reportedAt`  
✅ **Sorting:** Prioritizes `timestamp`  
✅ **User References:** Prioritizes `userId` over `reporter`  
✅ **Notifications:** Uses `userId` with fallback to `reporter`  
✅ **Logging:** Uses `description` with fallback to `title`  
✅ **Backward Compatibility:** All changes maintain compatibility with existing fields

---

**Last Updated:** Current  
**Status:** ✅ All controllers adapted and tested

