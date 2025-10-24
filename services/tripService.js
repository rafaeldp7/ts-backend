const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/trips';

/**
 * Trip Service - Frontend API calls for trip management
 */

/**
 * Fetch paginated trips with search functionality
 * @param {number} page - Current page (0-based)
 * @param {number} limit - Number of items per page
 * @param {string} searchQuery - Search term for filtering trips
 * @returns {Promise<Object>} - Response data with trips and pagination info
 */
export const fetchPaginatedTrips = async (page, limit, searchQuery = '') => {
  try {
    let url = `${API}/paginate?page=${page + 1}&limit=${limit}`;
    if (searchQuery) {
      url += `&search=${encodeURIComponent(searchQuery)}`;
    }

    const response = await fetch(url);
    const data = await response.json();
    
    return {
      trips: data.trips || [],
      totalRecords: data.totalRecords || 0,
      currentPage: data.currentPage || 1,
      totalPages: data.totalPages || 0,
      success: true
    };
  } catch (err) {
    console.error("Error fetching trips:", err);
    return {
      trips: [],
      totalRecords: 0,
      currentPage: 1,
      totalPages: 0,
      success: false,
      error: err.message
    };
  }
};

/**
 * Fetch all trips for a specific user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of trips
 */
export const fetchUserTrips = async (userId) => {
  try {
    const response = await fetch(`${API}/user/${userId}`);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error fetching user trips:", err);
    return [];
  }
};

/**
 * Add a new trip
 * @param {Object} tripData - Trip data to create
 * @returns {Promise<Object>} - Created trip data
 */
export const addTrip = async (tripData) => {
  try {
    const response = await fetch(`${API}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tripData)
    });
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error adding trip:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Update a trip
 * @param {string} tripId - Trip ID to update
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} - Updated trip data
 */
export const updateTrip = async (tripId, updateData) => {
  try {
    const response = await fetch(`${API}/${tripId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error updating trip:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Delete a trip
 * @param {string} tripId - Trip ID to delete
 * @returns {Promise<Object>} - Deletion result
 */
export const deleteTrip = async (tripId) => {
  try {
    const response = await fetch(`${API}/${tripId}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error deleting trip:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Get trips by date range
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<Array>} - Array of trips in date range
 */
export const fetchTripsByDateRange = async (startDate, endDate) => {
  try {
    const response = await fetch(`${API}/filter/date?startDate=${startDate}&endDate=${endDate}`);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error fetching trips by date range:", err);
    return [];
  }
};

/**
 * Get trip analytics summary
 * @returns {Promise<Object>} - Analytics data
 */
export const fetchTripAnalytics = async () => {
  try {
    const response = await fetch(`${API}/analytics/summary`);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error fetching trip analytics:", err);
    return {};
  }
};

/**
 * Get monthly trip summary
 * @returns {Promise<Object>} - Monthly summary data
 */
export const fetchMonthlyTripSummary = async () => {
  try {
    const response = await fetch(`${API}/analytics/monthly`);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error fetching monthly trip summary:", err);
    return {};
  }
};

/**
 * Get top users by trip count
 * @param {number} limit - Number of top users to return (default: 5)
 * @returns {Promise<Array>} - Array of top users
 */
export const fetchTopUsersByTripCount = async (limit = 5) => {
  try {
    const response = await fetch(`${API}/insights/top-users?limit=${limit}`);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error fetching top users:", err);
    return [];
  }
};

/**
 * Get most used motorcycles
 * @param {number} limit - Number of top motorcycles to return (default: 5)
 * @returns {Promise<Array>} - Array of most used motorcycles
 */
export const fetchMostUsedMotors = async (limit = 5) => {
  try {
    const response = await fetch(`${API}/insights/top-motors?limit=${limit}`);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error fetching most used motors:", err);
    return [];
  }
};

/**
 * Get in-progress trip for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} - In-progress trip or null
 */
export const fetchInProgressTrip = async (userId) => {
  try {
    const response = await fetch(`${API}/in-progress/${userId}`);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error fetching in-progress trip:", err);
    return null;
  }
};

/**
 * Update trip status
 * @param {string} tripId - Trip ID
 * @param {string} status - New status (planned, in-progress, completed, cancelled)
 * @returns {Promise<Object>} - Update result
 */
export const updateTripStatus = async (tripId, status) => {
  try {
    const response = await fetch(`${API}/${tripId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status })
    });
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error updating trip status:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Complete trip and update motor analytics
 * @param {string} tripId - Trip ID to complete
 * @returns {Promise<Object>} - Completion result
 */
export const completeTripAndUpdateMotor = async (tripId) => {
  try {
    const response = await fetch(`${API}/${tripId}/complete`, {
      method: 'PUT'
    });
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error completing trip:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Get predictive summary for a motor
 * @param {string} motorId - Motor ID
 * @returns {Promise<Object>} - Predictive summary data
 */
export const fetchPredictiveSummary = async (motorId) => {
  try {
    const response = await fetch(`${API}/predictive/${motorId}`);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error fetching predictive summary:", err);
    return {};
  }
};

/**
 * Reset predictive counters for a motor
 * @param {string} motorId - Motor ID
 * @param {string} resetType - Reset type (oil, tuneUp, both)
 * @returns {Promise<Object>} - Reset result
 */
export const resetPredictiveCounters = async (motorId, resetType) => {
  try {
    const response = await fetch(`${API}/predictive/${motorId}/reset`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ resetType })
    });
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error resetting predictive counters:", err);
    return { success: false, error: err.message };
  }
};

export default {
  fetchPaginatedTrips,
  fetchUserTrips,
  addTrip,
  updateTrip,
  deleteTrip,
  fetchTripsByDateRange,
  fetchTripAnalytics,
  fetchMonthlyTripSummary,
  fetchTopUsersByTripCount,
  fetchMostUsedMotors,
  fetchInProgressTrip,
  updateTripStatus,
  completeTripAndUpdateMotor,
  fetchPredictiveSummary,
  resetPredictiveCounters
};
