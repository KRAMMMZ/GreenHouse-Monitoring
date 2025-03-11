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
 * useHardwareStatusData
 * Fetches hardware status data once and listens for real-time updates via Socket.IO.
 */
const useHardwareStatusData = () => {
  const [hardwareStatusData, setHardwareStatusData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from API
  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:3001/hardware_status");
      setHardwareStatusData(response.data.hardwareStatusTable || []);
    } catch (error) {
      console.error("Error fetching hardware status data:", error);
      setHardwareStatusData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Listen for real-time updates on the "hardwareStatusData" event
    socket.on("hardwareStatusData", (data) => {
      if (data && data.hardwareStatusTable) {
        setHardwareStatusData(data.hardwareStatusTable);
        setLoading(false);
      }
    });

    // Cleanup the socket event on unmount
    return () => {
      socket.off("hardwareStatusData");
    };
  }, []);

  return { hardwareStatusData, loading };
};

/**
 * useHardwareStatus
 * Returns the complete hardware status data and its loading state.
 */
const useHardwareStatus = () => {
  const { hardwareStatusData, loading } = useHardwareStatusData();
  return { hardwareStatus: hardwareStatusData, hardwareStatusLoading: loading };
};

/**
 * useHardwareStatusToday
 * Returns the count of hardware status records updated today.
 * Assumes each record has a "lastChecked" field.
 */
const useHardwareStatusToday = () => {
  const { hardwareStatusData, loading } = useHardwareStatusData();

  const hardwareStatusToday = useMemo(() => {
    const todayDate = getTodayDateString();
    const todayRecords = hardwareStatusData.filter((item) => {
      const checkedDate = new Date(item.lastChecked);
      const checkedDateString = `${checkedDate.getFullYear()}-${String(checkedDate.getMonth() + 1).padStart(2, "0")}-${String(checkedDate.getDate()).padStart(2, "0")}`;
      return checkedDateString === todayDate;
    });
    return todayRecords.length;
  }, [hardwareStatusData]);

  return { hardwareStatusToday, hardwareStatusTodayLoading: loading };
};

/**
 * useFilteredHardwareStatus
 * Returns filtered hardware status data based on the provided filter options.
 * 
 * @param {object} options - Filtering options:
 *    filterOption: "all" | "currentDay" | "last7Days" | "currentMonth" | "selectMonth" | "custom"
 *    customFrom: start date (string or Date) for custom filtering.
 *    customTo: end date (string or Date) for custom filtering.
 *    selectedMonth: month number for "selectMonth".
 *    selectedYear: year number for "selectMonth".
 */
const useFilteredHardwareStatus = ({
  filterOption = "all",
  customFrom = null,
  customTo = null,
  selectedMonth = null,
  selectedYear = null,
} = {}) => {
  const { hardwareStatusData, loading } = useHardwareStatusData();
  const today = new Date();

  const filteredHardwareStatus = useMemo(() => {
    let filtered = hardwareStatusData;
    if (filterOption === "currentDay") {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.lastChecked);
        return itemDate.toDateString() === today.toDateString();
      });
    } else if (filterOption === "last7Days") {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.lastChecked);
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        return itemDate >= sevenDaysAgo && itemDate <= today;
      });
    } else if (filterOption === "currentMonth") {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.lastChecked);
        return (
          itemDate.getMonth() === today.getMonth() &&
          itemDate.getFullYear() === today.getFullYear()
        );
      });
    } else if (filterOption === "selectMonth" && selectedMonth && selectedYear) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.lastChecked);
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
        const itemDate = new Date(item.lastChecked);
        return itemDate >= fromDate && itemDate <= toDate;
      });
    }
    return filtered;
  }, [hardwareStatusData, filterOption, customFrom, customTo, selectedMonth, selectedYear, today]);

  return { filteredHardwareStatus, loading };
};

export { useHardwareStatus, useHardwareStatusToday, useFilteredHardwareStatus };
