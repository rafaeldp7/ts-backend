import { useState, useEffect, useCallback } from 'react';
import { 
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
} from '../services/tripService';

/**
 * Custom hook for managing trips with pagination and search
 */
export const useTrips = (initialPage = 0, initialLimit = 10) => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: initialPage,
    totalPages: 0,
    totalRecords: 0,
    limit: initialLimit
  });
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * Fetch paginated trips with search functionality
   */
  const fetchTrips = useCallback(async (page = pagination.currentPage, limit = pagination.limit, search = searchQuery) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchPaginatedTrips(page, limit, search);
      
      if (result.success) {
        setTrips(result.trips);
        setPagination(prev => ({
          ...prev,
          currentPage: result.currentPage - 1, // Convert to 0-based
          totalPages: result.totalPages,
          totalRecords: result.totalRecords,
          limit
        }));
      } else {
        setError(result.error || 'Failed to fetch trips');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.limit, searchQuery]);

  /**
   * Search trips
   */
  const searchTrips = useCallback((query) => {
    setSearchQuery(query);
    fetchTrips(0, pagination.limit, query); // Reset to first page when searching
  }, [fetchTrips, pagination.limit]);

  /**
   * Change page
   */
  const changePage = useCallback((page) => {
    fetchTrips(page, pagination.limit, searchQuery);
  }, [fetchTrips, pagination.limit, searchQuery]);

  /**
   * Change page size
   */
  const changePageSize = useCallback((limit) => {
    fetchTrips(0, limit, searchQuery); // Reset to first page when changing page size
  }, [fetchTrips, searchQuery]);

  /**
   * Refresh current page
   */
  const refresh = useCallback(() => {
    fetchTrips(pagination.currentPage, pagination.limit, searchQuery);
  }, [fetchTrips, pagination.currentPage, pagination.limit, searchQuery]);

  // Initial load
  useEffect(() => {
    fetchTrips();
  }, []);

  return {
    trips,
    loading,
    error,
    pagination,
    searchQuery,
    fetchTrips,
    searchTrips,
    changePage,
    changePageSize,
    refresh,
    setError
  };
};

/**
 * Custom hook for user trips
 */
export const useUserTrips = (userId) => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserTripsData = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchUserTrips(userId);
      setTrips(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserTripsData();
  }, [fetchUserTripsData]);

  return {
    trips,
    loading,
    error,
    refetch: fetchUserTripsData
  };
};

/**
 * Custom hook for trip analytics
 */
export const useTripAnalytics = () => {
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchTripAnalytics();
      setAnalytics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMonthlySummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchMonthlyTripSummary();
      setAnalytics(prev => ({ ...prev, monthly: data }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    fetchAnalytics,
    fetchMonthlySummary
  };
};

/**
 * Custom hook for trip insights
 */
export const useTripInsights = () => {
  const [insights, setInsights] = useState({
    topUsers: [],
    topMotors: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [topUsers, topMotors] = await Promise.all([
        fetchTopUsersByTripCount(),
        fetchMostUsedMotors()
      ]);
      
      setInsights({ topUsers, topMotors });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return {
    insights,
    loading,
    error,
    refetch: fetchInsights
  };
};

/**
 * Custom hook for trip management (CRUD operations)
 */
export const useTripManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createTrip = useCallback(async (tripData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await addTrip(tripData);
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const editTrip = useCallback(async (tripId, updateData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await updateTrip(tripId, updateData);
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const removeTrip = useCallback(async (tripId) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await deleteTrip(tripId);
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const changeTripStatus = useCallback(async (tripId, status) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await updateTripStatus(tripId, status);
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const completeTrip = useCallback(async (tripId) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await completeTripAndUpdateMotor(tripId);
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createTrip,
    editTrip,
    removeTrip,
    changeTripStatus,
    completeTrip,
    setError
  };
};

export default {
  useTrips,
  useUserTrips,
  useTripAnalytics,
  useTripInsights,
  useTripManagement
};
