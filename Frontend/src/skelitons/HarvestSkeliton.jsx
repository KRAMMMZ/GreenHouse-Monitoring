import React from "react";
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
    Skeleton,
  } from "@mui/material";

function HarvestSkeliton() {
  return (
    <>
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
          <Table sx={{ minWidth: 650, backgroundColor: "#fff" }}>
            <TableHead>
              <TableRow
                sx={{ backgroundColor: "#06402B", borderRadius: "10px" }}
              >
                {[
                  "Accepted",
                  "Plant Type",
                  "Total Rejected",
                  "Total Yield",
                  "Notes",
                  "Harvest Date",
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
                    <Skeleton
                      variant="text"
                      sx={{
                        width: "70%",
                        mx: "auto",
                        bgcolor: "rgba(255, 255, 255, 0.8)",
                      }}
                    />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from(new Array(5)).map((_, rowIndex) => (
                <TableRow key={rowIndex} hover sx={{ borderRadius: "10px" }}>
                  {[...Array(6)].map((_, cellIndex) => (
                    <TableCell
                      key={cellIndex}
                      align="center"
                      sx={{ fontSize: "1.0rem", py: 1.5 }}
                    >
                      <Skeleton
                        variant="text"
                        sx={{ width: "80%", mx: "auto" }}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Skeleton
            variant="rectangular"
            width={300}
            height={40}
            sx={{ borderRadius: "4px" }}
          />
        </Box>
      </Paper>
    </>
  );
}

export default HarvestSkeliton;
