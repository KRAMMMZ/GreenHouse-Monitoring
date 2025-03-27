import React, { useState, useMemo } from "react";
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
  Snackbar,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import AllInboxIcon from "@mui/icons-material/AllInbox";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PeopleIcon from "@mui/icons-material/People";
import AgricultureIcon from "@mui/icons-material/Agriculture";
import CancelIcon from "@mui/icons-material/Cancel";
import BuildIcon from "@mui/icons-material/Build";
import DeveloperBoardIcon from "@mui/icons-material/DeveloperBoard";
import SettingsIcon from "@mui/icons-material/Settings";
import ControlCameraIcon from "@mui/icons-material/ControlCamera";

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
    hardwareStatusLogs = [],
    controlsLog = [],
    logsLoading,
    error,
  } = useActivityLogs();

  // Combine all logs with type identifiers.
  // Note: We now map controlsLog with "CONTROLS" (no extra spaces) so that the filter works correctly.
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
      ...hardwareStatusLogs.map((log) => ({
        ...log,
        logType: "HARDWARE STATUS",
      })),
      ...controlsLog.map((log) => ({
        ...log,
        logType: "CONTROLS",
      })),
    ],
    [
      adminActivityLogs,
      userActivityLogs,
      rejectionLogs,
      maintenanceLogs,
      harvestLogs,
      hardwareComponentsLogs,
      hardwareStatusLogs,
      controlsLog,
    ]
  );

  // Local state for filter, search term, and pagination.
  // The filter values now use the same names as the logType identifiers.
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

  // The HARDWARE STATUS data remains static.
  const hardwareStatusData = [
    {
      duration: "0",
      status: true,
      timestamp: "Sun, 16 Mar 2025 19:52:28 GMT",
    },
  ];

  const filteredHardwareStatusData = useMemo(() => {
    return hardwareStatusData.filter((log) => {
      const ts = log.timestamp.toLowerCase();
      const dur = log.duration.toLowerCase();
      const stat = String(log.status).toLowerCase();
      return (
        ts.includes(normalizedSearchTerm) ||
        dur.includes(normalizedSearchTerm) ||
        stat.includes(normalizedSearchTerm)
      );
    });
  }, [hardwareStatusData, normalizedSearchTerm]);

  // Decide which data set to display.
  // For HARDWARE STATUS, we use the static data; for others, we use sortedLogs.
  const displayData = useMemo(() => {
    if (selectedFilter === "HARDWARE STATUS") {
      return filteredHardwareStatusData;
    }
    return sortedLogs;
  }, [selectedFilter, filteredHardwareStatusData, sortedLogs]);

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
  if (selectedFilter === "HARDWARE STATUS") {
    tableHeaders = ["Timestamp", "Duration", "Status"];
  } else if (selectedFilter === "CONTROLS") {
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

  return (
    <Container maxWidth="xl" sx={{ p: { xs: 2, sm: 3 }, mt: { xs: 2, sm: 3 } }}>
      {error && (
        <Snackbar
          open={Boolean(error)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Box>{renderErrors()}</Box>
        </Snackbar>
      )}

      <Paper
        sx={{
          width: "100%",
          overflow: "hidden",
          borderRadius: "10px",
          boxShadow: 15,
          p: { xs: 2, sm: 3 },
          mb: { xs: 3, sm: 5 },
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
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              fontSize: "clamp(0.875rem, 1.5vw, 1.5rem)",
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
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Filter</InputLabel>
              <Select
                value={selectedFilter}
                onChange={(e) => {
                  setSelectedFilter(e.target.value);
                  setPage(0);
                }}
                label="Filter"
              >
                <MenuItem value="ALL">
                  <Box display="flex" alignItems="center">
                    <AllInboxIcon sx={{ mr: 1 }} /> ALL
                  </Box>
                </MenuItem>
                <MenuItem value="ADMIN">
                  <Box display="flex" alignItems="center">
                    <AdminPanelSettingsIcon sx={{ mr: 1 }} /> ADMIN
                  </Box>
                </MenuItem>
                <MenuItem value="USERS">
                  <Box display="flex" alignItems="center">
                    <PeopleIcon sx={{ mr: 1 }} /> USERS
                  </Box>
                </MenuItem>
                <MenuItem value="HARVEST">
                  <Box display="flex" alignItems="center">
                    <AgricultureIcon sx={{ mr: 1 }} /> HARVEST
                  </Box>
                </MenuItem>
                <MenuItem value="REJECTION">
                  <Box display="flex" alignItems="center">
                    <CancelIcon sx={{ mr: 1 }} /> REJECTION
                  </Box>
                </MenuItem>
                <MenuItem value="MAINTENANCE">
                  <Box display="flex" alignItems="center">
                    <BuildIcon sx={{ mr: 1 }} /> MAINTENANCE
                  </Box>
                </MenuItem>
                <MenuItem value="HARDWARE COMPONENTS">
                  <Box display="flex" alignItems="center">
                    <DeveloperBoardIcon sx={{ mr: 1 }} /> HARDWARE COMPONENTS
                  </Box>
                </MenuItem>
                <MenuItem value="HARDWARE STATUS">
                  <Box display="flex" alignItems="center">
                    <SettingsIcon sx={{ mr: 1 }} /> HARDWARE STATUS
                  </Box>
                </MenuItem>
                <MenuItem value="CONTROLS">
                  <Box display="flex" alignItems="center">
                    <ControlCameraIcon sx={{ mr: 1 }} /> CONTROLS
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <TableContainer sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ backgroundColor: "#06402B" }}>
              <TableRow>
                {tableHeaders.map((header) => (
                  <TableCell
                    key={header}
                    align="center"
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "1.1rem",
                      py: 2,
                    }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {displayData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((log, index) => (
                  <TableRow
                    key={
                      selectedFilter === "HARDWARE STATUS"
                        ? `hardware-status-${index}`
                        : selectedFilter === "CONTROLS"
                        ? `controls-${index}`
                        : `${log.log_id || index}-${index}`
                    }
                    hover
                  >
                    {selectedFilter === "HARDWARE STATUS" ? (
                      <>
                        <TableCell align="center">{log.timestamp}</TableCell>
                        <TableCell align="center">{log.duration}</TableCell>
                        <TableCell align="center">
                          {String(log.status)}
                        </TableCell>
                      </>
                    ) : selectedFilter === "CONTROLS" ? (
                      <>
                        <TableCell align="center">{log.timestamp}</TableCell>
                        <TableCell align="center">
                          {log.logs_description}
                        </TableCell>
                        <TableCell align="center">
                          {String(log.automode)}
                        </TableCell>
                        <TableCell align="center">
                          {String(log.exhaust)}
                        </TableCell>
                        <TableCell align="center">
                          {String(log.pump1)}
                        </TableCell>
                        <TableCell align="center">
                          {String(log.pump2)}
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell align="center">{log.log_date}</TableCell>
                        <TableCell align="center">
                          {log.logs_description}
                        </TableCell>
                        <TableCell align="center">{log.name}</TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <TablePagination
            component="div"
            count={displayData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPageOptions={[rowsPerPage]}
            sx={{ mt: 2 }}
          />
        </Box>
      </Paper>
    </Container>
  );
}

export default ActivityLogs;
