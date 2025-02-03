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
} from "@mui/material";
import { useHarvestItems } from "../hooks/TotalHarvestHooks";
import HarvestSkeliton from "../skelitons/HarvestSkeliton";
import { useRejectedTableItems } from "../hooks/RejectItemHooks";

const Harvest = () => {
  const { harvestItems, harvestLoading } = useHarvestItems();
  const { rejectItems, rejectLoading } = useRejectedTableItems();
  const [harvestPage, setHarvestPage] = useState(0);
  const [rejectPage, setRejectPage] = useState(0);
  const rowsPerPage = 10;

  // Sort harvest items from latest to oldest
  const sortedHarvestItems = [...harvestItems].sort(
    (a, b) => new Date(b.harvest_date) - new Date(a.harvest_date)
  );

  // Sort reject items from latest to oldest
  const sortedRejectItems = [...rejectItems].sort(
    (a, b) => new Date(b.rejection_date) - new Date(a.rejection_date)
  );

  return (
    <div className="container-fluid p-3">
      {/* Harvest Items Table */}
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", mb: 4 }}>
        HARVEST ITEMS
      </Typography>
      {harvestLoading ? (
        <HarvestSkeliton />
      ) : sortedHarvestItems.length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: "center", color: "gray" }}>
          No harvest data available
        </Typography>
      ) : (
        <Paper sx={{ width: "100%", overflow: "hidden", borderRadius: "10px", boxShadow: 3, padding: 2 }}>
          <TableContainer>
            <Table sx={{ minWidth: 650, backgroundColor: "#d8d8d8" }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#4169E1", borderRadius: "10px" }}>
                  {["Accepted", "Plant Type", "Total Rejected", "Total Yield", "Notes", "Harvest Date"].map((header) => (
                    <TableCell
                      key={header}
                      align="center"
                      sx={{ fontWeight: "bold", color: "#fff", fontSize: "1.1rem", py: 2.5 }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedHarvestItems
                  .slice(harvestPage * rowsPerPage, harvestPage * rowsPerPage + rowsPerPage)
                  .map((item) => (
                    <TableRow key={item.harvest_id} hover sx={{ borderRadius: "10px" }}>
                      {[item.accepted, item.plant_type, item.total_rejected, item.total_yield, item.notes, item.harvest_date].map(
                        (value, index) => (
                          <TableCell key={index} align="center" sx={{ fontSize: "1.0rem", py: 1.5 }}>
                            {value}
                          </TableCell>
                        )
                      )}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 2 }}>
            <TablePagination
              component="div"
              count={sortedHarvestItems.length}
              rowsPerPage={rowsPerPage}
              page={harvestPage}
              onPageChange={(event, newPage) => setHarvestPage(newPage)}
              rowsPerPageOptions={[rowsPerPage]}
            />
          </Box>
        </Paper>
      )}

      {/* Rejected Items Table */}
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", mb: 4, mt: 8 }}>
        REJECTED ITEMS
      </Typography>
      {rejectLoading ? (
        <HarvestSkeliton />
      ) : sortedRejectItems.length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: "center", color: "gray" }}>
          No rejected data available
        </Typography>
      ) : (
        <Paper sx={{ width: "100%", overflow: "hidden", borderRadius: "10px", boxShadow: 3, padding: 2 }}>
          <TableContainer>
            <Table sx={{ minWidth: 650, backgroundColor: "#d8d8d8" }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#4169E1", borderRadius: "10px" }}>
                  {["Diseased", "Physically Damaged", "Too Small", "Comments", "Rejection Date"].map((header) => (
                    <TableCell
                      key={header}
                      align="center"
                      sx={{ fontWeight: "bold", color: "#fff", fontSize: "1.1rem", py: 2.5 }}
                    >
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
                      {[item.diseased, item.physically_damaged, item.too_small, item.comments, item.rejection_date].map(
                        (value, index) => (
                          <TableCell key={index} align="center" sx={{ fontSize: "1.0rem", py: 1.5 }}>
                            {value}
                          </TableCell>
                        )
                      )}
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
