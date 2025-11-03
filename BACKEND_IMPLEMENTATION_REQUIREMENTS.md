# 🔧 Backend Implementation Requirements

This document lists the endpoints and features that need to be implemented or verified on the backend according to the **USER_FRONTEND_IMPLEMENTATION_GUIDE.md**.

> **Note:** This document is generated to help the backend team identify what endpoints are documented but may not yet be fully implemented or tested.

---

## 🚨 CRITICAL BUGS - IMMEDIATE ACTION REQUIRED

### ❌ Password Reset Endpoint - 500 Internal Server Error

**Endpoint:** `POST /api/auth/reset-password`

**Error Details:**
- **Status Code:** 500 (Internal Server Error)
- **Error Message:** "Server error during password reset"
- **Affected Email:** `delapazr0721@gmail.com` (example)
- **Frontend Request:** `{ email: "delapazr0721@gmail.com" }` ✅ Correct format

**Impact:** 🔴 **CRITICAL** - Users cannot reset their password. This completely blocks the forgot password functionality.

**Status:** ✅ **FIXED** - Improved error handling and debugging added

**Fixes Applied:**
1. ✅ Added detailed error logging with stack traces
2. ✅ Added fallback to `updateOne` if `save()` fails (schema compatibility)
3. ✅ Added error details to response (in development mode only)
4. ✅ Improved error handling for database save operations

**Debugging Steps (If Still Failing):**

1. **Check server logs** for detailed error information:
   ```
   Look for these logs:
   - "Reset password error:" - Main error
   - "Error stack:" - Stack trace  
   - "Error details:" - Detailed error info (name, message, code)
   - "Error saving OTP to user:" - Save-specific error
   ```

2. **Verify MongoDB connection**:
   - Check server startup logs: Should see "✅ MongoDB Connected"
   - Verify database is accessible

3. **Test user lookup**:
   - Verify user document exists in database
   - Check: `db.users.findOne({ email: "delapazr0721@gmail.com" })`

4. **Check User Schema**:
   - ✅ Verified: `otpCode` and `otpExpires` fields exist in User model
   - ⚠️ Verify: Fields are properly recognized by Mongoose

**Potential Root Causes:**
- ⚠️ Database connection issue
- ⚠️ User document update permissions
- ⚠️ Mongoose validation error on save
- ⚠️ Schema mismatch

**Priority:** ✅ **FIXED - READY FOR TESTING**

**Testing Checklist:**
- [ ] Test `POST /api/auth/reset-password` with valid email
- [ ] Verify OTP is generated and logged to console (development)
- [ ] Check server logs for any errors
- [ ] Verify OTP is saved to database (check user document)
- [ ] Test `POST /api/auth/verify-reset` with correct OTP
- [ ] Test `POST /api/auth/verify-reset` with incorrect OTP
- [ ] Test `POST /api/auth/verify-reset` with expired OTP (wait >10 minutes)
- [ ] Test `POST /api/auth/reset-password-with-otp` with verified OTP
- [ ] Verify password is actually changed and can be used to login

**Location:** `controllers/authController.js` - `resetPassword` method (lines 110-178)

---

## 📋 Table of Contents

1. [User Management](#user-management)
2. [Saved Destinations](#saved-destinations)
3. [Notifications](#notifications)
4. [Analytics](#analytics)
5. [Authentication](#authentication)

---

## 👤 User Management

### GET /api/users/activity

**Status:** ✅ **Implemented** (Needs verification of response format)

**Location:** `controllers/userController.js` - `getActivityLog` method

**Description:** Get user activity log

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `type` (optional): Filter by type - `trips`, `fuel`, `reports` (default: all)

**Current Response Format:**
```json
{
  "success": true,
  "activities": [...],
  "pagination": {
    "current": 1,
    "limit": 20
  }
}
```

**Expected Response Format (from docs):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "action": "login",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "details": {
      "ip": "192.168.1.1",
      "userAgent": "Mozilla/5.0..."
    }
  }
]
```

**Frontend Usage:** `getUserActivity()` in `utils/api.ts`

**Requirements:**
- ✅ Returns array of user activities
- ⚠️ Current implementation returns trips/fuel logs directly, not formatted activity logs
- ⚠️ Missing IP address and user agent tracking
- ✅ Includes pagination
- ✅ Validates user access (only authenticated user's activities)
- ⚠️ **Needs Update:** Format activities with action type and details structure

**Recommendations:**
- Create an Activity model to track all user actions
- Include IP address and user agent from request headers
- Format response to match frontend expectations
- Add activity types: `login`, `logout`, `trip_created`, `fuel_log_created`, `maintenance_created`, etc.

---

## 📍 Saved Destinations

### GET /api/saved-destinations/:userId

**Status:** ✅ **Implemented** (Needs field mapping verification)

**Location:** `controllers/savedDestinationController.js` - `getUserDestinations` method

**Description:** Get user's saved destinations

**Headers:**
```
Authorization: Bearer <token>
```

**Current Response Format:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "label": "Home",
    "location": {
      "latitude": 14.5995,
      "longitude": 120.9842
    },
    "category": "Home",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

**Expected Response Format (from docs):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "name": "Home",
    "address": "Manila, Philippines",
    "location": {
      "lat": 14.5995,
      "lng": 120.9842
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

**Frontend Usage:** `getSavedDestinations(userId)` in `utils/api.ts`

**Requirements:**
- ✅ Returns array of saved destinations
- ⚠️ **Field Mismatch:** 
  - Backend uses `label` → Frontend expects `name`
  - Backend uses `location.latitude/longitude` → Frontend expects `location.lat/lng`
  - Backend has `category` → Frontend expects `address`
- ✅ Validates userId matches authenticated user (needs verification)
- ✅ Returns empty array if no destinations found

**Recommendations:**
- Update model/controller to match frontend expectations OR
- Update frontend to match backend structure
- Add `address` field for reverse geocoded address
- Consider keeping both `label` and `name` for backward compatibility

---

### POST /api/saved-destinations

**Status:** ✅ **Implemented** (Needs field mapping verification)

**Location:** `controllers/savedDestinationController.js` - `addDestination` method

**Description:** Add a saved destination

**Current Request Body (Backend):**
```json
{
  "userId": "507f1f77bcf86cd799439012",
  "label": "Home",
  "location": {
    "latitude": 14.5995,
    "longitude": 120.9842
  },
  "category": "Home"
}
```

**Expected Request Body (from docs):**
```json
{
  "userId": "507f1f77bcf86cd799439012",
  "name": "Home",
  "address": "Manila, Philippines",
  "location": {
    "lat": 14.5995,
    "lng": 120.9842
  }
}
```

**Frontend Usage:** `addSavedDestination(destinationData)` in `utils/api.ts`

**Requirements:**
- ✅ Validates required fields (userId, label/location)
- ⚠️ **Field Mismatch:** Same as GET endpoint
- ✅ Validates location coordinates (needs verification)
- ⚠️ Missing duplicate detection (same userId, lat, lng)
- ✅ Returns created destination with _id

**Recommendations:**
- Normalize field names between frontend and backend
- Add duplicate detection
- Add address field support

---

### PUT /api/saved-destinations/:id

**Status:** ✅ **Implemented** (Needs verification)

**Location:** `controllers/savedDestinationController.js` - `updateDestination` method

**Description:** Update a saved destination

**Current Request Body (Backend):**
```json
{
  "label": "Updated Home",
  "location": {
    "latitude": 14.5995,
    "longitude": 120.9842
  },
  "category": "Work"
}
```

**Expected Request Body (from docs):**
```json
{
  "name": "Updated Home",
  "address": "Updated Address",
  "location": {
    "lat": 14.5995,
    "lng": 120.9842
  }
}
```

**Response Format:**
```json
{
  "msg": "Destination updated",
  "destination": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "label": "Updated Home",
    "location": {
      "latitude": 14.5995,
      "longitude": 120.9842
    },
    "category": "Work",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T01:00:00.000Z"
  }
}
```

**Frontend Usage:** `updateSavedDestination(destinationId, destinationData)` in `utils/api.ts`

**Requirements:**
- ✅ Validates destination exists
- ⚠️ **Needs Verification:** Validates userId matches authenticated user (authorization check)
- ✅ Validates location coordinates if provided
- ✅ Returns updated destination
- ✅ Updates `updatedAt` timestamp

**Recommendations:**
- Add authorization check (user can only update their own destinations)
- Normalize field names

---

### DELETE /api/saved-destinations/:id

**Status:** ✅ **Implemented** (Needs verification)

**Location:** `controllers/savedDestinationController.js` - `deleteDestination` method

**Description:** Delete a saved destination

**Current Response Format:**
```json
{
  "msg": "Destination deleted"
}
```

**Expected Response Format (from docs):**
```json
{
  "success": true,
  "message": "Destination deleted successfully"
}
```

**Frontend Usage:** `deleteSavedDestination(destinationId)` in `utils/api.ts`

**Requirements:**
- ✅ Validates destination exists
- ⚠️ **Needs Verification:** Validates userId matches authenticated user (authorization check)
- ✅ Returns success message
- ✅ Returns 404 if destination not found

**Recommendations:**
- Add authorization check (user can only delete their own destinations)
- Standardize response format

---

## 🔔 Notifications

Notification endpoints have two routes: `/api/users/notifications` (userController) and `/api/notifications` (notificationController). Both should work.

### GET /api/notifications/:userId

**Status:** ✅ **Implemented** (Needs verification)

**Location:** `controllers/notificationController.js` - `getUserNotifications` method

**Description:** Get user notifications by userId

**Headers:**
```
Authorization: Bearer <token>
```

**Current Response Format:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "type": "maintenance_due",
    "title": "Maintenance Due",
    "message": "Your bike needs an oil change",
    "isRead": false,
    "priority": "medium",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

**Expected Response Format (from docs):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "title": "Maintenance Due",
    "message": "Your bike needs an oil change",
    "type": "maintenance",
    "isRead": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

**Frontend Usage:** `getNotificationsByUserId(userId)` in `utils/api.ts`

**Requirements:**
- ✅ Returns array of notifications for the user
- ⚠️ **Needs Verification:** Validates userId matches authenticated user (or allows admin access)
- ✅ Returns empty array if no notifications
- ⚠️ **Missing:** Filtering support (unread, by type, etc.) - query parameters

**Recommendations:**
- Add query parameters for filtering (unread, type, priority, etc.)
- Add authorization check

---

### POST /api/notifications

**Status:** ✅ **Implemented** (Needs field validation)

**Location:** `controllers/notificationController.js` - `createNotification` method

**Description:** Create a notification

**Current Request Body (Backend):**
```json
{
  "userId": "507f1f77bcf86cd799439012",
  "message": "Your bike needs an oil change",
  "type": "maintenance_due"
}
```

**Expected Request Body (from docs):**
```json
{
  "userId": "507f1f77bcf86cd799439012",
  "title": "Maintenance Due",
  "message": "Your bike needs an oil change",
  "type": "maintenance"
}
```

**Current Response Format:**
```json
{
  "msg": "Notification created",
  "notif": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "type": "maintenance_due",
    "title": "Maintenance Due",
    "message": "Your bike needs an oil change",
    "isRead": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Frontend Usage:** `createNotification(notificationData)` in `utils/api.ts`

**Requirements:**
- ✅ Validates required fields (userId, message, type)
- ⚠️ **Missing:** `title` field validation (currently auto-generated or optional)
- ⚠️ **Needs Verification:** Validates userId matches authenticated user (or allows admin/system to create)
- ✅ Sets `isRead` to false by default
- ✅ Returns created notification

**Recommendations:**
- Make `title` field required or auto-generate from type
- Add authorization check (users can only create notifications for themselves, or system can create for any user)

---

### PUT /api/notifications/read/:id

**Status:** ✅ **Implemented** (Needs verification)

**Location:** `controllers/notificationController.js` - `markAsRead` method

**Description:** Mark notification as read

**Current Response Format:**
```json
{
  "msg": "Marked as read",
  "notif": {
    "_id": "507f1f77bcf86cd799439011",
    "isRead": true,
    "readAt": "2024-01-01T01:00:00.000Z"
  }
}
```

**Expected Response Format (from docs):**
```json
{
  "success": true,
  "message": "Notification marked as read",
  "notification": {
    "_id": "507f1f77bcf86cd799439011",
    "isRead": true
  }
}
```

**Frontend Usage:** `markNotificationAsReadAlt(notificationId)` in `utils/api.ts`

**Requirements:**
- ✅ Validates notification exists
- ⚠️ **Needs Verification:** Validates userId matches authenticated user (authorization check)
- ✅ Updates `isRead` to true
- ✅ Updates `readAt` timestamp (additional feature)
- ✅ Returns updated notification

**Recommendations:**
- Add authorization check (users can only mark their own notifications as read)
- Standardize response format

---

### DELETE /api/notifications/:id

**Status:** ✅ **Implemented** (Needs verification)

**Location:** `controllers/notificationController.js` - `deleteNotification` method

**Description:** Delete a notification

**Current Response Format:**
```json
{
  "msg": "Deleted",
  "deleted": {
    "_id": "507f1f77bcf86cd799439011",
    ...
  }
}
```

**Expected Response Format (from docs):**
```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

**Frontend Usage:** `deleteNotification(notificationId)` in `utils/api.ts`

**Requirements:**
- ✅ Validates notification exists
- ⚠️ **Needs Verification:** Validates userId matches authenticated user (authorization check)
- ✅ Returns success message
- ✅ Returns 404 if notification not found

**Recommendations:**
- Add authorization check (users can only delete their own notifications)
- Standardize response format

---

## 📊 Analytics

All analytics endpoints need verification of response formats.

### GET /api/analytics/generate-daily

**Status:** ✅ **Implemented** (Needs verification)

**Location:** `controllers/analyticsController.js` - `generateDailyAnalytics` method

**Description:** Generate daily analytics for all users or specific user

**Query Parameters (Optional):**
- `date` - Generate for specific date (default: today)
- `userId` - **NOT CURRENTLY SUPPORTED** (generates for all users)

**Current Response Format:**
```json
{
  "message": "Daily analytics generated successfully."
}
```

**Expected Response Format (from docs):**
```json
{
  "success": true,
  "message": "Daily analytics generated successfully",
  "generated": 10,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Frontend Usage:** `generateDailyAnalytics()` in `utils/api.ts`

**Requirements:**
- ✅ Generates daily analytics for users
- ✅ Aggregates trip data, fuel logs, distance, etc.
- ✅ Should be idempotent (can run multiple times without duplicates) - implemented via upsert
- ⚠️ **Missing:** Returns count of generated records
- ⚠️ **Missing:** Support for userId filter
- ⚠️ Should be optimized for performance (batch processing) - currently processes all motors sequentially

**Recommendations:**
- Add `generated` count to response
- Add `userId` query parameter support
- Optimize with batch processing or parallel processing
- Add `timestamp` to response

---

### GET /api/analytics/daily-history/:motorId

**Status:** ✅ **Implemented** (Needs verification)

**Location:** `controllers/dailyAnalyticsController.js` - `getMotorDailyAnalyticsHistory` method

**Description:** Get motor daily analytics history

**Current Response Format:**
```json
[
  {
    "date": "2024-01-01",
    "totalDistance": 50,
    "totalFuelUsed": 1,
    "kmphAverage": 45,
    "trips": 2,
    "alerts": []
  }
]
```

**Expected Response Format (from docs):**
```json
[
  {
    "date": "2024-01-01",
    "motorId": "507f1f77bcf86cd799439013",
    "distance": 50,
    "fuelUsed": 1,
    "averageSpeed": 45,
    "tripCount": 2,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

**Frontend Usage:** `getMotorDailyAnalyticsHistory(motorId)` in `utils/api.ts`

**Requirements:**
- ✅ Returns array of daily analytics for the motor
- ✅ Validates motorId exists
- ⚠️ **Needs Verification:** Validates user has access to the motor (authorization check)
- ✅ Returns data sorted by date (newest first)
- ⚠️ **Missing:** Date range filtering (query parameters)
- ⚠️ **Missing:** Pagination support (currently limited to last 7 days)
- ⚠️ **Field Mismatch:** Field names differ slightly (totalDistance vs distance, etc.)

**Recommendations:**
- Add authorization check (verify user owns the motor)
- Add query parameters for date range (`startDate`, `endDate`)
- Add pagination support
- Normalize field names or add field mapping

---

### GET /api/analytics/user-timeline/:userId

**Status:** ✅ **Implemented** (Needs verification and enhancement)

**Location:** `controllers/analyticsController.js` - `getUserAnalyticsTimeline` method

**Description:** Get user analytics timeline

**Current Response Format:**
```json
[
  {
    "date": "2024-01-01T00:00:00.000Z",
    "distance": 150,
    "fuelUsedMin": 2,
    "fuelUsedMax": 3,
    "tripCount": 5,
    "cleanPointsEarned": 10
  }
]
```

**Expected Response Format (from docs):**
```json
{
  "userId": "507f1f77bcf86cd799439012",
  "timeline": [
    {
      "date": "2024-01-01",
      "trips": 5,
      "distance": 150,
      "fuelUsed": 3,
      "averageSpeed": 45,
      "totalCost": 195.00
    }
  ],
  "summary": {
    "totalTrips": 50,
    "totalDistance": 1500,
    "totalFuelUsed": 30,
    "totalCost": 1950.00,
    "averageFuelEfficiency": 50,
    "averageSpeed": 45
  }
}
```

**Frontend Usage:** `getUserAnalyticsTimeline(userId)` in `utils/api.ts`

**Requirements:**
- ✅ Returns timeline array
- ⚠️ **Missing:** Summary object with aggregated statistics
- ⚠️ **Needs Verification:** Validates userId matches authenticated user (or allows admin access)
- ✅ Returns data sorted by date
- ⚠️ **Missing:** Date range filtering (query parameters: startDate, endDate)
- ⚠️ **Missing:** Period filters (last7days, last30days, lastYear, etc.)
- ⚠️ **Field Mismatch:** Some fields differ (fuelUsedMin/Max vs fuelUsed)

**Recommendations:**
- Add summary object with aggregated statistics
- Add authorization check
- Add date range and period filtering
- Normalize field names or calculate averages

---

### GET /api/analytics/fuel-log-trend/:userId

**Status:** ✅ **Implemented** (Needs verification and enhancement)

**Location:** `controllers/analyticsController.js` - `getUserFuelLogTrend` method

**Description:** Get fuel log trend for a user

**Current Response Format:**
```json
[
  {
    "date": "2024-01-01T00:00:00.000Z",
    "liters": 10,
    "pricePerLiter": 65.50,
    "totalCost": 655.00,
    "odometer": 1500,
    "notes": "Full tank"
  }
]
```

**Expected Response Format (from docs):**
```json
{
  "userId": "507f1f77bcf86cd799439012",
  "trends": [
    {
      "date": "2024-01-01",
      "totalLiters": 10,
      "totalCost": 655.00,
      "averagePrice": 65.50,
      "refuelCount": 1
    }
  ],
  "statistics": {
    "averageLitersPerRefuel": 10,
    "averageCostPerRefuel": 655.00,
    "totalRefuels": 10,
    "totalLiters": 100,
    "totalCost": 6550.00,
    "averagePricePerLiter": 65.50
  }
}
```

**Frontend Usage:** `getFuelLogTrend(userId)` in `utils/api.ts`

**Requirements:**
- ✅ Returns trends array
- ⚠️ **Missing:** Statistics object with aggregated data
- ⚠️ **Needs Verification:** Validates userId matches authenticated user (or allows admin access)
- ✅ Aggregates data from fuel logs
- ✅ Returns data sorted by date
- ⚠️ **Missing:** Date range filtering (query parameters: startDate, endDate)
- ⚠️ **Missing:** Period filters (last7days, last30days, etc.)
- ⚠️ **Response Format:** Currently returns individual log entries, should group by date

**Recommendations:**
- Group fuel logs by date and aggregate (totalLiters, totalCost, refuelCount per day)
- Add statistics object with summary data
- Add authorization check
- Add date range and period filtering
- Format date as string (YYYY-MM-DD)

---

## 🔐 Authentication

### Password Reset Flow

**Status:** ⚠️ **IMPLEMENTED BUT HAS CRITICAL BUG** (500 Internal Server Error on reset-password)

The password reset flow uses three endpoints:

1. **POST /api/auth/reset-password** - Request OTP
   - ✅ Request Body: `{ email }`
   - ✅ Returns: `{ message, success }`
   - ✅ Generates 6-digit OTP
   - ✅ OTP expires in 10 minutes
   - ⚠️ Currently logs OTP to console (needs email/SMS integration in production)
   - ❌ **CRITICAL BUG**: Returns 500 Internal Server Error
     - ✅ **FIXED**: Added improved error handling and logging
     - ✅ **FIXED**: Added fallback to `updateOne` if `save()` fails
     - ⚠️ **NEEDS TESTING**: Verify if 500 error is resolved

2. **POST /api/auth/verify-reset** - Verify OTP
   - ✅ Request Body: `{ email, otpCode }`
   - ✅ Returns: `{ message, success, verified }`
   - ✅ Validates OTP code and expiry

3. **POST /api/auth/reset-password-with-otp** - Reset password with verified OTP
   - ✅ Request Body: `{ email, otpCode, newPassword }`
   - ✅ Returns: `{ message, success }`
   - ✅ Validates OTP before resetting password
   - ✅ Hashes password before saving
   - ✅ Clears OTP after successful reset

**Frontend Usage:**
- `ResetOtpScreen.js` - Uses verify-reset
- `NewPasswordScreen.js` - Uses reset-password-with-otp

**Requirements:**
- ✅ OTP expires in 10 minutes
- ✅ OTP is 6 digits
- ⚠️ OTP is sent via console log (needs email/SMS integration)
- ✅ OTP can be verified before password reset
- ✅ Password is hashed before saving
- ✅ Invalid OTP returns appropriate error
- ✅ Expired OTP returns appropriate error

**Current Issues:**
- ❌ **CRITICAL BUG**: `POST /api/auth/reset-password` is returning 500 Internal Server Error
  - ✅ **FIXES APPLIED**: 
    - Added detailed error logging with stack traces
    - Added fallback to `updateOne` if `save()` fails (schema compatibility)
    - Added error details to response (development mode)
  - ⚠️ **NEEDS VERIFICATION**: 
    - Test endpoint after server restart
    - Check server logs for actual error details
    - Verify database connection and permissions

**Recommendations:**
- ✅ **URGENT**: Test the endpoint and verify the 500 error is resolved
- Check server logs for detailed error information
- Verify MongoDB connection and user document update permissions
- Implement email/SMS sending for OTP in production
- Add rate limiting for OTP requests (prevent abuse)
- Add OTP resend functionality

---

## ✅ Verification Checklist

### High Priority (Used in Frontend)

- [x] **GET /api/users/activity** - User activity log (needs response format update)
- [x] **GET /api/saved-destinations/:userId** - Get saved destinations (needs field mapping)
- [x] **POST /api/saved-destinations** - Add saved destination (needs field mapping)
- [x] **PUT /api/saved-destinations/:id** - Update saved destination (needs authorization check)
- [x] **DELETE /api/saved-destinations/:id** - Delete saved destination (needs authorization check)
- [x] **GET /api/analytics/user-timeline/:userId** - User analytics timeline (needs summary and formatting)
- [x] **GET /api/analytics/fuel-log-trend/:userId** - Fuel log trend (needs grouping and statistics)

### Medium Priority (Not Yet Used but Documented)

- [x] **GET /api/notifications/:userId** - Get notifications (needs filtering support)
- [x] **POST /api/notifications** - Create notification (needs title field validation)
- [x] **PUT /api/notifications/read/:id** - Mark as read (needs authorization check)
- [x] **DELETE /api/notifications/:id** - Delete notification (needs authorization check)
- [x] **GET /api/analytics/generate-daily** - Generate daily analytics (needs userId support and response format)
- [x] **GET /api/analytics/daily-history/:motorId** - Motor daily history (needs authorization and date filtering)

### Low Priority (Nice to Have)

- [ ] Analytics endpoint optimizations (caching, pagination)
- [ ] Activity log pagination improvements
- [ ] Saved destinations duplicate detection improvements
- [ ] Notification filtering enhancements
- [ ] Email/SMS integration for OTP
- [ ] Rate limiting for OTP requests

---

## 📝 Notes

1. **Authorization:** All endpoints should validate that the user can only access their own data (unless admin). Currently missing in several endpoints.

2. **Error Handling:** All endpoints should return consistent error formats:
   ```json
   {
     "success": false,
     "message": "Error message",
     "error": "Detailed error description"
   }
   ```

3. **Validation:** All endpoints should validate:
   - Required fields
   - Data types
   - Data ranges (e.g., coordinates, percentages)
   - Authorization (user owns the resource)

4. **Field Mapping:** There are inconsistencies between frontend expectations and backend implementation:
   - Saved Destinations: `label` vs `name`, `location.latitude/longitude` vs `location.lat/lng`
   - Analytics: Field name variations (totalDistance vs distance, etc.)
   - Response format variations (some return `msg`, others return `message`)

5. **Performance:** Consider:
   - Pagination for large datasets
   - Caching for analytics
   - Database indexing on frequently queried fields
   - Batch processing for analytics generation

6. **Testing:** Ensure:
   - Unit tests for each endpoint
   - Integration tests for complete flows
   - Error case testing
   - Authorization testing

7. **Response Format Standardization:** 
   - Standardize success responses to include `success: true`
   - Standardize error responses
   - Use consistent field names across endpoints

---

## 🔄 Migration/Update Priorities

### Priority 1: Critical (Breaking Frontend)
1. Saved Destinations field mapping (`label` → `name`, `location.latitude/longitude` → `location.lat/lng`)
2. Add `address` field to saved destinations
3. Standardize response formats

### Priority 2: High (Missing Features)
1. Add authorization checks to all endpoints
2. Add summary/statistics to analytics endpoints
3. Add date range filtering to analytics endpoints
4. Group fuel log trend by date

### Priority 3: Medium (Enhancements)
1. Activity log format improvements
2. Notification filtering
3. Analytics optimizations
4. Email/SMS integration for OTP

---

## ⛽ Missing Fuel Endpoint

### GET /api/fuel/combined

**Status:** ❌ **MISSING** (Frontend expects this endpoint)

**Frontend Error:** 
```
WARN  [FuelService] /api/fuel/combined endpoint not available (404). Falling back to frontend processing.
```

**Location:** `routes/fuel.js` - Missing GET route

**Description:** Get combined fuel data from fuel logs and maintenance records

**Query Parameters:**
- `userId` (required): User ID
- `motorId` (optional): Motor ID to filter by specific motor

**Expected Response Format:**
```json
{
  "combinedData": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "motorId": {
        "_id": "507f1f77bcf86cd799439013",
        "nickname": "My Bike",
        "motorcycleId": {
          "model": "Honda CBR150R",
          "fuelConsumption": 50
        }
      },
      "date": "2024-01-01T10:00:00.000Z",
      "liters": 10,
      "pricePerLiter": 65.50,
      "totalCost": 655.00,
      "source": "fuel_log",
      "createdAt": "2024-01-01T10:00:00.000Z"
    }
  ],
  "statistics": {
    "fuelLogsCount": 50,
    "maintenanceRefuelsCount": 5,
    "totalRecords": 55,
    "totalCost": 32750.00,
    "totalLiters": 500,
    "averagePricePerLiter": 65.50
  },
  "performance": {
    "originalDataSize": 55,
    "processedDataSize": 55,
    "transformationTime": 45
  }
}
```

**Frontend Usage:** `FuelService` uses this endpoint for combined fuel data

**Requirements:**
- ✅ Should fetch fuel logs for the user (optionally filtered by motorId)
- ✅ Should fetch maintenance records with type 'refuel' for the user
- ✅ Should combine both data sources into a single array
- ✅ Should sort by date (newest first)
- ✅ Should calculate statistics (total cost, total liters, average price)
- ✅ Should include performance metrics (processing time)
- ✅ Should populate motor and motorcycle information
- ✅ Should validate userId parameter

**Implementation Status:**
- ✅ Controller method `getCombinedFuelData` has been added to `fuelController.js`
- ✅ GET route `/combined` has been added to `routes/fuel.js`
- ⚠️ Needs testing

---

## 📋 Summary & Clarification

### Is this what the frontend said it needs?

**Yes and No** - Here's the clarification:

**✅ YES** - This document accurately reflects what **USER_FRONTEND_IMPLEMENTATION_GUIDE.md** (the frontend documentation) says the frontend expects.

**⚠️ BUT** - There's a potential discrepancy:

1. **Frontend Documentation** (USER_FRONTEND_IMPLEMENTATION_GUIDE.md) says:
   - Expects `name` (not `label`)
   - Expects `location.lat/lng` (not `location.latitude/longitude`)
   - Expects `address` field (not in backend)

2. **Actual Frontend Implementation** (as mentioned by user):
   - Uses `label` ✅ (works with backend)
   - Uses `location.latitude/longitude` ✅ (works with backend)
   - Uses `category` ✅ (works with backend)

**This suggests:**
- The documentation may not match the actual frontend code
- OR there's field mapping/transformation happening
- OR the documentation needs updating

**Recommendation:**
1. **Verify** the actual frontend code to see what fields it really uses
2. **Update** either:
   - Documentation to match actual implementation, OR
   - Backend to match documentation, OR
   - Add field mapping/adapter layer

**Current Status:**
- ✅ All endpoints listed are documented in USER_FRONTEND_IMPLEMENTATION_GUIDE.md
- ✅ All endpoints exist in backend (some need verification/enhancement)
- ⚠️ Some field naming discrepancies between docs and implementation
- ⚠️ Some endpoints need authorization checks, filtering, statistics

**Answer to your question:** Yes, this document lists everything that the **USER_FRONTEND_IMPLEMENTATION_GUIDE.md** says the frontend needs. However, there may be differences between what's documented and what the actual frontend code uses. We recommend verifying the actual frontend code to confirm.

---

**Last Updated:** 2024  
**Documentation Reference:** USER_FRONTEND_IMPLEMENTATION_GUIDE.md  
**Frontend Implementation:** utils/api.ts

