// hooks/useMaintenance.js
import axios from "axios";
import { useState, useEffect } from "react";

const useMaintenance = () => {
  const [maintenance, setMaintenance] = useState([]);
  const [maintenanceLoading, setMaintenanceLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/maintenance");
        setMaintenance(response.data.maintenanceTable || []);
      } catch (error) {
        console.error("Error fetching maintenance items:", error);
        setMaintenance([]);
      } finally {
        setMaintenanceLoading(false);
      }
    };

    fetchData();
  }, []);

  return { maintenance, maintenanceLoading };
};

export default useMaintenance;
