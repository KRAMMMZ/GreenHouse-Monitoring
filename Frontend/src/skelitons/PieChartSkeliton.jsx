import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Paper, Typography } from "@mui/material";

const BarChartSkeliton = () => {
  return (
    <Paper
      elevation={3}
      sx={{ p: 3, mb: 2, backgroundColor: "#fff", borderRadius: "20px" }}
    >
      <Typography variant="h6" gutterBottom>
        Rejection History (Last 7 Days)
      </Typography>
      <div
        style={{
          height: 300,
          width: "100%",
          backgroundColor: "#d8d8d8",
          borderRadius: "20px",
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
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
            <Bar dataKey="accepted" fill="#ff6b35" name="Diseased" />
            <Bar dataKey="rejected" fill="#1d3557" name="Physically Damage" />
            <Bar dataKey="totalYield" fill="#4169E1" name="Too Small" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Paper>
  );
};

export default BarChartSkeliton;
