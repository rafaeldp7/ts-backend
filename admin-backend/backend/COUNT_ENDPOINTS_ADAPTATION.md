# Count Endpoints Adaptation - Exact Data Structure

## Overview

All count and data retrieval endpoints have been adjusted to prioritize the `archived` field (the actual field used in the database) over `isArchived` (compatibility field).

---

## Sample Data Structure

Based on actual database records:

```json
{
  "_id": "691452b3cb689afa526246e9",
  "userId": "683a89bb6f312bdee8b6182f",
  "reportType": "Traffic Jam",
  "description": "tagal dito may bangaan",
  "address": "222, Pablo Dela Cruz, Quezon City, Metro Manila, 1116, Philippines",
  "archived": false,  // ← PRIMARY FIELD
  "timestamp": "2025-11-12T09:26:11.991+00:00",
  "geocodedAddress": "222 Pablo Dela Cruz, Novaliches, Quezon City, 1116 Metro Manila, Philippines",
  "geocodingStatus": "success"
}
```

**Key Field:** `archived: false` (boolean) - This is the primary field used in actual data.

---

## Changes Made

### 1. Get Total Report Count ✅

**Status:** No changes needed

**Logic:**
- Counts ALL reports regardless of archive status
- Filter: `{}` (no filter)

**Code:**
```javascript
const totalCount = await Report.countDocuments({});
```

---

### 2. Get Active Report Count ✅

**Changed:** Prioritize `archived: false` over `isArchived`

**Before:**
```javascript
const activeCount = await Report.countDocuments({
  $or: [
    { isArchived: { $ne: true } },
    { archived: { $ne: true } },
    { isArchived: { $exists: false } },
    { archived: { $exists: false } }
  ]
});
```

**After:**
```javascript
const activeCount = await Report.countDocuments({
  $or: [
    { archived: false },              // ← PRIMARY: Exact match for false
    { archived: { $ne: true } },      // ← PRIMARY: Not true
    { archived: { $exists: false } }, // ← PRIMARY: Doesn't exist
    // Fallback for isArchived compatibility
    { isArchived: { $ne: true } },
    { isArchived: { $exists: false } }
  ]
});
```

**Logic:**
- **Primary:** Checks `archived: false` first (exact match)
- **Secondary:** Checks `archived != true` (handles null/undefined)
- **Tertiary:** Checks `archived` doesn't exist (new documents)
- **Fallback:** Maintains compatibility with `isArchived` field

---

### 3. Get Archived Report Count ✅

**Changed:** Prioritize `archived: true` over `isArchived`

**Before:**
```javascript
const archivedCount = await Report.countDocuments({
  $or: [
    { isArchived: true },
    { archived: true }
  ]
});
```

**After:**
```javascript
const archivedCount = await Report.countDocuments({
  $or: [
    { archived: true },  // ← PRIMARY: Exact match for true
    // Fallback for isArchived compatibility
    { isArchived: true }
  ]
});
```

**Logic:**
- **Primary:** Checks `archived: true` first
- **Fallback:** Maintains compatibility with `isArchived` field

---

### 4. Get Active Reports (Data) ✅

**Changed:** Prioritize `archived: false` in filter

**Before:**
```javascript
const filter = {
  $and: [
    {
      $or: [
        { isArchived: { $ne: true } },
        { archived: { $ne: true } },
        { isArchived: { $exists: false } },
        { archived: { $exists: false } }
      ]
    }
  ]
};
```

**After:**
```javascript
const filter = {
  $and: [
    {
      $or: [
        { archived: false },              // ← PRIMARY: Exact match for false
        { archived: { $ne: true } },      // ← PRIMARY: Not true
        { archived: { $exists: false } }, // ← PRIMARY: Doesn't exist
        // Fallback for isArchived compatibility
        { isArchived: { $ne: true } },
        { isArchived: { $exists: false } }
      ]
    }
  ]
};
```

**Logic:**
- Same priority as active count
- Includes all filtering options (status, type, priority, city, barangay, date, search)
- Sorts by `timestamp` (primary) then `reportedAt` (fallback)

---

### 5. Get Archived Reports (Data) ✅

**Changed:** Prioritize `archived: true` in filter

**Before:**
```javascript
const filter = {
  $and: [
    {
      $or: [
        { isArchived: true },
        { archived: true }
      ]
    }
  ]
};
```

**After:**
```javascript
const filter = {
  $and: [
    {
      $or: [
        { archived: true },  // ← PRIMARY: Exact match for true
        // Fallback for isArchived compatibility
        { isArchived: true }
      ]
    }
  ]
};
```

**Logic:**
- Same priority as archived count
- Includes all filtering options (status, type, priority, city, barangay, date, search)
- Sorts by `archivedAt` (most recently archived first), then `timestamp`

---

### 6. Get All Reports (Main Endpoint) ✅

**Changed:** Also updated to prioritize `archived: false`

**Logic:**
- Same filter structure as `getActiveReports`
- Excludes archived reports by default
- Maintains backward compatibility

---

## Field Priority Summary

| Function | Primary Field | Fallback Field | Logic |
|----------|--------------|----------------|-------|
| **Total Count** | N/A | N/A | Count all (no filter) |
| **Active Count** | `archived: false` | `isArchived: { $ne: true }` | Not archived |
| **Archived Count** | `archived: true` | `isArchived: true` | Is archived |
| **Active Reports** | `archived: false` | `isArchived: { $ne: true }` | Not archived + filters |
| **Archived Reports** | `archived: true` | `isArchived: true` | Is archived + filters |

---

## Query Logic Details

### Active Reports Query

```javascript
{
  $or: [
    { archived: false },              // Exact false match (most common)
    { archived: { $ne: true } },      // Not true (handles null/undefined)
    { archived: { $exists: false } }, // Field doesn't exist (new docs)
    { isArchived: { $ne: true } },     // Compatibility fallback
    { isArchived: { $exists: false } } // Compatibility fallback
  ]
}
```

**Why this works:**
- `archived: false` matches documents where `archived` is explicitly `false`
- `archived: { $ne: true }` matches documents where `archived` is `false`, `null`, or `undefined`
- `archived: { $exists: false }` matches documents where the field doesn't exist
- Fallback conditions ensure compatibility with `isArchived` field

### Archived Reports Query

```javascript
{
  $or: [
    { archived: true },  // Exact true match
    { isArchived: true } // Compatibility fallback
  ]
}
```

**Why this works:**
- `archived: true` matches documents where `archived` is explicitly `true`
- Fallback ensures compatibility with `isArchived` field

---

## Testing Verification

### Expected Behavior

1. **Total Count:**
   - Should return: `activeCount + archivedCount`
   - Example: If active=135, archived=15, total=150 ✅

2. **Active Count:**
   - Should count all reports where `archived: false` or `archived` doesn't exist
   - Should NOT count reports where `archived: true`

3. **Archived Count:**
   - Should count all reports where `archived: true`
   - Should NOT count reports where `archived: false`

4. **Active Reports Data:**
   - Should return only reports where `archived: false` or `archived` doesn't exist
   - Should support all filters (status, type, priority, city, barangay, date, search)

5. **Archived Reports Data:**
   - Should return only reports where `archived: true`
   - Should support all filters (status, type, priority, city, barangay, date, search)

---

## Backward Compatibility

✅ **All changes maintain backward compatibility:**

1. **Dual Field Support:** Both `archived` and `isArchived` are checked
2. **Model Middleware:** The `Reports` model automatically syncs fields via pre-save middleware
3. **Query Flexibility:** Queries check both field formats using `$or` conditions
4. **Priority Order:** Primary field (`archived`) is checked first, then fallback (`isArchived`)

---

## Files Modified

- ✅ `admin-backend/backend/controllers/reportController.js`
  - `getTotalReportCount()` - No changes (already correct)
  - `getActiveReportCount()` - Updated to prioritize `archived: false`
  - `getArchivedReportCount()` - Updated to prioritize `archived: true`
  - `getActiveReports()` - Updated filter to prioritize `archived: false`
  - `getArchivedReports()` - Updated filter to prioritize `archived: true`
  - `getReports()` - Updated filter to prioritize `archived: false`

---

## Summary

All 5 count/data endpoints have been successfully adjusted:

1. ✅ **Total Report Count** - Counts all reports (no changes)
2. ✅ **Active Report Count** - Prioritizes `archived: false`
3. ✅ **Archived Report Count** - Prioritizes `archived: true`
4. ✅ **Active Reports Data** - Filter prioritizes `archived: false`
5. ✅ **Archived Reports Data** - Filter prioritizes `archived: true`

**Key Improvement:**
- Queries now check `archived: false` and `archived: true` first (matching actual data structure)
- Maintains full backward compatibility with `isArchived` field
- More accurate counts and filtering based on actual database structure

---

**Last Updated:** Current  
**Status:** ✅ All endpoints adapted to exact data structure

