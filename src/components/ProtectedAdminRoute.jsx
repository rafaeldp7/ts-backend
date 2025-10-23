// components/ProtectedAdminRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

const ProtectedAdminRoute = ({ children, requiredPermission = null }) => {
  const { isAuthenticated, loading, admin } = useAdminAuth();

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh">
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading...</Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (requiredPermission && admin?.role?.permissions && !admin.role.permissions[requiredPermission]) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh">
        <Typography variant="h5" color="error">
          Access Denied
        </Typography>
        <Typography>
          You don't have permission to access this page.
        </Typography>
      </Box>
    );
  }

  return children;
};

export default ProtectedAdminRoute;
