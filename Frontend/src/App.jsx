import React, { useState, useEffect } from "react";
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
import ProtectedRoute from "./components/ProtectedRoute";
import ActivityLogs from "./pages/ActivityLogs";
import Loading from "./components/LoadingAlert";

const drawerWidth = 300;
const closedDrawerWidth = 65;

function App() {
  const [open, setOpen] = useState(true);

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

  return (
    <Router>
      <AuthProvider>
        <Box sx={{ display: "flex", minHeight: "100vh" }}>
          <AuthRoutes open={open} setOpen={toggleSidebar} />
        </Box>
      </AuthProvider>
    </Router>
  );
}

const AuthRoutes = ({ open, setOpen }) => {
  const { user, authLoading } = useAuth();

  

  return (
    <Box sx={{ display: "flex", height: "100vh", width: "100vw" }}>
      {user && <Sidebar open={open} setOpen={setOpen} />}
      <Box
        component="main"
        sx={{
          flex: 1,
          padding: user ? "2rem" : "0rem",
          height: "100vh",
          backgroundColor: "#f8eeec",
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
                path="/userManagement"
                element={
                  <ProtectedRoute>
                    <UserManagement />
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