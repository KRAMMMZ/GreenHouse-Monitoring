import React, { useState, useEffect, useMemo } from "react";
import {
    Paper,
    Typography,
    FormControl,
    Select,
    MenuItem,
    InputLabel,
    Box,
    Button,
    Modal,
    Divider,
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

// Use same icons from previous SensorReadings example.
import FilterListIcon from "@mui/icons-material/FilterList";
import ViewListIcon from "@mui/icons-material/ViewList";
import TodayIcon from "@mui/icons-material/Today";
import HistoryIcon from "@mui/icons-material/History";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DateRangeIcon from "@mui/icons-material/DateRange";
import EventIcon from "@mui/icons-material/Event";

// Import the filtering hooks
import { useFilteredSales } from "../hooks/SalesHooks";
import { useFilteredInventoryItems } from "../hooks/InventoryItemsHooks";
import { useItemInventory } from "../hooks/ItemInventoryHooks";

// Modal styling
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

// Filter options with icons (same as previous)
const filterOptions = [
    { value: "none", label: "SELECT FILTER", icon: <FilterListIcon fontSize="small" sx={{ mr: 1 }} />, disabled: true },
    { value: "all", label: "ALL DATA", icon: <ViewListIcon fontSize="small" sx={{ mr: 1 }} /> },
    { value: "currentDay", label: "CURRENT DAY", icon: <TodayIcon fontSize="small" sx={{ mr: 1 }} /> },
    { value: "last7Days", label: "LAST 7 DAYS", icon: <HistoryIcon fontSize="small" sx={{ mr: 1 }} /> },
    { value: "currentMonth", label: "CURRENT MONTH", icon: <CalendarMonthIcon fontSize="small" sx={{ mr: 1 }} /> },
    { value: "selectMonth", label: "SELECT MONTH", icon: <DateRangeIcon fontSize="small" sx={{ mr: 1 }} /> },
    { value: "yearly", label: "SELECT YEAR", icon: <TodayIcon fontSize="small" sx={{ mr: 1 }} /> },
    { value: "custom", label: "SELECT CUSTOM DATE", icon: <EventIcon fontSize="small" sx={{ mr: 1 }} /> },
];

// Function to merge revenue and expenses data by date
const mergeRevenueExpensesData = (sales, inventoryItems, itemInventory) => {
    const dataMap = {};

    // Helper function to format date to YYYY-MM-DD
    const formatDate = (date) => {
        if (!date) return null;
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Add sales data
    sales.forEach((sale) => {
        if (!sale.salesDate) return;
        const date = formatDate(sale.salesDate);
        if (!dataMap[date]) {
            dataMap[date] = { date, revenue: 0, expenses: 0 };
        }
        dataMap[date].revenue += parseFloat(sale.total_price || 0);
    });

    // Add inventory expenses (nutrient and item)
    inventoryItems.forEach((item) => {
        if (!item.date_received) return;
        const date = formatDate(item.date_received);
        if (!dataMap[date]) {
            dataMap[date] = { date, revenue: 0, expenses: 0 };
        }
        dataMap[date].expenses += parseFloat(item.total_price || 0);
    });

    itemInventory.forEach((item) => {
        if (!item.date_received) return;
        const date = formatDate(item.date_received);
        if (!dataMap[date]) {
            dataMap[date] = { date, revenue: 0, expenses: 0 };
        }
        dataMap[date].expenses += parseFloat(item.total_price || 0);
    });

    // Convert map to array
    return Object.values(dataMap).sort((a, b) => new Date(a.date) - new Date(b.date));
};

const RevenueExpensesChart = () => {
    // Local filter state (default "last7Days")
    const [filter, setFilter] = useState("all");
    const [dropdownValue, setDropdownValue] = useState("none");

    // Modal states for "selectMonth", "yearly", and "custom" filters
    const [openMonthModal, setOpenMonthModal] = useState(false);
    const [openYearModal, setOpenYearModal] = useState(false);
    const [openCustomModal, setOpenCustomModal] = useState(false);

    // State for "selectMonth" filter parameters
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [tempSelectedMonth, setTempSelectedMonth] = useState(selectedMonth);
    const [tempSelectedYear, setTempSelectedYear] = useState(selectedYear);

    // State for yearly filter (temporary)
    const [tempYear, setTempYear] = useState(new Date().getFullYear());
    const [selectedYearly, setSelectedYearly] = useState(new Date().getFullYear());

    // State for custom date range
    const [customFrom, setCustomFrom] = useState(null);
    const [customTo, setCustomTo] = useState(null);
    const [isDateError, setIsDateError] = useState(false);

    // Validate custom date range
    useEffect(() => {
        if (customFrom && customTo) {
            setIsDateError(new Date(customFrom) > new Date(customTo));
        }
    }, [customFrom, customTo]);

    // Get filtered data from hooks
    const { filteredSales, loading: salesLoading } = useFilteredSales({
        filterOption: filter,
        customFrom,
        customTo,
        selectedMonth: filter === "selectMonth" ? selectedMonth : null,
        selectedYear: (filter === "selectMonth") ? selectedYear : null,
        selectedYearly: (filter === "yearly") ? selectedYearly : null,
    });

    const { filteredInventoryItems, loading: inventoryLoading } = useFilteredInventoryItems({
        filterOption: filter,
        customFrom,
        customTo,
        selectedMonth: filter === "selectMonth" ? selectedMonth : null,
        selectedYear: (filter === "selectMonth") ? selectedYear : null,
        selectedYearly: (filter === "yearly") ? selectedYearly : null,
    });

    const { itemInventory, itemInventoryLoading } = useItemInventory({
        filterOption: filter,
        customFrom,
        customTo,
        selectedMonth: filter === "selectMonth" ? selectedMonth : null,
        selectedYear: (filter === "selectMonth") ? selectedYear : null,
        selectedYearly: (filter === "yearly") ? selectedYearly : null,
    });

    // Combine loading states
    const loading = salesLoading || inventoryLoading || itemInventoryLoading;

    // Merge revenue and expenses into chart data
    const chartData = useMemo(() => {
        return mergeRevenueExpensesData(filteredSales, filteredInventoryItems, itemInventory);
    }, [filteredSales, filteredInventoryItems, itemInventory]);

    const [chartTitle, setChartTitle] = useState("");

    // Update default chart title for non-modal filters.
    useEffect(() => {
        if (!loading) {
            if (filter === "all") {
                setChartTitle("Revenue vs Expenses (All Data)");
            } else if (filter === "currentDay") {
                setChartTitle(`Revenue vs Expenses (Current Day: ${new Date().toLocaleDateString()})`);
            } else if (filter === "last7Days") {
                const endDate = new Date();
                const startDate = new Date();
                startDate.setDate(endDate.getDate() - 6);
                setChartTitle(
                    `Revenue vs Expenses (Last 7 Days: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()})`
                );
            } else if (filter === "currentMonth") {
                setChartTitle(`Revenue vs Expenses (Current Month: ${new Date().toLocaleString("default", {
                    month: "long",
                    year: "numeric",
                })})`);
            } else if (filter === "yearly") {
                setChartTitle(`Revenue vs Expenses (Yearly: ${selectedYearly})`);
            }
            // For "selectMonth", "yearly", and "custom", title is set via modal apply.
        }
    }, [filter, loading, selectedYearly]);

    // Handle dropdown selection changes.
    const handleFilterChange = (event) => {
        const selected = event.target.value;
        if (selected === "selectMonth") {
            setTempSelectedMonth(selectedMonth);
            setTempSelectedYear(selectedYear);
            setOpenMonthModal(true);
        } else if (selected === "yearly") {
            setTempYear(selectedYearly);
            setOpenYearModal(true);
        } else if (selected === "custom") {
            setOpenCustomModal(true);
        } else {
            setFilter(selected);
        }
        // Reset dropdown so that the same option can be re-selected.
        setDropdownValue("none");
    };

    // Apply the "Select Month" filter.
    const handleApplySelectedMonth = () => {
        setSelectedMonth(tempSelectedMonth);
        setSelectedYear(tempSelectedYear);
        setFilter("selectMonth");
        setChartTitle(`Revenue vs Expenses (Selected Month: ${new Date(tempSelectedYear, tempSelectedMonth - 1).toLocaleString("default", { month: "long" })} ${tempSelectedYear})`);
        setOpenMonthModal(false);
    };

    // Apply the "Yearly" filter.
    const handleApplyYearlyFilter = () => {
        setSelectedYearly(tempYear);
        setFilter("yearly");
        setChartTitle(`Revenue vs Expenses (Yearly: ${tempYear})`);
        setOpenYearModal(false);
    };

    // Apply the "Custom Date" filter.
    const handleApplyCustomDates = () => {
        if (customFrom && customTo && !isDateError) {
            const fromDate = new Date(customFrom);
            const toDate = new Date(customTo);
            fromDate.setHours(0, 0, 0, 0);
            toDate.setHours(23, 59, 59, 999);
            setChartTitle(`Revenue vs Expenses (Custom: ${fromDate.toLocaleDateString()} - ${toDate.toLocaleDateString()})`);
            setFilter("custom");
            setOpenCustomModal(false);
        }
    };

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
        {/* Header with Title and Filter Dropdown */}
        <Box
          display="flex"
          flexDirection={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography
            variant="h4"
            sx={{
              color: "#000",
              fontWeight: "bold",
              fontSize: "clamp(1.2rem, 1.7vw, 2rem)",
            }}
          >
            Revenue vs Expenses
          </Typography>
          <FormControl
            variant="outlined"
            size="small"
            sx={{
              minWidth: 150,
              // give the control the same green, or switch to white for contrast:

              borderRadius: "4px",
            }}
          >
            <InputLabel id="sensor-filter-label">Filter</InputLabel>
            <Select
              labelId="sensor-filter-label"
              value={dropdownValue}
              label="Filter"
              onChange={handleFilterChange}
            >
              {filterOptions.map((option) => (
                <MenuItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.icon}
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Typography
          variant="h6"
          gutterBottom
          sx={{ fontSize: "clamp(0.875rem, 1.7vw, 2rem)", color: "#000" }}
        >
          {chartTitle}
        </Typography>

        {/* Bar Chart displaying Revenue and Expenses */}
        <Box
          sx={{
            height: { xs: 250, md: 400 },
            width: "100%",
            backgroundColor: "#FFF",
            borderRadius: "20px",
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid stroke="#666" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#000" tick={{ fill: "#000" }} />
              <YAxis stroke="#000" tick={{ fill: "#000" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#06402B",
                  border: "1px solid #000",
                }}
                labelStyle={{ color: "#fff" }}
              />
              <Legend
                wrapperStyle={{ color: "#000" }}
                formatter={(value) => (
                  <span style={{ color: "#000" }}>{value}</span>
                )}
              />
              <Bar dataKey="revenue" fill="#00E676" name="Revenue" />
              <Bar dataKey="expenses" fill="#FF6B6B" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        {/* Modal for "Select Month" filter */}
        <Modal open={openMonthModal} onClose={() => setOpenMonthModal(false)}>
          <Box sx={modalStyle}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Select Month and Year
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="sensor-month-label">Month</InputLabel>
              <Select
                labelId="sensor-month-label"
                value={tempSelectedMonth}
                label="Month"
                onChange={(e) => setTempSelectedMonth(e.target.value)}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <MenuItem key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString("default", {
                      month: "long",
                    })}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="sensor-year-label">Year</InputLabel>
              <Select
                labelId="sensor-year-label"
                value={tempSelectedYear}
                label="Year"
                onChange={(e) => setTempSelectedYear(e.target.value)}
              >
                {Array.from({ length: 11 }, (_, i) => 2020 + i).map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Divider sx={{ my: 3 }} />
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
              <Button
                onClick={() => setOpenMonthModal(false)}
                variant="outlined"
                color="secondary"
              >
                CANCEL
              </Button>
              <Button
                onClick={handleApplySelectedMonth}
                variant="contained"
                color="primary"
              >
                APPLY
              </Button>
            </Box>
          </Box>
        </Modal>

        {/* Modal for "Yearly" filter */}
        <Modal open={openYearModal} onClose={() => setOpenYearModal(false)}>
          <Box sx={modalStyle}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Select Year
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="sensor-yearly-label">Year</InputLabel>
              <Select
                labelId="sensor-yearly-label"
                value={tempYear}
                label="Year"
                onChange={(e) => setTempYear(e.target.value)}
              >
                {Array.from({ length: 11 }, (_, i) => 2020 + i).map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Divider sx={{ my: 3 }} />
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
              <Button
                onClick={() => setOpenYearModal(false)}
                variant="outlined"
                color="secondary"
              >
                CANCEL
              </Button>
              <Button
                onClick={handleApplyYearlyFilter}
                variant="contained"
                color="primary"
              >
                APPLY
              </Button>
            </Box>
          </Box>
        </Modal>

        {/* Modal for "Custom Date" filter */}
        <Modal open={openCustomModal} onClose={() => setOpenCustomModal(false)}>
          <Box sx={modalStyle}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Choose Date Range
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <DatePicker
                  label="FROM"
                  value={customFrom}
                  onChange={(newValue) => setCustomFrom(newValue)}
                  renderInput={(params) => (
                    <Box component="div">
                      <input
                        {...params.inputProps}
                        style={{
                          width: "100%",
                          padding: "8px",
                          marginTop: "4px",
                        }}
                      />
                    </Box>
                  )}
                />
                <DatePicker
                  label="TO"
                  value={customTo}
                  onChange={(newValue) => setCustomTo(newValue)}
                  renderInput={(params) => (
                    <Box component="div">
                      <input
                        {...params.inputProps}
                        style={{
                          width: "100%",
                          padding: "8px",
                          marginTop: "4px",
                        }}
                      />
                    </Box>
                  )}
                />
              </Box>
            </LocalizationProvider>
            <Divider sx={{ my: 3 }} />
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
              <Button
                onClick={() => setOpenCustomModal(false)}
                variant="outlined"
                color="secondary"
              >
                CANCEL
              </Button>
              <Button
                onClick={handleApplyCustomDates}
                variant="contained"
                color="primary"
                disabled={isDateError || !customFrom || !customTo}
              >
                APPLY
              </Button>
            </Box>
          </Box>
        </Modal>
      </Paper>
    );
};

export default RevenueExpensesChart;