import React from "react";
import { Grid } from "@mui/material";
import DashboardSkeliton from "../skelitons/DashboardSkeliton";
import HarvestCard from "../components/HarvestsCards";

const Metric = ({ title, value, loading, icon, iconSize = "3rem" }) => {
  return (
     <> 
      {loading ? (
        <DashboardSkeliton />
      ) : (
        <HarvestCard
          title={title}
          value={title === "Lose Rate" ? value.toFixed(2) + "%" : value}
          icon={icon}
          iconSize={iconSize}
        />
      )}
   </>
  );
};

export default Metric;
