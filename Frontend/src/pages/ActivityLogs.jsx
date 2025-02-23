import React, { useState } from "react";
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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useActivityLogs } from "../hooks/AdminLogsHooks";
import HarvestSkeliton from "../skelitons/HarvestSkeliton";

function ActivityLogs() {
  // Retrieve all logs from the custom hook
  const {
    adminActivityLogs = [],
    userActivityLogs = [],
    rejectionLogs = [],
    maintenanceLogs = [],
    logsLoading,
  } = useActivityLogs();

  // Combine all logs into a single array and add type identifiers
  const allLogs = [
    ...adminActivityLogs.map(log => ({ ...log, logType: "ADMIN" })),
    ...userActivityLogs.map(log => ({ ...log, logType: "USERS" })),
    ...rejectionLogs.map(log => ({ ...log, logType: "REJECTION" })),
    ...maintenanceLogs.map(log => ({ ...log, logType: "MAINTENANCE" })),
  ];

  // Local state for filter, search term, and pagination
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  // Filter logs by type first
  const filteredByType = allLogs.filter(log => 
    selectedFilter === "ALL" ? true : log.logType === selectedFilter
  );

  // Normalize search term and filter
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const filteredLogs = filteredByType.filter(log => {
    const description = log.logs_description?.toLowerCase() || "";
    const name = log.name?.toLowerCase() || "";
    const date = log.log_date?.toLowerCase() || "";
    return description.includes(normalizedSearchTerm) || 
           name.includes(normalizedSearchTerm) || 
           date.includes(normalizedSearchTerm);
  });

  // Sort logs by date
  const sortedLogs = filteredLogs.sort(
    (a, b) => new Date(b.log_date) - new Date(a.log_date)
  );

  // Dynamic header text
  const headerText = selectedFilter === "ALL" 
    ? "ALL ACTIVITY LOGS" 
    : `${selectedFilter} ACTIVITY LOGS`;

  if (logsLoading) return <HarvestSkeliton />;

  return (
    <div className="container-fluid p-3">
      <Paper sx={{ width: "100%", overflow: "hidden", borderRadius: "10px", boxShadow: 15, p: 2, mb: 5 }}>
        {/* Header Section */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold", fontSize: "clamp(0.875rem, 1.7vw, 2rem)" }}>
            {headerText}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Filter Dropdown */}
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
                <MenuItem value="REJECTION">REJECTION</MenuItem>
                <MenuItem value="MAINTENANCE">MAINTENANCE</MenuItem>
              </Select>
            </FormControl>

            {/* Search Field */}
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
          </Box>
        </Box>

        {/* Logs Table */}
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ backgroundColor: "#06402B" }}>
              <TableRow>
                {["Log Date", "Description", "Name" ].map(header => (
                  <TableCell
                    key={header}
                    align="center"
                    sx={{ color: "white", fontWeight: "bold", fontSize: "1.1rem", py: 2 }}
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
                    <TableCell align="center">{log.logs_description}</TableCell>
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
    </div>
  );
}

export default ActivityLogs;