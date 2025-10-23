// Authentication service for TrafficSlight Admin Dashboard
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ts-backend-1-jyit.onrender.com/api';

export const authService = {
  // Login functionality
  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      
      // Store token if provided
      if (data.token) {
        this.setToken(data.token);
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Register functionality
  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      
      // Store token if provided
      if (data.token) {
        this.setToken(data.token);
      }
      
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Logout functionality
  async logout() {
    try {
      const token = this.getToken();
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.removeToken();
    }
  },

  // Token management
  getToken() {
    return localStorage.getItem('token');
  },

  setToken(token) {
    localStorage.setItem('token', token);
  },

  removeToken() {
    localStorage.removeItem('token');
  },

  // Token validation
  async validateToken() {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-token`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      return response.ok;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  },

  // Get current user
  async getCurrentUser() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get user data');
      }

      return await response.json();
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  // Password reset request
  async requestPasswordReset(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Password reset request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  },

  // Reset password
  async resetPassword(token, newPassword) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password: newPassword })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Password reset failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }
};
