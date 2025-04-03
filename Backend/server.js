import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import http from "http";
import axios from "axios";
import { Server } from "socket.io";
import crypto from 'crypto';

import userRoutes from "./Routes/routeUserControl.js";
import verifyPasswordRoutes from "./Routes/routeVerifyPassword.js";
import totalRejecteditems from "./Routes/routeTotalRejectedItems.js";
import totalHarvests from "./Routes/routeTotalHarvests.js";
import BarChart from "./Routes/routeBarChart.js";
import PieChart from "./Routes/routePieChart.js";
import login from "./Routes/routeLogin.js";
import logout from "./Routes/routeLogout.js";
import authMeRoute from "./Routes/authUserJWT.js";
import ChangePassword from "./Controller/ChangePasswordController.js";
import ForgotPassword from "./Controller/ForgotPassController.js";
import ActvityLogs from "./Routes/routeActivityLogs.js";
import UserManagement from "./Routes/routeUserManagement.js";
import Maintenance from "./Controller/Maintenance.js";
import SendEmail from "./Controller/SendEmailController.js";
import HardwareComponents from "./Routes/routeHardwareComponents.js";
import HardwareStatus from "./Routes/routeHardwareStatus.js";
import PlantedCrops from "./Routes/routePlantedCrops.js";
import Inventories from "./Routes/routeInventory.js"
import NutrientController from "./Routes/routeNutrient.js";
import Sales from "./Routes/routeSales.js";

import { authenticateUser } from "./middleware/authenticateUser.js";

dotenv.config();

const app = express();
const port = 3001;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware setup
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route definitions (using a single app.use for better readability)
app.use("/reason_for_rejection", totalRejecteditems, PieChart);
app.use("/harvests", totalHarvests, BarChart);
app.use("/admin/login", login);
app.use("/admin/logout", logout);
app.use(authMeRoute);
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
app.use("/planted_crops", PlantedCrops);
app.use("/all-inventory", Inventories); 
app.use("/nutrient_controllers", NutrientController); 
app.use("/sales", Sales);

// Centralized Data State Management
const dataState = {
    harvest: { hash: null, data: null, isFetching: false, lastFetch: 0, endpoint: "/harvests", eventName: "harvestData", dataKey: "harvestTable" },
    rejected: { hash: null, data: null, isFetching: false, lastFetch: 0, endpoint: "/reason_for_rejection", eventName: "RejectData", dataKey: "rejectedTable" },
    logs: { hash: null, data: null, isFetching: false, lastFetch: 0, eventName: "ActivityLogsData" },
    maintenance: { hash: null, data: null, isFetching: false, lastFetch: 0, endpoint: "/maintenance", eventName: "maintenanceData", dataKey: "maintenanceTable" },
};

const COOLDOWN_MS = 15000;
const API_TIMEOUT_MS = 15000;

// Axios Instance
const api = axios.create({
    baseURL: "http://localhost:3001",
    timeout: API_TIMEOUT_MS,
});

// Utility function to hash data
const hashData = (data) => crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');

// Simplified Data Fetching Function
async function fetchData(stateKey) {
    const state = dataState[stateKey];
    const now = Date.now();

    if (state.isFetching || (now - state.lastFetch < COOLDOWN_MS)) return;

    state.isFetching = true;
    state.lastFetch = now;

    try {
        const response = await api.get(state.endpoint);
        const newData = response.data[state.dataKey] || [];
        const newHash = hashData(newData);

        if (newHash !== state.hash) {
            state.hash = newHash;
            state.data = newData;
            io.emit(state.eventName, { [state.dataKey]: newData });
        }
    } catch (error) {
        console.error(`Error fetching ${state.endpoint}:`, error.message);
    } finally {
        state.isFetching = false;
    }
}

// Optimized Logs Fetching
async function fetchLogs() {
    const state = dataState.logs;
    const now = Date.now();

    if (state.isFetching || (now - state.lastFetch < COOLDOWN_MS)) return;

    state.isFetching = true;
    state.lastFetch = now;

    try {
        const logEndpoints = [
            "/logs/admin", "/logs/user", "/logs/rejection", "/logs/maintenance",
            "/logs/harvest", "/logs/hardware_components", "/logs/hardware_status",
            "/logs/control/logsd", "/logs/inventory","/logs/planted_crops"
        ];

        const results = await Promise.allSettled(logEndpoints.map(endpoint => api.get(endpoint)));

        const logsData = {
            AdminLogsTable: results[0].status === "fulfilled" ? results[0].value.data.AdminLogsTable || [] : [],
            UserLogsTable: results[1].status === "fulfilled" ? results[1].value.data.UserLogsTable || [] : [],
            RejectionTable: results[2].status === "fulfilled" ? results[2].value.data.RejectionTable || [] : [],
            MaintenanceTable: results[3].status === "fulfilled" ? results[3].value.data.MaintenanceTable || [] : [],
            harvestLogsTable: results[4].status === "fulfilled" ? results[4].value.data.harvestLogsTable || [] : [],
            hardwareComponentsLogsTable: results[5].status === "fulfilled" ? results[5].value.data.hardwareComponentsLogsTable || [] : [],
            hardwareStatusLogsTable: results[6].status === "fulfilled" ? results[6].value.data.hardwareStatusLogsTable || [] : [],
            controlsLogTable: results[7].status === "fulfilled" ? results[7].value.data.controlsLogTable || [] : [],
            itemInventoryLogsTable: results[8].status === "fulfilled" ? results[8].value.data.itemInventoryLogsTable || [] : [],
            plantedCropsLogsTable: results[9].status === "fulfilled" ? results[9].value.data.plantedCropsLogsTable || [] : [],
        };

        const newHash = hashData(logsData);
        if (newHash !== state.hash) {
            state.hash = newHash;
            state.data = logsData;
            io.emit(state.eventName, logsData);
        }

    } catch (error) {
        console.error("Error fetching logs:", error.message);
    } finally {
        state.isFetching = false;
    }
}


// Data Fetching Intervals (Centralized)
setInterval(() => fetchData("harvest"), 15000);
setInterval(() => fetchData("rejected"), 15000);
setInterval(() => fetchData("maintenance"), 15000);
setInterval(() => fetchLogs(), 15000);


io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Send initial data on connection
    for (const key in dataState) {
        if (dataState[key].data) {
            const { eventName, dataKey, data } = dataState[key];
            const payload = dataKey ? { [dataKey]: data } : data; // Construct payload based on dataKey
            socket.emit(eventName, payload);
        }
    }

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});


// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something went wrong!");
});

// Server Startup
if (!process.env.VERCEL) {
    server.listen(port, () => {
        console.log(`Backend server is running on http://localhost:${port}`);
    });
}

export default app;