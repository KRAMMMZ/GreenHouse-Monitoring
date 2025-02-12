import React from 'react';
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { Paper, Typography, Box } from '@mui/material';
import useRejectionDataPerDay from '../hooks/PieChartHooks';
import RejectionPieChartSkeliton from '../skelitons/PieChartSkeliton';
import RejectionPieChartDUMMY from '../components/PieCharts';
const COLORS = ['#ff6b35', '#1d3557', '#4169E1'];

const RejectionPieChart = () => {
  const { rejectionData, loading } = useRejectionDataPerDay();

  // Check if all values are zero
  const isDataEmpty = rejectionData.every((item) => item.value === 0);

  if (loading) {
    return (
      <RejectionPieChartSkeliton/>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 2, borderRadius: '20px', backgroundColor: "#FDFCFB", position: 'relative' , boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.15)"}}>
      <Typography variant="h6" gutterBottom>
        Rejection Analysis
      </Typography>

      {isDataEmpty ? (
       <RejectionPieChartDUMMY/>
      ) : (
        <div style={{ height: 300, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={rejectionData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {rejectionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      <Box sx={{ position: 'absolute', bottom: 7, left: 15 }}>
        <Typography variant="h7" color="textSecondary">
          {new Date().toLocaleDateString()}
        </Typography>
      </Box>
    </Paper>
  );
};

export default RejectionPieChart;