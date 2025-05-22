// HarvestAnalytics.jsx (Based on your original code, with only Yearly filter added)
import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Box,
  Button,
  Grid,
  Modal,
  Divider,
  TextField, // Added for DatePicker renderInput
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import TrendingUpIcon from "@mui/icons-material/TrendingDown"; // Original: TrendingUpIcon
import Grain from "@mui/icons-material/Grain";
// Icons for filter options
import FilterListIcon from "@mui/icons-material/FilterList";
import ViewListIcon from "@mui/icons-material/ViewList";
import TodayIcon from "@mui/icons-material/Today";
import HistoryIcon from "@mui/icons-material/History";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DateRangeIcon from "@mui/icons-material/DateRange";
import EventIcon from "@mui/icons-material/Event";

// Assuming useHarvestHistory is imported if in another file
// import useHarvestHistory from './useHarvestHistory';

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4, // Your original padding
};

const filterOptions = [
  { value: "none", label: "SELECT FILTER", icon: <FilterListIcon fontSize="small" sx={{ mr: 1 }} />, disabled: true },
  { value: "overallTotal", label: "ALL DATA", icon: <ViewListIcon sx={{ mr: 1 }} /> },
  { value: "currentDay", label: "CURRENT DAY", icon: <TodayIcon sx={{ mr: 1 }} /> },
  { value: "last7", label: "LAST 7 DAYS", icon: <HistoryIcon sx={{ mr: 1 }} /> },
  { value: "currentMonth", label: "CURRENT MONTH", icon: <CalendarMonthIcon sx={{ mr: 1 }} /> },
  { value: "selectedMonth", label: "SELECTED MONTH", icon: <DateRangeIcon sx={{ mr: 1 }} /> },
  { value: "yearly", label: "SELECT YEAR", icon: <TodayIcon sx={{ mr: 1 }} /> }, // <<< ADDED YEARLY OPTION
  { value: "custom", label: "SELECT DATE", icon: <EventIcon sx={{ mr: 1 }} /> },
];

const HarvestAnalytics = ({
  harvestHistory,
  getCurrentDayData,
  getOverallTotalData,
  getCurrentMonthData,
  getMonthData,
  filterHarvestData,
  getYearlyData, // <<< Destructure getYearlyData
  loading,      // <<< Added loading prop
}) => {
  const [activeFilter, setActiveFilter] = useState("last7"); // Renamed from 'filter' for clarity in new logic
  const [dropdownValue, setDropdownValue] = useState("none"); // Control Select component
  const [chartData, setChartData] = useState([]);
  // chartTitle state will be managed by getChartTitle directly based on activeFilter and applied values
  // const [chartTitle, setChartTitle] = useState(""); // Removed, will use getChartTitle output

  // Modal states for Selected Month (using your original naming)
  const [openMonthModal, setOpenMonthModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Temp for modal
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());   // Temp for modal
  // Applied values for selected month
  const [appliedMonth, setAppliedMonth] = useState(null);
  const [appliedYearForMonth, setAppliedYearForMonth] = useState(null);


  // Modal states for Custom Date Range (using your original naming)
  const [openCustomModal, setOpenCustomModal] = useState(false);
  const [customFrom, setCustomFrom] = useState(null); // Temp for modal
  const [customTo, setCustomTo] = useState(null);     // Temp for modal
  const [isDateError, setIsDateError] = useState(false);
  // Applied values for custom range
  const [appliedCustomFrom, setAppliedCustomFrom] = useState(null);
  const [appliedCustomTo, setAppliedCustomTo] = useState(null);

  // <<< NEW: Modal states for Yearly filter >>>
  const [openYearModal, setOpenYearModal] = useState(false);
  const [tempSelectedYearly, setTempSelectedYearly] = useState(new Date().getFullYear());
  const [appliedYearly, setAppliedYearly] = useState(null);


  useEffect(() => {
    if (customFrom && customTo) { // This uses temp values from modal for live error check
      setIsDateError(new Date(customFrom) > new Date(customTo));
    } else {
      setIsDateError(false);
    }
  }, [customFrom, customTo]);

  // Main useEffect to update chartData based on activeFilter and applied modal values
  useEffect(() => {
    if (loading) {
        setChartData([]);
        return;
    }
    if (!harvestHistory && activeFilter === "last7" && !loading) { // Initial check
        setChartData([]);
        return;
    }

    let data;
    switch (activeFilter) {
      case "last7":
        data = harvestHistory || []; // Directly use prop for last7
        break;
      case "currentDay":
        data = getCurrentDayData ? getCurrentDayData() : [];
        break;
      case "currentMonth":
        data = getCurrentMonthData ? getCurrentMonthData() : [];
        break;
      case "overallTotal":
        const overall = getOverallTotalData ? getOverallTotalData() : { accepted: 0, rejected: 0, totalYield: 0, date: "Overall" };
        data = [overall]; // Chart expects an array
        break;
      case "selectedMonth":
        if (appliedMonth && appliedYearForMonth && getMonthData) {
          data = getMonthData(appliedMonth, appliedYearForMonth);
        } else {
          data = []; // Default to empty if not applied
        }
        break;
      case "yearly": // <<< HANDLE YEARLY FILTER >>>
        if (appliedYearly && getYearlyData) {
          data = getYearlyData(appliedYearly);
        } else {
          data = [];
        }
        break;
      case "custom":
        if (appliedCustomFrom && appliedCustomTo && filterHarvestData) {
          const fromDate = new Date(appliedCustomFrom);
          const toDate = new Date(appliedCustomTo);
          const fromString = `${fromDate.getFullYear()}-${String(fromDate.getMonth() + 1).padStart(2, "0")}-${String(fromDate.getDate()).padStart(2, "0")}`;
          const toString = `${toDate.getFullYear()}-${String(toDate.getMonth() + 1).padStart(2, "0")}-${String(toDate.getDate()).padStart(2, "0")}`;
          data = filterHarvestData(fromString, toString);
        } else {
          data = [];
        }
        break;
      default:
        data = harvestHistory || []; // Fallback
        break;
    }
    setChartData(data);
  }, [
    activeFilter, harvestHistory, getCurrentDayData, getOverallTotalData, getCurrentMonthData,
    getMonthData, getYearlyData, filterHarvestData, // Add getYearlyData
    appliedMonth, appliedYearForMonth, appliedCustomFrom, appliedCustomTo, appliedYearly, // Add appliedYearly
    loading
  ]);

  const handleFilterChange = (event) => {
    const selectedValue = event.target.value;
    setDropdownValue(selectedValue); // Update dropdown immediately

    if (selectedValue === "selectedMonth") {
      // Pre-fill modal with currently applied values or defaults
      setCustomFrom(appliedMonth || new Date().getMonth() + 1); // Using `selectedMonth` for modal temp state
      setSelectedYear(appliedYearForMonth || new Date().getFullYear()); // Using `selectedYear` for modal temp state
      setOpenMonthModal(true);
    } else if (selectedValue === "custom") {
      setCustomFrom(appliedCustomFrom); // Temp state `customFrom` for modal
      setCustomTo(appliedCustomTo);     // Temp state `customTo` for modal
      setOpenCustomModal(true);
    } else if (selectedValue === "yearly") { // <<< HANDLE YEARLY SELECTION >>>
      setTempSelectedYearly(appliedYearly || new Date().getFullYear());
      setOpenYearModal(true);
    }
    else {
      setActiveFilter(selectedValue);
      // Reset applied modal values if an instant filter is chosen
      setAppliedMonth(null); setAppliedYearForMonth(null);
      setAppliedCustomFrom(null); setAppliedCustomTo(null);
      setAppliedYearly(null);
       setDropdownValue("none"); 
    }
  };

  const handleModalClose = (modalType) => {
    if (modalType === 'month') setOpenMonthModal(false);
    if (modalType === 'custom') setOpenCustomModal(false);
    if (modalType === 'year') setOpenYearModal(false); // <<< CLOSE YEAR MODAL >>>
    // Revert dropdown to active filter if modal was cancelled, or to 'none' if nothing is active
    setDropdownValue(activeFilter && activeFilter !== "none" ? activeFilter : "none");
  };


  const handleApplySelectedMonth = () => {
    // Apply from modal's temp states (selectedMonth, selectedYear)
    setAppliedMonth(selectedMonth);
    setAppliedYearForMonth(selectedYear);
    setActiveFilter("selectedMonth");
    setOpenMonthModal(false);
    setDropdownValue("selectedMonth"); // Reflect applied filter in dropdown
    // Reset other applied modal states
    setAppliedCustomFrom(null); setAppliedCustomTo(null); setAppliedYearly(null);
  };

  const handleApplyCustomDates = () => {
    // Apply from modal's temp states (customFrom, customTo)
    if (customFrom && customTo && !isDateError) {
      setAppliedCustomFrom(new Date(customFrom));
      setAppliedCustomTo(new Date(customTo));
      setActiveFilter("custom");
      setOpenCustomModal(false);
      setDropdownValue("custom");
      // Reset other applied modal states
      setAppliedMonth(null); setAppliedYearForMonth(null); setAppliedYearly(null);
    }
  };

  // <<< NEW FUNCTION: Apply Yearly Filter >>>
  const handleApplyYearlyFilter = () => {
    setAppliedYearly(tempSelectedYearly);
    setActiveFilter("yearly");
    setOpenYearModal(false);
    setDropdownValue("yearly");
    // Reset other applied modal states
    setAppliedMonth(null); setAppliedYearForMonth(null);
    setAppliedCustomFrom(null); setAppliedCustomTo(null);
  };


  // This function now dynamically generates the title
  const getChartTitleText = () => {
    const today = new Date();
    switch (activeFilter) {
      case "currentDay":
        return `Harvest History (CURRENT DAY: ${today.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })})`;
      case "last7":
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 6);
        return `Harvest History (LAST 7 DAYS: ${startDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} - ${endDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })})`;
      case "currentMonth":
        return `Harvest History (CURRENT MONTH: ${today.toLocaleString("default", { month: "long", year: "numeric" })})`;
      case "selectedMonth":
        if (appliedMonth && appliedYearForMonth) {
          return `Harvest History (SELECTED MONTH: ${new Date(appliedYearForMonth, appliedMonth - 1).toLocaleString("default", { month: "long" })} ${appliedYearForMonth})`;
        }
        return "Harvest History (Select a Month)";
      case "yearly": // <<< TITLE FOR YEARLY >>>
        if (appliedYearly) {
          return `Harvest History (YEAR: ${appliedYearly})`;
        }
        return "Harvest History (Select a Year)";
      case "custom":
        if (appliedCustomFrom && appliedCustomTo) {
          return `Harvest History (CUSTOM: ${new Date(appliedCustomFrom).toLocaleDateString()} - ${new Date(appliedCustomTo).toLocaleDateString()})`;
        }
        return "Harvest History (Select Custom Dates)";
      case "overallTotal":
        return `Overall Harvest Totals (AS OF: ${today.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })})`;
      default:
        return "Harvest History";
    }
  };

  // Your original summary calculation
  const summaryTotals = chartData.reduce(
    (totals, item) => {
      totals.accepted += item.accepted || 0; // Added || 0 for safety
      totals.rejected += item.rejected || 0; // Added || 0 for safety
      totals.totalYield += item.totalYield || 0; // Added || 0 for safety
      return totals;
    },
    { accepted: 0, rejected: 0, totalYield: 0 }
  );
  const totalItems = summaryTotals.accepted + summaryTotals.rejected;
  const lossRate = totalItems > 0 ? ((summaryTotals.rejected / totalItems) * 100).toFixed(2) : "0.00";

  return (
    <Paper
      elevation={3}
      sx={{
        p: { xs: 2, md: 3 }, // Your original p
        mb: 4,
        backgroundColor: "#FFF",
        boxShadow: "0px 4px 10px rgba(0,0,0,0.35)",
        borderRadius: "15px",
      }}
    >
      <Box
        display="flex"
        flexDirection={{ xs: "column", md: "row" }} // Your original flexDirection
        justifyContent="space-between"
        alignItems="center"
        mb={5} // Your original mb
      >
        <Typography
          variant="h4" // Your original variant
          sx={{
            fontWeight: "bold",
            fontSize: "clamp(1.2rem, 1.7vw, 2rem)", // Your original fontSize
            color: "#000",
          }}
        >
          Harvest Analytics
        </Typography>
        <FormControl
          variant="outlined"
          size="small"
          sx={{
            minWidth: 150, // Your original minWidth
            borderRadius: "4px",
          }}
        >
          <InputLabel id="harvest-filter-label">Filter Harvests</InputLabel>
          <Select
            labelId="harvest-filter-label"
            value={dropdownValue}
            label="Filter Harvests"
            onChange={handleFilterChange}
          >
            {filterOptions.map((option) => (
              <MenuItem key={option.value} value={option.value} disabled={option.disabled}> {/* Added disabled prop */}
                {option.icon}
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Typography
        variant="h6" // Your original variant
        sx={{ fontSize: "clamp(0.875rem, 1.7vw, 2rem)", color: "#000" }} // Your original fontSize
        gutterBottom
      >
        {getChartTitleText()} {/* Use the dynamic title function */}
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Box
            sx={{
              height: { xs: 250, md: 400 }, // Your original height
              width: "100%",
              backgroundColor: "#FFF", // Your original backgroundColor
              borderRadius: "20px", // Your original borderRadius
            }}
          >
            {loading ? (
                <Typography sx={{textAlign: 'center', pt:10}}>Loading data...</Typography>
            ) : !chartData || chartData.length === 0 ? (
                <Typography sx={{textAlign: 'center', pt:10}}>No data available for this period.</Typography>
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }} // Your original margin
              >
                <CartesianGrid stroke="#666" strokeDasharray="3 3" /> {/* Your original */}
                <XAxis
                  dataKey="date"
                  stroke="#000"
                  tick={{ fill: "#000", fontSize: activeFilter === 'yearly' ? 12 : 16 }} // Adjusted yearly tick size
                />
                <YAxis stroke="#000" tick={{ fill: "#000" }} /> {/* Your original */}
                <Tooltip
                  contentStyle={{ backgroundColor: "#06402B", border: "1px solid #fff" }} // Your original
                  labelStyle={{ color: "#fff" }}
                />
                <Legend
                  wrapperStyle={{ color: "#000" }} // Your original
                  formatter={(value) => (<span style={{ color: "#000" }}>{value}</span>)}
                />
                <Line type="monotone" dataKey="accepted" stroke="#00E676" name="Accepted Items" strokeWidth={7} /> {/* Your original */}
                <Line type="monotone" dataKey="rejected" stroke="#FF6B6B" name="Rejected Items" strokeWidth={7} /> {/* Your original */}
                 {/* Optional: Add Total Yield line if not overall total view */}
                {activeFilter !== 'overallTotal' && (
                    <Line type="monotone" dataKey="totalYield" stroke="#82ca9d" name="Total Yield" strokeWidth={3} strokeDasharray="5 5" />
                )}
              </LineChart>
            </ResponsiveContainer>
            )}
          </Box>
        </Grid>

        {/* Your original Summary Grid */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: { xs: 1, md: 2 }, backgroundColor: "#06402B", borderRadius: "10px", height: "100%", display: "flex", flexDirection: "column" }}>
            <Typography variant="h5" textAlign="center" sx={{ color: "white", mb: 3, fontWeight: "bold", fontSize: { xs: "1.2rem", md: "1.5rem" } }}>
              Summary
            </Typography>
            <Grid container spacing={2} sx={{ flex: 1, "& .MuiGrid-item": { height: "45%" } }}>
              <Grid item xs={6}>
                <Box sx={{ height: "100%", backgroundColor: "#fff", borderRadius: 2, p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box> <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: "1.5rem", md: "2rem" } }}>{summaryTotals.accepted}</Typography> <Typography variant="body2" color="text.secondary">Accepted</Typography> </Box>
                  <CheckCircleIcon color="success" sx={{ fontSize: { xs: 30, sm: 40, md: 48 } }} />
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ height: "100%", backgroundColor: "#fff", borderRadius: 2, p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box> <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: "1.5rem", md: "2rem" } }}>{summaryTotals.rejected}</Typography> <Typography variant="body2" color="text.secondary">Rejected</Typography> </Box>
                  <CancelIcon color="error" sx={{ fontSize: { xs: 30, sm: 40, md: 48 } }} />
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ height: "100%", backgroundColor: "#fff", borderRadius: 2, p: 2, display: "flex", alignItems: "center", justifyContent: "space-between", "& .MuiTypography-root": { color: "#000" }, }}>
                  <Box> <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: "1.5rem", md: "2rem" } }}>{summaryTotals.totalYield}</Typography> <Typography variant="body2">Total</Typography> </Box>
                  <Grain sx={{ fontSize: { xs: 30, sm: 40, md: 48 }, color: "#2196f3" }} />
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ height: "100%", backgroundColor: "#fff", borderRadius: 2, p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box> <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: "1.3rem", md: "2rem" } }}>{lossRate}%</Typography> <Typography variant="body2" color="text.secondary">Loss Rate</Typography> </Box>
                  <TrendingUpIcon sx={{ fontSize: { xs: 30, sm: 40, md: 48 }, color: "red" }} />
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Month Modal (Your original, but using handleModalClose) */}
      <Modal open={openMonthModal} onClose={() => handleModalClose('month')} aria-labelledby="harvest-month-modal">
        <Box sx={modalStyle}>
          <Typography variant="h6" sx={{ mb: 2 }}>Select Month and Year</Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="harvest-month-label">Month</InputLabel>
            <Select labelId="harvest-month-label" value={selectedMonth} label="Month" onChange={(e) => setSelectedMonth(e.target.value)}>
              {Array.from({ length: 12 }, (_, i) => (<MenuItem key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString("default", { month: "long" })}</MenuItem>))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="harvest-year-label">Year</InputLabel>
            <Select labelId="harvest-year-label" value={selectedYear} label="Year" onChange={(e) => setSelectedYear(e.target.value)}>
              {Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i).map((year) => ( // <<< DYNAMIC YEAR RANGE >>>
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Divider sx={{ my: 3 }} />
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button onClick={() => handleModalClose('month')} variant="outlined" color="secondary">CANCEL</Button>
            <Button onClick={handleApplySelectedMonth} variant="contained" color="primary">APPLY</Button>
          </Box>
        </Box>
      </Modal>

      {/* Custom Date Modal (Your original, but using handleModalClose and TextField for DatePicker) */}
      <Modal open={openCustomModal} onClose={() => handleModalClose('custom')} aria-labelledby="harvest-custom-date-modal">
        <Box sx={modalStyle}>
          <Typography variant="h6" sx={{ mb: 2 }}>Choose Date Range</Typography>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <DatePicker label="FROM" value={customFrom} onChange={(newValue) => setCustomFrom(newValue)} renderInput={(params) => <TextField {...params} fullWidth size="medium" />} />
              <DatePicker label="TO" value={customTo} onChange={(newValue) => setCustomTo(newValue)} renderInput={(params) => <TextField {...params} fullWidth size="medium" error={isDateError} helperText={isDateError ? "From date cannot be later than To date" : ""} />} />
            </Box>
          </LocalizationProvider>
          <Divider sx={{ my: 3 }} />
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button onClick={() => handleModalClose('custom')} variant="outlined" color="secondary">CANCEL</Button>
            <Button onClick={handleApplyCustomDates} variant="contained" color="primary" disabled={isDateError || !customFrom || !customTo}>APPLY</Button>
          </Box>
        </Box>
      </Modal>

      {/* <<< NEW: Yearly Filter Modal >>> */}
      <Modal open={openYearModal} onClose={() => handleModalClose('year')}>
        <Box sx={modalStyle}>
          <Typography variant="h6" sx={{ mb: 2 }}>Select Year</Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="harvest-yearly-filter-label">Year</InputLabel>
            <Select labelId="harvest-yearly-filter-label" value={tempSelectedYearly} label="Year" onChange={(e) => setTempSelectedYearly(e.target.value)}>
              {Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i).map((year) => ( // Dynamic year range
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button onClick={() => handleModalClose('year')} variant="outlined" color="secondary">CANCEL</Button>
            <Button onClick={handleApplyYearlyFilter} variant="contained" color="primary">APPLY</Button>
          </Box>
        </Box>
      </Modal>
    </Paper>
  );
};

export default HarvestAnalytics;