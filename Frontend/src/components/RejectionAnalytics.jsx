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
  TextField, // Import TextField
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import SickIcon from "@mui/icons-material/Sick";
import BrokenImageIcon from "@mui/icons-material/BrokenImage";
import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMap";

import FilterListIcon from "@mui/icons-material/FilterList";
import ViewListIcon from "@mui/icons-material/ViewList";
import TodayIcon from "@mui/icons-material/Today";
import HistoryIcon from "@mui/icons-material/History";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DateRangeIcon from "@mui/icons-material/DateRange";
import EventIcon from "@mui/icons-material/Event";


const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24, 
  p: 4,
};

const filterOptions = [
   { value: "none", label: "SELECT FILTER", icon: <FilterListIcon  fontSize="small" sx={{ mr: 1 }} />, disabled: true },
  { value: "overallTotal", label: "ALL DATA", icon: <ViewListIcon sx={{ mr: 1 }} /> },
  { value: "currentDay", label: "CURRENT DAY", icon: <TodayIcon sx={{ mr: 1 }} /> },
  { value: "last7", label: "LAST 7 DAYS", icon: <HistoryIcon sx={{ mr: 1 }} /> },
  { value: "currentMonth", label: "CURRENT MONTH", icon: <CalendarMonthIcon sx={{ mr: 1 }} /> },
  { value: "selectedMonth", label: "SELECTED MONTH", icon: <DateRangeIcon sx={{ mr: 1 }} /> },
  { value: "yearly", label: "SELECT YEAR", icon: <TodayIcon    sx={{ mr: 1 }} /> }, // Added
  { value: "custom", label: "SELECT DATE", icon: <EventIcon sx={{ mr: 1 }} /> },
];

const RejectionAnalytics = ({
  timeSeriesData, // Default last 7 days
  getCurrentDayDataRejection,
  getOverallTotalRejectionData,
  getRejectionCurrentMonthData,
  getRejectionMonthData,
  filterRejectionData,
  getRejectionYearlyData, // New prop
}) => {
  const [filter, setFilter] = useState("last7"); // Active filter
  const [dropdownValue, setDropdownValue] = useState("none"); // Controls the Select display
  const [chartData, setChartData] = useState([]);
  const [chartTitleSuffix, setChartTitleSuffix] = useState(""); // For specific parts of title like "Jan 2023"

  // Modal states for Selected Month
  const [openMonthModal, setOpenMonthModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYearForMonth, setSelectedYearForMonth] = useState(new Date().getFullYear()); // Renamed to avoid clash
  const [tempSelectedMonth, setTempSelectedMonth] = useState(selectedMonth);
  const [tempSelectedYearForMonth, setTempSelectedYearForMonth] = useState(selectedYearForMonth);

  // Modal states for Yearly
  const [openYearModal, setOpenYearModal] = useState(false);
  const [selectedYearly, setSelectedYearly] = useState(null);
  const [tempYear, setTempYear] = useState(new Date().getFullYear());

  // Modal states for Custom Date Range
  const [openCustomModal, setOpenCustomModal] = useState(false);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);
  const [tempCustomFrom, setTempCustomFrom] = useState(null);
  const [tempCustomTo, setTempCustomTo] = useState(null);
  const [isDateError, setIsDateError] = useState(false);

  useEffect(() => {
    if (tempCustomFrom && tempCustomTo) {
      setIsDateError(new Date(tempCustomFrom) > new Date(tempCustomTo));
    } else {
      setIsDateError(false);
    }
  }, [tempCustomFrom, tempCustomTo]);

  // Update chart data based on the active filter
  useEffect(() => {
    let data;
    let suffix = "";
    switch (filter) {
      case "last7":
        data = timeSeriesData; // This is already processed for last 7 days by the hook
        break;
      case "currentDay":
        data = getCurrentDayDataRejection();
        break;
      case "currentMonth":
        data = getRejectionCurrentMonthData();
        break;
      case "overallTotal":
        data = [getOverallTotalRejectionData()]; // Wrap in array for BarChart
        break;
      case "selectedMonth":
        // This case is handled by handleApplySelectedMonth directly setting chartData
        // but if selectedMonth/selectedYearForMonth changes, this could re-trigger
        if (selectedMonth && selectedYearForMonth) {
            data = getRejectionMonthData(selectedMonth, selectedYearForMonth);
            suffix = `${new Date(selectedYearForMonth, selectedMonth - 1).toLocaleString("default", { month: "long" })} ${selectedYearForMonth}`;
        } else {
            data = timeSeriesData; // Fallback
        }
        break;
      case "yearly":
        if (selectedYearly) {
            data = getRejectionYearlyData(selectedYearly);
            suffix = String(selectedYearly);
        } else {
            data = timeSeriesData; // Fallback
        }
        break;
      case "custom":
        if (customFrom && customTo) {
            const fromString = getDateString(new Date(customFrom));
            const toString = getDateString(new Date(customTo));
            data = filterRejectionData(fromString, toString);
            suffix = `${new Date(customFrom).toLocaleDateString()} - ${new Date(customTo).toLocaleDateString()}`;
        } else {
            data = timeSeriesData; // Fallback
        }
        break;
      default:
        data = timeSeriesData; // Default to last7
        break;
    }
    setChartData(data || []); // Ensure data is always an array
    setChartTitleSuffix(suffix);
  }, [
    filter,
    timeSeriesData,
    getCurrentDayDataRejection,
    getOverallTotalRejectionData,
    getRejectionCurrentMonthData,
    getRejectionMonthData, // For selectedMonth case
    getRejectionYearlyData, // For yearly case
    filterRejectionData, // For custom case
    selectedMonth, selectedYearForMonth, // Dependencies for selectedMonth
    selectedYearly, // Dependency for yearly
    customFrom, customTo // Dependencies for custom
  ]);

  const handleFilterChange = (event) => {
    const selectedValue = event.target.value;
    setDropdownValue(selectedValue); 

    if (selectedValue === "selectedMonth") {
      setTempSelectedMonth(selectedMonth || new Date().getMonth() + 1);
      setTempSelectedYearForMonth(selectedYearForMonth || new Date().getFullYear());
      setOpenMonthModal(true);
    } else if (selectedValue === "yearly") {
      setTempYear(selectedYearly || new Date().getFullYear());
      setOpenYearModal(true);
    } else if (selectedValue === "custom") {
      setTempCustomFrom(customFrom);
      setTempCustomTo(customTo);
      setOpenCustomModal(true);
    } else {
      setFilter(selectedValue);
      // Reset other specific filter states
      setSelectedMonth(null);
      setSelectedYearForMonth(null);
      setSelectedYearly(null);
      setCustomFrom(null);
      setCustomTo(null);
      setDropdownValue("none"); // Reset select to placeholder for direct filters
    }
  };

  const handleModalClose = () => {
    setOpenMonthModal(false);
    setOpenYearModal(false);
    setOpenCustomModal(false);
    setDropdownValue("none"); // Reset dropdown if modal is cancelled
  };

  const handleApplySelectedMonth = () => {
    setSelectedMonth(tempSelectedMonth);
    setSelectedYearForMonth(tempSelectedYearForMonth);
    setFilter("selectedMonth");
    // Reset others
    setSelectedYearly(null);
    setCustomFrom(null);
    setCustomTo(null);
    setOpenMonthModal(false);
    setDropdownValue("none");
  };
  
  const handleApplyYearlyFilter = () => {
    setSelectedYearly(tempYear);
    setFilter("yearly");
    // Reset others
    setSelectedMonth(null);
    setSelectedYearForMonth(null);
    setCustomFrom(null);
    setCustomTo(null);
    setOpenYearModal(false);
    setDropdownValue("none");
  };

  const handleApplyCustomDates = () => {
    if (tempCustomFrom && tempCustomTo && !isDateError) {
      setCustomFrom(new Date(tempCustomFrom));
      setCustomTo(new Date(tempCustomTo));
      setFilter("custom");
      // Reset others
      setSelectedMonth(null);
      setSelectedYearForMonth(null);
      setSelectedYearly(null);
      setOpenCustomModal(false);
      setDropdownValue("none");
    }
  };

  const getFullChartTitle = () => {
    let baseTitle = "Rejection History";
    switch (filter) {
      case "currentDay": 
        return `${baseTitle} (Current Day: ${new Date().toLocaleDateString()})`;
      case "last7": 
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 6);
        return `${baseTitle} (Last 7 Days: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()})`;
      case "currentMonth":
        return `${baseTitle} (Current Month: ${new Date().toLocaleString("default", { month: "long", year: "numeric" })})`;
      case "selectedMonth":
        return `${baseTitle} (Month: ${chartTitleSuffix})`;
      case "yearly":
        return `${baseTitle} (Year: ${chartTitleSuffix})`;
      case "custom":
        return `${baseTitle} (Custom: ${chartTitleSuffix})`;
      case "overallTotal":
        return `Overall Rejection Totals (As of: ${new Date().toLocaleDateString()})`;
      default:
        return baseTitle;
    }
  };
  
  // Sync temp modal states with actual selected values if they change externally
  // or to reset them when a different filter type makes them irrelevant.
  useEffect(() => {
    setTempSelectedMonth(selectedMonth || new Date().getMonth() + 1);
    setTempSelectedYearForMonth(selectedYearForMonth || new Date().getFullYear());
  }, [selectedMonth, selectedYearForMonth]);

  useEffect(() => {
    setTempYear(selectedYearly || new Date().getFullYear());
  }, [selectedYearly]);
  
  useEffect(() => {
    setTempCustomFrom(customFrom); // Will be null if not active
    setTempCustomTo(customTo);     // Will be null if not active
  }, [customFrom, customTo]);


  return (
    <Paper
      elevation={3}
      sx={{
        p: { xs: 2, md: 3 },
        mb: 4,
        backgroundColor: "#FFF",
        boxShadow: "0px 4px 10px rgba(0,0,0,0.35)",
        borderRadius: "15px",
      }}
    >
      <Box
        display="flex"
        flexDirection={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems="center"
        mb={5}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            fontSize: "clamp(1.2rem, 1.7vw, 2rem)",
            color: "#000",
          }}
        >
          Rejection Analytics
        </Typography>
        <FormControl
          variant="outlined"
          size="small"
          sx={{ minWidth: 180, borderRadius: "4px" }} // Increased minWidth slightly
        >
          <InputLabel id="rejection-filter-label">Filter Rejections</InputLabel>
          <Select
            labelId="rejection-filter-label"
            value={dropdownValue}
            label="Filter Rejections"
            onChange={handleFilterChange}
          >
             {filterOptions.map((option) => (
              <MenuItem key={option.value} value={option.value} disabled={option.disabled}>
                {option.icon}
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Typography  variant="h6" sx={{ fontSize: "clamp(0.875rem, 1.2rem, 1.5rem)", color: "#000",   mb: 2 }} gutterBottom  >
        {getFullChartTitle()}
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Box
            sx={{
              height: { xs: 300, md: 400 }, // Adjusted height
              width: "100%",
              backgroundColor: "#FFF",
              borderRadius: "8px", // Adjusted
            }}
          >
            {chartData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
                <XAxis  dataKey="date" stroke="#000" tick={{ fill: '#000', fontSize: 12 }}/>
                <YAxis stroke="#000" tick={{ fill: '#000', fontSize: 12 }}  />
                <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #ccc', color: '#000' }}
                    labelStyle={{ color: '#06402B', fontWeight: 'bold' }}
                />
                <Legend
                    wrapperStyle={{ color: '#000', paddingTop: '10px' }}
                    formatter={(value) => <span style={{ color: '#000' }}>{value}</span>}
                />
                  <Bar dataKey="diseased" fill="#FFD700" name="Diseased" />
                  <Bar dataKey="physically_damaged" fill="#FF6B6B" name="Physically Damaged" />
                  <Bar dataKey="too_small" fill="#00E676" name="Too Small" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Typography sx={{ textAlign: 'center', pt: 5 }}>No data available for the selected period.</Typography>
            )}
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          {/* Summary unchanged */}
          <Paper
            elevation={2}
            sx={{
              p: { xs: 1, md: 2 },
              backgroundColor: "#06402B",
              borderRadius: "10px",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography
              variant="h5"
              textAlign="center"
              sx={{ color: "white", mb: 3, fontWeight: "bold", fontSize: { xs: "1.2rem", md: "1.5rem" } }}
            >
              Summary
            </Typography>
            <Grid container spacing={2} sx={{ flex: 1, "& .MuiGrid-item": { height: "45%" } }}>
              <Grid item xs={6}>
                <Box
                  sx={{
                    height: "100%",
                    backgroundColor: "#fff",
                    borderRadius: 2,
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      sx={{ fontSize: { xs: "1.5rem", md: "2rem" } }}
                    >
                      {chartData.reduce((sum, item) => sum + (item.diseased || 0), 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Diseased
                    </Typography>
                  </Box>
                  <SickIcon color="success" sx={{ fontSize: { xs: 30, sm: 40, md: 48 } }} />
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box
                  sx={{
                    height: "100%",
                    backgroundColor: "#fff",
                    borderRadius: 2,
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      sx={{ fontSize: { xs: "1.5rem", md: "2rem" } }}
                    >
                      {chartData.reduce((sum, item) => sum + (item.physically_damaged || 0), 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Physically Damaged
                    </Typography>
                  </Box>
                  <BrokenImageIcon color="success" sx={{ fontSize: { xs: 30, sm: 40, md: 48 } }} />
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box
                  sx={{
                    height: "100%",
                    backgroundColor: "#fff",
                    borderRadius: 2,
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      sx={{ fontSize: { xs: "1.5rem", md: "2rem" } }}
                    >
                      {chartData.reduce((sum, item) => sum + (item.too_small || 0), 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Size
                    </Typography>
                  </Box>
                  <ZoomOutMapIcon color="success" sx={{ fontSize: { xs: 30, sm: 40, md: 48 } }} />
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box
                  sx={{
                    height: "100%",
                    backgroundColor: "#fff",
                    borderRadius: 2,
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      sx={{ fontSize: { xs: "1.5rem", md: "2rem" } }}
                    >
                      {chartData.reduce(
                        (sum, item) =>
                          sum +
                          ((item.diseased || 0) +
                            (item.physically_damaged || 0) +
                            (item.too_small || 0)),
                        0
                      )}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Rejections
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ color: "#000", fontSize: { xs: "1.5rem", md: "2rem" } }}>
                    
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Month Modal */}
      <Modal open={openMonthModal} onClose={handleModalClose} aria-labelledby="rejection-month-modal">
        <Box sx={modalStyle}>
          <Typography variant="h6" sx={{ mb: 2 }}> Select Month and Year </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="rejection-month-label">Month</InputLabel>
            <Select
              labelId="rejection-month-label"
              value={tempSelectedMonth}
              label="Month"
              onChange={(e) => setTempSelectedMonth(e.target.value)}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <MenuItem key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("default", { month: "long" })}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="rejection-year-month-label">Year</InputLabel>
            <Select
              labelId="rejection-year-month-label"
              value={tempSelectedYearForMonth}
              label="Year"
              onChange={(e) => setTempSelectedYearForMonth(e.target.value)}
            >
              {Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i).map((yearVal) => (
                <MenuItem key={yearVal} value={yearVal}>{yearVal}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button onClick={handleModalClose} variant="outlined" color="secondary"> CANCEL </Button>
            <Button onClick={handleApplySelectedMonth} variant="contained" color="primary"> APPLY </Button>
          </Box>
        </Box>
      </Modal>

      {/* Year Modal (New) */}
      <Modal open={openYearModal} onClose={handleModalClose} aria-labelledby="rejection-yearly-modal">
          <Box sx={modalStyle}>
            <Typography variant="h6" sx={{ mb: 2 }}>Select Year</Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="rejection-yearly-select-label">Year</InputLabel>
              <Select
                labelId="rejection-yearly-select-label"
                value={tempYear}
                label="Year"
                onChange={(e) => setTempYear(e.target.value)}
              >
                {Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i).map((yearVal) => (
                  <MenuItem key={yearVal} value={yearVal}>{yearVal}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
              <Button onClick={handleModalClose} variant="outlined" color="secondary">CANCEL</Button>
              <Button onClick={handleApplyYearlyFilter} variant="contained" color="primary">APPLY</Button>
            </Box>
          </Box>
        </Modal>

      {/* Custom Date Modal */}
      <Modal open={openCustomModal} onClose={handleModalClose} aria-labelledby="rejection-custom-date-modal">
        <Box sx={modalStyle}>
          <Typography variant="h6" sx={{ mb: 2 }}> Choose Date Range </Typography>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <DatePicker
                label="FROM"
                value={tempCustomFrom}
                onChange={(newValue) => setTempCustomFrom(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth size="medium" error={isDateError && !!tempCustomFrom && !!tempCustomTo} helperText={isDateError && !!tempCustomFrom && !!tempCustomTo ? "From date cannot be after To date" : ""} />}
              />
              <DatePicker
                label="TO"
                value={tempCustomTo}
                onChange={(newValue) => setTempCustomTo(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth size="medium" />}
              />
            </Box>
          </LocalizationProvider>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button onClick={handleModalClose} variant="outlined" color="secondary"> CANCEL </Button>
            <Button
              onClick={handleApplyCustomDates}
              variant="contained"
              color="primary"
              disabled={isDateError || !tempCustomFrom || !tempCustomTo}
            >
              APPLY
            </Button>
          </Box>
        </Box>
      </Modal>
    </Paper>
  );
};

export default RejectionAnalytics;