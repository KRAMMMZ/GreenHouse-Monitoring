import React, { useState, useMemo } from "react";
import {
  Container,
  Paper,
  Box,
  Typography,
  Table,
  TableRow,
  TableCell,
  TableContainer,
  TablePagination,
  Alert,
  Grid,
  InputAdornment,
  useMediaQuery,
  Button,
  TableBody,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useItemInventory } from "../hooks/ItemInventoryHooks";
import HarvestSkeliton from "../skelitons/HarvestSkeliton";
import { useActivityLogs } from "../hooks/AdminLogsHooks";
import Metric from "../props/MetricSection";
import { useContainerInventory } from "../hooks/ContainerInventoryHooks";
import DashboardSkeliton from "../skelitons/DashboardSkeliton";
import ItemInventory from "../components/InventoryItems";
import { styled } from '@mui/material/styles';

// Icons
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ScienceIcon from "@mui/icons-material/Science";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import AddIcon from "@mui/icons-material/Add";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LocalDrinkIcon from "@mui/icons-material/LocalDrink";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
 
import TodayIcon from "@mui/icons-material/Today";
import HistoryIcon from "@mui/icons-material/History";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DateRangeIcon from "@mui/icons-material/DateRange";
import EventIcon from "@mui/icons-material/Event";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
 
// REFERENCE ICONS
import ViewListIcon from '@mui/icons-material/ViewList';

// Modal component
import InventoryModal from "../components/AddInventoryModal";


// Styled TableCell component
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  color: '#000',
  
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

const Inventory = () => {
  // Fetch data
  const { itemInventory, itemInventoryLoading } = useItemInventory();
  const { inventoryLogs, nutrientInventoryLogs, logsLoading, logsError } = useActivityLogs();
  const { containerInventory, containerInventoryLoading } = useContainerInventory();

  // Local states
  const [itemPage, setItemPage] = useState(0);
  const [logsPage, setLogsPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [uiFilter, setUiFilter] = useState("all");
  const [logFilter, setLogFilter] = useState("ALL"); // "ALL", "NUTRIENT", "ITEM"
  const itemRowsPerPage = 5;
  const logsRowsPerPage = 10;

  // Modal handlers
  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  // Page change handlers
  const handleItemChangePage = (_, newPage) => setItemPage(newPage);
  const handleChangeLogsPage = (_, newPage) => setLogsPage(newPage);

  // Sorting arrays in descending order
  const sortedItemInventory = useMemo(() => {
    const items = Array.isArray(itemInventory) ? itemInventory : [];
    return [...items].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
  }, [itemInventory]);


  const combinedLogs = useMemo(() => {
    const itemLogs = Array.isArray(inventoryLogs) ? inventoryLogs.map(log => ({ ...log, type: "ITEM" })) : [];
    const nutrientLogs = Array.isArray(nutrientInventoryLogs) ? nutrientInventoryLogs.map(log => ({ ...log, type: "NUTRIENT" })) : [];

    return [...itemLogs, ...nutrientLogs];
  }, [inventoryLogs, nutrientInventoryLogs]);

  const sortedInventoryLogs = useMemo(
    () => [...combinedLogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
    [combinedLogs]
  );


  const filteredInventoryLogs = useMemo(() => {
    if (logFilter === "ALL") {
      return sortedInventoryLogs;
    } else if (logFilter === "NUTRIENT") {
      return sortedInventoryLogs.filter(log => log.type === "NUTRIENT");
    } else if (logFilter === "ITEM") {
      return sortedInventoryLogs.filter(log => log.type === "ITEM");
    }
    return sortedInventoryLogs;
  }, [sortedInventoryLogs, logFilter]);



  // Sliced data for pagination
  const itemDataToDisplay = useMemo(
    () =>
      sortedItemInventory.slice(
        itemPage * itemRowsPerPage,
        itemPage * itemRowsPerPage + itemRowsPerPage
      ),
    [sortedItemInventory, itemPage, itemRowsPerPage]
  );
  const logsDataToDisplay = useMemo(
    () =>
      filteredInventoryLogs.slice(
        logsPage * logsRowsPerPage,
        logsPage * logsRowsPerPage + logsRowsPerPage
      ),
    [filteredInventoryLogs, logsPage, logsRowsPerPage]
  );

  // Responsive adjustments
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const iconSize = isSmallScreen ? "3rem" : "4rem";

  const tableCellTypographyProps = useMemo(
    () => ({
      fontSize: isSmallScreen ? "0.75rem" : "0.875rem",
    }),
    [isSmallScreen]
  );
  const tableHeaderCellTypographyProps = useMemo(
    () => ({
      fontSize: isSmallScreen ? "0.75rem" : "0.875rem",
      fontWeight: "bold",
    }),
    [isSmallScreen]
  );

  // Common Paper style to avoid repetition
  const commonPaperStyle = {
    width: "100%",
    overflow: "hidden",
    borderRadius: "10px",
    boxShadow: 15,
    p: { xs: 2, sm: 3 },
    mb: { xs: 3, sm: 5 },
    mt: { xs: 3, sm: 5 },
    backgroundColor: '#FFF', // Update background color to White
  };

  // Use the first container inventory item as a sample
  const inventory = containerInventory.length > 0 ? containerInventory[0] : {};

  // Helper to render table headers
  const renderTableHeader = (headers) => (
    <TableRow sx={{ backgroundColor: "#06402B", borderRadius: "10px" }}>
      {headers.map((header) => (
        <TableCell
          key={header}
          align="center"
          sx={{ color: "#fff", py: { xs: 1.5, sm: 1.5, md: 1.5 }, textTransform: "uppercase", borderBottom: 'none' }}
        >
          <Typography {...tableHeaderCellTypographyProps}>{header}</Typography>
        </TableCell>
      ))}
    </TableRow>
  );

  const filterOptions = [
    { value: "none", label: "SELECT FILTER", icon: <FilterListIcon fontSize="small" sx={{ mr: 1 }} />, disabled: true },
    { value: "all", label: "ALL DATA", icon: <ViewListIcon fontSize="small" sx={{ mr: 1 }} /> },
    { value: "currentDay", label: "CURRENT DAY", icon: <TodayIcon fontSize="small" sx={{ mr: 1 }} /> },
    { value: "last7Days", label: "LAST 7 DAYS", icon: <HistoryIcon fontSize="small" sx={{ mr: 1 }} /> },
    { value: "currentMonth", label: "CURRENT MONTH", icon: <CalendarMonthIcon fontSize="small" sx={{ mr: 1 }} /> },
    { value: "selectMonth", label: "SELECT MONTH", icon: <DateRangeIcon fontSize="small" sx={{ mr: 1 }} /> },
    { value: "custom", label: "SELECT DATE", icon: <EventIcon fontSize="small" sx={{ mr: 1 }} /> },
  ];
  

  const handleFilterChange = (e) => {
    setLogsPage(0);
    setLogFilter(e.target.value);
  };

  //Dummy Functions since not yet implemented
  const openMonthModalHandler = () => {
    alert("Month Modal Opened");
  };

  const openDateModalHandler = () => {
    alert("Date Modal Opened");
  };

  return (
    <Container maxWidth="xxl" sx={{ p: { xs: 2, sm: 3 } }}>
      {containerInventoryLoading ? (
        <DashboardSkeliton />
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Metric
              title="PH Up"
              value={inventory.ph_up || 0}
              loading={containerInventoryLoading}
              icon={<ArrowUpwardIcon sx={{ fontSize: iconSize, color: "#06402B" }} />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Metric
              title="PH Down"
              value={inventory.ph_down || 0}
              loading={containerInventoryLoading}
              icon={<ArrowDownwardIcon sx={{ fontSize: iconSize, color: "#06402B" }} />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Metric
              title="Solution A"
              value={inventory.solution_a || 0}
              loading={containerInventoryLoading}
              icon={<ScienceIcon sx={{ fontSize: iconSize, color: "#06402B" }} />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Metric
              title="Solution B"
              value={inventory.solution_b || 0}
              loading={containerInventoryLoading}
              icon={<LocalPharmacyIcon sx={{ fontSize: iconSize, color: "#06402B" }} />}
            />
          </Grid>
        </Grid>
      )}

      {(itemInventoryLoading || logsLoading) ? (
        <HarvestSkeliton />
      ) : (
        <>
          {/* Inventory Items Table */}
          <Paper sx={commonPaperStyle}>
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
              <Typography variant="h5" sx={{ fontWeight: "bold", color: '#000' }}> {/* Changed color to black */}
                  NUTRIENTS INVENTORY
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
                label="Search Inventory"
                variant="outlined"
                size="small"
                
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
              <FormControl variant="outlined" size="small" sx={{ width: { xs: "100%", sm: "auto" } }}>
                <InputLabel id="filter-label" sx={{ textTransform: "uppercase", color: '#000' }}>
                  FILTER
                </InputLabel>
                <Select
                  labelId="filter-label"
                  value={uiFilter}
                  label="FILTER"
                  
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
            <TableContainer sx={{ overflowX: "auto", borderBottom:"1px solid #999" }}>
              <Table sx={{ minWidth: 650, backgroundColor: "#fff", borderSpacing: "0 10px" }}>
                {renderTableHeader([
                  "Item Name",
                  "Type",
                  "Quantity",
                  "Total ML",
                  "Price",
                  "Total Price",
                  "User Name",
                  "Date Created",
                ])}
                <TableBody>
                  {sortedItemInventory.length > 0 ? (
                    itemDataToDisplay.map((item, index) => (
                      <StyledTableRow key={`${item.inventory_id}-${index}`} >
                           <StyledTableCell align="center" >
                          <Typography {...tableCellTypographyProps} color="#000"> {/* Changed color to black */}
                            {item.item_name}
                          </Typography>
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          <Typography {...tableCellTypographyProps} color="#000"> {/* Changed color to black */}
                            {item.type.toUpperCase()}
                          </Typography>
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          <Typography {...tableCellTypographyProps} color="#000">{item.quantity}</Typography> {/* Changed color to black */}
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          <Typography {...tableCellTypographyProps} color="#000"> {/* Changed color to black */}
                            {item.max_total_ml}
                          </Typography>
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          <Typography {...tableCellTypographyProps} color="#000">{item.price}</Typography> {/* Changed color to black */}
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          <Typography {...tableCellTypographyProps} color="#000">{item.total_price}</Typography> {/* Changed color to black */}
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          <Typography {...tableCellTypographyProps} color="#000">{item.user_name}</Typography> {/* Changed color to black */}
                        </StyledTableCell>

                        <StyledTableCell align="center">
                          <Typography {...tableCellTypographyProps} color="#000">{item.created_at}</Typography> {/* Changed color to black */}
                        </StyledTableCell>
                      </StyledTableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Typography variant="filled">No Inventory Data Found.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: { xs: 2, sm: 3 } }}>
              <TablePagination
                component="div"
                count={sortedItemInventory.length}
                rowsPerPage={itemRowsPerPage}
                page={itemPage}
                onPageChange={handleItemChangePage}
                rowsPerPageOptions={[itemRowsPerPage]}
                sx={{
                  color: '#000', // Color of the pagination text
                 
                }}
              />
            </Box>
          </Paper>

                <ItemInventory/>

          {/* Inventory Activity Logs Table */}
          <Paper sx={commonPaperStyle}>
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
              <Typography variant="h5" sx={{ fontWeight: "bold", color: '#000' }}>  {/* Changed color to black */}
               INVENTORY ACTIVITY LOGS
              </Typography>

               <FormControl variant="outlined" size="small" sx={{ width: { xs: "100%", sm: "auto" } }}>
                <InputLabel id="filter-label" sx={{ textTransform: "uppercase", color: '#000' }}>  {/* Changed color to black */}
                  Filter
                </InputLabel>
                <Select
                  label="Filter"
                  value={logFilter}
                  onChange={handleFilterChange}
                  sx={{
                    textTransform: "uppercase", color: "#000",
                  
                  }}

                  MenuProps={{
                    PaperProps: {
                      style: {
                        backgroundColor: '#FFF', // Background color of the dropdown
                      },
                    },
                  }}
                  inputProps={{
                    style: { color: '#000' },
                  }}
                >
                  <MenuItem value="ALL">
                    <ViewListIcon sx={{ mr: 1 }} />
                    ALL
                  </MenuItem>
                  <MenuItem value="NUTRIENT">
                    <LocalDrinkIcon sx={{ mr: 1 }} />
                    NUTRIENT INVENTORY
                  </MenuItem>
                  <MenuItem value="ITEM">
                    <Inventory2Icon sx={{ mr: 1 }} />
                    ITEM INVENTORY
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>
            {logsError && <Alert severity="error">Error fetching activity logs.</Alert>}
            <TableContainer sx={{ overflowX: "auto", borderBottom:"1px solid #999" }}>
              <Table sx={{ minWidth: 650, backgroundColor: "#fff", borderSpacing: "0 10px" }}>
                {renderTableHeader([
                  "Activity Type",
                  "Description",
                  "Timestamp",
                  "Log Type"
                ])}
                <TableBody>
                  {filteredInventoryLogs.length > 0 ? (
                    logsDataToDisplay.map((log, index) => (
                      <StyledTableRow key={`${log.log_id}-${index}`} >
                        <StyledTableCell align="center">
                          <Typography {...tableCellTypographyProps} color="#000"> {/* Changed color to black */}
                            {log.activity_type.toUpperCase()}
                          </Typography>
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          <Typography {...tableCellTypographyProps} color="#000">{log.description}</Typography> {/* Changed color to black */}
                        </StyledTableCell>
                       <StyledTableCell align="center">
                          <Typography {...tableCellTypographyProps} color="#000">{log.timestamp}</Typography> {/* Changed color to black */}
                        </StyledTableCell>
                         <StyledTableCell align="center">
                          <Typography {...tableCellTypographyProps} color="#000"> {/* Changed color to black */}
                            {log.type === 'NUTRIENT' ? 'Nutrient' : 'Item'}
                          </Typography>
                        </StyledTableCell>
                      </StyledTableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell align="center" colSpan={5}>
                        <Typography variant="filled">No Activity Logs Found.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: { xs: 2, sm: 3 } }}>
              <TablePagination
                component="div"
                count={filteredInventoryLogs.length || 0}
                rowsPerPage={logsRowsPerPage}
                page={logsPage}
                onPageChange={handleChangeLogsPage}
                rowsPerPageOptions={[logsRowsPerPage]}
                sx={{
                  color: '#000', // Color of the pagination text
                
                }}
              />
            </Box>
          </Paper>
        </>
      )}

      <InventoryModal open={modalOpen} handleClose={handleCloseModal} />
    </Container>
  );
};

export default Inventory;