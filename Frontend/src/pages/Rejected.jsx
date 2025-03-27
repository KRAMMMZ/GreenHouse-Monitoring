import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Modal,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ViewListIcon from "@mui/icons-material/ViewList";
import TodayIcon from "@mui/icons-material/Today";
import DateRangeIcon from "@mui/icons-material/DateRange";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CalendarViewMonthIcon from "@mui/icons-material/CalendarViewMonth";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import HarvestSkeliton from "../skelitons/HarvestSkeliton";
import { useRejectedTableItems } from "../hooks/RejectionHooks";

// Helper function to format a Date into a short readable format
function formatDate(date) {
  return date.toLocaleDateString("default", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Function to generate filter description text (for the header)
// We map our filter values to corresponding description formats.
function getFilterDescription(filter, customFrom, customTo, selectedMonth, selectedYear) {
  switch (filter) {
    case "ALL":
      return "";
    case "CURRENT DAY":
      return `CURRENT DAY: ${formatDate(new Date())}`;
    case "LAST 7 DAYS": {
      const today = new Date();
      const startDate = new Date();
      startDate.setDate(today.getDate() - 6);
      return `LAST 7 DAYS: ${formatDate(startDate)} - ${formatDate(today)}`;
    }
    case "THIS MONTH": {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return `THIS MONTH: ${formatDate(firstDayOfMonth)} - ${formatDate(lastDayOfMonth)}`;
    }
    case "SELECT MONTH": {
      if (selectedMonth && selectedYear) {
        const firstDay = new Date(selectedYear, selectedMonth - 1, 1);
        const lastDay = new Date(selectedYear, selectedMonth, 0);
        return `SELECT MONTH: ${formatDate(firstDay)} - ${formatDate(lastDay)}`;
      }
      return "";
    }
    case "CHOOSE DATE": {
      if (customFrom && customTo) {
        return `CUSTOM: ${formatDate(new Date(customFrom))} - ${formatDate(new Date(customTo))}`;
      }
      return "";
    }
    default:
      return "";
  }
}

const Rejected = () => {
  // Table data hook
  const { rejectItems, rejectLoading } = useRejectedTableItems();

  // Pagination and search
  const [rejectPage, setRejectPage] = useState(0);
  const rowsPerPage = 10;
  const [rejectSearchTerm, setRejectSearchTerm] = useState("");

  // Active filter state (for options other than modals, it is updated immediately)
  const [rejectFilter, setRejectFilter] = useState("ALL");

  // CHOOSE DATE states: temporary & applied
  const [openDateModal, setOpenDateModal] = useState(false);
  const [tempCustomFrom, setTempCustomFrom] = useState(null);
  const [tempCustomTo, setTempCustomTo] = useState(null);
  const [appliedCustomFrom, setAppliedCustomFrom] = useState(null);
  const [appliedCustomTo, setAppliedCustomTo] = useState(null);

  // SELECT MONTH states: temporary & applied
  const currentMonth = (new Date().getMonth() + 1).toString();
  const currentYear = new Date().getFullYear().toString();
  const [openMonthModal, setOpenMonthModal] = useState(false);
  const [tempSelectedMonth, setTempSelectedMonth] = useState(currentMonth);
  const [tempSelectedYear, setTempSelectedYear] = useState(currentYear);
  const [appliedSelectedMonth, setAppliedSelectedMonth] = useState(currentMonth);
  const [appliedSelectedYear, setAppliedSelectedYear] = useState(currentYear);

  // When modals open, initialize temporary states to applied values
  useEffect(() => {
    if (openDateModal) {
      setTempCustomFrom(appliedCustomFrom);
      setTempCustomTo(appliedCustomTo);
    }
  }, [openDateModal, appliedCustomFrom, appliedCustomTo]);

  useEffect(() => {
    if (openMonthModal) {
      setTempSelectedMonth(appliedSelectedMonth);
      setTempSelectedYear(appliedSelectedYear);
    }
  }, [openMonthModal, appliedSelectedMonth, appliedSelectedYear]);

  // Compute filter description text for the header
  const filterDescription = getFilterDescription(
    rejectFilter,
    appliedCustomFrom,
    appliedCustomTo,
    appliedSelectedMonth,
    appliedSelectedYear
  );

  // Filtering logic using applied states for modal-based filters
  const filterByDate = (item) => {
    const itemDate = new Date(item.rejection_date);
    const today = new Date();
    switch (rejectFilter) {
      case "ALL":
        return true;
      case "CURRENT DAY":
        return (
          itemDate.getDate() === today.getDate() &&
          itemDate.getMonth() === today.getMonth() &&
          itemDate.getFullYear() === today.getFullYear()
        );
      case "LAST 7 DAYS": {
        const pastDate = new Date();
        pastDate.setDate(today.getDate() - 6);
        return itemDate >= pastDate && itemDate <= today;
      }
      case "THIS MONTH":
        return (
          itemDate.getMonth() === today.getMonth() &&
          itemDate.getFullYear() === today.getFullYear()
        );
      case "CHOOSE DATE": {
        if (!appliedCustomFrom || !appliedCustomTo) return true;
        const adjustedCustomTo = new Date(appliedCustomTo);
        adjustedCustomTo.setHours(23, 59, 59, 999);
        return itemDate >= appliedCustomFrom && itemDate <= adjustedCustomTo;
      }
      case "SELECT MONTH": {
        if (!appliedSelectedMonth || !appliedSelectedYear) return true;
        return (
          itemDate.getMonth() + 1 === parseInt(appliedSelectedMonth) &&
          itemDate.getFullYear() === parseInt(appliedSelectedYear)
        );
      }
      default:
        return true;
    }
  };

  const sortedRejectItems = [...rejectItems].sort(
    (a, b) => new Date(b.rejection_date) - new Date(a.rejection_date)
  );

  const filteredRejectItems = sortedRejectItems.filter((item) => {
    const dateMatch = filterByDate(item);
    const searchTerm = rejectSearchTerm.toLowerCase();
    const rejectionDate = item.rejection_date ? item.rejection_date.toLowerCase() : "";
    const comments = item.comments ? item.comments.toLowerCase() : "";
    return dateMatch && (rejectionDate.includes(searchTerm) || comments.includes(searchTerm));
  });

  // Handle filter change for non-modal options.
  const handleFilterChange = (e) => {
    const value = e.target.value;
    // For modal based filters, the onClick on MenuItem will handle opening the modal.
    if (value !== "CHOOSE DATE" && value !== "SELECT MONTH") {
      setRejectFilter(value);
    }
  };

  // Apply handlers for modals: update applied values and active filter only on Apply click.
  const handleApplyCustomDates = () => {
    if (tempCustomFrom && tempCustomTo && tempCustomFrom <= tempCustomTo) {
      setAppliedCustomFrom(tempCustomFrom);
      setAppliedCustomTo(tempCustomTo);
      setRejectFilter("CHOOSE DATE");
      setOpenDateModal(false);
    }
  };

  const handleApplySelectedMonth = () => {
    if (tempSelectedMonth && tempSelectedYear) {
      setAppliedSelectedMonth(tempSelectedMonth);
      setAppliedSelectedYear(tempSelectedYear);
      setRejectFilter("SELECT MONTH");
      setOpenMonthModal(false);
    }
  };

  const isApplyDisabled = !tempCustomFrom || !tempCustomTo || tempCustomFrom > tempCustomTo;

  // Build the no-data message based on the active filter.
  const getNoDataMessage = () => {
    switch (rejectFilter) {
      case "CURRENT DAY": {
        const today = new Date();
        const formatted = today.toLocaleDateString("default", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });
        return `No data for current day (${formatted})`;
      }
      case "LAST 7 DAYS": {
        const today = new Date();
        const pastDate = new Date();
        pastDate.setDate(today.getDate() - 6);
        const formattedStart = pastDate.toLocaleDateString("default", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });
        const formattedEnd = today.toLocaleDateString("default", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });
        return `No data for last 7 days (${formattedStart} - ${formattedEnd})`;
      }
      case "THIS MONTH": {
        const today = new Date();
        const formatted = today.toLocaleDateString("default", { month: "long", year: "numeric" });
        return `No data for this month (${formatted})`;
      }
      case "CHOOSE DATE": {
        const from = appliedCustomFrom
          ? appliedCustomFrom.toLocaleDateString("default", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })
          : "";
        const to = appliedCustomTo
          ? appliedCustomTo.toLocaleDateString("default", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })
          : "";
        return `No data for chosen date range (${from} - ${to})`;
      }
      case "SELECT MONTH": {
        const monthIndex = parseInt(appliedSelectedMonth) - 1;
        const dateForMonth = new Date(appliedSelectedYear, monthIndex);
        const formatted = dateForMonth.toLocaleDateString("default", { month: "long", year: "numeric" });
        return `No data for selected month (${formatted})`;
      }
      default:
        return "No data";
    }
  };

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 300,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 3,
    borderRadius: 2,
  };

  return (
    <Container maxWidth="xxl" sx={{ p: 3 }}>
      {/* Filter/Search and Table Section */}
      <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 3, mt: 3 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            REJECTED ITEMS{" "}
            {filterDescription && (
              <span style={{ fontSize: "0.8rem", fontWeight: "normal", marginLeft: "10px" }}>
                ({filterDescription})
              </span>
            )}
          </Typography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              value={rejectSearchTerm}
              onChange={(e) => setRejectSearchTerm(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ width: { xs: "100%", sm: "100%", md: "auto" } }}
            />
            <FormControl
              variant="outlined"
              size="small"
              sx={{ width: { xs: "100%", sm: "100%", md: "auto" } }}
            >
              <InputLabel>Filter</InputLabel>
              <Select label="Filter" value={rejectFilter} onChange={handleFilterChange}>
                <MenuItem value="ALL">
                  <ViewListIcon fontSize="small" sx={{ mr: 1 }} /> ALL
                </MenuItem>
                <MenuItem value="CURRENT DAY">
                  <TodayIcon fontSize="small" sx={{ mr: 1 }} /> CURRENT DAY
                </MenuItem>
                <MenuItem value="LAST 7 DAYS">
                  <DateRangeIcon fontSize="small" sx={{ mr: 1 }} /> LAST 7 DAYS
                </MenuItem>
                <MenuItem value="THIS MONTH">
                  <CalendarMonthIcon fontSize="small" sx={{ mr: 1 }} /> THIS MONTH
                </MenuItem>
                <MenuItem value="SELECT MONTH" onClick={() => setOpenMonthModal(true)}>
                  <CalendarViewMonthIcon fontSize="small" sx={{ mr: 1 }} /> SELECT MONTH
                </MenuItem>
                <MenuItem value="CHOOSE DATE" onClick={() => setOpenDateModal(true)}>
                  <CalendarTodayIcon fontSize="small" sx={{ mr: 1 }} /> CHOOSE DATE
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Box sx={{ mt: 2 }}>
          {rejectLoading ? (
            <HarvestSkeliton />
          ) : (
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#06402B" }}>
                    {["Diseased", "Physically Damaged", "Too Small", "Comments", "Rejection Date"].map(
                      (header) => (
                        <TableCell
                          key={header}
                          align="center"
                          sx={{ fontWeight: "bold", fontSize: "1.1rem", color: "#fff" }}
                        >
                          {header}
                        </TableCell>
                      )
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRejectItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                      <Alert variant="filled" severity="warning">{getNoDataMessage()}</Alert>
                       
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRejectItems
                      .slice(rejectPage * rowsPerPage, rejectPage * rowsPerPage + rowsPerPage)
                      .map((item) => (
                        <TableRow key={item.rejection_id} hover>
                          <TableCell align="center">{item.diseased}</TableCell>
                          <TableCell align="center">{item.physically_damaged}</TableCell>
                          <TableCell align="center">{item.too_small}</TableCell>
                          <TableCell align="center">{item.comments}</TableCell>
                          <TableCell align="center">{item.rejection_date}</TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <TablePagination
              component="div"
              count={filteredRejectItems.length}
              rowsPerPage={rowsPerPage}
              page={rejectPage}
              onPageChange={(event, newPage) => setRejectPage(newPage)}
              rowsPerPageOptions={[rowsPerPage]}
            />
          </Box>
        </Box>
      </Paper>

      {/* CHOOSE DATE Modal */}
      <Modal open={openDateModal} onClose={() => setOpenDateModal(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Choose Date Range
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="FROM"
              value={tempCustomFrom}
              onChange={(newValue) => setTempCustomFrom(newValue)}
              renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 4 }} />}
            />
            <Divider sx={{ my: 2, bgcolor: "grey.300" }} />
            <DatePicker
              label="TO"
              value={tempCustomTo}
              onChange={(newValue) => setTempCustomTo(newValue)}
              renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 4 }} />}
            />
          </LocalizationProvider>
          <Divider sx={{ my: 1, bgcolor: "grey.300" }} />
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button onClick={() => setOpenDateModal(false)} color="secondary">
              Cancel
            </Button>
            <Button
              onClick={handleApplyCustomDates}
              variant="contained"
              color="primary"
              disabled={isApplyDisabled}
            >
              Apply
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* SELECT MONTH Modal */}
      <Modal open={openMonthModal} onClose={() => setOpenMonthModal(false)} aria-labelledby="hardware-month-modal">
        <Box sx={modalStyle}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Select Month and Year
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="hardware-month-label">Month</InputLabel>
            <Select
              labelId="hardware-month-label"
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
            <InputLabel id="hardware-year-label">Year</InputLabel>
            <Select
              labelId="hardware-year-label"
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
              onClick={() => {
                setOpenMonthModal(false);
                setTempSelectedMonth(appliedSelectedMonth);
                setTempSelectedYear(appliedSelectedYear);
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
    </Container>
  );
};

export default Rejected;
