import React from "react";
import { Box, useTheme, Typography, Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper } from "@mui/material";
import Header from "components/Header";
import StatBox from "components/StatBox";
import FlexBetween from "components/FlexBetween";

const SystemLogsAndSecurity = () => {
  const theme = useTheme();

  const events = [
    { eventNo: "001", name: "Admin 1", eventName: "System Update" },
    { eventNo: "002", name: "Admin 2", eventName: "Security Patch" },
    { eventNo: "003", name: "Admin 1", eventName: "User Login" },
    { eventNo: "004", name: "Admin 2", eventName: "Admin Panel Access" },
  ];

  return (
    <Box p="1.5rem 2.5rem" backgroundColor={theme.palette.primary[400]}>
      <FlexBetween>
        <Header title="System Logs & Security" />
      </FlexBetween>

      <Box mt="2rem" width={"100%"} height={"100%"} backgroundColor={theme.palette.background.alt} borderRadius="0.55rem" p="1.25rem 1rem" display="flex" flexDirection="column" justifyContent="space-between">
        <Box width={"100%"} height={"100%"} display="flex" flexDirection="row" justifyContent="space-between">
          <StatBox title="Total Users" value="156" />
          <StatBox title="New Applicants" value="55" />
          <StatBox title="Pending Approval" value="34" />
        </Box>

        {/* Table Section */}
        <Box mt="2rem">
          <Typography variant="h6" mb={1}>Recent Events</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><b>Event No.</b></TableCell>
                  <TableCell><b>Name</b></TableCell>
                  <TableCell><b>Event Name</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.eventNo}>
                    <TableCell>{event.eventNo}</TableCell>
                    <TableCell>{event.name}</TableCell>
                    <TableCell>{event.eventName}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

      </Box>
    </Box>
  );
};

export default SystemLogsAndSecurity;
