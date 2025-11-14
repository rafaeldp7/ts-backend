# Admin Reports API Endpoints - Implementation Analysis

## ⚠️ CRITICAL ISSUES FOUND

**Date:** Current Analysis  
**Status:** **MOST ENDPOINTS WILL FAIL** - Model/Controller Mismatch

---

## Executive Summary

After analyzing the admin-backend implementation, **most endpoints will NOT work** due to a critical mismatch between:
- The **Report model** (`models/Reports.js`) 
- The **Controller expectations** (`admin-backend/backend/controllers/reportController.js`)

The controller expects fields and methods that **do not exist** in the actual Report model.

---

## Endpoint Status Analysis

### ✅ **WORKING ENDPOINTS** (2/12)

These endpoints use methods that exist in the model:

1. **GET /api/admin-reports/reverse-geocode** ✅
   - Uses: `report.reverseGeocode()` - **EXISTS** in model
   - Status: **WORKING**

2. **POST /api/admin-reports/bulk-reverse-geocode** ✅
   - Uses: `Report.reverseGeocodeReports()` - **EXISTS** in model
   - Status: **WORKING**

---

### ❌ **BROKEN ENDPOINTS** (10/12)

These endpoints will **FAIL** due to missing methods/fields:

#### 1. **GET /api/admin-reports** ❌
**Issues:**
- ❌ Tries to filter by `isArchived: false` but model has `archived: false`
- ❌ Tries to filter by `status` field which **doesn't exist** in model
- ❌ Tries to filter by `priority` field which **doesn't exist** in model
- ❌ Tries to filter by `location.city` and `location.barangay` which **don't exist** in model
- ❌ Tries to filter by `reportedAt` but model has `timestamp`
- ❌ Tries to search by `title` field which **doesn't exist** in model
- ❌ Tries to populate `reporter` but model has `userId`
- ❌ Tries to populate `verifiedBy` which **doesn't exist** in model
- ❌ Tries to populate `resolvedBy` which **doesn't exist** in model
- ❌ Tries to sort by `reportedAt` but model has `timestamp`

**Error:** Will return empty results or throw errors

---

#### 2. **GET /api/admin-reports/:id** ❌
**Issues:**
- ❌ Tries to populate `reporter` but model has `userId`
- ❌ Tries to populate `verifiedBy` which **doesn't exist** in model
- ❌ Tries to populate `resolvedBy` which **doesn't exist** in model
- ❌ Tries to populate `comments.author` but `comments` field **doesn't exist** in model
- ❌ Calls `report.incrementViews()` - **METHOD DOESN'T EXIST**

**Error:** Will throw `TypeError: report.incrementViews is not a function`

---

#### 3. **POST /api/admin-reports** ❌
**Issues:**
- ❌ Sets `reporter: req.user.id` but model expects `userId`
- ❌ Tries to populate `reporter` but model has `userId`
- ❌ May try to save fields like `title`, `status`, `priority` which **don't exist** in model

**Error:** May save but with wrong field names, or validation errors

---

#### 4. **PUT /api/admin-reports/:id** ❌
**Issues:**
- ❌ Tries to access `report.reporter` but model has `userId`
- ❌ Tries to access `report.title` which **doesn't exist** in model
- ❌ Tries to access `report.status` which **doesn't exist** in model
- ❌ Tries to access `report.priority` which **doesn't exist** in model

**Error:** Will throw errors when trying to access undefined fields

---

#### 5. **DELETE /api/admin-reports/:id** ❌
**Issues:**
- ❌ Tries to access `report.reporter` but model has `userId`
- ❌ Tries to access `report.title` which **doesn't exist** in model
- ❌ Tries to access `report.status` which **doesn't exist** in model
- ❌ Tries to access `report.priority` which **doesn't exist** in model

**Error:** Will throw errors when trying to access undefined fields

---

#### 6. **PUT /api/admin-reports/:id/verify** ❌
**Issues:**
- ❌ Calls `report.updateStatus()` - **METHOD DOESN'T EXIST**
- ❌ Tries to access `report.title` which **doesn't exist** in model
- ❌ Tries to access `report.reporter` but model has `userId`

**Error:** Will throw `TypeError: report.updateStatus is not a function`

---

#### 7. **PUT /api/admin-reports/:id/resolve** ❌
**Issues:**
- ❌ Calls `report.updateStatus()` - **METHOD DOESN'T EXIST**
- ❌ Tries to set `report.resolutionActions` which **doesn't exist** in model
- ❌ Tries to access `report.title` which **doesn't exist** in model
- ❌ Tries to access `report.reporter` but model has `userId`

**Error:** Will throw `TypeError: report.updateStatus is not a function`

---

#### 8. **POST /api/admin-reports/:id/comments** ❌
**Issues:**
- ❌ Calls `report.addComment()` - **METHOD DOESN'T EXIST**
- ❌ `comments` field **doesn't exist** in model

**Error:** Will throw `TypeError: report.addComment is not a function`

---

#### 9. **GET /api/admin-reports/location** ❌
**Issues:**
- ❌ Calls `Report.findByLocation()` - **STATIC METHOD DOESN'T EXIST**

**Error:** Will throw `TypeError: Report.findByLocation is not a function`

---

#### 10. **GET /api/admin-reports/stats** ❌
**Issues:**
- ❌ Calls `Report.getReportStats()` - **STATIC METHOD DOESN'T EXIST**
- ❌ Calls `Report.getReportsByType()` - **STATIC METHOD DOESN'T EXIST**

**Error:** Will throw `TypeError: Report.getReportStats is not a function`

---

#### 11. **PUT /api/admin-reports/:id/archive** ❌
**Issues:**
- ❌ Sets `report.isArchived = true` but model has `archived`
- ❌ Sets `report.archivedAt` which **doesn't exist** in model
- ❌ Sets `report.archivedBy` which **doesn't exist** in model
- ❌ Tries to access `report.title` which **doesn't exist** in model
- ❌ Tries to access `report.status` which **doesn't exist** in model

**Error:** Will set wrong field name, may not work as expected

---

#### 12. **PUT /api/admin-reports/:id/auto-reverse-geocode** ⚠️
**Issues:**
- ✅ Uses `report.reverseGeocode()` - **EXISTS** in model
- ❌ Tries to access `report.location.latitude/longitude` - **EXISTS** but different structure
- ❌ Tries to access `report.description` - **EXISTS** but controller logs it as `reportDescription`

**Status:** **PARTIALLY WORKING** - May work but with incorrect field access

---

## Model vs Controller Field Mapping

| Controller Expects | Model Actually Has | Status |
|-------------------|-------------------|--------|
| `report.reporter` | `report.userId` | ❌ MISMATCH |
| `report.title` | `report.description` | ❌ MISMATCH |
| `report.status` | **DOESN'T EXIST** | ❌ MISSING |
| `report.priority` | **DOESN'T EXIST** | ❌ MISSING |
| `report.isArchived` | `report.archived` | ❌ MISMATCH |
| `report.reportedAt` | `report.timestamp` | ❌ MISMATCH |
| `report.location.coordinates.lat/lng` | `report.location.latitude/longitude` | ❌ MISMATCH |
| `report.location.city` | **DOESN'T EXIST** | ❌ MISSING |
| `report.location.barangay` | **DOESN'T EXIST** | ❌ MISSING |
| `report.comments` | **DOESN'T EXIST** | ❌ MISSING |
| `report.verifiedBy` | **DOESN'T EXIST** | ❌ MISSING |
| `report.resolvedBy` | **DOESN'T EXIST** | ❌ MISSING |
| `report.resolutionActions` | **DOESN'T EXIST** | ❌ MISSING |
| `report.views` | **DOESN'T EXIST** | ❌ MISSING |
| `report.archivedAt` | **DOESN'T EXIST** | ❌ MISSING |
| `report.archivedBy` | **DOESN'T EXIST** | ❌ MISSING |

---

## Missing Methods

| Method Called | Exists in Model? | Status |
|--------------|------------------|--------|
| `report.incrementViews()` | ❌ NO | **MISSING** |
| `report.updateStatus()` | ❌ NO | **MISSING** |
| `report.addComment()` | ❌ NO | **MISSING** |
| `Report.findByLocation()` | ❌ NO | **MISSING** |
| `Report.getReportStats()` | ❌ NO | **MISSING** |
| `Report.getReportsByType()` | ❌ NO | **MISSING** |

---

## What Actually Exists in the Model

### Fields:
- ✅ `userId` (ObjectId, ref: User)
- ✅ `reportType` (String: "Accident", "Traffic Jam", "Road Closure", "Hazard")
- ✅ `description` (String, max 500 chars)
- ✅ `address` (String, optional)
- ✅ `geocodedAddress` (String, optional)
- ✅ `verified.verifiedByAdmin` (Number)
- ✅ `verified.verifiedByUser` (Number)
- ✅ `votes[]` (Array of vote objects)
- ✅ `location.latitude` (Number)
- ✅ `location.longitude` (Number)
- ✅ `archived` (Boolean, default: false)
- ✅ `timestamp` (Date, default: Date.now)
- ✅ `geocodingStatus` (String: "pending", "success", "failed")
- ✅ `geocodingError` (String, optional)

### Methods:
- ✅ `report.reverseGeocode()` - Instance method
- ✅ `Report.reverseGeocodeReports()` - Static method

### Virtuals:
- ✅ `report.totalVotes` - Virtual getter
- ✅ `report.displayAddress` - Virtual getter

---

## Recommendations

### Option 1: Update the Report Model (Recommended)
Add the missing fields and methods to match controller expectations:

1. **Add missing fields:**
   - `title` (String)
   - `status` (String: "pending", "verified", "resolved")
   - `priority` (String: "low", "medium", "high", "urgent")
   - `reporter` (ObjectId, ref: User) - alias or replace `userId`
   - `comments[]` (Array)
   - `verifiedBy` (ObjectId, ref: User)
   - `resolvedBy` (ObjectId, ref: User)
   - `resolutionActions[]` (Array of Strings)
   - `views` (Number, default: 0)
   - `isArchived` (Boolean) - or alias `archived`
   - `archivedAt` (Date)
   - `archivedBy` (ObjectId, ref: User)
   - `reportedAt` (Date) - or alias `timestamp`
   - `location.city` (String)
   - `location.barangay` (String)
   - `location.coordinates.lat` (Number) - or alias
   - `location.coordinates.lng` (Number) - or alias

2. **Add missing methods:**
   - `reportSchema.methods.incrementViews()`
   - `reportSchema.methods.updateStatus(status, userId, notes)`
   - `reportSchema.methods.addComment(userId, content)`
   - `reportSchema.statics.findByLocation(lat, lng, radius)`
   - `reportSchema.statics.getReportStats()`
   - `reportSchema.statics.getReportsByType()`

### Option 2: Update the Controller
Modify the controller to match the existing model structure (less recommended as it requires more changes).

---

## Testing Recommendations

Before deploying, test each endpoint:

1. **Test with actual database:**
   ```bash
   # Test each endpoint individually
   curl -X GET http://localhost:5000/api/admin-reports
   curl -X GET http://localhost:5000/api/admin-reports/stats
   # etc.
   ```

2. **Check server logs:**
   - Look for `TypeError` errors
   - Look for `Cannot read property` errors
   - Look for `is not a function` errors

3. **Monitor database queries:**
   - Check if queries are using correct field names
   - Check if populate() calls are working

---

## Conclusion

**Current Status:** ❌ **10 out of 12 endpoints will FAIL**

The admin-reports API endpoints are **NOT ready for production** without fixing the model/controller mismatch.

**Priority Actions:**
1. ⚠️ **URGENT:** Add missing fields and methods to Report model
2. ⚠️ **URGENT:** Test all endpoints after fixes
3. ⚠️ **HIGH:** Update documentation to match actual implementation

---

**Last Updated:** Current Analysis  
**Next Steps:** Fix model or controller to match expectations

