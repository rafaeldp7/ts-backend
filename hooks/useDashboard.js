import { useState, useEffect, useCallback } from 'react';
import { 
  fetchDashboardData,
  fetchUserCount,
  fetchNewUsersThisMonth,
  fetchReports,
  fetchMotorcycles,
  fetchFuelLogs,
  fetchUserGrowth,
  fetchUsers,
  fetchFirstUserName
} from '../services/dashboardService';

/**
 * Custom hook for dashboard data management
 */
export const useDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    userCount: null,
    newUsersThisMonth: null,
    reports: null,
    motorcycles: null,
    fuelLogs: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch all dashboard data at once
   */
  const fetchAllDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchDashboardData();
      if (result.success) {
        setDashboardData(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refresh specific data
   */
  const refreshUserCount = useCallback(async () => {
    try {
      const result = await fetchUserCount();
      if (result.success) {
        setDashboardData(prev => ({ ...prev, userCount: result.data }));
      }
    } catch (err) {
      console.error('Error refreshing user count:', err);
    }
  }, []);

  const refreshNewUsersThisMonth = useCallback(async () => {
    try {
      const result = await fetchNewUsersThisMonth();
      if (result.success) {
        setDashboardData(prev => ({ ...prev, newUsersThisMonth: result.data }));
      }
    } catch (err) {
      console.error('Error refreshing new users this month:', err);
    }
  }, []);

  const refreshReports = useCallback(async () => {
    try {
      const result = await fetchReports();
      if (result.success) {
        setDashboardData(prev => ({ ...prev, reports: result.data }));
      }
    } catch (err) {
      console.error('Error refreshing reports:', err);
    }
  }, []);

  const refreshMotorcycles = useCallback(async () => {
    try {
      const result = await fetchMotorcycles();
      if (result.success) {
        setDashboardData(prev => ({ ...prev, motorcycles: result.data }));
      }
    } catch (err) {
      console.error('Error refreshing motorcycles:', err);
    }
  }, []);

  const refreshFuelLogs = useCallback(async () => {
    try {
      const result = await fetchFuelLogs();
      if (result.success) {
        setDashboardData(prev => ({ ...prev, fuelLogs: result.data }));
      }
    } catch (err) {
      console.error('Error refreshing fuel logs:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchAllDashboardData();
  }, [fetchAllDashboardData]);

  return {
    dashboardData,
    loading,
    error,
    fetchAllDashboardData,
    refreshUserCount,
    refreshNewUsersThisMonth,
    refreshReports,
    refreshMotorcycles,
    refreshFuelLogs,
    setError
  };
};

/**
 * Custom hook for user analytics
 */
export const useUserAnalytics = () => {
  const [userGrowth, setUserGrowth] = useState(null);
  const [users, setUsers] = useState([]);
  const [firstUserName, setFirstUserName] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserGrowthData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchUserGrowth();
      if (result.success) {
        setUserGrowth(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsersData = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchUsers(page, limit);
      if (result.success) {
        setUsers(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFirstUserNameData = useCallback(async () => {
    try {
      const result = await fetchFirstUserName();
      if (result.success) {
        setFirstUserName(result.data);
      }
    } catch (err) {
      console.error('Error fetching first user name:', err);
    }
  }, []);

  useEffect(() => {
    fetchUserGrowthData();
    fetchFirstUserNameData();
  }, [fetchUserGrowthData, fetchFirstUserNameData]);

  return {
    userGrowth,
    users,
    firstUserName,
    loading,
    error,
    fetchUserGrowthData,
    fetchUsersData,
    fetchFirstUserNameData,
    setError
  };
};

export default {
  useDashboard,
  useUserAnalytics
};
