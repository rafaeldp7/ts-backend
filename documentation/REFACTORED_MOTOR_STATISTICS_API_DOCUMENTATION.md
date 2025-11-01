# 🏍️ Refactored Motor Statistics API Documentation

## 📋 Overview

The Motor Statistics API has been refactored to use the correct models and relationships as specified:
- **Total Motors**: Counts through User → UserMotor relationships
- **Motor Models**: Counts from the Motorcycle model (motorcycleModel.js)

## 🚀 API Endpoints

### **Base URL:** `/api/admin-motor-stats`

All endpoints require admin authentication using Bearer token.

---

## **1. Get Total Motors Registered**
```bash
GET /api/admin-motor-stats/total
```

**Description:** Get the total number of motorcycles registered by users through UserMotor relationships.

**Authentication:** Required (Admin token)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalMotors": 0,
    "totalUsers": 8,
    "message": "Total motors registered: 0 (across 8 users)"
  }
}
```

**Logic:**
1. Gets all users from User model
2. Counts all motorcycles through UserMotor relationships
3. Shows total users and total motorcycles

---

## **2. Get Total Motorcycle Models**
```bash
GET /api/admin-motor-stats/models
```

**Description:** Get the count of all motorcycle models from the Motorcycle model.

**Authentication:** Required (Admin token)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalMotorModels": 0,
    "message": "Total motorcycle models: 0"
  }
}
```

**Logic:**
1. Counts all motorcycle models from Motorcycle model
2. Excludes deleted models (isDeleted: { $ne: true })
3. Shows total available motorcycle models

---

## **3. Get Comprehensive Motor Statistics**
```bash
GET /api/admin-motor-stats/statistics
```

**Description:** Get comprehensive motor statistics using the correct model relationships.

**Authentication:** Required (Admin token)

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 8,
      "totalMotors": 0,
      "totalMotorModels": 0,
      "motorsThisMonth": 0,
      "userMotorRelationships": 0
    },
    "distribution": {
      "byModel": [],
      "byUser": []
    },
    "month": "October 2025"
  }
}
```

**Logic:**
1. **Total Users**: Count from User model
2. **Total Motors**: Count from UserMotor relationships
3. **Total Motor Models**: Count from Motorcycle model
4. **Motors This Month**: Count from UserMotor with date filter
5. **Distribution by Model**: Aggregates UserMotor → Motorcycle relationships
6. **Distribution by User**: Aggregates UserMotor → User relationships

---

## **4. Get Motor Growth**
```bash
GET /api/admin-motor-stats/growth?period=6months
```

**Description:** Get motor growth over time using UserMotor relationships.

**Authentication:** Required (Admin token)

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

**Logic:**
1. Uses UserMotor model for growth tracking
2. Groups by year and month
3. Shows motorcycle registration growth over time

---

## **5. Get Motor Models List**
```bash
GET /api/admin-motor-stats/models-list
```

**Description:** Get detailed list of motorcycle models with usage statistics.

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

**Logic:**
1. Gets all models from Motorcycle model
2. Calculates usage count through UserMotor relationships
3. Combines model data with usage statistics

---

## 🔄 Model Relationships

### **Data Flow:**
```
User Model → UserMotor Model → Motorcycle Model
     ↓              ↓              ↓
   Users      User-Motor      Motorcycle
              Relationships    Models
```

### **1. Total Motors Logic:**
```javascript
// Get all users
const users = await User.find({});

// Count motorcycles through UserMotor relationships
const totalMotors = await UserMotor.countDocuments();
```

### **2. Motor Models Logic:**
```javascript
// Count motorcycle models from Motorcycle model
const totalMotorModels = await Motorcycle.countDocuments({ 
  isDeleted: { $ne: true } 
});
```

### **3. Statistics Logic:**
```javascript
// Get comprehensive data
const totalUsers = await User.countDocuments();
const totalMotors = await UserMotor.countDocuments();
const totalMotorModels = await Motorcycle.countDocuments({ isDeleted: { $ne: true } });

// Get distribution by model
const motorsByModel = await UserMotor.aggregate([
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
      _id: '$motorcycle.model',
      count: { $sum: 1 }
    }
  }
]);
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
  return {
    totalMotors: data.data.totalMotors,
    totalUsers: data.data.totalUsers
  };
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

### **3. Get All Statistics:**
```javascript
const getAllMotorStats = async (token) => {
  const response = await fetch('/api/admin-motor-stats/statistics', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  return data.data;
};
```

---

## 📊 Current Data Status

### **Refactored Results:**
- **Total Users:** 8 users
- **Total Motors:** 0 motorcycles (through UserMotor relationships)
- **Total Motor Models:** 0 models (from Motorcycle model)
- **User-Motor Relationships:** 0 relationships
- **Motors This Month:** 0 motorcycles

### **Data Sources:**
- **Users**: From User model (8 users)
- **Motors**: From UserMotor model (0 relationships)
- **Models**: From Motorcycle model (0 models)

---

## 🎉 Benefits of Refactoring

### **1. Correct Model Usage:**
- ✅ **User Model** - For user data
- ✅ **UserMotor Model** - For user-motorcycle relationships
- ✅ **Motorcycle Model** - For motorcycle model data

### **2. Accurate Data Flow:**
- ✅ **Total Motors** - Counts through UserMotor relationships
- ✅ **Motor Models** - Counts from Motorcycle model
- ✅ **Proper Relationships** - Uses correct model references

### **3. Real Data Sources:**
- ✅ **User Count** - Real data from User model
- ✅ **Motor Count** - Real data from UserMotor relationships
- ✅ **Model Count** - Real data from Motorcycle model

### **4. Enhanced Analytics:**
- ✅ **Distribution by Model** - Through UserMotor → Motorcycle
- ✅ **Distribution by User** - Through UserMotor → User
- ✅ **Growth Tracking** - Through UserMotor timestamps

---

## 📋 Summary

The refactored Motor Statistics API now correctly uses:

1. **User Model** → For user data and counts
2. **UserMotor Model** → For user-motorcycle relationships and motor counts
3. **Motorcycle Model** → For motorcycle model data and counts

**Perfect for accurate motor statistics with proper model relationships!** 🚀✨
