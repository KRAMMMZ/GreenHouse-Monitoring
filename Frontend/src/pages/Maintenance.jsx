// Maintenance.jsx
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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import HarvestSkeliton from "../skelitons/HarvestSkeliton";
import { useMaintenance} from "../hooks/MaintenanceHooks"; // Import the hooks

function Maintenance() {
  const { maintenance, maintenanceLoading } = useMaintenance();
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState("");

  // Filter maintenance items based on title and description
  const filteredMaintenance = maintenance.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort maintenance items by date_completed descending (latest first)
  const sortedMaintenance = [...filteredMaintenance].sort(
    (a, b) => new Date(b.date_completed) - new Date(a.date_completed)
  );

  return (
    <div className="container-fluid p-3">
      {maintenanceLoading ? (
        <HarvestSkeliton />
      ) : (
        <Paper
          sx={{
            width: "100%",
            overflow: "hidden",
            borderRadius: "10px",
            boxShadow: 15,
            padding: 2,
            mb: 5,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                fontWeight: "bold",
                fontSize: "clamp(0.875rem, 1.7vw, 2rem)",
              }}
            >
              MAINTENANCE
            </Typography>
            <TextField
              label="Search Maintenance"
              variant="outlined"
              size="small"
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <TableContainer>
            <Table sx={{ minWidth: 650, backgroundColor: "#fff" }}>
              <TableHead>
                <TableRow
                  sx={{ backgroundColor: "#4169E1", borderRadius: "10px" }}
                >
                  {[
                  
                    "Title",
                    "Description",
                    "Date Completed",
                  ].map((header) => (
                    <TableCell
                      key={header}
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        color: "#fff",
                        fontSize: "1.1rem",
                        py: 2.5,
                      }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedMaintenance
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((item) => (
                    <TableRow
                      key={item.maintenance_id}
                      hover
                      sx={{ borderRadius: "10px" }}
                    >
                      {[
                     
                        item.title,
                        item.description,
                        new Date(item.date_completed).toLocaleDateString(),
                      ].map((value, index) => (
                        <TableCell
                          key={index}
                          align="center"
                          sx={{ fontSize: "1.0rem", py: 1.5 }}
                        >
                          {value}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mt: 2,
            }}
          >
            <TablePagination
              component="div"
              count={sortedMaintenance.length}
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

export default Maintenance;
