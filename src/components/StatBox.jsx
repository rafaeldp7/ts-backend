import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import FlexBetween from "./FlexBetween";

const StatBox = ({ title, value ,number}) => {
  const theme = useTheme();
  return (
    <Box
      gridColumn="span 4"
      gridRow="span 1"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      p="1.25rem 1rem"
      flex="1 1 100%"
      backgroundColor={theme.palette.background.alt}
      borderRadius="0.55rem"
    >
      <FlexBetween>
        <Typography variant="h3" sx={{ color: theme.palette.primary[100] }}>
          {title}
        </Typography>
        
      </FlexBetween>
      <FlexBetween>      
        <Typography
        variant="h1"
        fontWeight="600"
        sx={{ color: theme.palette.secondary[500] }}
      >
        {value}
      </Typography></FlexBetween>



    </Box>
  );
};

export default StatBox;