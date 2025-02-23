import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { Paper, Typography, Box } from "@mui/material";
import useRejectionData from "../hooks/PieChartHooks";
import PieChartSkeliton from "../skelitons/PieChartSkeliton"

const RejectionBarChart = () => {
  const { timeSeriesData, loading } = useRejectionData();

  if (loading) {
    return <PieChartSkeliton />;
  }


  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        mb: 2,
        borderRadius: "5px",
        backgroundColor: "#FDFCFB",
        position: "relative",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)"
      }}
    >
      <Typography variant="h6" gutterBottom>
        Rejection Analysis Over Time
      </Typography>

      <div style={{ height: 300, width: "100%", backgroundColor: "#fff"}}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="diseased" fill="#ff6b35" />
            <Bar dataKey="physically_damaged" fill="#1d3557" />
            <Bar dataKey="too_small" fill="#4169E1" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <Box sx={{ position: "absolute", bottom: 7, left: 15 }}>
        <Typography variant="h7" color="textSecondary">
          {new Date().toLocaleDateString()}
        </Typography>
      </Box>
    </Paper>
  );
};

export default RejectionBarChart;
