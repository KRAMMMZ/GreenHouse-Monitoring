import React, { useEffect, useState } from "react";
import MetricCard from "../components/DashboardCards";
import { PieChart } from "@mui/x-charts/PieChart";
 
import {
  useRejectedItemsPerDay,
  useTotalYield,
  useAcceptedPerDay,
} from "../hooks/HarvestPerDayChart";
import {
  useAcceptedChart,
  useRejectedChart,
  useYieldChart,
} from "../hooks/CardChartHooks";
import "../../public/dashboard.css";
import HarvestChart from "../components/HarvestBarCharts";
import RejectionPieChart from "../components/RejectionPieChart";
import RejectionPieChartDUMMY from "../components/PieCharts";
import DashboardSkeliton from "../skelitons/DashboardSkeliton";
import HarvestSkeliton from "../skelitons/HarvestSkeliton";
import {useTotalHarvestsToday } from "../hooks/TotalHarvestHooks"
import { useTotalRejectToday } from "../hooks/RejectItemHooks";


const data = [
  { name: "Jan", value: 30 },
  { name: "Feb", value: 25 },
  { name: "Mar", value: 35 },
  { name: "Apr", value: 40 },
  { name: "May", value: 28 },
  { name: "Jun", value: 26 },
];

function Dashboard() {
  const [loading] = useState(true); // Simulate loading state

  const { accepted, acceptedLoading } = useAcceptedPerDay();
  const { rejected, rejectedLoading } = useRejectedItemsPerDay();
  const { totalYield, totalYieldLoading } = useTotalYield();

  const acceptedChart = useAcceptedChart();
  const rejectedChart = useRejectedChart();
  const yieldChart = useYieldChart();

  const harvestItems = useTotalHarvestsToday();

  return (
    <div className="container-fluid p-3">
      <h1 className="mb-4">DASHBOARD</h1>

      <div className="row g-4 mb-4">
        <div className="col-12 col-md-6 col-lg-3">
          {acceptedLoading ? (
            <DashboardSkeliton />
          ) : (
            <MetricCard
              title=" Accepted Today"
              value={accepted}
              color="bg-primary"
              chartType="line"
              data={acceptedChart}
            />
          )}
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          {rejectedLoading ? (
            <DashboardSkeliton />
          ) : (
            <MetricCard
              title="Rejected Today "
              value={rejected}
              color="bg-primary"
              chartType="area"
              data={rejectedChart}
            />
          )}
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          {totalYieldLoading ? (
            <DashboardSkeliton />
          ) : (
            <MetricCard
              title="Total Yield"
              value={totalYield}
              color="bg-primary"
              chartType="bar"
              data={yieldChart}
            />
          )}
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <MetricCard
            title="TBD"
            value="TBD"
            color="bg-danger"
            chartType="pie"
            data={data}
           
          />
        </div>
      </div>
      <div
        className="d-flex flex-wrap align-items-stretch justify-content-between mb-3"
        style={{ gap: "20px" }}
      >
        <div style={{ flex: "1 1 48%", minWidth: "100px" }}>
          <HarvestChart />
        </div>
        <div style={{ flex: "1 1 48%", minWidth: "100px" }}>
          <RejectionPieChartDUMMY />
        </div>
      </div>

      <div className="d-flex">
          <HarvestSkeliton />
      </div>
    </div>
  );
}

export default Dashboard;
