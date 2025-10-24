const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * Dashboard Service - Frontend API calls for dashboard data
 * This service handles all the dashboard-related API calls that were missing
 */

/**
 * Fetch all dashboard data in parallel
 * This matches the frontend code that fetches multiple endpoints simultaneously
 */
export const fetchDashboardData = async () => {
  try {
    const [
      userCountResponse,
      newUsersThisMonthResponse,
      reportsResponse,
      motorcyclesResponse,
      fuelLogsResponse
    ] = await Promise.all([
      fetch(`${API_BASE_URL}/api/auth/user-count`, {
        headers: { 'Content-Type': 'application/json' }
      }),
      fetch(`${API_BASE_URL}/api/auth/new-users-this-month`, {
        headers: { 'Content-Type': 'application/json' }
      }),
      fetch(`${API_BASE_URL}/api/reports`, {
        headers: { 'Content-Type': 'application/json' }
      }),
      fetch(`${API_BASE_URL}/api/motorcycles`, {
        headers: { 'Content-Type': 'application/json' }
      }),
      fetch(`${API_BASE_URL}/api/fuel-logs`, {
        headers: { 'Content-Type': 'application/json' }
      })
    ]);

    const [
      userCountData,
      newUsersThisMonthData,
      reportsData,
      motorcyclesData,
      fuelLogsData
    ] = await Promise.all([
      userCountResponse.json(),
      newUsersThisMonthResponse.json(),
      reportsResponse.json(),
      motorcyclesResponse.json(),
      fuelLogsResponse.json()
    ]);

    return {
      success: true,
      data: {
        userCount: userCountData,
        newUsersThisMonth: newUsersThisMonthData,
        reports: reportsData,
        motorcycles: motorcyclesData,
        fuelLogs: fuelLogsData
      }
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

/**
 * Fetch user count data
 */
export const fetchUserCount = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/user-count`, {
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching user count:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Fetch new users this month
 */
export const fetchNewUsersThisMonth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/new-users-this-month`, {
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching new users this month:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Fetch all reports
 */
export const fetchReports = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reports`, {
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching reports:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Fetch all motorcycles
 */
export const fetchMotorcycles = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/motorcycles`, {
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching motorcycles:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Fetch all fuel logs
 */
export const fetchFuelLogs = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/fuel-logs`, {
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching fuel logs:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Fetch user growth analytics
 */
export const fetchUserGrowth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/user-growth`, {
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching user growth:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Fetch all users with pagination
 */
export const fetchUsers = async (page = 1, limit = 10) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/users?page=${page}&limit=${limit}`, {
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Fetch first user name
 */
export const fetchFirstUserName = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/first-user-name`, {
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching first user name:', error);
    return { success: false, error: error.message };
  }
};

export default {
  fetchDashboardData,
  fetchUserCount,
  fetchNewUsersThisMonth,
  fetchReports,
  fetchMotorcycles,
  fetchFuelLogs,
  fetchUserGrowth,
  fetchUsers,
  fetchFirstUserName
};
