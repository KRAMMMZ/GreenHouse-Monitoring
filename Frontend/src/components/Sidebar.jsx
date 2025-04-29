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
import { Typography, Menu, MenuItem } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
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
import BuildIcon from "@mui/icons-material/Build";
import SettingsIcon from "@mui/icons-material/Settings";
import DevicesIcon from "@mui/icons-material/Devices";
import InventoryIcon from "@mui/icons-material/Inventory";
import OpacityIcon from '@mui/icons-material/Opacity';
import DescriptionIcon from '@mui/icons-material/Description';
import LocalFloristIcon from "@mui/icons-material/LocalFlorist";
import InsertChartIcon from '@mui/icons-material/InsertChart';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import MenuPopupState from "./UserLogout";
import ChangePasswordModal from "./ChangePassModal";
import ProfileModal from "./ProfileModal"; // <--- NEW

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
    borderRight: "1px solid #666",
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

// Non-dropdown menu items reordered
const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
  { text: "Graphs", icon: <BarChartIcon />, path: "/graphs" },
  { text: "Sales", icon: <InsertChartIcon />, path: "/crop-sales" },
  { text: "Planted Crops", icon: <LocalFloristIcon />, path: "/planted-crops" },
  { text: "Inventory Item", path: "/inventory", icon: <InventoryIcon /> },
  { text: "User Management", icon: <GroupIcon />, path: "/userManagement" },
  { text: "Activity Logs", icon: <EventNoteIcon />, path: "/activitylogs" },
];

// Dropdown sub-items
const harvestSubItems = [
  { label: "Harvested", path: "/harvests", icon: <CheckCircleIcon /> },
  { label: "Rejected", path: "/rejected", icon: <CancelIcon /> },
];

const InventorySubItems = [
  { label: "Inventory Item", path: "/inventory", icon: <DescriptionIcon /> },
  { label: "Inventory Container", path: "/inventory-container", icon: <OpacityIcon /> },
];


const maintenanceSubItems = [
  { label: "Reports", path: "/reports", icon: <ReportIcon /> },
  {
    label: "Hardware Components",
    path: "/hardware-components",
    icon: <DevicesIcon />,
  },
  {
    label: "Hardware Status",
    path: "/hardware-status",
    icon: <SettingsIcon />,
  },
];

// Common style objects
const commonButtonStyle = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  px: 1,
  py: 1,
  mb: 1,
  borderRadius: "16px",
  "&:hover": { backgroundColor: "#0A6644" },
};

const getActiveStyle = (active) => ({
  backgroundColor: active ? "#f8eeec" : "transparent",
});

const Sidebar = ({ open, setOpen }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [selectedItem, setSelectedItem] = useState(null);
  const [openChangePassModal, setOpenChangePassModal] = useState(false);

  // NEW: Profile modal state
  const [openProfileModal, setOpenProfileModal] = useState(false);

  // Dropdown states for Harvest and Maintenance
  const [harvestOpen, setHarvestOpen] = useState(false);
  const [harvestAnchorEl, setHarvestAnchorEl] = useState(null);
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const [maintenanceAnchorEl, setMaintenanceAnchorEl] = useState(null);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [inventoryAnchorEl, setInventoryAnchorEl] = useState(null);

  useEffect(() => {
    const storedItem = localStorage.getItem("selectedMenuItem");
    if (storedItem) setSelectedItem(storedItem);
  }, []);

  const handleNavigation = (path) => {
    setSelectedItem(path);
    localStorage.setItem("selectedMenuItem", path);
    navigate(path);
  };

  // Functions for change password modal
  const changePassModal = () => setOpenChangePassModal(true);
  const closeChangePassModal = () => setOpenChangePassModal(false);

  // NEW: Functions for profile modal
  const showProfileModal = () => setOpenProfileModal(true);
  const closeProfileModal = () => setOpenProfileModal(false);

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem("selectedMenuItem");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const isHarvestActive =
    selectedItem === "/harvests" || selectedItem === "/rejected";
    const isInventoryAactive =
    selectedItem === "/inventory" || selectedItem === "/inventory-container";
  const isMaintenanceActive =
    selectedItem === "/reports" ||
    selectedItem === "/hardware-components" ||
    selectedItem === "/hardware-status";

  // Render a regular (non-dropdown) menu item
  const renderMenuItem = (item) => (
    <ListItem
      key={item.text}
      disablePadding
      sx={{ display: "flex", justifyContent: "center" }}
    >
      <ListItemButton
        onClick={() => handleNavigation(item.path)}
        sx={{
          ...commonButtonStyle,
          ...getActiveStyle(selectedItem === item.path),
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
    </ListItem>
  );

  // Render a dropdown button (for expanded sidebar)
  const renderDropdownButton = ({
    label,
    icon,
    active,
    openState,
    onClick,
  }) => (
    <ListItem disablePadding sx={{ display: "flex", justifyContent: "center" }}>
      <ListItemButton
        onClick={onClick}
        sx={{
          ...commonButtonStyle,
          ...getActiveStyle(active),
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 0,
            mx: open ? 2 : "auto",
            justifyContent: "center",
            color: active ? "#000000" : "#FFFFFF",
            "& svg": { fontSize: 25, verticalAlign: "middle" },
          }}
        >
          {icon}
        </ListItemIcon>
        {open && (
          <>
            <ListItemText
              primary={label}
              sx={{
                color: active ? "#000000" : "#FFFFFF",
                fontSize: "1rem",
                fontWeight: 500,
                whiteSpace: "nowrap",
              }}
            />
            {openState ? (
              <ExpandLess sx={{ color: active ? "#000000" : "#FFFFFF" }} />
            ) : (
              <ExpandMore sx={{ color: active ? "#000000" : "#FFFFFF" }} />
            )}
          </>
        )}
      </ListItemButton>
    </ListItem>
  );

  // Render dropdown collapse for expanded sidebar using the proper open state
  const renderDropdownCollapse = (subItems, openState) => (
    <Collapse in={openState} timeout="auto" unmountOnExit>
      <List component="div" disablePadding>
        {subItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              sx={{
                pl: 4,
                mb: 1,
                justifyContent: "flex-start",
                borderRadius: "16px",
                ...getActiveStyle(selectedItem === item.path),
                "&:hover": { backgroundColor: "#0A6644" },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: 2,
                  justifyContent: "center",
                  color: selectedItem === item.path ? "#000000" : "#FFFFFF",
                  "& svg": { fontSize: 20, verticalAlign: "middle" },
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                sx={{
                  color: selectedItem === item.path ? "#000000" : "#FFFFFF",
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Collapse>
  );

  // Render collapsed dropdown menu (for collapsed sidebar)
  const renderCollapsedMenu = (anchorEl, subItems, handleClose) => (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
    >
      {subItems.map((item) => (
        <MenuItem
          key={item.label}
          onClick={() => {
            handleNavigation(item.path);
            handleClose();
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
            {item.icon}
          </ListItemIcon>
          <ListItemText primary={item.label} />
        </MenuItem>
      ))}
    </Menu>
  );

  // Handlers for dropdown clicks (expanded vs. collapsed behavior)
  const handleHarvestClick = (event) => {
    open
      ? setHarvestOpen(!harvestOpen)
      : setHarvestAnchorEl(event.currentTarget);
  };
  const handleInventoryClick = (event) => {
    open
      ? setInventoryOpen(!inventoryOpen)
      : setInventoryAnchorEl(event.currentTarget);
  };
  const handleMaintenanceClick = (event) => {
    open
      ? setMaintenanceOpen(!maintenanceOpen)
      : setMaintenanceAnchorEl(event.currentTarget);
  };

  return (
    <>
      <Drawer variant="permanent" open={open}>
        <DrawerHeader sx={{ px: open ? 4 : 2, py: 2 }}>
          <Typography variant="h5" noWrap sx={{ color: "#FFFFFF", marginTop: 2 }}>
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
              <ChevronRightIcon sx={{ fontSize: 30, marginTop: 2 }} />
            )}
          </IconButton>
        </DrawerHeader>

        <Divider sx={{ my: 1, borderBottomWidth: "2px", borderColor: "#FFFFFF" }} />

        <List sx={{ mx: 2, display: "flex", flexDirection: "column", height: "100%" }}>
          <div style={{ flexGrow: 1 }}>
            {/* Top group: Dashboard, Graphs, Planted crops, Inventory */}
            {menuItems.slice(0, 5).map(renderMenuItem)}

            {/* Dropdown menus remain as before  
            {renderDropdownButton({
              label: "Inventory",
              icon: <InventoryIcon />,
              active: isInventoryAactive,
              openState: inventoryOpen,
              onClick: handleInventoryClick,
            })}
            {open && renderDropdownCollapse(InventorySubItems, inventoryOpen)}*/}


            {renderDropdownButton({
              label: "Harvests Items",
              icon: <GrainIcon />,
              active: isHarvestActive,
              openState: harvestOpen,
              onClick: handleHarvestClick,
            })}
            {open && renderDropdownCollapse(harvestSubItems, harvestOpen)}

            {renderDropdownButton({
              label: "Maintenance",
              icon: <BuildIcon />,
              active: isMaintenanceActive,
              openState: maintenanceOpen,
              onClick: handleMaintenanceClick,
            })}
            {open && renderDropdownCollapse(maintenanceSubItems, maintenanceOpen)}

            {/* Remaining items */}
            {menuItems.slice(5).map(renderMenuItem)}
          </div>

          <Divider sx={{ my: 1, borderBottomWidth: "2px", borderColor: "#FFFFFF" }} />


          {/* Pass the new showProfileModal prop to MenuPopupState */}
          <MenuPopupState
            handleLogout={handleLogout}
            changePassModal={changePassModal}
            showProfileModal={showProfileModal}
          />

          {/* Existing modals */}
          <ChangePasswordModal open={openChangePassModal} onClose={closeChangePassModal} />
          {/* NEW: Profile modal */}
          <ProfileModal open={openProfileModal} onClose={closeProfileModal} />
        </List>
      </Drawer>

      {/* Collapsed dropdown menus */}
      {renderCollapsedMenu(harvestAnchorEl, harvestSubItems, () =>
        setHarvestAnchorEl(null)
      )}
        {renderCollapsedMenu(inventoryAnchorEl, InventorySubItems, () =>
        setInventoryAnchorEl(null)
      )}
      {renderCollapsedMenu(maintenanceAnchorEl, maintenanceSubItems, () =>
        setMaintenanceAnchorEl(null)
      )}
    </>
  );
};


export default Sidebar;
