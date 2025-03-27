import axios from "axios";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";

// Create a single socket connection instance
const socket = io("http://localhost:3001");
// Use your API base URL (consider using an environment variable)
const baseUrl = "http://localhost:3001";

export const useActivityLogs = () => {
  const [adminActivityLogs, setAdminActivityLogs] = useState([]);
  const [harvestLogs, setHarvestLogs] = useState([]);
  const [userActivityLogs, setUserActivityLogs] = useState([]);
  const [rejectionLogs, setRejectionLogs] = useState([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [hardwareComponentsLogs, setHardwareComponentsLogs] = useState([]);
  const [hardwareStatusLogs, setHardwareStatusLogs] = useState([]);
  const [controlsLog, setControlsLog] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  // Store errors as an object to keep track of which route failed
  const [error, setError] = useState({});

  useEffect(() => {
    const controller = new AbortController();

    const fetchLogs = async () => {
      // Initiate all requests concurrently with Promise.allSettled
      const results = await Promise.allSettled([
        axios.get(`${baseUrl}/logs/admin`, { signal: controller.signal }),
        axios.get(`${baseUrl}/logs/user`, { signal: controller.signal }),
        axios.get(`${baseUrl}/logs/rejection`, { signal: controller.signal }),
        axios.get(`${baseUrl}/logs/maintenance`, { signal: controller.signal }),
        axios.get(`${baseUrl}/logs/harvest`, { signal: controller.signal }),
        axios.get(`${baseUrl}/logs/hardware_components`, { signal: controller.signal }),
        axios.get(`${baseUrl}/logs/hardware_status`, { signal: controller.signal }),
        axios.get(`${baseUrl}/logs/control/logsd`, { signal: controller.signal }),
      ]);

      // Reset the error object before processing
      setError({});

      // Process each request result
      // Admin logs
      if (results[0].status === "fulfilled") {
        setAdminActivityLogs(results[0].value.data.AdminLogsTable || []);
      } else {
        setError(prev => ({ ...prev, admin: "Failed to fetch admin logs" }));
      }

      // User logs
      if (results[1].status === "fulfilled") {
        setUserActivityLogs(results[1].value.data.UserLogsTable || []);
      } else {
        setError(prev => ({ ...prev, user: "Failed to fetch user logs" }));
      }

      // Rejection logs
      if (results[2].status === "fulfilled") {
        setRejectionLogs(results[2].value.data.RejectionTable || []);
      } else {
        setError(prev => ({ ...prev, rejection: "Failed to fetch rejection logs" }));
      }

      // Maintenance logs
      if (results[3].status === "fulfilled") {
        setMaintenanceLogs(results[3].value.data.MaintenanceTable || []);
      } else {
        setError(prev => ({ ...prev, maintenance: "Failed to fetch maintenance logs" }));
      }

      // Harvest logs
      if (results[4].status === "fulfilled") {
        setHarvestLogs(results[4].value.data.harvestLogsTable || []);
      } else {
        setError(prev => ({ ...prev, harvest: "Failed to fetch harvest logs" }));
      }

      // Hardware Components logs
      if (results[5].status === "fulfilled") {
        setHardwareComponentsLogs(results[5].value.data.hardwareComponentsLogsTable || []);
      } else {
        setError(prev => ({ ...prev, hardware_components: "Failed to fetch hardware components logs" }));
      }

      // Hardware Status logs
      if (results[6].status === "fulfilled") {
        setHardwareStatusLogs(results[6].value.data.hardwareStatusLogsTable || []);
      } else {
        setError(prev => ({ ...prev, hardware_status: "Failed to fetch hardware status logs" }));
      }
      if (results[7].status === "fulfilled") {
        setControlsLog(results[7].value.data.controlsLogTable || []);
      } else {
        setError(prev => ({ ...prev, controls: "Failed to fetch controls logs" }));
      }
    };

    fetchLogs()
      .catch(err => {
        console.error("Unexpected error: ", err);
      })
      .finally(() => {
        setLogsLoading(false);
      });

    // Define the event handler for real-time updates
    const handleActivityLogsData = (data) => {
      if (data) {
        setAdminActivityLogs(data.AdminLogsTable || []);
        setUserActivityLogs(data.UserLogsTable || []);
        setRejectionLogs(data.RejectionTable || []);
        setMaintenanceLogs(data.MaintenanceTable || []);
        setHarvestLogs(data.harvestLogsTable || []);
        setHardwareComponentsLogs(data.hardwareComponentsLogsTable || []);
        setHardwareStatusLogs(data.hardwareStatusLogsTable || []);
        setControlsLog(data.controlsLogTable || []);
      }
    };

    // Listen for real-time updates via Socket.IO on "ActivityLogsData"
    socket.on("ActivityLogsData", handleActivityLogsData);

    // Clean-up function: abort the request and remove the socket listener
    return () => {
      controller.abort();
      socket.off("ActivityLogsData", handleActivityLogsData);
    };
  }, []);

  return {
    adminActivityLogs,
    userActivityLogs,
    rejectionLogs,
    maintenanceLogs,
    harvestLogs,
    hardwareComponentsLogs,
    hardwareStatusLogs,
    controlsLog,
    logsLoading,
    error,
  };
};
