//SALES
import React, { useState, useMemo, useEffect } from "react";
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
    Grid,
    Select,
    MenuItem,
    InputLabel,
    Modal,
    Divider,
    Button,
    Container,
    useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ViewListIcon from "@mui/icons-material/ViewList";
import TodayIcon from "@mui/icons-material/Today";
import HistoryIcon from "@mui/icons-material/History";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DateRangeIcon from "@mui/icons-material/DateRange";
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'; // Reven ue
import MoneyOffIcon from '@mui/icons-material/MoneyOff'; // Expenses
import AssessmentIcon from '@mui/icons-material/Assessment'; // Profit
import Metric from "../props/MetricSection";
import HarvestSkeliton from "../skelitons/HarvestSkeliton";
import { useFilteredSales } from "../hooks/SalesHooks";
import { useFilteredInventoryItems } from "../hooks/InventoryItemsHooks";
import { useItemInventory } from "../hooks/ItemInventoryHooks"; // Import the Item Inventory hook
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
function getFilterDescription(filter, customFrom, customTo, selectedMonth, selectedYear, selectedYearly) {
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
    if (filter === "yearly") {
        return `YEARLY: ${selectedYearly}`;
    }
    if (filter === "custom" && customFrom && customTo) {
        return `CUSTOM: ${formatDate(new Date(customFrom))} - ${formatDate(new Date(customTo))}`;
    }
    return "";
}

// Function to generate no-data alert text (for the header)
function getNoDataAlertText(filter, customFrom, customTo, selectedMonth, selectedYear, selectedYearly) {
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
    if (filter === "yearly") {
        return `NO DATA FOR YEARLY (${selectedYearly})`;
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
    { value: "yearly", label: "SELECT YEAR", icon: <DateRangeIcon fontSize="small" sx={{ mr: 1 }} /> },
    { value: "custom", label: "SELECT DATE", icon: <DateRangeIcon fontSize="small" sx={{ mr: 1 }} /> },
];

function Sales() {
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
    const [selectedYearly, setSelectedYearly] = useState(new Date().getFullYear());
    // Temporary states for modal changes
    const [tempCustomFrom, setTempCustomFrom] = useState(null);
    const [tempCustomTo, setTempCustomTo] = useState(null);
    const [tempSelectedMonth, setTempSelectedMonth] = useState(new Date().getMonth() + 1);
    const [tempSelectedYear, setTempSelectedYear] = useState(new Date().getFullYear());
    const [tempYear, setTempYear] = useState(new Date().getFullYear());
    // Modal open states
    const [openDateModal, setOpenDateModal] = useState(false);
    const [openMonthModal, setOpenMonthModal] = useState(false);
    const [openYearModal, setOpenYearModal] = useState(false);

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
        } else if (value === "yearly") {
            setUiFilter(value);
            setTempYear(selectedYearly);
            setOpenYearModal(true);
        }
        else {
            setUiFilter(value);
            setAppliedFilter(value);
            setCustomFrom(null);
            setCustomTo(null);
            setSelectedYearly(null);
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

    const handleApplyYearlyFilter = () => {
        setOpenYearModal(false);
        setSelectedYearly(tempYear);
        setAppliedFilter("yearly");
        setUiFilter("none");
        setPage(0);
    };

    // Disable APPLY button if custom dates are not both selected or if FROM is after TO
    const isApplyDisabled = !tempCustomFrom || !tempCustomTo || new Date(tempCustomFrom) > new Date(tempCustomTo);

    // Get filtered sales data from hook (using applied values)
    const { filteredSales, loading: salesLoading } = useFilteredSales({
        filterOption: appliedFilter,
        customFrom,
        customTo,
        selectedMonth,
        selectedYear,
        selectedYearly,
    });

    const { filteredInventoryItems, loading: inventoryItemsLoading } = useFilteredInventoryItems({
        filterOption: appliedFilter,
        customFrom,
        customTo,
        selectedMonth,
        selectedYear,
        selectedYearly,
    });

    const { itemInventory, loading: itemInventoryLoading } = useItemInventory({
        filterOption: appliedFilter,
        customFrom,
        customTo,
        selectedMonth,
        selectedYear,
        selectedYearly,
    });

    // Combine loading states
    const loading = salesLoading || inventoryItemsLoading || itemInventoryLoading;

    // Calculate total expenses from Nutrient Inventory and Item Inventory
    const totalNutrientInventoryExpenses = useMemo(() => {
        if (!filteredInventoryItems) return 0;
        return filteredInventoryItems.reduce((total, item) => total + parseFloat(item.total_price || 0), 0);
    }, [filteredInventoryItems]);

    const totalItemInventoryExpenses = useMemo(() => {
        if (!itemInventory) return 0;
        return itemInventory.reduce((total, item) => total + parseFloat(item.total_price || 0), 0);
    }, [itemInventory]);

    const totalExpenses = totalNutrientInventoryExpenses + totalItemInventoryExpenses;

    // Calculate total revenue from sales
    const totalRevenue = useMemo(() => {
        if (!filteredSales) return 0;
        return filteredSales.reduce(
            (total, sale) => total + parseFloat(sale.total_price || 0),
            0
        );
    }, [filteredSales]);

     // Apply search filtering
     const searchFilteredSales = useMemo(() => {
        if (!filteredSales) return []; // Return an empty array if filteredSales is undefined or null

        return filteredSales.filter((item) => {
            const term = searchTerm.toLowerCase();
            const inSaleId = String(item.sale_id || "").toLowerCase().includes(term);
            const inCropDescription = String(item.cropDescription || "").toLowerCase().includes(term);
            const inHarvestId = String(item.harvestId || "").toLowerCase().includes(term);
            const inCurrentPrice = String(item.currentPrice || "").toLowerCase().includes(term);
            const inOriginalPrice = String(item.originalPrice || "").toLowerCase().includes(term);
            const inSalesDate = String(item.salesDate || "").toLowerCase().includes(term); // Ensure salesDate is converted to string
            return inSaleId || inCropDescription || inHarvestId || inCurrentPrice || inOriginalPrice || inSalesDate;
        });
    }, [filteredSales, searchTerm]);

    // Sort sales by salesDate descending
   const sortedSales = useMemo(() => {
    if (!searchFilteredSales) return [];
    return [...searchFilteredSales].sort(
        (a, b) => {
            // Handle cases where created_at might be null or invalid
            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
            if (isNaN(dateA) || isNaN(dateB)) { // Fallback for invalid dates
                return isNaN(dateA) ? (isNaN(dateB) ? 0 : 1) : -1;
            }
            return dateB - dateA; // Descending
        }
    );
}, [searchFilteredSales]);

    // Compute the filter description text for header
    const filterDescription = getFilterDescription(
        appliedFilter,
        customFrom,
        customTo,
        selectedMonth,
        selectedYear,
        selectedYearly
    );

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const iconSize = isSmallScreen ? "3rem" : "4rem";

    return (
        <Container maxWidth="xxl" sx={{ p: { xs: 2, sm: 3 } }}>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                    <Metric
                        title="Total Revenue"
                        value={totalRevenue.toFixed(2)}
                        loading={loading}
                        icon={<AttachMoneyIcon sx={{ fontSize: iconSize, color: "#0A6644" }} />}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Metric
                        title="Total Expenses"
                        value={totalExpenses.toFixed(2)}
                        loading={loading}
                        icon={<MoneyOffIcon sx={{ fontSize: iconSize, color: "#0A6644" }} />}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Metric
                        title="Total Profit"
                        value={(totalRevenue - totalExpenses).toFixed(2)}
                        loading={loading}
                        icon={<AssessmentIcon sx={{ fontSize: iconSize, color: "#0A6644" }} />}
                    />
                </Grid>
            </Grid>
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
                    {/* Header with title, total amount, and search/filter controls */}
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
                            <Typography variant="h5" sx={{ fontWeight: "bold", color: "#000" }}>
                                SALES{" "}
                                {filterDescription && (
                                    <span style={{ fontSize: "0.8rem", fontWeight: "normal", marginLeft: "10px", color: "#000" }}>
                                        ({filterDescription})
                                    </span>
                                )}
                            </Typography>
                            {/* <Typography variant="subtitle1" sx={{ mt: 1, color: "#fff" }}>
                                Total Sales: {totalRevenue.toFixed(2)}
                            </Typography> */}
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
                                label="Search Sales"
                                variant="outlined"
                                size="small"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <SearchIcon sx={{ fontSize: { xs: "1rem", sm: "1.2rem" }, color: '#000' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                InputLabelProps={{
                                    style: { color: '#000' },
                                }}
                                sx={{ maxWidth: { xs: "100%", sm: "250px" }, }}
                            />
                            <FormControl variant="outlined" size="small" sx={{ width: { xs: "100%", sm: "auto" } }}>
                                <InputLabel id="filter-label" sx={{ textTransform: "uppercase", color: '#000' }}>
                                    FILTER
                                </InputLabel>
                                <Select
                                    labelId="filter-label"
                                    value={uiFilter}
                                    label="FILTER"
                                    onChange={handleFilterChange}
                                    sx={{
                                        textTransform: "uppercase", color: "#O00",

                                    }}

                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                backgroundColor: '#fff', // Background color of the dropdown
                                            },
                                        },
                                    }}
                                    inputProps={{
                                        style: { color: '#fff' },
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
                                    {[
                                        "Plant Name",
                                        "Crop Description",
                                        "Quantity",
                                        "Sold Price",
                                        "Original Price(pcs)",
                                        "Total Price",
                                        "User Name",
                                        "Sales Date",
                                    ].map((header) => (
                                        <TableCell
                                            key={header}
                                            align="center"
                                            sx={{
                                                fontWeight: "bold",
                                                color: "#fff",
                                                fontSize: { xs: "0.9rem", sm: "1rem" },
                                                py: { xs: 2, sm: 2 },

                                                borderBottom: 'none'
                                            }}
                                        >
                                            {header}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sortedSales.length > 0 ? (
                                    sortedSales
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((item, index) => (
                                            <TableRow key={`${item.sale_id}-${index}`}   >
                                                {[
                                                    item.plant_name,
                                                    (item.cropDescription || "N/A"),
                                                    item.quantity,
                                                    item.currentPrice,
                                                    item.originalPrice,
                                                    item.total_price,
                                                    item.name,
                                                    item.created_at,
                                                ].map((value, idx) => (
                                                    <TableCell key={idx} align="center" sx={{ fontSize: { xs: "0.8rem", sm: "1rem" }, py: { xs: 1, sm: 1.5 }, color: '#000' }}>
                                                        {value}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                ) : (
                                    <TableRow
                                        sx={{

                                            borderRadius: "10px",
                                        }}
                                    >
                                        <TableCell colSpan={9} align="center" sx={{ borderBottom: 'none' }}>
                                            <Typography variant="h7" color="#000" >
                                                {getNoDataAlertText(appliedFilter, customFrom, customTo, selectedMonth, selectedYear, selectedYearly)}
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
                            count={sortedSales.length}
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
                    <Modal open={openMonthModal} onClose={() => setOpenMonthModal(false)} aria-labelledby="sales-month-modal">
                        <Box sx={modalStyle}>
                            <Typography variant="h6" sx={{ mb: 2, textTransform: "uppercase" }}>
                                SELECT MONTH AND YEAR
                            </Typography>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel id="sales-month-label" sx={{ textTransform: "uppercase" }}>
                                    MONTH
                                </InputLabel>
                                <Select
                                    labelId="sales-month-label"
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
                                <InputLabel id="sales-year-label" sx={{ textTransform: "uppercase" }}>
                                    YEAR
                                </InputLabel>
                                <Select
                                    labelId="sales-year-label"
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

                    {/* Yearly Filter Modal */}
                    <Modal
                        open={openYearModal}
                        onClose={() => {
                            setOpenYearModal(false);
                            setUiFilter("all");
                        }}
                    >
                        <Box sx={{ ...modalStyle, p: 3, width: 300 }}>
                            <Typography variant="h6" sx={{ mb: 2, textTransform: "uppercase" }}>
                                SELECT YEAR
                            </Typography>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel id="readings-year-label" sx={{ textTransform: "uppercase" }}>
                                    YEAR
                                </InputLabel>
                                <Select
                                    labelId="readings-year-label"
                                    value={tempYear}
                                    label="YEAR"
                                    onChange={(e) => setTempYear(e.target.value)}
                                    sx={{
                                        textTransform: "uppercase", color: "#fff",
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#fff', // Default border color
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#fff', // Hovered border color
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#fff', // Focused border color
                                        },
                                        '& .MuiSvgIcon-root': { // Adjust the color of the dropdown arrow
                                            color: '#fff',
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
                                        style: { color: '#fff' },
                                    }}
                                >
                                    {Array.from({ length: 11 }, (_, i) => 2020 + i).map((year) => (
                                        <MenuItem key={year} value={year} sx={{ textTransform: "uppercase", color: "#000" }}>
                                            {year}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 3 }}>
                                <Button
                                    onClick={() => {
                                        setOpenYearModal(false);
                                        setUiFilter("all");
                                    }}
                                    color="secondary"
                                    size="small"
                                >
                                    CANCEL
                                </Button>
                                <Button onClick={handleApplyYearlyFilter} variant="contained" color="primary" size="small">
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

export default Sales;