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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import HarvestSkeliton from "../skelitons/HarvestSkeliton";
import { useMaintenance } from "../hooks/MaintenanceHooks";
import CustomDateModal from "../props/CustomDateModal";

function Reports() {
  const { maintenance, maintenanceLoading } = useMaintenance();
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOption, setFilterOption] = useState("all");

  // States for custom date modal
  const [openDateModal, setOpenDateModal] = useState(false);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);

  const handleFilterChange = (e) => {
    const value = e.target.value;
    if (value === "custom") {
      // When "SELECT DATE" option is chosen, open the modal
      setOpenDateModal(true);
      setFilterOption(value);
    } else {
      setFilterOption(value);
      // Clear any custom date range if not in use
      setCustomFrom(null);
      setCustomTo(null);
    }
  };

  const handleApplyCustomDates = () => {
    // Close the modal so the filter takes effect.
    setOpenDateModal(false);
  };

  // First filter by search term on title and description
  const searchFilteredMaintenance = maintenance.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const today = new Date();
  let dateFilteredMaintenance = searchFilteredMaintenance;

  if (filterOption === "currentDay") {
    dateFilteredMaintenance = searchFilteredMaintenance.filter((item) => {
      const itemDate = new Date(item.date_completed);
      return itemDate.toDateString() === today.toDateString();
    });
  } else if (filterOption === "last7Days") {
    dateFilteredMaintenance = searchFilteredMaintenance.filter((item) => {
      const itemDate = new Date(item.date_completed);
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      return itemDate >= sevenDaysAgo && itemDate <= today;
    });
  } else if (filterOption === "currentMonth") {
    dateFilteredMaintenance = searchFilteredMaintenance.filter((item) => {
      const itemDate = new Date(item.date_completed);
      return (
        itemDate.getMonth() === today.getMonth() &&
        itemDate.getFullYear() === today.getFullYear()
      );
    });
  } else if (filterOption === "custom" && customFrom && customTo) {
    const fromDate = new Date(customFrom);
    const toDate = new Date(customTo);
    // Set toDate to the end of the day to include records on that day
    toDate.setHours(23, 59, 59, 999);
    dateFilteredMaintenance = searchFilteredMaintenance.filter((item) => {
      const itemDate = new Date(item.date_completed);
      return itemDate >= fromDate && itemDate <= toDate;
    });
  }

  // Sort maintenance items by date_completed descending (latest first)
  const sortedMaintenance = [...dateFilteredMaintenance].sort(
    (a, b) => new Date(b.date_completed) - new Date(a.date_completed)
  );

  return (
    <Container maxWidth="xl" sx={{ p: { xs: 2, sm: 3 } }}>
      {maintenanceLoading ? (
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
          {/* Responsive header with title and search/filter controls */}
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
              MAINTENANCE
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
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <SearchIcon
                        sx={{
                          fontSize: { xs: "1rem", sm: "1.2rem" },
                        }}
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
                  value={filterOption}
                  label="Filter"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="all">All Data</MenuItem>
                  <MenuItem value="currentDay">Current Day</MenuItem>
                  <MenuItem value="last7Days">Last 7 Days</MenuItem>
                  <MenuItem value="currentMonth">Current Month</MenuItem>
                  <MenuItem value="custom">SELECT DATE</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table sx={{ minWidth: 650, backgroundColor: "#fff" }}>
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: "#06402B",
                    borderRadius: "10px",
                  }}
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
          <CustomDateModal
            openDateModal={openDateModal}
            setOpenDateModal={(value) => {
              setOpenDateModal(value);
              if (!value && (!customFrom || !customTo)) {
                // If the modal is closed without applying a range, revert filter back to "all"
                setFilterOption("all");
              }
            }}
            customFrom={customFrom}
            setCustomFrom={setCustomFrom}
            customTo={customTo}
            setCustomTo={setCustomTo}
            handleApplyCustomDates={handleApplyCustomDates}
          />
        </Paper>
      )}
    </Container>
  );
}

export default Reports;
