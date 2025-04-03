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
  useMediaQuery,
  Button,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useItemInventory } from "../hooks/ItemInventoryHooks";
import HarvestSkeliton from "../skelitons/HarvestSkeliton";
import { useActivityLogs } from "../hooks/AdminLogsHooks";
import Metric from "../props/MetricSection";
import { useContainerInventory } from "../hooks/ContainerInventoryHooks";
import DashboardSkeliton from "../skelitons/DashboardSkeliton";

// Import icons from Material UI
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ScienceIcon from "@mui/icons-material/Science";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import AddIcon from "@mui/icons-material/Add";

// Import the modal component
import InventoryModal from "../components/AddInventoryModal";

const Inventory = () => {
  const { itemInventory, itemInventoryLoading } = useItemInventory();
  const [itemPage, setItemPage] = useState(0);
  const [logsPage, setLogsPage] = useState(0);
  const itemRowsPerPage = 5;
  const logsRowsPerPage = 10;
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  
  const handleOpenModal = () => {
    setModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const { inventoryLogs, logsLoading, logsError } = useActivityLogs();
  const { containerInventory, containerInventoryLoading } = useContainerInventory();

  // Use the first item from the inventory data as a sample
  const inventory = containerInventory.length > 0 ? containerInventory[0] : {};
  const handleItemChangePage = (event, newItemPage) => {
    setItemPage(newItemPage);
  };

  const handleChangeLogsPage = (event, newLogsPage) => {
    setLogsPage(newLogsPage);
  };

  // Sort data arrays in descending order (latest to oldest)
  const sortedItemInventory = useMemo(() => {
    return [...itemInventory].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [itemInventory]);

  const sortedInventoryLogs = useMemo(() => {
    return [...inventoryLogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [inventoryLogs]);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // Responsive icon size
  const iconSize = isSmallScreen ? "3rem" : "4rem";

  // Memoize typography props for table cells and headers to adjust font size responsively
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

  // Memoize sliced data to avoid re-renders if the underlying data hasn't changed
  const itemDataToDisplay = useMemo(
    () =>
      sortedItemInventory.slice(
        itemPage * itemRowsPerPage,
        itemPage * itemRowsPerPage + itemRowsPerPage
      ),
    [sortedItemInventory, itemPage, itemRowsPerPage]
  );

  const logsDataToDisplaySliced = useMemo(
    () =>
      sortedInventoryLogs.slice(
        logsPage * logsRowsPerPage,
        logsPage * logsRowsPerPage + logsRowsPerPage
      ),
    [sortedInventoryLogs, logsPage, logsRowsPerPage]
  );

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
              icon={<ArrowUpwardIcon sx={{ fontSize: iconSize, color: "#fff" }} />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Metric
              title="PH Down"
              value={inventory.ph_down || 0}
              loading={containerInventoryLoading}
              icon={<ArrowDownwardIcon sx={{ fontSize: iconSize, color: "#fff" }} />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Metric
              title="Solution A"
              value={inventory.solution_a || 0}
              loading={containerInventoryLoading}
              icon={<ScienceIcon sx={{ fontSize: iconSize, color: "#fff" }} />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Metric
              title="Solution B"
              value={inventory.solution_b || 0}
              loading={containerInventoryLoading}
              icon={<LocalPharmacyIcon sx={{ fontSize: iconSize, color: "#fff" }} />}
            />
          </Grid>
        </Grid>
      )}

      {itemInventoryLoading || logsLoading ? (
        <HarvestSkeliton />
      ) : (
        <>
          {/* Inventory Table */}
          <Paper
            sx={{
              width: "100%",
              overflow: "hidden",
              borderRadius: "10px",
              boxShadow: 15,
              p: { xs: 2, sm: 3 },
              mb: { xs: 3, sm: 5 },
              mt: { xs: 3, sm: 5 },
            }}
          >
            {/* Header with Add Inventory button */}
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
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                INVENTORY ITEMS
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenModal}
                sx={{
                  display:"none",
                  backgroundColor: "#06402B",
                  "&:hover": { backgroundColor: "#255a33" },
                }}
              >
                Add Inventory
              </Button>
            </Box>

            {/* Table */}
            <TableContainer sx={{ overflowX: "auto" }}>
              <Table sx={{ minWidth: 650, backgroundColor: "#fff" }}>
                <TableRow sx={{ backgroundColor: "#06402B", borderRadius: "10px" }}>
                  {["Type", "Quantity (ml)", "Critical Level", "Created At", "Updated At"].map(
                    (header) => (
                      <TableCell
                        key={header}
                        align="center"
                        sx={{
                          color: "#fff",
                          py: { xs: 1.5, sm: 1.5, md:1.5 },
                          textTransform: "uppercase",
                        }}
                      >
                        <Typography {...tableHeaderCellTypographyProps}>
                          {header}
                        </Typography>
                      </TableCell>
                    )
                  )}
                </TableRow>
                <tbody>
                  {sortedItemInventory.length > 0 ? (
                    itemDataToDisplay.map((item, index) => (
                      <TableRow
                        key={`${item.inventory_id}-${index}`}
                        hover
                        sx={{ borderRadius: "10px" }}
                      >
                        <TableCell align="center">
                          <Typography {...tableCellTypographyProps}>
                            {item.type.toUpperCase()}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography {...tableCellTypographyProps}>
                            {item.quantity}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography {...tableCellTypographyProps}>
                            {item.critical_level }
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography {...tableCellTypographyProps}>
                            {item.created_at}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography {...tableCellTypographyProps}>
                            {item.updated_at || "N/A"}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography variant="filled"  >
                          No Inventory Data Found.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </tbody>
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
                count={sortedItemInventory.length}
                rowsPerPage={itemRowsPerPage}
                page={itemPage}
                onPageChange={handleItemChangePage}
                rowsPerPageOptions={[itemRowsPerPage]}
              />
            </Box>
          </Paper>

          {/* Activity Logs Table */}
          <Paper
            sx={{
              width: "100%",
              overflow: "hidden",
              borderRadius: "10px",
              boxShadow: 15,
              p: { xs: 2, sm: 3 },
              mb: { xs: 3, sm: 5 },
              mt: { xs: 3, sm: 5 },
            }}
          >
            {/* Header */}
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
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                INVENTORY ACTIVITY LOGS
              </Typography>
            </Box>

            {logsError && (
              <Alert severity="error">Error fetching activity logs.</Alert>
            )}

            {/* Table */}
            <TableContainer sx={{ overflowX: "auto" }}>
              <Table sx={{ minWidth: 650, backgroundColor: "#fff" }}>
                <TableRow sx={{ backgroundColor: "#06402B", borderRadius: "10px" }}>
                  {[
                    "Change Type",
                    "Description",
                    "Item",
                    "Quantity",
                    "Timestamp",
                  ].map((header) => (
                    <TableCell
                      key={header}
                      align="center"
                      sx={{
                        color: "#fff",
                        py: { xs: 1.5, sm: 1.5, md:1.5 },
                        textTransform: "uppercase",
                      }}
                    >
                      <Typography {...tableHeaderCellTypographyProps}>
                        {header}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
                <tbody>
                  {sortedInventoryLogs.length > 0 ? (
                    logsDataToDisplaySliced.map((log, index) => (
                      <TableRow
                        key={`${log.log_id}-${index}`}
                        hover
                        sx={{ borderRadius: "10px" }}
                      >
                        <TableCell align="center">
                          <Typography {...tableCellTypographyProps}>
                            {log.change_type.toUpperCase()}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography {...tableCellTypographyProps}>
                            {log.description}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography {...tableCellTypographyProps}>
                            {log.item.toUpperCase()}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography {...tableCellTypographyProps}>
                            {log.quantity}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography {...tableCellTypographyProps}>
                            {log.timestamp}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell align="center" colSpan={5}>
                      <Typography variant="filled"  >
                          No Activity Logs Found.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </tbody>
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
                count={sortedInventoryLogs.length || 0}
                rowsPerPage={logsRowsPerPage}
                page={logsPage}
                onPageChange={handleChangeLogsPage}
                rowsPerPageOptions={[logsRowsPerPage]}
              />
            </Box>
          </Paper>
        </>
      )}

      {/* Inventory Modal */}
      <InventoryModal open={modalOpen} handleClose={handleCloseModal} />
    </Container>
  );
};

export default Inventory;
