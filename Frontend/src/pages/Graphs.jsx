import React from "react";
import { Container } from "@mui/material";
import { ThemeProvider, createTheme, responsiveFontSizes } from "@mui/material/styles";
import HarvestAnalytics from "../components/HarvestAnalytics";
import RejectionAnalytics from "../components/RejectionAnalytics";
import AnalyticsDashboardSkeleton from "../skelitons/AnalyticsSkeliton";
import useHarvestHistory from "../hooks/HarvestBarChartHooks";
import useRejectionData from "../hooks/RejectionLineChartHooks";
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
  } = useHarvestHistory();

  const {
    timeSeriesData,
    loading: rejectionLoading,
    getCurrentDayDataRejection,
     getOverallTotalRejectionData,
    getRejectionCurrentMonthData,
    getRejectionMonthData,
    filterRejectionData,
  } = useRejectionData();

  let theme = createTheme();
  theme = responsiveFontSizes(theme);

  if (harvestLoading && rejectionLoading) return <AnalyticsDashboardSkeleton />;

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
        />
        <RejectionAnalytics
          timeSeriesData={timeSeriesData}
          getCurrentDayDataRejection={getCurrentDayDataRejection}
          getOverallTotalRejectionData={getOverallTotalRejectionData}
          getRejectionCurrentMonthData={getRejectionCurrentMonthData}
          getRejectionMonthData={getRejectionMonthData}
          filterRejectionData={filterRejectionData}
        />
         <SensorAnalytics/>
      </Container>
    </ThemeProvider>
  );
};

export default AnalyticsDashboard;
