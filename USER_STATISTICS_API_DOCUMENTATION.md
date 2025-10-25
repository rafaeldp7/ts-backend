# 📊 User Statistics API Documentation

## 📋 Overview

The User Statistics API provides comprehensive user analytics for the admin dashboard. It includes total users, monthly registrations, growth trends, and detailed user distribution data.

## 🚀 API Endpoints

### **Base URL:** `/api/admin-user-stats`

All endpoints require admin authentication using Bearer token.

---

## **1. Get Total Users**
```bash
GET /api/admin-user-stats/total
```

**Description:** Get the total number of users in the system.

**Authentication:** Required (Admin token)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 8,
    "message": "Total users: 8"
  }
}
```

---

## **2. Get Users This Month**
```bash
GET /api/admin-user-stats/this-month
```

**Description:** Get the number of users registered in the current month.

**Authentication:** Required (Admin token)

**Response:**
```json
{
  "success": true,
  "data": {
    "usersThisMonth": 8,
    "month": "October 2025",
    "message": "8 users registered this month"
  }
}
```

---

## **3. Get Comprehensive Statistics**
```bash
GET /api/admin-user-stats/statistics
```

**Description:** Get comprehensive user statistics including overview, trends, and distribution data.

**Authentication:** Required (Admin token)

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 8,
      "usersThisMonth": 8,
      "activeUsers": 8,
      "inactiveUsers": 0
    },
    "trends": {
      "usersByMonth": [
        {
          "_id": {
            "year": 2025,
            "month": 10
          },
          "count": 8
        }
      ],
      "usersByCity": [
        {
          "_id": "Default City",
          "count": 8
        }
      ]
    },
    "month": "October 2025"
  }
}
```

---

## **4. Get User Growth**
```bash
GET /api/admin-user-stats/growth?period=6months
```

**Description:** Get user growth over time with different period options.

**Authentication:** Required (Admin token)

**Query Parameters:**
- `period` (optional): `1month`, `3months`, `6months`, `1year` (default: `6months`)

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "6months",
    "userGrowth": [
      {
        "_id": {
          "year": 2025,
          "month": 10
        },
        "count": 8
      }
    ],
    "totalGrowth": 8
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
GET /api/admin-user-stats/total
Headers: {
  "Authorization": "Bearer YOUR_ADMIN_TOKEN"
}
```

---

## 🎯 Frontend Integration

### **1. Get Total Users:**
```javascript
const getTotalUsers = async (token) => {
  const response = await fetch('/api/admin-user-stats/total', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  return data.data.totalUsers;
};
```

### **2. Get Users This Month:**
```javascript
const getUsersThisMonth = async (token) => {
  const response = await fetch('/api/admin-user-stats/this-month', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  return data.data.usersThisMonth;
};
```

### **3. Get All Statistics:**
```javascript
const getAllUserStats = async (token) => {
  const response = await fetch('/api/admin-user-stats/statistics', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  return data.data;
};
```

### **4. Get User Growth:**
```javascript
const getUserGrowth = async (token, period = '6months') => {
  const response = await fetch(`/api/admin-user-stats/growth?period=${period}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  return data.data;
};
```

---

## 📊 Dashboard Integration Example

```javascript
// Complete dashboard data fetching
const fetchDashboardData = async (token) => {
  try {
    const [totalUsers, usersThisMonth, userStats, userGrowth] = await Promise.all([
      getTotalUsers(token),
      getUsersThisMonth(token),
      getAllUserStats(token),
      getUserGrowth(token, '6months')
    ]);

    return {
      totalUsers,
      usersThisMonth,
      activeUsers: userStats.overview.activeUsers,
      inactiveUsers: userStats.overview.inactiveUsers,
      growthTrend: userGrowth.userGrowth,
      cityDistribution: userStats.trends.usersByCity
    };
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    return null;
  }
};
```

---

## 🎉 Benefits

### **1. Real-Time Data:**
- ✅ **Live user counts** - Always up-to-date
- ✅ **Monthly tracking** - Current month registrations
- ✅ **Growth trends** - Historical data analysis
- ✅ **Geographic distribution** - User location insights

### **2. Comprehensive Analytics:**
- ✅ **Overview statistics** - Total, active, inactive users
- ✅ **Time-based trends** - Monthly growth patterns
- ✅ **Geographic insights** - User distribution by city
- ✅ **Growth tracking** - Multiple time period options

### **3. Dashboard Ready:**
- ✅ **Easy integration** - Simple API calls
- ✅ **Consistent format** - Standardized responses
- ✅ **Error handling** - Comprehensive error management
- ✅ **Performance optimized** - Efficient database queries

---

## 📋 Summary

The User Statistics API provides:

- **Total Users:** 8 users
- **Users This Month:** 8 users (October 2025)
- **Active Users:** 8 users
- **Inactive Users:** 0 users
- **Growth Trends:** Monthly registration patterns
- **Geographic Distribution:** User location analytics

**Perfect for admin dashboard integration with real-time user analytics!** 🚀✨
