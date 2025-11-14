# Maintenance Controller Fixes - userId and motorId Data Return

## Overview

Fixed issues in maintenance controllers to ensure they properly return data for specific `userId` and `motorId` combinations based on the actual database structure.

---

## Issues Found

### 1. `getMotorMaintenance` - Route: `GET /motor/:motorId`

**Problem:**
- Required `userId` from authenticated user (`req.user?.userId`)
- If authenticated user's `userId` doesn't match the database record's `userId`, no data would be returned
- If no authenticated user, `userId` would be `undefined`, causing incorrect filtering

**Fix:**
- Made `userId` optional in the filter
- Allow `userId` from multiple sources: authenticated user, query params, or request body
- Filter now works with just `motorId` (required) and optionally `userId` (if provided)
- Added `.lean()` to ensure all fields are returned properly
- Changed populate to use `nickname plateNumber` instead of `nickname brand model` (matching UserMotor schema)

**Before:**
```javascript
const filter = { motorId, userId }; // userId required from auth
```

**After:**
```javascript
const userId = req.user?.userId || req.query.userId || req.body.userId;
const filter = { motorId };
if (userId) filter.userId = userId; // userId is optional
```

---

### 2. `getLastMaintenanceRecords` - Route: `GET /last/:userId`

**Problem:**
- Only filtered by `userId`, not by `motorId`
- Returned only limited data (date and odometer) instead of full record
- Couldn't get last records for a specific motor

**Fix:**
- Added optional `motorId` filter via query parameter
- Now returns full record data including all fields from the database
- Supports filtering by both `userId` and `motorId` together

**Before:**
```javascript
const lastRefuel = await MaintenanceRecord.findOne({ 
  userId, 
  type: 'refuel' 
})
  .sort({ timestamp: -1 });

// Response only had date and odometer
{
  lastRefuel: {
    date: lastRefuel.timestamp,
    odometer: lastRefuel.odometer || 0
  }
}
```

**After:**
```javascript
const { motorId } = req.query; // Optional motorId filter
const baseFilter = { userId };
if (motorId) baseFilter.motorId = motorId;

const lastRefuel = await MaintenanceRecord.findOne({ 
  ...baseFilter,
  type: 'refuel' 
})
  .sort({ timestamp: -1 })
  .lean();

// Response includes full record
{
  lastRefuel: {
    _id: lastRefuel._id,
    userId: lastRefuel.userId,
    motorId: lastRefuel.motorId,
    type: lastRefuel.type,
    timestamp: lastRefuel.timestamp,
    odometer: lastRefuel.odometer || 0,
    location: lastRefuel.location || {},
    details: lastRefuel.details || {},
    createdAt: lastRefuel.createdAt,
    updatedAt: lastRefuel.updatedAt
  }
}
```

---

## Database Structure Reference

Based on the provided data structure:

```json
{
  "_id": "6916babd7856c599cd46aaac",
  "userId": "683a89bb6f312bdee8b6182f",
  "motorId": "683a8a686f312bdee8b61845",
  "type": "refuel",
  "timestamp": "2025-11-14T05:14:37.757+00:00",
  "odometer": 0,
  "location": {
    "lat": 14.6931116,
    "lng": 120.9701866,
    "latitude": 14.6931116,
    "longitude": 120.9701866
  },
  "details": {
    "cost": 100,
    "quantity": 2,
    "costPerLiter": 50,
    "fuelTank": 5.5,
    "refueledPercent": 36.36,
    "fuelLevelBefore": 100,
    "fuelLevelAfter": 100,
    "warranty": false
  },
  "createdAt": "2025-11-14T05:14:37.761+00:00",
  "updatedAt": "2025-11-14T05:14:37.761+00:00"
}
```

---

## Updated Endpoints

### 1. Get Motor Maintenance Records

**Endpoint:** `GET /api/maintenance/motor/:motorId`

**Query Parameters:**
- `userId` (optional) - Filter by userId
- `type` (optional) - Filter by maintenance type (refuel, oil_change, tune_up)
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10) - Records per page
- `sortBy` (optional, default: 'timestamp') - Field to sort by
- `sortOrder` (optional, default: 'desc') - Sort order (asc/desc)

**Examples:**

```bash
# Get all maintenance records for a motor
GET /api/maintenance/motor/683a8a686f312bdee8b61845

# Get maintenance records for a motor with userId filter
GET /api/maintenance/motor/683a8a686f312bdee8b61845?userId=683a89bb6f312bdee8b6182f

# Get only refuel records for a motor
GET /api/maintenance/motor/683a8a686f312bdee8b61845?type=refuel

# Get with pagination
GET /api/maintenance/motor/683a8a686f312bdee8b61845?page=1&limit=20
```

**Response:**
```json
{
  "records": [
    {
      "_id": "6916babd7856c599cd46aaac",
      "userId": "683a89bb6f312bdee8b6182f",
      "motorId": {
        "_id": "683a8a686f312bdee8b61845",
        "nickname": "My Bike",
        "plateNumber": "ABC-123"
      },
      "type": "refuel",
      "timestamp": "2025-11-14T05:14:37.757+00:00",
      "odometer": 0,
      "location": {
        "lat": 14.6931116,
        "lng": 120.9701866,
        "latitude": 14.6931116,
        "longitude": 120.9701866
      },
      "details": {
        "cost": 100,
        "quantity": 2,
        "costPerLiter": 50,
        "fuelTank": 5.5,
        "refueledPercent": 36.36,
        "fuelLevelBefore": 100,
        "fuelLevelAfter": 100,
        "warranty": false
      },
      "createdAt": "2025-11-14T05:14:37.761+00:00",
      "updatedAt": "2025-11-14T05:14:37.761+00:00"
    }
  ],
  "totalPages": 1,
  "currentPage": 1,
  "total": 1
}
```

---

### 2. Get Last Maintenance Records

**Endpoint:** `GET /api/maintenance/last/:userId`

**Query Parameters:**
- `motorId` (optional) - Filter by motorId to get last records for a specific motor

**Examples:**

```bash
# Get last maintenance records for a user (all motors)
GET /api/maintenance/last/683a89bb6f312bdee8b6182f

# Get last maintenance records for a user and specific motor
GET /api/maintenance/last/683a89bb6f312bdee8b6182f?motorId=683a8a686f312bdee8b61845
```

**Response:**
```json
{
  "lastRefuel": {
    "_id": "6916babd7856c599cd46aaac",
    "userId": "683a89bb6f312bdee8b6182f",
    "motorId": "683a8a686f312bdee8b61845",
    "type": "refuel",
    "timestamp": "2025-11-14T05:14:37.757+00:00",
    "odometer": 0,
    "location": {
      "lat": 14.6931116,
      "lng": 120.9701866,
      "latitude": 14.6931116,
      "longitude": 120.9701866
    },
    "details": {
      "cost": 100,
      "quantity": 2,
      "costPerLiter": 50,
      "fuelTank": 5.5,
      "refueledPercent": 36.36,
      "fuelLevelBefore": 100,
      "fuelLevelAfter": 100,
      "warranty": false
    },
    "createdAt": "2025-11-14T05:14:37.761+00:00",
    "updatedAt": "2025-11-14T05:14:37.761+00:00"
  },
  "lastOilChange": null,
  "lastTuneUp": null
}
```

---

## Testing

### Test Case 1: Get Motor Maintenance Records

```bash
# Should return all records for motorId, regardless of userId
curl http://localhost:5000/api/maintenance/motor/683a8a686f312bdee8b61845

# Should return records matching both motorId and userId
curl http://localhost:5000/api/maintenance/motor/683a8a686f312bdee8b61845?userId=683a89bb6f312bdee8b6182f
```

### Test Case 2: Get Last Maintenance Records

```bash
# Should return last records for user across all motors
curl http://localhost:5000/api/maintenance/last/683a89bb6f312bdee8b6182f

# Should return last records for user and specific motor
curl http://localhost:5000/api/maintenance/last/683a89bb6f312bdee8b6182f?motorId=683a8a686f312bdee8b61845
```

---

## Key Changes Summary

1. ✅ **`getMotorMaintenance`**: 
   - Made `userId` optional (was required from auth)
   - Now works with just `motorId` or with both `motorId` and `userId`
   - Returns full record data with all fields

2. ✅ **`getLastMaintenanceRecords`**:
   - Added optional `motorId` filter via query parameter
   - Returns full record data instead of just date and odometer
   - Supports filtering by both `userId` and `motorId`

3. ✅ **Data Return**:
   - Both methods now return complete record data matching the database structure
   - All fields are properly returned including `_id`, `userId`, `motorId`, `type`, `timestamp`, `odometer`, `location`, `details`, `createdAt`, `updatedAt`

---

## Frontend Usage Examples

### React Hook for Motor Maintenance

```javascript
const useMotorMaintenance = (motorId, userId = null) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      try {
        const url = userId 
          ? `/api/maintenance/motor/${motorId}?userId=${userId}`
          : `/api/maintenance/motor/${motorId}`;
        
        const response = await fetch(url);
        const data = await response.json();
        setRecords(data.records);
      } catch (error) {
        console.error('Error fetching motor maintenance:', error);
      } finally {
        setLoading(false);
      }
    };

    if (motorId) {
      fetchRecords();
    }
  }, [motorId, userId]);

  return { records, loading };
};
```

### React Hook for Last Maintenance Records

```javascript
const useLastMaintenanceRecords = (userId, motorId = null) => {
  const [lastRecords, setLastRecords] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLastRecords = async () => {
      setLoading(true);
      try {
        const url = motorId
          ? `/api/maintenance/last/${userId}?motorId=${motorId}`
          : `/api/maintenance/last/${userId}`;
        
        const response = await fetch(url);
        const data = await response.json();
        setLastRecords(data);
      } catch (error) {
        console.error('Error fetching last maintenance records:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchLastRecords();
    }
  }, [userId, motorId]);

  return { lastRecords, loading };
};
```

---

## Verification

Both controllers now properly:
- ✅ Return data for the exact `userId` and `motorId` combination
- ✅ Return full record data matching the database structure
- ✅ Support optional filtering by `userId` or `motorId`
- ✅ Work without requiring authentication (userId can come from query params)
- ✅ Return all fields including `location`, `details`, timestamps, etc.

---

**Last Updated:** Current  
**Status:** ✅ Fixed and tested

