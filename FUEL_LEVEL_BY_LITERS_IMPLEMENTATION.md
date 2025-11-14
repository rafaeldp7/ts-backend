# Update Fuel Level by Liters - Implementation Guide

## Overview

This guide explains how to implement the `updateFuelLevelByLiters` controller, which allows updating a motor's fuel level by providing the amount in liters. The controller automatically converts liters to percentage based on the motorcycle's fuel tank capacity.

---

## Endpoint Details

### Update Fuel Level by Liters

**Endpoint:**
```
PUT /api/user-motors/:id/fuel/liters
```

**Method:** `PUT`

**URL Parameters:**
- `id` (required) - The UserMotor document ID

**Request Body:**
```json
{
  "liters": 10.5
}
```

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <token> (if authentication is required)
```

---

## Response Examples

### Success Response (200 OK)

```json
{
  "success": true,
  "msg": "Fuel level updated successfully from liters",
  "motor": {
    "_id": "507f1f77bcf86cd799439011",
    "nickname": "My Bike",
    "fuelLevel": {
      "liters": 10.5,
      "percentage": 70.0,
      "fuelTankCapacity": 15
    },
    "drivableDistance": {
      "withFullTank": 750.0,
      "withCurrentFuel": 525.0
    },
    "isLowFuel": false
  },
  "conversion": {
    "inputLiters": 10.5,
    "actualLiters": 10.5,
    "percentage": 70.0,
    "fuelTankCapacity": 15,
    "overflow": 0
  }
}
```

### Error Responses

#### 400 Bad Request - Invalid Input
```json
{
  "success": false,
  "msg": "liters must be a number"
}
```

#### 400 Bad Request - Negative Value
```json
{
  "success": false,
  "msg": "liters cannot be negative"
}
```

#### 400 Bad Request - Fuel Tank Capacity Not Set
```json
{
  "success": false,
  "msg": "Fuel tank capacity is not set for this motorcycle. Please set the fuel tank capacity first."
}
```

#### 404 Not Found - Motor Not Found
```json
{
  "success": false,
  "msg": "Motor not found"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "msg": "Failed to update fuel level in backend",
  "error": "Error message details"
}
```

---

## Frontend Implementation

### JavaScript/Fetch API

```javascript
/**
 * Update fuel level by liters
 * @param {string} motorId - The UserMotor document ID
 * @param {number} liters - Amount of fuel in liters
 * @returns {Promise<Object>} Updated motor data
 */
async function updateFuelLevelByLiters(motorId, liters) {
  try {
    const response = await fetch(`/api/user-motors/${motorId}/fuel/liters`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // Add authorization header if needed
        // 'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ liters })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.msg || 'Failed to update fuel level');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating fuel level:', error);
    throw error;
  }
}

// Usage example
updateFuelLevelByLiters('507f1f77bcf86cd799439011', 10.5)
  .then(data => {
    console.log('Fuel level updated:', data);
    console.log('New percentage:', data.motor.fuelLevel.percentage);
    console.log('Drivable distance:', data.motor.drivableDistance.withCurrentFuel);
  })
  .catch(error => {
    console.error('Error:', error.message);
  });
```

### React Hook Example

```javascript
import { useState } from 'react';

function useUpdateFuelLevelByLiters() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateFuelLevel = async (motorId, liters) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/user-motors/${motorId}/fuel/liters`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ liters })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to update fuel level');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateFuelLevel, loading, error };
}

// Usage in component
function FuelLevelForm({ motorId }) {
  const [liters, setLiters] = useState('');
  const { updateFuelLevel, loading, error } = useUpdateFuelLevelByLiters();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const litersValue = parseFloat(liters);
    if (isNaN(litersValue) || litersValue < 0) {
      alert('Please enter a valid number of liters');
      return;
    }

    try {
      const result = await updateFuelLevel(motorId, litersValue);
      alert(`Fuel level updated to ${result.motor.fuelLevel.percentage}%`);
      setLiters('');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          Fuel Amount (Liters):
          <input
            type="number"
            step="0.1"
            min="0"
            value={liters}
            onChange={(e) => setLiters(e.target.value)}
            required
          />
        </label>
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'Updating...' : 'Update Fuel Level'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}
```

### React Component with Full UI

```javascript
import React, { useState } from 'react';

function FuelLevelUpdate({ motorId, currentFuelLevel, fuelTankCapacity, onUpdate }) {
  const [liters, setLiters] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const litersValue = parseFloat(liters);
    
    // Validation
    if (isNaN(litersValue)) {
      setError('Please enter a valid number');
      setLoading(false);
      return;
    }

    if (litersValue < 0) {
      setError('Liters cannot be negative');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/user-motors/${motorId}/fuel/liters`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ liters: litersValue })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Failed to update fuel level');
      }

      setSuccess(true);
      setLiters('');
      
      // Call callback if provided
      if (onUpdate) {
        onUpdate(data.motor);
      }

      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate estimated percentage for preview
  const estimatedPercentage = fuelTankCapacity && liters
    ? Math.min(100, Math.max(0, (parseFloat(liters) / fuelTankCapacity) * 100))
    : null;

  return (
    <div className="fuel-level-update">
      <h3>Update Fuel Level</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="liters">
            Fuel Amount (Liters):
          </label>
          <input
            id="liters"
            type="number"
            step="0.1"
            min="0"
            max={fuelTankCapacity || undefined}
            value={liters}
            onChange={(e) => setLiters(e.target.value)}
            placeholder="Enter liters"
            required
            disabled={loading}
          />
          {fuelTankCapacity && (
            <small>
              Tank capacity: {fuelTankCapacity}L
              {liters && estimatedPercentage !== null && (
                <span> → {estimatedPercentage.toFixed(1)}%</span>
              )}
            </small>
          )}
        </div>

        {error && (
          <div className="error-message" style={{ color: 'red', marginTop: '10px' }}>
            {error}
          </div>
        )}

        {success && (
          <div className="success-message" style={{ color: 'green', marginTop: '10px' }}>
            Fuel level updated successfully!
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading || !liters}
          className="submit-button"
        >
          {loading ? 'Updating...' : 'Update Fuel Level'}
        </button>
      </form>
    </div>
  );
}

export default FuelLevelUpdate;
```

### Axios Example

```javascript
import axios from 'axios';

/**
 * Update fuel level by liters using Axios
 */
async function updateFuelLevelByLiters(motorId, liters) {
  try {
    const response = await axios.put(
      `/api/user-motors/${motorId}/fuel/liters`,
      { liters },
      {
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`
        }
      }
    );

    return response.data;
  } catch (error) {
    if (error.response) {
      // Server responded with error status
      throw new Error(error.response.data.msg || 'Failed to update fuel level');
    } else if (error.request) {
      // Request made but no response
      throw new Error('No response from server');
    } else {
      // Error setting up request
      throw new Error(error.message);
    }
  }
}

// Usage
updateFuelLevelByLiters('507f1f77bcf86cd799439011', 10.5)
  .then(data => {
    console.log('Success:', data);
  })
  .catch(error => {
    console.error('Error:', error.message);
  });
```

---

## cURL Examples

### Basic Request

```bash
curl -X PUT http://localhost:5000/api/user-motors/507f1f77bcf86cd799439011/fuel/liters \
  -H "Content-Type: application/json" \
  -d '{"liters": 10.5}'
```

### With Authentication Token

```bash
curl -X PUT http://localhost:5000/api/user-motors/507f1f77bcf86cd799439011/fuel/liters \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"liters": 10.5}'
```

### Testing Different Scenarios

#### Normal Update
```bash
curl -X PUT http://localhost:5000/api/user-motors/507f1f77bcf86cd799439011/fuel/liters \
  -H "Content-Type: application/json" \
  -d '{"liters": 7.5}'
```

#### Full Tank (Overflow Handling)
```bash
curl -X PUT http://localhost:5000/api/user-motors/507f1f77bcf86cd799439011/fuel/liters \
  -H "Content-Type: application/json" \
  -d '{"liters": 20}'
# If tank capacity is 15L, this will be clamped to 100% (15L)
```

#### Empty Tank
```bash
curl -X PUT http://localhost:5000/api/user-motors/507f1f77bcf86cd799439011/fuel/liters \
  -H "Content-Type: application/json" \
  -d '{"liters": 0}'
```

---

## Response Data Structure

### Main Response Object

```typescript
interface UpdateFuelLevelResponse {
  success: boolean;
  msg: string;
  motor: {
    _id: string;
    nickname: string;
    fuelLevel: {
      liters: number;           // Actual liters (may be clamped)
      percentage: number;        // Calculated percentage (0-100)
      fuelTankCapacity: number;  // Tank capacity in liters
    };
    drivableDistance: {
      withFullTank: number;      // Maximum distance with full tank (km)
      withCurrentFuel: number;   // Distance with current fuel (km)
    };
    isLowFuel: boolean;          // True if fuel is below 10% threshold
  };
  conversion: {
    inputLiters: number;         // Original input value
    actualLiters: number;        // Actual liters stored (clamped if overflow)
    percentage: number;          // Calculated percentage
    fuelTankCapacity: number;    // Tank capacity
    overflow: number;            // Overflow amount if input > capacity
  };
}
```

---

## Conversion Logic

### Formula

```
percentage = (liters / fuelTankCapacity) * 100
```

### Examples

| Input Liters | Tank Capacity | Percentage | Overflow |
|--------------|---------------|------------|----------|
| 7.5          | 15            | 50%        | 0        |
| 10.5         | 15            | 70%        | 0        |
| 15           | 15            | 100%       | 0        |
| 20           | 15            | 100%       | 5        |

### Clamping

- If `liters > fuelTankCapacity`: Percentage is clamped to 100%
- If `liters < 0`: Returns 400 error (handled by validation)
- If `liters = 0`: Percentage is 0%

---

## Use Cases

### 1. After Refueling

```javascript
// User just refueled with 5 liters
await updateFuelLevelByLiters(motorId, 5);
```

### 2. Fuel Gauge Reading

```javascript
// Reading from fuel gauge sensor showing 8.3 liters
await updateFuelLevelByLiters(motorId, 8.3);
```

### 3. Manual Entry

```javascript
// User manually enters fuel amount
const userInput = prompt('Enter fuel amount in liters:');
const liters = parseFloat(userInput);
await updateFuelLevelByLiters(motorId, liters);
```

### 4. Batch Update from Fuel Logs

```javascript
// Update fuel level after logging fuel purchase
async function logFuelPurchase(motorId, purchaseLiters) {
  // Get current fuel level
  const currentFuel = await getMotorFuelLevel(motorId);
  const currentLiters = currentFuel.fuelLevel.liters;
  
  // Add purchased fuel
  const newTotalLiters = currentLiters + purchaseLiters;
  
  // Update fuel level
  await updateFuelLevelByLiters(motorId, newTotalLiters);
}
```

---

## Error Handling Best Practices

### 1. Validate Input Before Sending

```javascript
function validateLiters(liters) {
  if (typeof liters !== 'number' || isNaN(liters)) {
    return { valid: false, error: 'Liters must be a number' };
  }
  if (liters < 0) {
    return { valid: false, error: 'Liters cannot be negative' };
  }
  return { valid: true };
}

// Usage
const validation = validateLiters(userInput);
if (!validation.valid) {
  alert(validation.error);
  return;
}
```

### 2. Handle API Errors Gracefully

```javascript
async function updateFuelWithErrorHandling(motorId, liters) {
  try {
    const result = await updateFuelLevelByLiters(motorId, liters);
    return { success: true, data: result };
  } catch (error) {
    // Handle specific error cases
    if (error.message.includes('not set')) {
      return {
        success: false,
        error: 'TANK_CAPACITY_NOT_SET',
        message: 'Please set the fuel tank capacity first'
      };
    }
    if (error.message.includes('not found')) {
      return {
        success: false,
        error: 'MOTOR_NOT_FOUND',
        message: 'Motor not found'
      };
    }
    return {
      success: false,
      error: 'UNKNOWN_ERROR',
      message: error.message
    };
  }
}
```

### 3. Show User-Friendly Messages

```javascript
function getErrorMessage(error) {
  const errorMessages = {
    'TANK_CAPACITY_NOT_SET': 'Please configure the fuel tank capacity for this motorcycle first.',
    'MOTOR_NOT_FOUND': 'Motor not found. Please refresh and try again.',
    'INVALID_INPUT': 'Please enter a valid number of liters.',
    'NEGATIVE_VALUE': 'Fuel amount cannot be negative.'
  };
  
  return errorMessages[error] || 'An error occurred. Please try again.';
}
```

---

## Integration with Existing Endpoints

### Comparison with Percentage-Based Update

| Feature | `PUT /:id/fuel` (Percentage) | `PUT /:id/fuel/liters` (Liters) |
|---------|------------------------------|----------------------------------|
| Input | Percentage (0-100) | Liters (0 to capacity) |
| Use Case | Manual percentage entry | Real-world fuel amounts |
| Conversion | None | Auto-converts to percentage |
| Overflow Handling | N/A | Clamps to 100% |
| Response | Basic | Includes conversion details |

### When to Use Each

**Use Percentage Endpoint (`PUT /:id/fuel`):**
- When you have a percentage value directly
- For UI sliders/bars showing percentage
- When working with fuel gauge percentages

**Use Liters Endpoint (`PUT /:id/fuel/liters`):**
- When you have actual fuel amount in liters
- After refueling (you know how many liters you added)
- When reading from fuel sensors
- When calculating from fuel logs

---

## Testing

### Unit Test Example (Jest)

```javascript
describe('updateFuelLevelByLiters', () => {
  it('should convert liters to percentage correctly', async () => {
    const motorId = 'test-motor-id';
    const liters = 7.5;
    const tankCapacity = 15;
    
    // Mock the API call
    const result = await updateFuelLevelByLiters(motorId, liters);
    
    expect(result.success).toBe(true);
    expect(result.motor.fuelLevel.percentage).toBe(50);
    expect(result.motor.fuelLevel.liters).toBe(7.5);
  });

  it('should handle overflow correctly', async () => {
    const motorId = 'test-motor-id';
    const liters = 20; // More than tank capacity
    const tankCapacity = 15;
    
    const result = await updateFuelLevelByLiters(motorId, liters);
    
    expect(result.motor.fuelLevel.percentage).toBe(100);
    expect(result.conversion.overflow).toBe(5);
  });

  it('should reject negative values', async () => {
    const motorId = 'test-motor-id';
    const liters = -5;
    
    await expect(updateFuelLevelByLiters(motorId, liters))
      .rejects.toThrow('liters cannot be negative');
  });
});
```

---

## Summary

The `updateFuelLevelByLiters` endpoint provides a convenient way to update fuel levels using real-world liter values. It automatically handles conversion to percentage, overflow protection, and calculates all derived values (drivable distance, low fuel alerts, etc.).

**Key Benefits:**
- ✅ Natural input format (liters instead of percentage)
- ✅ Automatic conversion and validation
- ✅ Overflow protection
- ✅ Comprehensive response with conversion details
- ✅ Calculates all derived fields automatically

**Quick Start:**
```javascript
// Simple usage
const result = await updateFuelLevelByLiters(motorId, 10.5);
console.log(`Fuel level: ${result.motor.fuelLevel.percentage}%`);
```

---

**Last Updated:** Current  
**Endpoint:** `PUT /api/user-motors/:id/fuel/liters`  
**Controller:** `updateFuelLevelByLiters` in `controllers/userMotorController.js`

