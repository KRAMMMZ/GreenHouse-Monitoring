import React, { useState, useMemo, useCallback } from "react";
import {
  Container,
  Box,
  Paper,
  TablePagination,
  Divider,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Modal,
} from "@mui/material";
import { useHarvestItems } from "../hooks/HarvestHooks";
import HarvestSkeliton from "../skelitons/HarvestSkeliton";
import FilterSearchSection from "../props/FilterSearchSection";
import HarvestTable from "../props/HarvestTable";
import CustomDateModal from "../props/CustomDateModal";
import axios from "axios";
import Swal from 'sweetalert2'; // Import SweetAlert2

// Helper function to format dates
function formatDate(date) {
  return date.toLocaleDateString("default", { month: "long", day: "numeric", year: "numeric" });
}

// Function to generate filter description text (for the header)
function getFilterDescription(filter, customFrom, customTo, selectedMonth, selectedYear) {
  if (filter === "ALL" || filter === "NONE") return "";
  const today = new Date();
  if (filter === "CURRENT DAY") {
    return `CURRENT DAY: ${formatDate(today)}`;
  }
  if (filter === "LAST 7 DAYS") {
    const endDate = new Date();
    const startDate = new Date();
    // Adjusting to show 7 days including today
    startDate.setDate(endDate.getDate() - 6);
    return `LAST 7 DAYS: ${formatDate(startDate)} - ${formatDate(endDate)}`;
  }
  if (filter === "THIS MONTH") {
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return `THIS MONTH: ${formatDate(firstDayOfMonth)} - ${formatDate(lastDayOfMonth)}`;
  }
  if (filter === "SELECT MONTH" && selectedMonth && selectedYear) {
    const firstDay = new Date(selectedYear, selectedMonth - 1, 1);
    const lastDay = new Date(selectedYear, selectedMonth, 0);
    return `SELECT MONTH: ${formatDate(firstDay)} - ${formatDate(lastDay)}`;
  }
  if (filter === "CHOOSE DATE" && customFrom && customTo) {
    return `CUSTOM: ${formatDate(new Date(customFrom))} - ${formatDate(new Date(customTo))}`;
  }
  return "";
}

const Harvest = () => {
  const { harvestItems, harvestLoading,fetchHarvestItems  } = useHarvestItems(); // Make sure fetchHarvestItems is returned by the hook
  const [harvestPage, setHarvestPage] = useState(0);
  const rowsPerPage = 10;
  const [harvestSearchTerm, setHarvestSearchTerm] = useState("");
  const [harvestFilter, setHarvestFilter] = useState("ALL");

  // CHOOSE DATE state (delayed application)
  const [openDateModal, setOpenDateModal] = useState(false);
  const [tempCustomFrom, setTempCustomFrom] = useState(null);
  const [tempCustomTo, setTempCustomTo] = useState(null);
  const [appliedCustomFrom, setAppliedCustomFrom] = useState(null);
  const [appliedCustomTo, setAppliedCustomTo] = useState(null);

  // SELECT MONTH state (delayed application)
  const currentMonth = (new Date().getMonth() + 1).toString();
  const currentYear = new Date().getFullYear().toString();
  const [openMonthModal, setOpenMonthModal] = useState(false);
  const [tempSelectedMonth, setTempSelectedMonth] = useState(currentMonth);
  const [tempSelectedYear, setTempSelectedYear] = useState(currentYear);
  const [appliedSelectedMonth, setAppliedSelectedMonth] = useState(currentMonth);
  const [appliedSelectedYear, setAppliedSelectedYear] = useState(currentYear);

  // Calculate filter description to pass to the header
  const filterDescription = useMemo(
    () =>
      getFilterDescription(
        harvestFilter,
        appliedCustomFrom,
        appliedCustomTo,
        appliedSelectedMonth,
        appliedSelectedYear
      ),
    [harvestFilter, appliedCustomFrom, appliedCustomTo, appliedSelectedMonth, appliedSelectedYear]
  );

  // Sort harvest items (latest first) using useMemo
  const sortedHarvestItems = useMemo(() => {
    return [...harvestItems].sort((a, b) => {
      const dateDiff = new Date(b.harvest_date) - new Date(a.harvest_date);
      return dateDiff !== 0 ? dateDiff : b.harvest_id - a.harvest_id;
    });
  }, [harvestItems]);

  // Filter items based on the active filter and search term
  const filteredHarvestItems = useMemo(() => {
    return sortedHarvestItems.filter((item) => {
      const itemDate = new Date(item.harvest_date);
      const today = new Date();
      let dateMatch = true;
      switch (harvestFilter) {
        case "ALL":
          dateMatch = true;
          break;
        case "LAST 7 DAYS": {
          const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const earliestDay = new Date(startOfToday);
          earliestDay.setDate(earliestDay.getDate() - 6);
          const itemDay = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
          dateMatch = itemDay >= earliestDay && itemDay <= startOfToday;
          break;
        }
        case "THIS MONTH":
          dateMatch =
            itemDate.getMonth() === today.getMonth() &&
            itemDate.getFullYear() === today.getFullYear();
          break;
        case "CURRENT DAY":
          dateMatch =
            itemDate.getDate() === today.getDate() &&
            itemDate.getMonth() === today.getMonth() &&
            itemDate.getFullYear() === today.getFullYear();
          break;
        case "CHOOSE DATE":
          if (!appliedCustomFrom || !appliedCustomTo) {
            dateMatch = true;
          } else {
            const adjustedCustomTo = new Date(appliedCustomTo);
            adjustedCustomTo.setHours(23, 59, 59, 999);
            dateMatch = itemDate >= appliedCustomFrom && itemDate <= adjustedCustomTo;
          }
          break;
        case "SELECT MONTH":
          if (!appliedSelectedMonth || !appliedSelectedYear) {
            dateMatch = true;
          } else {
            dateMatch =
              itemDate.getMonth() + 1 === parseInt(appliedSelectedMonth) &&
              itemDate.getFullYear() === parseInt(appliedSelectedYear);
          }
          break;
        default:
          dateMatch = true;
      }
      const searchTerm = harvestSearchTerm.toLowerCase();
      const harvestDate = item.harvest_date ? item.harvest_date.toLowerCase() : "";
      const notes = item.notes ? item.notes.toLowerCase() : "";
      const name = item.full_name ? item.full_name.toLowerCase() : "";
      const plantType = item.plant_type ? item.plant_type.toLowerCase() : "";
      return (
        dateMatch &&
        (harvestDate.includes(searchTerm) ||
          notes.includes(searchTerm) ||
          name.includes(searchTerm) ||
          plantType.includes(searchTerm))
      );
    });
  }, [
    sortedHarvestItems,
    harvestFilter,
    harvestSearchTerm,
    appliedCustomFrom,
    appliedCustomTo,
    appliedSelectedMonth,
    appliedSelectedYear,
  ]);

  // Handlers
  const handleFilterChange = useCallback((e) => {
    const value = e.target.value;
    if (value === "CHOOSE DATE") {
      setOpenDateModal(true);
    } else if (value === "SELECT MONTH") {
      setOpenMonthModal(true);
    } else {
      setHarvestFilter(value);
    }
  }, []);

  const handleApplyCustomDates = useCallback(() => {
    if (tempCustomFrom && tempCustomTo && tempCustomFrom <= tempCustomTo) {
      setAppliedCustomFrom(tempCustomFrom);
      setAppliedCustomTo(tempCustomTo);
      setHarvestFilter("CHOOSE DATE");
      setOpenDateModal(false);
    }
  }, [tempCustomFrom, tempCustomTo]);

  const handleApplySelectedMonth = useCallback(() => {
    if (tempSelectedMonth && tempSelectedYear) {
      setAppliedSelectedMonth(tempSelectedMonth);
      setAppliedSelectedYear(tempSelectedYear);
      setHarvestFilter("SELECT MONTH");
      setOpenMonthModal(false);
    }
  }, [tempSelectedMonth, tempSelectedYear]);

  // No-data message based on active filter
  const noDataMessage = useMemo(() => {
    switch (harvestFilter) {
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
          ? appliedCustomFrom.toLocaleDateString("default", { month: "long", day: "numeric", year: "numeric" })
          : "";
        const to = appliedCustomTo
          ? appliedCustomTo.toLocaleDateString("default", { month: "long", day: "numeric", year: "numeric" })
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
        return "No Harvest data";
    }
  }, [harvestFilter, appliedCustomFrom, appliedCustomTo, appliedSelectedMonth, appliedSelectedYear]);

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

   const handlePriceUpdate = useCallback(async (id, newPrice) => {
        try {
            // Use PATCH to match backend
            const response = await axios.patch(
                `http://localhost:3001/harvests/${id}`,
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
                  fetchHarvestItems(); // Call fetchHarvestItems directly
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
    }, [fetchHarvestItems]); // Add fetchHarvestItems to the dependency array

  return (
    <Container maxWidth="xxl" sx={{ p: 3 }}>
      <Paper sx={{ p: 2, borderRadius: 2,   boxShadow: 15, mt: 3,    backgroundColor: "#FFF", }}>
        <FilterSearchSection
          harvestSearchTerm={harvestSearchTerm}
          setHarvestSearchTerm={setHarvestSearchTerm}
          harvestFilter={harvestFilter}
          handleFilterChange={handleFilterChange}
          openDateModalHandler={() => setOpenDateModal(true)}
          openMonthModalHandler={() => setOpenMonthModal(true)}
          filterDescription={filterDescription}
        />
        <Box sx={{ mt: 2 }}>
          <HarvestTable
            filteredHarvestItems={filteredHarvestItems}
            harvestLoading={harvestLoading}
            harvestPage={harvestPage}
            rowsPerPage={rowsPerPage}
            noDataMessage={noDataMessage}
            onPriceUpdate={handlePriceUpdate}
          />
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: { xs: 2, sm: 3 } }}>
            <TablePagination
              component="div"
              count={filteredHarvestItems.length}
              rowsPerPage={rowsPerPage}
              page={harvestPage}
              onPageChange={(event, newPage) => setHarvestPage(newPage)}
              rowsPerPageOptions={[rowsPerPage]}
              sx={{    color: '#000'  }}
            />
          </Box>
        </Box>
      </Paper>

      <CustomDateModal
        openDateModal={openDateModal}
        setOpenDateModal={(value) => {
          setOpenDateModal(value);
          if (!value && (!tempCustomFrom || !tempCustomTo)) {
            setHarvestFilter("ALL");
          }
        }}
        customFrom={tempCustomFrom}
        setCustomFrom={setTempCustomFrom}
        customTo={tempCustomTo}
        setCustomTo={setTempCustomTo}
        handleApplyCustomDates={handleApplyCustomDates}
      />

      <Modal open={openMonthModal} onClose={() => setOpenMonthModal(false)} aria-labelledby="harvest-month-modal">
        <Box sx={modalStyle}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Select Month and Year
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="harvest-month-label">Month</InputLabel>
            <Select
              labelId="harvest-month-label"
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
            <InputLabel id="harvest-year-label">Year</InputLabel>
            <Select
              labelId="harvest-year-label"
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

export default Harvest;