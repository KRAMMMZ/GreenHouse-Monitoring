import React, { useEffect, useState } from "react";
import MetricCard from "../components/DashboardCards";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";
import { LineChart } from "@mui/x-charts/LineChart";
import useRejectedItems from "../hooks/RejectItemHooks";
import {useTotalHarvests} from "../hooks/TotalHarvestHooks";
import "../../public/dashboard.css";

const data = [
  { name: "Jan", value: 30 },
  { name: "Feb", value: 25 },
  { name: "Mar", value: 35 },
  { name: "Apr", value: 40 },
  { name: "May", value: 28 },
  { name: "Jun", value: 26 },
];

function Dashboard() {
  const rejectedItems = useRejectedItems();
  const harvestItems = useTotalHarvests();
  

  return (
    <div className="container-fluid p-3">
      <h1 className="mb-4">DASHBOARD</h1>

      <div className="row g-4 mb-3">
        <div className="col-12 col-md-6 col-lg-3">
          <MetricCard
            title="Total Harvests"
             value={harvestItems}
            color="bg-primary"
            chartType="line"
            data={data}
          />
        </div>

        <div className="col-12 col-md-6 col-lg-3">
           <MetricCard
            title="Total Rejected"
            value={rejectedItems}
            color="bg-success"
            chartType="area"
            data={data}
          />
        </div>

        <div className="col-12 col-md-6 col-lg-3">
           <MetricCard
            title="Conversion Rate"
            value="2.49%"
            color="bg-warning"
            chartType="line"
            data={data}
          />
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <MetricCard
            title="Sessions"
            value="44K"
            color="bg-danger"
            chartType="bar"
            data={data}
          /> 
        </div>
      </div>
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
          height={350}
          sx={{ backgroundColor: "#d8d8d8", borderRadius: "20px" }} // Added background color and border-radius
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
          height={350}
          sx={{ backgroundColor: "#d8d8d8", borderRadius: "20px" }} // Added background color and border-radius
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
          sx={{ backgroundColor: "#d8d8d8", borderRadius: "20px" }} // Added background color and border-radius
        />
      </div>
    </div>
  );
}

export default Dashboard;
