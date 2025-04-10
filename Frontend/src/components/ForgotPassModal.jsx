import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EmailIcon from "@mui/icons-material/Email";
import Swal from "sweetalert2";
import axios from "axios";
import "../../public/login.css"; // Keep your styles

const ForgotPasswordModal = ({ open, onClose }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Adjust SweetAlert z-index when the component mounts
    const style = document.createElement("style");
    style.innerHTML = `.swal2-container { z-index: 9999 !important; }`;
    document.head.appendChild(style);

    return () => {
      // Cleanup when component unmounts
      document.head.removeChild(style);
    };
  }, []);

  const handleConfirm = async () => {
    // Validate if email is provided
    if (!email) {
      setError("Please enter your email.");
      return;
    }

    // Validate email format using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError(""); // Clear error if email is provided and valid
    setLoading(true);

    // Show SweetAlert while processing
    Swal.fire({
      title: "Processing...",
      text: "Please wait while we send your request.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const response = await axios.post("http://localhost:3001/admin", { email });

      if (response.data.success) {
        Swal.fire({
          title: "Success",
          text: response.data.message, // Use message from backend
          icon: "success",
          timer: 10000, // 10 seconds duration
          timerProgressBar: true, // Countdown bar at bottom
          showConfirmButton: true,
          willClose: () => {
            onClose(); // Close modal after SweetAlert
            setEmail(""); // Clear email field after closing modal
          },
        });
      } else {
        throw new Error(response.data.message || "Failed to send reset link.");
      }
    } catch (error) {
      Swal.fire("Error", "Invalid Email", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEmail(""); // Clear email field when Cancel is clicked
    setError(""); // Clear error message
    onClose(); // Close the modal
  };

  return (
    <Modal open={open} onClose={handleCancel} disableEscapeKeyDown>
      <Box className="forgot-password-modal">
        {/* Close Button - Top Right */}
        <CloseIcon
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            cursor: "pointer",
          }}
          onClick={handleCancel}
        />
        {/* Centered Logo & Title */}
        <div className="modal-center-content">
          <img src="./src/assets/N_AGREEMO.png" alt="Logo" className="logo" />
          <Typography variant="h5" className="forgot-title mb-4">
            Forgot Password?
          </Typography>
        </div>

        {/* Left-aligned Verification Text */}
        <Typography variant="body2" className="verify-text mb-2 fw-bold">
          Verify your email:
        </Typography>

        {/* Email Input with Icon */}
        <TextField
          fullWidth
          type="email"
          variant="outlined"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError("");
          }}
          className="email-input mb-3"
          error={Boolean(error)}
          helperText={error}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon />
              </InputAdornment>
            ),
          }}
        />

        {/* Buttons Positioned Bottom Right */}
        <div className="modal-actions">
          <Button
            variant="contained"
            color="primary"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Processing..." : "Confirm"}
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </Box>
    </Modal>
  );
};

export default ForgotPasswordModal;
