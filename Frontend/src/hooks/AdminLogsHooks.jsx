import axios from "axios";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";

// Create a single socket connection instance
const socket = io("http://localhost:3001");

// Use your API base URL (you might use an env variable) 
const baseUrl = "http://localhost:3001";

export const useActivityLogs = () => {
  const [adminActivityLogs, setAdminActivityLogs] = useState([]);
  const [harvestLogs, setHarvestLogs] = useState([]);
  const [userActivityLogs, setUserActivityLogs] = useState([]);
  const [rejectionLogs, setRejectionLogs] = useState([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const source = axios.CancelToken.source();

    const fetchLogs = async () => {
      try {
        const [
          adminResponse,
          userResponse,
          rejectionResponse,
          maintenanceResponse,
          harvestResponse,
        ] = await Promise.all([
          axios.get(`${baseUrl}/logs/admin`, { cancelToken: source.token }),
          axios.get(`${baseUrl}/logs/user`, { cancelToken: source.token }),
          axios.get(`${baseUrl}/logs/rejection`, { cancelToken: source.token }),
          axios.get(`${baseUrl}/logs/maintenance`, { cancelToken: source.token }),
          axios.get(`${baseUrl}/logs/harvest`, { cancelToken: source.token }),
        ]);

        setAdminActivityLogs(adminResponse.data.AdminLogsTable || []);
        setUserActivityLogs(userResponse.data.UserLogsTable || []);
        setRejectionLogs(rejectionResponse.data.RejectionTable || []);
        setMaintenanceLogs(maintenanceResponse.data.MaintenanceTable || []);
        setHarvestLogs(harvestResponse.data.harvestLogsTable || []);
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log("Request canceled:", error.message);
        } else {
          console.error("Error fetching logs:", error);
          setError("Failed to fetch logs.");
          setAdminActivityLogs([]);
          setUserActivityLogs([]);
          setRejectionLogs([]);
          setMaintenanceLogs([]);
          setHarvestLogs([]);
        }
      } finally {
        setLogsLoading(false);
      }
    };

    // Initial fetch of logs
    fetchLogs();

    // Listen for real-time updates via Socket.IO on "ActivityLogsData"
    socket.on("ActivityLogsData", (data) => {
      if (data) {
        setAdminActivityLogs(data.AdminLogsTable || []);
        setUserActivityLogs(data.UserLogsTable || []);
        setRejectionLogs(data.RejectionTable || []);
        setMaintenanceLogs(data.MaintenanceTable || []);
        setHarvestLogs(data.harvestLogsTable || []);
      }
    });

    return () => {
      source.cancel("Component unmounted, canceling request");
      socket.off("ActivityLogsData");
    };
  }, [baseUrl]);

  return {
    adminActivityLogs,
    userActivityLogs,
    rejectionLogs,
    maintenanceLogs,
    harvestLogs,
    logsLoading,
    error,
  };
};
