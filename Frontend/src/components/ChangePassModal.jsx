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
      // Cleanup when component unmounts
      document.head.removeChild(style);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {
      oldPassword: oldPassword ? "" : "Old password is required",
      newPassword: newPassword ? "" : "New password is required",
      confirmPassword: confirmPassword ? "" : "Confirm password is required",
    };

    setErrors(newErrors);
    if (Object.values(newErrors).some((error) => error !== "")) {
      return;
    }

    if (newPassword !== confirmPassword) {
      Swal.fire("Error", "New passwords don't match!", "error");
      return;
    }

    const storedUser = JSON.parse(localStorage.getItem("user"));
    const email = storedUser;
    if (!email) {
      Swal.fire("Error", "User not found. Please log in again.", "error");
      return;
    }
     
    try {
      
      const response = await axios.put(
        `http://localhost:3001/admin/${email}`,  
        { old_password: oldPassword, new_password: newPassword }, 
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        Swal.fire("Success", "Password changed successfully!", "success");
        onClose(); 
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Password change failed", "error");
      console.error("Change Password Error:", error);
    }
};


  const handleCancel = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    onClose(); // Close the modal after clearing the fields
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>
        Change Password
        <CloseIcon
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            cursor: "pointer",
          }}
          onClick={handleCancel}
        />
      </DialogTitle>
      <DialogContent>
        {/* Old Password */}
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
              <Button onClick={() => setShowOldPassword(!showOldPassword)} style={{ cursor: "pointer" }}>
                {showOldPassword ? <Visibility /> : <VisibilityOff />}
              </Button>
            ),
          }}
        />
        {errors.oldPassword && <p style={{ color: "red", fontSize: "0.8rem" }}>{errors.oldPassword}</p>}

        {/* New Password */}
        <TextField
          label="New Password"
          type={showNewPassword ? "text" : "password"}
          fullWidth
          variant="outlined"
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            setErrors((prevErrors) => ({
              ...prevErrors,
              newPassword: e.target.value ? "" : "New password is required",
            }));
          }}
          margin="normal"
          InputProps={{
            endAdornment: (
              <Button onClick={() => setShowNewPassword(!showNewPassword)} style={{ cursor: "pointer" }}>
                {showNewPassword ? <Visibility /> : <VisibilityOff />}
              </Button>
            ),
          }}
        />
        {errors.newPassword && <p style={{ color: "red", fontSize: "0.8rem" }}>{errors.newPassword}</p>}

        {/* Confirm Password */}
        <TextField
          label="Confirm Password"
          type={showConfirmPassword ? "text" : "password"}
          fullWidth
          variant="outlined"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setErrors((prevErrors) => ({
              ...prevErrors,
              confirmPassword: e.target.value ? "" : "Confirm password is required",
            }));
          }}
          margin="normal"
          InputProps={{
            endAdornment: (
              <Button onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ cursor: "pointer" }}>
                {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
              </Button>
            ),
          }}
        />
        {errors.confirmPassword && <p style={{ color: "red", fontSize: "0.8rem" }}>{errors.confirmPassword}</p>}
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Confirm
        </Button>
        <Button variant="contained" color="error" onClick={handleCancel}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ChangePasswordModal;
