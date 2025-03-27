import React from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Avatar,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useAuth } from "../contexts/AuthContext";

function ProfileModal({ open, onClose }) {
  // Get user data from your AuthContext
  const { user } = useAuth();

  // Example inline styling for the modal
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 350,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        {/* Profile image + edit icon */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <Box sx={{ position: "relative" }}>
            <Avatar
              sx={{ width: 80, height: 80 }}
              src={user?.profilePicture || "https://via.placeholder.com/150"}
              alt="Profile"
            />
            <IconButton
              size="small"
              sx={{
                position: "absolute",
                bottom: 0,
                right: 0,
                backgroundColor: "#fff",
                boxShadow: 1,
              }}
              // onClick={() => console.log("Edit profile picture")}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Username */}
        <Typography variant="body1" sx={{ mb: 1 }}>
          Name
        </Typography>
        <TextField
          fullWidth
          size="small"
          value={user?.name || ""}
          InputProps={{ readOnly: true }}
          sx={{ mb: 2 }}
        />

        {/* Email */}
        <Typography variant="body1" sx={{ mb: 1 }}>
          Email
        </Typography>
        <TextField
          fullWidth
          size="small"
          value={user?.email || ""}
          InputProps={{ readOnly: true }}
        />
      </Box>
    </Modal>
  );
}

export default ProfileModal;
