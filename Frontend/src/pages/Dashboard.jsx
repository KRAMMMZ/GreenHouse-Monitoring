import React, { useEffect, useState } from "react";
import MetricCard from "../components/DashboardCards";
import { PieChart } from "@mui/x-charts/PieChart";

import { useRejectedChart, useYieldChart } from "../hooks/CardChartHooks";
import "../../public/dashboard.css";
import HarvestChart from "../components/HarvestLineCharts";
import RejectionBarChart from "../components/RejectionBarChart";

import DashboardSkeliton from "../skelitons/DashboardSkeliton";
import HarvestSkeliton from "../skelitons/HarvestSkeliton";
import {
  useTotalHarvestsToday,
  useHarvestHistory,
} from "../hooks/HarvestHooks";
import { useTotalRejectToday, RejectedPieChart } from "../hooks/RejectionHooks";
import Metric from "../props/MetricSection";
import { useMaintenanceToday } from "../hooks/MaintenanceHooks";
import EngineeringIcon from "@mui/icons-material/Engineering";

import UserLogs from "../props/UserLogsTable";
import { useActivityLogs } from "../hooks/AdminLogsHooks";

const data = [
  { name: "Jan", value: 30 },
  { name: "Feb", value: 25 },
  { name: "Mar", value: 35 },
  { name: "Apr", value: 40 },
  { name: "May", value: 28 },
  { name: "Jun", value: 26 },
];

function Dashboard() {
  //const acceptedChart = useAcceptedChart();
  const rejectedChart = useRejectedChart();
  const yieldChart = useYieldChart();

  const { harvestItemsToday, isLoading } = useTotalHarvestsToday();
  const totalHarvestCountToday = useHarvestHistory();

  const { totalRejects, rejectLoading } = useTotalRejectToday();
  const totalRejectCountToday = RejectedPieChart();

  const { maintenanceToday, maintenanceTodayLoading } = useMaintenanceToday();

  const {
    userActivityLogs = [],

    logsLoading,
  } = useActivityLogs();

  return (
    <div className="container-fluid p-3">
      <div className="row g-4 mb-4">
        <div className="col-12 col-md-6 col-lg-4">
          {isLoading ? (
            <DashboardSkeliton />
          ) : (
            <MetricCard
              title=" Total Harvests Today"
              value={harvestItemsToday}
              color="bg-primary"
              chartType="bar"
              data={totalHarvestCountToday}
            />
          )}
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          {isLoading ? (
            <DashboardSkeliton />
          ) : (
            <MetricCard
              title="Total Rejected Today "
              value={totalRejects}
              color="bg-primary"
              chartType="pie"
              data={totalRejectCountToday}
            />
          )}
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          {isLoading ? (
            <DashboardSkeliton />
          ) : (
            <Metric
              title="Maintenance Reports"
              value={maintenanceToday}
              loading={maintenanceTodayLoading}
              icon={
                <EngineeringIcon sx={{ fontSize: "4rem", color: "#0A6644" }} />
              }
            />
          )}
        </div>
      </div>
      <div className="row g-4 mb-4">
        <div className="col-12 col-md-6">
          <RejectionBarChart />
        </div>
        <div className="col-12 col-md-6">
          <HarvestChart />
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          {logsLoading ? (
            <HarvestSkeliton />
          ) : (
            <UserLogs logs={userActivityLogs} />
          )}
        </div>
      </div>
    
    </div>
  );
}

export default Dashboard;
