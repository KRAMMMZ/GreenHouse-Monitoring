import axios from "axios";
import { useState, useEffect } from "react";

const AdminLogs = () => {
    const [ adminActivityLogs, setAdminActivityLogs] = useState([]);
    const [ adminLogsLoading, setAdminLogsLoading] = useState(true); // Use a meaningful name
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await axios.get("http://localhost:3001/activity_logs/admin");
          setAdminActivityLogs(response.data.AdminLogsTable || []); // Ensure fallback to an array
         
        } catch (error) {
          console.error("Error fetching harvest items:", error);
          setAdminActivityLogs([]);
        } finally {
            setAdminLogsLoading(false);
        }
      };
  
      fetchData();
    }, []);
  
    return { adminActivityLogs, adminLogsLoading };
  };

export default AdminLogs;