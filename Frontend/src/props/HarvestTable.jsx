import React, { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  useMediaQuery,
  useTheme,
  Typography,
  Button,
  Stack,
  Modal,
  TextField,
  IconButton,
  Grid,
} from "@mui/material";
import HarvestSkeliton from "../skelitons/HarvestSkeliton";
import CloseIcon from "@mui/icons-material/Close";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';  // Import the arrow down icon
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Styles for the modal layout
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: '90%', sm: 500 }, // Responsive width
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
  maxHeight: "80vh",
  overflowY: "auto",
};

const labelStyle = {
  fontWeight: 600,
  color: "#000",
  fontSize: "1rem",
  textAlign: "right",
};

const valueStyle = {
  color: "#000",
  fontSize: "1rem",
  textAlign: "center",
};

const HarvestTable = ({
  filteredHarvestItems,
  harvestLoading,
  harvestPage,
  rowsPerPage,
  noDataMessage,
  onPriceUpdate, // New prop for handling price updates
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const isXs = useMediaQuery(theme.breakpoints.down("xs"));

  // State for the Edit Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [newPrice, setNewPrice] = useState("");

  // State for the View Modal
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedItemData, setSelectedItemData] = useState(null);

    const [localHarvestItems, setLocalHarvestItems] = useState(filteredHarvestItems); // Local state for items

    // Update local state when filteredHarvestItems change
    useEffect(() => {
        setLocalHarvestItems(filteredHarvestItems);
    }, [filteredHarvestItems]);

  const handleEditOpen = (itemId, price) => {
    setSelectedItemId(itemId);
    setCurrentPrice(price);
    setNewPrice(""); // Reset the new price field
    setEditModalOpen(true);
  };

  const handleEditClose = () => {
    setEditModalOpen(false);
  };

  const handleNewPriceChange = (event) => {
    setNewPrice(event.target.value);
  };

   const handleUpdatePrice = (itemId, newPrice) => {
        // Validate new price (e.g., is it a number?)
        if (isNaN(newPrice)) {
            alert("Please enter a valid number for the new price.");
            return;
        }

        const parsedNewPrice = parseFloat(newPrice);

        onPriceUpdate(itemId, parsedNewPrice).then(() => {
            // Update local state after successful update
            setLocalHarvestItems((prevItems) =>
                prevItems.map((item) =>
                    item.harvest_id === itemId ? { ...item, price: parsedNewPrice } : item
                )
            );
            handleEditClose(); // Close the modal after updating
        });
    };

  const handleViewOpen = (item) => {
    setSelectedItemData(item); // Store the entire item data
    setViewModalOpen(true);
  };

  const handleViewClose = () => {
    setSelectedItemData(null);
    setViewModalOpen(false);
  };

    // State to control whether to show only "Sold" items
    const [showOnlySold, setShowOnlySold] = useState(false);

    const toggleShowSold = () => {
        setShowOnlySold(!showOnlySold);
    };

    const filteredItems = useMemo(() => {
        if (showOnlySold) {
            return localHarvestItems.filter(item => item.status === "Sold");
        }
        return localHarvestItems.filter(item => item.status === "Not Sold"); //display the not sold
    }, [localHarvestItems, showOnlySold]);

    const actionHeader = useMemo(() => {
        return showOnlySold ? "Action (View Only)" : "Action";
    }, [showOnlySold]);

    const tableColumns = useMemo(() => {
        const baseColumns = [
            "Plant Name",
            "Accepted",
            "Total Rejected",
            "Total Yield",
            "Plant Type",
            "Price",
            "Total Price",
            "Status",
            "Harvested Date",
            "Action",
        ];

        if (isXs) {
            return baseColumns.filter(column => column !== "Total Rejected" && column !== "Plant Type" && column !== "Harvested Date"); // Keep Plant Name, Accepted, Total Yield, Price, Total Price, Status and Action
        }

        return baseColumns;
    }, [isXs]);


  const modalFields = useMemo(() => [
    { label: "Plant Name", key: "plant_name" },
    { label: "Accepted", key: "accepted" },
    { label: "Total Rejected", key: "total_rejected" },
    { label: "Total Yield", key: "total_yield" },
    { label: "Plant Type", key: "plant_type" },
    { label: "Price", key: "price" },
    { label: "Total Price", key: "total_price" },
    { label: "Harvest Date", key: "harvest_date" },
    { label: "Greenhouse ", key: "greenhouse_id" },
   // { label: "Greenhouse Name", key: "greenhouse_name" },
    { label: "Name", key: "name" },
    { label: "Notes", key: "notes" },
    //{ label: "Plant ID", key: "plant_id" },
    { label: "Planted Date", key: "planted_crop_planting_date" },
   // { label: "User ID", key: "user_id" },
    //{ label: "Harvest ID", key: "harvest_id" },
    // Add more fields here
  ], []);

  return harvestLoading ? (
    <HarvestSkeliton />
  ) : (
    <Box sx={{ overflowX: "auto", width: "100%" }}>
      <TableContainer sx={{ overflowX: "auto", borderBottom: "1px solid #999" }}>
        <Table sx={{ minWidth: isSmallScreen ? 350 : 650 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#06402B" }}>
                {tableColumns.map((header) => (
                    <TableCell
                        key={header}
                        align="center"
                        sx={{
                            fontWeight: "bold",
                            color: "#fff",
                            fontSize: { xs: "0.9rem", sm: "1rem" },
                            py: { xs: 2, sm: 2 },
                            borderBottom: "none",
                        }}
                    >
                        {header === "Status" ? (
                            <Box display="flex" alignItems="center" justifyContent="center">
                                Status
                                <IconButton onClick={toggleShowSold} size="small" sx={{ color: '#fff' }}>
                                    {showOnlySold ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
                                </IconButton>
                            </Box>
                        ) : header}
                    </TableCell>
                ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  <Typography variant="h8" severity="warning" sx={{ color: "#000" }}>
                    {noDataMessage.toUpperCase()}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredItems
                .slice(
                  harvestPage * rowsPerPage,
                  harvestPage * rowsPerPage + rowsPerPage
                )
                .map((item) => (
                  <TableRow key={item.harvest_id} >
                    {[
                      item.plant_name,
                      item.accepted,
                      item.total_yield,
                      item.price,
                      item.total_price,
                    ].map((value, index) => (
                      <TableCell
                        key={index}
                        align="center"
                        sx={{
                          fontSize: { xs: "0.8rem", sm: "1rem" },
                          py: { xs: 1, sm: 1.5 },
                          color: "#000",

                        }}
                      >
                        {value}
                      </TableCell>
                    ))}
                    {!isXs && (
                        <>
                            <TableCell align="center" sx={{
                                fontSize: { xs: "0.8rem", sm: "1rem" },
                                py: { xs: 1, sm: 1.5 },
                                color: "#000",

                            }}>
                                {item.total_rejected}
                            </TableCell>
                            <TableCell align="center" sx={{
                                fontSize: { xs: "0.8rem", sm: "1rem" },
                                py: { xs: 1, sm: 1.5 },
                                color: "#000",

                            }}>
                                {item.plant_type}
                            </TableCell>
                        </>
                    )}
                    <TableCell align="center">
                      {item.status === "Sold" ?  (
                          <>
                            <CheckCircleIcon color="success" sx={{mr:0.5}} /> Sold
                          </>
                        ) : (
                          <>
                            <CancelIcon color="error" sx={{mr:0.5}}/> Not Sold
                          </>
                        )}
                    </TableCell>
                    {!isXs && (
                        <TableCell align="center" sx={{
                            fontSize: { xs: "0.8rem", sm: "1rem" },
                            py: { xs: 1, sm: 1.5 },
                            color: "#000",

                        }}>
                            {item.harvest_date}
                        </TableCell>
                    )}
                    <TableCell align="center" sx={{ borderBottom: 'none' }}>
                      <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
                         {!showOnlySold ? (
                            <>
                              <Button
                                variant="contained"
                                color="warning"
                                size="small"
                                onClick={() => handleEditOpen(item.harvest_id, item.price)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                onClick={() => handleViewOpen(item)}
                              >
                                View
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              onClick={() => handleViewOpen(item)}
                            >
                              View
                            </Button>
                          )}

                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Price Modal */}
      {/* (Edit modal code - unchanged) */}
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
            width: { xs: '90%', sm: 400 }, // Responsive width
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
            value={newPrice}
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


      {/* View Modal */}
      <Modal
        open={viewModalOpen}
        onClose={handleViewClose}
        aria-labelledby="view-modal-title"
        aria-describedby="view-modal-description"
      >
        <Box sx={modalStyle}>
          {/* Close Icon */}
          <IconButton
            onClick={handleViewClose}
            sx={{ position: "absolute", top: 10, right: 10, color: "red" }}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" sx={{ textAlign: "center", mb: 5, fontSize: "1.2rem", color: "#000", fontWeight: "bold" }}>
            Harvest Details
          </Typography>

          {selectedItemData && (
            <div>
              {/* Grid layout for displaying the data */}
              <Grid container spacing={2}>
                {modalFields.map((field) => (
                    <React.Fragment key={field.key}>
                        <Grid item xs={6} sm={6}>
                            <Typography variant="body1" sx={labelStyle}>
                                {field.label}:
                            </Typography>
                        </Grid>
                        <Grid item xs={6} sm={6}>
                            <Typography variant="body1" sx={valueStyle}>
                                {selectedItemData[field.key]}
                            </Typography>
                        </Grid>
                    </React.Fragment>
                ))}
              </Grid>
            </div>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default HarvestTable;