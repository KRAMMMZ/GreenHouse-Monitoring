import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import {useHarvestItems} from "../hooks/TotalHarvestHooks"; // Path to the custom hook

const Harvest = () => {
  const { harvestItems, loading } = useHarvestItems();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container-fluid p-3">
      <h1 className="mb-4">HARVEST ITEMS</h1>
      {harvestItems.length === 0 ? (
        <p>No harvest data available</p>
      ) : (
        <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="harvest items table">
          <TableHead>
            <TableRow>
              <TableCell>Harvests ID</TableCell>
              <TableCell align="left">Greenhouse ID</TableCell>
              <TableCell align="left"> Accepted</TableCell>             
              <TableCell align="left">Plant Type</TableCell>
              <TableCell align="left">Total Rejected</TableCell>
              <TableCell align="left">Total Yield</TableCell>
              <TableCell align="left">Notes</TableCell>
              <TableCell align="left">Harvest Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {harvestItems.map((item) => (
              <TableRow key={item.harvest_id}>
                <TableCell component="th" scope="row">
                  {item.harvest_id}
                </TableCell>
                <TableCell >{item.greenhouse_id}</TableCell>
                <TableCell align="left">{item.accepted}</TableCell>
                <TableCell align="left">{item.plant_type}</TableCell>
                <TableCell align="left">{item.total_rejected}</TableCell>
                <TableCell align="left">{item.total_yield}</TableCell>
                <TableCell align="left">{item.notes}</TableCell>
                <TableCell align="left">{item.harvest_date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      )}
    </div>
  );
};

export default Harvest;
