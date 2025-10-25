# 🚀 Complete Admin-Backend Documentation

## 📋 Overview

This is the comprehensive documentation for the entire admin-backend system, including all routes, controllers, models, middleware, and API endpoints.

## 🗂️ System Architecture

### **File Structure:**
```
admin-backend/
├── backend/
│   ├── controllers/
│   │   ├── adminAuthController.js
│   │   ├── adminManagementController.js
│   │   ├── dashboardController.js
│   │   ├── gasStationController.js
│   │   ├── motorController.js
│   │   ├── motorStatsController.js
│   │   ├── reportController.js
│   │   ├── setupController.js
│   │   ├── tripController.js
│   │   ├── userController.js
│   │   └── userStatsController.js
│   ├── middleware/
│   │   └── adminAuth.js
│   └── routes/
│       ├── admin.js
│       ├── adminAuth.js
│       ├── adminManagement.js
│       ├── adminSettings.js
│       ├── auth.js
│       ├── dashboard.js
│       ├── gasStations.js
│       ├── motors.js
│       ├── motorStats.js
│       ├── reports.js
│       ├── setup.js
│       ├── trips.js
│       ├── users.js
│       └── userStats.js
```

---

## 🔐 Authentication System

### **Admin Authentication:**
- **JWT-based authentication** with Bearer tokens
- **Role-based access control** (Super Admin, Admin, Moderator)
- **Token expiration**: 7 days
- **Password hashing**: bcrypt with salt rounds

### **Admin Roles:**
1. **Super Admin** (Level 100) - Full system access
2. **Admin** (Level 50) - Standard administrative access
3. **Moderator** (Level 25) - Content moderation access

---

## 🚀 API Endpoints

### **Base URL:** `/api/`

All admin routes require authentication except setup routes.

---

## **1. Authentication Routes**

### **Admin Login**
```bash
POST /api/admin-auth/admin-login
```
**Body:**
```json
{
  "email": "admin@trafficslight.com",
  "password": "admin123"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "admin": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "firstName": "Super",
      "lastName": "Admin",
      "email": "admin@trafficslight.com",
      "role": "super_admin",
      "roleInfo": {
        "level": 100,
        "displayName": "Super Admin",
        "permissions": { ... }
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### **Admin Logout**
```bash
POST /api/admin-auth/admin-logout
```
**Headers:** `Authorization: Bearer <token>`

### **Get Admin Profile**
```bash
GET /api/admin-auth/profile
```
**Headers:** `Authorization: Bearer <token>`

---

## **2. Admin Management Routes**

### **Get All Admins**
```bash
GET /api/admin-management?page=1&limit=10&search=&role=&isActive=
```
**Headers:** `Authorization: Bearer <token>`

### **Get Single Admin**
```bash
GET /api/admin-management/:id
```
**Headers:** `Authorization: Bearer <token>`

### **Create Admin**
```bash
POST /api/admin-management
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "password123",
  "role": "admin"
}
```

### **Update Admin**
```bash
PUT /api/admin-management/:id
```
**Headers:** `Authorization: Bearer <token>`

### **Delete Admin**
```bash
DELETE /api/admin-management/:id
```
**Headers:** `Authorization: Bearer <token>`

### **Get Admin Statistics**
```bash
GET /api/admin-management/stats
```
**Headers:** `Authorization: Bearer <token>`

### **Get Admin Roles (Public)**
```bash
GET /api/admin-management/roles
```
**No authentication required**

---

## **3. Setup Routes (Public)**

### **Check Setup Status**
```bash
GET /api/setup/status
```
**Response:**
```json
{
  "success": true,
  "data": {
    "setupNeeded": false,
    "adminCount": 1,
    "message": "Admin accounts exist. Setup not needed."
  }
}
```

### **Get Available Roles**
```bash
GET /api/setup/roles
```

### **Create First Admin**
```bash
POST /api/setup/first-admin
```
**Body:**
```json
{
  "firstName": "Super",
  "lastName": "Admin",
  "email": "admin@trafficslight.com",
  "password": "admin123",
  "role": "super_admin"
}
```

---

## **4. Dashboard Routes**

### **Get Dashboard Overview**
```bash
GET /api/admin-dashboard/overview
```
**Headers:** `Authorization: Bearer <token>`

### **Get Dashboard Statistics**
```bash
GET /api/admin-dashboard/statistics
```
**Headers:** `Authorization: Bearer <token>`

### **Get Dashboard Analytics**
```bash
GET /api/admin-dashboard/analytics
```
**Headers:** `Authorization: Bearer <token>`

---

## **5. User Management Routes**

### **Get All Users**
```bash
GET /api/admin-users?page=1&limit=10&search=&isActive=
```
**Headers:** `Authorization: Bearer <token>`

### **Get Single User**
```bash
GET /api/admin-users/:id
```
**Headers:** `Authorization: Bearer <token>`

### **Create User**
```bash
POST /api/admin-users
```
**Headers:** `Authorization: Bearer <token>`

### **Update User**
```bash
PUT /api/admin-users/:id
```
**Headers:** `Authorization: Bearer <token>`

### **Delete User**
```bash
DELETE /api/admin-users/:id
```
**Headers:** `Authorization: Bearer <token>`

### **Get User Statistics**
```bash
GET /api/admin-users/stats
```
**Headers:** `Authorization: Bearer <token>`

---

## **6. User Statistics Routes**

### **Get Total Users**
```bash
GET /api/admin-user-stats/total
```
**Headers:** `Authorization: Bearer <token>`

### **Get Users This Month**
```bash
GET /api/admin-user-stats/this-month
```
**Headers:** `Authorization: Bearer <token>`

### **Get User Statistics**
```bash
GET /api/admin-user-stats/statistics
```
**Headers:** `Authorization: Bearer <token>`

### **Get User Growth**
```bash
GET /api/admin-user-stats/growth?period=1year
```
**Headers:** `Authorization: Bearer <token>`

---

## **7. Motor Management Routes**

### **Get All Motors**
```bash
GET /api/admin-motors?page=1&limit=10&search=&brand=&model=
```
**Headers:** `Authorization: Bearer <token>`

### **Get Single Motor**
```bash
GET /api/admin-motors/:id
```
**Headers:** `Authorization: Bearer <token>`

### **Create Motor**
```bash
POST /api/admin-motors
```
**Headers:** `Authorization: Bearer <token>`

### **Update Motor**
```bash
PUT /api/admin-motors/:id
```
**Headers:** `Authorization: Bearer <token>`

### **Delete Motor**
```bash
DELETE /api/admin-motors/:id
```
**Headers:** `Authorization: Bearer <token>`

### **Get Motor Statistics**
```bash
GET /api/admin-motors/stats
```
**Headers:** `Authorization: Bearer <token>`

---

## **8. Motor Statistics Routes**

### **Get Total Motors**
```bash
GET /api/admin-motor-stats/total
```
**Headers:** `Authorization: Bearer <token>`
**Response:**
```json
{
  "success": true,
  "totalMotors": 19,
  "message": "Total motors registered: 19"
}
```

### **Get Total Motor Models**
```bash
GET /api/admin-motor-stats/models
```
**Headers:** `Authorization: Bearer <token>`
**Response:**
```json
{
  "success": true,
  "totalMotorModels": 22,
  "message": "Total motorcycle models: 22"
}
```

### **Get Motor Statistics**
```bash
GET /api/admin-motor-stats/statistics
```
**Headers:** `Authorization: Bearer <token>`
**Response:**
```json
{
  "success": true,
  "overview": {
    "totalUsers": 52,
    "totalMotors": 19,
    "totalMotorModels": 22,
    "motorsThisMonth": 2
  },
  "distribution": {
    "byModel": [
      {"_id": "Honda Click 125i", "count": 7},
      {"_id": "Honda ADV 160", "count": 3}
    ],
    "byUser": []
  },
  "month": "October 2025"
}
```

### **Get Motor Growth**
```bash
GET /api/admin-motor-stats/growth?period=6months
```
**Headers:** `Authorization: Bearer <token>`

### **Get Motor Models List**
```bash
GET /api/admin-motor-stats/models-list
```
**Headers:** `Authorization: Bearer <token>`

---

## **9. Trip Management Routes**

### **Get All Trips**
```bash
GET /api/admin-trips?page=1&limit=10&search=&status=&userId=
```
**Headers:** `Authorization: Bearer <token>`

### **Get Single Trip**
```bash
GET /api/admin-trips/:id
```
**Headers:** `Authorization: Bearer <token>`

### **Update Trip**
```bash
PUT /api/admin-trips/:id
```
**Headers:** `Authorization: Bearer <token>`

### **Delete Trip**
```bash
DELETE /api/admin-trips/:id
```
**Headers:** `Authorization: Bearer <token>`

### **Get Trip Statistics**
```bash
GET /api/admin-trips/stats
```
**Headers:** `Authorization: Bearer <token>`

---

## **10. Report Management Routes**

### **Get All Reports**
```bash
GET /api/admin-reports?page=1&limit=10&search=&status=&type=
```
**Headers:** `Authorization: Bearer <token>`

### **Get Single Report**
```bash
GET /api/admin-reports/:id
```
**Headers:** `Authorization: Bearer <token>`

### **Update Report**
```bash
PUT /api/admin-reports/:id
```
**Headers:** `Authorization: Bearer <token>`

### **Delete Report**
```bash
DELETE /api/admin-reports/:id
```
**Headers:** `Authorization: Bearer <token>`

### **Get Report Statistics**
```bash
GET /api/admin-reports/stats
```
**Headers:** `Authorization: Bearer <token>`

---

## **11. Gas Station Management Routes**

### **Get All Gas Stations**
```bash
GET /api/admin-gas-stations?page=1&limit=10&search=&city=&state=
```
**Headers:** `Authorization: Bearer <token>`

### **Get Single Gas Station**
```bash
GET /api/admin-gas-stations/:id
```
**Headers:** `Authorization: Bearer <token>`

### **Create Gas Station**
```bash
POST /api/admin-gas-stations
```
**Headers:** `Authorization: Bearer <token>`

### **Update Gas Station**
```bash
PUT /api/admin-gas-stations/:id
```
**Headers:** `Authorization: Bearer <token>`

### **Delete Gas Station**
```bash
DELETE /api/admin-gas-stations/:id
```
**Headers:** `Authorization: Bearer <token>`

### **Get Gas Station Statistics**
```bash
GET /api/admin-gas-stations/stats
```
**Headers:** `Authorization: Bearer <token>`

---

## **12. Admin Settings Routes**

### **Get Admin Settings**
```bash
GET /api/admin-settings
```
**Headers:** `Authorization: Bearer <token>`

### **Update Admin Settings**
```bash
PUT /api/admin-settings
```
**Headers:** `Authorization: Bearer <token>`

---

## **13. General Admin Routes**

### **Get Admin Info**
```bash
GET /api/admin/info
```
**Headers:** `Authorization: Bearer <token>`

### **Get System Status**
```bash
GET /api/admin/status
```
**Headers:** `Authorization: Bearer <token>`

---

## 🔧 Middleware

### **Admin Authentication Middleware**
```javascript
const { authenticateAdmin, requirePermission, requireRole } = require('./middleware/adminAuth');

// Authenticate admin
router.get('/protected-route', authenticateAdmin, controller.method);

// Require specific permission
router.get('/admin-only', authenticateAdmin, requirePermission('canManageAdmins'), controller.method);

// Require specific role
router.get('/super-admin-only', authenticateAdmin, requireRole('super_admin'), controller.method);
```

### **Permission System**
```javascript
const permissions = {
  canCreate: true,
  canRead: true,
  canUpdate: true,
  canDelete: true,
  canManageAdmins: true,
  canAssignRoles: true,
  canManageUsers: true,
  canManageReports: true,
  canManageTrips: true,
  canManageGasStations: true,
  canViewAnalytics: true,
  canExportData: true,
  canManageSettings: true
};
```

---

## 📊 Data Models

### **Admin Model**
```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['super_admin', 'admin', 'moderator']),
  isActive: Boolean,
  lastLogin: Date,
  createdBy: ObjectId (ref: 'Admin'),
  createdAt: Date,
  updatedAt: Date
}
```

### **User Model (Referenced)**
```javascript
{
  id: String (custom),
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  city: String,
  state: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### **UserMotor Model (Referenced)**
```javascript
{
  userId: ObjectId (ref: 'User'),
  motorcycleId: ObjectId (ref: 'Motorcycle'),
  nickname: String,
  plateNumber: String,
  registrationDate: Date,
  dateAcquired: Date,
  odometerAtAcquisition: Number,
  currentOdometer: Number,
  age: Number,
  currentFuelLevel: Number,
  fuelConsumptionStats: Object,
  analytics: Object,
  kmphRecords: Array,
  changeOilHistory: Array,
  tuneUpHistory: Array,
  fuelEfficiencyRecords: Array,
  createdAt: Date,
  updatedAt: Date
}
```

### **Motorcycle Model (Referenced)**
```javascript
{
  model: String (unique),
  engineDisplacement: Number,
  power: String,
  torque: String,
  fuelTank: Number,
  fuelConsumption: Number (required),
  isDeleted: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎯 Frontend Integration Examples

### **1. Admin Login**
```javascript
const loginAdmin = async (email, password) => {
  const response = await fetch('/api/admin-auth/admin-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('adminToken', data.data.token);
    return data.data.admin;
  }
  throw new Error(data.message);
};
```

### **2. Get Dashboard Data**
```javascript
const getDashboardData = async () => {
  const token = localStorage.getItem('adminToken');
  const response = await fetch('/api/admin-dashboard/overview', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
};
```

### **3. Get User Statistics**
```javascript
const getUserStats = async () => {
  const token = localStorage.getItem('adminToken');
  const response = await fetch('/api/admin-user-stats/statistics', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
};
```

### **4. Get Motor Statistics**
```javascript
const getMotorStats = async () => {
  const token = localStorage.getItem('adminToken');
  const response = await fetch('/api/admin-motor-stats/statistics', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
};
```

### **5. Create Admin**
```javascript
const createAdmin = async (adminData) => {
  const token = localStorage.getItem('adminToken');
  const response = await fetch('/api/admin-management', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(adminData)
  });
  return await response.json();
};
```

---

## 🔒 Security Features

### **1. Authentication:**
- JWT tokens with 7-day expiration
- Password hashing with bcrypt
- Role-based access control

### **2. Authorization:**
- Permission-based access control
- Role-level restrictions
- Route-level protection

### **3. Data Validation:**
- Input validation on all endpoints
- Email format validation
- Password strength requirements

### **4. Error Handling:**
- Consistent error response format
- Proper HTTP status codes
- Detailed error messages

---

## 📈 Performance Features

### **1. Pagination:**
- All list endpoints support pagination
- Configurable page size limits
- Efficient database queries

### **2. Filtering:**
- Search functionality on text fields
- Filter by status, role, dates
- Advanced query capabilities

### **3. Caching:**
- Efficient database queries
- Optimized aggregation pipelines
- Minimal data transfer

---

## 🚀 Deployment

### **Environment Variables:**
```bash
MONGO_URI=mongodb://localhost:27017/trafficslight
JWT_SECRET=your-secret-key
DEFAULT_ADMIN_EMAIL=admin@trafficslight.com
DEFAULT_ADMIN_PASSWORD=admin123
```

### **Production Setup:**
1. Set environment variables
2. Run database migrations
3. Create initial admin account
4. Deploy to production server

---

## 📋 Summary

The admin-backend system provides:

- ✅ **Complete CRUD operations** for all entities
- ✅ **Role-based access control** with 3 admin levels
- ✅ **Comprehensive statistics** and analytics
- ✅ **Secure authentication** with JWT tokens
- ✅ **Public setup endpoints** for initial configuration
- ✅ **14 route files** with 50+ endpoints
- ✅ **Production-ready** with proper error handling
- ✅ **Frontend integration** examples provided

**Perfect for comprehensive admin management!** 🚀✨
