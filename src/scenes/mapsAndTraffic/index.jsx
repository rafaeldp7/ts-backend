import React, { useEffect, useState } from "react";
import { GoogleMap, LoadScript, TrafficLayer } from "@react-google-maps/api";
import { Box, Typography, Paper, useTheme } from "@mui/material";
import Header from "components/Header";
import StatBox from "components/StatBox";
import FlexBetween from "components/FlexBetween";

const MAPS_API = process.env.GOOGLE_MAPS_API_KEY;

const containerStyle = {
  width: "100%",
  height: "500px",
};

const defaultCenter = { lat: 14.7006, lng: 120.9836}; // Manila, Philippines

const MapsAndTraffic = () => {
  const theme = useTheme();
  const [userLocation, setUserLocation] = useState(null);
  const [map, setMap] = useState(null);

  const REACT_LOCALHOST_IP = "192.168.107.122"
  // Fetch user location every 5 seconds
  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        const res = await fetch(`http://${REACT_LOCALHOST_IP}:5000/api/maps/active-user-location`);
        const data = await res.json();
        setUserLocation({ lat: data.latitude, lng: data.longitude });
      } catch (error) {
        console.error("Error fetching user location:", error);
      }
    };

    fetchUserLocation();
    const interval = setInterval(fetchUserLocation, 5000);
    return () => clearInterval(interval);
  }, []);

  // Enable Traffic Layer when map is ready
  useEffect(() => {
    if (map) {
      const trafficLayer = new window.google.maps.TrafficLayer();
      trafficLayer.setMap(map);
    }
  }, [map]);

  return (
    <Box p="1.5rem 2.5rem" backgroundColor={theme.palette.primary[400]}>
      <FlexBetween>
        <Header title="Maps & Traffic" />
      </FlexBetween>

      <Box
        mt="2rem"
        width="100%"
        height="100%"
        backgroundColor={theme.palette.background.alt}
        borderRadius="0.55rem"
        p="1.25rem 1rem"
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
      >
        <Box mt="1rem" height="820px"> {/* Dinagdagan ng height para may extra space */}
  <Typography variant="h6" mb={1}>
    Live Traffic Map
  </Typography>
  <Paper
    elevation={3}
    sx={{ height: "800px", borderRadius: "0.55rem", overflow: "hidden" }} // Dati 777px, ngayon 800px
  >
    <LoadScript googleMapsApiKey="AIzaSyAzFeqvqzZUO9kfLVZZOrlOwP5Fg4LpLf4">
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "750px" }} // Dati 500px, ngayon 750px
        center={userLocation || defaultCenter}
        zoom={15}
        onLoad={(map) => setMap(map)}
      />
    </LoadScript>
  </Paper>
</Box>

      </Box>
    </Box>
  );
};

export default MapsAndTraffic;
