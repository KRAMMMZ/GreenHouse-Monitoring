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


import useBarChartCardToday from '../hooks/BarChartCardHooks'; 

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

  const totalHarvestToday = useTotalHarvestsToday();
  const totalHarvestCountToday = useBarChartCardToday();
  return (
    <div className="container-fluid p-3">
      <div className="row g-4 mb-4">
        <div className="col-12 col-md-6 col-lg-4">
          {acceptedLoading ? (
            <DashboardSkeliton />
          ) : (
            <MetricCard
              title=" Total Harvests Today"
              value={totalHarvestToday}
              color="bg-primary"
              chartType="bar"
              data={totalHarvestCountToday}
            />
          )}
        </div>

        <div className="col-12 col-md-6 col-lg-4">
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

        <div className="col-12 col-md-6 col-lg-4">
          {totalYieldLoading ? (
            <DashboardSkeliton />
          ) : (
            <MetricCard
              title="Total Yield"
              value={totalYield}
              color="bg-primary"
              chartType="line"
              data={yieldChart}
            />
          )}
        </div>
 
      </div>
      <div className="row g-4 mb-2">
        <div className="col-12 col-md-6">
          <HarvestChart />
        </div>
        <div className="col-12 col-md-6">
          <RejectionPieChart />
        </div>
      </div>

      <div className="d-flex">
        <HarvestSkeliton />
      </div>
    </div>
  );
}

export default Dashboard;
