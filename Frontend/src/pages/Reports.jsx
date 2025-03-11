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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import HarvestSkeliton from "../skelitons/HarvestSkeliton";
import { useFilteredMaintenance } from "../hooks/MaintenanceHooks";
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

// Compute filter description text based on active filter
function getFilterDescription(
  filter,
  customFrom,
  customTo,
  selectedMonth,
  selectedYear
) {
  if (filter === "all" || filter === "none") return "";

  const today = new Date();

  if (filter === "currentDay") {
    return `Current Day: ${formatDate(today)}`;
  }

  if (filter === "last7Days") {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);
    return `Last 7 Days: ${formatDate(startDate)} - ${formatDate(endDate)}`;
  }

  if (filter === "currentMonth") {
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    );
    return `Current Month: ${formatDate(firstDayOfMonth)} - ${formatDate(lastDayOfMonth)}`;
  }

  if (filter === "selectMonth") {
    const firstDay = new Date(selectedYear, selectedMonth - 1, 1);
    const lastDay = new Date(selectedYear, selectedMonth, 0);
    return `Select Month: ${formatDate(firstDay)} - ${formatDate(lastDay)}`;
  }

  if (filter === "custom" && customFrom && customTo) {
    return `Custom: ${formatDate(new Date(customFrom))} - ${formatDate(new Date(customTo))}`;
  }

  return "";
}

function Reports() {
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  // Search term
  const [searchTerm, setSearchTerm] = useState("");

  // Separate UI filter (dropdown) and applied filter (active filtering)
  const [uiFilter, setUiFilter] = useState("all");
  const [appliedFilter, setAppliedFilter] = useState("all");

  // Custom date range modal states
  const [openDateModal, setOpenDateModal] = useState(false);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);

  // Select month modal states
  const today = new Date();
  const [openMonthModal, setOpenMonthModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  // Handle search changes: reset page to 0
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  // Handle filter changes: reset page to 0
  const handleFilterChange = (e) => {
    const value = e.target.value;
    setPage(0);
    if (value === "selectMonth") {
      setUiFilter(value);
      setOpenMonthModal(true);
    } else if (value === "custom") {
      setUiFilter(value);
      setOpenDateModal(true);
    } else {
      setUiFilter(value);
      setAppliedFilter(value);
      // Clear custom date values when switching away
      setCustomFrom(null);
      setCustomTo(null);
    }
  };

  // Apply custom date filter and reset dropdown
  const handleApplyCustomDates = () => {
    setOpenDateModal(false);
    setAppliedFilter("custom");
    setUiFilter("none");
    setPage(0);
  };

  // Apply select month filter and reset dropdown
  const handleApplySelectedMonth = () => {
    setOpenMonthModal(false);
    setAppliedFilter("selectMonth");
    setUiFilter("none");
    setPage(0);
  };

  // Disable APPLY button if custom dates are not both selected
  const isApplyDisabled = !customFrom || !customTo;

  // Get filtered maintenance data from hook
  const { filteredMaintenance, loading } = useFilteredMaintenance({
    filterOption: appliedFilter,
    customFrom,
    customTo,
    selectedMonth: appliedFilter === "selectMonth" ? selectedMonth : null,
    selectedYear: appliedFilter === "selectMonth" ? selectedYear : null,
  });

  // Additional search filtering (search by title, description, or email)
  const searchFilteredMaintenance = filteredMaintenance.filter((item) => {
    const inTitle = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const inDescription = item.description
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const inEmail = item.email.toLowerCase().includes(searchTerm.toLowerCase());
    return inTitle || inDescription || inEmail;
  });

  // Sort maintenance items by date_completed descending
  const sortedMaintenance = [...searchFilteredMaintenance].sort(
    (a, b) => new Date(b.date_completed) - new Date(a.date_completed)
  );

  // Compute the filter description text
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
              mb: { xs: 2, sm: 3 },
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                fontSize: { xs: "1.2rem", sm: "1.5rem", md: "1.8rem" },
              }}
            >
              MAINTENANCE{" "}
              {filterDescription && (
                <span
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: "normal",
                    marginLeft: "10px",
                  }}
                >
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
                label="Search Maintenance"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <SearchIcon
                        sx={{ fontSize: { xs: "1rem", sm: "1.2rem" } }}
                      />
                    </InputAdornment>
                  ),
                }}
                sx={{ maxWidth: { xs: "100%", sm: "250px" } }}
              />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="filter-label">Filter</InputLabel>
                <Select
                  labelId="filter-label"
                  value={uiFilter}
                  label="Filter"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="none">Select Filter</MenuItem>
                  <MenuItem value="all">All Data</MenuItem>
                  <MenuItem value="currentDay">Current Day</MenuItem>
                  <MenuItem value="last7Days">Last 7 Days</MenuItem>
                  <MenuItem value="currentMonth">Current Month</MenuItem>
                  <MenuItem value="selectMonth">Select Month</MenuItem>
                  <MenuItem value="custom">SELECT DATE</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Table */}
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table sx={{ minWidth: 650, backgroundColor: "#fff" }}>
              <TableHead>
                <TableRow
                  sx={{ backgroundColor: "#06402B", borderRadius: "10px" }}
                >
                  {["Title", "Description", "Email", "Date Completed"].map(
                    (header) => (
                      <TableCell
                        key={header}
                        align="center"
                        sx={{
                          fontWeight: "bold",
                          color: "#fff",
                          fontSize: { xs: "0.9rem", sm: "1.1rem" },
                          py: { xs: 2, sm: 2.5 },
                        }}
                      >
                        {header}
                      </TableCell>
                    )
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedMaintenance
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((item, index) => (
                    <TableRow
                      key={`${item.maintenance_id}-${index}`}
                      hover
                      sx={{ borderRadius: "10px" }}
                    >
                      {[
                        item.title,
                        item.description,
                        item.email,
                        new Date(item.date_completed).toLocaleDateString(),
                      ].map((value, idx) => (
                        <TableCell
                          key={idx}
                          align="center"
                          sx={{
                            fontSize: { xs: "0.8rem", sm: "1rem" },
                            py: { xs: 1, sm: 1.5 },
                          }}
                        >
                          {value}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mt: { xs: 2, sm: 3 },
            }}
          >
            <TablePagination
              component="div"
              count={sortedMaintenance.length}
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
            <Box
              sx={{
                ...modalStyle,
                p: 3,
                width: 300, // Set a compact width
              }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                Choose Date Range
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="FROM"
                  value={customFrom}
                  onChange={(newValue) => setCustomFrom(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
                <Box sx={{ height: 16 }} />{" "}
                {/* Adds space between the DatePickers */}
                <DatePicker
                  label="TO"
                  value={customTo}
                  onChange={(newValue) => setCustomTo(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 1,
                  mt: 3,
                }}
              >
                <Button
                  onClick={() => setOpenDateModal(false)}
                  color="secondary"
                  size="small"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleApplyCustomDates}
                  variant="contained"
                  color="primary"
                  size="small"
                  disabled={isApplyDisabled}
                >
                  Apply
                </Button>
              </Box>
            </Box>
          </Modal>

          {/* Select Month Modal */}
          <Modal
            open={openMonthModal}
            onClose={() => setOpenMonthModal(false)}
            aria-labelledby="harvest-month-modal"
          >
            <Box sx={modalStyle}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Select Month and Year
              </Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="harvest-month-label">Month</InputLabel>
                <Select
                  labelId="harvest-month-label"
                  value={selectedMonth}
                  label="Month"
                  onChange={(e) => setSelectedMonth(e.target.value)}
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
                <InputLabel id="harvest-year-label">Year</InputLabel>
                <Select
                  labelId="harvest-year-label"
                  value={selectedYear}
                  label="Year"
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  {Array.from({ length: 11 }, (_, i) => 2020 + i).map(
                    (year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    )
                  )}
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
        </Paper>
      )}
    </Container>
  );
}

export default Reports;
