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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useActivityLogs } from "../hooks/AdminLogsHooks";
import HarvestSkeleton from "../skelitons/HarvestSkeliton";

function ActivityLogs() {
  const {
    adminActivityLogs = [],
    userActivityLogs = [],
    rejectionLogs = [],
    maintenanceLogs = [],
    harvestLogs = [],
    logsLoading,
    error,
  } = useActivityLogs();

  // Combine all logs into a single array and add type identifiers, memoized for performance
  const allLogs = useMemo(
    () => [
      ...adminActivityLogs.map((log) => ({ ...log, logType: "ADMIN" })),
      ...userActivityLogs.map((log) => ({ ...log, logType: "USERS" })),
      ...rejectionLogs.map((log) => ({ ...log, logType: "REJECTION" })),
      ...maintenanceLogs.map((log) => ({ ...log, logType: "MAINTENANCE" })),
      ...harvestLogs.map((log) => ({ ...log, logType: "HARVEST" })),
    ],
    [adminActivityLogs, userActivityLogs, rejectionLogs, maintenanceLogs, harvestLogs]
  );

  // Local state for filter, search term, and pagination
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  // Memoize filtered logs
  const filteredLogs = useMemo(() => {
    const logsByType =
      selectedFilter === "ALL"
        ? allLogs
        : allLogs.filter((log) => log.logType === selectedFilter);

    return logsByType.filter((log) => {
      const description = log.logs_description?.toLowerCase() || "";
      const name = log.name?.toLowerCase() || "";
      const date = log.log_date?.toLowerCase() || "";
      return (
        description.includes(normalizedSearchTerm) ||
        name.includes(normalizedSearchTerm) ||
        date.includes(normalizedSearchTerm)
      );
    });
  }, [allLogs, selectedFilter, normalizedSearchTerm]);

  // Memoize sorted logs by date (descending)
  const sortedLogs = useMemo(() => {
    return filteredLogs.sort(
      (a, b) => new Date(b.log_date) - new Date(a.log_date)
    );
  }, [filteredLogs]);

  const headerText =
    selectedFilter === "ALL"
      ? "ALL ACTIVITY LOGS"
      : `${selectedFilter} ACTIVITY LOGS`;

  // Render error messages safely as valid React nodes
  const renderErrors = () => {
    if (!error) return null;
    if (typeof error === "object") {
      return Object.entries(error).map(([key, message]) => (
        <Alert severity="error" sx={{ mb: 2 }} key={key}>
          {message}
        </Alert>
      ));
    }
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  };

  if (logsLoading) return <HarvestSkeleton />;

  return (
    <Container maxWidth="xxl" sx={{ p: 3 }}>
      <Paper
        sx={{
          width: "100%",
          overflow: "hidden",
          borderRadius: "10px",
          boxShadow: 15,
          p: 2,
          mb: 5,
          mt: 3,
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <TextField
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
                <MenuItem value="ALL">ALL</MenuItem>
                <MenuItem value="ADMIN">ADMIN</MenuItem>
                <MenuItem value="USERS">USERS</MenuItem>
                <MenuItem value="HARVEST">HARVEST</MenuItem>
                <MenuItem value="REJECTION">REJECTION</MenuItem>
                <MenuItem value="MAINTENANCE">MAINTENANCE</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Display error alerts if any */}
        {renderErrors()}

        {/* Logs Table */}
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ backgroundColor: "#06402B" }}>
              <TableRow>
                {["Log Date", "Description", "Name"].map((header) => (
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
              {sortedLogs
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((log, index) => (
                  <TableRow key={`${log.log_id}-${index}`} hover>
                    <TableCell align="center">{log.log_date}</TableCell>
                    <TableCell align="center">
                      {log.logs_description}
                    </TableCell>
                    <TableCell align="center">{log.name}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <TablePagination
            component="div"
            count={sortedLogs.length}
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
