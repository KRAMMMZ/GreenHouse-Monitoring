import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import http from "http";

import totalRejecteditems from "./Routes/routeTotalRejectedItems.js";
import totalHarvests from "./Routes/routeTotalHarvests.js";
import totalHarvestsPerDay from "./Routes/routePerDayHarvest.js";
import totalAcceptedPerDay from "./Routes/routeChart.js";
dotenv.config();

const app = express();
const port = 3001;

// Create an HTTP server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(cors({ origin: "http://localhost:5173" }));
app.use(bodyParser.json());

app.use("/reason_for_rejection", totalRejecteditems);
app.use("/harvests", totalHarvests, totalHarvestsPerDay, totalAcceptedPerDay);
 

// Handle errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something is Wrong!");
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
  }, 5000); // Every 10 seconds
};

// Start the simulation
simulateHarvestUpdate();

server.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});
