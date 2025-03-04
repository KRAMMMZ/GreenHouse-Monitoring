// server.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import http from "http";
import axios from "axios";
import { Server } from "socket.io";

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

// Enable CORS with credentials
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/reason_for_rejection", totalRejecteditems, PieChart);
app.use("/harvests", totalHarvests, BarChart);
app.use("/admin/login", login);
app.use("/admin/logout", logout);
app.use(authMeRoute); // Registers the /admin/me endpoint
app.use("/logs", ActvityLogs);
app.use("/users", UserManagement);
app.get("/maintenance", Maintenance);
app.put("/admin/change-password", authenticateUser, ChangePassword);
app.post("/admin", ForgotPassword);
app.use("/user", userRoutes);
app.use("/verify-user", verifyPasswordRoutes);
app.post("/apk-link-sender", SendEmail);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Poll for harvest data
  let lastHarvestData = null;
  const intervalIdHarvest = setInterval(async () => {
    try {
      const response = await axios.get("http://localhost:3001/harvests");
      if (response.data && response.data.harvestTable) {
        const newData = response.data.harvestTable;
        if (JSON.stringify(newData) !== JSON.stringify(lastHarvestData)) {
          lastHarvestData = newData;
          socket.emit("harvestData", { harvestTable: newData });
        }
      }
    } catch (error) {
      console.error("Error fetching harvest data for socket:", error);
    }
  }, 5000);

  // Poll for rejection reasons data
  let lastRejectedData = null;
  const intervalIdRejected = setInterval(async () => {
    try {
      const response = await axios.get("http://localhost:3001/reason_for_rejection");
      if (response.data && response.data.rejectedTable) {
        const newRejectedData = response.data.rejectedTable;
        if (JSON.stringify(newRejectedData) !== JSON.stringify(lastRejectedData)) {
          lastRejectedData = newRejectedData;
          socket.emit("RejectData", { rejectedTable: newRejectedData });
        }
      }
    } catch (error) {
      console.error("Error fetching rejected data for socket:", error);
    }
  }, 5000);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    clearInterval(intervalIdHarvest);
    clearInterval(intervalIdRejected);
  });
});

// Error handling middleware
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
