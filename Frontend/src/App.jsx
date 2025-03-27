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
import Inventory from "./pages/Inventory";
import PlantedCrops from "./pages/PlantedCrops";

// Import the LoadingScreen component
import LoadingScreen from "./components/LoadingScreen";

// Import the NoInternetComponent
import NoInternetComponent from "./components/NoInternet";

const drawerWidth = 300;
const closedDrawerWidth = 65;

function App() {
  const [open, setOpen] = useState(true);
  const [httpError, setHttpError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Detect online/offline events
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Simulate loading on refresh by updating the progress gradually
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 100) {
          return prev + 10;
        } else {
          clearInterval(interval);
          setLoading(false);
          return 100;
        }
      });
    }, 200); // roughly 2 seconds to reach 100%
    return () => clearInterval(interval);
  }, []);

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

  // While loading, show the LoadingScreen component
  if (loading) {
    return <LoadingScreen progress={progress} />;
  }

  // If there's no internet connection, show the NoInternetComponent
  if (!isOnline) {
    return <NoInternetComponent />;
  }

  return (
    <Router>
      <AuthProvider>
        <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#ddd" }}>
          <AuthRoutes open={open} setOpen={toggleSidebar} isMobile={isMobile} />
        </Box>
        {/* Optionally, display a global error overlay when httpError is true:
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
          padding: user ? (isMobile ? "1rem" : "2rem") : "0rem",
          paddingTop: user
            ? isMobile
              ? `calc(${theme.mixins.toolbar.minHeight}px + 1rem)`
              : "2rem"
            : "0rem",
          height: "100vh",
          backgroundColor: "#ddd",
          overflowY: "auto",
          transition: theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.standard,
          }),
          marginLeft: user
            ? isMobile
              ? "-35px"
              : `${open ? drawerWidth : closedDrawerWidth}px`
            : "0",
          width:
            user && !isMobile
              ? `calc(100% - ${open ? drawerWidth : closedDrawerWidth}px)`
              : "100%",
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
               <Route
                path="/inventory"
                element={
                  <ProtectedRoute>
                    <Inventory />
                  </ProtectedRoute>
                }
              />
               <Route
                path="/planted-crops"
                element={
                  <ProtectedRoute>
                    <PlantedCrops />
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
