import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Box } from "@mui/material";
import "bootstrap/dist/css/bootstrap.min.css";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import UserManagement from "./pages/UserManagement";
import Graphs from "./pages/Graphs";
import Harvests from "./pages/Harvests";
import Rejected from "./pages/Rejected";
import ProtectedRoute from "./components/ProtectedRoute";
import ActivityLogs from "./pages/ActivityLogs";
import Maintenance from "./pages/Maintenance";
import Loading from "./components/LoadingAlert";
import HttpError from "./pages/HttpError";

const drawerWidth = 300;
const closedDrawerWidth = 65;

function App() {
  const [open, setOpen] = useState(true);
  const [httpError, setHttpError] = useState(false);

  // Load the sidebar state from localStorage on component mount
  useEffect(() => {
    const savedSidebarState = localStorage.getItem("sidebarOpen");
    setOpen(savedSidebarState === "true");
  }, []);

  const toggleSidebar = () => {
    setOpen((prev) => {
      localStorage.setItem("sidebarOpen", !prev); // Save the new state to localStorage
      return !prev;
    });
  };

  // Global axios interceptor for handling 500 errors
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => {
        // Clear the error overlay if response is ok
        setHttpError(false);
        return response;
      },
      (error) => {
        // If the error is a 500, display the error overlay
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
        <Box sx={{ display: "flex", minHeight: "100vh" }}>
          <AuthRoutes open={open} setOpen={toggleSidebar} />
        </Box>
        {/* Display global error overlay if HTTP 500 error occurs */}
        {httpError && <HttpError />}
      </AuthProvider>
    </Router>
  );
}

const AuthRoutes = ({ open, setOpen }) => {
  const { user } = useAuth();

  return (
    <Box sx={{ display: "flex", height: "100vh", width: "100vw" }}>
      {user && <Sidebar open={open} setOpen={setOpen} />}
      <Box
        component="main"
        sx={{
          flex: 1,
          padding: user ? "2rem" : "0rem",
          height: "100vh",
          backgroundColor: "#ddd",
          overflowY: "auto",
          transition: (theme) =>
            theme.transitions.create(["margin", "width"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.standard,
            }),
          marginLeft: user
            ? `${open ? drawerWidth : closedDrawerWidth}px`
            : "0",
          width: user
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
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </>
          )}
        </Routes>
      </Box>
    </Box>
  );
};

export default App;
