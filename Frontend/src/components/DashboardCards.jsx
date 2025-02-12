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

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088FE"];

// Dummy data for when there's no actual data
const dummyData = [
  { name: "Loading", value: 0 },
  { name: "Loading", value: 0 },
  { name: "Loading", value: 0 },
];

const MetricCard = ({ title, value, chartType, data }) => {
  // If no data is available, use dummy data
  const chartData = data && data.length > 0 ? data : dummyData;

  return (
    <div
      className="d-flex flex-column flex-md-row align-items-center text-white p-3 w-100"
      style={{
        borderRadius: "8px",
        backgroundColor: "#FDFCFB ",
        overflow: "hidden",
        minHeight: "150px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.15)", // Added box shadow
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
            color: "#4169E1",
            fontSize: "clamp(1.5rem, 4vw, 3rem)",
          }}
        >
          {value}
        </h2>
        <p
          className="medium fw-bold mb-0"
          style={{
            color: "#333",
            fontSize: "clamp(0.675rem, 1.7vw, .9rem)",
          }}
        >
          {title}
        </p>
      </div>

      {/* Chart Section */}
      <div
        className="d-flex justify-content-center align-items-center"
        style={{
          flex: "1",
          height: "100%",
          padding: "8px",
        }}
      >
        <ResponsiveContainer width="100%" height={120}>
          {chartType === "line" ? (
            <LineChart
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
              <Bar dataKey="accepted" fill="#ff6b35" name="Accepted Items" />
              <Bar dataKey="rejected" fill="#1d3557" name="Rejected Items" />
              <Bar dataKey="totalYield" fill="#4169E1" name="Total Yield" />
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
            <PieChart>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#333",
                  color: "#fff",
                  borderRadius: "5px",
                }}
              />
              <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={50} label>
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          ) : null}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MetricCard;
