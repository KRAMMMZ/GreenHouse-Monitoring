// hooks/useMaintenance.js
import axios from "axios";
import { useState, useEffect } from "react";

const getTodayDateString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

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

const useMaintenanceToday = () => {
  const [maintenanceToday, setMaintenanceToday] = useState(0);
  const [maintenanceTodayLoading, setMaintenanceTodayLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/maintenance");
        if (response.data && response.data.maintenanceTable) {
          const todayDate = getTodayDateString();

          // Convert maintenance.date_completed to a local date string in YYYY-MM-DD format
          const todayMaintenance = response.data.maintenanceTable.filter(item => {
            const maintenanceDate = new Date(item.date_completed);
            const maintenanceDateString = `${maintenanceDate.getFullYear()}-${String(maintenanceDate.getMonth() + 1).padStart(2, '0')}-${String(maintenanceDate.getDate()).padStart(2, '0')}`;
            return maintenanceDateString === todayDate;
          });

          // Set the count of today's maintenance records
          setMaintenanceToday(todayMaintenance.length);
        } else {
          console.error("Error: No Maintenance data received");
          setMaintenanceToday(0);
        }
      } catch (error) {
        console.error("Error fetching total Maintenance for today:", error);
        setMaintenanceToday(0);
      } finally {
        setMaintenanceTodayLoading(false);
      }
    };

    fetchData();
  }, []);

  return { maintenanceToday, maintenanceTodayLoading };
};

export { useMaintenance, useMaintenanceToday };
