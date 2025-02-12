import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Paper, Typography } from '@mui/material';
import useHarvestHistory from '../hooks/BarChartHooks';  // Fixed incorrect importss
import BarChartSkeliton from '../skelitons/BarChartSkeliton';

const HarvestBarChart = () => {
  const {harvestHistory, loading} = useHarvestHistory();

  if (loading) {
    return (
      <BarChartSkeliton/>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 2, backgroundColor: "#FDFCFB ", borderRadius: "20px", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.15)" }}>
      <Typography variant="h6" gutterBottom>
        Harvest History (Last 7 Days)
      </Typography>
      <div style={{ height: 300, width: '100%', backgroundColor: "#FDFCFB ", borderRadius: "20px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={harvestHistory}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="accepted" fill="#ff6b35" name="Accepted Items" />
            <Bar dataKey="rejected" fill="#1d3557" name="Rejected Items" />
            <Bar dataKey="totalYield" fill="#4169E1" name="Total Yield" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Paper>
  );   
};

export default HarvestBarChart;
