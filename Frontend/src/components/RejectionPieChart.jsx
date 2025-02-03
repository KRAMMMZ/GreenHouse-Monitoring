import React from 'react';
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { Paper, Typography, Box } from '@mui/material';
import useRejectionDataPerDay from '../hooks/PieChartHooks';  // Import the rejection hook

const COLORS = ['#FF5722', '#2196F3', '#FFC107'];  // Colors for the pie chart

const RejectionPieChart = () => {
  const { rejectionData, loading } = useRejectionDataPerDay();  // Using the rejection data hook

  if (loading) {
    return (
      <Paper elevation={3} sx={{ p: 3, mb: 2, borderRadius: '20px', position: 'relative' }}>
        <Typography variant="h6" gutterBottom>
          Rejection Analysis
        </Typography>
        <Typography variant="body1" color="textSecondary" textAlign="center">
          Loading data...
        </Typography>
      </Paper>
    );
  }

  // Aggregate data for the pie chart
  const aggregatedData = [
    { name: 'Diseased', value: rejectionData.diseased },
    { name: 'Physically Damaged', value: rejectionData.physically_damaged },
    { name: 'Too Small', value: rejectionData.too_small },
  ];

  // Check if all values are zero (for displaying a message when there is no data)
  const isDataEmpty = aggregatedData.every((item) => item.value === 0);

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 2, borderRadius: '20px', position: 'relative' }}>
      <Typography variant="h6" gutterBottom>
        Rejection Analysis
      </Typography>

      {isDataEmpty ? (
        <Typography variant="body1" color="textSecondary" textAlign="center" sx={{ mt: 4 }}>
          No rejection data available for today.
        </Typography>
      ) : (
        <div style={{ height: 300, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={aggregatedData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {aggregatedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      <Box sx={{ position: 'absolute', bottom: 10, left: 20 }}>
        <Typography variant="h6" color="textSecondary">
          {new Date().toLocaleDateString()}  {/* Show current date */}
        </Typography>
      </Box>
    </Paper>
  );
};

export default RejectionPieChart;
