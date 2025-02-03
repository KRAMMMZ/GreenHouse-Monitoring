import React, { useState } from "react";
import { Typography, TextField } from "@mui/material";
import HarvestSkeliton from "../skelitons/HarvestSkeliton";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import { useAuth } from "../contexts/AuthContext"; // Import your auth context
import axios from "axios";
import Swal from "sweetalert2";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "#d8d8d8",
  color: "#000",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
   
};

function UserManagement() {
  const [loading] = useState(true);
  const [open, setOpen] = useState(false);
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const { user } = useAuth();
  const loginId = user?.login_id;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPass !== confirmPass) {
        Swal.fire("Error", "New passwords don't match!", "error");
        return;
    }

    const storedUser = JSON.parse(localStorage.getItem("user")); // Retrieve stored user data
    const loginId = storedUser?.login_id; // Ensure loginId is retrieved

    if (!loginId) {
        Swal.fire("Error", "User not found. Please log in again.", "error");
        return;
    }

    try {
        const response = await axios.put(
            `http://localhost:3001/admin/${loginId}`, 
            { oldPass, newPass }, 
            { headers: { "Content-Type": "application/json" } }
        );

        if (response.data.success) {
            Swal.fire("Success", "Password changed successfully!", "success");
            handleClose();
            setOldPass("");
            setNewPass("");
            setConfirmPass("");
        }
    } catch (error) {
        Swal.fire("Error", error.response?.data?.message || "Password change failed", "error");
        console.error("Change Password Error:", error);
    }
};


  return (
    <div className="container-fluid p-3">
        <div className="d-flex align-items-center justify-content-between">
        <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", mb: 4 }}>
          USER MANAGEMENT
        </Typography>
        <Button className="d-none" onClick={handleOpen}>Open modal</Button>
      </div>
      <Modal open={open} onClose={handleClose}>
        <Box component="form" onSubmit={handleSubmit} sx={style}>
          <Typography variant="h6" component="h2" sx={{ mt: 2 }}>
            Change Password
          </Typography>
          <TextField
            label="Enter Old Password"
            type="password"
            fullWidth
            margin="normal"
            variant="outlined"
            value={oldPass}
            onChange={(e) => setOldPass(e.target.value)}
            InputProps={{ style: { backgroundColor: "white" } }}
            required
          />
          <TextField
            label="Enter New Password"
            type="password"
            fullWidth
            margin="normal"
            variant="outlined"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            InputProps={{ style: { backgroundColor: "white" } }}
            required
          />
          <TextField
            label="Confirm New Password"
            type="password"
            fullWidth
            margin="normal"
            variant="outlined"
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
            InputProps={{ style: { backgroundColor: "white" } }}
            required
          />
          <Button 
            type="submit" 
            variant="contained" 
            sx={{ mt: 2 }} 
            fullWidth
          >
            Confirm
          </Button>
        </Box>
      </Modal>
      <HarvestSkeliton />
    </div>
  );
}

export default UserManagement;