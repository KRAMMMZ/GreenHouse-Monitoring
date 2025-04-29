import React, { useState } from "react";
import { Modal, Box, Typography, IconButton, Grid } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
  maxHeight: "85vh",
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

const RejectionDetailsModal = ({ open, onClose, rejection }) => {
  if (!rejection) return null;

  const details = [
    { label: "Rejection ID", value: rejection.rejection_id },
    { label: "Plant ID", value: rejection.plant_id },
    { label: "Plant Name", value: rejection.plant_name },
    { label: "Greenhouse ID", value: rejection.greenhouse_id },
    { label: "User Name", value: rejection.name?.toUpperCase() || "N/A" }, // Handle undefined name
    { label: "Quantity", value: rejection.quantity },
    { label: "Price", value: rejection.price },
    { label: "Deduction Rate (%)", value: rejection.deduction_rate },
    { label: "Total Price", value: rejection.total_price },
    { label: "Type", value: rejection.type },
    { label: "Status", value: rejection.status },
    { label: "Rejection Date", value: rejection.rejection_date },
    { label: "Comments", value: rejection.comments },
  ];

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", top: 10, right: 10, color: "red" }}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" sx={{ textAlign: "center", mb: 3, fontSize: "1.2rem", color: "#000", fontWeight: "bold" }}>
          Rejection Details
        </Typography>

        {details.map((detail, index) => (
          <Box
            key={index}
            sx={{
              borderBottom: index !== details.length - 1 ? "1px solid #999" : "none",
              mb: 1,
              p: 1,
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body1" sx={labelStyle}>
                  {detail.label}:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" sx={valueStyle}>
                  {detail.value}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        ))}
      </Box>
    </Modal>
  );
};

export default RejectionDetailsModal;