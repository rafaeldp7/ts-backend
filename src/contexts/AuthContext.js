import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = authService.getToken();
      if (token) {
        const isValid = await authService.validateToken();
        if (isValid) {
          const userData = await authService.getCurrentUser();
          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
          }
        } else {
          authService.removeToken();
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      authService.removeToken();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const data = await authService.login(email, password);
      setUser(data.user || data);
      setIsAuthenticated(true);
      return { success: true, data };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const data = await authService.register(userData);
      setUser(data.user || data);
      setIsAuthenticated(true);
      return { success: true, data };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const requestPasswordReset = async (email) => {
    try {
      const data = await authService.requestPasswordReset(email);
      return { success: true, data };
    } catch (error) {
      console.error('Password reset request error:', error);
      return { success: false, error: error.message };
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      const data = await authService.resetPassword(token, newPassword);
      return { success: true, data };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: error.message };
    }
  };

  const updateUser = (userData) => {
    setUser(prevUser => ({ ...prevUser, ...userData }));
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    requestPasswordReset,
    resetPassword,
    updateUser,
    initializeAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
