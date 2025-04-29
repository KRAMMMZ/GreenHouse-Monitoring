import React, { useState, useMemo, useCallback } from "react";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Box,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Container,
  Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import SearchIcon from "@mui/icons-material/Search";
import AllInboxIcon from "@mui/icons-material/AllInbox";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PeopleIcon from "@mui/icons-material/People";
import AgricultureIcon from "@mui/icons-material/Agriculture";
import CancelIcon from "@mui/icons-material/Cancel";
import BuildIcon from "@mui/icons-material/Build";
import DeveloperBoardIcon from "@mui/icons-material/DeveloperBoard";
// import SettingsIcon from "@mui/icons-material/Settings"; // Removed SettingsIcon import
import ControlCameraIcon from "@mui/icons-material/ControlCamera";

import LocalFloristIcon from "@mui/icons-material/LocalFlorist";
import { useActivityLogs } from "../hooks/AdminLogsHooks";
import HarvestSkeleton from "../skelitons/HarvestSkeliton";

function ActivityLogs() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    adminActivityLogs = [],
    userActivityLogs = [],
    rejectionLogs = [],
    maintenanceLogs = [],
    harvestLogs = [],
    hardwareComponentsLogs = [],
    // hardwareStatusLogs = [], //hardwareStatusLogs REMOVED
    controlsLog = [],
    plantedCropsLogs = [], // Destructure planted crops logs
    logsLoading,
    error,
    emptyData, // Get the emptyData state
  } = useActivityLogs();

  // Combine all logs with type identifiers.
  // Note: We now map controlsLog with "CONTROLS" and plantedCropsLogs with "PLANTED CROPS".
  const allLogs = useMemo(
    () => [
      ...adminActivityLogs.map((log) => ({ ...log, logType: "ADMIN" })),
      ...userActivityLogs.map((log) => ({ ...log, logType: "USERS" })),
      ...rejectionLogs.map((log) => ({ ...log, logType: "REJECTION" })),
      ...maintenanceLogs.map((log) => ({ ...log, logType: "MAINTENANCE" })),
      ...harvestLogs.map((log) => ({ ...log, logType: "HARVEST" })),
      ...hardwareComponentsLogs.map((log) => ({
        ...log,
        logType: "HARDWARE COMPONENTS",
      })),
      // ...hardwareStatusLogs.map((log) => ({ //hardwareStatusLogs REMOVED
      //   ...log,
      //   logType: "HARDWARE STATUS",
      // })),
      ...controlsLog.map((log) => ({
        ...log,
        logType: "CONTROLS",
      })),
      ...plantedCropsLogs.map((log) => ({
        ...log,
        logType: "PLANTED CROPS",
      })),
    ],
    [
      adminActivityLogs,
      userActivityLogs,
      rejectionLogs,
      maintenanceLogs,
      harvestLogs,
      hardwareComponentsLogs,
      // hardwareStatusLogs, //hardwareStatusLogs REMOVED
      controlsLog,
      plantedCropsLogs,
    ]
  );

  // Local state for filter, search term, and pagination.
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  // Filter logs based on search term. It checks logs_description, name, and date/timestamp.
  const filteredLogs = useMemo(() => {
    const logsByType =
      selectedFilter === "ALL"
        ? allLogs
        : allLogs.filter((log) => log.logType === selectedFilter);

    return logsByType.filter((log) => {
      const description = log.logs_description?.toLowerCase() || "";
      const name = log.name?.toLowerCase() || "";
      const date = (log.log_date || log.timestamp)?.toLowerCase() || "";
      return (
        description.includes(normalizedSearchTerm) ||
        name.includes(normalizedSearchTerm) ||
        date.includes(normalizedSearchTerm)
      );
    });
  }, [allLogs, selectedFilter, normalizedSearchTerm]);

  // Sort logs by date (descending). For logs without log_date, timestamp is used.
  const sortedLogs = useMemo(() => {
    return filteredLogs.sort(
      (a, b) =>
        new Date(b.log_date || b.timestamp) -
        new Date(a.log_date || a.timestamp)
    );
  }, [filteredLogs]);

  // Decide which data set to display.
  const displayData = useMemo(() => {
    return sortedLogs;
  }, [sortedLogs]);

  const headerText =
    selectedFilter === "ALL"
      ? "ALL ACTIVITY LOGS"
      : `${selectedFilter} ACTIVITY LOGS`;

  const renderErrors = () => {
    if (!error) return null;
    if (typeof error === "object") {
      return Object.entries(error).map(([key, message]) => (
        <Alert
          severity="error"
          variant="filled"
          sx={{ mb: 2, fontSize: "1rem", fontWeight: "bold" }}
          key={key}
        >
          {message}
        </Alert>
      ));
    }
    return (
      <Alert severity="error" variant="filled" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  };

  if (logsLoading) return <HarvestSkeleton />;

  // Define table headers based on the selected filter.
  let tableHeaders;
  // if (selectedFilter === "HARDWARE STATUS") { //hardwareStatusLogs REMOVED
  //   tableHeaders = ["Timestamp", "Duration", "Status"];
  // } else
  if (selectedFilter === "CONTROLS") {
    tableHeaders = [
      "Timestamp",
      "Description",
      "Auto Mode",
      "Exhaust",
      "Pump1",
      "Pump2",
    ];
  } else {
    tableHeaders = ["Log Date", "Description", "Name"];
  }

  const noDataMessage = emptyData[
    selectedFilter === "ALL"
      ? "AdminLogsTable" // Just pick one as ALL isn't directly associated
      : selectedFilter === "ADMIN"
      ? "AdminLogsTable"
      : selectedFilter === "USERS"
      ? "UserLogsTable"
      : selectedFilter === "REJECTION"
      ? "RejectionTable"
      : selectedFilter === "MAINTENANCE"
      ? "MaintenanceTable"
      : selectedFilter === "HARVEST"
      ? "harvestLogsTable"
      : selectedFilter === "HARDWARE COMPONENTS"
      ? "hardwareComponentsLogsTable"
      // : selectedFilter === "HARDWARE STATUS" //hardwareStatusLogs REMOVED
      // ? "hardwareStatusLogsTable"
      : selectedFilter === "CONTROLS"
      ? "controlsLogTable"
      : selectedFilter === "PLANTED CROPS"
      ? "plantedCropsLogsTable"
      : "itemInventoryLogsTable"
  ];

  return (
    <Container maxWidth="xxl" sx={{ p: { xs: 2, sm: 3 }, mt: { xs: 2, sm: 3 } }}>
      <Paper
        sx={{
          width: "100%",
          overflow: "hidden",
          borderRadius: "10px",
          boxShadow: 15,
          p: { xs: 2, sm: 3 },
          mb: { xs: 3, sm: 5 },
          backgroundColor: "#fff", // MATCHED HEADER BACKGROUND
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
            gap: 2,
            color: "#fff", // MATCHED TEXT COLOR
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              fontSize: "clamp(0.875rem, 1.5vw, 1.5rem)",
              color: "#000", // MATCHED TEXT COLOR
            }}
          >
            {headerText}
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              gap: 2,
              width: { xs: "100%", sm: "auto" },
            }}
          >
            <TextField
              fullWidth={isSmallScreen}
              label="Search Logs"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon sx={{ color: "#000  " }} />
                  </InputAdornment>
                ),
              }}
              InputLabelProps={{
                style: { color: '#000' },
              }}
              sx={{  width: { xs: "100%", sm: "300px" },
                
              }}
            />
            <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
              <InputLabel sx={{ color: '#000' }}>Filter</InputLabel>
              <Select
                value={selectedFilter}
                onChange={(e) => {
                  setSelectedFilter(e.target.value);
                  setPage(0);
                }}
                label="Filter"
                sx={{
                   color: '#000',
                    
                  }}
                 MenuProps={{
                    PaperProps: {
                      style: {
                        backgroundColor: '#fff', // Background color of the dropdown
                      },
                    },
                  }}
                  inputProps={{
                    style: { color: '#fff' },
                  }}
              >
                <MenuItem value="ALL" sx={{ color:"#000" }}>
                  <Box display="flex" alignItems="center">
                    <AllInboxIcon sx={{ mr: 1, color:"#000" }} /> ALL
                  </Box>
                </MenuItem>
                <MenuItem value="ADMIN" sx={{ color:"#000" }}>
                  <Box display="flex" alignItems="center">
                    <AdminPanelSettingsIcon sx={{ mr: 1, color:"#000" }} /> ADMIN
                  </Box>
                </MenuItem>
                <MenuItem value="USERS" sx={{ color:"#000" }}>
                  <Box display="flex" alignItems="center">
                    <PeopleIcon sx={{ mr: 1, color:"#000" }} /> USERS
                  </Box>
                </MenuItem>
                <MenuItem value="PLANTED CROPS" sx={{ color:"#000" }}>
                  <Box display="flex" alignItems="center">
                    <LocalFloristIcon sx={{ mr: 1, color:"#000" }} /> PLANTED CROPS
                  </Box>
                </MenuItem>
                <MenuItem value="HARVEST" sx={{ color:"#000" }}>
                  <Box display="flex" alignItems="center">
                    <AgricultureIcon sx={{ mr: 1, color:"#000" }} /> HARVEST
                  </Box>
                </MenuItem>
                <MenuItem value="REJECTION" sx={{ color:"#000" }}>
                  <Box display="flex" alignItems="center">
                    <CancelIcon sx={{ mr: 1, color:"#000" }} /> REJECTION
                  </Box>
                </MenuItem>
                <MenuItem value="MAINTENANCE" sx={{ color:"#000" }}>
                  <Box display="flex" alignItems="center">
                    <BuildIcon sx={{ mr: 1, color:"#000" }} /> MAINTENANCE
                  </Box>
                </MenuItem>
                <MenuItem value="HARDWARE COMPONENTS" sx={{ color:"#000" }}>
                  <Box display="flex" alignItems="center">
                    <DeveloperBoardIcon sx={{ mr: 1, color:"#000" }} /> HARDWARE COMPONENTS
                  </Box>
                </MenuItem>
                {/* <MenuItem value="HARDWARE STATUS">  //hardwareStatusLogs REMOVED
                  <Box display="flex" alignItems="center">
                    <SettingsIcon sx={{ mr: 1 }} /> HARDWARE STATUS
                  </Box>
                </MenuItem> */}
                <MenuItem value="CONTROLS" sx={{ color:"#000" }}>
                  <Box display="flex" alignItems="center">
                    <ControlCameraIcon sx={{ mr: 1, color:"#000" }} /> NUTRIENT CONTROLS
                  </Box>
                </MenuItem>

              </Select>
            </FormControl>
          </Box>
        </Box>

        <TableContainer sx={{ overflowX: "auto", borderBottom: "1px solid #999" }}>
          <Table sx={{ minWidth: 650, backgroundColor: "#fff" }}>
            <TableHead sx={{ backgroundColor: "#06402B", borderRadius: "10px" }}>
              <TableRow>
                {tableHeaders.map((header) => (
                  <TableCell
                    key={header}
                    align="center"
                    sx={{
                      color: "#fff",
                      fontWeight: "bold",
                      fontSize: "1.1rem",
                      py: 2,
                      borderBottom: 'none'
                    }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {displayData.length > 0 ? (
                displayData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((log, index) => (
                    <TableRow
                      key={
                        // selectedFilter === "HARDWARE STATUS" //hardwareStatusLogs REMOVED
                        //   ? `hardware-status-${index}`
                        //   :
                         selectedFilter === "CONTROLS"
                          ? `controls-${index}`
                          : `${log.log_id || index}-${index}`
                      }
                       sx={{  backgroundColor: "#fff", }}
                    >
                      {/* {selectedFilter === "HARDWARE STATUS" ? (  //hardwareStatusLogs REMOVED
                        <>
                          <TableCell align="center">{log.timestamp}</TableCell>
                          <TableCell align="center">{log.duration}</TableCell>
                          <TableCell align="center">
                            {String(log.status)}
                          </TableCell>
                        </>
                      ) : */}
                       { selectedFilter === "CONTROLS" ? (
                        <>
                          <TableCell align="center" sx={{ color: '#000' }}>{log.timestamp}</TableCell>
                          <TableCell align="center" sx={{ color: '#000'  }}>
                            {log.logs_description}
                          </TableCell>
                          <TableCell align="center" sx={{ color: '#000'  }}>
                            {String(log.automode)}
                          </TableCell>
                          <TableCell align="center" sx={{ color: '#000' }}>
                            {String(log.exhaust)}
                          </TableCell>
                          <TableCell align="center" sx={{ color: '#000'}}>
                            {String(log.pump1)}
                          </TableCell>
                          <TableCell align="center" sx={{ color: '#000'  }}>
                            {String(log.pump2)}
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell align="center" sx={{ color: '#000',   }}>{log.log_date}</TableCell>
                          <TableCell align="center" sx={{ color: '#000'  }}>
                            {log.logs_description}
                          </TableCell>
                          <TableCell align="center" sx={{ color: '#000'  }}>{log.name}</TableCell>
                        </>
                      )}
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={tableHeaders.length} align="center" sx={{ borderBottom: 'none' }}>
                    {noDataMessage ? (
                      <Typography variant="h8" color="textSecondary" sx={{ color: '#000' }}>
                        {noDataMessage.toUpperCase()}
                      </Typography>
                    ) : (
                      <Typography variant="subtitle1" color="textSecondary" sx={{ color: '#000' }}>
                       NO LOGS AVAILABLE.
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {displayData.length > 0 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <TablePagination
              component="div"
              count={displayData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPageOptions={[rowsPerPage]}
               sx={{
                color: '#000', // Color of the pagination text
              
              }}
            />
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default ActivityLogs;