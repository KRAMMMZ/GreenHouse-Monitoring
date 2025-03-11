import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from "@mui/material";

const VerificationModal = ({ open, onClose, onVerify, selectedUser }) => {
  const [adminPassword, setAdminPassword] = useState("");
  const [errorText, setErrorText] = useState("");

  // Clear the password field and error message when the modal closes. 
  useEffect(() => {
    if (!open) {
      setAdminPassword("");
      setErrorText("");
    }
  }, [open]);

  const handleVerify = () => {
    if (adminPassword.trim() === "") {
      setErrorText("Password cannot be empty");
      return;
    }
    // Clear error and proceed with verification
    setErrorText("");
    onVerify(adminPassword);
  };

  const handleClose = () => {
    setAdminPassword("");
    setErrorText("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        // Prevent closing if clicking outside or pressing escape.
        if (reason === "backdropClick" || reason === "escapeKeyDown") return;
        handleClose();
      }}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle sx={{ fontWeight: "bold" }}>Verify Credentials</DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ mt: 2 }}>
          <TextField
            margin="dense"
            label="User Email"
            type="email"
            fullWidth
            value={selectedUser ? selectedUser.userEmail : ""}
            disabled
            variant="outlined"
          />
          <TextField
            margin="dense"
            label="Admin Password"
            type="password"
            fullWidth
            variant="outlined"
            value={adminPassword}
            onChange={(e) => {
              setAdminPassword(e.target.value);
              // Remove error text if user types any input
              if (e.target.value.trim() !== "") {
                setErrorText("");
              }
            }}
            // Trigger verify when the user presses Enter.
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleVerify();
              }
            }}
            error={!!errorText}
            helperText={errorText}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleVerify} variant="contained" color="primary">
          Verify
        </Button>
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VerificationModal;
