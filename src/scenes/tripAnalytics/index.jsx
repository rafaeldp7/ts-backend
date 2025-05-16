import React from "react";
import { Box, Typography, useTheme, Grid, Paper } from "@mui/material";
import Header from "components/Header";
import FlexBetween from "components/FlexBetween";

const TripAnalytics = () => {
  const theme = useTheme();

  const stats = [
    { label: "Total Distance Travelled", value: "2398 km" },
    { label: "Total Time Traveled", value: "291m" },
    { label: "Total Gas Consumption", value: "127.1 L" },
    { label: "Total Trips Recorded", value: "562" },
  ];

  const monthlyStats = [
    { label: "Total Gas Expense", value: "₱ 19,881" },
    { label: "Total Trips Finished", value: "278" },
    { label: "Distance Traveled", value: "287 KM" },
    { label: "Time Traveled", value: "1,092 m" },
    { label: "Most Active User", value: "Marcus Aurelius" },
    { label: "Average Speed", value: "35 kmph" },
    { label: "Most Visited Location", value: "SM Valenzuela" },
  ];

  return (
    <Box p="1.5rem 2.5rem" backgroundColor={theme.palette.primary[400]}>
      
      <FlexBetween>
      <Header title="Trip Analytics" textAlign="center"/>
      </FlexBetween>


      {/* Overall Stats */}
      <Box
        mt="2rem"
        p="1.5rem"
        backgroundColor={theme.palette.background.alt}
        borderRadius="0.55rem"
      >
        <Grid container spacing={3} justifyContent="center">
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                elevation={3}
                sx={{
                  padding: "1rem",
                  textAlign: "center",
                  backgroundColor: theme.palette.background.default,
                  borderRadius: "0.55rem",
                }}
              >
                <Typography variant="subtitle2" color="textSecondary">
                  {stat.label}
                </Typography>
                <Typography variant="h4" fontWeight="bold" color={theme.palette.secondary[500]}>
                  {stat.value}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Monthly Breakdown */}
      <Box
        mt="2rem"
        p="1.5rem"
        backgroundColor={theme.palette.background.alt}
        borderRadius="0.55rem"
      >
        <Typography variant="h6" mb={2}>
          THIS MONTH »
        </Typography>
        <Grid container spacing={3}>
          {monthlyStats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                elevation={3}
                sx={{
                  padding: "1rem",
                  textAlign: "center",
                  backgroundColor: theme.palette.background.default,
                  borderRadius: "0.55rem",
                }}
              >
                <Typography variant="subtitle2" >
                  {stat.label}
                </Typography>
                <Typography variant="h5" fontWeight="bold" color={theme.palette.secondary[500]}>
                  {stat.value}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default TripAnalytics;
