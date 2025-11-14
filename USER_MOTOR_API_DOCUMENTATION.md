# User-Motor API - Complete Documentation

## Overview

This guide provides complete documentation for the User-Motor API. The API allows users to manage their motorcycle registrations, track fuel levels, monitor fuel efficiency, and access analytics for their vehicles.

---

## Table of Contents

1. [API Endpoints](#api-endpoints)
2. [Base URL](#base-url)
3. [Authentication](#authentication)
4. [Get Motor Fuel Level](#get-motor-fuel-level)
5. [Get All User Motors](#get-all-user-motors)
6. [Get User Motors by User ID](#get-user-motors-by-user-id)
7. [Create User Motor](#create-user-motor)
8. [Update User Motor](#update-user-motor)
9. [Update Fuel Level](#update-fuel-level)
10. [Delete User Motor](#delete-user-motor)
11. [Data Models](#data-models)
12. [Error Handling](#error-handling)
13. [Example Usage](#example-usage)

---

## Base URL

```
/api/user-motors
```

---

## Authentication

Most endpoints support authentication but can also work with `userId` in the request body or path parameters for backward compatibility. When authentication is available, the `userId` is automatically extracted from the authenticated user.

**Header Format (if required):**
```
Authorization: Bearer <your-jwt-token>
```

**Example:**
```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

---

## Get Motor Fuel Level

### Endpoint Description

**Purpose:** Retrieves the current fuel level and related fuel information for a specific motor. This endpoint provides comprehensive fuel data including the current fuel level (as both percentage and liters), fuel tank capacity, fuel efficiency, drivable distances, and low fuel alerts.

**When to Use:** Use this endpoint when you need to:
- Display the current fuel level in your application
- Check if the motor is running low on fuel
- Calculate remaining drivable distance
- Show fuel-related information in dashboards or vehicle status screens

### Request Method and URL

**HTTP Method:** `GET`

**Endpoint URL:**
```
GET /api/user-motors/:id/fuel
```

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | The UserMotor ID (motorId) |

### Input Parameters

**Path Parameters:**
- `id` (string, required): The MongoDB ObjectId of the UserMotor document

**Validation Rules:**
- The `id` must be a valid MongoDB ObjectId format
- The motor must exist in the database

### Response Schema

**Success Response (200 OK):**

The response is a JSON object with the following structure:

```json
{
  "success": true,
  "motorId": "507f1f77bcf86cd799439011",
  "nickname": "My Bike",
  "fuelLevel": {
    "percentage": 75.50,
    "liters": 9.06,
    "fuelTankCapacity": 12.0
  },
  "fuelEfficiency": 50.0,
  "drivableDistance": {
    "withFullTank": 600.0,
    "withCurrentFuel": 453.0
  },
  "alerts": {
    "isLowFuel": false,
    "lowFuelThreshold": 60.0
  },
  "lastUpdated": "2024-01-15T10:30:00.000Z"
}
```

**Response Fields:**

| Field | Type | Description | Units |
|-------|------|-------------|-------|
| `success` | boolean | Indicates if the request was successful | - |
| `motorId` | string | The UserMotor document ID | - |
| `nickname` | string | The nickname/name of the motor | - |
| `fuelLevel.percentage` | number | Current fuel level as percentage | 0-100% |
| `fuelLevel.liters` | number | Current fuel amount in liters (calculated) | liters |
| `fuelLevel.fuelTankCapacity` | number | Maximum fuel tank capacity | liters |
| `fuelEfficiency` | number | Fuel consumption rate | km/L |
| `drivableDistance.withFullTank` | number | Maximum drivable distance with full tank | kilometers |
| `drivableDistance.withCurrentFuel` | number | Remaining drivable distance with current fuel | kilometers |
| `alerts.isLowFuel` | boolean | Whether the motor is running low on fuel | - |
| `alerts.lowFuelThreshold` | number | Distance threshold for low fuel warning | kilometers |
| `lastUpdated` | string (ISO 8601) | Timestamp of last update to the motor | - |

**Notes:**
- `fuelLevel.percentage` is stored in the database (0-100%)
- `fuelLevel.liters` is calculated as: `(percentage / 100) * fuelTankCapacity`
- `drivableDistance.withFullTank` is calculated as: `fuelTankCapacity * fuelEfficiency`
- `drivableDistance.withCurrentFuel` is calculated as: `fuelEfficiency * fuelTankCapacity * (percentage / 100)`
- `isLowFuel` is `true` when remaining distance is less than 10% of total drivable distance

### Error Handling

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Motor not found"
}
```

**Possible Errors:**

| HTTP Status Code | Error Message | Description |
|------------------|---------------|-------------|
| 404 | "Motor not found" | The provided motor ID does not exist in the database |
| 500 | "Failed to retrieve motor fuel level" | Server error occurred while processing the request |

**Error Response (500 Internal Server Error):**
```json
{
  "success": false,
  "message": "Failed to retrieve motor fuel level",
  "error": "Error details here"
}
```

### Example Usage

**JavaScript/TypeScript Example:**

```javascript
// Using fetch API
async function getMotorFuelLevel(motorId) {
  try {
    const response = await fetch(`/api/user-motors/${motorId}/fuel`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // if authentication is required
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch fuel level');
    }

    const data = await response.json();
    
    // Interpret the response
    console.log(`Motor: ${data.nickname}`);
    console.log(`Fuel Level: ${data.fuelLevel.percentage}% (${data.fuelLevel.liters}L)`);
    console.log(`Tank Capacity: ${data.fuelLevel.fuelTankCapacity}L`);
    console.log(`Remaining Distance: ${data.drivableDistance.withCurrentFuel}km`);
    
    if (data.alerts.isLowFuel) {
      console.warn('⚠️ Low fuel warning! Please refuel soon.');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching fuel level:', error);
    throw error;
  }
}

// Usage
getMotorFuelLevel('507f1f77bcf86cd799439011')
  .then(fuelData => {
    // Display fuel level in UI
    updateFuelGauge(fuelData.fuelLevel.percentage);
    updateRemainingDistance(fuelData.drivableDistance.withCurrentFuel);
  })
  .catch(error => {
    // Handle error
    showErrorMessage(error.message);
  });
```

**Axios Example:**

```javascript
import axios from 'axios';

async function getMotorFuelLevel(motorId) {
  try {
    const response = await axios.get(`/api/user-motors/${motorId}/fuel`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const fuelData = response.data;
    
    // Interpret the response
    if (fuelData.success) {
      return {
        percentage: fuelData.fuelLevel.percentage,
        liters: fuelData.fuelLevel.liters,
        tankCapacity: fuelData.fuelLevel.fuelTankCapacity,
        remainingDistance: fuelData.drivableDistance.withCurrentFuel,
        isLowFuel: fuelData.alerts.isLowFuel,
        fuelEfficiency: fuelData.fuelEfficiency
      };
    }
  } catch (error) {
    if (error.response) {
      // Server responded with error status
      console.error('Error:', error.response.data.message);
    } else {
      // Request failed
      console.error('Request failed:', error.message);
    }
    throw error;
  }
}
```

**React Hook Example:**

```javascript
import { useState, useEffect } from 'react';

function useMotorFuelLevel(motorId) {
  const [fuelData, setFuelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchFuelLevel() {
      try {
        setLoading(true);
        const response = await fetch(`/api/user-motors/${motorId}/fuel`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch fuel level');
        }
        
        const data = await response.json();
        setFuelData(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (motorId) {
      fetchFuelLevel();
      // Optionally set up polling to refresh fuel level
      const interval = setInterval(fetchFuelLevel, 60000); // Refresh every minute
      return () => clearInterval(interval);
    }
  }, [motorId]);

  return { fuelData, loading, error };
}

// Usage in component
function FuelLevelDisplay({ motorId }) {
  const { fuelData, loading, error } = useMotorFuelLevel(motorId);

  if (loading) return <div>Loading fuel level...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!fuelData) return null;

  return (
    <div>
      <h3>{fuelData.nickname}</h3>
      <div>
        <p>Fuel Level: {fuelData.fuelLevel.percentage}%</p>
        <p>Remaining: {fuelData.fuelLevel.liters}L / {fuelData.fuelLevel.fuelTankCapacity}L</p>
        <p>Remaining Distance: {fuelData.drivableDistance.withCurrentFuel}km</p>
        {fuelData.alerts.isLowFuel && (
          <p className="warning">⚠️ Low Fuel Warning!</p>
        )}
      </div>
    </div>
  );
}
```

**cURL Example:**

```bash
# Get fuel level for a motor
curl -X GET "http://localhost:3000/api/user-motors/507f1f77bcf86cd799439011/fuel" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response Interpretation:**

```javascript
// Example of interpreting the response for UI display
function displayFuelInfo(fuelData) {
  // Calculate fuel percentage for progress bar
  const fuelPercentage = fuelData.fuelLevel.percentage;
  
  // Determine fuel status color
  let statusColor;
  if (fuelPercentage > 50) {
    statusColor = 'green';
  } else if (fuelPercentage > 20) {
    statusColor = 'yellow';
  } else {
    statusColor = 'red';
  }
  
  // Format remaining distance
  const remainingKm = Math.round(fuelData.drivableDistance.withCurrentFuel);
  
  // Display in UI
  return {
    percentage: fuelPercentage,
    liters: fuelData.fuelLevel.liters,
    remainingDistance: `${remainingKm} km`,
    statusColor: statusColor,
    isLowFuel: fuelData.alerts.isLowFuel,
    warningMessage: fuelData.alerts.isLowFuel 
      ? `Low fuel! Only ${remainingKm} km remaining.` 
      : null
  };
}
```

---

## Get All User Motors

**Endpoint:**
```
GET /api/user-motors
```

**Description:**
Returns all user-motor relationships with full user and motorcycle details populated.

**Response:**
Returns an array of UserMotor documents with populated `userId` and `motorcycleId` fields.

---

## Get User Motors by User ID

**Endpoint:**
```
GET /api/user-motors/user/:id
```

**Description:**
Returns all motors associated with a specific user, formatted with summary information.

**Path Parameters:**
- `id` (string, required): The User ID

**Response:**
Returns an array of formatted motor objects including fuel level, analytics, and virtual fields.

---

## Create User Motor

**Endpoint:**
```
POST /api/user-motors
```

**Description:**
Creates a new user-motor relationship.

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439012",
  "motorcycleId": "507f1f77bcf86cd799439013",
  "nickname": "My Bike",
  "registrationDate": "2024-01-01"
}
```

---

## Update User Motor

**Endpoint:**
```
PUT /api/user-motors/:id
```

**Description:**
Updates a user motor with allowed fields.

**Request Body:**
```json
{
  "nickname": "Updated Nickname",
  "currentFuelLevel": 75,
  "currentOdometer": 5000
}
```

---

## Update Fuel Level

**Endpoint:**
```
PUT /api/user-motors/:id/fuel
```

**Description:**
Updates the fuel level for a specific motor and recalculates derived values.

**Request Body:**
```json
{
  "currentFuelLevel": 75.5
}
```

**Note:** `currentFuelLevel` should be a number representing percentage (0-100%).

---

## Delete User Motor

**Endpoint:**
```
DELETE /api/user-motors/:id
```

**Description:**
Deletes a user-motor relationship.

---

## Data Models

### UserMotor Schema

```javascript
{
  userId: ObjectId, // Reference to User
  motorcycleId: ObjectId, // Reference to Motorcycle
  nickname: String,
  plateNumber: String,
  registrationDate: Date,
  dateAcquired: Date,
  odometerAtAcquisition: Number, // kilometers
  currentOdometer: Number, // kilometers
  age: Number,
  currentFuelLevel: Number, // 0-100% (stored as percentage)
  currentFuelEfficiency: Number, // km/L
  fuelEfficiencyRecords: [{
    date: Date,
    efficiency: Number // km/L
  }],
  fuelConsumptionStats: {
    average: Number,
    max: Number,
    min: Number
  },
  analytics: {
    tripsCompleted: Number,
    totalDistance: Number, // kilometers
    totalFuelUsed: Number, // liters
    maintenanceAlerts: [String]
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Virtual Fields

The UserMotor model includes the following virtual fields (computed on-the-fly):

- `fuelTank`: Returns the fuel tank capacity from the associated Motorcycle model (liters)
- `totalDrivableDistance`: Maximum drivable distance with full tank (km)
- `totalDrivableDistanceWithCurrentGas`: Remaining drivable distance with current fuel (km)
- `isLowFuel`: Boolean indicating if fuel is low (< 10% of total drivable distance)

---

## Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "msg": "userId and motorcycleId are required."
}
```

**404 Not Found:**
```json
{
  "msg": "Motor not found"
}
```

**500 Internal Server Error:**
```json
{
  "msg": "Failed to fetch user motors",
  "error": "Error details"
}
```

---

## Example Usage

### Complete Workflow Example

```javascript
// 1. Get fuel level for a motor
async function checkFuelStatus(motorId) {
  const response = await fetch(`/api/user-motors/${motorId}/fuel`);
  const fuelData = await response.json();
  
  if (fuelData.success) {
    console.log(`Current fuel: ${fuelData.fuelLevel.percentage}%`);
    console.log(`Remaining distance: ${fuelData.drivableDistance.withCurrentFuel}km`);
    
    if (fuelData.alerts.isLowFuel) {
      console.warn('⚠️ Low fuel! Please refuel soon.');
      // Trigger notification or alert in UI
    }
    
    return fuelData;
  }
}

// 2. Update fuel level after refueling
async function updateFuelAfterRefuel(motorId, newFuelLevel) {
  const response = await fetch(`/api/user-motors/${motorId}/fuel`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      currentFuelLevel: newFuelLevel // percentage
    })
  });
  
  const result = await response.json();
  console.log(result.msg);
}

// 3. Monitor fuel level over time
async function monitorFuelLevel(motorId, intervalMs = 60000) {
  setInterval(async () => {
    const fuelData = await checkFuelStatus(motorId);
    // Update UI with latest fuel data
    updateFuelDisplay(fuelData);
  }, intervalMs);
}
```

---

## Additional Notes

- Fuel level is stored as a **percentage (0-100%)** in the database
- Fuel amounts in liters are calculated based on the tank capacity
- Low fuel threshold is set at 10% of total drivable distance
- All distance values are in **kilometers**
- All fuel amounts are in **liters**
- Fuel efficiency is measured in **km/L** (kilometers per liter)

---

## Support

For issues or questions regarding the User-Motor API, please refer to the main API documentation or contact the development team.


