import axios from "axios";
import { useState, useEffect, useMemo } from "react";
import { io } from "socket.io-client";

// Create a single socket connection instance
const socket = io("http://localhost:3001");

// Utility: Get today's date string in YYYY-MM-DD format
const getTodayDateString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * useMaintenanceData
 * Fetches maintenance data once and listens for real-time updates via Socket.IO.
 */
const useMaintenanceData = () => {
  const [maintenanceData, setMaintenanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from API
  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:3001/maintenance");
      setMaintenanceData(response.data.maintenanceTable || []);
    } catch (error) {
      console.error("Error fetching maintenance data:", error);
      setMaintenanceData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Listen for real-time updates on the "maintenanceData" event
    socket.on("maintenanceData", (data) => {
      if (data && data.maintenanceTable) {
        setMaintenanceData(data.maintenanceTable);
        setLoading(false);
      }
    });

    // Cleanup the socket event on unmount
    return () => {
      socket.off("maintenanceData");
    };
  }, []);

  return { maintenanceData, loading };
};

/**
 * useMaintenance
 * Returns the complete maintenance data and its loading state.
 */
const useMaintenance = () => {
  const { maintenanceData, loading } = useMaintenanceData();
  return { maintenance: maintenanceData, maintenanceLoading: loading };
};

/**
 * useMaintenanceToday
 * Returns the count of maintenance records completed today.
 */
const useMaintenanceToday = () => {
  const { maintenanceData, loading } = useMaintenanceData();

  const maintenanceToday = useMemo(() => {
    const todayDate = getTodayDateString();
    const todayMaintenance = maintenanceData.filter((item) => {
      const maintenanceDate = new Date(item.date_completed);
      const maintenanceDateString = `${maintenanceDate.getFullYear()}-${String(
        maintenanceDate.getMonth() + 1
      ).padStart(2, "0")}-${String(maintenanceDate.getDate()).padStart(2, "0")}`;
      return maintenanceDateString === todayDate;
    });
    return todayMaintenance.length;
  }, [maintenanceData]);

  return { maintenanceToday, maintenanceTodayLoading: loading };
};

/**
 * useFilteredMaintenance
 * Returns filtered maintenance data based on the provided filter options.
 * 
 * @param {object} options - Filtering options:
 *    filterOption: "all" | "currentDay" | "last7Days" | "currentMonth" | "selectMonth" | "custom"
 *    customFrom: start date (string or Date) for custom filtering.
 *    customTo: end date (string or Date) for custom filtering.
 *    selectedMonth: month number for "selectMonth".
 *    selectedYear: year number for "selectMonth".
 */
const useFilteredMaintenance = ({
  filterOption = "all",
  customFrom = null,
  customTo = null,
  selectedMonth = null,
  selectedYear = null,
} = {}) => {
  const { maintenanceData, loading } = useMaintenanceData();
  const today = new Date();

  const filteredMaintenance = useMemo(() => {
    let filtered = maintenanceData;
    if (filterOption === "currentDay") {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.date_completed);
        return itemDate.toDateString() === today.toDateString();
      });
    } else if (filterOption === "last7Days") {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.date_completed);
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        return itemDate >= sevenDaysAgo && itemDate <= today;
      });
    } else if (filterOption === "currentMonth") {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.date_completed);
        return (
          itemDate.getMonth() === today.getMonth() &&
          itemDate.getFullYear() === today.getFullYear()
        );
      });
    } else if (filterOption === "selectMonth" && selectedMonth && selectedYear) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.date_completed);
        return (
          itemDate.getMonth() + 1 === Number(selectedMonth) &&
          itemDate.getFullYear() === Number(selectedYear)
        );
      });
    } else if (filterOption === "custom" && customFrom && customTo) {
      const fromDate = new Date(customFrom);
      const toDate = new Date(customTo);
      // Include the entire end day
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.date_completed);
        return itemDate >= fromDate && itemDate <= toDate;
      });
    }
    return filtered;
  }, [maintenanceData, filterOption, customFrom, customTo, selectedMonth, selectedYear, today]);

  return { filteredMaintenance, loading };
};

export { useMaintenance, useMaintenanceToday, useFilteredMaintenance };
