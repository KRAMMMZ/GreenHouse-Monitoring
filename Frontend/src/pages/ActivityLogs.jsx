import React, { useState } from "react";
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, Box, TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AdminLogs from "../hooks/AdminLogsHooks";
import HarvestSkeliton from "../skelitons/HarvestSkeliton";

function ActivityLogs() {
  const { adminActivityLogs, adminLogsLoading } = AdminLogs();
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState("");

  // Sort logs from latest to oldests
  const sortedLogs = [...adminActivityLogs]
    .sort((a, b) => new Date(b.log_date) - new Date(a.log_date))
    .filter((log) =>
      log.logs_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.log_date.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="container-fluid p-3">
      {adminLogsLoading ? (
        <HarvestSkeliton />
      )  : (
        <Paper sx={{ width: "100%", overflow: "hidden", borderRadius: "10px", boxShadow: 15, padding: 2, mb: 5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", fontSize: "clamp(0.875rem, 1.7vw, 2rem)" }}>
              ADMIN ACTIVITY LOGS
            </Typography>
            <TextField
              label="Search Logs"
              variant="outlined"
              size="small"
              onChange={(e) => setSearchTerm(e.target.value)}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>
          <TableContainer>
            <Table sx={{ minWidth: 650, backgroundColor: "#fff" }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#4169E1", borderRadius: "10px" }}>
                  {["Log Date", "Description", "Name"].map((header) => (
                    <TableCell key={header} align="center" sx={{ fontWeight: "bold", color: "#fff", fontSize: "1.1rem", py: 2.5 }}>
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedLogs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((log) => (
                  <TableRow key={log.log_id} hover sx={{ borderRadius: "10px" }}>
                    {[log.log_date, log.logs_description, log.name].map((value, index) => (
                      <TableCell key={index} align="center" sx={{ fontSize: "1.0rem", py: 1.5 }}>
                        {value}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 2 }}>
            <TablePagination
              component="div"
              count={sortedLogs.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(event, newPage) => setPage(newPage)}
              rowsPerPageOptions={[rowsPerPage]}
            />
          </Box>
        </Paper>
      )}
    </div>
  );
}

export default ActivityLogs;
