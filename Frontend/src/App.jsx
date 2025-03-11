import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../public/dashboard.css";

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Sidebar from "./components/Sidebar";
import MobileAppBar from "./components/MobileAppBar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import UserManagement from "./pages/UserManagement";
import Graphs from "./pages/Graphs";
import Harvests from "./pages/Harvests";
import Rejected from "./pages/Rejected";
import ProtectedRoute from "./components/ProtectedRoute";
import ActivityLogs from "./pages/ActivityLogs";
import HardwareComponents from "./pages/HardwareComponents";
import HardwareStatus from "./pages/HardwareStatus";
// (Other imports like Maintenance, Loading, HttpError can be added as needed)

const drawerWidth = 300;
const closedDrawerWidth = 65;
const closed = 0;

function App() {
  const [open, setOpen] = useState(true);
  const [httpError, setHttpError] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Load sidebar state from localStorage (desktop only)
  useEffect(() => {
    const savedSidebarState = localStorage.getItem("sidebarOpen");
    setOpen(savedSidebarState === "true");
  }, []);

  const toggleSidebar = () => {
    setOpen((prev) => {
      localStorage.setItem("sidebarOpen", !prev);
      return !prev;
    });
  };

  // Global axios interceptor for HTTP 500 errors
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => {
        setHttpError(false);
        return response;
      },
      (error) => {
        if (error.response && error.response.status === 500) {
          setHttpError(true);
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  return (
    <Router>
      <AuthProvider>
        <Box sx={{ display: "flex", minHeight: "100vh",  backgroundColor: "#ddd" }}>
          <AuthRoutes open={open} setOpen={toggleSidebar} isMobile={isMobile} />
        </Box>
        {/* You can show a global error overlay here if needed:
        {httpError && <HttpError />} */}
      </AuthProvider>
    </Router>
  );
}

const AuthRoutes = ({ open, setOpen, isMobile }) => {
  const { user } = useAuth();
  const theme = useTheme();
  return (
    <Box sx={{ display: "flex", height: "100vh", width: "100vw" }}>
      {user && !isMobile && <Sidebar open={open} setOpen={setOpen} />}
      {user && isMobile && <MobileAppBar />}
      <Box
        component="main"
        sx={{
          flex: 1,
          padding: user ? "2rem" : "0rem",
          // If the user is not logged in, paddingTop is removed (set to 0)
          paddingTop: user
            ? isMobile
              ? `calc(${theme.mixins.toolbar.minHeight}px + 2rem)`
              : "2rem"
            : "0rem",
          height: "100vh",
          backgroundColor: "#ddd",
          overflowY: "auto",
          transition: (theme) =>
            theme.transitions.create(["margin", "width"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.standard,
            }),
          marginLeft: user && isMobile ? "-45px" : user ? `${open ? drawerWidth : closedDrawerWidth}px` : "0",
          width: user && !isMobile ? `calc(100% - ${open ? drawerWidth : closedDrawerWidth}px)` : "100%",
        }}
      >
        <Routes>
          {!user ? (
            <>
              <Route path="/" element={<Login />} />
              <Route path="*" element={<Navigate to="/" />} />
            </>
          ) : (
            <>
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/graphs"
                element={
                  <ProtectedRoute>
                    <Graphs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/harvests"
                element={
                  <ProtectedRoute>
                    <Harvests />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rejected"
                element={
                  <ProtectedRoute>
                    <Rejected />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/userManagement"
                element={
                  <ProtectedRoute>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/activitylogs"
                element={
                  <ProtectedRoute>
                    <ActivityLogs />
                  </ProtectedRoute>
                }
              />
               <Route
                path="/hardware-components"
                element={
                  <ProtectedRoute>
                    <HardwareComponents />
                  </ProtectedRoute>
                }
              />
               <Route
                path="/hardware-status"
                element={
                  <ProtectedRoute>
                    <HardwareStatus />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </>
          )}
        </Routes>
      </Box>
    </Box>
  );
};

export default App;
