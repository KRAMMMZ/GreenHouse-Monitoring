import React from "react";
import { Paper, Skeleton, Typography, Box } from "@mui/material";

function Graph() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Harvest Analytics
      </Typography>
      
      {/* Line Chart Skeleton */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 ,backgroundColor: "#d8d8d8"}}>
        <Skeleton variant="text" width={200} height={40} />
        <Skeleton variant="rectangular" width="100%" height={400} sx={{ mt: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Skeleton variant="text" width={60} />
          <Skeleton variant="text" width={60} />
          <Skeleton variant="text" width={60} />
        </Box>
      </Paper>

      {/* Bar Chart Skeleton */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 ,backgroundColor: "#d8d8d8"}}>
        <Skeleton variant="text" width={200} height={40} />
        <Skeleton variant="rectangular" width="100%" height={400} sx={{ mt: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Skeleton variant="text" width={80} />
          <Skeleton variant="text" width={80} />
          <Skeleton variant="text" width={80} />
        </Box>
      </Paper>

      {/* Pie Chart Skeleton */}
      <Paper elevation={3} sx={{ p: 3, mb: 4,backgroundColor: "#d8d8d8" }}>
        <Skeleton variant="text" width={200} height={40} />
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          <Skeleton variant="circular" width={300} height={300} />
          <Box sx={{ ml: 4, width: '100%' }}>
            <Skeleton variant="text" width={120} height={30} />
            <Skeleton variant="text" width={120} height={30} />
            <Skeleton variant="text" width={120} height={30} />
          </Box>
        </Box>
      </Paper>

      {/* Stats Overview Skeleton */}
      <Paper elevation={3} sx={{ p: 3 ,backgroundColor: "#d8d8d8"}}>
        <Skeleton variant="text" width={200} height={40} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          {[1, 2, 3, 4].map((item) => (
            <Paper key={item} sx={{ p: 2, width: '23%' }}>
              <Skeleton variant="text" width={80} />
              <Skeleton variant="text" width={120} height={50} />
              <Skeleton variant="text" width={100} />
            </Paper>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}

export default Graph;