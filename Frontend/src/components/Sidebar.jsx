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
import { Typography } from "@mui/material";
import EventNoteIcon from '@mui/icons-material/EventNote'; 
import BarChartIcon from "@mui/icons-material/BarChart";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import GroupIcon from '@mui/icons-material/Group';
import ReportIcon from '@mui/icons-material/Report';
import GrainIcon from '@mui/icons-material/Grain';
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const drawerWidth = 300;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.standard,
  }),
  overflowX: "hidden",
  backgroundColor: "#000",
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
  backgroundColor: "#000",
  color: "#FFFFFF",
  height: "100vh",
});

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  position: "fixed",
  width: drawerWidth,
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

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
  { text: "Graphs", icon: <BarChartIcon />, path: "/graphs" },
  { text: "Harvests", icon: <GrainIcon />, path: "/harvests" }, 
  { text: "User Management", icon: <GroupIcon />, path: "/userManagement" },
  { text: "Reports", icon: <ReportIcon />, path: "/reports" },
  { text: "Activity Logs", icon: <EventNoteIcon />, path: "/activitylogs" }, // Changed icon here
];

function Sidebar({ open, setOpen }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [selectedItem, setSelectedItem] = useState(null);

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

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem("selectedMenuItem"); // Clear selection on logout
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
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
            <ChevronRightIcon sx={{ fontSize: 30, marginTop: 2, marginLeft: 0 }} />
          )}
        </IconButton>
      </DrawerHeader>
      <Divider sx={{ my: 2, backgroundColor: "#FFFFFF" }} />

      <List sx={{ mx: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ flexGrow: 1 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ display: "flex", justifyContent: "center" }}>
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
                  backgroundColor: selectedItem === item.path ? "#f8eeec" : "transparent",
                  "&:hover": {
                    backgroundColor: "#4169E1",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mx: open ? 2 :0 ,
                    justifyContent: "center",
                    color: selectedItem === item.path ? "#000000" : "#FFFFFF",
                    "& svg": {
                      fontSize: 25,
                      verticalAlign: "middle",
                    },
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    opacity: open ? 1 : 0,
                    color: selectedItem === item.path ? "#000000" : "#FFFFFF",
                    whiteSpace: "nowrap",
                    transition: "opacity 0.3s",
                    marginLeft: open ? 1 : 0,
                    "& .MuiTypography-root": {
                      fontSize: "1.2rem",
                      fontWeight: 500,
                      verticalAlign: "middle",
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </div>

        <Divider sx={{ my: 1, backgroundColor: "#FFFFFF" }} />

        <ListItem disablePadding sx={{ display: "flex", justifyContent: "center" }}>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              px: 1,
              py: 1,
              borderRadius: "16px",
              "&:hover": {
                backgroundColor: "#4169E1",
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
               mx: open ? 4 :0 ,
                justifyContent: "center",
                color: "#FFFFFF",
                "& svg": {
                  fontSize: 30,
                  verticalAlign: "middle",
                },
              }}
            >
              <ExitToAppIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" sx={{ opacity: open ? 1 : 0, color: "#FFFFFF" }} />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
}

export default Sidebar;
