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
    TextField, // Import TextField for DatePicker
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

import FilterListIcon from "@mui/icons-material/FilterList";
import ViewListIcon from "@mui/icons-material/ViewList";
import TodayIcon from "@mui/icons-material/Today";
import HistoryIcon from "@mui/icons-material/History";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DateRangeIcon from "@mui/icons-material/DateRange";
import EventIcon from "@mui/icons-material/Event";

import { useFilteredSales } from "../hooks/SalesHooks";
import { useFilteredInventoryItems } from "../hooks/InventoryItemsHooks";
import { useItemInventory } from "../hooks/ItemInventoryHooks";

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
    { value: "none", label: "SELECT FILTER", icon: <FilterListIcon fontSize="small"  sx={{ mr: 1 }} />, disabled: true },
    { value: "all", label: "ALL DATA", icon: <ViewListIcon  sx={{ mr: 1 }} /> },
    { value: "currentDay", label: "CURRENT DAY", icon: <TodayIcon   sx={{ mr: 1 }} /> },
    { value: "last7Days", label: "LAST 7 DAYS", icon: <HistoryIcon   sx={{ mr: 1 }} /> },
    { value: "currentMonth", label: "CURRENT MONTH", icon: <CalendarMonthIcon  sx={{ mr: 1 }} /> },
    { value: "selectMonth", label: "SELECT MONTH", icon: <DateRangeIcon   sx={{ mr: 1 }} /> },
    { value: "yearly", label: "SELECT YEAR", icon: <TodayIcon    sx={{ mr: 1 }} /> },
    { value: "custom", label: "SELECT DATE", icon: <EventIcon   sx={{ mr: 1 }} /> },
];

// Function to merge revenue and expenses data by date
const mergeRevenueExpensesData = (sales, inventoryItems, itemInventory) => {
    const dataMap = {};

    const formatDate = (dateInput) => {
        if (!dateInput) return null;
        const d = new Date(dateInput);
        if (isNaN(d.getTime())) return null; // Handle invalid date
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Add sales data
    (sales || []).forEach((sale) => {
        // Use sale.created_at instead of sale.salesDate
        if (!sale.created_at) return;
        const date = formatDate(sale.created_at);
        if (!date) return;

        if (!dataMap[date]) {
            dataMap[date] = { date, revenue: 0, expenses: 0 };
        }
        dataMap[date].revenue += parseFloat(sale.total_price || 0);
    });

    // Add inventory expenses (nutrient and item)
    // Assuming 'date_received' is the correct field for inventory items.
    // If inventory items also use 'created_at', change it here too.
    (inventoryItems || []).forEach((item) => {
        if (!item.date_received) return;
        const date = formatDate(item.date_received);
        if (!date) return;

        if (!dataMap[date]) {
            dataMap[date] = { date, revenue: 0, expenses: 0 };
        }
        dataMap[date].expenses += parseFloat(item.total_price || 0);
    });

    (itemInventory || []).forEach((item) => {
        if (!item.date_received) return;
        const date = formatDate(item.date_received);
        if (!date) return;
        
        if (!dataMap[date]) {
            dataMap[date] = { date, revenue: 0, expenses: 0 };
        }
        dataMap[date].expenses += parseFloat(item.total_price || 0);
    });

    return Object.values(dataMap).sort((a, b) => new Date(a.date) - new Date(b.date));
};

const RevenueExpensesChart = () => {
    const [filter, setFilter] = useState("all");
    const [dropdownValue, setDropdownValue] = useState("none");

    const [openMonthModal, setOpenMonthModal] = useState(false);
    const [openYearModal, setOpenYearModal] = useState(false);
    const [openCustomModal, setOpenCustomModal] = useState(false);

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [tempSelectedMonth, setTempSelectedMonth] = useState(selectedMonth);
    const [tempSelectedYear, setTempSelectedYear] = useState(selectedYear);

    const [tempYear, setTempYear] = useState(new Date().getFullYear());
    const [selectedYearly, setSelectedYearly] = useState(null); // Default to null or a specific year if needed

    const [customFrom, setCustomFrom] = useState(null);
    const [customTo, setCustomTo] = useState(null);
    const [tempCustomFrom, setTempCustomFrom] = useState(null); // Temporary state for modal
    const [tempCustomTo, setTempCustomTo] = useState(null);     // Temporary state for modal
    const [isDateError, setIsDateError] = useState(false);

    useEffect(() => {
        if (tempCustomFrom && tempCustomTo) {
            setIsDateError(new Date(tempCustomFrom) > new Date(tempCustomTo));
        } else {
            setIsDateError(false);
        }
    }, [tempCustomFrom, tempCustomTo]);

    const { filteredSales, loading: salesLoading } = useFilteredSales({
        filterOption: filter,
        customFrom,
        customTo,
        selectedMonth: filter === "selectMonth" ? selectedMonth : null,
        selectedYear: filter === "selectMonth" ? selectedYear : null,
        selectedYearly: filter === "yearly" ? selectedYearly : null,
    });

    const { filteredInventoryItems, loading: inventoryLoading } = useFilteredInventoryItems({
        filterOption: filter,
        customFrom,
        customTo,
        selectedMonth: filter === "selectMonth" ? selectedMonth : null,
        selectedYear: filter === "selectMonth" ? selectedYear : null,
        selectedYearly: filter === "yearly" ? selectedYearly : null,
    });

    const { itemInventory, loading: itemInventoryLoading } = useItemInventory({ // Corrected variable name
        filterOption: filter,
        customFrom,
        customTo,
        selectedMonth: filter === "selectMonth" ? selectedMonth : null,
        selectedYear: filter === "selectMonth" ? selectedYear : null,
        selectedYearly: filter === "yearly" ? selectedYearly : null,
    });

    const loading = salesLoading || inventoryLoading || itemInventoryLoading;

    const chartData = useMemo(() => {
        return mergeRevenueExpensesData(filteredSales, filteredInventoryItems, itemInventory);
    }, [filteredSales, filteredInventoryItems, itemInventory]);

    const [chartTitle, setChartTitle] = useState("Revenue vs Expenses (All Data)"); // Default title

    useEffect(() => {
        if (!loading) {
            let title = "Revenue vs Expenses";
            const today = new Date();
            if (filter === "all") {
                title += " (All Data)";
            } else if (filter === "currentDay") {
                title += ` (Current Day: ${today.toLocaleDateString()})`;
            } else if (filter === "last7Days") {
                const endDate = new Date();
                const startDate = new Date();
                startDate.setDate(endDate.getDate() - 6); // Corrected for 7 distinct days
                title += ` (Last 7 Days: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()})`;
            } else if (filter === "currentMonth") {
                title += ` (Current Month: ${today.toLocaleString("default", {
                    month: "long",
                    year: "numeric",
                })})`;
            } else if (filter === "yearly" && selectedYearly) {
                title += ` (Year: ${selectedYearly})`;
            } else if (filter === "selectMonth" && selectedMonth && selectedYear) {
                title += ` (Month: ${new Date(selectedYear, selectedMonth - 1).toLocaleString("default", { month: "long" })} ${selectedYear})`;
            } else if (filter === "custom" && customFrom && customTo) {
                title += ` (Custom: ${new Date(customFrom).toLocaleDateString()} - ${new Date(customTo).toLocaleDateString()})`;
            }
            setChartTitle(title);
        }
    }, [filter, loading, selectedYearly, selectedMonth, selectedYear, customFrom, customTo]);

    const handleFilterChange = (event) => {
        const selected = event.target.value;
        setDropdownValue(selected); // Keep dropdown showing selected option until modal action

        if (selected === "selectMonth") {
            setTempSelectedMonth(selectedMonth || new Date().getMonth() + 1);
            setTempSelectedYear(selectedYear || new Date().getFullYear());
            setOpenMonthModal(true);
        } else if (selected === "yearly") {
            setTempYear(selectedYearly || new Date().getFullYear());
            setOpenYearModal(true);
        } else if (selected === "custom") {
            setTempCustomFrom(customFrom);
            setTempCustomTo(customTo);
            setOpenCustomModal(true);
        } else {
            setFilter(selected);
            setCustomFrom(null); // Reset custom dates if not custom filter
            setCustomTo(null);
            setSelectedMonth(null); // Reset month/year if not month filter
            setSelectedYear(null);
            setSelectedYearly(null); // Reset year if not yearly filter
            setDropdownValue("none"); // Reset dropdown for non-modal filters after applying
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
        setSelectedYear(tempSelectedYear);
        setFilter("selectMonth");
        setCustomFrom(null);
        setCustomTo(null);
        setSelectedYearly(null);
        setOpenMonthModal(false);
        setDropdownValue("none");
    };

    const handleApplyYearlyFilter = () => {
        setSelectedYearly(tempYear);
        setFilter("yearly");
        setCustomFrom(null);
        setCustomTo(null);
        setSelectedMonth(null);
        setSelectedYear(null);
        setOpenYearModal(false);
        setDropdownValue("none");
    };

    const handleApplyCustomDates = () => {
        if (tempCustomFrom && tempCustomTo && !isDateError) {
            setCustomFrom(new Date(tempCustomFrom)); // Store as Date objects
            setCustomTo(new Date(tempCustomTo));     // Store as Date objects
            setFilter("custom");
            setSelectedMonth(null);
            setSelectedYear(null);
            setSelectedYearly(null);
            setOpenCustomModal(false);
            setDropdownValue("none");
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
            sx={{ minWidth: 150 }} // Increased minWidth for better label visibility
          >
            <InputLabel id="chart-filter-label">Filter</InputLabel>
            <Select
              labelId="chart-filter-label"
              value={dropdownValue} // Use dropdownValue to control the select
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
          sx={{ fontSize: "clamp(0.875rem, 1.2rem, 1.5rem)", color: "#000", textAlign: 'center', mb: 2 }}
        >
          {chartTitle}
        </Typography>

        <Box
          sx={{
            height: { xs: 300, md: 400 }, // Increased height slightly
            width: "100%",
            backgroundColor: "#FFF", // Optional: if paper bg is different
            borderRadius: "8px", // Optional: rounded corners for chart area
          }}
        >
          {loading ? (
            <Typography sx={{textAlign: 'center', pt: 5}}>Loading chart data...</Typography>
          ) : chartData.length === 0 ? (
            <Typography sx={{textAlign: 'center', pt: 5}}>No data available for the selected period.</Typography>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#000" tick={{ fill: "#000", fontSize: 12 }} />
                <YAxis stroke="#000" tick={{ fill: "#000", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)", // Lighter tooltip
                    border: "1px solid #ccc",
                    color: "#000"
                  }}
                  labelStyle={{ color: "#06402B", fontWeight: "bold" }}
                />
                <Legend
                  wrapperStyle={{ color: "#000", paddingTop: '10px' }}
                  formatter={(value) => (
                    <span style={{ color: "#000" }}>{value}</span>
                  )}
                />
                <Bar dataKey="revenue" fill="#00E676" name="Revenue" />
                <Bar dataKey="expenses" fill="#FF6B6B" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Box>

        <Modal open={openMonthModal} onClose={handleModalClose}>
          <Box sx={modalStyle}>
            <Typography variant="h6" sx={{ mb: 2 }}>Select Month and Year</Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="chart-month-label">Month</InputLabel>
              <Select
                labelId="chart-month-label"
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
              <InputLabel id="chart-year-label">Year</InputLabel>
              <Select
                labelId="chart-year-label"
                value={tempSelectedYear}
                label="Year"
                onChange={(e) => setTempSelectedYear(e.target.value)}
              >
                {Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i).map((year) => ( // Dynamic year range
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
              <Button onClick={handleModalClose} variant="outlined" color="secondary">CANCEL</Button>
              <Button onClick={handleApplySelectedMonth} variant="contained" color="primary">APPLY</Button>
            </Box>
          </Box>
        </Modal>

        <Modal open={openYearModal} onClose={handleModalClose}>
          <Box sx={modalStyle}>
            <Typography variant="h6" sx={{ mb: 2 }}>Select Year</Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="chart-yearly-label">Year</InputLabel>
              <Select
                labelId="chart-yearly-label"
                value={tempYear}
                label="Year"
                onChange={(e) => setTempYear(e.target.value)}
              >
                {Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i).map((year) => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
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

        <Modal open={openCustomModal} onClose={handleModalClose}>
          <Box sx={modalStyle}>
            <Typography variant="h6" sx={{ mb: 2 }}>Choose Date Range</Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <DatePicker
                  label="FROM"
                  value={tempCustomFrom}
                  onChange={(newValue) => setTempCustomFrom(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth error={isDateError} helperText={isDateError ? "From date cannot be after To date" : ""} />}
                />
                <DatePicker
                  label="TO"
                  value={tempCustomTo}
                  onChange={(newValue) => setTempCustomTo(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Box>
            </LocalizationProvider>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
              <Button onClick={handleModalClose} variant="outlined" color="secondary">CANCEL</Button>
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

export default RevenueExpensesChart; 