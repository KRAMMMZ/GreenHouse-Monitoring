import React from "react";
import { Box, Typography, TextField, Button, Divider, Modal } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// Create a custom theme for the DatePicker components
const theme = createTheme({
  components: {
    // Customize the calendar header (day-of-week labels)
    MuiPickersCalendarHeader: {
      styleOverrides: {
        dayLabel: {
          backgroundColor: "#4169E1", // Set your desired header background color here
          color: "#000",
          fontWeight: "bold",
          padding: "8px 0",
        },
      },
    },
    // Customize the individual day cells
    MuiPickersDay: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "#4169E1",
            color:"#fff",
          },
        },
      },
    },
  },
});

const CustomDateModal = ({
  openDateModal,
  setOpenDateModal,
  customFrom,
  setCustomFrom,
  customTo,
  setCustomTo,
  handleApplyCustomDates,
}) => {
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
    <Modal open={openDateModal} onClose={() => setOpenDateModal(false)}>
      <Box sx={modalStyle}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Choose Date Range
        </Typography>
        {/* Wrap the DatePicker components with ThemeProvider to apply the custom theme */}
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="FROM"
              value={customFrom}
              onChange={(newValue) => setCustomFrom(newValue)}
              renderInput={(params) => (
                <TextField {...params} fullWidth sx={{ mb: 4 }} />
              )}
            />
            <Divider sx={{ my: 2, bgcolor: "grey.300" }} />
            <DatePicker
              label="TO"
              value={customTo}
              onChange={(newValue) => setCustomTo(newValue)}
              renderInput={(params) => (
                <TextField {...params} fullWidth sx={{ mb: 4 }} />
              )}
            />
          </LocalizationProvider>
        </ThemeProvider>
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
  );
};

export default CustomDateModal;
