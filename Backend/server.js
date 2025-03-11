// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import http from "http";
import axios from "axios";
import { Server } from "socket.io";
import { dataEmitter } from "./utils/dataEmitter.js";

import userRoutes from "./Routes/routeUserControl.js";
import verifyPasswordRoutes from "./Routes/routeVerifyPassword.js";
import totalRejecteditems from "./Routes/routeTotalRejectedItems.js";
import totalHarvests from "./Routes/routeTotalHarvests.js";
import BarChart from "./Routes/routeBarChart.js";
import PieChart from "./Routes/routePieChart.js";
import login from "./Routes/routeLogin.js";
import logout from "./Routes/routeLogout.js";
import authMeRoute from "./Routes/authUserJWT.js"; // Route for /admin/me
import ChangePassword from "./Controller/ChangePasswordController.js";
import ForgotPassword from "./Controller/ForgotPassController.js";
import ActvityLogs from "./Routes/routeActivityLogs.js";
import UserManagement from "./Routes/routeUserManagement.js";
import Maintenance from "./Controller/Maintenance.js";
import SendEmail from "./Controller/SendEmailController.js";
import HardwareComponents from "./Routes/routeHardwareComponents.js";
import HardwareStatus from "./Routes/routeHardwareStatus.js";

import { authenticateUser } from "./middleware/authenticateUser.js";

dotenv.config();

const app = express();
const port = 3001;
const server = http.createServer(app);

// Initialize Socket.IO with CORS options
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Enable CORS with credentials and built-in parsers
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/reason_for_rejection", totalRejecteditems, PieChart);
app.use("/harvests", totalHarvests, BarChart);
app.use("/admin/login", login);
app.use("/admin/logout", logout);
app.use(authMeRoute); // /admin/me endpoint
app.use("/logs", ActvityLogs);
app.use("/users", UserManagement);
app.get("/maintenance", Maintenance);
app.put("/admin/change-password", authenticateUser, ChangePassword);
app.post("/admin", ForgotPassword);
app.use("/admin", userRoutes);
app.use("/verify-user", verifyPasswordRoutes);
app.post("/apk-link-sender", SendEmail);
app.use("/hardware_components", HardwareComponents);
app.use("/hardware_status", HardwareStatus);

// Global variables to hold the latest fetched data
let latestHarvestData = null;
let latestRejectedData = null;
let latestLogsData = null;
let latestMaintenanceData = null;

// Create a reusable axios instance with a custom HTTP agent and timeout
const agent = new http.Agent({
  keepAlive: true,
  keepAliveMsecs: 1000,
  maxSockets: Infinity,
  maxFreeSockets: 256,
});
const axiosInstance = axios.create({
  httpAgent: agent,
  timeout: 5000,
  headers: {
    Accept: "application/json, text/plain, */*",
    "Accept-Encoding": "gzip, compress, deflate, br",
    "User-Agent": "axios/1.7.9",
  },
});

// Polling functions using recursive setTimeout

async function pollHarvestData() {
  try {
    const response = await axiosInstance.get("http://localhost:3001/harvests");
    if (response.data && response.data.harvestTable) {
      const newData = response.data.harvestTable;
      if (JSON.stringify(newData) !== JSON.stringify(latestHarvestData)) {
        latestHarvestData = newData;
        dataEmitter.emit("harvestUpdated", { harvestTable: newData });
      }
    }
  } catch (error) {
    console.error("Error polling harvest data:", error.message);
  } finally {
    setTimeout(pollHarvestData, 5000);
  }
}

async function pollRejectedData() {
  try {
    const response = await axiosInstance.get("http://localhost:3001/reason_for_rejection");
    if (response.data && response.data.rejectedTable) {
      const newData = response.data.rejectedTable;
      if (JSON.stringify(newData) !== JSON.stringify(latestRejectedData)) {
        latestRejectedData = newData;
        dataEmitter.emit("rejectedUpdated", { rejectedTable: newData });
      }
    }
  } catch (error) {
    console.error("Error polling rejected data:", error.message);
  } finally {
    setTimeout(pollRejectedData, 5000);
  }
}

async function pollLogsData() {
  try {
    // Use Promise.allSettled so one failing request doesn't cancel the whole update
    const results = await Promise.allSettled([
      axiosInstance.get("http://localhost:3001/logs/admin"),
      axiosInstance.get("http://localhost:3001/logs/user"),
      axiosInstance.get("http://localhost:3001/logs/rejection"),
      axiosInstance.get("http://localhost:3001/logs/maintenance"),
      axiosInstance.get("http://localhost:3001/logs/harvest", {
        headers: { Connection: "close" }, // force connection close to help prevent ECONNRESET
      }),
    ]);

    const adminResponse =
      results[0].status === "fulfilled" ? results[0].value.data.AdminLogsTable || [] : [];
    const userResponse =
      results[1].status === "fulfilled" ? results[1].value.data.UserLogsTable || [] : [];
    const rejectionResponse =
      results[2].status === "fulfilled" ? results[2].value.data.RejectionTable || [] : [];
    const maintenanceResponse =
      results[3].status === "fulfilled" ? results[3].value.data.MaintenanceTable || [] : [];
    const harvestResponse =
      results[4].status === "fulfilled" ? results[4].value.data.harvestLogsTable || [] : [];

    const logsData = {
      AdminLogsTable: adminResponse,
      UserLogsTable: userResponse,
      RejectionTable: rejectionResponse,
      MaintenanceTable: maintenanceResponse,
      harvestLogsTable: harvestResponse,
    };

    if (JSON.stringify(logsData) !== JSON.stringify(latestLogsData)) {
      latestLogsData = logsData;
      dataEmitter.emit("logsUpdated", logsData);
    }
  } catch (error) {
    console.error("Error polling logs data:", error.message);
  } finally {
    setTimeout(pollLogsData, 5000);
  }
}

async function pollMaintenanceData() {
  try {
    const response = await axiosInstance.get("http://localhost:3001/maintenance", {
      headers: { Connection: "close" },
    });
    if (response.data && response.data.maintenanceTable) {
      const newData = response.data.maintenanceTable;
      if (JSON.stringify(newData) !== JSON.stringify(latestMaintenanceData)) {
        latestMaintenanceData = newData;
        dataEmitter.emit("maintenanceUpdated", { maintenanceTable: newData });
      }
    }
  } catch (error) {
    console.error("Error polling maintenance data:", error.message);
  } finally {
    setTimeout(pollMaintenanceData, 5000);
  }
}

// Start polling data on server startup
pollHarvestData();
pollRejectedData();
pollLogsData();
pollMaintenanceData();

// Socket.IO connection handling using event-driven updates
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Send latest data immediately upon connection
  if (latestHarvestData) {
    socket.emit("harvestData", { harvestTable: latestHarvestData });
  }
  if (latestRejectedData) {
    socket.emit("RejectData", { rejectedTable: latestRejectedData });
  }
  if (latestLogsData) {
    socket.emit("ActivityLogsData", latestLogsData);
  }
  if (latestMaintenanceData) {
    socket.emit("maintenanceData", { maintenanceTable: latestMaintenanceData });
  }

  // Listener functions for event updates
  const onHarvestUpdated = (data) => socket.emit("harvestData", data);
  const onRejectedUpdated = (data) => socket.emit("RejectData", data);
  const onMaintenanceUpdated = (data) => socket.emit("maintenanceData", data);
  const onLogsUpdated = (data) => socket.emit("ActivityLogsData", data);

  // Subscribe to dataEmitter events
  dataEmitter.on("harvestUpdated", onHarvestUpdated);
  dataEmitter.on("rejectedUpdated", onRejectedUpdated);
  dataEmitter.on("maintenanceUpdated", onMaintenanceUpdated);
  dataEmitter.on("logsUpdated", onLogsUpdated);

  // Clean up event listeners on disconnect
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    dataEmitter.removeListener("harvestUpdated", onHarvestUpdated);
    dataEmitter.removeListener("rejectedUpdated", onRejectedUpdated);
    dataEmitter.removeListener("maintenanceUpdated", onMaintenanceUpdated);
    dataEmitter.removeListener("logsUpdated", onLogsUpdated);
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something is wrong!");
});

// Start the server (or export for serverless deployment)
if (!process.env.VERCEL) {
  server.listen(port, () => {
    console.log(`Backend server is running on http://localhost:${port}`);
  });
}

export default app;
