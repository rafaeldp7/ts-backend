import React, { useState, useEffect } from "react";
import FlexBetween from "components/FlexBetween";
import Header from "components/Header";
import { Box, Typography, useMediaQuery } from "@mui/material";
import { Line } from "react-chartjs-2";
// import { REACT_APP_LOCALHOST_IP } from ".env";
import StatBox from "components/StatBox";



const REACT_LOCALHOST_IP = "192.168.107.122";

console.log("localhost server: "+REACT_LOCALHOST_IP);
const Overview = () => {
  // const theme = useTheme();
  const isNonMediumScreens = useMediaQuery("(min-width: 1200px)");

  const [userCount, setUserCount] = useState(0);
  const [newUsersThisMonth, setNewUsersThisMonth] = useState(0);
  const [topUser, setTopUser] = useState(null);
  const [userGrowth, setUserGrowth] = useState(Array(12).fill(0)); // Default 12 months, 0 users
  const [totalTrips, setTotalTrips] = useState(0); // Total trips
  const [totalGasConsumed, setTotalGasConsumed] = useState(0); // Total trips
  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const res = await fetch(`http://${REACT_LOCALHOST_IP}:5000/api/auth/user-count`);
        const data = await res.json();
        setUserCount(data.count);
      } catch (error) {
        console.error("Error fetching user count:", error);
      }
    };

    fetchUserCount();
  }, []);

  useEffect(() => {
    const fetchNewUsers = async () => {
      try {
        const res = await fetch(`http://${REACT_LOCALHOST_IP}:5000/api/auth/new-users-this-month`);
        const data = await res.json();
        setNewUsersThisMonth(data.count);
      } catch (error) {
        console.error("Error fetching new users:", error);
      }
    };
  
    fetchNewUsers();
  }, []);

  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        const res = await fetch(`http://${REACT_LOCALHOST_IP}:5000/api/auth/first-user-name`);
        const data = await res.json();
        setTopUser(data.name);
      } catch (error) {
        console.error("Error fetching new users:", error);
      }
    };
  
    fetchTopUsers();
  }, []);
  useEffect(() => {
    const fetchGasConsumption = async () => {
      try {
        const res = await fetch(`http://${REACT_LOCALHOST_IP}:5000/api/gas-sessions/gasConsumption`);
        if (!res.ok) throw new Error("Network response was not ok");

        const data = await res.json();
        setTotalGasConsumed(data.totalGasConsumed);
      } catch (error) {
        console.error("Error fetching gas consumption:", error);
      }
    };

    fetchGasConsumption();
  }, []);

  useEffect(() => {
    const fetchUserGrowth = async () => {
      try {
        const res = await fetch(`http://${REACT_LOCALHOST_IP}:5000/api/auth/user-growth`);
        const data = await res.json();
        setUserGrowth(data.monthlyData);
      } catch (error) {
        console.error("Error fetching user growth:", error);
      }
    };
  
    fetchUserGrowth();
  }, []);
  useEffect(() => {
    const fetchTripsCount = async () => {
      try {
        const res = await fetch(`http://${REACT_LOCALHOST_IP}:5000/api/gas-sessions/`);
        const data = await res.json();
        setTotalTrips(data.count);
      } catch (error) {
        console.error("Error fetching user count:", error);
      }
    };

    fetchTripsCount();
  }, []);

  return (
    <Box m="1.5rem 2.5rem">
      <FlexBetween>
        <Header title="Welcome, Admin!" subtitle=" " />
      </FlexBetween>

      <Box
        mt="20px"
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="160px"
        gap="20px"
        sx={{
          "& > div": { gridColumn: isNonMediumScreens ? undefined : "span 12" },
        }}
      >
        <StatBox title="Total Users" value={userCount} />
        {/* <StatBox title= {{REACT_LOCALHOST_IP} + "HEYY "} value="120" /> */}
        <StatBox title="Total Motors" value="0" />
        <StatBox title="Total Trips" value={totalTrips} />

        <StatBox title="New Users This Month" value={newUsersThisMonth} />
        <StatBox title="Total Gas Consumption" value={"0L"} />
        <StatBox title="Top Rider" value={topUser} />
      </Box>

      <Box mt="40px" height="100%" width="100%" alignItems="center" justifyContent="center">
        <FlexBetween><Typography variant="h2">User Growth</Typography></FlexBetween>

        <FlexBetween mt="20px" sx={{ backgroundColor: "white", borderRadius: "0.55rem" }}>
          <Line data={{
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            datasets: [
              {
                label: "Users",
                data: userGrowth,
                fill: false,
                backgroundColor: "#00ADB5",
                borderColor: "#00ADB5",
              },
            ],
          }} />
        </FlexBetween>
      </Box>
    </Box> 
  );
};

export default Overview;
