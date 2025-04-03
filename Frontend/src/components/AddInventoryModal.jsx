import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  IconButton,
  MenuItem,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const InventoryModal = ({ open, handleClose }) => {
  const [formValues, setFormValues] = useState({
    greenhouse: "",
    type: "",
    quantity: "",
    criticalLevel: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Submit logic goes here
    console.log("Form Submitted:", formValues);
    handleClose();
  };

  const style = {
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

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="h2">
            Add Inventory Item
          </Typography>
          <IconButton onClick={handleClose} sx={{color:"red"}}>
            <CloseIcon  />
          </IconButton>
        </Box>

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {/* Greenhouse Dropdown */}
          <TextField
            select
            label="Greenhouse"
            name="greenhouse"
            value={formValues.greenhouse}
            onChange={handleChange}
            fullWidth
            margin="normal"
          >
            {Array.from({ length: 10 }, (_, i) => (
              <MenuItem key={i + 1} value={i + 1}>
                {i + 1}
              </MenuItem>
            ))}
          </TextField>

          {/* Type Dropdown */}
          <TextField
            select
            label="Type"
            name="type"
            value={formValues.type}
            onChange={handleChange}
            fullWidth
            margin="normal"
          >
            {["ph_up", "ph_down", "solution_a", "solution_b"].map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>

          {/* Quantity Field */}
          <TextField
            label="Quantity"
            name="quantity"
            type="number"
            value={formValues.quantity}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />

          {/* Critical Level Field */}
          <TextField
            label="Critical Level"
            name="criticalLevel"
            type="number"
            value={formValues.criticalLevel}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            
            fullWidth
            sx={{ mt: 2 , backgroundColor: "#06402B"}}
          >
            Add Inventory
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default InventoryModal;
