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
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import SickIcon from "@mui/icons-material/Sick";
import BrokenImageIcon from "@mui/icons-material/BrokenImage";
import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMap";

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

const RejectionAnalytics = ({
  timeSeriesData,
  getCurrentDayDataRejection,
  getOverallTotalRejectionData,
  getRejectionCurrentMonthData,
  getRejectionMonthData,
  filterRejectionData,
}) => {
  const [filter, setFilter] = useState("last7");
  const [dropdownValue, setDropdownValue] = useState("none");

  const [chartData, setChartData] = useState([]);
  const [chartTitle, setChartTitle] = useState("");

  // States for Selected Month modal
  const [openMonthModal, setOpenMonthModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // States for Custom Date Range modal
  const [openCustomModal, setOpenCustomModal] = useState(false);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);
  const [isDateError, setIsDateError] = useState(false);

  useEffect(() => {
    if (customFrom && customTo) {
      setIsDateError(new Date(customFrom) > new Date(customTo));
    }
  }, [customFrom, customTo]);

  useEffect(() => {
    switch (filter) {
      case "last7":
        setChartData(timeSeriesData);
        break;
      case "currentDay":
        setChartData(getCurrentDayDataRejection());
        break;
      case "currentMonth":
        setChartData(getRejectionCurrentMonthData());
        break;
      case "overallTotal":
        setChartData([getOverallTotalRejectionData()]);
        break;
      default:
        break;
    }
  }, [filter, timeSeriesData, getCurrentDayDataRejection, getOverallTotalRejectionData, getRejectionCurrentMonthData]);

  const handleFilterChange = (event) => {
    const selected = event.target.value;
    if (selected === "selectedMonth") {
      setOpenMonthModal(true);
    } else if (selected === "custom") {
      setOpenCustomModal(true);
    } else {
      setFilter(selected);
    }
    setDropdownValue("none");
  };

  const handleApplySelectedMonth = () => {
    const data = getRejectionMonthData(selectedMonth, selectedYear);
    setChartData(data);
    const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString("default", { month: "long" });
    setChartTitle(`Rejection Data for ${monthName} ${selectedYear}`);
    setOpenMonthModal(false);
    setFilter("selectedMonth");
  };

  const handleApplyCustomDates = () => {
    if (customFrom && customTo && !isDateError) {
      const from = new Date(customFrom).toISOString().split("T")[0];
      const to = new Date(customTo).toISOString().split("T")[0];
      const data = filterRejectionData(from, to);
      setChartData(data);
      setChartTitle(
        `Rejection Data from ${new Date(customFrom).toLocaleDateString()} to ${new Date(customTo).toLocaleDateString()}`
      );
      setOpenCustomModal(false);
      setFilter("custom");
    }
  };

  const getChartTitle = () => {
    const titles = {
      currentDay: "Rejection History (Current Day)",
      last7: "Rejection History (Last 7 Days)",
      currentMonth: "Rejection History (Current Month)",
      selectedMonth: chartTitle,
      custom: chartTitle,
      overallTotal: "Overall Rejection Totals",
    };
    return titles[filter];
  };

  return (
    <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, mb: 4, backgroundColor: "#FDFCFB", boxShadow: "0px 4px 10px rgba(0,0,0,0.3)", borderRadius: "15px" }}>
      <Box display="flex" flexDirection={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems="center" mb={5}>
        <Typography variant="h4" sx={{ fontWeight: "bold", fontSize: "clamp(0.875rem, 1.7vw, 2rem)" }}>
          Rejection Analytics
        </Typography>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 150, mt: { xs: 2, md: 0 } }}>
          <InputLabel id="rejection-filter-label">Filter Rejections</InputLabel>
          <Select labelId="rejection-filter-label" value={dropdownValue} label="Filter Rejections" onChange={handleFilterChange}>
            <MenuItem value="none">Select Filter</MenuItem>
            <MenuItem value="currentDay">Current Day</MenuItem>
            <MenuItem value="last7">Last 7 Days</MenuItem>
            <MenuItem value="currentMonth">Current Month</MenuItem>
            <MenuItem value="selectedMonth">Selected Month</MenuItem>
            <MenuItem value="custom">Custom Date Range</MenuItem>
            <MenuItem value="overallTotal">Overall Total</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Typography variant="h6" gutterBottom>{getChartTitle()}</Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Box sx={{ height: { xs: 250, md: 300 }, width: "100%", backgroundColor: "#FDFCFB", borderRadius: "20px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="diseased" fill="#ff6b35" name="Diseased" />
                <Bar dataKey="physically_damaged" fill="#1d3557" name="Physically Damaged" />
                <Bar dataKey="too_small" fill="#4169E1" name="Too Small" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: { xs: 1, md: 2 }, backgroundColor: "#06402B", borderRadius: "10px", height: "100%", display: "flex", flexDirection: "column" }}>
            <Typography variant="h5" textAlign="center" sx={{ color: "white", mb: 3, fontWeight: "bold", fontSize: { xs: "1.2rem", md: "1.5rem" } }}>
              Summary
            </Typography>
            <Grid container spacing={2} sx={{ flex: 1, "& .MuiGrid-item": { height: "45%" } }}>
              <Grid item xs={6}>
                <Box sx={{ height: "100%", backgroundColor: "#fff", borderRadius: 2, p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: "1.5rem", md: "2rem" } }}>
                      {chartData.reduce((sum, item) => sum + (item.diseased || 0), 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Diseased</Typography>
                  </Box>
                  <SickIcon color="success" sx={{ fontSize: { xs: 30, sm: 40, md: 48 } }} />
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ height: "100%", backgroundColor: "#fff", borderRadius: 2, p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: "1.5rem", md: "2rem" } }}>
                      {chartData.reduce((sum, item) => sum + (item.physically_damaged || 0), 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Physically Damaged</Typography>
                  </Box>
                  <BrokenImageIcon color="success" sx={{ fontSize: { xs: 30, sm: 40, md: 48 } }} />
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ height: "100%", backgroundColor: "#fff", borderRadius: 2, p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: "1.5rem", md: "2rem" } }}>
                      {chartData.reduce((sum, item) => sum + (item.too_small || 0), 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Too Small</Typography>
                  </Box>
                  <ZoomOutMapIcon color="success" sx={{ fontSize: { xs: 30, sm: 40, md: 48 } }} />
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ height: "100%", backgroundColor: "#fff", borderRadius: 2, p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: "1.5rem", md: "2rem" } }}>
                      {chartData.reduce((sum, item) => sum + ((item.diseased || 0) + (item.physically_damaged || 0) + (item.too_small || 0)), 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Total Rejections</Typography>
                  </Box>
                  <Typography variant="h4" sx={{ color: "#000", fontSize: { xs: "1.5rem", md: "2rem" } }}>
                    &#x1F4C8;
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Modal open={openMonthModal} onClose={() => setOpenMonthModal(false)} aria-labelledby="rejection-month-modal">
        <Box sx={modalStyle}>
          <Typography variant="h6" sx={{ mb: 2 }}>Select Month and Year</Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="rejection-month-label">Month</InputLabel>
            <Select labelId="rejection-month-label" value={selectedMonth} label="Month" onChange={(e) => setSelectedMonth(e.target.value)}>
              {Array.from({ length: 12 }, (_, i) => (
                <MenuItem key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("default", { month: "long" })}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="rejection-year-label">Year</InputLabel>
            <Select labelId="rejection-year-label" value={selectedYear} label="Year" onChange={(e) => setSelectedYear(e.target.value)}>
              {Array.from({ length: 11 }, (_, i) => 2020 + i).map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Divider sx={{ my: 3 }} />
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button onClick={() => setOpenMonthModal(false)} variant="outlined" color="secondary">
              CANCEL
            </Button>
            <Button onClick={handleApplySelectedMonth} variant="contained" color="primary">
              APPLY
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal open={openCustomModal} onClose={() => setOpenCustomModal(false)} aria-labelledby="rejection-custom-date-modal">
        <Box sx={modalStyle}>
          <Typography variant="h6" sx={{ mb: 2 }}>Choose Date Range</Typography>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <DatePicker
                label="FROM"
                value={customFrom}
                onChange={(newValue) => setCustomFrom(newValue)}
                slotProps={{ textField: { fullWidth: true, size: "medium" } }}
              />
              <DatePicker
                label="TO"
                value={customTo}
                onChange={(newValue) => setCustomTo(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "medium",
                    error: isDateError,
                    helperText: isDateError ? "From date cannot be later than To date" : "",
                  },
                }}
              />
            </Box>
          </LocalizationProvider>
          <Divider sx={{ my: 3 }} />
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button onClick={() => setOpenCustomModal(false)} variant="outlined" color="secondary">
              CANCEL
            </Button>
            <Button onClick={handleApplyCustomDates} variant="contained" color="primary" disabled={isDateError || !customFrom || !customTo}>
              APPLY
            </Button>
          </Box>
        </Box>
      </Modal>
    </Paper>
  );
};

export default RejectionAnalytics;
