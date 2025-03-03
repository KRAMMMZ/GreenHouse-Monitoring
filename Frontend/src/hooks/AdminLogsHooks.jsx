import axios from "axios";
import { useState, useEffect } from "react";

export const useActivityLogs = () => {
  const [adminActivityLogs, setAdminActivityLogs] = useState([]);
  const [harvestLogs, setHarvestLogs] = useState([]);
  const [userActivityLogs, setUserActivityLogs] = useState([]);
  const [rejectionLogs, setRejectionLogs] = useState([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use environment variable for API base URL
  const baseUrl =   "http://localhost:3001";

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
          // Optionally, clear logs in case of an error
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

    fetchLogs();

    // Cancel the request on component unmount
    return () => {
      source.cancel("Component unmounted, canceling request");
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
