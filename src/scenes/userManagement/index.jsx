import React, { useState, useEffect } from "react";
import { Chart, registerables } from "chart.js";
import { Box, Typography, Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Pie } from "react-chartjs-2";
import FlexBetween from "components/FlexBetween";
import Header from "components/Header";

Chart.register(...registerables);

const LOCALHOST_IP = "192.168.107.122";

const UserManagement = () => {
  const [users, setUsers] = useState([]); // Dynamic user data
  const [userCount, setUserCount] = useState(0); // Total users
  const [barangayData, setBarangayData] = useState(null); // Pie chart data

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`http://${LOCALHOST_IP}:5000/api/auth/users`);
        const data = await res.json();

        setUsers(data); // Set user list
        setUserCount(data.length); // Set total user count

        // Count users per barangay
        const barangayCounts = data.reduce((acc, user) => {
          acc[user.barangay] = (acc[user.barangay] || 0) + 1;
          return acc;
        }, {});

        setBarangayData({
          labels: Object.keys(barangayCounts),
          datasets: [{ 
            label: "Users per Barangay",
            data: Object.values(barangayCounts),
            backgroundColor: ["#3f51b5", "#f44336", "#4caf50", "#ffeb3b", "#ff9800"],
          }],
        });

      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);


  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "name", headerName: "Name", flex: 0.5 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "barangay", headerName: "Barangay", flex: 0.4 },
    { field: "street", headerName: "Street", flex: 0.4 },
  ];

  return (
    <Box m="1.5rem 2.5rem">
      <FlexBetween>
        <Header title="User Management" />
      </FlexBetween>

      <Typography variant="h4" mt={3}>Total Users: {userCount}</Typography>

      <Box mt="20px" height="75vh">
        <DataGrid getRowId={(row) => row._id} rows={users} columns={columns} />
      </Box>

      {barangayData && (
        <Box mt="40px" height={400} width={900} alignItems="center" justifyContent="center">
          <Typography variant="h6">Barangay Distribution</Typography>
          <Pie data={barangayData} />
        </Box>
      )}
    </Box>
  );
};

export default UserManagement;
