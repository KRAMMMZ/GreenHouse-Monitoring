//GPAPH.JSX (or AnalyticsDashboard.jsx)
import React from "react";
import { Container } from "@mui/material";
import { ThemeProvider, createTheme, responsiveFontSizes } from "@mui/material/styles";
import HarvestAnalytics from "../components/HarvestAnalytics";
import RejectionAnalytics from "../components/RejectionAnalytics";
import AnalyticsDashboardSkeleton from "../skelitons/AnalyticsSkeliton";
import useHarvestHistory from "../hooks/HarvestBarChartHooks";
import useRejectionData from "../hooks/RejectionLineChartHooks"; // Corrected path if needed
import SensorAnalytics from "../components/SensorAnalytics";
import SalesAnalytics from "../components/SalesGraph";

const AnalyticsDashboard = () => {
  const {
    harvestHistory,
    loading: harvestLoading,
    getCurrentDayData,
    getOverallTotalData,
    getCurrentMonthData,
    getMonthData,
    filterHarvestData,
    getYearlyData,
  } = useHarvestHistory();

  const {
    timeSeriesData,
    loading: rejectionLoading,
    getCurrentDayDataRejection,
    getOverallTotalRejectionData,
    getRejectionCurrentMonthData,
    getRejectionMonthData,
    filterRejectionData,
    getRejectionYearlyData, // Destructure the new function
  } = useRejectionData();

  let theme = createTheme();
  theme = responsiveFontSizes(theme);

  // Consider combined loading state if both need to be ready
  if (harvestLoading || rejectionLoading) return <AnalyticsDashboardSkeleton />; 

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="xxl" sx={{ paddingTop: 2 }}>
        <SalesAnalytics/> 
        
        <HarvestAnalytics
          harvestHistory={harvestHistory}
          getCurrentDayData={getCurrentDayData}
          getOverallTotalData={getOverallTotalData}
          getCurrentMonthData={getCurrentMonthData}
          getMonthData={getMonthData}
          filterHarvestData={filterHarvestData}
          getYearlyData={getYearlyData}
        />
        <RejectionAnalytics
          timeSeriesData={timeSeriesData}
          getCurrentDayDataRejection={getCurrentDayDataRejection}
          getOverallTotalRejectionData={getOverallTotalRejectionData}
          getRejectionCurrentMonthData={getRejectionCurrentMonthData}
          getRejectionMonthData={getRejectionMonthData}
          filterRejectionData={filterRejectionData}
          getRejectionYearlyData={getRejectionYearlyData} // Pass the new prop
        />
         <SensorAnalytics/>
      </Container>
    </ThemeProvider>
  );
};

export default AnalyticsDashboard;