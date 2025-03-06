import React, { useState, useEffect } from "react";
import { styled, useTheme } from "@mui/material/styles";
import MuiDrawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { Typography, Tooltip, Menu, MenuItem } from "@mui/material";
import EventNoteIcon from "@mui/icons-material/EventNote";
import BarChartIcon from "@mui/icons-material/BarChart";
import GroupIcon from "@mui/icons-material/Group";
import ReportIcon from "@mui/icons-material/Report";
import GrainIcon from "@mui/icons-material/Grain";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Collapse from "@mui/material/Collapse";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import MenuPopupState from "./UserLogout";
import ChangePasswordModal from "./ChangePassModal";

const drawerWidth = 300;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.standard,
  }),
  overflowX: "hidden",
  backgroundColor: "#06402B",
  color: "#FFFFFF",
  height: "100vh",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.standard,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
  backgroundColor: "#06402B",
  color: "#FFFFFF",
  height: "100vh",
});

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  position: "fixed",
  width: open ? drawerWidth : 0,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  "& .MuiDrawer-paper": {
    position: "fixed",
    width: drawerWidth,
    height: "100vh",
    overflowX: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.standard,
    }),
    ...(!open && closedMixin(theme)),
    ...(open && openedMixin(theme)),
  },
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

// Define menu items for non-dropdown options
const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
  { text: "Graphs", icon: <BarChartIcon />, path: "/graphs" },
  { text: "Reports", icon: <ReportIcon />, path: "/reports" },
  { text: "User Management", icon: <GroupIcon />, path: "/userManagement" },
  { text: "Activity Logs", icon: <EventNoteIcon />, path: "/activitylogs" },
];

function Sidebar({ open, setOpen }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [selectedItem, setSelectedItem] = useState(null);
  const [openChangePassModal, setOpenChangePassModal] = useState(false);
  // State to control dropdown for Harvests when sidebar is expanded
  const [harvestOpen, setHarvestOpen] = useState(false);
  // State for the harvest menu anchor when sidebar is collapsed
  const [harvestMenuAnchorEl, setHarvestMenuAnchorEl] = useState(null);

  // Load selected menu item from localStorage on mount
  useEffect(() => {
    const storedItem = localStorage.getItem("selectedMenuItem");
    if (storedItem) {
      setSelectedItem(storedItem);
    }
  }, []);

  // Update selected menu item when clicking
  const handleNavigation = (path) => {
    setSelectedItem(path);
    localStorage.setItem("selectedMenuItem", path);
    navigate(path);
  };

  const changePassModal = () => {
    setOpenChangePassModal(true);
  };

  const closeChangePassModal = () => {
    setOpenChangePassModal(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem("selectedMenuItem"); // Clear selection on logout
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  // Determine if Harvest dropdown should appear as selected
  const isHarvestSelected =
    selectedItem === "/harvests" || selectedItem === "/rejected";

  // Helper to render a menu item with tooltip if sidebar is collapsed
  const renderMenuItem = (item, extraSx = {}) => {
    const content = (
      <ListItemButton
        onClick={() => handleNavigation(item.path)}
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          px: 1,
          py: 1,
          mb: 1,
          borderRadius: "16px",
          backgroundColor:
            selectedItem === item.path ? "#f8eeec" : "transparent",
          "&:hover": { backgroundColor: "#2e6f40" },
          ...extraSx,
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 0,
            mx: open ? 2 : "auto",
            justifyContent: "center",
            color: selectedItem === item.path ? "#000000" : "#FFFFFF",
            "& svg": { fontSize: 25, verticalAlign: "middle" },
          }}
        >
          {item.icon}
        </ListItemIcon>
        {open && (
          <ListItemText
            primary={item.text}
            sx={{
              color: selectedItem === item.path ? "#000000" : "#FFFFFF",
              fontSize: "1rem",
              fontWeight: 500,
              whiteSpace: "nowrap",
            }}
          />
        )}
      </ListItemButton>
    );

    return open ? (
      content
    ) : (
      <Tooltip title={item.text} placement="right">
        {content}
      </Tooltip>
    );
  };

  // Handle harvest button click based on sidebar state
  const handleHarvestClick = (event) => {
    if (open) {
      setHarvestOpen(!harvestOpen);
    } else {
      setHarvestMenuAnchorEl(event.currentTarget);
    }
  };

  const handleHarvestMenuClose = () => {
    setHarvestMenuAnchorEl(null);
  };

  return (
    <>
      <Drawer variant="permanent" open={open}>
        <DrawerHeader sx={{ px: open ? 4 : 2, py: 2 }}>
          <Typography
            variant="h5"
            noWrap
            sx={{ color: "#FFFFFF", marginTop: 2 }}
          >
            AGREEMO
          </Typography>
          <IconButton
            sx={{
              color: "#ffffff",
              marginLeft: "auto",
              transform: open ? "translateX(0)" : "translateX(-8px)",
            }}
            onClick={setOpen}
          >
            {open ? (
              <ChevronLeftIcon sx={{ fontSize: 30, marginTop: 2 }} />
            ) : (
              <ChevronRightIcon
                sx={{ fontSize: 30, marginTop: 2, marginLeft: 0 }}
              />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider sx={{ my: 2, backgroundColor: "#FFFFFF" }} />

        <List
          sx={{
            mx: 2,
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <div style={{ flexGrow: 1 }}>
            {/* Render first two menu items */}
            {menuItems.slice(0, 2).map((item) => (
              <ListItem
                key={item.text}
                disablePadding
                sx={{ display: "flex", justifyContent: "center" }}
              >
                {renderMenuItem(item)}
              </ListItem>
            ))}

            {/* Harvest dropdown positioned as 3rd item */}
            <ListItem disablePadding sx={{ display: "flex", justifyContent: "center" }}>
              {open ? (
                <ListItemButton
                  onClick={handleHarvestClick}
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    px: 1,
                    py: 1,
                    mb: 1,
                    borderRadius: "16px",
                    backgroundColor: isHarvestSelected ? "#f8eeec" : "transparent",
                    "&:hover": { backgroundColor: "#2e6f40" },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mx: open ? 2 : "auto",
                      justifyContent: "center",
                      color: isHarvestSelected ? "#000000" : "#FFFFFF",
                      "& svg": { fontSize: 25, verticalAlign: "middle" },
                    }}
                  >
                    <GrainIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Harvests Items"
                    sx={{
                      color: isHarvestSelected ? "#000000" : "#FFFFFF",
                      fontSize: "1rem",
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                    }}
                  />
                  {harvestOpen ? (
                    <ExpandLess sx={{ color: isHarvestSelected ? "#000000" : "#FFFFFF" }} />
                  ) : (
                    <ExpandMore sx={{ color: isHarvestSelected ? "#000000" : "#FFFFFF" }} />
                  )}
                </ListItemButton>
              ) : (
                <Tooltip title="Harvests" placement="right">
                  <ListItemButton
                    onClick={handleHarvestClick}
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      px: 1,
                      py: 1,
                      mb: 1,
                      borderRadius: "16px",
                      backgroundColor: isHarvestSelected ? "#f8eeec" : "transparent",
                      "&:hover": { backgroundColor: "#2e6f40" },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mx: "auto",
                        justifyContent: "center",
                        color: isHarvestSelected ? "#000000" : "#FFFFFF",
                        "& svg": { fontSize: 25, verticalAlign: "middle" },
                      }}
                    >
                      <GrainIcon />
                    </ListItemIcon>
                  </ListItemButton>
                </Tooltip>
              )}
            </ListItem>
            {open && (
              <Collapse in={harvestOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {/* Harvested item */}
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => handleNavigation("/harvests")}
                      sx={{
                        pl: 4,
                        mb: 1,
                        justifyContent: "flex-start",
                        borderRadius: "16px",
                        backgroundColor:
                          selectedItem === "/harvests" ? "#f8eeec" : "transparent",
                        "&:hover": { backgroundColor: "#2e6f40" },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: 2,
                          justifyContent: "center",
                          color:
                            selectedItem === "/harvests" ? "#000000" : "#FFFFFF",
                          "& svg": { fontSize: 20, verticalAlign: "middle" },
                        }}
                      >
                        <CheckCircleIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Harvested"
                        sx={{
                          color:
                            selectedItem === "/harvests" ? "#000000" : "#FFFFFF",
                          fontSize: "0.95rem",
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                  {/* Rejected item */}
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => handleNavigation("/rejected")}
                      sx={{
                        pl: 4,
                        mb: 1,
                        justifyContent: "flex-start",
                        borderRadius: "16px",
                        backgroundColor:
                          selectedItem === "/rejected" ? "#f8eeec" : "transparent",
                        "&:hover": { backgroundColor: "#2e6f40" },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: 2,
                          justifyContent: "center",
                          color:
                            selectedItem === "/rejected" ? "#000000" : "#FFFFFF",
                          "& svg": { fontSize: 20, verticalAlign: "middle" },
                        }}
                      >
                        <CancelIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Rejected"
                        sx={{
                          color:
                            selectedItem === "/rejected" ? "#000000" : "#FFFFFF",
                          fontSize: "0.95rem",
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                </List>
              </Collapse>
            )}

            {/* Render remaining menu items */}
            {menuItems.slice(2).map((item) => (
              <ListItem
                key={item.text}
                disablePadding
                sx={{ display: "flex", justifyContent: "center" }}
              >
                {renderMenuItem(item)}
              </ListItem>
            ))}
          </div>

          <Divider sx={{ my: 1, backgroundColor: "#FFFFFF" }} />
          <MenuPopupState handleLogout={handleLogout} changePassModal={changePassModal} />
          <ChangePasswordModal open={openChangePassModal} onClose={closeChangePassModal} />
        </List>
      </Drawer>

      {/* Menu for Harvest items when sidebar is collapsed */}
      <Menu
        anchorEl={harvestMenuAnchorEl}
        open={Boolean(harvestMenuAnchorEl)}
        onClose={handleHarvestMenuClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <MenuItem
          onClick={() => {
            handleNavigation("/harvests");
            handleHarvestMenuClose();
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: 2,
              justifyContent: "center",
              "& svg": { fontSize: 20, verticalAlign: "middle" },
            }}
          >
            <CheckCircleIcon />
          </ListItemIcon>
          <ListItemText primary="Harvested" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleNavigation("/rejected");
            handleHarvestMenuClose();
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: 2,
              justifyContent: "center",
              "& svg": { fontSize: 20, verticalAlign: "middle" },
            }}
          >
            <CancelIcon />
          </ListItemIcon>
          <ListItemText primary="Rejected" />
        </MenuItem>
      </Menu>
    </>
  );
}

export default Sidebar;
