# 🏍️ Popular Motorcycle Models API Documentation

## 📋 Overview

New popular motorcycle models functionality has been added to the motor statistics controller, providing comprehensive insights into motorcycle model popularity, usage statistics, and detailed analytics.

## 🚀 API Endpoints

### **Base URL:** `/api/admin-motor-stats`

All endpoints require admin authentication using Bearer token.

---

## **1. Get Popular Motorcycle Models**
```bash
GET /api/admin-motor-stats/popular?limit=10
```

**Description:** Get the most popular motorcycle models based on user registrations.

**Authentication:** Required (Admin token)

**Query Parameters:**
- `limit` (optional): Number of models to return (default: 10)

**Response:**
```json
{
  "success": true,
  "popularModels": [
    {
      "modelId": "60f7b3b3b3b3b3b3b3b3b3b3",
      "model": "Honda Click 125i",
      "brand": "Honda",
      "count": 7,
      "motorcycle": {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "model": "Honda Click 125i",
        "engineDisplacement": 125,
        "power": "11.1 PS @ 8,500 RPM",
        "torque": "10.4 Nm @ 6,500 RPM",
        "fuelTank": 4.2,
        "fuelConsumption": 2.1
      }
    }
  ],
  "totalModels": 10,
  "limit": 10
}
```

---

## **2. Get Motor Model Statistics**
```bash
GET /api/admin-motor-stats/popular/stats
```

**Description:** Get comprehensive statistics about motorcycle models and their usage.

**Authentication:** Required (Admin token)

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalModels": 22,
    "modelsWithUsers": 15,
    "modelsWithoutUsers": 7,
    "mostPopularModel": {
      "_id": "Honda Click 125i",
      "count": 7
    }
  }
}
```

---

## **3. Get Motor Model Details**
```bash
GET /api/admin-motor-stats/popular/details/:modelId
```

**Description:** Get detailed information about a specific motorcycle model and its users.

**Authentication:** Required (Admin token)

**Path Parameters:**
- `modelId`: MongoDB ObjectId of the motorcycle model

**Response:**
```json
{
  "success": true,
  "motorcycle": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "model": "Honda Click 125i",
    "engineDisplacement": 125,
    "power": "11.1 PS @ 8,500 RPM",
    "torque": "10.4 Nm @ 6,500 RPM",
    "fuelTank": 4.2,
    "fuelConsumption": 2.1
  },
  "usersWithThisModel": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
      "nickname": "My Click",
      "plateNumber": "ABC-1234",
      "currentOdometer": 15000,
      "user": {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b5",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com"
      }
    }
  ],
  "totalUsers": 7
}
```

---

## **4. Get Motor Models by Brand**
```bash
GET /api/admin-motor-stats/popular/by-brand?brand=Honda
```

**Description:** Get all motorcycle models from a specific brand with usage statistics.

**Authentication:** Required (Admin token)

**Query Parameters:**
- `brand` (required): Brand name to filter by (case-insensitive)

**Response:**
```json
{
  "success": true,
  "brand": "Honda",
  "models": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "model": "Honda Click 125i",
      "engineDisplacement": 125,
      "power": "11.1 PS @ 8,500 RPM",
      "torque": "10.4 Nm @ 6,500 RPM",
      "fuelTank": 4.2,
      "fuelConsumption": 2.1,
      "usageCount": 7
    }
  ],
  "totalModels": 5
}
```

---

## 🔄 Data Flow and Relationships

### **Model Relationships:**
```
User Model → UserMotor Model → Motorcycle Model
     ↓              ↓              ↓
   Users      User-Motor      Motorcycle
              Relationships    Models
```

### **Popular Models Logic:**
```javascript
// Aggregates UserMotor relationships with Motorcycle data
const popularModels = await UserMotor.aggregate([
  {
    $lookup: {
      from: 'motorcycles',
      localField: 'motorcycleId',
      foreignField: '_id',
      as: 'motorcycle'
    }
  },
  {
    $unwind: '$motorcycle'
  },
  {
    $group: {
      _id: {
        modelId: '$motorcycle._id',
        model: '$motorcycle.model',
        brand: '$motorcycle.brand'
      },
      count: { $sum: 1 },
      motorcycle: { $first: '$motorcycle' }
    }
  },
  { $sort: { count: -1 } },
  { $limit: parseInt(limit) || 10 }
]);
```

---

## 🎯 Frontend Integration

### **1. Get Popular Models:**
```javascript
const getPopularMotorModels = async (token, limit = 10) => {
  const response = await fetch(`/api/admin-motor-stats/popular?limit=${limit}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  return data.popularModels;
};
```

### **2. Get Model Statistics:**
```javascript
const getMotorModelStats = async (token) => {
  const response = await fetch('/api/admin-motor-stats/popular/stats', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  return data.stats;
};
```

### **3. Get Model Details:**
```javascript
const getMotorModelDetails = async (token, modelId) => {
  const response = await fetch(`/api/admin-motor-stats/popular/details/${modelId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  return {
    motorcycle: data.motorcycle,
    users: data.usersWithThisModel,
    totalUsers: data.totalUsers
  };
};
```

### **4. Get Models by Brand:**
```javascript
const getMotorModelsByBrand = async (token, brand) => {
  const response = await fetch(`/api/admin-motor-stats/popular/by-brand?brand=${encodeURIComponent(brand)}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  return data.models;
};
```

---

## 📊 Use Cases

### **1. Admin Dashboard:**
- **Popular Models Chart**: Show top 10 most popular motorcycle models
- **Model Statistics**: Display total models, models with users, unused models
- **Brand Analysis**: Analyze motorcycle distribution by brand

### **2. User Analytics:**
- **Model Popularity**: Track which models are most popular among users
- **User Distribution**: See how users are distributed across different models
- **Model Performance**: Analyze model usage and user satisfaction

### **3. Business Intelligence:**
- **Market Trends**: Identify popular motorcycle models and trends
- **Inventory Management**: Understand which models are in demand
- **User Preferences**: Analyze user choices and preferences

---

## 🎉 Benefits

### **1. Comprehensive Analytics:**
- ✅ **Popular Models** - Track most registered motorcycle models
- ✅ **Usage Statistics** - Understand model adoption rates
- ✅ **Brand Analysis** - Analyze motorcycle distribution by brand
- ✅ **User Insights** - See which users own which models

### **2. Admin Insights:**
- ✅ **Model Performance** - Track which models are popular
- ✅ **User Distribution** - Understand user model preferences
- ✅ **Brand Trends** - Analyze motorcycle brand popularity
- ✅ **Detailed Analytics** - Get comprehensive model statistics

### **3. Frontend Integration:**
- ✅ **Easy API Calls** - Simple fetch requests with authentication
- ✅ **Flexible Queries** - Support for limits, brand filtering, and detailed views
- ✅ **Rich Data** - Comprehensive model and user information
- ✅ **Real-time Data** - Live data from production database

---

## 📋 Summary

The popular motorcycle models API provides:

1. **Popular Models Endpoint** - Get most popular motorcycle models
2. **Model Statistics** - Comprehensive model usage statistics
3. **Model Details** - Detailed information about specific models
4. **Brand Filtering** - Get models filtered by brand
5. **User Analytics** - See which users own which models
6. **Admin Insights** - Comprehensive analytics for admin dashboard

**Perfect for motorcycle model analytics and admin insights!** 🚀✨
