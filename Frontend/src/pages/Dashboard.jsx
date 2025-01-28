import React from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";
import { LineChart } from "@mui/x-charts/LineChart";
import "../../public/dashboard.css";

function Dashboard() {
  return (
    <div className="container-fluid p-3">
      <h1 className="mb-5"> DASHBOARD</h1>

      <div
        className="d-flex align-items-center justify-content-between mb-3"
        style={{ gap: "20px" }}
      >
        <BarChart
          xAxis={[
            { scaleType: "band", data: ["group A", "group B", "group C"] },
          ]}
          series={[
            { data: [4, 3, 5] },
            { data: [1, 6, 3] },
            { data: [2, 5, 6] },
          ]}
          width={700}
          height={300}
          sx={{ backgroundColor: "#e0e0e0", borderRadius: "10px" }} // Added background color and border-radius
        />
        <PieChart
          series={[
            {
              data: [
                { id: 0, value: 10, label: "series A" },
                { id: 1, value: 15, label: "series B" },
                { id: 2, value: 20, label: "series C" },
              ],
            },
          ]}
          width={700}
          height={300}
          sx={{ backgroundColor: "#e0e0e0", borderRadius: "10px" }} // Added background color and border-radius
        />
      </div>

      <div className="d-flex">
        <LineChart
          xAxis={[{ data: [1, 2, 3, 5, 8, 10] }]}
          series={[
            {
              data: [2, 5.5, 2, 8.5, 1.5, 5],
              area: true,
            },
          ]}
          width={1000}
          height={400}
          sx={{ backgroundColor: "#e0e0e0", borderRadius: "10px" }} // Added background color and border-radius
        />
      </div>
    </div>
  );
}

export default Dashboard;
