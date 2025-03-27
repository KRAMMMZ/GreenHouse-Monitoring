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
 * useHardwareComponentsData
 * Fetches hardware components data once and listens for real-time updates via Socket.IO.
 */
const useHardwareComponentsData = () => {
  const [hardwareComponentsData, setHardwareComponentsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from API
  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:3001/hardware_components");
      // Use sample data structure and ignore greenhouse_id and component_id
      setHardwareComponentsData(response.data.hardwareComponentsTable || []);
    } catch (error) {
      console.error("Error fetching hardware components data:", error);
      setHardwareComponentsData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Listen for real-time updates on "hardwareComponentsData"
    socket.on("hardwareComponentsData", (data) => {
      if (data && data.hardwareComponentsTable) {
        setHardwareComponentsData(data.hardwareComponentsTable);
        setLoading(false);
      }
    });

    return () => {
      socket.off("hardwareComponentsData");
    };
  }, []);

  return { hardwareComponentsData, loading };
};


const useHardwareComponents= () => {
  const { hardwareComponentsData, loading } = useHardwareComponentsData();
  return { hardwareComponents: hardwareComponentsData, hardwareStatusLoading: loading };
};

/**
 * useHardwareComponentsToday
 * Returns the count of hardware components records installed today.
 * Assumes each record has a "date_of_installation" field.
 */
const useHardwareComponentsToday = () => {
  const { hardwareComponentsData, loading } = useHardwareComponentsData();

  const hardwareComponentsToday = useMemo(() => {
    const todayDate = getTodayDateString();
    const todayComponents = hardwareComponentsData.filter((item) => {
      const compDate = new Date(item.date_of_installation);
      const compDateString = `${compDate.getFullYear()}-${String(compDate.getMonth() + 1).padStart(2, "0")}-${String(compDate.getDate()).padStart(2, "0")}`;
      return compDateString === todayDate;
    });
    return todayComponents.length;
  }, [hardwareComponentsData]);

  return { hardwareComponentsToday, hardwareComponentsTodayLoading: loading };
};

/**
 * useFilteredHardwareComponents
 * Returns filtered hardware components data based on provided filter options.
 * 
 * @param {object} options - Filtering options:
 *    filterOption: "all" | "currentDay" | "last7Days" | "currentMonth" | "selectMonth" | "custom"
 *    customFrom: start date for custom filtering.
 *    customTo: end date for custom filtering.
 *    selectedMonth: month number for "selectMonth".
 *    selectedYear: year number for "selectMonth".
 * 
 * Assumes each record has a "date_of_installation" field.
 */
const useFilteredHardwareComponents = ({
  filterOption = "all",
  customFrom = null,
  customTo = null,
  selectedMonth = null,
  selectedYear = null,
} = {}) => {
  const { hardwareComponentsData, loading } = useHardwareComponentsData();
  const today = new Date();

  const filteredHardwareComponents = useMemo(() => {
    let filtered = hardwareComponentsData;
    if (filterOption === "currentDay") {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.date_of_installation);
        return itemDate.toDateString() === today.toDateString();
      });
    } else if (filterOption === "last7Days") {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.date_of_installation);
        const sevenDaysAgo = new Date(today); 
        sevenDaysAgo.setDate(today.getDate() - 7);
        return itemDate >= sevenDaysAgo && itemDate <= today;
      });
    } else if (filterOption === "currentMonth") {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.date_of_installation);
        return itemDate.getMonth() === today.getMonth() && itemDate.getFullYear() === today.getFullYear();
      });
    } else if (filterOption === "selectMonth" && selectedMonth && selectedYear) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.date_of_installation);
        return (itemDate.getMonth() + 1 === Number(selectedMonth)) && (itemDate.getFullYear() === Number(selectedYear));
      });
    } else if (filterOption === "custom" && customFrom && customTo) {
      const fromDate = new Date(customFrom);
      const toDate = new Date(customTo);
      // Include the entire end day
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.date_of_installation);
        return itemDate >= fromDate && itemDate <= toDate;
      });
    }
    return filtered;
  }, [hardwareComponentsData, filterOption, customFrom, customTo, selectedMonth, selectedYear, today]);

  return { filteredHardwareComponents, loading };
};

export { 
  useHardwareComponents,
  useHardwareComponentsToday, 
  useFilteredHardwareComponents 
};
