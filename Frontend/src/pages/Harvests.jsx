import React, { useState } from "react";
import {
  Container,
  Box,
  Paper,
  Grid,
  TablePagination,
} from "@mui/material";
import { useHarvestItems } from "../hooks/HarvestHooks";
import HarvestSkeliton from "../skelitons/HarvestSkeliton";
import DashboardSkeliton from "../skelitons/DashboardSkeliton";
import {
  useAcceptedOverall,
  useRejectedOverall,
  useTotalOverallYield,
  useAcceptedLast7Days,
  useRejectedLast7Days,
  useTotalYieldLast7Days,
  useAcceptedToday,
  useRejectedToday,
  useTotalYieldToday,
} from "../hooks/HarvestHooks";
import FilterSearchSection from "../props/FilterSearchSection";
import HarvestTable from "../props/HarvestTable";
import CustomDateModal from "../props/CustomDateModal";
import Metric from "../props/MetricSection";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import GrainIcon from "@mui/icons-material/Grain";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

// Helper function to compare only the date parts (ignoring time)
const isSameDay = (date1, date2) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const Harvest = () => {
  const { harvestItems, harvestLoading } = useHarvestItems();
  const [harvestPage, setHarvestPage] = useState(0);
  const rowsPerPage = 10;
  const [harvestSearchTerm, setHarvestSearchTerm] = useState("");
  const [harvestFilter, setHarvestFilter] = useState("ALL");

  // Custom date state
  const [openDateModal, setOpenDateModal] = useState(false);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);

  // Metrics hooks for overall, last 7 days, etc.
  const { overallAccepted, overallAcceptedLoading } = useAcceptedOverall();
  const { overallRejected, overallRejectedLoading } = useRejectedOverall();
  const { overallTotalYield, overallTotalYieldLoading } = useTotalOverallYield();
  const { acceptedLast7Days, acceptedLast7DaysLoading } = useAcceptedLast7Days();
  const { rejectedLast7Days, rejectedLast7DaysLoading } = useRejectedLast7Days();
  const { totalYieldLast7Days, totalYieldLast7DaysLoading } = useTotalYieldLast7Days();

  // CURRENT DAY hooks
  const { todayAccepted, todayAcceptedLoading } = useAcceptedToday();
  const { todayRejected, todayRejectedLoading } = useRejectedToday();
  const { todayTotalYield, todayTotalYieldLoading } = useTotalYieldToday();

  // THIS MONTH metrics (computed inline)
  const thisMonthAccepted = harvestItems
    .filter((item) => {
      const date = new Date(item.harvest_date);
      const today = new Date();
      return (
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    })
    .reduce((sum, item) => sum + item.accepted, 0);
  const thisMonthRejected = harvestItems
    .filter((item) => {
      const date = new Date(item.harvest_date);
      const today = new Date();
      return (
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    })
    .reduce((sum, item) => sum + item.total_rejected, 0);
  const thisMonthTotalYield = harvestItems
    .filter((item) => {
      const date = new Date(item.harvest_date);
      const today = new Date();
      return (
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    })
    .reduce((sum, item) => sum + item.total_yield, 0);

  // CHOOSE DATE metrics: include all items whose harvest_date falls between customFrom and customTo (inclusive)
  const customAccepted =
    customFrom && customTo
      ? harvestItems
          .filter((item) => {
            const date = new Date(item.harvest_date);
            const adjustedCustomTo = new Date(customTo);
            adjustedCustomTo.setHours(23, 59, 59, 999);
            return date >= customFrom && date <= adjustedCustomTo;
          })
          .reduce((sum, item) => sum + item.accepted, 0)
      : 0;
  const customRejected =
    customFrom && customTo
      ? harvestItems
          .filter((item) => {
            const date = new Date(item.harvest_date);
            const adjustedCustomTo = new Date(customTo);
            adjustedCustomTo.setHours(23, 59, 59, 999);
            return date >= customFrom && date <= adjustedCustomTo;
          })
          .reduce((sum, item) => sum + item.total_rejected, 0)
      : 0;
  const customTotalYield =
    customFrom && customTo
      ? harvestItems
          .filter((item) => {
            const date = new Date(item.harvest_date);
            const adjustedCustomTo = new Date(customTo);
            adjustedCustomTo.setHours(23, 59, 59, 999);
            return date >= customFrom && date <= adjustedCustomTo;
          })
          .reduce((sum, item) => sum + item.total_yield, 0)
      : 0;

  // Determine metrics based on filter
  const acceptedMetric =
    harvestFilter === "ALL"
      ? overallAccepted
      : harvestFilter === "LAST 7 DAYS"
      ? acceptedLast7Days
      : harvestFilter === "THIS MONTH"
      ? thisMonthAccepted
      : harvestFilter === "CURRENT DAY"
      ? todayAccepted
      : harvestFilter === "CHOOSE DATE"
      ? customAccepted
      : overallAccepted;
  const acceptedLoadingMetric =
    harvestFilter === "ALL"
      ? overallAcceptedLoading
      : harvestFilter === "LAST 7 DAYS"
      ? acceptedLast7DaysLoading
      : harvestFilter === "THIS MONTH"
      ? harvestLoading
      : harvestFilter === "CURRENT DAY"
      ? todayAcceptedLoading
      : harvestFilter === "CHOOSE DATE"
      ? harvestLoading
      : overallAcceptedLoading;

  const rejectedMetric =
    harvestFilter === "ALL"
      ? overallRejected
      : harvestFilter === "LAST 7 DAYS"
      ? rejectedLast7Days
      : harvestFilter === "THIS MONTH"
      ? thisMonthRejected
      : harvestFilter === "CURRENT DAY"
      ? todayRejected
      : harvestFilter === "CHOOSE DATE"
      ? customRejected
      : overallRejected;
  const rejectedLoadingMetric =
    harvestFilter === "ALL"
      ? overallRejectedLoading
      : harvestFilter === "LAST 7 DAYS"
      ? rejectedLast7DaysLoading
      : harvestFilter === "THIS MONTH"
      ? harvestLoading
      : harvestFilter === "CURRENT DAY"
      ? todayRejectedLoading
      : harvestFilter === "CHOOSE DATE"
      ? harvestLoading
      : overallRejectedLoading;

  const totalYieldMetric =
    harvestFilter === "ALL"
      ? overallTotalYield
      : harvestFilter === "LAST 7 DAYS"
      ? totalYieldLast7Days
      : harvestFilter === "THIS MONTH"
      ? thisMonthTotalYield
      : harvestFilter === "CURRENT DAY"
      ? todayTotalYield
      : harvestFilter === "CHOOSE DATE"
      ? customTotalYield
      : overallTotalYield;
  const totalYieldLoadingMetric =
    harvestFilter === "ALL"
      ? overallTotalYieldLoading
      : harvestFilter === "LAST 7 DAYS"
      ? totalYieldLast7DaysLoading
      : harvestFilter === "THIS MONTH"
      ? harvestLoading
      : harvestFilter === "CURRENT DAY"
      ? todayTotalYieldLoading
      : harvestFilter === "CHOOSE DATE"
      ? harvestLoading
      : overallTotalYieldLoading;

  // Compute lose rate metrics based on filters
  const overallTotal = overallAccepted + overallRejected;
  const overallLoseRate =
    overallTotal > 0 ? (overallRejected / overallTotal) * 100 : 0;
  const overallLoseRateLoading =
    overallAcceptedLoading || overallRejectedLoading;

  const last7Total = acceptedLast7Days + rejectedLast7Days;
  const loseRateLast7Days =
    last7Total > 0 ? (rejectedLast7Days / last7Total) * 100 : 0;
  const loseRateLast7DaysLoading =
    acceptedLast7DaysLoading || rejectedLast7DaysLoading;

  const thisMonthTotal = thisMonthAccepted + thisMonthRejected;
  const loseRateThisMonth =
    thisMonthTotal > 0 ? (thisMonthRejected / thisMonthTotal) * 100 : 0;
  const loseRateThisMonthLoading = harvestLoading;

  const customTotal = customAccepted + customRejected;
  const customLoseRate =
    customTotal > 0 ? (customRejected / customTotal) * 100 : 0;
  const customLoseRateLoading = harvestLoading;

  // CURRENT DAY lose rate computation
  const loseRateToday =
    todayAccepted + todayRejected > 0
      ? (todayRejected / (todayAccepted + todayRejected)) * 100
      : 0;

  const loseRateMetric =
    harvestFilter === "ALL"
      ? overallLoseRate
      : harvestFilter === "LAST 7 DAYS"
      ? loseRateLast7Days
      : harvestFilter === "THIS MONTH"
      ? loseRateThisMonth
      : harvestFilter === "CURRENT DAY"
      ? loseRateToday
      : harvestFilter === "CHOOSE DATE"
      ? customLoseRate
      : overallLoseRate;
  const loseRateLoadingMetric =
    harvestFilter === "ALL"
      ? overallLoseRateLoading
      : harvestFilter === "LAST 7 DAYS"
      ? loseRateLast7DaysLoading
      : harvestFilter === "CURRENT DAY"
      ? (todayAcceptedLoading || todayRejectedLoading)
      : harvestFilter === "THIS MONTH" || harvestFilter === "CHOOSE DATE"
      ? harvestLoading
      : overallLoseRateLoading;

  // Table filtering – sort items by harvest_date descending
  const sortedHarvestItems = [...harvestItems].sort((a, b) => {
    // First, compare the dates in descending order
    const dateDiff = new Date(b.harvest_date) - new Date(a.harvest_date);
    // If dates are equal, sort by harvest_id in descending order
    return dateDiff !== 0 ? dateDiff : b.harvest_id - a.harvest_id;
  });
  
  const filterByDate = (item) => {
    const itemDate = new Date(item.harvest_date);
    const today = new Date();
    if (harvestFilter === "ALL") return true;
    if (harvestFilter === "LAST 7 DAYS") {
      const pastDate = new Date();
      pastDate.setDate(today.getDate() - 6);
      return itemDate >= pastDate && itemDate <= today;
    }
    if (harvestFilter === "THIS MONTH") {
      return (
        itemDate.getMonth() === today.getMonth() &&
        itemDate.getFullYear() === today.getFullYear()
      );
    }
    if (harvestFilter === "CURRENT DAY") {
      return (
        itemDate.getDate() === today.getDate() &&
        itemDate.getMonth() === today.getMonth() &&
        itemDate.getFullYear() === today.getFullYear()
      );
    }
    if (harvestFilter === "CHOOSE DATE") {
      if (!customFrom || !customTo) return true;
      const adjustedCustomTo = new Date(customTo);
      adjustedCustomTo.setHours(23, 59, 59, 999);
      return itemDate >= customFrom && itemDate <= adjustedCustomTo;
    }
    return true;
  };

  // Updated filtering: search in harvest_date, notes, and full_name
  const filteredHarvestItems = sortedHarvestItems.filter((item) => {
    const dateMatch = filterByDate(item);
    const searchTerm = harvestSearchTerm.toLowerCase();
    const harvestDate = item.harvest_date ? item.harvest_date.toLowerCase() : "";
    const notes = item.notes ? item.notes.toLowerCase() : "";
    const name = item.full_name ? item.full_name.toLowerCase() : "";
    const searchMatch =
      harvestDate.includes(searchTerm) ||
      notes.includes(searchTerm) ||
      name.includes(searchTerm);
    return dateMatch && searchMatch;
  });

  // Handle filter change
  const handleFilterChange = (e) => {
    const value = e.target.value;
    if (value === "CHOOSE DATE") {
      setOpenDateModal(true);
    } else {
      setHarvestFilter(value);
    }
  };

  // Apply custom date range (filtering happens only when Apply is clicked)
  const handleApplyCustomDates = () => {
    if (customFrom && customTo) {
      setHarvestFilter("CHOOSE DATE");
      setOpenDateModal(false);
    }
  };

  return (
    <Container maxWidth="xxl" sx={{ p: 3 }}>
      {/* Uncomment the Metric section if needed
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Metric
            title="Accepted"
            value={acceptedMetric}
            loading={acceptedLoadingMetric}
            icon={<CheckCircleOutlineIcon sx={{ fontSize: "4rem", color: "#fff" }} />}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <Metric
            title="Rejected"
            value={rejectedMetric}
            loading={rejectedLoadingMetric}
            icon={<HighlightOffIcon sx={{ fontSize: "4rem", color: "#fff" }} />}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <Metric
            title="Total Yield"
            value={totalYieldMetric}
            loading={totalYieldLoadingMetric}
            icon={<GrainIcon sx={{ fontSize: "4rem", color: "#fff" }} />}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <Metric
            title="Lose Rate"
            value={loseRateMetric}
            loading={loseRateLoadingMetric}
            icon={<TrendingDownIcon sx={{ fontSize: "4rem", color: "#fff" }} />}
          />
        </Grid>
      </Grid>
      */}
      <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 3, mt: 3 }}>
        <FilterSearchSection
          harvestSearchTerm={harvestSearchTerm}
          setHarvestSearchTerm={setHarvestSearchTerm}
          harvestFilter={harvestFilter}
          handleFilterChange={handleFilterChange}
          openDateModalHandler={() => setOpenDateModal(true)}
        />

        <Box sx={{ mt: 2 }}>
          {harvestLoading ? (
            <HarvestSkeliton />
          ) : (
            <HarvestTable
              filteredHarvestItems={filteredHarvestItems}
              harvestLoading={harvestLoading}
              harvestPage={harvestPage}
              rowsPerPage={rowsPerPage}
            />
          )}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <TablePagination
              component="div"
              count={filteredHarvestItems.length}
              rowsPerPage={rowsPerPage}
              page={harvestPage}
              onPageChange={(event, newPage) => setHarvestPage(newPage)}
              rowsPerPageOptions={[rowsPerPage]}
            />
          </Box>
        </Box>
      </Paper>

      <CustomDateModal
        openDateModal={openDateModal}
        setOpenDateModal={(value) => {
          setOpenDateModal(value);
          if (!value && (!customFrom || !customTo)) {
            // If the modal is closed without applying a range, revert filter back to "ALL"
            setHarvestFilter("ALL");
          }
        }}
        customFrom={customFrom}
        setCustomFrom={setCustomFrom}
        customTo={customTo}
        setCustomTo={setCustomTo}
        handleApplyCustomDates={handleApplyCustomDates}
      />
    </Container>
  );
};

export default Harvest;
