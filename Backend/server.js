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

import { authenticateUser } from "./middleware/authenticateUser.js";

dotenv.config();

const app = express();
const port = 3001;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Replace with your frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
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

// Data state (hashes instead of full data)
const dataState = {
    harvest: { hash: null, data: null, isFetching: false, lastFetch: 0 },
    rejected: { hash: null, data: null, isFetching: false, lastFetch: 0 },
    logs: { hash: null, data: null, isFetching: false, lastFetch: 0 },
    maintenance: { hash: null, data: null, isFetching: false, lastFetch: 0 },
};

const COOLDOWN_MS = 15000; // 15 seconds cooldown (adjust as needed)
const API_TIMEOUT_MS = 15000; // 15 seconds timeout (adjust as needed)

// Reusable Axios instance
const api = axios.create({
    baseURL: "http://localhost:3001",
    timeout: API_TIMEOUT_MS,
});

function hashData(data) {
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

async function fetchData(endpoint, stateKey, eventName, dataKey) {
    const now = Date.now();
    const state = dataState[stateKey];

    if (state.isFetching || (now - state.lastFetch < COOLDOWN_MS)) {
        return;
    }

    state.isFetching = true;
    state.lastFetch = now;

    try {
        const response = await api.get(endpoint);
        const newData = response.data[dataKey] || [];
        const newHash = hashData(newData);

        if (newHash !== state.hash) {
            state.hash = newHash;
            state.data = newData;
            io.emit(eventName, { [dataKey]: newData });
        }
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error.message);
    } finally {
        state.isFetching = false;
    }
}

async function fetchLogs() {
    const now = Date.now();
    const state = dataState.logs;

    if (state.isFetching || (now - state.lastFetch < COOLDOWN_MS)) {
        return;
    }
    state.isFetching = true;
    state.lastFetch = now;

    try {
        const results = await Promise.allSettled([
            api.get("/logs/admin"),
            api.get("/logs/user"),
            api.get("/logs/rejection"),
            api.get("/logs/maintenance"),
            api.get("/logs/harvest"),
            api.get("/logs/hardware_components"),
            api.get("/logs/hardware_status"),
            api.get("/logs/control/logsd"),
        ]);

        const logsData = {
            AdminLogsTable: results[0].status === "fulfilled" ? results[0].value.data.AdminLogsTable || [] : [],
            UserLogsTable: results[1].status === "fulfilled" ? results[1].value.data.UserLogsTable || [] : [],
            RejectionTable: results[2].status === "fulfilled" ? results[2].value.data.RejectionTable || [] : [],
            MaintenanceTable: results[3].status === "fulfilled" ? results[3].value.data.MaintenanceTable || [] : [],
            harvestLogsTable: results[4].status === "fulfilled" ? results[4].value.data.harvestLogsTable || [] : [],
            hardwareComponentsLogsTable: results[5].status === "fulfilled" ? results[5].value.data.hardwareComponentsLogsTable || [] : [],
            hardwareStatusLogsTable: results[6].status === "fulfilled" ? results[6].value.data.hardwareStatusLogsTable || [] : [],
            controlsLogTable: results[7].status === "fulfilled" ? results[7].value.data.controlsLogTable || [] : [],
        };

        const newHash = hashData(logsData);
        if(newHash !== state.hash){
            state.hash = newHash;
            state.data = logsData;
            io.emit("ActivityLogsData", logsData);
        }

    } catch (error) {
        console.error("Error fetching logs:", error.message);
    } finally {
        state.isFetching = false;
    }
}

// Set up intervals for fetching data
setInterval(() => fetchData("/harvests", "harvest", "harvestData", "harvestTable"), 10000);
setInterval(() => fetchData("/reason_for_rejection", "rejected", "RejectData", "rejectedTable"), 10000);
setInterval(() => fetchData("/maintenance", "maintenance", "maintenanceData", "maintenanceTable"), 10000);
setInterval(() => fetchLogs(), 10000);

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Send initial data if available
    for (const key in dataState) {
        if (dataState[key].data) {
           let eventName, dataKey;

            if(key === 'harvest'){
                eventName = "harvestData";
                dataKey = "harvestTable";
            } else if(key === 'rejected'){
                eventName = "RejectData";
                dataKey = "rejectedTable";
            } else if (key === 'maintenance'){
                eventName = "maintenanceData";
                dataKey = "maintenanceTable";
            } else if(key === 'logs'){
                eventName = "ActivityLogsData";
            }

            if(eventName === "ActivityLogsData"){
                 socket.emit(eventName, dataState[key].data);
            } else {
                 socket.emit(eventName, { [dataKey]: dataState[key].data });
            }
        }
    }

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

 
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something is wrong!");
});

if (!process.env.VERCEL) {
  server.listen(port, () => {
    console.log(`Backend server is running on http://localhost:${port}`);
  });
}

export default app;
