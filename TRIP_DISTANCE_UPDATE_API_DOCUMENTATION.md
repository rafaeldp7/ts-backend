# Trip Distance Update API - Complete Documentation

## Overview

This guide provides complete documentation for the Trip Distance Update API endpoint. This endpoint allows real-time tracking of distance traveled during an active trip and automatically updates the motor's fuel level based on actual distance traveled using direct consumption-based logic.

**Key Features:**
- Real-time distance tracking during active trips
- Automatic fuel level calculation based on actual distance traveled
- Direct consumption-based fuel calculation (km/L)
- Low fuel warning system
- Performance optimization (skips tiny distance updates)

---

## Table of Contents

1. [API Endpoint](#api-endpoint)
2. [Base URL](#base-url)
3. [Authentication](#authentication)
4. [Update Distance and Fuel](#update-distance-and-fuel)
5. [Request Body Schema](#request-body-schema)
6. [Response Schema](#response-schema)
7. [Error Handling](#error-handling)
8. [Core Logic & Calculations](#core-logic--calculations)
9. [Validation Rules](#validation-rules)
10. [Example Usage](#example-usage)
11. [Integration Guide](#integration-guide)
12. [Performance Considerations](#performance-considerations)

---

## Base URL

```
/api/trip
```

---

## Authentication

This endpoint can work with or without authentication. When authentication is available, you may want to verify that the `userMotorId` belongs to the authenticated user for security purposes.

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

## Update Distance and Fuel

### Endpoint Description

**Purpose:** Updates the distance traveled during an active trip and automatically calculates and updates the motor's fuel level based on the actual distance traveled. This endpoint uses direct consumption-based logic to determine fuel usage.

**When to Use:** Use this endpoint when:
- User is actively driving and you need to track distance in real-time
- You want to automatically update fuel levels based on actual distance traveled
- You need to monitor fuel consumption during a trip
- You want to trigger low fuel warnings when fuel is running low
- You're implementing periodic distance tracking (e.g., every 5 seconds)

**Frequency:** This endpoint should be called periodically (recommended: every 5 seconds) while the user is driving during an active trip.

### Request Method and URL

**HTTP Method:** `POST`

**Endpoint URL:**
```
POST /api/trip/update-distance
```

### Input Parameters

**Request Body (JSON):**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userMotorId` | string | Yes | The MongoDB ObjectId of the UserMotor document |
| `totalDistanceTraveled` | number | Yes | Total distance traveled since trip start (in kilometers) |
| `lastPostedDistance` | number | Yes | The last posted distance value (in kilometers) |

**Validation Rules:**
- `userMotorId` must be a valid MongoDB ObjectId format
- `userMotorId` must exist in the database
- `totalDistanceTraveled` must be a positive number
- `lastPostedDistance` must be a positive number
- `totalDistanceTraveled` must be greater than or equal to `lastPostedDistance`
- The UserMotor must have an associated Motorcycle with `fuelConsumption` and `fuelTank` set

### Request Body Schema

```json
{
  "userMotorId": "507f1f77bcf86cd799439011",
  "totalDistanceTraveled": 120.5,
  "lastPostedDistance": 118.0
}
```

**Field Descriptions:**

- **`userMotorId`** (string, required): The unique identifier of the UserMotor document. This links the distance update to a specific user's motorcycle.

- **`totalDistanceTraveled`** (number, required): The cumulative distance traveled since the trip started, measured in kilometers. This should be the current total distance from your GPS tracking or odometer reading.

- **`lastPostedDistance`** (number, required): The last distance value that was successfully posted to this endpoint. This is used to calculate the incremental distance (`actualDistanceTraveled = totalDistanceTraveled - lastPostedDistance`).

---

## Response Schema

### Success Response (200 OK)

**Standard Success Response:**
```json
{
  "success": true,
  "userMotorId": "507f1f77bcf86cd799439011",
  "actualDistanceTraveled": 2.5,
  "fuelUsedLiters": 0.045,
  "fuelUsedPercent": 0.56,
  "newFuelLevel": 72.4,
  "lowFuelWarning": false,
  "totalDrivableDistanceWithCurrentGas": 450.2
}
```

**Skipped Response (200 OK - Distance Too Small):**
```json
{
  "success": true,
  "status": "skipped",
  "reason": "Distance too small to update",
  "actualDistanceTraveled": 0.005
}
```

**Response Fields:**

| Field | Type | Description | Units |
|-------|------|-------------|-------|
| `success` | boolean | Indicates if the request was successful | - |
| `userMotorId` | string | The UserMotor document ID | - |
| `actualDistanceTraveled` | number | Distance traveled since last update | kilometers |
| `fuelUsedLiters` | number | Amount of fuel consumed in liters | liters |
| `fuelUsedPercent` | number | Percentage of tank consumed | percentage |
| `newFuelLevel` | number | Updated fuel level after consumption | 0-100% |
| `lowFuelWarning` | boolean | Whether fuel level is low (≤ 10%) | - |
| `totalDrivableDistanceWithCurrentGas` | number | Remaining drivable distance with current fuel | kilometers |
| `status` | string | Status indicator (only present when skipped) | - |
| `reason` | string | Reason for skipping (only present when skipped) | - |

**Notes:**
- All numeric values are rounded to 2-4 decimal places for readability
- `newFuelLevel` is clamped to a valid range (0-100%)
- `lowFuelWarning` is `true` when `newFuelLevel ≤ 10%`
- `totalDrivableDistanceWithCurrentGas` is calculated as: `fuelConsumption × fuelTank × (newFuelLevel / 100)`

---

## Error Handling

### Error Response (400 Bad Request)

**Missing userMotorId:**
```json
{
  "success": false,
  "message": "userMotorId is required"
}
```

**Missing Distance Values:**
```json
{
  "success": false,
  "message": "totalDistanceTraveled and lastPostedDistance are required"
}
```

**Invalid Distance (actualDistanceTraveled ≤ 0):**
```json
{
  "success": false,
  "message": "actualDistanceTraveled must be greater than 0",
  "actualDistanceTraveled": -0.5
}
```

**Missing Motorcycle Data:**
```json
{
  "success": false,
  "message": "Motorcycle fuelConsumption and fuelTank must be set"
}
```

### Error Response (404 Not Found)

**UserMotor Not Found:**
```json
{
  "success": false,
  "message": "UserMotor not found"
}
```

**Motorcycle Data Not Found:**
```json
{
  "success": false,
  "message": "Motorcycle data not found for this UserMotor"
}
```

### Error Response (500 Internal Server Error)

**Server Error:**
```json
{
  "success": false,
  "message": "Failed to update distance and fuel level",
  "error": "Error details here"
}
```

### Possible Errors Summary

| HTTP Status Code | Error Message | Description |
|------------------|---------------|-------------|
| 400 | "userMotorId is required" | The userMotorId field is missing from the request body |
| 400 | "totalDistanceTraveled and lastPostedDistance are required" | One or both distance fields are missing |
| 400 | "actualDistanceTraveled must be greater than 0" | The calculated distance is negative or zero |
| 400 | "Motorcycle fuelConsumption and fuelTank must be set" | The motorcycle lacks required fuel data |
| 404 | "UserMotor not found" | The provided userMotorId does not exist |
| 404 | "Motorcycle data not found for this UserMotor" | The UserMotor exists but has no associated Motorcycle |
| 500 | "Failed to update distance and fuel level" | Server error occurred while processing |

---

## Core Logic & Calculations

### Step-by-Step Calculation Process

1. **Calculate Actual Distance Traveled:**
   ```
   actualDistanceTraveled = totalDistanceTraveled - lastPostedDistance
   ```

2. **Retrieve Motor Data:**
   - Fetch UserMotor by `userMotorId`
   - Populate the associated Motorcycle document
   - Access `motorcycle.fuelConsumption` (km/L)
   - Access `motorcycle.fuelTank` (L)
   - Access `userMotor.currentFuelLevel` (percentage 0-100%)

3. **Calculate Total Drivable Distance (Reference):**
   ```
   totalDrivableDistanceWithCurrentGas = 
     motorcycle.fuelConsumption × motorcycle.fuelTank × (currentFuelLevel / 100)
   ```

4. **Calculate Fuel Used:**
   ```
   fuelUsedLiters = actualDistanceTraveled / motorcycle.fuelConsumption
   ```

5. **Convert Fuel Used to Percentage:**
   ```
   fuelUsedPercent = (fuelUsedLiters / motorcycle.fuelTank) × 100
   ```

6. **Update Fuel Level:**
   ```
   newFuelLevel = Math.max(0, Math.min(100, currentFuelLevel - fuelUsedPercent))
   ```

7. **Check Low Fuel Warning:**
   ```
   lowFuelWarning = newFuelLevel ≤ 10
   ```

### Example Calculation

**Given:**
- `totalDistanceTraveled`: 120.5 km
- `lastPostedDistance`: 118.0 km
- `currentFuelLevel`: 75.0%
- `fuelConsumption`: 55 km/L
- `fuelTank`: 12 L

**Calculation:**
1. `actualDistanceTraveled = 120.5 - 118.0 = 2.5 km`
2. `fuelUsedLiters = 2.5 / 55 = 0.045 L`
3. `fuelUsedPercent = (0.045 / 12) × 100 = 0.375%`
4. `newFuelLevel = 75.0 - 0.375 = 74.625%` (rounded to 74.63%)
5. `lowFuelWarning = false` (74.63% > 10%)
6. `totalDrivableDistanceWithCurrentGas = 55 × 12 × (74.625 / 100) = 492.375 km`

---

## Validation Rules

### Input Validation

1. **userMotorId Validation:**
   - Must be provided
   - Must be a valid MongoDB ObjectId format
   - Must exist in the database

2. **Distance Validation:**
   - `totalDistanceTraveled` must be provided and be a positive number
   - `lastPostedDistance` must be provided and be a positive number
   - `actualDistanceTraveled` must be greater than 0
   - If `actualDistanceTraveled < 0.01 km`, the update is skipped (performance optimization)

3. **Motorcycle Data Validation:**
   - UserMotor must exist
   - UserMotor must have an associated Motorcycle
   - Motorcycle must have `fuelConsumption` set (km/L)
   - Motorcycle must have `fuelTank` set (L)

4. **Fuel Level Validation:**
   - Fuel level is automatically clamped to valid range (0-100%)
   - Negative fuel levels are prevented
   - Fuel levels above 100% are prevented

### Performance Optimizations

- **Distance Threshold:** Updates are skipped if `actualDistanceTraveled < 0.01 km` to reduce unnecessary database writes
- **Efficient Queries:** Uses `.populate()` to fetch related Motorcycle data in a single query
- **Precision Control:** Numeric values are rounded to prevent floating-point precision issues

---

## Example Usage

### JavaScript/TypeScript Example

```javascript
// Using fetch API
async function updateTripDistance(userMotorId, totalDistance, lastPostedDistance) {
  try {
    const response = await fetch('/api/trip/update-distance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // if authentication is required
      },
      body: JSON.stringify({
        userMotorId: userMotorId,
        totalDistanceTraveled: totalDistance,
        lastPostedDistance: lastPostedDistance
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update distance');
    }

    const data = await response.json();
    
    // Handle skipped updates
    if (data.status === 'skipped') {
      console.log(`Update skipped: ${data.reason}`);
      return null;
    }
    
    // Interpret the response
    console.log(`Distance traveled: ${data.actualDistanceTraveled} km`);
    console.log(`Fuel used: ${data.fuelUsedLiters} L (${data.fuelUsedPercent}%)`);
    console.log(`New fuel level: ${data.newFuelLevel}%`);
    console.log(`Remaining distance: ${data.totalDrivableDistanceWithCurrentGas} km`);
    
    if (data.lowFuelWarning) {
      console.warn('⚠️ Low fuel warning! Please refuel soon.');
      // Trigger UI notification
      showLowFuelAlert();
    }
    
    return data;
  } catch (error) {
    console.error('Error updating distance:', error);
    throw error;
  }
}

// Usage in trip tracking loop
let lastPostedDistance = 0;
const updateInterval = 5000; // 5 seconds

setInterval(async () => {
  const currentTotalDistance = getCurrentTripDistance(); // Your GPS tracking function
  if (currentTotalDistance > lastPostedDistance) {
    const result = await updateTripDistance(
      '507f1f77bcf86cd799439011',
      currentTotalDistance,
      lastPostedDistance
    );
    
    if (result && result.success) {
      lastPostedDistance = currentTotalDistance; // Update for next iteration
      updateUI(result); // Update your UI with new data
    }
  }
}, updateInterval);
```

### Axios Example

```javascript
import axios from 'axios';

async function updateTripDistance(userMotorId, totalDistance, lastPostedDistance) {
  try {
    const response = await axios.post('/api/trip/update-distance', {
      userMotorId: userMotorId,
      totalDistanceTraveled: totalDistance,
      lastPostedDistance: lastPostedDistance
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = response.data;
    
    if (data.success && !data.status) {
      return {
        distance: data.actualDistanceTraveled,
        fuelUsed: data.fuelUsedLiters,
        fuelLevel: data.newFuelLevel,
        remainingDistance: data.totalDrivableDistanceWithCurrentGas,
        isLowFuel: data.lowFuelWarning
      };
    }
    
    return null; // Skipped update
  } catch (error) {
    if (error.response) {
      console.error('Error:', error.response.data.message);
    } else {
      console.error('Request failed:', error.message);
    }
    throw error;
  }
}
```

### React Hook Example

```javascript
import { useState, useEffect, useRef } from 'react';

function useTripDistanceTracker(userMotorId, isTripActive) {
  const [distanceData, setDistanceData] = useState(null);
  const [error, setError] = useState(null);
  const lastPostedDistanceRef = useRef(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!isTripActive || !userMotorId) return;

    const updateDistance = async () => {
      try {
        // Get current total distance from your GPS tracking
        const currentTotalDistance = await getCurrentTripDistance();
        
        if (currentTotalDistance <= lastPostedDistanceRef.current) {
          return; // No new distance to report
        }

        const response = await fetch('/api/trip/update-distance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            userMotorId: userMotorId,
            totalDistanceTraveled: currentTotalDistance,
            lastPostedDistance: lastPostedDistanceRef.current
          })
        });

        if (!response.ok) {
          throw new Error('Failed to update distance');
        }

        const data = await response.json();
        
        if (data.success && !data.status) {
          lastPostedDistanceRef.current = currentTotalDistance;
          setDistanceData(data);
          setError(null);
          
          // Handle low fuel warning
          if (data.lowFuelWarning) {
            // Trigger notification or alert
            showNotification('Low fuel warning! Please refuel soon.');
          }
        }
      } catch (err) {
        setError(err.message);
        console.error('Error updating distance:', err);
      }
    };

    // Update every 5 seconds
    intervalRef.current = setInterval(updateDistance, 5000);
    
    // Initial update
    updateDistance();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [userMotorId, isTripActive]);

  return { distanceData, error };
}

// Usage in component
function TripTracker({ userMotorId, isTripActive }) {
  const { distanceData, error } = useTripDistanceTracker(userMotorId, isTripActive);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      {distanceData && (
        <>
          <p>Distance: {distanceData.actualDistanceTraveled} km</p>
          <p>Fuel Level: {distanceData.newFuelLevel}%</p>
          <p>Remaining Distance: {distanceData.totalDrivableDistanceWithCurrentGas} km</p>
          {distanceData.lowFuelWarning && (
            <p className="warning">⚠️ Low Fuel Warning!</p>
          )}
        </>
      )}
    </div>
  );
}
```

### cURL Example

```bash
# Update distance and fuel during active trip
curl -X POST "http://localhost:5000/api/trip/update-distance" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "userMotorId": "507f1f77bcf86cd799439011",
    "totalDistanceTraveled": 120.5,
    "lastPostedDistance": 118.0
  }'
```

### React Native Example

```javascript
import { useEffect, useRef } from 'react';
import Geolocation from '@react-native-community/geolocation';

function useTripDistanceTracking(userMotorId, isTripActive) {
  const lastLocationRef = useRef(null);
  const totalDistanceRef = useRef(0);
  const lastPostedDistanceRef = useRef(0);
  const watchIdRef = useRef(null);

  useEffect(() => {
    if (!isTripActive || !userMotorId) return;

    watchIdRef.current = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const currentLocation = { latitude, longitude };

        if (lastLocationRef.current) {
          // Calculate distance between last and current location
          const distance = calculateDistance(
            lastLocationRef.current,
            currentLocation
          );
          totalDistanceRef.current += distance;
        }

        lastLocationRef.current = currentLocation;
      },
      (error) => console.error('GPS Error:', error),
      { enableHighAccuracy: true, distanceFilter: 10 }
    );

    // Update distance every 5 seconds
    const updateInterval = setInterval(async () => {
      if (totalDistanceRef.current > lastPostedDistanceRef.current) {
        try {
          const response = await fetch('http://your-api.com/api/trip/update-distance', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              userMotorId: userMotorId,
              totalDistanceTraveled: totalDistanceRef.current,
              lastPostedDistance: lastPostedDistanceRef.current
            })
          });

          const data = await response.json();
          if (data.success && !data.status) {
            lastPostedDistanceRef.current = totalDistanceRef.current;
          }
        } catch (error) {
          console.error('Update error:', error);
        }
      }
    }, 5000);

    return () => {
      if (watchIdRef.current) {
        Geolocation.clearWatch(watchIdRef.current);
      }
      clearInterval(updateInterval);
    };
  }, [userMotorId, isTripActive]);
}
```

---

## Integration Guide

### Step 1: Initialize Trip Tracking

```javascript
// When trip starts
let tripData = {
  userMotorId: selectedMotorId,
  startTime: new Date(),
  lastPostedDistance: 0,
  totalDistanceTraveled: 0
};
```

### Step 2: Set Up Periodic Updates

```javascript
// Update every 5 seconds during active trip
const updateInterval = setInterval(async () => {
  const currentDistance = getCurrentTripDistance(); // Your GPS tracking
  
  if (currentDistance > tripData.lastPostedDistance) {
    const result = await updateTripDistance(
      tripData.userMotorId,
      currentDistance,
      tripData.lastPostedDistance
    );
    
    if (result && result.success) {
      tripData.lastPostedDistance = currentDistance;
      updateFuelGauge(result.newFuelLevel);
      
      if (result.lowFuelWarning) {
        showLowFuelAlert();
      }
    }
  }
}, 5000);
```

### Step 3: Handle Trip End

```javascript
// When trip ends
clearInterval(updateInterval);

// Final update
await updateTripDistance(
  tripData.userMotorId,
  tripData.totalDistanceTraveled,
  tripData.lastPostedDistance
);
```

### Step 4: Error Handling

```javascript
try {
  const result = await updateTripDistance(...);
} catch (error) {
  if (error.message.includes('UserMotor not found')) {
    // Handle invalid motor ID
  } else if (error.message.includes('Motorcycle data not found')) {
    // Handle missing motorcycle data
  } else {
    // Handle other errors
    console.error('Update failed:', error);
  }
}
```

---

## Performance Considerations

### Recommended Update Frequency

- **Optimal:** Every 5 seconds during active trips
- **Minimum:** Every 10 seconds (may miss some distance)
- **Maximum:** Every 1 second (may cause unnecessary load)

### Best Practices

1. **Track Distance Locally First:**
   - Calculate distance incrementally on the client side
   - Only send updates when distance changes significantly

2. **Handle Skipped Updates:**
   - Don't treat skipped updates as errors
   - They're normal when distance change is too small

3. **Error Recovery:**
   - Implement retry logic for network failures
   - Store pending updates locally if offline

4. **Battery Optimization:**
   - Use appropriate GPS update intervals
   - Consider reducing update frequency when vehicle is stationary

5. **Network Optimization:**
   - Batch updates if possible (though this endpoint expects individual updates)
   - Use compression for request/response if needed

---

## Additional Notes

- **Fuel Level Storage:** Fuel level is stored as a percentage (0-100%) in the database
- **Distance Units:** All distances are in kilometers
- **Fuel Units:** All fuel amounts are in liters
- **Fuel Efficiency:** Fuel consumption is measured in km/L (kilometers per liter)
- **Low Fuel Threshold:** Low fuel warning triggers at ≤ 10% fuel level
- **Distance Threshold:** Updates are skipped if distance change < 0.01 km
- **Precision:** All numeric values are rounded to 2-4 decimal places

---

## Support

For issues or questions regarding the Trip Distance Update API, please refer to the main API documentation or contact the development team.

---

## Future Enhancements

The following features are planned for future versions:

1. **Automatic Trip Logger:** Create a TripLog model to record each incremental update for detailed trip analytics
2. **Distance Threshold Logic:** Enhanced logic for handling very small distance changes
3. **Low Fuel Alert:** Integration with push notifications for low fuel warnings
4. **Auto Trip Summary:** Automatic generation of trip summaries when trips end
5. **Analytics Extension:** Fuel cost estimation, CO₂ emission tracking, and monthly consumption summaries

---

## Changelog

### Version 1.0.0 (Current)
- Initial release
- Real-time distance tracking
- Automatic fuel level updates
- Low fuel warning system
- Performance optimizations

