# Report Count Endpoints - Quick Implementation Guide

## ✅ Endpoints Added

### 1. Get Total Report Count
```
GET /api/admin-reports/count/total
```
Returns total count of all reports (active + archived)

### 2. Get Active Report Count
```
GET /api/admin-reports/count/active
```
Returns count of active (non-archived) reports

### 3. Get Archived Report Count
```
GET /api/admin-reports/count/archived
```
Returns count of archived reports

### 4. Get All Active Reports
```
GET /api/admin-reports/active
```
Returns paginated list of active reports with filtering

---

## 📁 Files Modified

1. ✅ `admin-backend/backend/controllers/reportController.js`
   - Added `getTotalReportCount()` function
   - Added `getActiveReportCount()` function
   - Added `getArchivedReportCount()` function
   - Added `getActiveReports()` function

2. ✅ `admin-backend/backend/routes/reports.js`
   - Added routes for all 4 endpoints
   - Applied `authenticateAdmin` middleware

---

## 🔧 Implementation Details

### Controller Functions

**Location:** `admin-backend/backend/controllers/reportController.js`

1. **getTotalReportCount** (lines 684-696)
   - Uses `Report.countDocuments({})` to count all reports
   - Returns `{ totalCount: number }`

2. **getActiveReportCount** (lines 698-717)
   - Filters for non-archived reports using `$or` conditions
   - Handles both `isArchived` and `archived` fields
   - Returns `{ activeCount: number }`

3. **getArchivedReportCount** (lines 719-736)
   - Filters for archived reports using `$or` conditions
   - Handles both `isArchived` and `archived` fields
   - Returns `{ archivedCount: number }`

4. **getActiveReports** (lines 738-832)
   - Similar to `getReports()` but explicitly excludes archived
   - Supports all filtering options (status, type, priority, city, barangay, date range, search)
   - Supports pagination
   - Returns `{ reports: [], pagination: {} }`

### Routes

**Location:** `admin-backend/backend/routes/reports.js`

```javascript
// Count routes (admin only)
router.get('/count/total', authenticateAdmin, getTotalReportCount);
router.get('/count/active', authenticateAdmin, getActiveReportCount);
router.get('/count/archived', authenticateAdmin, getArchivedReportCount);

// Active reports route (not archived) - admin only
router.get('/active', authenticateAdmin, getActiveReports);
```

**Route Order:** These routes are placed before `/:id` route to ensure proper matching.

---

## 📝 Quick Usage Examples

### JavaScript/Fetch

```javascript
// Get total count
const totalCount = await fetch('/api/admin-reports/count/total', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());

// Get active count
const activeCount = await fetch('/api/admin-reports/count/active', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());

// Get archived count
const archivedCount = await fetch('/api/admin-reports/count/archived', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());

// Get active reports
const activeReports = await fetch('/api/admin-reports/active?page=1&limit=10', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());
```

### React Hook Example

```javascript
const useReportCounts = (token) => {
  const [counts, setCounts] = useState({ total: 0, active: 0, archived: 0 });

  useEffect(() => {
    const fetchCounts = async () => {
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

      setCounts({
        total: total.data.totalCount,
        active: active.data.activeCount,
        archived: archived.data.archivedCount
      });
    };

    fetchCounts();
  }, [token]);

  return counts;
};
```

---

## ✅ Testing

All endpoints are ready to use. Test with:

```bash
# Get total count
curl -X GET "http://localhost:5000/api/admin-reports/count/total" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Get active count
curl -X GET "http://localhost:5000/api/admin-reports/count/active" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Get archived count
curl -X GET "http://localhost:5000/api/admin-reports/count/archived" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Get active reports
curl -X GET "http://localhost:5000/api/admin-reports/active?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## 📚 Full Documentation

See `REPORT_COUNT_API_DOCUMENTATION.md` for complete documentation including:
- Detailed endpoint descriptions
- Request/response schemas
- Frontend integration examples (React, RTK Query, etc.)
- Error handling
- Best practices

---

**Status:** ✅ **ALL ENDPOINTS IMPLEMENTED AND READY**

