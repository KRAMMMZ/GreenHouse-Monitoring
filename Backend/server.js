import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import http from "http";

import totalRejectToday from "./Routes/routeRejectToday.js";
import totalRejecteditems from "./Routes/routeTotalRejectedItems.js";
import totalHarvests from "./Routes/routeTotalHarvests.js";
import totalHarvestsPerDay from "./Routes/routePerDayHarvest.js";
import BarChart from "./Routes/routeBarChart.js";
import PieChart from "./Routes/routePieChart.js";

import login from "./Routes/routeLogin.js";
import logout from "./Routes/routeLogout.js";

import ChangePassword from "./Controller/ChangePasswordController.js"; 
import ForgotPassword from "./Controller/ForgotPassController.js";

import Adminlogs from "./Routes/routeAdminLogs.js"
import UserManagement from "./Routes/routeUserManagement.js";
import Maintenance from "./Controller/Maintenance.js";

dotenv.config();

const app = express();
const port = 3001;

// Create an HTTP servera
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Allow the frontend to accesss
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
});

app.use(cors({ origin: "http://localhost:5173" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/reason_for_rejection", totalRejecteditems, PieChart, totalRejectToday);
app.use("/harvests", totalHarvests, totalHarvestsPerDay, BarChart);
app.use("/admin/login", login);
app.use("/admin/logout", logout);

app.use("/activity_logs/admin", Adminlogs);
app.use("/users", UserManagement);
app.get("/maintenance", Maintenance);


app.put("/admin/:email", ChangePassword);   
app.post("/admin", ForgotPassword);   

// Handle errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something is wrong!");
});

// WebSocket Connection
io.on("connection", (socket) => {
  console.log("A client connected");

  socket.on("disconnect", () => {
    console.log("A client disconnected");
  });
});

// Emit updates whenever the data changes
const emitHarvestUpdate = () => {
  io.emit("updateHarvests");
};

// Example function to simulate a data update
const simulateHarvestUpdate = () => {
  setTimeout(() => {
    emitHarvestUpdate();
    console.log("Harvest data updated");
  }, 5000); // Every 5 seconds
};

// Start the simulation
simulateHarvestUpdate();

server.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});
