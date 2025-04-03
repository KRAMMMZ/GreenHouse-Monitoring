import React from "react";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Metric from "../props/MetricSection";
import { useContainerInventory } from "../hooks/ContainerInventoryHooks";

// Import icons from Material UI
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ScienceIcon from "@mui/icons-material/Science";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";

const InventoryContainer = () => {
  const { containerInventory, containerInventoryLoading } = useContainerInventory();

  // Use the first item from the inventory data as a sample
  const inventory = containerInventory.length > 0 ? containerInventory[0] : {};

  return (
    <Container maxWidth="xl" sx={{ p: { xs: 2, sm: 3 } }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
        <Metric
            title="PH Up"
            value={inventory.ph_up}
            loading={containerInventoryLoading}
            icon={<ArrowUpwardIcon sx={{ fontSize: "4rem", color: "#fff" }} />}
          />
         
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
        <Metric
            title="PH Down"
            value={inventory.ph_down}
            loading={containerInventoryLoading}
            icon={<ArrowDownwardIcon sx={{ fontSize: "4rem", color: "#fff" }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Metric
            title="Solution A"
            value={inventory.solution_a}
            loading={containerInventoryLoading}
            icon={<ScienceIcon sx={{ fontSize: "4rem", color: "#fff" }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Metric
            title="Solution B"
            value={inventory.solution_b}
            loading={containerInventoryLoading}
            icon={<LocalPharmacyIcon sx={{ fontSize: "4rem", color: "#fff" }} />}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default InventoryContainer;
