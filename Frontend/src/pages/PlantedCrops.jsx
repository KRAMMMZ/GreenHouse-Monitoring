import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
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
  MenuList, // Import MenuList and Popper
  ClickAwayListener,
  InputLabel,
  Container,
  Modal,
  Divider,
  Button,
  IconButton,
  Tooltip, // Import Tooltip
  Popper,
  Grow,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ViewListIcon from "@mui/icons-material/ViewList";
import TodayIcon from "@mui/icons-material/Today";
import HistoryIcon from "@mui/icons-material/History";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DateRangeIcon from "@mui/icons-material/DateRange";
import EventIcon from "@mui/icons-material/Event";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"; // Import the arrow icon
import HarvestSkeliton from "../skelitons/HarvestSkeliton";
import { useFilteredPlantedCrops } from "../hooks/PlantedCropHooks";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import NutrientControllers from "../components/NutrientController";
import SensorReadings from "../components/SensorReadings";
import PlantedCropDetailsModal from "../components/PlantedCropstDetailsModal";

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
    const lastDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    );
    return `CURRENT MONTH: ${formatDate(firstDayOfMonth)} - ${formatDate(
      lastDayOfMonth
    )}`;
  }
  if (filter === "selectMonth") {
    const firstDay = new Date(selectedYear, selectedMonth - 1, 1);
    const lastDay = new Date(selectedYear, selectedMonth, 0);
    return `SELECT MONTH: ${formatDate(firstDay)} - ${formatDate(lastDay)})`;
  }
  if (filter === "custom" && customFrom && customTo) {
    return `CUSTOM: ${formatDate(new Date(customFrom))} - ${formatDate(
      new Date(customTo)
    )}`;
  }
  return "";
}

// Function to generate no-data alert text based on active filter
function getNoDataAlertText(
  filter,
  customFrom,
  customTo,
  selectedMonth,
  selectedYear
) {
  const today = new Date();
  if (filter === "currentDay") {
    return `NO DATA FOR CURRENT DAY (${formatDate(today)})`;
  }
  if (filter === "last7Days") {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);
    return `NO DATA FOR LAST 7 DAYS (${formatDate(startDate)} - ${formatDate(
      endDate
    )})`;
  }
  if (filter === "currentMonth") {
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    );
    return `NO DATA FOR CURRENT MONTH (${formatDate(firstDayOfMonth)} - ${formatDate(
      lastDayOfMonth
    )})`;
  }
  if (filter === "selectMonth") {
    const firstDay = new Date(selectedYear, selectedMonth - 1, 1);
    const lastDay = new Date(selectedYear, selectedMonth, 0);
    return `NO DATA FOR SELECT MONTH (${formatDate(firstDay)} - ${formatDate(
      lastDay
    )})`;
  }
  if (filter === "custom" && customFrom && customTo) {
    return `NO DATA FOR CUSTOM (${formatDate(new Date(customFrom))} - ${formatDate(
      new Date(customTo)
    )})`;
  }
  return "NO DATA AVAILABLE";
}

// Define filter options with corresponding icons.
// The "none" option is disabled.
const filterOptions = [
  {
    value: "none",
    label: "SELECT FILTER",
    icon: <FilterListIcon fontSize="small" sx={{ mr: 1 }} />,
    disabled: true,
  },
  {
    value: "all",
    label: "ALL DATA",
    icon: <ViewListIcon fontSize="small" sx={{ mr: 1 }} />,
  },
  {
    value: "currentDay",
    label: "CURRENT DAY",
    icon: <TodayIcon fontSize="small" sx={{ mr: 1 }} />,
  },
  {
    value: "last7Days",
    label: "LAST 7 DAYS",
    icon: <HistoryIcon fontSize="small" sx={{ mr: 1 }} />,
  },
  {
    value: "currentMonth",
    label: "CURRENT MONTH",
    icon: <CalendarMonthIcon fontSize="small" sx={{ mr: 1 }} />,
  },
  {
    value: "selectMonth",
    label: "SELECT MONTH",
    icon: <DateRangeIcon fontSize="small" sx={{ mr: 1 }} />,
  },
  {
    value: "custom",
    label: "SELECT DATE",
    icon: <EventIcon fontSize="small" sx={{ mr: 1 }} />,
  },
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
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  // Temporary states for modal changes
  const [tempCustomFrom, setTempCustomFrom] = useState(null);
  const [tempCustomTo, setTempCustomTo] = useState(null);
  const [tempSelectedMonth, setTempSelectedMonth] = useState(
    new Date().getMonth() + 1
  );
  const [tempSelectedYear, setTempSelectedYear] = useState(
    new Date().getFullYear()
  );
  // Modal open states for filter modals
  const [openDateModal, setOpenDateModal] = useState(false);
  const [openMonthModal, setOpenMonthModal] = useState(false);
  // State for details modal
  const [selectedCrop, setSelectedCrop] = useState(null);

  // State to track harvested/not harvested filter
  const [filterHarvested, setFilterHarvested] = useState(false); // Default to not harvested (false)
  const [filterReadyToHarvest, setFilterReadyToHarvest] = useState(false);
  const [open, setOpen] = useState(false); // Menu open state
  const anchorRef = useRef(null); // Reference to the button

  // Use useEffect to set the initial filterHarvested state (only on the first render)
  useEffect(() => {
    setFilterHarvested(false); // Set to false for "Not Harvested" by default
  }, []);

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
  const isApplyDisabled =
    !tempCustomFrom ||
    !tempCustomTo ||
    new Date(tempCustomFrom) > new Date(tempCustomTo);

  // Function to handle the status selection from the menu
  const handleStatusSelect = (status) => {
    setOpen(false);
    setFilterHarvested(status === "harvested");
    setFilterReadyToHarvest(status === "ready to harvest");
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  function handleListKeyDown(event) {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  }

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);

  // Get filtered planted crops data from hook (using applied values)
  const { filteredPlantedCrops, loading } = useFilteredPlantedCrops({
    filterOption: appliedFilter,
    customFrom,
    customTo,
    selectedMonth: appliedFilter === "selectMonth" ? selectedMonth : null,
    selectedYear: appliedFilter === "selectMonth" ? selectedYear : null,
  });

  // Additional search filtering (searching across several fields)
  const searchFilteredCrops = useMemo(() => {
    return filteredPlantedCrops.filter((item) => {
      const term = searchTerm.toLowerCase();
      const inCount = String(item.count || "").toLowerCase().includes(term);
      const inDaysGrown = String(item.days_grown || "").toLowerCase().includes(term);
      const inGreenhouseId = String(item.greenhouse_id || "").toLowerCase().includes(term);
      const inPlantId = String(item.plant_id || "").toLowerCase().includes(term);
      const inPlantingDate = (item.planting_date || "").toLowerCase().includes(term);
      const inStatus = (item.status || "").toLowerCase().includes(term);
      return (
        inCount ||
        inDaysGrown ||
        inGreenhouseId ||
        inPlantId ||
        inPlantingDate ||
        inStatus
      );
    });
  }, [filteredPlantedCrops, searchTerm]);

  // Filter users based on harvested status
  const harvestedFilteredCrops = useMemo(() => {
    return searchFilteredCrops.filter((crop) => {
      const statusLower = crop.status.toLowerCase();
      if (filterHarvested) {
        return statusLower === "harvested";
      } else if (filterReadyToHarvest) {
        return statusLower === "ready to harvest";
      } else {
        return statusLower !== "harvested" && statusLower !== "ready to harvest";
      }
    });
  }, [searchFilteredCrops, filterHarvested, filterReadyToHarvest]);

  // Sort crops by planting_date descending
  const sortedCrops = [...harvestedFilteredCrops].sort(
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

  let harvestedStatusText = "(Not Harvested Crops)";
  let harvestedStatusColor = "#FF6B6B";

  if (filterHarvested) {
    harvestedStatusText = "(Harvested Crops)";
    harvestedStatusColor = "#0A6644";
  } else if (filterReadyToHarvest) {
    harvestedStatusText = "(Ready to Harvest Crops)";
    harvestedStatusColor = "ORANGE"; // Or another suitable color
  }

  return (
    <Container maxWidth="xxl" sx={{ p: { xs: 2, sm: 3 } }}>
      {loading ? (
        <HarvestSkeliton />
      ) : (
        <Paper
          sx={{
            width: "100%",
            overflow: "hidden",
            borderRadius: "10px",
            backgroundColor: "#FFF",
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
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: "bold",
                  color: "#000",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                PLANTED CROPS
                {filterDescription && (
                  <span
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: "normal",
                      marginLeft: "10px",
                      color: "#000",
                    }}
                  >
                    ({filterDescription})
                  </span>
                )}
                <Typography
                  component="span"
                  sx={{
                    fontSize: { xs: "1rem", sm: "1rem", md: "1rem" },
                    color: harvestedStatusColor,
                    textAlign: "left",
                  }}
                >
                  {harvestedStatusText}
                </Typography>
              </Typography>
            </Box>
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
                      <SearchIcon
                        sx={{ fontSize: { xs: "1rem", sm: "1.2rem" }, color: "#000" }}
                      />
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{
                  style: { color: "#000" },
                }}
                sx={{
                  maxWidth: { xs: "100%", sm: "250px" },
                 
                }}
              />
              <FormControl
                variant="outlined"
                size="small"
                sx={{ width: { xs: "100%", sm: "auto" } }}
              >
                <InputLabel id="filter-label" sx={{ textTransform: "uppercase", color: "#000" }}>
                  FILTER
                </InputLabel>
                <Select
                  labelId="filter-label"
                  value={uiFilter}
                  label="FILTER"
                  onChange={handleFilterChange}
                  sx={{
                    textTransform: "uppercase",
                    color: "#000",
                  
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        backgroundColor: '#fff', // Background color of the dropdown
                      },
                    },
                  }}
                  inputProps={{
                    style: { color: "#fff" },
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
            <Table sx={{ minWidth: 650, backgroundColor: "#fff", borderSpacing: "0 10px" }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#06402B", borderRadius: "10px" }}>
                  {[
                    "GREENHOUSE",
                    "CROPS COUNT",
                    "DAYS OLD",
                    "DAYS INSIDE GREENHOUSE",
                    "DAYS GROWN",
                    "PLANTED DATE",
                    "STATUS",
                    "ACTION",
                  ].map((header) => (
                    <TableCell
                      key={header}
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        color: "#fff",
                        fontSize: { xs: "0.9rem", sm: "1rem" },
                        py: { xs: 2, sm: 2 },
                        textTransform: "uppercase",
                        borderBottom: 'none'
                      }}
                    >
                      {header === "STATUS" ? (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Typography component="span">STATUS</Typography>
                          <IconButton
                            ref={anchorRef}
                            id="composition-button"
                            aria-controls={open ? 'composition-menu' : undefined}
                            aria-expanded={open ? 'true' : undefined}
                            aria-haspopup="true"
                            onClick={handleToggle}
                            size="small"
                            sx={{ color: "#fff" }}
                          >
                            <ArrowDropDownIcon sx={{ fontSize: { xs: "1rem", sm: "1.2rem" } }} />
                          </IconButton>
                          <Popper
                            open={open}
                            anchorEl={anchorRef.current}
                            placement="bottom-start"
                            transition
                            disablePortal
                            sx={{ zIndex: 1500 }} // Add zIndex here
                          >
                            {({ TransitionProps }) => (
                              <Grow
                                {...TransitionProps}
                                style={{
                                  transformOrigin: 'center top',
                                  backgroundColor: '#fff',
                                  color: '#000',
                                  zIndex: 1,
                                }}
                              >
                                <Paper>
                                  <ClickAwayListener onClickAway={handleClose}>
                                    <MenuList
                                      autoFocusItem={open}
                                      id="composition-menu"
                                      aria-labelledby="composition-button"
                                      onKeyDown={handleListKeyDown}
                                    >
                                      <MenuItem onClick={(event) => { handleClose(event); handleStatusSelect("harvested"); }} sx={{ textTransform: 'uppercase' }}>Harvested</MenuItem>
                                      <MenuItem onClick={(event) => { handleClose(event); handleStatusSelect("not harvested"); }} sx={{ textTransform: 'uppercase' }}>Not Harvested</MenuItem>
                                      <MenuItem onClick={(event) => { handleClose(event); handleStatusSelect("ready to harvest"); }} sx={{ textTransform: 'uppercase' }}>Ready to Harvest</MenuItem>
                                    </MenuList>
                                  </ClickAwayListener>
                                </Paper>
                              </Grow>
                            )}
                          </Popper>
                        </Box>
                      ) : (
                        header
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedCrops.length > 0 ? (
                  sortedCrops
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((item, index) => (
                      <TableRow
                        key={`${item.plant_id}-${index}`}
                       
                      >
                        {[
                          item.greenhouse_id,
                          item.count,
                          item.seedlings_daysOld,
                          item.greenhouse_daysOld,
                          item.total_days_grown,
                          item.planting_date,
                          item.status.toUpperCase(),
                        ].map((value, idx) => (
                          <TableCell key={idx} align="center" sx={{ fontSize: { xs: "0.8rem", sm: "1rem" }, py: { xs: 1, sm: 1.5 }, color: '#000' }}>
                            {value}
                          </TableCell>
                        ))}

                        <TableCell align="center" sx={{ fontSize: { xs: "0.8rem", sm: "1rem" }, py: { xs: 1, sm: 1.5 }, borderBottom: 'none' }}>
                          <Button variant="contained" sx={{ backgroundColor: "#06402B", color: '#fff' }} size="small" onClick={() => setSelectedCrop(item)}>
                            VIEW MORE
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow
                    sx={{
                      
                      borderRadius: "10px",
                    }}
                  >
                    <TableCell colSpan={8} align="center" sx={{ borderBottom: 'none' }}>
                      <Typography variant="h7" color="#000">
                        {getNoDataAlertText(
                          appliedFilter,
                          customFrom,
                          customTo,
                          selectedMonth,
                          selectedYear
                        )}
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
              count={sortedCrops.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(event, newPage) => setPage(newPage)}
              rowsPerPageOptions={[rowsPerPage]}
              sx={{
                color: '#000  ', // Color of the pagination text
               
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
      {/* Details Modal */}
      {selectedCrop && (
        <PlantedCropDetailsModal
          open={Boolean(selectedCrop)}
          onClose={() => setSelectedCrop(null)}
          plantedCrop={selectedCrop}
        />
      )}
      <NutrientControllers />
      <SensorReadings />
    </Container>
  );
}

export default PlantedCrops;