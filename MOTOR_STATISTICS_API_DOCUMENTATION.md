# 🏍️ Motor Statistics API Documentation

## 📋 Overview

The Motor Statistics API provides comprehensive motor analytics for the admin dashboard. It includes total motors registered, motor models count, growth trends, and detailed motor distribution data.

## 🚀 API Endpoints

### **Base URL:** `/api/admin-motor-stats`

All endpoints require admin authentication using Bearer token.

---

## **1. Get Total Motors Registered**
```bash
GET /api/admin-motor-stats/total
```

**Description:** Get the total number of motors registered by users in the system.

**Authentication:** Required (Admin token)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalMotors": 0,
    "message": "Total motors registered: 0"
  }
}
```

---

## **2. Get Total Motor Models**
```bash
GET /api/admin-motor-stats/models
```

**Description:** Get the count of all unique motor models (brand + model combinations).

**Authentication:** Required (Admin token)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalMotorModels": 0,
    "message": "Total motor models: 0"
  }
}
```

---

## **3. Get Comprehensive Motor Statistics**
```bash
GET /api/admin-motor-stats/statistics
```

**Description:** Get comprehensive motor statistics including overview, trends, and distribution data.

**Authentication:** Required (Admin token)

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalMotors": 0,
      "totalMotorModels": 0,
      "motorsThisMonth": 0,
      "activeMotors": 0,
      "inactiveMotors": 0,
      "userMotorRelationships": 0
    },
    "distribution": {
      "byBrand": [],
      "byYear": [],
      "byFuelType": []
    },
    "month": "October 2025"
  }
}
```

---

## **4. Get Motor Growth**
```bash
GET /api/admin-motor-stats/growth?period=6months
```

**Description:** Get motor growth over time with different period options.

**Authentication:** Required (Admin token)

**Query Parameters:**
- `period` (optional): `1month`, `3months`, `6months`, `1year` (default: `6months`)

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "6months",
    "motorGrowth": [],
    "totalGrowth": 0
  }
}
```

---

## **5. Get Motor Models List**
```bash
GET /api/admin-motor-stats/models-list
```

**Description:** Get a detailed list of all motor models with their counts.

**Authentication:** Required (Admin token)

**Response:**
```json
{
  "success": true,
  "data": {
    "motorModels": [],
    "totalModels": 0
  }
}
```

---

## 🔐 Authentication

All endpoints require admin authentication:

```bash
# Get admin token first
POST /api/admin-auth/admin-login
{
  "email": "admin@trafficslight.com",
  "password": "admin123"
}

# Use token in requests
GET /api/admin-motor-stats/total
Headers: {
  "Authorization": "Bearer YOUR_ADMIN_TOKEN"
}
```

---

## 🎯 Frontend Integration

### **1. Get Total Motors:**
```javascript
const getTotalMotors = async (token) => {
  const response = await fetch('/api/admin-motor-stats/total', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  return data.data.totalMotors;
};
```

### **2. Get Total Motor Models:**
```javascript
const getTotalMotorModels = async (token) => {
  const response = await fetch('/api/admin-motor-stats/models', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  return data.data.totalMotorModels;
};
```

### **3. Get All Motor Statistics:**
```javascript
const getAllMotorStats = async (token) => {
  const response = await fetch('/api/admin-motor-stats/statistics', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  return data.data;
};
```

### **4. Get Motor Growth:**
```javascript
const getMotorGrowth = async (token, period = '6months') => {
  const response = await fetch(`/api/admin-motor-stats/growth?period=${period}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  return data.data;
};
```

### **5. Get Motor Models List:**
```javascript
const getMotorModelsList = async (token) => {
  const response = await fetch('/api/admin-motor-stats/models-list', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  return data.data;
};
```

---

## 📊 Dashboard Integration Example

```javascript
// Complete motor dashboard data fetching
const fetchMotorDashboardData = async (token) => {
  try {
    const [totalMotors, totalMotorModels, motorStats, motorGrowth] = await Promise.all([
      getTotalMotors(token),
      getTotalMotorModels(token),
      getAllMotorStats(token),
      getMotorGrowth(token, '6months')
    ]);

    return {
      totalMotors,
      totalMotorModels,
      activeMotors: motorStats.overview.activeMotors,
      inactiveMotors: motorStats.overview.inactiveMotors,
      motorsThisMonth: motorStats.overview.motorsThisMonth,
      userMotorRelationships: motorStats.overview.userMotorRelationships,
      growthTrend: motorGrowth.motorGrowth,
      brandDistribution: motorStats.distribution.byBrand,
      yearDistribution: motorStats.distribution.byYear,
      fuelTypeDistribution: motorStats.distribution.byFuelType
    };
  } catch (error) {
    console.error('Error fetching motor statistics:', error);
    return null;
  }
};
```

---

## 🎉 Benefits

### **1. Real-Time Data:**
- ✅ **Live motor counts** - Always up-to-date
- ✅ **Monthly tracking** - Current month registrations
- ✅ **Growth trends** - Historical data analysis
- ✅ **Model diversity** - Unique motor model tracking

### **2. Comprehensive Analytics:**
- ✅ **Overview statistics** - Total, active, inactive motors
- ✅ **Model counting** - Distinct motor models
- ✅ **Time-based trends** - Monthly growth patterns
- ✅ **Distribution insights** - Brand, year, fuel type analytics

### **3. Dashboard Ready:**
- ✅ **Easy integration** - Simple API calls
- ✅ **Consistent format** - Standardized responses
- ✅ **Error handling** - Comprehensive error management
- ✅ **Performance optimized** - Efficient database queries

---

## 📋 Key Features

### **1. Total Motors Registered:**
- Counts all motors created by users
- Includes active and inactive motors
- Real-time database count

### **2. Total Motor Models:**
- Counts unique brand + model combinations
- Excludes duplicates (same brand + model)
- Shows model diversity

### **3. Comprehensive Statistics:**
- Total motors and models
- Monthly registrations
- Active/inactive breakdown
- User-motor relationships
- Distribution by brand, year, fuel type

### **4. Growth Tracking:**
- Multiple time periods (1month, 3months, 6months, 1year)
- Historical growth patterns
- Total growth calculations

### **5. Model Management:**
- Detailed model list with counts
- Brand and model breakdown
- Usage statistics per model

---

## 📊 Current Data Status

- **Total Motors:** 0 motors (empty database)
- **Total Motor Models:** 0 models (no motors registered)
- **Active Motors:** 0 motors
- **Inactive Motors:** 0 motors
- **Motors This Month:** 0 motors
- **User-Motor Relationships:** 0 relationships

---

## 📋 Summary

The Motor Statistics API provides:

- **Total Motors Registered:** 0 motors
- **Total Motor Models:** 0 models
- **Active Motors:** 0 motors
- **Inactive Motors:** 0 motors
- **Growth Trends:** Monthly registration patterns
- **Distribution Analytics:** Brand, year, fuel type insights

**Perfect for admin dashboard integration with comprehensive motor analytics!** 🚀✨
