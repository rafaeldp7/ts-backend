import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  Grid,
  Pagination,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import {
  Person as PersonIcon,
  Report as ReportIcon,
  LocalGasStation as GasStationIcon,
  TwoWheeler as MotorcycleIcon,
  Directions as TripIcon,
  Build as MaintenanceIcon,
  LocalFireDepartment as FuelIcon
} from '@mui/icons-material';

const SearchResults = ({ 
  results, 
  loading, 
  error, 
  searchType, 
  onPageChange,
  currentPage = 1,
  totalPages = 1 
}) => {
  const getEntityIcon = (type) => {
    switch (type) {
      case 'users':
        return <PersonIcon />;
      case 'reports':
        return <ReportIcon />;
      case 'gas-stations':
        return <GasStationIcon />;
      case 'motorcycles':
        return <MotorcycleIcon />;
      case 'trips':
        return <TripIcon />;
      case 'maintenance':
        return <MaintenanceIcon />;
      case 'fuel-logs':
        return <FuelIcon />;
      default:
        return <PersonIcon />;
    }
  };

  const getEntityColor = (type) => {
    switch (type) {
      case 'users':
        return 'primary';
      case 'reports':
        return 'error';
      case 'gas-stations':
        return 'success';
      case 'motorcycles':
        return 'warning';
      case 'trips':
        return 'info';
      case 'maintenance':
        return 'secondary';
      case 'fuel-logs':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const renderUserResult = (item) => (
    <Card key={item._id} sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {item.name?.charAt(0) || 'U'}
          </Avatar>
          <Box flex={1}>
            <Typography variant="h6">{item.name || 'Unknown User'}</Typography>
            <Typography variant="body2" color="textSecondary">
              {item.email}
            </Typography>
            <Box display="flex" gap={1} mt={1}>
              <Chip 
                label={item.role || 'User'} 
                size="small" 
                color="primary" 
                variant="outlined" 
              />
              <Chip 
                label={`Joined: ${formatDate(item.createdAt)}`} 
                size="small" 
                variant="outlined" 
              />
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const renderTripResult = (item) => (
    <Card key={item._id} sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: 'info.main' }}>
            <TripIcon />
          </Avatar>
          <Box flex={1}>
            <Typography variant="h6">
              Trip from {item.startLocation} to {item.endLocation}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Distance: {item.distance || 'N/A'} km | Duration: {item.duration || 'N/A'}
            </Typography>
            <Box display="flex" gap={1} mt={1}>
              <Chip 
                label={`Date: ${formatDate(item.date)}`} 
                size="small" 
                variant="outlined" 
              />
              <Chip 
                label={`User: ${item.user?.name || 'Unknown'}`} 
                size="small" 
                variant="outlined" 
              />
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const renderGenericResult = (item) => (
    <Card key={item._id} sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: 'grey.500' }}>
            {getEntityIcon(searchType)}
          </Avatar>
          <Box flex={1}>
            <Typography variant="h6">
              {item.title || item.name || item.description || 'Untitled'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {item.description || item.content || 'No description available'}
            </Typography>
            <Box display="flex" gap={1} mt={1}>
              <Chip 
                label={`Created: ${formatDate(item.createdAt)}`} 
                size="small" 
                variant="outlined" 
              />
              {item.status && (
                <Chip 
                  label={item.status} 
                  size="small" 
                  color={getEntityColor(searchType)}
                  variant="outlined" 
                />
              )}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const renderResult = (item) => {
    switch (searchType) {
      case 'users':
        return renderUserResult(item);
      case 'trips':
        return renderTripResult(item);
      default:
        return renderGenericResult(item);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }

  if (!results || results.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="h6" color="textSecondary">
          No results found
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Try adjusting your search terms or filters
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          Search Results ({results.length})
        </Typography>
        <Chip 
          icon={getEntityIcon(searchType)}
          label={searchType?.toUpperCase() || 'ALL'}
          color={getEntityColor(searchType)}
          variant="outlined"
        />
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Box>
        {results.map(renderResult)}
      </Box>

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(event, page) => onPageChange(page)}
            color="primary"
            size="large"
          />
        </Box>
      )}
    </Box>
  );
};

export default SearchResults;
