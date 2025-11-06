# Gas Price Update API - Frontend Integration Guide

## Overview

This guide provides complete documentation for updating gas prices at gas stations with automatic price history tracking. The API tracks which user updated each price and when, maintaining a complete audit trail.

---

## Table of Contents

1. [API Endpoints](#api-endpoints)
2. [Authentication](#authentication)
3. [Update Gas Price](#update-gas-price)
4. [Get Price History](#get-price-history)
5. [Frontend Integration Examples](#frontend-integration-examples)
6. [Error Handling](#error-handling)
7. [Data Models](#data-models)
8. [Best Practices](#best-practices)

---

## API Endpoints

### Base URL
```
/api/gas-stations
```

---

## Authentication

All price update endpoints require authentication. You must include a valid JWT token in the Authorization header.

**Header Format:**
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

## Update Gas Price

### Endpoint
```
PUT /api/gas-stations/:id/price
```

### Description
Updates the price of a specific fuel type for a gas station. Automatically tracks price changes in the price history.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Gas station ID |

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
| `fuelType` | string | Yes | Type of fuel | `gasoline`, `diesel`, `premium_gasoline`, `premium_diesel`, `lpg` |
| `newPrice` | number | Yes | New price per liter | Must be a positive number |

### Response

**Success Response (200 OK):**
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
          "price": 58.75,
          "currency": "PHP",
          "lastUpdated": "2024-01-15T09:15:00.000Z"
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

**Error Responses:**

| Status Code | Description | Response |
|-------------|-------------|----------|
| `400` | Bad Request | Missing or invalid fields |
| `401` | Unauthorized | Authentication required |
| `404` | Not Found | Gas station not found |
| `500` | Server Error | Internal server error |

---

## Get Price History

### Endpoint
```
GET /api/gas-stations/:id/price-history
```

### Description
Retrieves the price history for a gas station. Can be filtered by fuel type.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Gas station ID |

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `fuelType` | string | `null` | Filter by fuel type | `gasoline`, `diesel`, `premium_gasoline`, `premium_diesel`, `lpg` |
| `limit` | number | `50` | Maximum number of history entries to return |

### Response

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "stationId": "507f1f77bcf86cd799439011",
    "stationName": "Shell Station",
    "history": [
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
      },
      {
        "fuelType": "gasoline",
        "oldPrice": 63.50,
        "newPrice": 64.50,
        "updatedBy": {
          "_id": "507f1f77bcf86cd799439013",
          "name": "Jane Smith",
          "email": "jane@example.com"
        },
        "updatedAt": "2024-01-14T15:20:00.000Z"
      }
    ],
    "count": 2
  }
}
```

---

## Frontend Integration Examples

### React/JavaScript Example

#### 1. Update Gas Price

```javascript
// Update gas price function
const updateGasPrice = async (stationId, fuelType, newPrice, token) => {
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
          fuelType,
          newPrice
        })
      }
    );

    const result = await response.json();

    if (result.success) {
      console.log('Price updated successfully:', result.data);
      return result.data;
    } else {
      throw new Error(result.message || 'Failed to update price');
    }
  } catch (error) {
    console.error('Error updating gas price:', error);
    throw error;
  }
};

// Usage example
const handlePriceUpdate = async () => {
  try {
    const token = localStorage.getItem('token'); // Get token from storage
    const stationId = '507f1f77bcf86cd799439011';
    const fuelType = 'gasoline';
    const newPrice = 65.50;

    const result = await updateGasPrice(stationId, fuelType, newPrice, token);
    
    // Update UI with new price
    setCurrentPrice(result.update.newPrice);
    setPriceHistory(result.station.priceHistory);
    
    alert('Price updated successfully!');
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
};
```

#### 2. Get Price History

```javascript
// Get price history function
const getPriceHistory = async (stationId, fuelType = null, limit = 50) => {
  try {
    const queryParams = new URLSearchParams();
    if (fuelType) queryParams.append('fuelType', fuelType);
    queryParams.append('limit', limit);

    const response = await fetch(
      `http://your-api-url/api/gas-stations/${stationId}/price-history?${queryParams}`
    );

    const result = await response.json();

    if (result.success) {
      return result.data.history;
    } else {
      throw new Error(result.message || 'Failed to get price history');
    }
  } catch (error) {
    console.error('Error getting price history:', error);
    throw error;
  }
};

// Usage example
const loadPriceHistory = async () => {
  try {
    const stationId = '507f1f77bcf86cd799439011';
    const history = await getPriceHistory(stationId, 'gasoline', 20);
    
    setPriceHistory(history);
  } catch (error) {
    console.error('Error loading price history:', error);
  }
};
```

#### 3. React Component Example

```jsx
import React, { useState, useEffect } from 'react';

const GasPriceUpdate = ({ stationId, token }) => {
  const [fuelType, setFuelType] = useState('gasoline');
  const [newPrice, setNewPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [priceHistory, setPriceHistory] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(null);

  // Load current price and history on mount
  useEffect(() => {
    loadCurrentPrice();
    loadPriceHistory();
  }, [stationId, fuelType]);

  const loadCurrentPrice = async () => {
    try {
      const response = await fetch(
        `http://your-api-url/api/gas-stations/${stationId}`
      );
      const result = await response.json();
      
      const price = result.prices?.find(p => p.fuelType === fuelType);
      setCurrentPrice(price?.price || null);
    } catch (error) {
      console.error('Error loading current price:', error);
    }
  };

  const loadPriceHistory = async () => {
    try {
      const history = await getPriceHistory(stationId, fuelType, 10);
      setPriceHistory(history);
    } catch (error) {
      console.error('Error loading price history:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newPrice || parseFloat(newPrice) <= 0) {
      alert('Please enter a valid price');
      return;
    }

    setLoading(true);
    try {
      const result = await updateGasPrice(
        stationId,
        fuelType,
        parseFloat(newPrice),
        token
      );

      // Update UI
      setCurrentPrice(result.update.newPrice);
      setPriceHistory(result.station.priceHistory);
      setNewPrice('');
      
      alert('Price updated successfully!');
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gas-price-update">
      <h2>Update Gas Price</h2>
      
      {/* Current Price Display */}
      {currentPrice && (
        <div className="current-price">
          <p>Current {fuelType} price: <strong>₱{currentPrice.toFixed(2)}</strong></p>
        </div>
      )}

      {/* Update Form */}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="fuelType">Fuel Type:</label>
          <select
            id="fuelType"
            value={fuelType}
            onChange={(e) => setFuelType(e.target.value)}
            required
          >
            <option value="gasoline">Gasoline</option>
            <option value="diesel">Diesel</option>
            <option value="premium_gasoline">Premium Gasoline</option>
            <option value="premium_diesel">Premium Diesel</option>
            <option value="lpg">LPG</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="newPrice">New Price (₱):</label>
          <input
            type="number"
            id="newPrice"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            step="0.01"
            min="0"
            placeholder="Enter new price"
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update Price'}
        </button>
      </form>

      {/* Price History */}
      <div className="price-history">
        <h3>Price History</h3>
        {priceHistory.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Old Price</th>
                <th>New Price</th>
                <th>Updated By</th>
              </tr>
            </thead>
            <tbody>
              {priceHistory.map((entry, index) => (
                <tr key={index}>
                  <td>{new Date(entry.updatedAt).toLocaleString()}</td>
                  <td>₱{entry.oldPrice.toFixed(2)}</td>
                  <td>₱{entry.newPrice.toFixed(2)}</td>
                  <td>
                    {entry.updatedBy?.name || entry.updatedBy?.email || 'Unknown'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No price history available</p>
        )}
      </div>
    </div>
  );
};

export default GasPriceUpdate;
```

### Axios Example

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://your-api-url/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Update gas price
export const updateGasPrice = async (stationId, fuelType, newPrice) => {
  try {
    const response = await api.put(`/gas-stations/${stationId}/price`, {
      fuelType,
      newPrice
    });
    return response.data;
  } catch (error) {
    console.error('Error updating gas price:', error);
    throw error.response?.data || error;
  }
};

// Get price history
export const getPriceHistory = async (stationId, fuelType = null, limit = 50) => {
  try {
    const params = { limit };
    if (fuelType) params.fuelType = fuelType;
    
    const response = await api.get(`/gas-stations/${stationId}/price-history`, {
      params
    });
    return response.data;
  } catch (error) {
    console.error('Error getting price history:', error);
    throw error.response?.data || error;
  }
};

// Usage
const handleUpdate = async () => {
  try {
    const result = await updateGasPrice('station-id', 'gasoline', 65.50);
    console.log('Price updated:', result);
  } catch (error) {
    console.error('Update failed:', error);
  }
};
```

### Vue.js Example

```vue
<template>
  <div class="gas-price-update">
    <h2>Update Gas Price</h2>
    
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>Fuel Type:</label>
        <select v-model="fuelType" required>
          <option value="gasoline">Gasoline</option>
          <option value="diesel">Diesel</option>
          <option value="premium_gasoline">Premium Gasoline</option>
          <option value="premium_diesel">Premium Diesel</option>
          <option value="lpg">LPG</option>
        </select>
      </div>

      <div class="form-group">
        <label>New Price (₱):</label>
        <input
          type="number"
          v-model.number="newPrice"
          step="0.01"
          min="0"
          placeholder="Enter new price"
          required
        />
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Updating...' : 'Update Price' }}
      </button>
    </form>

    <div class="price-history" v-if="priceHistory.length > 0">
      <h3>Price History</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Old Price</th>
            <th>New Price</th>
            <th>Updated By</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(entry, index) in priceHistory" :key="index">
            <td>{{ formatDate(entry.updatedAt) }}</td>
            <td>₱{{ entry.oldPrice.toFixed(2) }}</td>
            <td>₱{{ entry.newPrice.toFixed(2) }}</td>
            <td>{{ entry.updatedBy?.name || 'Unknown' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    stationId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      fuelType: 'gasoline',
      newPrice: '',
      loading: false,
      priceHistory: []
    };
  },
  mounted() {
    this.loadPriceHistory();
  },
  methods: {
    async handleSubmit() {
      if (!this.newPrice || this.newPrice <= 0) {
        alert('Please enter a valid price');
        return;
      }

      this.loading = true;
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `http://your-api-url/api/gas-stations/${this.stationId}/price`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              fuelType: this.fuelType,
              newPrice: this.newPrice
            })
          }
        );

        const result = await response.json();
        
        if (result.success) {
          this.priceHistory = result.data.station.priceHistory;
          this.newPrice = '';
          alert('Price updated successfully!');
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        alert(`Error: ${error.message}`);
      } finally {
        this.loading = false;
      }
    },
    async loadPriceHistory() {
      try {
        const response = await fetch(
          `http://your-api-url/api/gas-stations/${this.stationId}/price-history?fuelType=${this.fuelType}&limit=10`
        );
        const result = await response.json();
        
        if (result.success) {
          this.priceHistory = result.data.history;
        }
      } catch (error) {
        console.error('Error loading price history:', error);
      }
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleString();
    }
  }
};
</script>
```

---

## Error Handling

### Common Error Scenarios

#### 1. Authentication Error (401)
```javascript
{
  "success": false,
  "message": "Authentication required. Please login."
}
```

**Solution:** Ensure the user is logged in and the token is valid.

#### 2. Validation Error (400)
```javascript
{
  "success": false,
  "message": "fuelType and newPrice are required"
}
```

**Solution:** Check that all required fields are provided and valid.

#### 3. Not Found Error (404)
```javascript
{
  "success": false,
  "message": "Gas station not found"
}
```

**Solution:** Verify the gas station ID is correct.

#### 4. Server Error (500)
```javascript
{
  "success": false,
  "message": "Server error updating gas price",
  "error": "Error details"
}
```

**Solution:** Check server logs and try again later.

### Error Handling Example

```javascript
const updateGasPriceWithErrorHandling = async (stationId, fuelType, newPrice, token) => {
  try {
    const response = await fetch(
      `http://your-api-url/api/gas-stations/${stationId}/price`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ fuelType, newPrice })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      // Handle different error status codes
      switch (response.status) {
        case 400:
          throw new Error(`Validation error: ${result.message}`);
        case 401:
          throw new Error('Please login to update prices');
        case 404:
          throw new Error('Gas station not found');
        case 500:
          throw new Error('Server error. Please try again later.');
        default:
          throw new Error(result.message || 'An error occurred');
      }
    }

    return result.data;
  } catch (error) {
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
};
```

---

## Data Models

### Price History Entry

```typescript
interface PriceHistoryEntry {
  fuelType: 'gasoline' | 'diesel' | 'premium_gasoline' | 'premium_diesel' | 'lpg';
  oldPrice: number;
  newPrice: number;
  updatedBy: {
    _id: string;
    name?: string;
    email?: string;
  };
  updatedAt: string; // ISO 8601 date string
}
```

### Current Price Entry

```typescript
interface PriceEntry {
  fuelType: 'gasoline' | 'diesel' | 'premium_gasoline' | 'premium_diesel' | 'lpg';
  price: number;
  currency: string; // Default: 'PHP'
  lastUpdated: string; // ISO 8601 date string
}
```

### Update Response

```typescript
interface UpdatePriceResponse {
  success: boolean;
  message: string;
  data: {
    station: {
      _id: string;
      name: string;
      prices: PriceEntry[];
      priceHistory: PriceHistoryEntry[];
      lastUpdated: string;
    };
    update: {
      fuelType: string;
      oldPrice: number | null;
      newPrice: number;
      changed: boolean;
    };
  };
}
```

---

## Best Practices

### 1. **Validate Input Before Sending**
```javascript
const validatePrice = (price) => {
  const numPrice = parseFloat(price);
  if (isNaN(numPrice) || numPrice < 0) {
    return { valid: false, error: 'Price must be a positive number' };
  }
  return { valid: true, value: numPrice };
};
```

### 2. **Show Loading States**
```javascript
const [loading, setLoading] = useState(false);

const handleUpdate = async () => {
  setLoading(true);
  try {
    await updateGasPrice(...);
  } finally {
    setLoading(false);
  }
};
```

### 3. **Handle Optimistic Updates**
```javascript
const handleUpdate = async () => {
  // Update UI immediately
  const oldPrice = currentPrice;
  setCurrentPrice(newPrice);
  
  try {
    await updateGasPrice(...);
  } catch (error) {
    // Revert on error
    setCurrentPrice(oldPrice);
    alert('Failed to update price');
  }
};
```

### 4. **Cache Price History**
```javascript
const [priceHistoryCache, setPriceHistoryCache] = useState({});

const getCachedHistory = async (stationId, fuelType) => {
  const cacheKey = `${stationId}-${fuelType}`;
  
  if (priceHistoryCache[cacheKey]) {
    return priceHistoryCache[cacheKey];
  }
  
  const history = await getPriceHistory(stationId, fuelType);
  setPriceHistoryCache({ ...priceHistoryCache, [cacheKey]: history });
  return history;
};
```

### 5. **Format Prices Consistently**
```javascript
const formatPrice = (price) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2
  }).format(price);
};

// Usage: formatPrice(65.50) => "₱65.50"
```

### 6. **Debounce Price Updates**
```javascript
import { debounce } from 'lodash';

const debouncedUpdate = debounce(async (stationId, fuelType, newPrice, token) => {
  await updateGasPrice(stationId, fuelType, newPrice, token);
}, 500);
```

### 7. **Show Success/Error Messages**
```javascript
const [message, setMessage] = useState({ type: '', text: '' });

const showMessage = (type, text) => {
  setMessage({ type, text });
  setTimeout(() => setMessage({ type: '', text: '' }), 3000);
};

// Usage
try {
  await updateGasPrice(...);
  showMessage('success', 'Price updated successfully!');
} catch (error) {
  showMessage('error', error.message);
}
```

---

## Testing Examples

### Unit Test Example (Jest)

```javascript
import { updateGasPrice, getPriceHistory } from './gasPriceApi';

describe('Gas Price API', () => {
  const mockToken = 'mock-jwt-token';
  const mockStationId = '507f1f77bcf86cd799439011';

  test('should update gas price successfully', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          message: 'Price updated successfully',
          data: {
            station: { _id: mockStationId, name: 'Test Station' },
            update: { fuelType: 'gasoline', oldPrice: 64.50, newPrice: 65.50, changed: true }
          }
        })
      })
    );

    const result = await updateGasPrice(mockStationId, 'gasoline', 65.50, mockToken);
    
    expect(result.update.newPrice).toBe(65.50);
    expect(result.update.changed).toBe(true);
  });

  test('should handle authentication error', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 401,
        json: () => Promise.resolve({
          success: false,
          message: 'Authentication required. Please login.'
        })
      })
    );

    await expect(
      updateGasPrice(mockStationId, 'gasoline', 65.50, 'invalid-token')
    ).rejects.toThrow('Authentication required');
  });
});
```

---

## Summary

- **Endpoint:** `PUT /api/gas-stations/:id/price`
- **Authentication:** Required (Bearer token)
- **Request Body:** `{ fuelType: string, newPrice: number }`
- **Response:** Updated station data with price history
- **History Tracking:** Automatic - tracks all price changes with user and timestamp
- **Error Handling:** Comprehensive error messages for all scenarios

The API automatically tracks price changes, maintaining a complete audit trail of who updated prices and when. This makes it easy to display price history and track changes over time.

