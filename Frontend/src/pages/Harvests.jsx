import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Typography,
  Box,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useHarvestItems } from "../hooks/TotalHarvestHooks";
import HarvestSkeliton from "../skelitons/HarvestSkeliton";
import { useRejectedTableItems } from "../hooks/RejectItemHooks";

const Harvest = () => {
  const { harvestItems, harvestLoading } = useHarvestItems();
  const { rejectItems, rejectLoading } = useRejectedTableItems();
  const [harvestPage, setHarvestPage] = useState(0);
  const [rejectPage, setRejectPage] = useState(0);
  const rowsPerPage = 10;
  const [harvestSearchTerm, setHarvestSearchTerm] = useState("");
  const [rejectSearchTerm, setRejectSearchTerm] = useState("");

  // Sort harvest items from latest to oldest
  const sortedHarvestItems = [...harvestItems].sort(
    (a, b) => new Date(b.harvest_date) - new Date(a.harvest_date)
  );

  // Filter Harvested Items based on search term
  const filteredHarvestItems = sortedHarvestItems.filter((item) => {
    const searchTerm = harvestSearchTerm.toLowerCase();
    const harvestDate = item.harvest_date ? item.harvest_date.toLowerCase() : "";
    const notes = item.notes ? item.notes.toLowerCase() : "";

    return (
      harvestDate.includes(searchTerm) || notes.includes(searchTerm)
    );
  });

  // Sort reject items from latest to oldest
  const sortedRejectItems = [...rejectItems]
    .sort((a, b) => new Date(b.rejection_date) - new Date(a.rejection_date))
    .filter((item) => {
      const rejectionDate = item.rejection_date ? item.rejection_date.toLowerCase() : "";
      const comments = item.comments ? item.comments.toLowerCase() : "";
      const searchTerm = rejectSearchTerm.toLowerCase();
      return rejectionDate.includes(searchTerm) || comments.includes(searchTerm);
    });

  return (
    <div className="container-fluid p-3">
      {/* Harvest Items Table */}
      {harvestLoading ? (
        <HarvestSkeliton />
      )   : (
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
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", fontSize: "clamp(0.875rem, 1.7vw, 2rem)" }}>
              HARVESTED ITEMS
            </Typography>
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              onChange={(e) => setHarvestSearchTerm(e.target.value)}
              value={harvestSearchTerm}
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
                  {[
                    "Accepted",
                    "Plant Type",
                    "Total Rejected",
                    "Total Yield",
                    "Notes",
                    "Harvest Date",
                  ].map((header) => (
                    <TableCell key={header} align="center" sx={{ fontWeight: "bold", color: "#fff", fontSize: "1.1rem", py: 2.5 }}>
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredHarvestItems
                  .slice(harvestPage * rowsPerPage, harvestPage * rowsPerPage + rowsPerPage)
                  .map((item) => (
                    <TableRow key={item.harvest_id} hover sx={{ borderRadius: "10px" }}>
                      {[item.accepted, item.plant_type, item.total_rejected, item.total_yield, item.notes, item.harvest_date].map((value, index) => (
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
              count={filteredHarvestItems.length}
              rowsPerPage={rowsPerPage}
              page={harvestPage}
              onPageChange={(event, newPage) => setHarvestPage(newPage)}
              rowsPerPageOptions={[rowsPerPage]}
            />
          </Box>
        </Paper>
      )}

      {/* Rejected Items Table */}
      {rejectLoading ? (
        <HarvestSkeliton />
      )   : (
        <Paper sx={{ width: "100%", overflow: "hidden", borderRadius: "10px", boxShadow: 15, padding: 2 }}>
           <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
           <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", fontSize: "clamp(0.875rem, 1.7vw, 2rem)" }}>
              REJECTED ITEMS
            </Typography>
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              onChange={(e) => setRejectSearchTerm(e.target.value)}
              value={rejectSearchTerm}
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
                  {["Diseased", "Physically Damaged", "Too Small", "Comments", "Rejection Date"].map((header) => (
                    <TableCell key={header} align="center" sx={{ fontWeight: "bold", color: "#fff", fontSize: "1.1rem", py: 2.5 }}>
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedRejectItems
                  .slice(rejectPage * rowsPerPage, rejectPage * rowsPerPage + rowsPerPage)
                  .map((item) => (
                    <TableRow key={item.rejection_id} hover sx={{ borderRadius: "10px" }}>
                      {[item.diseased, item.physically_damaged, item.too_small, item.comments, item.rejection_date].map((value, index) => (
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
              count={sortedRejectItems.length}
              rowsPerPage={rowsPerPage}
              page={rejectPage}
              onPageChange={(event, newPage) => setRejectPage(newPage)}
              rowsPerPageOptions={[rowsPerPage]}
            />
          </Box>
        </Paper>
      )}
    </div>
  );
};

export default Harvest;
