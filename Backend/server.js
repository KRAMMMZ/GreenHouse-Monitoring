import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import http from "http";

import userRoutes from "./Routes/routeUserControl.js";
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

import {authenticateUser} from "./middleware/authenticateUser.js"

dotenv.config();

const app = express();
const port = 3001;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Allow the frontend to access the backend
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

// Enable CORS with credentials
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
// Parse cookies so req.cookies is available
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
app.post("/apk-link-sender", SendEmail);

// Example: A harvest creation endpoint.
app.post("/harvests", async (req, res) => {
  try {
    // Insert new harvest data into your database here.
    // e.g., const newHarvest = await YourHarvestModel.create(req.body);
    
    // After successful insertion, emit the update event.
    io.emit("updateHarvests");
    res.status(201).send({
      message: "Harvest data added and update emitted",
    });
  } catch (error) {
    console.error("Error adding harvest:", error);
    res.status(500).send({ message: "Error adding harvest" });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something is wrong!");
});

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("A client connected");

  socket.on("disconnect", () => {
    console.log("A client disconnected");
  });
});

server.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});
