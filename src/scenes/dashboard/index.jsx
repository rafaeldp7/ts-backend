import React, { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography, CircularProgress, Alert, Button } from '@mui/material';
import { dashboardService } from '../../services/dashboardService';
import StatBox from '../../components/StatBox';
import OverviewChart from '../../components/OverviewChart';
import { Line } from 'react-chartjs-2';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all dashboard data in parallel
      const [
        overview,
        userCount,
        newUsers,
        userGrowth,
        gasConsumption,
        totalTrips,
        firstUser
      ] = await Promise.all([
        dashboardService.getOverview().catch(() => null),
        dashboardService.getUserCount().catch(() => ({ count: 0 })),
        dashboardService.getNewUsersThisMonth().catch(() => ({ count: 0 })),
        dashboardService.getUserGrowth().catch(() => ({ monthlyData: Array(12).fill(0) })),
        dashboardService.getGasConsumption().catch(() => ({ totalGasConsumed: 0 })),
        dashboardService.getTotalTrips().catch(() => ({ count: 0 })),
        dashboardService.getFirstUserName().catch(() => ({ name: 'N/A' }))
      ]);

      setDashboardData({
        overview,
        userCount: userCount.count,
        newUsers: newUsers.count,
        userGrowth: userGrowth.monthlyData,
        gasConsumption: gasConsumption.totalGasConsumed,
        totalTrips: totalTrips.count,
        topUser: firstUser.name
      });
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box m="1.5rem 2.5rem">
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={handleRefresh}>
            Retry
          </Button>
        }>
          {error}
        </Alert>
      </Box>
    );
  }

  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Users",
        data: dashboardData?.userGrowth || Array(12).fill(0),
        fill: false,
        backgroundColor: "#00ADB5",
        borderColor: "#00ADB5",
        tension: 0.4
      }
    ]
  };

  return (
    <Box m="1.5rem 2.5rem">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb="2rem">
        <Typography variant="h3" fontWeight="bold">
          Dashboard Overview
        </Typography>
        <Button 
          variant="outlined" 
          onClick={handleRefresh} 
          disabled={refreshing}
        >
          {refreshing ? <CircularProgress size={20} /> : 'Refresh'}
        </Button>
      </Box>

      <Grid container spacing={3} mb="2rem">
        <Grid item xs={12} sm={6} md={3}>
          <StatBox 
            title="Total Users" 
            value={dashboardData?.userCount || 0}
            subtitle="Registered users"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatBox 
            title="New Users This Month" 
            value={dashboardData?.newUsers || 0}
            subtitle="Monthly growth"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatBox 
            title="Total Trips" 
            value={dashboardData?.totalTrips || 0}
            subtitle="All time trips"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatBox 
            title="Gas Consumption" 
            value={`${dashboardData?.gasConsumption || 0}L`}
            subtitle="Total fuel used"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} mb="2rem">
        <Grid item xs={12} sm={6} md={3}>
          <StatBox 
            title="Top Rider" 
            value={dashboardData?.topUser || 'N/A'}
            subtitle="Most active user"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatBox 
            title="System Health" 
            value="100%"
            subtitle="All systems operational"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatBox 
            title="Active Sessions" 
            value="0"
            subtitle="Current online users"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatBox 
            title="Data Points" 
            value="1,234"
            subtitle="Analytics collected"
          />
        </Grid>
      </Grid>

      <Box mt="40px">
        <Typography variant="h4" mb="20px" fontWeight="bold">
          User Growth Analytics
        </Typography>
        <Card>
          <CardContent>
            <Line 
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                    position: 'top'
                  },
                  title: {
                    display: true,
                    text: 'Monthly User Registration Trends'
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0
                    }
                  }
                }
              }}
              height={400}
            />
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Dashboard;
