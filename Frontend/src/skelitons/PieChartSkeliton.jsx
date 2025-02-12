import React from 'react';
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { Paper, Typography, Box } from '@mui/material';

const COLORS = ['#ff6b35', '#1d3557', '#4169E1'];

const RejectionPieChartSkeliton = () => (
  <Paper elevation={3} sx={{ p: 3, mb: 2, borderRadius: '20px', backgroundColor: "#d8d8d8", position: 'relative' }}>
    <Typography variant="h6" gutterBottom>
      Rejection Analysis
    </Typography>

    <Typography variant="body1" color="textSecondary" textAlign="center" sx={{ mt: 4 }}>
      No rejection data available for today.
    </Typography>

    <div style={{ height: 300, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
            <Cell fill={COLORS[0]} />
            <Cell fill={COLORS[1]} />
            <Cell fill={COLORS[2]} />
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>

    <Box sx={{ position: 'absolute', bottom: 10, left: 20 }}>
      <Typography variant="h6" color="textSecondary">
        {new Date().toLocaleDateString()}
      </Typography>
    </Box>
  </Paper>
);

export default RejectionPieChartSkeliton;
