import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  useMediaQuery,
  useTheme,
  Alert,
} from "@mui/material";
import HarvestSkeliton from "../skelitons/HarvestSkeliton";

const HarvestTable = ({
  filteredHarvestItems,
  harvestLoading,
  harvestPage,
  rowsPerPage,
  noDataMessage,
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return harvestLoading ? (
    <HarvestSkeliton />
  ) : (
    <Box sx={{ overflowX: "auto", width: "100%" }}>
      <TableContainer>
        <Table sx={{ minWidth: isSmallScreen ? 350 : 650 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#06402B" }}>
              {[
                "Accepted",
                "Total Rejected",
                "Total Yield",
                "Plant Type",
                "Name",
                "Notes",
                "Harvest Date",
              ].map((header) => (
                <TableCell
                  key={header}
                  align="center"
                  sx={{
                    fontWeight: "bold",
                    fontSize: isSmallScreen ? "0.9rem" : "1.1rem",
                    color: "#fff",
                  }}
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredHarvestItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Alert variant="filled" severity="warning">{noDataMessage}</Alert>
                </TableCell>
              </TableRow>
            ) : (
              filteredHarvestItems
                .slice(
                  harvestPage * rowsPerPage,
                  harvestPage * rowsPerPage + rowsPerPage
                )
                .map((item) => (
                  <TableRow key={item.harvest_id}>
                    {[
                      item.accepted,
                      item.total_rejected,
                      item.total_yield,
                      item.plant_type,
                      item.full_name,
                      item.notes,
                      item.harvest_date,
                    ].map((value, index) => (
                      <TableCell
                        key={index}
                        align="center"
                        sx={{ fontSize: isSmallScreen ? "0.8rem" : "1rem" }}
                      >
                        {value}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default HarvestTable;
