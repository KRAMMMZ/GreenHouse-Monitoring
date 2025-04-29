import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Paper, Typography } from '@mui/material';
import useHarvestHistory from '../hooks/HarvestBarChartHooks'; // Using the same hook
import BarChartSkeliton from '../skelitons/BarChartSkeliton';

const HarvestLineChart = () => {
  const {
    harvestHistory,
    loading,
    getCurrentDayData,
    getOverallTotalData,
    getCurrentMonthData,
    getMonthData,
    filterHarvestData,
  } = useHarvestHistory();

  if (loading) {
    return <BarChartSkeliton />;
  }

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        mb: 2,
        borderRadius: '5px',
        backgroundColor: '#fff',
        position: 'relative',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.35)',
        height: '100%',
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ color: '#000', fontWeight:"bold" }}>
        Harvest History (Last 7 Days)
      </Typography>

      <div style={{ height: 400, width: '100%', backgroundColor: '#fff', borderRadius: '20px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={harvestHistory}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            {/* Light grid lines */}
            <CartesianGrid stroke="#666" strokeDasharray="3 3" />

            {/* X and Y axes styled in white */}
            <XAxis
              dataKey="date"
              stroke="#000"
              tick={{ fill: '#000' }}
            />
            <YAxis
              stroke="#000"
              tick={{ fill: '#000' }}
            />

            {/* Tooltip with dark background and white text */}
            <Tooltip
              contentStyle={{ backgroundColor: '#06402B', border: '1px solid #fff' }}
              labelStyle={{ color: '#fff' }}
             
            />

            {/* Legend text in white */}
            <Legend
              wrapperStyle={{ color: '#000' }}
              formatter={(value) => <span style={{ color: '#000' }}>{value}</span>}
            />

            {/* Lines with contrasting, bright strokes */}
            <Line
              type="monotone"
              dataKey="accepted"
              stroke="#FFD700"
              name="Accepted Items"
              strokeWidth={5}
              dot={{ stroke: '#FFD700', strokeWidth: 2, r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="rejected"
              stroke="#FF6B6B"
              name="Rejected Items"
              strokeWidth={5}
              dot={{ stroke: '#FF6B6B', strokeWidth: 2, r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="totalYield"
              stroke="#00E676"
              name="Total Yield"
              strokeWidth={5}
              dot={{ stroke: '#00E676', strokeWidth: 2, r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Paper>
  );
};

export default HarvestLineChart;
