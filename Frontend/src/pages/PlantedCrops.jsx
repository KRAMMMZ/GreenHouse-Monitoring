import React, { useState } from "react";
import {
  Alert,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Box,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Container,
  Modal,
  Divider,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ViewListIcon from "@mui/icons-material/ViewList";
import TodayIcon from "@mui/icons-material/Today";
import HistoryIcon from "@mui/icons-material/History";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DateRangeIcon from "@mui/icons-material/DateRange";
import EventIcon from "@mui/icons-material/Event";
import HarvestSkeliton from "../skelitons/HarvestSkeliton";
import { useFilteredPlantedCrops } from "../hooks/PlantedCropHooks";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

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

// Utility function for consistent date formatting
function formatDate(date) {
  return date.toLocaleDateString();
}

// Function to generate filter description text (for the header)
function getFilterDescription(filter, customFrom, customTo, selectedMonth, selectedYear) {
  if (filter === "all" || filter === "none") return "";
  const today = new Date();
  if (filter === "currentDay") {
    return `CURRENT DAY: ${formatDate(today)}`;
  }
  if (filter === "last7Days") {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);
    return `LAST 7 DAYS: ${formatDate(startDate)} - ${formatDate(endDate)}`;
  }
  if (filter === "currentMonth") {
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return `CURRENT MONTH: ${formatDate(firstDayOfMonth)} - ${formatDate(lastDayOfMonth)}`;
  }
  if (filter === "selectMonth") {
    const firstDay = new Date(selectedYear, selectedMonth - 1, 1);
    const lastDay = new Date(selectedYear, selectedMonth, 0);
    return `SELECT MONTH: ${formatDate(firstDay)} - ${formatDate(lastDay)}`;
  }
  if (filter === "custom" && customFrom && customTo) {
    return `CUSTOM: ${formatDate(new Date(customFrom))} - ${formatDate(new Date(customTo))}`;
  }
  return "";
}

// Function to generate no-data alert text based on active filter
function getNoDataAlertText(filter, customFrom, customTo, selectedMonth, selectedYear) {
  const today = new Date();
  if (filter === "currentDay") {
    return `NO DATA FOR CURRENT DAY (${formatDate(today)})`;
  }
  if (filter === "last7Days") {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);
    return `NO DATA FOR LAST 7 DAYS (${formatDate(startDate)} - ${formatDate(endDate)})`;
  }
  if (filter === "currentMonth") {
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return `NO DATA FOR CURRENT MONTH (${formatDate(firstDayOfMonth)} - ${formatDate(lastDayOfMonth)})`;
  }
  if (filter === "selectMonth") {
    const firstDay = new Date(selectedYear, selectedMonth - 1, 1);
    const lastDay = new Date(selectedYear, selectedMonth, 0);
    return `NO DATA FOR SELECT MONTH (${formatDate(firstDay)} - ${formatDate(lastDay)})`;
  }
  if (filter === "custom" && customFrom && customTo) {
    return `NO DATA FOR CUSTOM (${formatDate(new Date(customFrom))} - ${formatDate(new Date(customTo))})`;
  }
  return "NO DATA AVAILABLE";
}

// Define filter options with corresponding icons.
// The "none" option is disabled.
const filterOptions = [
  { value: "none", label: "SELECT FILTER", icon: <FilterListIcon fontSize="small" sx={{ mr: 1 }} />, disabled: true },
  { value: "all", label: "ALL DATA", icon: <ViewListIcon fontSize="small" sx={{ mr: 1 }} /> },
  { value: "currentDay", label: "CURRENT DAY", icon: <TodayIcon fontSize="small" sx={{ mr: 1 }} /> },
  { value: "last7Days", label: "LAST 7 DAYS", icon: <HistoryIcon fontSize="small" sx={{ mr: 1 }} /> },
  { value: "currentMonth", label: "CURRENT MONTH", icon: <CalendarMonthIcon fontSize="small" sx={{ mr: 1 }} /> },
  { value: "selectMonth", label: "SELECT MONTH", icon: <DateRangeIcon fontSize="small" sx={{ mr: 1 }} /> },
  { value: "custom", label: "SELECT DATE", icon: <EventIcon fontSize="small" sx={{ mr: 1 }} /> },
];

function PlantedCrops() {
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  // Search term
  const [searchTerm, setSearchTerm] = useState("");
  // Separate UI filter (dropdown) and applied filter (active filtering)
  const [uiFilter, setUiFilter] = useState("all");
  const [appliedFilter, setAppliedFilter] = useState("all");
  // Actual filter values applied for custom and month filters
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  // Temporary states for modal changes
  const [tempCustomFrom, setTempCustomFrom] = useState(null);
  const [tempCustomTo, setTempCustomTo] = useState(null);
  const [tempSelectedMonth, setTempSelectedMonth] = useState(new Date().getMonth() + 1);
  const [tempSelectedYear, setTempSelectedYear] = useState(new Date().getFullYear());
  // Modal open states
  const [openDateModal, setOpenDateModal] = useState(false);
  const [openMonthModal, setOpenMonthModal] = useState(false);

  // Handle search changes: reset page to 0
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  // Handle filter changes: for selectMonth and custom, open modal without auto‑applying filter.
  const handleFilterChange = (e) => {
    const value = e.target.value;
    setPage(0);
    if (value === "selectMonth") {
      setUiFilter(value);
      setTempSelectedMonth(selectedMonth);
      setTempSelectedYear(selectedYear);
      setOpenMonthModal(true);
    } else if (value === "custom") {
      setUiFilter(value);
      setTempCustomFrom(customFrom);
      setTempCustomTo(customTo);
      setOpenDateModal(true);
    } else {
      setUiFilter(value);
      setAppliedFilter(value);
      setCustomFrom(null);
      setCustomTo(null);
    }
  };

  // Apply custom date filter only when valid and on clicking Apply
  const handleApplyCustomDates = () => {
    setOpenDateModal(false);
    setCustomFrom(tempCustomFrom);
    setCustomTo(tempCustomTo);
    setAppliedFilter("custom");
    setUiFilter("none");
    setPage(0);
  };

  // Apply select month filter only when Apply is clicked
  const handleApplySelectedMonth = () => {
    setOpenMonthModal(false);
    setSelectedMonth(tempSelectedMonth);
    setSelectedYear(tempSelectedYear);
    setAppliedFilter("selectMonth");
    setUiFilter("none");
    setPage(0);
  };

  // Disable APPLY button if custom dates are not both selected or if FROM is after TO
  const isApplyDisabled = !tempCustomFrom || !tempCustomTo || new Date(tempCustomFrom) > new Date(tempCustomTo);

  // Get filtered planted crops data from hook (using applied values)
  const { filteredPlantedCrops, loading } = useFilteredPlantedCrops({
    filterOption: appliedFilter,
    customFrom,
    customTo,
    selectedMonth: appliedFilter === "selectMonth" ? selectedMonth : null,
    selectedYear: appliedFilter === "selectMonth" ? selectedYear : null,
  });

  // Additional search filtering (searching across several fields)
  const searchFilteredCrops = filteredPlantedCrops.filter((item) => {
    const term = searchTerm.toLowerCase();
    const inCount = String(item.count || "").toLowerCase().includes(term);
    const inDaysGrown = String(item.days_grown || "").toLowerCase().includes(term);
    const inGreenhouseId = String(item.greenhouse_id || "").toLowerCase().includes(term);
    const inPlantId = String(item.plant_id || "").toLowerCase().includes(term);
    const inPlantingDate = (item.planting_date || "").toLowerCase().includes(term);
    return inCount || inDaysGrown || inGreenhouseId || inPlantId || inPlantingDate;
  });

  // Sort crops by planting_date descending
  const sortedCrops = [...searchFilteredCrops].sort(
    (a, b) => new Date(b.planting_date) - new Date(a.planting_date)
  );

  // Compute the filter description text for header
  const filterDescription = getFilterDescription(
    appliedFilter,
    customFrom,
    customTo,
    selectedMonth,
    selectedYear
  );

  return (
    <Container maxWidth="xl" sx={{ p: { xs: 2, sm: 3 } }}>
      {loading ? (
        <HarvestSkeliton />
      ) : (
        <Paper
          sx={{
            width: "100%",
            overflow: "hidden",
            borderRadius: "10px",
            boxShadow: 15,
            p: { xs: 2, sm: 3 },
            mb: { xs: 3, sm: 5 },
            mt: { xs: 2, sm: 3 },
          }}
        >
          {/* Header with title and search/filter controls */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              gap: 2,
              mb: { xs: 2, sm: 3, md: 2 },
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              PLANTED CROPS{" "}
              {filterDescription && (
                <span style={{ fontSize: "0.8rem", fontWeight: "normal", marginLeft: "10px" }}>
                  ({filterDescription})
                </span>
              )}
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 2,
                width: { xs: "100%", sm: "auto" },
              }}
            >
              <TextField
                fullWidth
                label="Search Crops"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <SearchIcon sx={{ fontSize: { xs: "1rem", sm: "1.2rem" } }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ maxWidth: { xs: "100%", sm: "250px" } }}
              />
              <FormControl variant="outlined" size="small" sx={{ width: { xs: "100%", sm: "auto" } }}>
                <InputLabel id="filter-label" sx={{ textTransform: "uppercase" }}>
                  FILTER
                </InputLabel>
                <Select
                  labelId="filter-label"
                  value={uiFilter}
                  label="FILTER"
                  onChange={handleFilterChange}
                  sx={{ textTransform: "uppercase" }}
                >
                  {filterOptions.map((option) => (
                    <MenuItem
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                      sx={{ textTransform: "uppercase" }}
                    >
                      {option.icon}
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Table */}
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table sx={{ minWidth: 650, backgroundColor: "#fff" }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#06402B", borderRadius: "10px" }}>
                  {[
                    "COUNT",
                    "DAYS GROWN",
                    "GREENHOUSE ID",
                  
                    "PLANTING DATE",
                  ].map((header) => (
                    <TableCell
                      key={header}
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        color: "#fff",
                        fontSize: { xs: "0.9rem", sm: "1.1rem" },
                        py: { xs: 2, sm: 2.5 },
                        textTransform: "uppercase",
                      }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedCrops.length > 0 ? (
                  sortedCrops
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((item, index) => (
                      <TableRow key={`${item.plant_id}-${index}`} hover sx={{ borderRadius: "10px" }}>
                        {[
                          item.count,
                          item.days_grown,
                          item.greenhouse_id,
                          
                          new Date(item.planting_date).toUTCString(),
                        ].map((value, idx) => (
                          <TableCell
                            key={idx}
                            align="center"
                            sx={{ fontSize: { xs: "0.8rem", sm: "1rem" }, py: { xs: 1, sm: 1.5 } }}
                          >
                            {value}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Alert variant="filled" severity="warning">
                        {getNoDataAlertText(appliedFilter, customFrom, customTo, selectedMonth, selectedYear)}
                      </Alert>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: { xs: 2, sm: 3 } }}>
            <TablePagination
              component="div"
              count={sortedCrops.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(event, newPage) => setPage(newPage)}
              rowsPerPageOptions={[rowsPerPage]}
            />
          </Box>

          {/* Custom Date Range Modal */}
          <Modal
            open={openDateModal}
            onClose={() => {
              setOpenDateModal(false);
              setUiFilter("all");
            }}
          >
            <Box sx={{ ...modalStyle, p: 3, width: 300 }}>
              <Typography variant="h6" sx={{ mb: 2, textTransform: "uppercase" }}>
                CHOOSE DATE RANGE
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="FROM"
                  value={tempCustomFrom}
                  onChange={(newValue) => setTempCustomFrom(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
                <Box sx={{ height: 16 }} />
                <DatePicker
                  label="TO"
                  value={tempCustomTo}
                  onChange={(newValue) => setTempCustomTo(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 3 }}>
                <Button onClick={() => setOpenDateModal(false)} color="secondary" size="small">
                  CANCEL
                </Button>
                <Button onClick={handleApplyCustomDates} variant="contained" color="primary" size="small" disabled={isApplyDisabled}>
                  APPLY
                </Button>
              </Box>
            </Box>
          </Modal>

          {/* Select Month Modal */}
          <Modal open={openMonthModal} onClose={() => setOpenMonthModal(false)} aria-labelledby="planted-crops-month-modal">
            <Box sx={modalStyle}>
              <Typography variant="h6" sx={{ mb: 2, textTransform: "uppercase" }}>
                SELECT MONTH AND YEAR
              </Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="planted-crops-month-label" sx={{ textTransform: "uppercase" }}>
                  MONTH
                </InputLabel>
                <Select
                  labelId="planted-crops-month-label"
                  value={tempSelectedMonth}
                  label="MONTH"
                  onChange={(e) => setTempSelectedMonth(e.target.value)}
                  sx={{ textTransform: "uppercase" }}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <MenuItem key={i + 1} value={i + 1} sx={{ textTransform: "uppercase" }}>
                      {new Date(0, i).toLocaleString("default", { month: "long" }).toUpperCase()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="planted-crops-year-label" sx={{ textTransform: "uppercase" }}>
                  YEAR
                </InputLabel>
                <Select
                  labelId="planted-crops-year-label"
                  value={tempSelectedYear}
                  label="YEAR"
                  onChange={(e) => setTempSelectedYear(e.target.value)}
                  sx={{ textTransform: "uppercase" }}
                >
                  {Array.from({ length: 11 }, (_, i) => 2020 + i).map((year) => (
                    <MenuItem key={year} value={year} sx={{ textTransform: "uppercase" }}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Divider sx={{ my: 3 }} />
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                <Button
                  onClick={() => {
                    setOpenMonthModal(false);
                    setUiFilter("all");
                  }}
                  variant="outlined"
                  color="secondary"
                >
                  CANCEL
                </Button>
                <Button onClick={handleApplySelectedMonth} variant="contained" color="primary">
                  APPLY
                </Button>
              </Box>
            </Box>
          </Modal>
        </Paper>
      )}
    </Container>
  );
}

export default PlantedCrops;
