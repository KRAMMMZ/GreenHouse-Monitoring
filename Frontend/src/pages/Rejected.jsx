import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  useTheme,
  useMediaQuery,
  Stack,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ViewListIcon from "@mui/icons-material/ViewList";
import TodayIcon from "@mui/icons-material/Today";
import DateRangeIcon from "@mui/icons-material/DateRange";
import CalendarMonthIcon from "@mui/icons-material/CalendarViewMonth";
import CalendarViewMonthIcon from "@mui/icons-material/CalendarViewMonth";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // Sold Icon
import CancelIcon from '@mui/icons-material/Cancel'; // Not Sold Icon
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import axios from 'axios'; // Import Axios
import Swal from 'sweetalert2'; // Import SweetAlert
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import HarvestSkeliton from "../skelitons/HarvestSkeliton";
import { useRejectedTableItems } from "../hooks/RejectionHooks";
import { styled } from '@mui/material/styles';
import RejectionDetailsModal from "../components/RejectionDetailsModal"; // Import the modal

// Helper function to format a date into a short, readable format. 
const formatDate = (date) =>
  date.toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" });

// Returns a descriptive text for the filter applied.
const getFilterDescription = (filter, customFrom, customTo, selectedMonth, selectedYear) => {
  const today = new Date();
  switch (filter) {
    case "ALL":
      return "";
    case "CURRENT DAY":
      return `CURRENT DAY: ${formatDate(today)}`;
    case "LAST 7 DAYS": {
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 6);
      return `LAST 7 DAYS: ${formatDate(startDate)} - ${formatDate(today)}`;
    }
    case "THIS MONTH": {
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
  };
};

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

const Rejected = () => {
  const { rejectItems, rejectLoading, fetchRejectItems } = useRejectedTableItems();  //Use fetchRejectItems
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [rejectPage, setRejectPage] = useState(0);
  const rowsPerPage = 10;
  const [rejectSearchTerm, setRejectSearchTerm] = useState("");
    const [showSoldItems, setShowSoldItems] = useState(false);  // State to control display of Sold items

  const [rejectFilter, setRejectFilter] = useState("ALL");

  const [openDateModal, setOpenDateModal] = useState(false);
  const [tempCustomFrom, setTempCustomFrom] = useState(null);
  const [tempCustomTo, setTempCustomTo] = useState(null);
  const [appliedCustomFrom, setAppliedCustomFrom] = useState(null);
  const [appliedCustomTo, setAppliedCustomTo] = useState(null);

  const currentMonth = (new Date().getMonth() + 1).toString();
  const currentYear = new Date().getFullYear().toString();
  const [openMonthModal, setOpenMonthModal] = useState(false);
  const [tempSelectedMonth, setTempSelectedMonth] = useState(currentMonth);
  const [tempSelectedYear, setTempSelectedYear] = useState(currentYear);
  const [appliedSelectedMonth, setAppliedSelectedMonth] = useState(currentMonth);
  const [appliedSelectedYear, setAppliedSelectedYear] = useState(currentYear);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedRejection, setSelectedRejection] = useState(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [currentPrice, setCurrentPrice] = useState("");
  const [newPrice, setNewPrice] = useState("");

  // New state to manage local status
  const [localRejectItems, setLocalRejectItems] = useState([]);

  useEffect(() => {
    // Initialize local state when rejectItems are fetched
    setLocalRejectItems(rejectItems);
  }, [rejectItems]);

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

  const filterDescription = getFilterDescription(
    rejectFilter,
    appliedCustomFrom,
    appliedCustomTo,
    appliedSelectedMonth,
    appliedSelectedYear
  );

  const filteredRejectItems = useMemo(() => {
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
          const pastDate = new Date(today);
          pastDate.setDate(today.getDate() - 6);
          return itemDate >= pastDate && itemDate <= today;
        }
        case "THIS MONTH":
          return itemDate.getMonth() === today.getMonth() && itemDate.getFullYear() === today.getFullYear();
        case "CHOOSE DATE": {
          if (!appliedCustomFrom || !appliedCustomTo) return true;
          const adjustedCustomTo = new Date(appliedCustomTo);
          adjustedCustomTo.setHours(23, 59, 59, 999);
          return itemDate >= appliedCustomFrom && itemDate <= adjustedCustomTo;
        }
        case "SELECT MONTH": {
          if (!appliedSelectedMonth || !appliedSelectedYear) return true;
          return (
            itemDate.getMonth() + 1 === parseInt(appliedSelectedMonth, 10) &&
            itemDate.getFullYear() === parseInt(appliedSelectedYear, 10)
          );
        }
        default:
          return true;
      }
    };

    const searchTerm = rejectSearchTerm.toLowerCase();
    return [...localRejectItems] // Use localRejectItems for filtering
      .filter(item => showSoldItems ? item.status === "Sold" : item.status === "Not Sold") // Conditionally filter by status
      .sort((a, b) => new Date(b.rejection_date) - new Date(a.rejection_date))
      .filter((item) => {
        const dateMatch = filterByDate(item);
        const plantName = item.plant_name ? item.plant_name.toLowerCase() : "";
        const typeField = item.type ? item.type.toLowerCase() : "";
        const userField = item.name ? item.name.toLowerCase() : "";
        return (
          dateMatch &&
          (plantName.includes(searchTerm) || typeField.includes(searchTerm) || userField.includes(searchTerm))
        );
      });
  }, [
    localRejectItems, // Use localRejectItems as a dependency
    rejectFilter,
    rejectSearchTerm,
    appliedCustomFrom,
    appliedCustomTo,
    appliedSelectedMonth,
    appliedSelectedYear,
    showSoldItems
  ]);


  const handleFilterChange = (e) => {
    const value = e.target.value;
    if (value === "CHOOSE DATE") {
      setOpenDateModal(true);
    } else if (value === "SELECT MONTH") {
      setOpenMonthModal(true);
    } else {
      setRejectFilter(value);
    }
  };

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

  const getNoDataMessage = () => {
    const today = new Date();
    const longDateFormat = { month: "long", day: "numeric", year: "numeric" };

    switch (rejectFilter) {
      case "CURRENT DAY":
        return `No data for current day (${today.toLocaleDateString("default", longDateFormat)})`;
      case "LAST 7 DAYS": {
        const pastDate = new Date(today);
        pastDate.setDate(today.getDate() - 6);
        const formattedStart = pastDate.toLocaleDateString("default", longDateFormat);
        const formattedEnd = today.toLocaleDateString("default", longDateFormat);
        return `No data for last 7 days (${formattedStart} - ${formattedEnd})`;
      }
      case "THIS MONTH":
        return `No data for this month (${today.toLocaleDateString("default", { month: "long", year: "numeric" })})`;
      case "CHOOSE DATE": {
        const from = appliedCustomFrom ? appliedCustomFrom.toLocaleDateString("default", longDateFormat) : "";
        const to = appliedCustomTo ? appliedCustomTo.toLocaleDateString("default", longDateFormat) : "";
        return `No data for chosen date range (${from} - ${to})`;
      }
      case "SELECT MONTH": {
        const monthIndex = parseInt(appliedSelectedMonth, 10) - 1;
        const dateForMonth = new Date(appliedSelectedYear, monthIndex);
        return `No data for selected month (${dateForMonth.toLocaleDateString("default", {
          month: "long",
          year: "numeric",
        })})`;
      }
      default:
        return "NO REJECTED DATA";
    }
  };

  const handleEditClick = (item) => {
    setSelectedItemId(item.rejection_id);
    setCurrentPrice(item.price);
    setNewPrice(item.price); // Initialize new price with the current price
    setEditModalOpen(true);
  };

  const handleView = (item) => {
    setSelectedRejection(item);
    setViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setSelectedRejection(null);
  };

  const handleEditClose = () => {
    setEditModalOpen(false);
    setSelectedItemId(null);
    setCurrentPrice("");
    setNewPrice("");
  };

  const handleNewPriceChange = (event) => {
    setNewPrice(event.target.value);
  };

    const handlePriceUpdate = useCallback(async (id, newPrice) => {
        try {
            // Use PATCH to match backend
            const response = await axios.patch(
                `http://localhost:3001/reason_for_rejection/${id}`,
                { price: newPrice }, // Sending price as a property of an object
                {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true,
                }
            );

            if (response.status >= 200 && response.status < 300) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Price updated successfully!',
                }).then(() => {
                    fetchRejectItems(); // Call fetchRejectItems directly
                    handleEditClose();
                });
            } else {
                console.warn("Failed to update price:", response);
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: `Failed to update price. Status: ${response.status}`,
                });
            }

        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: `Failed to update price. Check console for details. ${err.message}`,
            });
        }
    }, [fetchRejectItems, handleEditClose]);

    const handleUpdatePrice = async (itemId, newPrice) => {
       

        await handlePriceUpdate(itemId, newPrice);

       // handleEditClose();  Remove this line because it is being called in callback function
    };
    // Function to handle status change
    const handleStatusChange = (rejectionId) => {
      setLocalRejectItems((prevItems) =>
        prevItems.map((item) =>
          item.rejection_id === rejectionId
            ? { ...item, status: item.status === "Not Sold" ? "Sold" : "Not Sold" }
            : item
        )
      );

      // OPTIONAL:  Make API call here to update the status on the backend.
      //  Make sure you handle success/error scenarios and update UI accordingly.
    };
    const handleToggleSoldItems = () => {
        setShowSoldItems(!showSoldItems);
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

  const tableHeaderCellTypographyProps = useMemo(
    () => ({
      fontSize: isSmallScreen ? "0.75rem" : "1rem",
      fontWeight: "bold",
    }),
    [isSmallScreen]
  );

  const isXs = useMediaQuery(theme.breakpoints.down("xs")); // Extra small screens

  const tableColumns = useMemo(() => {
    const baseColumns = [
      "Plant Name",
      "Type",
      "Quantity",
      "Price",
      "Deduction Rate(%)",
      "Total Price",
      "Comments",
      "Rejection Date",
      <>
      Status
       <IconButton
                        aria-label="toggle sold"
                        color="inherit"
                         size="small"
                        onClick={handleToggleSoldItems}
                        sx={{ ml: 1, color: '#fff' }}
                      >
                        <ArrowDropDownIcon  />
                      </IconButton>
      </>, // New Status Column
      "Actions" // Added Actions header
    ];

    // Remove columns for extra small screens
    if (isXs) {
      return baseColumns.filter(column =>
          column !== "Comments" && column !== "Deduction Rate(%)" && column !== "Rejection Date" && column !== "Type" // Keep Plant Name, Quantity, Price, Status, and Actions
      );
    }
    return baseColumns;
  }, [isXs, handleToggleSoldItems]);

  return (
    <Container maxWidth="xxl" sx={{ p: { xs: 2, sm: 3 } }}>
      <Paper
        sx={{
          p: 2,
          borderRadius: 2,
          boxShadow: 15,
          mt: 3,
          backgroundColor: "#fff", // Match header background
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            color: "#000", // Text color for header content
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
              onChange={(e) => {
                setRejectSearchTerm(e.target.value);
                setRejectPage(0);
              }}
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
                width: { xs: "100%", sm: "100%", md: "auto" },
                
              }}
            />
            <FormControl variant="outlined" size="small" sx={{ width: { xs: "100%", sm: "100%", md: "auto" } }}>
              <InputLabel >Filter</InputLabel>
              <Select
                label="Filter"
                value={rejectFilter}
                onChange={handleFilterChange}
                sx={{
                  color: "#000",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#000",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#000",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#000",
                  },
                  "& .MuiSvgIcon-root": {
                    color: "#000",
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
                <MenuItem value="ALL" >
                  <ViewListIcon fontSize="small" sx={{ mr: 1 }} /> ALL
                </MenuItem>
                <MenuItem value="CURRENT DAY" >
                  <TodayIcon fontSize="small" sx={{ mr: 1 }} /> CURRENT DAY
                </MenuItem>
                <MenuItem value="LAST 7 DAYS" >
                  <DateRangeIcon fontSize="small" sx={{ mr: 1 }} /> LAST 7 DAYS
                </MenuItem>
                <MenuItem value="THIS MONTH" >
                  <CalendarMonthIcon fontSize="small" sx={{ mr: 1 }} /> THIS MONTH
                </MenuItem>
                <MenuItem value="SELECT MONTH" >
                  <CalendarViewMonthIcon fontSize="small" sx={{ mr: 1 }} /> SELECT MONTH
                </MenuItem>
                <MenuItem value="CHOOSE DATE" >
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
            <TableContainer sx={{ borderBottom: "1px solid #999" }}>
              <Table sx={{ minWidth: 650, backgroundColor: "#fff", borderSpacing: "0 10px", }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#06402B", }}>
                    {tableColumns.map((header) => (
                      <TableCell
                        key={header}
                        align="center"
                        sx={{ fontWeight: "bold", fontSize: "1.1rem", color: "#fff", borderBottom: 'none' }}
                      >
                       <Typography {...tableHeaderCellTypographyProps}>{header}</Typography>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRejectItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} align="center" sx={{ borderBottom: 'none' }}>
                        <Typography variant="h8">{getNoDataMessage().toUpperCase()}</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRejectItems
                      .slice(rejectPage * rowsPerPage, rejectPage * rowsPerPage + rowsPerPage)
                      .map((item) => (
                        <StyledTableRow key={item.rejection_id}>
                          <StyledTableCell align="center" >{item.plant_name}</StyledTableCell>
                          {!isXs && <StyledTableCell align="center" >{item.type}</StyledTableCell>}
                          <StyledTableCell align="center" >{item.quantity}</StyledTableCell>
                          <StyledTableCell align="center" >{item.price}</StyledTableCell>
                          {!isXs && <StyledTableCell align="center" >{item.deduction_rate}%</StyledTableCell>}
                          <StyledTableCell align="center" >{item.total_price}</StyledTableCell>
                          {!isXs && <StyledTableCell align="center" >{item.comments}</StyledTableCell>}
                          {!isXs && <StyledTableCell align="center" >{item.rejection_date}</StyledTableCell>}
                          <StyledTableCell align="center">

                              {item.status === 'Not Sold' ? (
                                <CancelIcon color="error" />
                              ) : (
                                <CheckCircleIcon color="success" />
                              )}

                            {item.status}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            <Stack direction="row" spacing={1} justifyContent="center">
                              {item.status === "Not Sold" ? (
                                <>
                                  <Button size="small" variant="contained" color="warning" onClick={() => handleEditClick(item)}>
                                    Edit
                                  </Button>
                                  <Button size="small" variant="contained" color="primary" onClick={() => handleView(item)}>
                                    View
                                  </Button>
                                </>
                              ) : (
                                <Button size="small" variant="contained" color="primary" onClick={() => handleView(item)}>
                                  View
                                </Button>
                              )}
                            </Stack>
                          </StyledTableCell>
                        </StyledTableRow>
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
              sx={{
                color: '#000', // Color of the pagination text
                '& .MuiSvgIcon-root': { // Adjust the color of the pagination arrows
                  color: '#000',
                },
                '& .MuiTablePagination-selectLabel': {
                  color: '#000', // Color of the "Rows per page" label
                },
                '& .MuiTablePagination-displayedRows': {
                  color: '#000', // Color of the displayed rows text
                },
                '& .MuiSelect-select': {
                  color: '#000', // Color of the select text
                },
              }}
            />
          </Box>
        </Box>
      </Paper>

        <RejectionDetailsModal
          open={viewModalOpen}
          onClose={handleCloseViewModal}
          rejection={selectedRejection}
        />

      <Modal
        open={editModalOpen}
        onClose={handleEditClose}
        aria-labelledby="edit-modal-title"
        aria-describedby="edit-modal-description"
      >
        <Box sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          border: "2px solid #000",
          boxShadow: 24,
          p: 4,
        }}>
          <Typography id="edit-modal-title" variant="h6" component="h2">
            Update Price
          </Typography>
          <Typography id="edit-modal-description" sx={{ mt: 2 }}>
            Current Price:
          </Typography>
          <TextField
            fullWidth
            margin="normal"
            value={currentPrice}
            disabled // Disable the current price field
          />
          <Typography id="edit-modal-description" sx={{ mt: 2 }}>
            New Price:
          </Typography>
          <TextField
            fullWidth
            margin="normal"
          
            onChange={handleNewPriceChange}
            type="number" // Suggest numeric input
          />
          <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
            <Button onClick={handleEditClose} color="secondary">
              Cancel
            </Button>
            <Button onClick={() => handleUpdatePrice(selectedItemId, newPrice)} color="primary" variant="contained">
              Update
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Modal open={openDateModal} onClose={() => setOpenDateModal(false)}>
        <Box sx={{ ...modalStyle, backgroundColor: "#fff" }}>
          <Typography variant="h6" >
            Choose Date Range
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="FROM"
              value={tempCustomFrom}
              onChange={(newValue) => setTempCustomFrom(newValue)}
              renderInput={(params) => <TextField {...params} fullWidth  />}
            />
            <Divider sx={{ my: 2, bgcolor: "grey.300" }} />
            <DatePicker
              label="TO"
              value={tempCustomTo}
              onChange={(newValue) => setTempCustomTo(newValue)}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </LocalizationProvider>
          <Divider sx={{ my: 1, bgcolor: "grey.300" }} />
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button onClick={() => setOpenDateModal(false)} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleApplyCustomDates} variant="contained" color="primary" disabled={isApplyDisabled}>
              Apply
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal open={openMonthModal} onClose={() => setOpenMonthModal(false)} aria-labelledby="hardware-month-modal">
        <Box sx={{ ...modalStyle, backgroundColor: "#fff" }}>
          <Typography variant="h6" >
            Select Month and Year
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="hardware-month-label" >Month</InputLabel>
            <Select
              labelId="hardware-month-label"
              value={tempSelectedMonth}
              label="Month"
              onChange={(e) => setTempSelectedMonth(e.target.value)}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <MenuItem key={i + 1} value={i + 1} >
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