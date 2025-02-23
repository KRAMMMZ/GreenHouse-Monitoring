import axios from "axios";
import { useState, useEffect } from "react";

export const useActivityLogs = () => {
  const [adminActivityLogs, setAdminActivityLogs] = useState([]);
  const [userActivityLogs, setUserActivityLogs] = useState([]);
  const [rejectionLogs, setRejectionLogs] = useState([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const [
          adminResponse,
          userResponse,
          rejectionResponse,
          maintenanceResponse,
        ] = await Promise.all([
          axios.get("http://localhost:3001/logs/admin"),
          axios.get("http://localhost:3001/logs/user"),
          axios.get("http://localhost:3001/logs/rejection"),
          axios.get("http://localhost:3001/logs/maintenance"),
        ]);

        setAdminActivityLogs(adminResponse.data.AdminLogsTable || []);
        setUserActivityLogs(userResponse.data.UserLogsTable || []);
        setRejectionLogs(rejectionResponse.data.RejectionTable || []);
        setMaintenanceLogs(maintenanceResponse.data.MaintenanceTable || []);
      } catch (error) {
        console.error("Error fetching logs:", error);
        setAdminActivityLogs([]);
        setUserActivityLogs([]);
        setRejectionLogs([]);
        setMaintenanceLogs([]);
      } finally {
        setLogsLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return {
    adminActivityLogs,
    userActivityLogs,
    rejectionLogs,
    maintenanceLogs,
    logsLoading,
  };
};
