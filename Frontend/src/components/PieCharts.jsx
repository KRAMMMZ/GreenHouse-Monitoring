// components/RejectionPieChart.jsx
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';
import { Paper, Typography } from '@mui/material';

const RejectionPieChart = () => {
  // Placeholder data for rejected items
  const rejectionData = [
    { name: 'Too Small', value: 12 },
    { name: 'Diseased', value: 8 },
    { name: 'Physical Damage', value: 5 },
  ];

  const COLORS = ['#ff6b6b', '#ff9f43', '#54a0ff'];

  return (
    <Paper elevation={3} sx={{ 
      p: 3, 
      mb: 2,  
      backgroundColor: "#d8d8d8",
      borderRadius: "16px",
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)'
    }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#2d3436' }}>
        Rejection Analysis
      </Typography>
      <div style={{ 
      height: 300, width: '690px' ,
        position: 'relative',
      }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={rejectionData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              {rejectionData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              ))}
              <Label
                value="Rejections"
                position="centerBottom"
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  fill: '#636e72',
                }}
              />
            </Pie>
            <Tooltip 
              contentStyle={{
                background: '#ffffff',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: 'none'
              }}
            />
            <Legend 
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ 
                paddingTop: 20,
                fontSize: '14px'
              }}
              formatter={(value) => <span style={{ color: '#2d3436' }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Paper>
  );
};

export default RejectionPieChart;