import React, { useState } from "react";
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
  Grid,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import axios from "axios";
import { io } from "socket.io-client";
import Metric from "../props/MetricSection";
import BugReportIcon from "@mui/icons-material/BugReport";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import DashboardSkeliton from "../skelitons/DashboardSkeliton";
import HarvestSkeliton from "../skelitons/HarvestSkeliton";
import MetricCard from "../components/DashboardCards";

// Import all hooks including current day functionss
import {
  useDiseasedOverall,
  usePhysicallyDamageOverall,
  useTooSmallOverall,
  useDiseasedLast7Days,
  usePhysicallyDamageLast7Days,
  useTooSmallLast7Days,
  useDiseasedLast31Days,
  usePhysicallyDamageLast31Days,
  useTooSmallLast31Days,
  useDiseasedCurrentDay,
  usePhysicallyDamageCurrentDay,
  useTooSmallCurrentDay,
} from "../hooks/RejectionTotalHooks";

// Initialize socket connection (ensure your backend is running)
const socket = io("http://localhost:3001");

// Hook for fetching rejected table data
const useRejectedTableItems = () => {
  const [rejectItems, setRejectItems] = useState([]);
  const [rejectLoading, setRejectLoading] = useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/reason_for_rejection");
        const table = response.data.rejectedTable || [];
        setRejectItems(table);
      } catch (error) {
        console.error("Error fetching rejected table data:", error);
        setRejectItems([]);
      } finally {
        setRejectLoading(false);
      }
    };

    fetchData();
    socket.on("updateRejected", fetchData);
    return () => {
      socket.off("updateRejected", fetchData);
    };
  }, []);

  return { rejectItems, rejectLoading };
};

const Rejected = () => {
  // Metric hooks for overall, last 7 days, last 31 days, and current day
  const { overallDiseased, overallDiseasedLoading } = useDiseasedOverall();
  const { overallPhysicallyDamage, overallPhysicallyDamageLoading } = usePhysicallyDamageOverall();
  const { overallTooSmall, overallTooSmallLoading } = useTooSmallOverall();

  const { diseasedLast7Days, diseasedLast7DaysLoading } = useDiseasedLast7Days();
  const { physicallyDamageLast7Days, physicallyDamageLast7DaysLoading } = usePhysicallyDamageLast7Days();
  const { tooSmallLast7Days, tooSmallLast7DaysLoading } = useTooSmallLast7Days();

  const { diseasedLast31Days, diseasedLast31DaysLoading } = useDiseasedLast31Days();
  const { physicallyDamageLast31Days, physicallyDamageLast31DaysLoading } = usePhysicallyDamageLast31Days();
  const { tooSmallLast31Days, tooSmallLast31DaysLoading } = useTooSmallLast31Days();

  const { diseasedCurrentDay, diseasedCurrentDayLoading } = useDiseasedCurrentDay();
  const { physicallyDamageCurrentDay, physicallyDamageCurrentDayLoading } = usePhysicallyDamageCurrentDay();
  const { tooSmallCurrentDay, tooSmallCurrentDayLoading } = useTooSmallCurrentDay();

  // Table data hook
  const { rejectItems, rejectLoading } = useRejectedTableItems();

  // Local state for pagination, search, and filtering
  const [rejectPage, setRejectPage] = useState(0);
  const rowsPerPage = 10;
  const [rejectSearchTerm, setRejectSearchTerm] = useState("");
  const [rejectFilter, setRejectFilter] = useState("ALL");

  // State for custom date filtering
  const [openDateModal, setOpenDateModal] = useState(false);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);

  // For custom filtering: filter table data by date range
  const customFilteredItems =
    customFrom && customTo
      ? rejectItems.filter((item) => {
          const itemDate = new Date(item.rejection_date);
          return itemDate >= customFrom && itemDate <= customTo;
        })
      : [];

  const customDiseased = customFilteredItems.reduce((sum, item) => sum + Number(item.diseased || 0), 0);
  const customPhysicallyDamage = customFilteredItems.reduce(
    (sum, item) => sum + Number(item.physically_damaged || 0),
    0
  );
  const customTooSmall = customFilteredItems.reduce((sum, item) => sum + Number(item.too_small || 0), 0);

  // Determine which metrics to display based on the selected filter
  const diseasedMetric =
    rejectFilter === "ALL"
      ? overallDiseased
      : rejectFilter === "LAST 7 DAYS"
      ? diseasedLast7Days
      : rejectFilter === "LAST 31 DAYS"
      ? diseasedLast31Days
      : rejectFilter === "CURRENT DAY"
      ? diseasedCurrentDay
      : rejectFilter === "CHOOSE DATE"
      ? customDiseased
      : overallDiseased;

  const physicallyDamageMetric =
    rejectFilter === "ALL"
      ? overallPhysicallyDamage
      : rejectFilter === "LAST 7 DAYS"
      ? physicallyDamageLast7Days
      : rejectFilter === "LAST 31 DAYS"
      ? physicallyDamageLast31Days
      : rejectFilter === "CURRENT DAY"
      ? physicallyDamageCurrentDay
      : rejectFilter === "CHOOSE DATE"
      ? customPhysicallyDamage
      : overallPhysicallyDamage;

  const tooSmallMetric =
    rejectFilter === "ALL"
      ? overallTooSmall
      : rejectFilter === "LAST 7 DAYS"
      ? tooSmallLast7Days
      : rejectFilter === "LAST 31 DAYS"
      ? tooSmallLast31Days
      : rejectFilter === "CURRENT DAY"
      ? tooSmallCurrentDay
      : rejectFilter === "CHOOSE DATE"
      ? customTooSmall
      : overallTooSmall;

  const metricsLoading =
    (rejectFilter === "ALL" &&
      (overallDiseasedLoading || overallPhysicallyDamageLoading || overallTooSmallLoading)) ||
    (rejectFilter === "LAST 7 DAYS" &&
      (diseasedLast7DaysLoading || physicallyDamageLast7DaysLoading || tooSmallLast7DaysLoading)) ||
    (rejectFilter === "LAST 31 DAYS" &&
      (diseasedLast31DaysLoading || physicallyDamageLast31DaysLoading || tooSmallLast31DaysLoading)) ||
    (rejectFilter === "CURRENT DAY" &&
      (diseasedCurrentDayLoading || physicallyDamageCurrentDayLoading || tooSmallCurrentDayLoading)) ||
    (rejectFilter === "CHOOSE DATE" && rejectLoading);

  // Table data filtering: sort by rejection_date then filter by date and search term
  const sortedRejectItems = [...rejectItems].sort(
    (a, b) => new Date(b.rejection_date) - new Date(a.rejection_date)
  );

  const filterByDate = (item) => {
    const itemDate = new Date(item.rejection_date);
    const today = new Date();
    if (rejectFilter === "ALL") return true;
    if (rejectFilter === "LAST 7 DAYS") {
      const pastDate = new Date();
      pastDate.setDate(today.getDate() - 6);
      return itemDate >= pastDate && itemDate <= today;
    }
    if (rejectFilter === "THIS MONTH") {
      return (
        itemDate.getMonth() === today.getMonth() &&
        itemDate.getFullYear() === today.getFullYear()
      );
    }
    if (rejectFilter === "CURRENT DAY") {
      return (
        itemDate.getDate() === today.getDate() &&
        itemDate.getMonth() === today.getMonth() &&
        itemDate.getFullYear() === today.getFullYear()
      );
    }
    if (rejectFilter === "CHOOSE DATE") {
      if (!customFrom || !customTo) return true;
      return itemDate >= customFrom && itemDate <= customTo;
    }
    return true;
  };

  const filteredRejectItems = sortedRejectItems.filter((item) => {
    const dateMatch = filterByDate(item);
    const searchTerm = rejectSearchTerm.toLowerCase();
    const rejectionDate = item.rejection_date ? item.rejection_date.toLowerCase() : "";
    const comments = item.comments ? item.comments.toLowerCase() : "";
    return dateMatch && (rejectionDate.includes(searchTerm) || comments.includes(searchTerm));
  });

  // Handle filter change (opens modal if CHOOSE DATE is selected)
  const handleFilterChange = (e) => {
    const value = e.target.value;
    if (value === "CHOOSE DATE") {
      setOpenDateModal(true);
    } else {
      setRejectFilter(value);
    }
  };

  // Apply custom date range from modal
  const handleApplyCustomDates = () => {
    if (customFrom && customTo) {
      setRejectFilter("CHOOSE DATE");
      setOpenDateModal(false);
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
      {/* Metrics Section 
      <Grid container spacing={3}>
  <Grid item xs={12} md={4}>
    <Metric
      title="Diseased"
      value={diseasedMetric}
      loading={metricsLoading}
      icon={<BugReportIcon sx={{ fontSize: "4rem", color: "#fff" }} />}
    />
  </Grid>
  <Grid item xs={12} md={4}>
    <Metric
      title="Physically Damaged"
      value={physicallyDamageMetric}
      loading={metricsLoading}
      icon={<ReportProblemIcon sx={{ fontSize: "4rem",color: "#fff" }} />}
    />
  </Grid>
  <Grid item xs={12} md={4}>
    <Metric
      title="Too Small"
      value={tooSmallMetric}
      loading={metricsLoading}
      icon={<RemoveCircleOutlineIcon sx={{ fontSize: "4rem",color: "#fff" }} />}
    />
  </Grid>
</Grid>
 */}
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
            REJECTED ITEMS
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
            <FormControl variant="outlined" size="small" sx={{ width: { xs: "100%", sm: "100%", md: "auto" } }}>
              <InputLabel>Filter</InputLabel>
              <Select label="Filter" value={rejectFilter} onChange={handleFilterChange}>
                <MenuItem value="ALL">ALL</MenuItem>
                <MenuItem value="CURRENT DAY">CURRENT DAY</MenuItem>
                <MenuItem value="LAST 7 DAYS">LAST 7 DAYS</MenuItem>
                <MenuItem value="THIS MONTH">THIS MONTH</MenuItem>
                <MenuItem value="CHOOSE DATE" onClick={() => setOpenDateModal(true)}>
                  CHOOSE DATE
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
                        <TableCell key={header} align="center" sx={{ fontWeight: "bold", fontSize: "1.1rem", color: "#fff" }}>
                          {header}
                        </TableCell>
                      )
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRejectItems
                    .slice(rejectPage * rowsPerPage, rejectPage * rowsPerPage + rowsPerPage)
                    .map((item) => (
                      <TableRow key={item.rejection_id} hover>
                        <TableCell align="center">{item.diseased}</TableCell>
                        <TableCell align="center">{item.physically_damaged}</TableCell>
                        <TableCell align="center">{item.too_small}</TableCell>
                        <TableCell align="center">{item.comments}</TableCell>
                        <TableCell align="center">{item.rejection_date}</TableCell>
                      </TableRow>
                    ))}
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

      {/* Custom Date Modal */}
      <Modal open={openDateModal} onClose={() => setOpenDateModal(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Choose Date Range
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="FROM"
              value={customFrom}
              onChange={(newValue) => setCustomFrom(newValue)}
              renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 4 }} />}
            />
            <Divider sx={{ my: 2, bgcolor: "grey.300" }} />
            <DatePicker
              label="TO"
              value={customTo}
              onChange={(newValue) => setCustomTo(newValue)}
              renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 4 }} />}
            />
          </LocalizationProvider>
          <Divider sx={{ my: 1, bgcolor: "grey.300" }} />
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button onClick={() => setOpenDateModal(false)} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleApplyCustomDates} variant="contained" color="primary">
              Apply
            </Button>
          </Box>
        </Box>
      </Modal>
    </Container>
  );
};

export default Rejected;
