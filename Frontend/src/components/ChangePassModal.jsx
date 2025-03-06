import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CloseIcon from "@mui/icons-material/Close";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Swal from "sweetalert2";
import axios from "axios";

function ChangePasswordModal({ open, onClose }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    // Adjust SweetAlert z-index when the component mounts
    const style = document.createElement("style");
    style.innerHTML = `
      .swal2-container {
        z-index: 9999 !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  /**
   * Validates that the new password:
   * - Has at least 8 characters
   * - Contains at least one letter and one digit
   */
  const validateNewPassword = (password) => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!password) {
      return "New password is required";
    } else if (!regex.test(password)) {
      return "Password must be at least 8 characters long and contain letters and digits";
    }
    return "";
  };

  const validateConfirmPassword = (confirmPwd) => {
    if (!confirmPwd) {
      return "Confirm password is required";
    } else if (newPassword !== confirmPwd) {
      return "Passwords do not match";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate fields
    const newErrors = {
      oldPassword: oldPassword ? "" : "Old password is required",
      newPassword: validateNewPassword(newPassword),
      confirmPassword: validateConfirmPassword(confirmPassword),
    };

    setErrors(newErrors);
    if (Object.values(newErrors).some((error) => error !== "")) {
      return;
    }

    try {
      Swal.fire({
        title: "Please wait...",
        text: "Loading...",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      // Call the dedicated change-password endpoint.
      // Make sure to include withCredentials so that the cookie is sent.
      const response = await axios.put(
        `http://localhost:3001/admin/change-password`,
        { old_password: oldPassword, new_password: newPassword },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        Swal.fire({
          title: "Password change successfully!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        }); onClose();
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "Password change failed",
        "error"
      );
      console.error("Change Password Error:", error);
    }
  };

  const handleCancel = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setErrors({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          Change Password
          <CloseIcon
            style={{ position: "absolute", top: 10, right: 10, cursor: "pointer" }}
            onClick={handleCancel}
          />
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Old Password"
            type={showOldPassword ? "text" : "password"}
            fullWidth
            variant="outlined"
            value={oldPassword}
            onChange={(e) => {
              setOldPassword(e.target.value);
              setErrors((prevErrors) => ({
                ...prevErrors,
                oldPassword: e.target.value ? "" : "Old password is required",
              }));
            }}
            margin="normal"
            InputProps={{
              endAdornment: (
                <Button onClick={() => setShowOldPassword(!showOldPassword)}>
                  {showOldPassword ? <Visibility /> : <VisibilityOff />}
                </Button>
              ),
            }}
          />
          {errors.oldPassword && (
            <p style={{ color: "red", fontSize: "0.8rem" }}>{errors.oldPassword}</p>
          )}
          <TextField
            label="New Password"
            type={showNewPassword ? "text" : "password"}
            fullWidth
            variant="outlined"
            value={newPassword}
            onChange={(e) => {
              const value = e.target.value;
              setNewPassword(value);
              setErrors((prevErrors) => ({
                ...prevErrors,
                newPassword: validateNewPassword(value),
                confirmPassword:
                  confirmPassword && value !== confirmPassword
                    ? "Passwords do not match"
                    : prevErrors.confirmPassword,
              }));
            }}
            margin="normal"
            InputProps={{
              endAdornment: (
                <Button onClick={() => setShowNewPassword(!showNewPassword)}>
                  {showNewPassword ? <Visibility /> : <VisibilityOff />}
                </Button>
              ),
            }}
          />
          {errors.newPassword && (
            <p style={{ color: "red", fontSize: "0.8rem" }}>{errors.newPassword}</p>
          )}
          <TextField
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            fullWidth
            variant="outlined"
            value={confirmPassword}
            onChange={(e) => {
              const value = e.target.value;
              setConfirmPassword(value);
              setErrors((prevErrors) => ({
                ...prevErrors,
                confirmPassword: validateConfirmPassword(value),
              }));
            }}
            margin="normal"
            InputProps={{
              endAdornment: (
                <Button onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                </Button>
              ),
            }}
          />
          {errors.confirmPassword && (
            <p style={{ color: "red", fontSize: "0.8rem" }}>{errors.confirmPassword}</p>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="primary" type="submit">
            Confirm
          </Button>
          <Button variant="contained" color="error" onClick={handleCancel}>
            Cancel
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default ChangePasswordModal;
