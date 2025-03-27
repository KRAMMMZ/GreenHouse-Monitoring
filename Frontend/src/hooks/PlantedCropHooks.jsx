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
 * usePlantedCropsData
 * Fetches planted crops data once and listens for real-time updates via Socket.IO.
 */
const usePlantedCropsData = () => {
  const [plantedCropsData, setPlantedCropsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from API
  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:3001/planted_crops");
      // Assume the data structure has a key "plantedCropsTable"
      setPlantedCropsData(response.data.plantedCropsTable || []);
    } catch (error) {
      console.error("Error fetching planted crops data:", error);
      setPlantedCropsData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Listen for real-time updates on "plantedCropsData"
    socket.on("plantedCropsData", (data) => {
      if (data && data.plantedCropsTable) {
        setPlantedCropsData(data.plantedCropsTable);
        setLoading(false);
      }
    });

    return () => {
      socket.off("plantedCropsData");
    };
  }, []);

  return { plantedCropsData, loading };
};

/**
 * usePlantedCrops
 * Returns the planted crops data and a loading state.
 */
const usePlantedCrops = () => {
  const { plantedCropsData, loading } = usePlantedCropsData();
  return { plantedCrops: plantedCropsData, plantedCropsLoading: loading };
};

/**
 * usePlantedCropsToday
 * Returns the count of planted crops records with a planting_date of today.
 * Assumes each record has a "planting_date" field.
 */
const usePlantedCropsToday = () => {
  const { plantedCropsData, loading } = usePlantedCropsData();

  const plantedCropsToday = useMemo(() => {
    const todayDate = getTodayDateString();
    const todayCrops = plantedCropsData.filter((item) => {
      const plantingDate = new Date(item.planting_date);
      const plantingDateString = `${plantingDate.getFullYear()}-${String(
        plantingDate.getMonth() + 1
      ).padStart(2, "0")}-${String(plantingDate.getDate()).padStart(2, "0")}`;
      return plantingDateString === todayDate;
    });
    return todayCrops.length;
  }, [plantedCropsData]);

  return { plantedCropsToday, plantedCropsTodayLoading: loading };
};

/**
 * useFilteredPlantedCrops
 * Returns filtered planted crops data based on provided filter options.
 *
 * @param {object} options - Filtering options:
 *    filterOption: "all" | "currentDay" | "last7Days" | "currentMonth" | "selectMonth" | "custom"
 *    customFrom: start date for custom filtering.
 *    customTo: end date for custom filtering.
 *    selectedMonth: month number for "selectMonth".
 *    selectedYear: year number for "selectMonth".
 *
 * Assumes each record has a "planting_date" field.
 */
const useFilteredPlantedCrops = ({
  filterOption = "all",
  customFrom = null,
  customTo = null,
  selectedMonth = null,
  selectedYear = null,
} = {}) => {
  const { plantedCropsData, loading } = usePlantedCropsData();
  const today = new Date();

  const filteredPlantedCrops = useMemo(() => {
    let filtered = plantedCropsData;
    if (filterOption === "currentDay") {
      filtered = filtered.filter((item) => {
        const plantingDate = new Date(item.planting_date);
        return plantingDate.toDateString() === today.toDateString();
      });
    } else if (filterOption === "last7Days") {
      filtered = filtered.filter((item) => {
        const plantingDate = new Date(item.planting_date);
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        return plantingDate >= sevenDaysAgo && plantingDate <= today;
      });
    } else if (filterOption === "currentMonth") {
      filtered = filtered.filter((item) => {
        const plantingDate = new Date(item.planting_date);
        return (
          plantingDate.getMonth() === today.getMonth() &&
          plantingDate.getFullYear() === today.getFullYear()
        );
      });
    } else if (filterOption === "selectMonth" && selectedMonth && selectedYear) {
      filtered = filtered.filter((item) => {
        const plantingDate = new Date(item.planting_date);
        return (
          plantingDate.getMonth() + 1 === Number(selectedMonth) &&
          plantingDate.getFullYear() === Number(selectedYear)
        );
      });
    } else if (filterOption === "custom" && customFrom && customTo) {
      const fromDate = new Date(customFrom);
      const toDate = new Date(customTo);
      // Include the entire end day
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((item) => {
        const plantingDate = new Date(item.planting_date);
        return plantingDate >= fromDate && plantingDate <= toDate;
      });
    }
    return filtered;
  }, [plantedCropsData, filterOption, customFrom, customTo, selectedMonth, selectedYear, today]);

  return { filteredPlantedCrops, loading };
};

export { 
  usePlantedCrops, 
  usePlantedCropsToday, 
  useFilteredPlantedCrops 
};
