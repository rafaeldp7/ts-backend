import React from "react";
import { Box, useTheme, Typography, Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper } from "@mui/material";
import Header from "components/Header";
import StatBox from "components/StatBox";
import FlexBetween from "components/FlexBetween";

const Reports = () => {
  const theme = useTheme();

  const reports = [
    { reportNo: "R-001", reporter: "John Doe", subject: "System Bug", status: "Resolved" },
    { reportNo: "R-002", reporter: "Jane Smith", subject: "Unauthorized Access", status: "Pending" },
    { reportNo: "R-003", reporter: "Alice Johnson", subject: "Data Breach Alert", status: "Investigating" },
    { reportNo: "R-004", reporter: "Bob Brown", subject: "Slow Performance", status: "Ongoing" },
  ];

  return (
    <Box p="1.5rem 2.5rem" backgroundColor={theme.palette.primary[400]}>
      <FlexBetween>
        <Header title="Reports" />
      </FlexBetween>

      <Box mt="2rem" width={"100%"} height={"100%"} backgroundColor={theme.palette.background.alt} borderRadius="0.55rem" p="1.25rem 1rem" display="flex" flexDirection="column" justifyContent="space-between">
        
        {/* Statistics Section */}
        <Box width={"100%"} height={"100%"} display="flex" flexDirection="row" justifyContent="space-between">
          <StatBox title="Total Reports" value="45" />
          <StatBox title="Resolved" value="30" />
          <StatBox title="Pending" value="15" />
        </Box>

        {/* Table Section */}
        <Box mt="2rem">
          <Typography variant="h6" mb={1}>Recent Reports</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><b>Report No.</b></TableCell>
                  <TableCell><b>Reporter</b></TableCell>
                  <TableCell><b>Subject</b></TableCell>
                  <TableCell><b>Status</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.reportNo}>
                    <TableCell>{report.reportNo}</TableCell>
                    <TableCell>{report.reporter}</TableCell>
                    <TableCell>{report.subject}</TableCell>
                    <TableCell>{report.status}</TableCell>
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

export default Reports;
