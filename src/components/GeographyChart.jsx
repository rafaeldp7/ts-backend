import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { geographyService } from '../services/geographyService';

const GeographyChart = ({ type = 'user-distribution', period = '30d' }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState('bar');

  useEffect(() => {
    fetchGeographyData();
  }, [type, period]);

  const fetchGeographyData = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      switch (type) {
        case 'user-distribution':
          response = await geographyService.getUserDistribution();
          break;
        case 'trip-analytics':
          response = await geographyService.getTripAnalyticsByLocation();
          break;
        case 'gas-station-distribution':
          response = await geographyService.getGasStationDistribution();
          break;
        case 'traffic-hotspots':
          response = await geographyService.getTrafficHotspots();
          break;
        case 'route-analytics':
          response = await geographyService.getRouteAnalytics();
          break;
        default:
          response = await geographyService.getGeographyData();
      }

      setData(response);
    } catch (err) {
      console.error('Geography data fetch error:', err);
      setError(err.message || 'Failed to load geography data');
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    if (!data) return null;

    const colors = [
      '#00ADB5', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
      '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE'
    ];

    switch (type) {
      case 'user-distribution':
        return {
          labels: data.locations?.map(item => item.name) || [],
          datasets: [{
            label: 'Users',
            data: data.locations?.map(item => item.count) || [],
            backgroundColor: colors.slice(0, data.locations?.length || 0),
            borderColor: colors.slice(0, data.locations?.length || 0),
            borderWidth: 1
          }]
        };

      case 'trip-analytics':
        return {
          labels: data.routes?.map(item => item.route) || [],
          datasets: [{
            label: 'Trips',
            data: data.routes?.map(item => item.count) || [],
            backgroundColor: colors.slice(0, data.routes?.length || 0),
            borderColor: colors.slice(0, data.routes?.length || 0),
            borderWidth: 1
          }]
        };

      case 'gas-station-distribution':
        return {
          labels: data.stations?.map(item => item.area) || [],
          datasets: [{
            label: 'Gas Stations',
            data: data.stations?.map(item => item.count) || [],
            backgroundColor: colors.slice(0, data.stations?.length || 0),
            borderColor: colors.slice(0, data.stations?.length || 0),
            borderWidth: 1
          }]
        };

      case 'traffic-hotspots':
        return {
          labels: data.hotspots?.map(item => item.location) || [],
          datasets: [{
            label: 'Traffic Level',
            data: data.hotspots?.map(item => item.level) || [],
            backgroundColor: colors.slice(0, data.hotspots?.length || 0),
            borderColor: colors.slice(0, data.hotspots?.length || 0),
            borderWidth: 1
          }]
        };

      default:
        return {
          labels: ['Data'],
          datasets: [{
            label: 'Value',
            data: [data.total || 0],
            backgroundColor: colors[0],
            borderColor: colors[0],
            borderWidth: 1
          }]
        };
    }
  };

  const getChartOptions = () => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      }
    };

    if (chartType === 'doughnut') {
      return {
        ...baseOptions,
        plugins: {
          ...baseOptions.plugins,
          legend: {
            display: true,
            position: 'right'
          }
        }
      };
    }

    return {
      ...baseOptions,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      }
    };
  };

  const renderChart = () => {
    const chartData = getChartData();
    if (!chartData) return null;

    const options = getChartOptions();

    switch (chartType) {
      case 'doughnut':
        return <Doughnut data={chartData} options={options} />;
      case 'line':
        return <Line data={chartData} options={options} />;
      default:
        return <Bar data={chartData} options={options} />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
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

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight="bold">
            {type.replace('-', ' ').toUpperCase()} Analytics
          </Typography>
          <Box display="flex" gap={1}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Chart Type</InputLabel>
              <Select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                label="Chart Type"
              >
                <MenuItem value="bar">Bar</MenuItem>
                <MenuItem value="doughnut">Doughnut</MenuItem>
                <MenuItem value="line">Line</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Box height="400px">
          {renderChart()}
        </Box>

        {data && (
          <Box mt={2}>
            <Grid container spacing={2}>
              {data.summary && Object.entries(data.summary).map(([key, value]) => (
                <Grid item xs={6} sm={3} key={key}>
                  <Chip
                    label={`${key}: ${value}`}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default GeographyChart;
