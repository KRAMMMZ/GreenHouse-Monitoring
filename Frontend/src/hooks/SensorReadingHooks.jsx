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
 * useSensorReadingsData
 * Fetches sensor readings data once and listens for real-time updates via Socket.IO.
 */
const useSensorReadingsData = () => {
  const [sensorReadingsData, setSensorReadingsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from API
  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:3001/sensor-readings");
      // Assume the data structure has a key "sensorReadingTable" or a similar key holding the readings
      setSensorReadingsData(response.data.sensorReadingTable || []);
    } catch (error) {
      console.error("Error fetching sensor readings data:", error);
      setSensorReadingsData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Listen for real-time updates on "sensorReadingsData"
    socket.on("sensorReadingsData", (data) => {
      if (data && data.db_readings) {
        setSensorReadingsData(data.db_readings);
      }
      setLoading(false);
    });

    return () => {
      socket.off("sensorReadingsData");
    };
  }, []);

  return { sensorReadingsData, loading };
};

/**
 * useSensorReadings
 * Returns the sensor readings data and a loading state.
 */
const useSensorReadings = () => {
  const { sensorReadingsData, loading } = useSensorReadingsData();
  return { sensorReadings: sensorReadingsData, sensorReadingsLoading: loading };
};

/**
 * useSensorReadingsToday
 * Returns the count of sensor reading records with a reading_time of today.
 * Assumes each record has a "reading_time" field.
 */
const useSensorReadingsToday = () => {
  const { sensorReadingsData, loading } = useSensorReadingsData();

  const sensorReadingsToday = useMemo(() => {
    const todayDate = getTodayDateString();
    const todayReadings = sensorReadingsData.filter((item) => {
      const readingTime = new Date(item.reading_time);
      const readingDateString = `${readingTime.getFullYear()}-${String(
        readingTime.getMonth() + 1
      ).padStart(2, "0")}-${String(readingTime.getDate()).padStart(2, "0")}`;
      return readingDateString === todayDate;
    });
    return todayReadings.length;
  }, [sensorReadingsData]);

  return { sensorReadingsToday, sensorReadingsTodayLoading: loading };
};

/**
 * useFilteredSensorReadings
 * Returns filtered sensor readings data based on provided filter options.
 *
 * @param {object} options - Filtering options:
 *    filterOption: "all" | "currentDay" | "last7Days" | "currentMonth" | "selectMonth" | "yearly" | "custom"
 *    customFrom: start date for custom filtering.
 *    customTo: end date for custom filtering.
 *    selectedMonth: month number for "selectMonth".
 *    selectedYear: year number for "selectMonth" or "yearly".
 *
 * Assumes each record has a "reading_time" field.
 */
const useFilteredSensorReadings = ({
  filterOption = "all",
  customFrom = null,
  customTo = null,
  selectedMonth = null,
  selectedYear = null,
} = {}) => {
  const { sensorReadingsData, loading } = useSensorReadingsData();
  const today = new Date();

  const filteredSensorReadings = useMemo(() => {
    let filtered = sensorReadingsData;
    if (filterOption === "currentDay") {
      filtered = filtered.filter((item) => {
        const readingTime = new Date(item.reading_time);
        return readingTime.toDateString() === today.toDateString();
      });
    } else if (filterOption === "last7Days") {
      filtered = filtered.filter((item) => {
        const readingTime = new Date(item.reading_time);
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        return readingTime >= sevenDaysAgo && readingTime <= today;
      });
    } else if (filterOption === "currentMonth") {
      filtered = filtered.filter((item) => {
        const readingTime = new Date(item.reading_time);
        return (
          readingTime.getMonth() === today.getMonth() &&
          readingTime.getFullYear() === today.getFullYear()
        );
      });
    } else if (filterOption === "selectMonth" && selectedMonth && selectedYear) {
      filtered = filtered.filter((item) => {
        const readingTime = new Date(item.reading_time);
        return (
          readingTime.getMonth() + 1 === Number(selectedMonth) &&
          readingTime.getFullYear() === Number(selectedYear)
        );
      });
    } else if (filterOption === "yearly" && selectedYear) {
      filtered = filtered.filter((item) => {
        const readingTime = new Date(item.reading_time);
        return readingTime.getFullYear() === Number(selectedYear);
      });
    } else if (filterOption === "custom" && customFrom && customTo) {
      const fromDate = new Date(customFrom);
      const toDate = new Date(customTo);
      // Include the entire end day
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((item) => {
        const readingTime = new Date(item.reading_time);
        return readingTime >= fromDate && readingTime <= toDate;
      });
    }
    return filtered;
  }, [sensorReadingsData, filterOption, customFrom, customTo, selectedMonth, selectedYear, today]);

  return { filteredSensorReadings, loading };
};

export { 
  useSensorReadings, 
  useSensorReadingsToday, 
  useFilteredSensorReadings 
};
