import React, { useRef, useState, useEffect } from "react";
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
import useRejectionData from "../hooks/RejectionLineChartHooks";
import PieChartSkeliton from "../skelitons/PieChartSkeliton";

const RejectionBarChart = () => {
  const { timeSeriesData, loading } = useRejectionData();

  // Ref for the container that wraps the chart.
  const containerRef = useRef(null);
  // State to hold the computed height for the chart area.
  const [chartHeight, setChartHeight] = useState(400); // default fallback

  useEffect(() => {
    if (!containerRef.current) return;
    // Define a function to update the chart height.
    const updateHeight = () => {
      // Total container height.
      const totalHeight = containerRef.current.clientHeight;
      // Assume the header (Typography) along with some padding takes about 50px.
      const headerHeight = 50;
      // Compute the remaining height for the chart.
      const newChartHeight = totalHeight - headerHeight;
      // Update state if the value is valid; else fallback to default.
      setChartHeight(newChartHeight > 0 ? newChartHeight : 300);
    };

    // Initial calculation.
    updateHeight();

    // Set up ResizeObserver to watch for container size changes.
    const resizeObserver = new ResizeObserver(() => {
      updateHeight();
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

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
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
        height: "100%",
       
      }}
    >
      <Typography variant="h6" gutterBottom>
        Rejection History (Last 7 Days)
      </Typography>

      <div style={{ height: 400, width: "100%", backgroundColor: "#fff"}}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="diseased"  name="Diseased" fill="#ff6b35" />
            <Bar dataKey="physically_damaged"   name="Physically Damaged"  fill="#1d3557" />
            <Bar dataKey="too_small" name="Too small" fill="#4169E1" />
          </BarChart>
        </ResponsiveContainer>
        </div>
        

      
    </Paper>
  );
};

export default RejectionBarChart;