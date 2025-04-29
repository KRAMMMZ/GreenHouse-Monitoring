import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const COLORS = ["#ff6b35", "#82D682", "#4169E1"];

const dummyData = [
  { name: "Loading", value: 0 },
  { name: "Loading", value: 0 },
  { name: "Loading", value: 0 },
];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx, cy, midAngle, innerRadius, outerRadius, percent, index
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      style={{ fontSize: '12px' }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const MetricCard = ({ title, value, chartType, data }) => {
  const chartData = data && data.length > 0 ? data : dummyData;

  return (
    <div
      className="d-flex flex-column flex-md-row align-items-center text-white p-3 w-100"
      style={{
        borderRadius: "8px",
        backgroundColor: "#fff",
        overflow: "hidden",
        minHeight: "100px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.35)",
      }}
    >
      {/* Text Section */}
      <div
        className="text-center text-md-left d-flex flex-column justify-content-center"
        style={{
          flex: "1",
          padding: "8px",
        }}
      >
        <h2
          className="display-6 fw-bold mb-2 mb-md-0"
          style={{
            color: "#000",
            fontSize: "clamp(2.5rem, 4vw, 3rem)",
          }}
        >
          {value}
        </h2>
        <p
          className="medium fw-bold mb-0"
          style={{
            color: "#000",
            fontSize: "clamp(0.675rem, 1.7vw, .9rem)",
          }}
        >
          {title}
        </p>
      </div>

      {/* Chart Section (Visible only on large screens and above) */}
      <div
        className="d-none d-lg-flex justify-content-center align-items-center"
        style={{
          flex: "1",
          height: "100%",
          padding: "6px",
        }}
      >
        <ResponsiveContainer width="100%" height={107}>
          {chartType === "line" ? (
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <Tooltip
                contentStyle={{
                  backgroundColor: "#333",
                  color: "#000",
                  borderRadius: "5px",
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#4169E1"
                strokeWidth={2}
                dot={{ fill: "#333", strokeWidth: 5 }}
              />
            </LineChart>
          ) : chartType === "bar" ? (
            <BarChart data={chartData}>
              <Tooltip contentStyle={{ fontSize: "12px" }} itemStyle={{ fontSize: "12px" }} />
              <Bar dataKey="accepted" fill="#FFD700" name="Accepted Items" />
              <Bar dataKey="rejected" fill="#FF6B6B" name="Rejected Items" />
              <Bar dataKey="totalYield" fill="#00E676" name="Total Yield" />
            </BarChart>
          ) : chartType === "area" ? (
            <AreaChart
              data={chartData}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <Tooltip
                contentStyle={{
                  backgroundColor: "#333",
                  color: "#fff",
                  borderRadius: "5px",
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#4169E1"
                fill="#4169E1"
                strokeWidth={2}
              />
            </AreaChart>
          ) : chartType === "pie" ? (
            <PieChart width={200} height={200}>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={50}
                labelLine={false}
                label={renderCustomizedLabel}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: "12px" }} itemStyle={{ fontSize: "12px" }} />
            </PieChart>
          ) : null}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MetricCard;
