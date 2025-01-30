import React, { useEffect, useState } from "react";
import MetricCard from "../components/DashboardCards";
import { PieChart } from "@mui/x-charts/PieChart";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
  Typography,
  Box
} from "@mui/material";
import { useRejectedItemsPerDay, useTotalYield, useAcceptedPerDay } from "../hooks/HarvestPerDayChart";
import { useAcceptedChart, useRejectedChart,useYieldChart } from "../hooks/Charts";
import "../../public/dashboard.css";
import HarvestChart from "../components/BarCharts";
import RejectionPieChart from "../components/PieCharts";

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

  const acceptedItems = useAcceptedPerDay();
  const rejectedItems = useRejectedItemsPerDay();
  const totalYield = useTotalYield();

  const acceptedChart = useAcceptedChart();
  const rejectedChart = useRejectedChart();
  const yieldChart = useYieldChart();


  
  return (
    <div className="container-fluid p-3">
      <h1 className="mb-4">DASHBOARD</h1>

      <div className="row g-4 mb-4">
        <div className="col-12 col-md-6 col-lg-3">
          <MetricCard
            title="Total Harvests "
             value={acceptedItems}
            color="bg-primary"
            chartType="line"
            data={acceptedChart}
          />
        </div>

        <div className="col-12 col-md-6 col-lg-3">
           <MetricCard
            title="Total Rejected"
            value={rejectedItems}
            color="bg-success"
            chartType="area"
            data={rejectedChart}
          />
        </div>

        <div className="col-12 col-md-6 col-lg-3">
           <MetricCard
            title="Total Yield"
            value={totalYield}
            color="bg-warning"
            chartType="line"
            data={yieldChart}
          />
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <MetricCard
            title="TBD"
            value="TBD"
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
         <HarvestChart/>
         <RejectionPieChart/> 
      </div>

      <div className="d-flex">
      <Paper
        sx={{
          width: "100%",
          overflow: "hidden",
          borderRadius: "10px",
          boxShadow: 3,
          padding: 2,
        }}
      >
        <TableContainer>
          <Table sx={{ minWidth: 650, backgroundColor: "#d8d8d8" }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#4169E1", borderRadius: "10px" }}>
                {["Report ID", "Type", "Generated Date", "Status", "Actions"].map((header) => (
                  <TableCell
                    key={header}
                    align="center"
                    sx={{
                      fontWeight: "bold",
                      color: "#fff",
                      fontSize: "1.1rem",
                      py: 2.5
                    }}
                  >
                    {loading ? (
                      <Skeleton
                        variant="text"
                        sx={{ 
                          width: '70%', 
                          mx: 'auto',
                          bgcolor: "rgba(255, 255, 255, 0.8)"
                        }}
                      />
                    ) : (
                      header
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {(loading ? Array.from(new Array(5)) : []).map((_, index) => (
                <TableRow key={index} hover sx={{ borderRadius: "10px" }}>
                  {[...Array(5)].map((_, cellIndex) => (
                    <TableCell
                      key={cellIndex}
                      align="center"
                      sx={{ fontSize: "1.0rem", py: 1.5 }}
                    >
                      <Skeleton
                        variant="text"
                        sx={{ width: '80%', mx: 'auto' }}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Skeleton
              variant="rectangular"
              width={300}
              height={40}
              sx={{ borderRadius: "4px" }}
            />
          </Box>
        )}
      </Paper>
      </div>
    </div>
  );
}

export default Dashboard;
