import React, { useState } from "react";
import {
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
  useMediaQuery,
  useTheme
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
import { useFilteredHardwareComponents } from "../hooks/HarvestComponentsHooks";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { styled } from '@mui/material/styles';
import { useMemo } from "react";

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
  { value: "none", label: "SELECT FILTER", icon: <FilterListIcon fontSize="small" sx={{ mr: 1 }}   />, disabled: true },
  { value: "all", label: "ALL DATA", icon: <ViewListIcon fontSize="small"  sx={{ mr: 1 }} /> },
  { value: "currentDay", label: "CURRENT DAY", icon: <TodayIcon fontSize="small"  sx={{ mr: 1 }}  /> },
  { value: "last7Days", label: "LAST 7 DAYS", icon: <HistoryIcon fontSize="small"  sx={{ mr: 1 }} /> },
  { value: "currentMonth", label: "CURRENT MONTH", icon: <CalendarMonthIcon fontSize="small" sx={{ mr: 1 }}  /> },
  { value: "selectMonth", label: "SELECT MONTH", icon: <DateRangeIcon fontSize="small"  sx={{ mr: 1 }} /> },
  { value: "custom", label: "SELECT DATE", icon: <EventIcon fontSize="small" sx={{ mr: 1 }}  /> },
];

// Styled TableCell component
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  color: '#000',
  borderBottom: 'none',
  fontSize: '0.875rem', // Set a default font size
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.75rem', // Adjust font size for smaller screens
  },
}));

// Styled TableRow component
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: '#FFF',
  '&:hover': {
    backgroundColor: '#F5F5F5', // Lighter shade for hover effect
  },
}));

function HardwareComponents() {
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

  const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

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

  // Get filtered hardware components data from hook (using applied values)
  const { filteredHardwareComponents, loading } = useFilteredHardwareComponents({
    filterOption: appliedFilter,
    customFrom,
    customTo,
    selectedMonth: appliedFilter === "selectMonth" ? selectedMonth : null,
    selectedYear: appliedFilter === "selectMonth" ? selectedYear : null,
  });

  // Additional search filtering (by componentName, manufacturer, model_number, or serial_number)
  const searchFilteredComponents = filteredHardwareComponents.filter((item) => {
    const term = searchTerm.toLowerCase();
    const inComponentName = (item.componentName || "").toLowerCase().includes(term);
    const inManufacturer = (item.manufacturer || "").toLowerCase().includes(term);
    const inModelNumber = (item.model_number || "").toLowerCase().includes(term);
    const inSerialNumber = (item.serial_number || "").toLowerCase().includes(term);
    return inComponentName || inManufacturer || inModelNumber || inSerialNumber;
  });

  // Sort components by date_of_installation descending
  const sortedComponents = [...searchFilteredComponents].sort(
    (a, b) => new Date(b.date_of_installation) - new Date(a.date_of_installation)
  );

  // Compute the filter description text for header
  const filterDescription = getFilterDescription(
    appliedFilter,
    customFrom,
    customTo,
    selectedMonth,
    selectedYear
  );

   const tableHeaderCellTypographyProps = useMemo(
        () => ({
            fontSize: isSmallScreen ? "0.75rem" : "0.875rem",
            fontWeight: "bold",
        }),
        [isSmallScreen]
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
            backgroundColor: "#fff",
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
              HARDWARE COMPONENTS{" "}
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
                label="Search Components"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{
                  style: { color: "#000" },
                }}
                sx={{
                  maxWidth: { xs: "100%", sm: "250px" }, textTransform: "uppercase",
                   "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#000",
                    },
                    "&:hover fieldset": {
                      borderColor: "#000",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#000",
                    },
                    "& input": {
                      color: "#000", // Text color inside the input
                    },
                  },
                }}
              />
              <FormControl
              variant="outlined"
              size="small"
              sx={{ width: { xs: "100%", sm: "100%", md: "auto" } }}
            >
                <InputLabel id="filter-label"  sx={{ textTransform: "uppercase" }}>
                  FILTER
                </InputLabel>
                <Select
                  labelId="filter-label"
                  value={uiFilter}
                  label="FILTER"
                  onChange={handleFilterChange}
                  sx={{ textTransform: "uppercase", 
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#000', // Default border color
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#000', // Hovered border color
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#000', // Focused border color
                    },
                    '& .MuiSvgIcon-root': { // Adjust the color of the dropdown arrow
                      color: '#000',
                    },
                  }}
                   MenuProps={{
                    PaperProps: {
                      style: {
                        backgroundColor: '#fff', // Background color of the dropdown
                      },
                    },
                  }}
                  inputProps={{
                    style: { color: '#000' },
                  }}
                >
                  {filterOptions.map((option) => (
                    <MenuItem
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                       sx={{ textTransform: "uppercase", color: "#000" }}
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
          <TableContainer sx={{ overflowX: "auto", borderBottom: "1px solid #999" }}>
            <Table sx={{ minWidth: 650, backgroundColor: "#fff", borderSpacing: "0 10px", }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#06402B", borderRadius: "10px" }}>
                  {["COMPONENT NAME", "MANUFACTURER", "MODEL NUMBER", "SERIAL NUMBER", "DATE OF INSTALLATION"].map(
                    (header) => (
                      <TableCell
                        key={header}
                        align="center"
                        sx={{
                          fontWeight: "bold",
                          color: "#fff",
                          fontSize: { xs: "0.9rem", sm: "1.1rem" },
                          py: { xs: 2, sm: 2.5 },
                          textTransform: "uppercase",
                          borderBottom: 'none'
                        }}
                      >
                       <Typography {...tableHeaderCellTypographyProps}>{header}</Typography>
                      </TableCell>
                    )
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedComponents.length > 0 ? (
                  sortedComponents
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((item, index) => (
                      <StyledTableRow key={`${item.componentName}-${index}`}>
                        {[
                          item.componentName,
                          item.manufacturer,
                          item.model_number,
                          item.serial_number,
                          new Date(item.date_of_installation).toUTCString(),
                        ].map((value, idx) => (
                          <StyledTableCell key={idx} align="center" >
                            {value}
                          </StyledTableCell>
                        ))}
                      </StyledTableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ borderBottom: 'none' }}>
                      <Typography variant="h8" severity="warning">
                        {getNoDataAlertText(appliedFilter, customFrom, customTo, selectedMonth, selectedYear)}
                      </Typography>
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
              count={sortedComponents.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(event, newPage) => setPage(newPage)}
              rowsPerPageOptions={[rowsPerPage]}
                sx={{
                 color: '#000', // Color of the pagination text
              
              }}
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
            <Box sx={{ ...modalStyle, p: 3, width: 300, backgroundColor: "#fff" }}>
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
          <Modal open={openMonthModal} onClose={() => setOpenMonthModal(false)} aria-labelledby="harvest-month-modal">
            <Box sx={{ ...modalStyle, backgroundColor: "#fff" }}>
              <Typography variant="h6" sx={{ mb: 2, textTransform: "uppercase" }}>
                SELECT MONTH AND YEAR
              </Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="harvest-month-label"  sx={{ textTransform: "uppercase" }}>
                  MONTH
                </InputLabel>
                <Select
                  labelId="harvest-month-label"
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
                <InputLabel id="harvest-year-label"  sx={{ textTransform: "uppercase" }}>
                  YEAR
                </InputLabel>
                <Select
                  labelId="harvest-year-label"
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

export default HardwareComponents;