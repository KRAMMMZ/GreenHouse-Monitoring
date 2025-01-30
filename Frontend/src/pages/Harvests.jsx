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
  CircularProgress,
  Typography,
  Box,
  Skeleton
} from "@mui/material";
import { useHarvestItems } from "../hooks/TotalHarvestHooks";

const Harvest = () => {
  const { harvestItems, loading } = useHarvestItems();
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="container-fluid p-3">
      {/* Original Harvest Items Table */}
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", mb: 4 }}>
        HARVEST ITEMS
      </Typography>
      {harvestItems.length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: "center", color: "gray" }}>
          No harvest data available
        </Typography>
      ) : (
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
              {/* Table Head remains the same */}
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
                {harvestItems
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((item) => (
                    <TableRow key={item.harvest_id} hover sx={{ borderRadius: "10px" }}>
                      {/* Table cells remain the same */}
                      <TableCell align="center" sx={{ fontSize: "1.0rem", py: 1.5 }}>{item.accepted}</TableCell>
                      <TableCell align="center" sx={{ fontSize: "1.0rem", py: 1.5 }}>{item.plant_type}</TableCell>
                      <TableCell align="center" sx={{ fontSize: "1.0rem", py: 1.5 }}>{item.total_rejected}</TableCell>
                      <TableCell align="center" sx={{ fontSize: "1.0rem", py: 1.5 }}>{item.total_yield}</TableCell>
                      <TableCell align="center" sx={{ fontSize: "1.0rem", py: 1.5 }}>{item.notes}</TableCell>
                      <TableCell align="center" sx={{ fontSize: "1.0rem", py: 1.5 }}>{item.harvest_date}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 2 }}>
            <TablePagination
              component="div"
              count={harvestItems.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(event, newPage) => setPage(newPage)}
              rowsPerPageOptions={[rowsPerPage]}
            />
          </Box>
        </Paper>
      )}

      {/* Skeleton Version */}
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", mb: 4, mt: 8 }}>
  REJECTED ITEMS
</Typography>
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
          {["Too small", "Physically damage", "Diseased", "Rejection date", "Comments"].map((header) => (
            <TableCell
              key={header}
              align="center"
              sx={{ 
                fontWeight: "800", // Increased font weight
                color: "#fff", 
                fontSize: "1.1rem", // Increased font size
                py: 3, // Increased padding
                
                minWidth: 120 // Ensured minimum width
              }}
            >
              {header}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {[...Array(5)].map((_, index) => (
          <TableRow key={index} hover sx={{ borderRadius: "10px" }}>
            {[...Array(5)].map((_, cellIndex) => ( // Changed to 5 columns
              <TableCell key={cellIndex} align="center" sx={{ fontSize: "1.0rem"  }}>
                <Skeleton variant="text" sx={{ width: '80%', mx: 'auto' }} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 2 }}>
    <Skeleton variant="rectangular" width={300} height={40} sx={{ borderRadius: '4px' }} />
  </Box>
</Paper>
    </div>
  );
};

export default Harvest;