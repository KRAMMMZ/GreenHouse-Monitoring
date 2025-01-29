import React from "react";
import { 
  LineChart, Line, 
  BarChart, Bar, 
  AreaChart, Area, 
  PieChart, Pie, Cell, 
  ResponsiveContainer, Tooltip 
} from "recharts";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088FE"];

const MetricCard = ({ title, value, color, chartType, data }) => (
  <div className={`cards text-white p-3`} style={{ minHeight: "150px", borderRadius: "8px", backgroundColor: "#d8d8d8" }}>
    <div>
      <h2 className="display-6 fw-bold" style={{ color: "#4169E1" }}>{value}</h2>
      <p className="medium fw-bold" style={{ color: "#333" }}>{title}</p>
    </div>

    {/* Chart Container */}
    <div className="mt-2" style={{ width: "100%", height: "60px" }}>
      <ResponsiveContainer width="100%" height="100%">
        {chartType === "line" ? (
          <LineChart data={data}>
            <Tooltip contentStyle={{ backgroundColor: "#333", color: "#fff", borderRadius: "5px" }} />
            <Line type="monotone" dataKey="value" stroke="#4169E1" strokeWidth={2} dot={{ fill: "#333", strokeWidth: 5 }} />
          </LineChart>
        ) : chartType === "bar" ? (
          <BarChart data={data}>
            <Tooltip contentStyle={{ backgroundColor: "#333", color: "#fff", borderRadius: "5px" }} />
            <Bar dataKey="value" fill="#4169E1" />
          </BarChart>
        ) : chartType === "area" ? (
          <AreaChart data={data}>
            <Tooltip contentStyle={{ backgroundColor: "#333", color: "#fff", borderRadius: "5px" }} />
            <Area type="monotone" dataKey="value" stroke="#4169E1" fill="#4169E1" strokeWidth={2} />
          </AreaChart>
        ) : chartType === "pie" ? (
          <PieChart>
            <Tooltip contentStyle={{ backgroundColor: "#333", color: "#fff", borderRadius: "5px" }} />
            <Pie data={data} dataKey="value" nameKey="name" outerRadius={30} label>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        ) : null}
      </ResponsiveContainer>
    </div>
  </div>
);

export default MetricCard;
