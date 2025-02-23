import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import HarvestSkeliton from "../skelitons/HarvestSkeliton";

const HarvestTable = ({ filteredHarvestItems, harvestLoading, harvestPage, rowsPerPage }) => {
  return harvestLoading ? (
    <HarvestSkeliton />
  ) : (
    <TableContainer>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#06402B" }}>
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
                sx={{ fontWeight: "bold", fontSize: "1.1rem", color: "#fff" }}
              >
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredHarvestItems
            .slice(harvestPage * rowsPerPage, harvestPage * rowsPerPage + rowsPerPage)
            .map((item) => (
              <TableRow key={item.harvest_id}>
                {[
                  item.accepted,
                  item.plant_type,
                  item.total_rejected,
                  item.total_yield,
                  item.notes,
                  item.harvest_date,
                ].map((value, index) => (
                  <TableCell key={index} align="center" sx={{ fontSize: "1rem" }}>
                    {value}
                  </TableCell>
                ))}
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default HarvestTable;
