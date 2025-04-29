import React, { useState, useMemo } from "react";
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
import FilterListIcon from "@mui/icons-material/FilterList";
import ViewListIcon from "@mui/icons-material/ViewList";
import TodayIcon from "@mui/icons-material/Today";
import HistoryIcon from "@mui/icons-material/History";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DateRangeIcon from "@mui/icons-material/DateRange";
import EventIcon from "@mui/icons-material/Event";
import HomeIcon from "@mui/icons-material/Home";
import LocalFloristIcon from "@mui/icons-material/LocalFlorist";
import HarvestSkeliton from "../skelitons/HarvestSkeliton";
import { useFilteredNutrientControllers } from "../hooks/NutrientControllerHooks";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

// Styles (moved outside the component for better readability and to avoid recreation on every render)
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

const headerTableCellSX = {
    fontWeight: "bold",
    color: "#fff",
    fontSize: { xs: "0.9rem", sm: "1rem" },
    py: { xs: 2, sm: 2 },
    textTransform: "uppercase",
    borderBottom: "none",
};

const tableCellSX = {
    fontSize: { xs: "0.8rem", sm: "1rem" },
    py: { xs: 1, sm: 1.5 },
    color: "#000",
     
};

const paperSX = {
    width: "100%",
    overflow: "hidden",
    borderRadius: "10px",
    backgroundColor: "#FFF",
    boxShadow: 15,
    p: { xs: 2, sm: 3 },
    mb: { xs: 3, sm: 5 },
    mt: { xs: 2, sm: 3 },
};

const tableRowSX = {
     
};

const paginationSX = {
    color: "#000", // Color of the pagination text
    
};

// Utility function for consistent date formatting
const formatDate = (date) => date.toLocaleDateString();

// Function to generate filter description text (for the header)
const getFilterDescription = (filter, customFrom, customTo, selectedMonth, selectedYear) => {
    if (filter === "all" || filter === "none") return "";
    const today = new Date();
    switch (filter) {
        case "currentDay":
            return `CURRENT DAY: ${formatDate(today)}`;
        case "last7Days":
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - 7);
            return `LAST 7 DAYS: ${formatDate(startDate)} - ${formatDate(endDate)}`;
        case "currentMonth":
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            return `CURRENT MONTH: ${formatDate(firstDayOfMonth)} - ${formatDate(lastDayOfMonth)}`;
        case "selectMonth":
            const firstDay = new Date(selectedYear, selectedMonth - 1, 1);
            const lastDay = new Date(selectedYear, selectedMonth, 0);
            return `SELECT MONTH: ${formatDate(firstDay)} - ${formatDate(lastDay)}`;
        case "custom":
            if (customFrom && customTo) {
                return `CUSTOM: ${formatDate(new Date(customFrom))} - ${formatDate(new Date(customTo))}`;
            }
            break;
        default:
            return "";
    }
    return "";
};

// Function to generate no-data alert text based on active filter
const getNoDataAlertText = (filter, customFrom, customTo, selectedMonth, selectedYear) => {
    const today = new Date();
    switch (filter) {
        case "currentDay":
            return `NO DATA FOR CURRENT DAY (${formatDate(today)})`;
        case "last7Days":
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - 7);
            return `NO DATA FOR LAST 7 DAYS (${formatDate(startDate)} - ${formatDate(endDate)})`;
        case "currentMonth":
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            return `NO DATA FOR CURRENT MONTH (${formatDate(firstDayOfMonth)} - ${formatDate(lastDayOfMonth)})`;
        case "selectMonth":
            const firstDay = new Date(selectedYear, selectedMonth - 1, 1);
            const lastDay = new Date(selectedYear, selectedMonth, 0);
            return `NO DATA FOR SELECT MONTH (${formatDate(firstDay)} - ${formatDate(lastDay)})`;
        case "custom":
            if (customFrom && customTo) {
                return `NO DATA FOR CUSTOM (${formatDate(new Date(customFrom))} - ${formatDate(new Date(customTo))})`;
            }
            break;
        default:
            return "NO DATA AVAILABLE";
    }
    return "NO DATA AVAILABLE";
};

// Define filter options with corresponding icons. The "none" option is disabled.
const filterOptions = [
    { value: "none", label: "SELECT FILTER", icon: <FilterListIcon fontSize="small" sx={{ mr: 1 }} />, disabled: true },
    { value: "all", label: "ALL DATA", icon: <ViewListIcon fontSize="small" sx={{ mr: 1 }} /> },
    { value: "currentDay", label: "CURRENT DAY", icon: <TodayIcon fontSize="small" sx={{ mr: 1 }} /> },
    { value: "last7Days", label: "LAST 7 DAYS", icon: <HistoryIcon fontSize="small" sx={{ mr: 1 }} /> },
    { value: "currentMonth", label: "CURRENT MONTH", icon: <CalendarMonthIcon fontSize="small" sx={{ mr: 1 }} /> },
    { value: "selectMonth", label: "SELECT MONTH", icon: <DateRangeIcon fontSize="small" sx={{ mr: 1 }} /> },
    { value: "custom", label: "SELECT DATE", icon: <EventIcon fontSize="small" sx={{ mr: 1 }} /> },
];

function NutrientControllers() {
    const [page, setPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [uiFilter, setUiFilter] = useState("all");
    const [appliedFilter, setAppliedFilter] = useState("all");
    const [customFrom, setCustomFrom] = useState(null);
    const [customTo, setCustomTo] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [tempCustomFrom, setTempCustomFrom] = useState(null);
    const [tempCustomTo, setTempCustomTo] = useState(null);
    const [tempSelectedMonth, setTempSelectedMonth] = useState(new Date().getMonth() + 1);
    const [tempSelectedYear, setTempSelectedYear] = useState(new Date().getFullYear());
    const [openDateModal, setOpenDateModal] = useState(false);
    const [openMonthModal, setOpenMonthModal] = useState(false);
    const [greenhouseFilter, setGreenhouseFilter] = useState("all");
    const [plantFilter, setPlantFilter] = useState("all");

    const { filteredNutrientControllers, loading } = useFilteredNutrientControllers({
        filterOption: appliedFilter,
        customFrom,
        customTo,
        selectedMonth: appliedFilter === "selectMonth" ? selectedMonth : null,
        selectedYear: appliedFilter === "selectMonth" ? selectedYear : null,
    });

    const uniqueGreenhouses = useMemo(() => Array.from(new Set(filteredNutrientControllers.map(item => item.greenhouse_id).filter(Boolean))), [filteredNutrientControllers]);
    const uniquePlants = useMemo(() => Array.from(new Set(filteredNutrientControllers.map(item => item.plant_name).filter(Boolean))), [filteredNutrientControllers]);

    const sortedControllers = useMemo(() => {
        const searchFilteredControllers = filteredNutrientControllers.filter(item => {
            const term = searchTerm.toLowerCase();
            return (
                String(item.greenhouse_id || "").toLowerCase().includes(term) ||
                String(item.controller_id || "").toLowerCase().includes(term) ||
                String(item.solution_type || "").toLowerCase().includes(term) ||
                String(item.dispensed_amount || "").toLowerCase().includes(term) ||
                String(item.dispensed_time || "").toLowerCase().includes(term) ||
                String(item.activated_by || "").toLowerCase().includes(term)
            );
        }).filter(item =>
            (greenhouseFilter === "all" || item.greenhouse_id === greenhouseFilter) &&
            (plantFilter === "all" || item.plant_id === plantFilter)
        ).sort((a, b) => new Date(b.dispensed_time) - new Date(a.dispensed_time));
        return searchFilteredControllers;
    }, [filteredNutrientControllers, searchTerm, greenhouseFilter, plantFilter]);

    const totalDispensedAmount = useMemo(() => sortedControllers.reduce((total, controller) => total + parseFloat(controller.dispensed_amount || 0), 0), [sortedControllers]);

    const filterDescription = getFilterDescription(appliedFilter, customFrom, customTo, selectedMonth, selectedYear);
    const isApplyDisabled = !tempCustomFrom || !tempCustomTo || new Date(tempCustomFrom) > new Date(tempCustomTo);
    const rowsPerPage = 10;
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setPage(0);
    };

    const handleFilterChange = (e) => {
        const value = e.target.value;
        setPage(0);
        switch (value) {
            case "selectMonth":
                setUiFilter(value);
                setTempSelectedMonth(selectedMonth);
                setTempSelectedYear(selectedYear);
                setOpenMonthModal(true);
                break;
            case "custom":
                setUiFilter(value);
                setTempCustomFrom(customFrom);
                setTempCustomTo(customTo);
                setOpenDateModal(true);
                break;
            default:
                setUiFilter(value);
                setAppliedFilter(value);
                setCustomFrom(null);
                setCustomTo(null);
                break;
        }
    };

    const handleApplyCustomDates = () => {
        setOpenDateModal(false);
        setCustomFrom(tempCustomFrom);
        setCustomTo(tempCustomTo);
        setAppliedFilter("custom");
        setUiFilter("none");
        setPage(0);
    };

    const handleApplySelectedMonth = () => {
        setOpenMonthModal(false);
        setSelectedMonth(tempSelectedMonth);
        setSelectedYear(tempSelectedYear);
        setAppliedFilter("selectMonth");
        setUiFilter("none");
        setPage(0);
    };

    const renderTextField = (label, value, onChange) => (
        <TextField
            fullWidth
            label={label}
            variant="outlined"
            size="small"
            value={value}
            onChange={onChange}
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
            sx={{
                maxWidth: { xs: "100%", sm: "250px" },
                
            }}
        />
    );

    const renderSelectField = (labelId, value, label, onChange, menuItems, icon = null) => (
        <FormControl variant="outlined" size="small" sx={{ minWidth: { xs: "100%", sm: "150px" } }}>
            <InputLabel id={labelId} sx={{ textTransform: "uppercase", color: '#000' }}>
                {label}
            </InputLabel>
            <Select
                labelId={labelId}
                value={value}
                label={label}
                onChange={onChange}
                sx={{
                    textTransform: "uppercase", color: "#000",
                   
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
                {menuItems.map(item => (
                    <MenuItem key={item.value} value={item.value} sx={{ textTransform: "uppercase", color: "#000" }}>
                        {item.icon && <>{item.icon}</>}
                        {item.label}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );

    const renderTableCells = (item) => {
        return [
            item.greenhouse_id,
            item.plant_id,
            item.solution_type.toUpperCase(),
            item.dispensed_amount,
            item.dispensed_time,
            item.activated_by.toUpperCase(),
        ].map((value, idx) => (
            <TableCell key={idx} align="center" sx={tableCellSX}>
                {value}
            </TableCell>
        ));
    };

    return (
        <> 
            {loading ? (
                <HarvestSkeliton />
            ) : (
                <Paper sx={paperSX}>
                    {/* Header with title, total amount, and search/filter controls */}
                    <Box sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        justifyContent: "space-between",
                        alignItems: { xs: "flex-start", sm: "center" },
                        gap: 2,
                        mb: { xs: 2, sm: 3, md: 2 },
                    }}>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: "bold", color: "#000" }}>
                                NUTRIENT CONTROLS{" "}
                                {filterDescription && (
                                    <span style={{ fontSize: "0.8rem", fontWeight: "normal", marginLeft: "10px", color: "#000" }}>
                                        ({filterDescription})
                                    </span>
                                )}
                            </Typography>
                            <Typography variant="subtitle1" sx={{ mt: 1, color: "#000" }}>
                                Total Dispensed Amount: {totalDispensedAmount.toFixed(2)}
                            </Typography>
                        </Box>
                        <Box sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            alignItems: "center",
                            gap: 2,
                            width: { xs: "100%", sm: "auto" },
                        }}>

                            {renderTextField("Search Controllers", searchTerm, handleSearchChange)}

                            {renderSelectField(
                                "filter-label",
                                uiFilter,
                                "FILTER",
                                handleFilterChange,
                                filterOptions.map(option => ({
                                    value: option.value,
                                    label: option.label,
                                    icon: option.icon,
                                    disabled: option.disabled
                                }))
                            )}

                            {renderSelectField(
                                "greenhouse-filter-label",
                                greenhouseFilter,
                                "GREENHOUSE NO.",
                                (e) => { setGreenhouseFilter(e.target.value); setPage(0); },
                                [{ value: "all", label: "ALL", icon: <HomeIcon fontSize="small" sx={{ mr: 1 }} /> }, ...uniqueGreenhouses.map(gh => ({ value: gh, label: gh }))],
                                <HomeIcon fontSize="small" sx={{ mr: 1 }} />
                            )}

                            {renderSelectField(
                                "plant-filter-label",
                                plantFilter,
                                "PLANT NAME",
                                (e) => { setPlantFilter(e.target.value); setPage(0); },
                                [{ value: "all", label: "ALL", icon: <LocalFloristIcon fontSize="small" sx={{ mr: 1 }} /> }, ...uniquePlants.map(plant => ({ value: plant, label: plant }))],
                                <LocalFloristIcon fontSize="small" sx={{ mr: 1 }} />
                            )}

                        </Box>
                    </Box>

                    {/* Table */}
                    <TableContainer sx={{ overflowX: "auto", borderBottom:"1px solid #999" }}>
                        <Table sx={{ minWidth: 650, backgroundColor: "#fff" , borderSpacing: "0 10px", }}>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: "#06402B", borderRadius: "10px" }}>
                                    {[
                                        "GREENHOUSE",
                                        "PLANT ID",
                                        "TYPE",
                                        "DISPENSED AMOUNT",
                                        "DISPENSED TIME",
                                        "ACTIVATED BY",
                                    ].map(header => (
                                        <TableCell key={header} align="center" sx={headerTableCellSX}>
                                            {header}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sortedControllers.length > 0 ? (
                                    sortedControllers
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((item, index) => (
                                            <TableRow key={`${item.controller_id}-${index}`} hover sx={tableRowSX}>
                                                {renderTableCells(item)}
                                            </TableRow>
                                        ))
                                ) : (
                                    <TableRow sx={tableRowSX}>
                                        <TableCell colSpan={9} align="center"  >
                                            <Typography variant="h7" color="#000">
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
                            count={sortedControllers.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={(event, newPage) => setPage(newPage)}
                            rowsPerPageOptions={[rowsPerPage]}
                            sx={paginationSX}
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
                    <Modal open={openMonthModal} onClose={() => setOpenMonthModal(false)} aria-labelledby="nutrient-controllers-month-modal">
                        <Box sx={modalStyle}>
                            <Typography variant="h6" sx={{ mb: 2, textTransform: "uppercase" }}>
                                SELECT MONTH AND YEAR
                            </Typography>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel id="controllers-month-label" sx={{ textTransform: "uppercase" }}>
                                    MONTH
                                </InputLabel>
                                <Select
                                    labelId="controllers-month-label"
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
                                <InputLabel id="controllers-year-label" sx={{ textTransform: "uppercase" }}>
                                    YEAR
                                </InputLabel>
                                <Select
                                    labelId="controllers-year-label"
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
      </>
    );
}

export default NutrientControllers;