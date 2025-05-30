import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
} from "@mui/material";
import { useActivityLogs } from "../hooks/AdminLogsHooks";
import HarvestSkeliton from "../skelitons/HarvestSkeliton";
 
function ActivityLogs() {
  // Retrieve all logs from the custom hook
  const {
    adminActivityLogs = [],
    userActivityLogs = [],
    rejectionLogs = [],
    maintenanceLogs = [],
    harvestLogs = [],
    plantedCropsLogs = [],
    hardwareComponentsLogs = [],
    logsLoading, 
     error,
    emptyData, // Get the emptyData state
  } = useActivityLogs();

  // Combine all logs into a single array and add type identifiers
  const allLogs = [
   ...adminActivityLogs.map((log) => ({ ...log, logType: "ADMIN" })),
    ...userActivityLogs.map((log) => ({ ...log, logType: "USERS" })),
    ...rejectionLogs.map((log) => ({ ...log, logType: "REJECTION" })),
    ...maintenanceLogs.map((log) => ({ ...log, logType: "MAINTENANCE" })),
    ...harvestLogs.map((log) => ({ ...log, logType: "HARVESTS" })),
    ...hardwareComponentsLogs.map((log) => ({
      ...log,
      logType: "HARDWARE COMPONENTS",
    })),
    ...plantedCropsLogs.map((log) => ({
      ...log,
      logType: "PLANTED CROPS",
    })),
  ];

  // Sort logs by date (most recent first) and limit display to 5 entries
  const sortedLogs = allLogs.sort(
    (a, b) => new Date(b.log_date) - new Date(a.log_date)
  );
  const displayLogs = sortedLogs.slice(0, 11);

  if (logsLoading) return <HarvestSkeliton />;

  return (
   
     <Paper
      elevation={3}
      sx={{
        p: 1.7,
        
        
        backgroundColor: "#FFF",
        position: "relative",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.35)"
      }}
    >
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ backgroundColor: "#06402B",      }}>
              <TableRow>
                {["Log Date", "Description", "Name"].map((header) => (
                  <TableCell
                    key={header}
                    align="center"
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "1rem",
                       
                    }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {displayLogs.map((log, index) => (
                <TableRow key={`${log.log_id}-${index}`}   hover>
                  <TableCell align="center" sx={{    fontSize: { xs: ".5rem", sm: ".6rem", md: ".8rem" }}}>{log.log_date}</TableCell>
                  <TableCell align="center" sx={{  fontSize: { xs: ".5rem", sm: ".6rem", md: ".8rem" }}}>{log.logs_description}</TableCell>
                  <TableCell align="center" sx={{  fontSize: { xs: ".5rem", sm: ".6rem", md: ".8rem" }}}>{log.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    
  );
}

export default ActivityLogs;