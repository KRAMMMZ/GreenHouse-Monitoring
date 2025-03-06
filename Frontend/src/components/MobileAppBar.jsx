import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  Box,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BarChartIcon from "@mui/icons-material/BarChart";
import ReportIcon from "@mui/icons-material/Report";
import GroupIcon from "@mui/icons-material/Group";
import EventNoteIcon from "@mui/icons-material/EventNote";
import GrainIcon from "@mui/icons-material/Grain";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import LockIcon from "@mui/icons-material/Lock";
import LogoutIcon from "@mui/icons-material/Logout";

import { useAuth } from "../contexts/AuthContext";
import ChangePasswordModal from "./ChangePassModal";

// Same items as the sidebar, minus Harvest (which is a dropdown)
const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
  { text: "Graphs", icon: <BarChartIcon />, path: "/graphs" },
  { text: "Reports", icon: <ReportIcon />, path: "/reports" },
  { text: "User Management", icon: <GroupIcon />, path: "/userManagement" },
  { text: "Activity Logs", icon: <EventNoteIcon />, path: "/activitylogs" },
];

function MobileAppBar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Main menu state (hamburger menu)
  const [anchorEl, setAnchorEl] = useState(null);
  // Harvest submenu state
  const [harvestAnchorEl, setHarvestAnchorEl] = useState(null);
  // Account menu state (account icon)
  const [accountAnchorEl, setAccountAnchorEl] = useState(null);
  // Change Password modal state
  const [openChangePassModal, setOpenChangePassModal] = useState(false);

  // Hamburger Menu handlers
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    handleHarvestMenuClose();
  };

  // Harvest submenu handlers
  const handleHarvestMenuOpen = (event) => {
    setHarvestAnchorEl(event.currentTarget);
  };
  const handleHarvestMenuClose = () => {
    setHarvestAnchorEl(null);
  };

  // Account menu handlers
  const handleAccountMenuOpen = (event) => {
    setAccountAnchorEl(event.currentTarget);
  };
  const handleAccountMenuClose = () => {
    setAccountAnchorEl(null);
  };

  // Navigation
  const handleNavigation = (path) => {
    navigate(path);
    handleMenuClose();
  };

  // Logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout Error:", error);
    }
    handleAccountMenuClose();
  };

  // Change Password Modal
  const changePassModal = () => {
    setOpenChangePassModal(true);
    handleAccountMenuClose();
  };
  const closeChangePassModal = () => {
    setOpenChangePassModal(false);
  };

  return (
    <>
      {/* Fixed AppBar */}
      <AppBar position="fixed" sx={{ backgroundColor: "#06402B" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {/* Hamburger Menu Icon on the left */}
          <IconButton edge="start" color="inherit" onClick={handleMenuOpen}>
            <MenuIcon />
          </IconButton>

          {/* Centered Title */}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: "center" }}>
            AGREEMO
          </Typography>

          {/* Account Icon on the right */}
          <IconButton edge="end" color="inherit" onClick={handleAccountMenuOpen}>
            <AccountCircleIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Push content down */}
      <Toolbar />

      {/* Main Menu (Hamburger) */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        keepMounted
      >
        {menuItems.map((item) => (
          <MenuItem key={item.text} onClick={() => handleNavigation(item.path)}>
            <ListItemIcon sx={{ minWidth: 35 }}>
              {item.icon}
            </ListItemIcon>
            {item.text}
          </MenuItem>
        ))}

        {/* Harvest dropdown */}
        <MenuItem onClick={handleHarvestMenuOpen}>
          <ListItemIcon sx={{ minWidth: 35 }}>
            <GrainIcon />
          </ListItemIcon>
          Harvests
        </MenuItem>
        <Menu
          anchorEl={harvestAnchorEl}
          open={Boolean(harvestAnchorEl)}
          onClose={handleHarvestMenuClose}
          keepMounted
        >
          <MenuItem onClick={() => handleNavigation("/harvests")}>
            <ListItemIcon sx={{ minWidth: 35 }}>
              <CheckCircleIcon fontSize="small" />
            </ListItemIcon>
            Harvested
          </MenuItem>
          <MenuItem onClick={() => handleNavigation("/rejected")}>
            <ListItemIcon sx={{ minWidth: 35 }}>
              <CancelIcon fontSize="small" />
            </ListItemIcon>
            Rejected
          </MenuItem>
        </Menu>
      </Menu>

      {/* Account Menu (from Account Icon) */}
      <Menu
        anchorEl={accountAnchorEl}
        open={Boolean(accountAnchorEl)}
        onClose={handleAccountMenuClose}
        keepMounted
      >
        <MenuItem onClick={changePassModal}>
          <ListItemIcon sx={{ minWidth: 35 }}>
            <LockIcon fontSize="small" />
          </ListItemIcon>
          Change Password
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon sx={{ minWidth: 35 }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Change Password Modal */}
      <ChangePasswordModal open={openChangePassModal} onClose={closeChangePassModal} />
    </>
  );
}

export default MobileAppBar;
