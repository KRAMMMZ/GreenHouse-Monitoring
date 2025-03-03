import React, { useEffect, useState } from "react";
import MetricCard from "../components/DashboardCards";
import { PieChart } from "@mui/x-charts/PieChart";
 
 
import {
  
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
import Metric from "../props/MetricSection";
import { useMaintenanceToday } from "../hooks/MaintenanceHooks";
import EngineeringIcon from '@mui/icons-material/Engineering';
import useBarChartCardToday from '../hooks/BarChartCardHooks'; 
import usePieChartCardToday from '../hooks/PieChartCardHooks';
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

  const { harvestItemsToday, isLoading} = useTotalHarvestsToday();
  const totalHarvestCountToday = useBarChartCardToday();

  const { totalRejects, rejectLoading} = useTotalRejectToday();
  const totalRejectCountToday = usePieChartCardToday();

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
            icon={<EngineeringIcon sx={{ fontSize: "4rem", color: "#fff" }} />}
          />
           
          )}
        </div>
        
      </div>
      <div className="row g-4 mb-2">
        <div className="col-12 col-md-6">
          <RejectionPieChart />
        </div>
        <div className="col-12 col-md-6">
          {logsLoading ? (
            <HarvestSkeliton />
          ) : (
            <UserLogs logs={userActivityLogs} />
          )}
        </div>
      </div>

      <div className="row">
  <div className="col-12">
    <HarvestChart />
  </div>
</div>

    </div>
  );
}

export default Dashboard;
