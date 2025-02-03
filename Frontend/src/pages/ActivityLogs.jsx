import React, { useState } from "react";
import { Typography} from "@mui/material";
import HarvestSkeliton from "../skelitons/HarvestSkeliton";

function ActivityLogs() {
  const [loading] = useState(true); // Simulate loading state

  return (
    <div className="container-fluid p-3">
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", mb: 4 }}>
    
          ACTIVITY LOGS
       
      </Typography>

      <HarvestSkeliton />
    </div>
  );
}

export default ActivityLogs;


