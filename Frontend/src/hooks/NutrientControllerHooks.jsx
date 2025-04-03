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
 * useNutrientControllersData
 * Fetches nutrient controllers data once and listens for real-time updates via Socket.IO.
 */
const useNutrientControllersData = () => {
  const [nutrientControllersData, setNutrientControllersData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from API
  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:3001/nutrient_controllers");
      // Assume the data structure has a key "nutrientControllersTable"
      setNutrientControllersData(response.data.nutrientControllerTable || []);
    } catch (error) {
      console.error("Error fetching nutrient controllers data:", error);
      setNutrientControllersData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Listen for real-time updates on "nutrientControllersData"
    socket.on("nutrientControllersData", (data) => {
      if (data && data.nutrientControllersTable) {
        setNutrientControllersData(data.nutrientControllerTable);
        setLoading(false);
      }
    });

    return () => {
      socket.off("nutrientControllersData");
    };
  }, []);

  return { nutrientControllersData, loading };
};

/**
 * useNutrientControllers
 * Returns the nutrient controllers data and a loading state.
 */
const useNutrientControllers = () => {
  const { nutrientControllersData, loading } = useNutrientControllersData();
  return { nutrientControllers: nutrientControllersData, nutrientControllersLoading: loading };
};

/**
 * useNutrientControllersToday
 * Returns the count of nutrient controller records with a dispensed_time of today.
 * Assumes each record has a "dispensed_time" field.
 */
const useNutrientControllersToday = () => {
  const { nutrientControllersData, loading } = useNutrientControllersData();

  const nutrientControllersToday = useMemo(() => {
    const todayDate = getTodayDateString();
    const todayControllers = nutrientControllersData.filter((item) => {
      const dispensedTime = new Date(item.dispensed_time);
      const dispensedDateString = `${dispensedTime.getFullYear()}-${String(
        dispensedTime.getMonth() + 1
      ).padStart(2, "0")}-${String(dispensedTime.getDate()).padStart(2, "0")}`;
      return dispensedDateString === todayDate;
    });
    return todayControllers.length;
  }, [nutrientControllersData]);

  return { nutrientControllersToday, nutrientControllersTodayLoading: loading };
};

/**
 * useFilteredNutrientControllers
 * Returns filtered nutrient controllers data based on provided filter options.
 *
 * @param {object} options - Filtering options:
 *    filterOption: "all" | "currentDay" | "last7Days" | "currentMonth" | "selectMonth" | "custom"
 *    customFrom: start date for custom filtering.
 *    customTo: end date for custom filtering.
 *    selectedMonth: month number for "selectMonth".
 *    selectedYear: year number for "selectMonth".
 *
 * Assumes each record has a "dispensed_time" field.
 */
const useFilteredNutrientControllers = ({
  filterOption = "all",
  customFrom = null,
  customTo = null,
  selectedMonth = null,
  selectedYear = null,
} = {}) => {
  const { nutrientControllersData, loading } = useNutrientControllersData();
  const today = new Date();

  const filteredNutrientControllers = useMemo(() => {
    let filtered = nutrientControllersData;
    if (filterOption === "currentDay") {
      filtered = filtered.filter((item) => {
        const dispensedTime = new Date(item.dispensed_time);
        return dispensedTime.toDateString() === today.toDateString();
      });
    } else if (filterOption === "last7Days") {
      filtered = filtered.filter((item) => {
        const dispensedTime = new Date(item.dispensed_time);
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        return dispensedTime >= sevenDaysAgo && dispensedTime <= today;
      });
    } else if (filterOption === "currentMonth") {
      filtered = filtered.filter((item) => {
        const dispensedTime = new Date(item.dispensed_time);
        return (
          dispensedTime.getMonth() === today.getMonth() &&
          dispensedTime.getFullYear() === today.getFullYear()
        );
      });
    } else if (filterOption === "selectMonth" && selectedMonth && selectedYear) {
      filtered = filtered.filter((item) => {
        const dispensedTime = new Date(item.dispensed_time);
        return (
          dispensedTime.getMonth() + 1 === Number(selectedMonth) &&
          dispensedTime.getFullYear() === Number(selectedYear)
        );
      });
    } else if (filterOption === "custom" && customFrom && customTo) {
      const fromDate = new Date(customFrom);
      const toDate = new Date(customTo);
      // Include the entire end day
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((item) => {
        const dispensedTime = new Date(item.dispensed_time);
        return dispensedTime >= fromDate && dispensedTime <= toDate;
      });
    }
    return filtered;
  }, [nutrientControllersData, filterOption, customFrom, customTo, selectedMonth, selectedYear, today]);

  return { filteredNutrientControllers, loading };
};

export { 
  useNutrientControllers, 
  useNutrientControllersToday, 
  useFilteredNutrientControllers 
};
