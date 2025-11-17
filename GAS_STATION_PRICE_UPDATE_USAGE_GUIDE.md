# PUT /api/gas-stations/:id/price - Usage Guide

Complete guide for updating gas station fuel prices.

---

## 📋 Quick Reference

**Endpoint:** `PUT /api/gas-stations/:id/price`  
**Authentication:** Optional (no token required, but recommended for tracking)  
**Content-Type:** `application/json`

---

## 🎯 What This Endpoint Does

Updates the price of a specific fuel type for a gas station. The system automatically:
- ✅ Updates the current price
- ✅ Tracks price changes in history
- ✅ Records who made the update (if authenticated)
- ✅ Returns updated station data

---

## 📝 Request Format

### URL Structure
```
PUT /api/gas-stations/{stationId}/price
```

### Path Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `id` | string | Yes | Gas Station MongoDB ObjectId | `507f1f77bcf86cd799439011` |

### Request Headers

**Required:**
```
Content-Type: application/json
```

**Optional (for user tracking):**
```
Authorization: Bearer <your-jwt-token>
```

### Request Body

```json
{
  "fuelType": "gasoline",
  "newPrice": 65.50
}
```

**Request Body Fields:**

| Field | Type | Required | Description | Valid Values |
|-------|------|----------|-------------|--------------|
| `fuelType` | string | ✅ Yes | Type of fuel to update | `gasoline`, `diesel`, `premium_gasoline`, `premium_diesel`, `lpg` |
| `newPrice` | number | ✅ Yes | New price per liter (PHP) | Must be ≥ 0 |

**Valid Fuel Types:**
- `gasoline` - Regular gasoline
- `diesel` - Diesel fuel
- `premium_gasoline` - Premium gasoline
- `premium_diesel` - Premium diesel
- `lpg` - Liquefied Petroleum Gas

---

## ✅ Success Response

**Status Code:** `200 OK`

### Response Structure

```json
{
  "success": true,
  "message": "Price updated successfully",
  "data": {
    "station": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Shell Station",
      "prices": [
        {
          "fuelType": "gasoline",
          "price": 65.50,
          "currency": "PHP",
          "lastUpdated": "2024-01-15T10:30:00.000Z"
        },
        {
          "fuelType": "diesel",
          "price": 62.00,
          "currency": "PHP",
          "lastUpdated": "2024-01-15T09:00:00.000Z"
        }
      ],
      "priceHistory": [
        {
          "fuelType": "gasoline",
          "oldPrice": 64.50,
          "newPrice": 65.50,
          "updatedBy": {
            "_id": "507f1f77bcf86cd799439012",
            "name": "John Doe",
            "email": "john@example.com"
          },
          "updatedAt": "2024-01-15T10:30:00.000Z"
        }
      ],
      "lastUpdated": "2024-01-15T10:30:00.000Z"
    },
    "update": {
      "fuelType": "gasoline",
      "oldPrice": 64.50,
      "newPrice": 65.50,
      "changed": true
    }
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Always `true` on success |
| `message` | string | Success message |
| `data.station` | object | Updated gas station object |
| `data.station.prices` | array | All current prices for the station |
| `data.station.priceHistory` | array | Last 10 price history entries |
| `data.update` | object | Summary of the update |
| `data.update.oldPrice` | number\|null | Previous price (null if new fuel type) |
| `data.update.newPrice` | number | New price that was set |
| `data.update.changed` | boolean | `true` if price actually changed |

**Note:** `updatedBy` in `priceHistory` can be `null` if the update was made without authentication.

---

## ❌ Error Responses

### 400 Bad Request - Missing Fields

```json
{
  "success": false,
  "message": "fuelType and newPrice are required"
}
```

**Cause:** Missing `fuelType` or `newPrice` in request body.

---

### 400 Bad Request - Invalid Fuel Type

```json
{
  "success": false,
  "message": "Invalid fuelType. Must be one of: gasoline, diesel, premium_gasoline, premium_diesel, lpg"
}
```

**Cause:** `fuelType` value is not one of the valid options.

---

### 400 Bad Request - Invalid Price

```json
{
  "success": false,
  "message": "newPrice must be a positive number"
}
```

**Cause:** `newPrice` is not a number or is negative.

---

### 404 Not Found - Gas Station Not Found

```json
{
  "success": false,
  "message": "Gas station not found"
}
```

**Cause:** The gas station ID doesn't exist in the database.

---

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Server error updating gas price",
  "error": "Error details (only in development)"
}
```

**Cause:** Server-side error occurred.

---

## 💻 Usage Examples

### JavaScript/Fetch (No Authentication)

```javascript
async function updateGasPrice(stationId, fuelType, newPrice) {
  try {
    const response = await fetch(
      `http://your-api-url/api/gas-stations/${stationId}/price`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fuelType: fuelType,
          newPrice: newPrice
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update price');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error updating gas price:', error);
    throw error;
  }
}

// Usage
updateGasPrice('507f1f77bcf86cd799439011', 'gasoline', 65.50)
  .then(result => {
    console.log('✅ Price updated:', result.data.update);
    console.log('Old price:', result.data.update.oldPrice);
    console.log('New price:', result.data.update.newPrice);
  })
  .catch(error => {
    console.error('❌ Update failed:', error.message);
  });
```

---

### JavaScript/Fetch (With Authentication)

```javascript
async function updateGasPriceWithAuth(stationId, fuelType, newPrice, token) {
  try {
    const response = await fetch(
      `http://your-api-url/api/gas-stations/${stationId}/price`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fuelType: fuelType,
          newPrice: newPrice
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update price');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error updating gas price:', error);
    throw error;
  }
}

// Usage
const token = 'your-jwt-token';
updateGasPriceWithAuth('507f1f77bcf86cd799439011', 'gasoline', 65.50, token)
  .then(result => {
    console.log('✅ Price updated by:', result.data.station.priceHistory[0].updatedBy.name);
  });
```

---

### React/TypeScript Example

```typescript
import { useState } from 'react';

interface UpdatePriceRequest {
  fuelType: 'gasoline' | 'diesel' | 'premium_gasoline' | 'premium_diesel' | 'lpg';
  newPrice: number;
}

interface PriceUpdateResponse {
  success: boolean;
  message: string;
  data: {
    station: {
      _id: string;
      name: string;
      prices: Array<{
        fuelType: string;
        price: number;
        currency: string;
        lastUpdated: string;
      }>;
      priceHistory: Array<{
        fuelType: string;
        oldPrice: number;
        newPrice: number;
        updatedBy: {
          _id: string;
          name: string;
          email: string;
        } | null;
        updatedAt: string;
      }>;
    };
    update: {
      fuelType: string;
      oldPrice: number | null;
      newPrice: number;
      changed: boolean;
    };
  };
}

const GasPriceUpdater = ({ stationId, token }: { stationId: string; token?: string }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const updatePrice = async (fuelType: string, newPrice: number) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/gas-stations/${stationId}/price`,
        {
          method: 'PUT',
          headers,
          body: JSON.stringify({ fuelType, newPrice })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update price');
      }

      const result: PriceUpdateResponse = await response.json();
      setSuccess(true);
      console.log('Price updated:', result.data.update);
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => updatePrice('gasoline', 65.50)}
        disabled={loading}
      >
        {loading ? 'Updating...' : 'Update Gasoline Price'}
      </button>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">Price updated successfully!</div>}
    </div>
  );
};
```

---

### Axios Example

```javascript
import axios from 'axios';

const updateGasPrice = async (stationId, fuelType, newPrice, token = null) => {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios.put(
      `http://your-api-url/api/gas-stations/${stationId}/price`,
      {
        fuelType,
        newPrice
      },
      { headers }
    );

    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to update price');
    }
    throw error;
  }
};

// Usage
updateGasPrice('507f1f77bcf86cd799439011', 'gasoline', 65.50, 'your-token')
  .then(result => console.log('Success:', result))
  .catch(error => console.error('Error:', error.message));
```

---

### cURL Examples

**Without Authentication:**
```bash
curl -X PUT http://localhost:5000/api/gas-stations/507f1f77bcf86cd799439011/price \
  -H "Content-Type: application/json" \
  -d '{
    "fuelType": "gasoline",
    "newPrice": 65.50
  }'
```

**With Authentication:**
```bash
curl -X PUT http://localhost:5000/api/gas-stations/507f1f77bcf86cd799439011/price \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "fuelType": "gasoline",
    "newPrice": 65.50
  }'
```

---

### React Native Example

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://your-api-url/api';

export const updateGasPrice = async (stationId, fuelType, newPrice, token = null) => {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios.put(
      `${API_BASE_URL}/gas-stations/${stationId}/price`,
      {
        fuelType,
        newPrice
      },
      { headers }
    );

    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to update price');
    }
    throw error;
  }
};

// Usage in component
const handleUpdatePrice = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    const result = await updateGasPrice(
      '507f1f77bcf86cd799439011',
      'gasoline',
      65.50,
      token
    );
    Alert.alert('Success', `Price updated to ${result.data.update.newPrice} PHP`);
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};
```

---

## 🔍 Important Notes

### Authentication
- **Authentication is OPTIONAL** - The endpoint works without a token
- If you provide a token, your user info will be tracked in price history
- Without authentication, `updatedBy` will be `null` in the history
- **Recommendation:** Use authentication to track who made updates

### Price History
- Price changes are automatically tracked
- History is only added when the price **actually changes**
- If you update with the same price, `changed: false` is returned
- The response includes the last 10 history entries
- Each history entry includes:
  - Old price and new price
  - User who made the update (or `null` if anonymous)
  - Timestamp of the update

### Validation
- `fuelType` must be exactly one of: `gasoline`, `diesel`, `premium_gasoline`, `premium_diesel`, `lpg`
- `newPrice` must be a number (not a string)
- `newPrice` must be ≥ 0
- Gas station ID must be a valid MongoDB ObjectId

### Response Data
- The `update.changed` field tells you if the price actually changed
- If `oldPrice` is `null`, this is the first time this fuel type is being set
- The `station.prices` array contains ALL fuel types and their current prices
- The `station.priceHistory` array contains the last 10 price changes

---

## 🎯 Common Use Cases

### 1. Update Price (Anonymous)
```javascript
// User updates price without logging in
await updateGasPrice(stationId, 'gasoline', 65.50);
// Result: Price updated, updatedBy = null in history
```

### 2. Update Price (Authenticated)
```javascript
// User updates price while logged in
await updateGasPrice(stationId, 'gasoline', 65.50, userToken);
// Result: Price updated, updatedBy = user info in history
```

### 3. Check if Price Changed
```javascript
const result = await updateGasPrice(stationId, 'gasoline', 65.50);
if (result.data.update.changed) {
  console.log(`Price changed from ${result.data.update.oldPrice} to ${result.data.update.newPrice}`);
} else {
  console.log('Price unchanged');
}
```

### 4. Update Multiple Fuel Types
```javascript
// Update gasoline
await updateGasPrice(stationId, 'gasoline', 65.50, token);

// Update diesel
await updateGasPrice(stationId, 'diesel', 62.00, token);

// Update premium gasoline
await updateGasPrice(stationId, 'premium_gasoline', 68.00, token);
```

---

## 🐛 Troubleshooting

### Issue: "fuelType and newPrice are required"
**Solution:** Make sure you're sending both fields in the request body as JSON.

### Issue: "Invalid fuelType"
**Solution:** Check that `fuelType` is exactly one of: `gasoline`, `diesel`, `premium_gasoline`, `premium_diesel`, `lpg` (case-sensitive).

### Issue: "newPrice must be a positive number"
**Solution:** Ensure `newPrice` is a number (not a string) and is ≥ 0. Use `parseFloat()` if needed.

### Issue: "Gas station not found"
**Solution:** Verify the station ID is correct and exists in the database.

### Issue: Price not updating
**Solution:** Check the `update.changed` field in the response. If `false`, the price you're setting is the same as the current price.

---

## 📚 Related Endpoints

- **GET /api/gas-stations/:id/prices** - Get current prices
- **GET /api/gas-stations/:id/price-history** - Get price change history
- **GET /api/gas-stations/:id** - Get full gas station details

---

## ✅ Summary

**Endpoint:** `PUT /api/gas-stations/:id/price`  
**Auth:** Optional  
**Purpose:** Update fuel price for a gas station  
**Returns:** Updated station data with price history  

**Quick Example:**
```javascript
PUT /api/gas-stations/507f1f77bcf86cd799439011/price
Body: { "fuelType": "gasoline", "newPrice": 65.50 }
```

---

**Last Updated:** Current  
**Status:** ✅ Ready to use

