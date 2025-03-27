import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Paper, Typography } from '@mui/material';
import useHarvestHistory from '../hooks/HarvestBarChartHooks'; // Using the same hook
import BarChartSkeliton from '../skelitons/BarChartSkeliton';

const HarvestLineChart = () => {
  const { harvestHistory, loading, getCurrentDayData, getOverallTotalData, getCurrentMonthData, getMonthData, filterHarvestData} = useHarvestHistory();

  if (loading) {
    return <BarChartSkeliton />;
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
        Harvest History (Last 7 Days)
      </Typography>
      <div style={{ height: 400, width: '100%', backgroundColor: "#FDFCFB", borderRadius: "20px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
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
            <Line type="monotone" dataKey="accepted" stroke="#ff6b35" name="Accepted Items" strokeWidth={5} />
            <Line type="monotone" dataKey="rejected" stroke="#1d3557" name="Rejected Items" strokeWidth={5} />
            <Line type="monotone" dataKey="totalYield" stroke="#4169E1" name="Total Yield" strokeWidth={5} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Paper>
  );
};

export default HarvestLineChart;
