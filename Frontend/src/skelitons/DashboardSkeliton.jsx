import React from "react";
import { Skeleton } from "@mui/material";

function DashboardSkeliton (){

    return (
        <div className="cards text-white p-3 mb-3" style={{ minHeight: "150px", borderRadius: "8px", backgroundColor: "#FFF" }}>
        {/* Title and Value Skeleton */}
        <div>
          <Skeleton variant="text" width="80%" height={40} sx={{ bgcolor: "#c0c0c0", marginBottom: "8px" }} />
          <Skeleton variant="text" width="50%" height={25} sx={{ bgcolor: "#c0c0c0" }} />
        </div>
    
        {/* Chart Skeleton */}
        <div className="mt-2" style={{ width: "100%", height: "60px" }}>
          <Skeleton variant="rectangular" width="100%" height="100%" sx={{ bgcolor: "#c0c0c0" }} />
        </div>
      </div>
    );
    
}


export default DashboardSkeliton;