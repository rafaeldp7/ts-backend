# Gas Station Fuel Price Update - User Side Documentation

This document provides complete implementation guide for updating gas station fuel prices from the user side.

---

## Overview

Users can update fuel prices for gas stations. The system automatically tracks price changes in a history log, including who made the update and when.

**Key Features:**
- ✅ Update single fuel type price
- ✅ Automatic price history tracking
- ✅ User attribution (who updated the price)
- ✅ View current prices
- ✅ View price history

---

## Endpoints

### 1. Update Gas Station Fuel Price

**Endpoint:** `PUT /api/gas-stations/:id/price`

**Description:** Updates the price of a specific fuel type for a gas station. No authentication required.

**Authentication:** Optional (if authenticated, user will be tracked in price history)

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Gas Station MongoDB ObjectId |

**Request Body:**

```json
{
  "fuelType": "gasoline",
  "newPrice": 65.50
}
```

**Request Body Fields:**

| Field | Type | Required | Description | Valid Values |
|-------|------|----------|-------------|--------------|
| `fuelType` | string | Yes | Type of fuel to update | `gasoline`, `diesel`, `premium_gasoline`, `premium_diesel`, `lpg` |
| `newPrice` | number | Yes | New price per liter (PHP) | Must be a positive number (≥ 0) |

**Valid Fuel Types:**
- `gasoline` - Regular gasoline
- `diesel` - Diesel fuel
- `premium_gasoline` - Premium gasoline
- `premium_diesel` - Premium diesel
- `lpg` - Liquefied Petroleum Gas

**Success Response (200 OK) - With Authentication:**

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

**Success Response (200 OK) - Anonymous Update (No Authentication):**

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
        }
      ],
      "priceHistory": [
        {
          "fuelType": "gasoline",
          "oldPrice": 64.50,
          "newPrice": 65.50,
          "updatedBy": null,
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

**400 Bad Request - Missing Fields:**
```json
{
  "success": false,
  "message": "fuelType and newPrice are required"
}
```

**400 Bad Request - Invalid Fuel Type:**
```json
{
  "success": false,
  "message": "Invalid fuelType. Must be one of: gasoline, diesel, premium_gasoline, premium_diesel, lpg"
}
```

**400 Bad Request - Invalid Price:**
```json
{
  "success": false,
  "message": "newPrice must be a positive number"
}
```


**404 Not Found - Gas Station Not Found:**
```json
{
  "success": false,
  "message": "Gas station not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Server error updating gas price",
  "error": "Error details (only in development)"
}
```

---

### 2. Get Gas Station Current Prices

**Endpoint:** `GET /api/gas-stations/:id/prices`

**Description:** Retrieves all current fuel prices for a specific gas station. No authentication required.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Gas Station MongoDB ObjectId |

**Success Response (200 OK):**

```json
[
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
  },
  {
    "fuelType": "premium_gasoline",
    "price": 68.00,
    "currency": "PHP",
    "lastUpdated": "2024-01-14T15:20:00.000Z"
  }
]
```

**Error Response (404 Not Found):**
```json
{
  "message": "Gas station not found"
}
```

---

### 3. Get Gas Station Price History

**Endpoint:** `GET /api/gas-stations/:id/price-history`

**Description:** Retrieves price change history for a gas station. Can be filtered by fuel type. No authentication required.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Gas Station MongoDB ObjectId |

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `fuelType` | string | No | - | Filter by fuel type (gasoline, diesel, etc.) |
| `limit` | number | No | 50 | Maximum number of history entries to return |

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
        "updatedAt": "2024-01-14T08:15:00.000Z"
      },
      {
        "fuelType": "diesel",
        "oldPrice": 61.00,
        "newPrice": 62.00,
        "updatedBy": null,
        "updatedAt": "2024-01-13T14:20:00.000Z"
      }
    ],
    "count": 3
  }
}
```

**Example Requests:**

```javascript
// Get all price history
GET /api/gas-stations/507f1f77bcf86cd799439011/price-history

// Get price history for gasoline only
GET /api/gas-stations/507f1f77bcf86cd799439011/price-history?fuelType=gasoline

// Get last 20 price changes
GET /api/gas-stations/507f1f77bcf86cd799439011/price-history?limit=20

// Get gasoline price history, last 10 entries
GET /api/gas-stations/507f1f77bcf86cd799439011/price-history?fuelType=gasoline&limit=10
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Gas station not found"
}
```

---

## Frontend Implementation Examples

### React/TypeScript Example

```typescript
// Types
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
        } | null; // Can be null for anonymous updates
        updatedAt: string;
      }>;
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

// Update gas station price (token is optional)
const updateGasStationPrice = async (
  stationId: string,
  fuelType: string,
  newPrice: number,
  token?: string
): Promise<PriceUpdateResponse> => {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    // Add authorization header only if token is provided
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${API_BASE_URL}/api/gas-stations/${stationId}/price`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          fuelType,
          newPrice
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update gas price');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating gas price:', error);
    throw error;
  }
};

// Get current prices
const getGasStationPrices = async (stationId: string) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/gas-stations/${stationId}/prices`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch gas station prices');
    }

    const prices = await response.json();
    return prices;
  } catch (error) {
    console.error('Error fetching gas station prices:', error);
    throw error;
  }
};

// Get price history
const getPriceHistory = async (
  stationId: string,
  fuelType?: string,
  limit: number = 50
) => {
  try {
    const params = new URLSearchParams();
    if (fuelType) params.append('fuelType', fuelType);
    params.append('limit', limit.toString());

    const response = await fetch(
      `${API_BASE_URL}/api/gas-stations/${stationId}/price-history?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch price history');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching price history:', error);
    throw error;
  }
};

// Usage in component
const GasStationPriceUpdate = () => {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = useSelector(state => state.auth.token);
  const stationId = '507f1f77bcf86cd799439011';

  const handleUpdatePrice = async (fuelType: string, newPrice: number) => {
    setLoading(true);
    try {
      const result = await updateGasStationPrice(stationId, fuelType, newPrice, token);
      
      // Update local state with new prices
      setPrices(result.data.station.prices);
      
      // Show success message
      alert(`Price updated successfully! ${result.data.update.oldPrice} → ${result.data.update.newPrice}`);
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadPrices = async () => {
      try {
        const currentPrices = await getGasStationPrices(stationId);
        setPrices(currentPrices);
      } catch (error) {
        console.error('Failed to load prices:', error);
      }
    };
    loadPrices();
  }, [stationId]);

  return (
    <View>
      {prices.map((price) => (
        <PriceInput
          key={price.fuelType}
          fuelType={price.fuelType}
          currentPrice={price.price}
          onUpdate={(newPrice) => handleUpdatePrice(price.fuelType, newPrice)}
          disabled={loading}
        />
      ))}
    </View>
  );
};
```

---

### JavaScript/Fetch Example

```javascript
// Update gas station price (token is optional)
async function updateGasPrice(stationId, fuelType, newPrice, token = null) {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Add authorization header only if token is provided
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(
      `http://your-api-url/api/gas-stations/${stationId}/price`,
      {
        method: 'PUT',
        headers,
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

// Get current prices
async function getCurrentPrices(stationId) {
  try {
    const response = await fetch(
      `http://your-api-url/api/gas-stations/${stationId}/prices`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch prices');
    }

    const prices = await response.json();
    return prices;
  } catch (error) {
    console.error('Error fetching prices:', error);
    throw error;
  }
}

// Get price history
async function getPriceHistory(stationId, fuelType = null, limit = 50) {
  try {
    let url = `http://your-api-url/api/gas-stations/${stationId}/price-history?limit=${limit}`;
    if (fuelType) {
      url += `&fuelType=${fuelType}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch price history');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching price history:', error);
    throw error;
  }
}

// Usage
const token = 'your-jwt-token'; // Optional - can be null for anonymous updates
const stationId = '507f1f77bcf86cd799439011';

// Update gasoline price to 65.50 PHP (with authentication)
updateGasPrice(stationId, 'gasoline', 65.50, token)

// Update gasoline price to 65.50 PHP (anonymous - no authentication)
updateGasPrice(stationId, 'gasoline', 65.50, null)
  .then(result => {
    console.log('Price updated:', result);
    console.log('Old price:', result.data.update.oldPrice);
    console.log('New price:', result.data.update.newPrice);
  })
  .catch(error => {
    console.error('Update failed:', error.message);
  });

// Get all current prices
getCurrentPrices(stationId)
  .then(prices => {
    console.log('Current prices:', prices);
    prices.forEach(price => {
      console.log(`${price.fuelType}: ${price.price} ${price.currency}`);
    });
  });

// Get price history for gasoline
getPriceHistory(stationId, 'gasoline', 10)
  .then(history => {
    console.log('Price history:', history.data.history);
  });
```

---

### React Native Example

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://your-api-url/api';

// Update gas station price
export const updateGasPrice = async (stationId, fuelType, newPrice, token = null) => {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Add authorization header only if token is provided
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios.put(
      `${API_BASE_URL}/gas-stations/${stationId}/price`,
      {
        fuelType,
        newPrice
      },
      {
        headers
      }
    );

    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to update price');
    }
    throw error;
  }
};

// Get current prices
export const getGasStationPrices = async (stationId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/gas-stations/${stationId}/prices`
    );
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch prices');
    }
    throw error;
  }
};

// Get price history
export const getPriceHistory = async (stationId, fuelType = null, limit = 50) => {
  try {
    const params = {};
    if (fuelType) params.fuelType = fuelType;
    params.limit = limit;

    const response = await axios.get(
      `${API_BASE_URL}/gas-stations/${stationId}/price-history`,
      { params }
    );
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch history');
    }
    throw error;
  }
};
```

---

## Complete User Flow Example

```javascript
// Complete example: Update price and show history
async function updatePriceAndShowHistory(stationId, fuelType, newPrice, token) {
  try {
    // Step 1: Get current prices
    console.log('Fetching current prices...');
    const currentPrices = await getCurrentPrices(stationId);
    const currentPrice = currentPrices.find(p => p.fuelType === fuelType);
    console.log(`Current ${fuelType} price: ${currentPrice?.price || 'N/A'} PHP`);

    // Step 2: Update price
    console.log(`Updating ${fuelType} price to ${newPrice} PHP...`);
    const updateResult = await updateGasPrice(stationId, fuelType, newPrice, token);
    
    if (updateResult.data.update.changed) {
      console.log(`✅ Price updated: ${updateResult.data.update.oldPrice} → ${updateResult.data.update.newPrice} PHP`);
    } else {
      console.log(`ℹ️ Price unchanged: ${newPrice} PHP`);
    }

    // Step 3: Get updated prices
    const updatedPrices = await getCurrentPrices(stationId);
    console.log('Updated prices:', updatedPrices);

    // Step 4: Get price history
    console.log('Fetching price history...');
    const history = await getPriceHistory(stationId, fuelType, 10);
    console.log(`Recent ${fuelType} price changes:`, history.data.history);

    return {
      success: true,
      update: updateResult.data.update,
      currentPrices: updatedPrices,
      history: history.data.history
    };
  } catch (error) {
    console.error('Error in price update flow:', error);
    throw error;
  }
}

// Usage
updatePriceAndShowHistory(
  '507f1f77bcf86cd799439011',
  'gasoline',
  65.50,
  'your-jwt-token'
);
```

---

## Important Notes

### Authentication
- The `PUT /api/gas-stations/:id/price` endpoint **does NOT require authentication**
- Authentication is **optional** - if a user is authenticated, their information will be tracked in price history
- If not authenticated, price updates will still work but `updatedBy` will be `null` in the history
- To track who made the update, include the JWT token: `Authorization: Bearer <token>`

### Price History Tracking
- Price changes are automatically tracked in `priceHistory`
- Each history entry includes:
  - Old price and new price
  - User who made the update (name and email) - **can be `null` for anonymous updates**
  - Timestamp of the update
- History is only added when the price actually changes
- If you update with the same price, `changed: false` is returned
- If updated anonymously (no auth), `updatedBy` will be `null` in the history

### Validation
- `fuelType` must be one of the valid fuel types
- `newPrice` must be a positive number (≥ 0)
- Gas station must exist (404 if not found)
- Authentication is optional (no 401 error if not logged in)

### Response Data
- The update response includes the last 10 price history entries
- Current prices array shows all fuel types and their prices
- The `update` object shows what changed (oldPrice, newPrice, changed flag)

---

## Error Handling Best Practices

```javascript
async function updatePriceWithErrorHandling(stationId, fuelType, newPrice, token) {
  try {
    const result = await updateGasPrice(stationId, fuelType, newPrice, token);
    return { success: true, data: result };
  } catch (error) {
    // Handle specific error cases
    if (error.message.includes('required')) {
      return { success: false, error: 'Missing required fields' };
    }
    
    if (error.message.includes('Invalid fuelType')) {
      return { success: false, error: 'Invalid fuel type' };
    }
    
    if (error.message.includes('positive number')) {
      return { success: false, error: 'Price must be a positive number' };
    }
    
    
    if (error.message.includes('not found')) {
      return { success: false, error: 'Gas station not found' };
    }
    
    // Generic error
    return { success: false, error: 'Failed to update price. Please try again.' };
  }
}
```

---

## Testing Examples

### cURL Examples

```bash
# Update gasoline price (with authentication - optional)
curl -X PUT http://localhost:5000/api/gas-stations/507f1f77bcf86cd799439011/price \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "fuelType": "gasoline",
    "newPrice": 65.50
  }'

# Update gasoline price (without authentication - anonymous)
curl -X PUT http://localhost:5000/api/gas-stations/507f1f77bcf86cd799439011/price \
  -H "Content-Type: application/json" \
  -d '{
    "fuelType": "gasoline",
    "newPrice": 65.50
  }'

# Get current prices (no authentication required)
curl http://localhost:5000/api/gas-stations/507f1f77bcf86cd799439011/prices

# Get price history for gasoline (no authentication required)
curl "http://localhost:5000/api/gas-stations/507f1f77bcf86cd799439011/price-history?fuelType=gasoline&limit=10"
```

---

## Summary

**Available Endpoints for Users:**

1. ✅ **PUT /api/gas-stations/:id/price** - Update single fuel price (no auth required, optional)
2. ✅ **GET /api/gas-stations/:id/prices** - Get current prices (no auth)
3. ✅ **GET /api/gas-stations/:id/price-history** - Get price history (no auth)

**Key Features:**
- Automatic price history tracking
- Optional user attribution (if authenticated)
- Anonymous updates supported (updatedBy can be null)
- Validation and error handling
- Support for multiple fuel types
- Filterable price history

---

**Last Updated:** Current  
**Status:** ✅ Ready for implementation

