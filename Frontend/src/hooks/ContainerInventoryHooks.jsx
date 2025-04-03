import axios from "axios";
import { useState, useEffect } from "react";
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

const useContainerInventoryData = () => {
  const [containerInventoryData, setContainerInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from API
  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:3001/all-inventory/inventory_container");
      // Assume the data structure has a key "containerInventoryTable"
      setContainerInventoryData(response.data.containerInventoryTable || []);
    } catch (error) {
      console.error("Error fetching container inventory data:", error);
      setContainerInventoryData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Listen for real-time updates on "ContainerInventoryData"
    socket.on("ContainerInventoryData", (data) => {
      if (data && data.containerInventoryTable) {
        setContainerInventoryData(data.containerInventoryTable);
        setLoading(false);
      }
    });

    return () => {
      socket.off("ContainerInventoryData");
    };
  }, []);

  return { containerInventoryData, loading };
};

/**
 * useContainerInventory
 * Returns the container inventory data and a loading state.
 */
const useContainerInventory = () => {
  const { containerInventoryData, loading } = useContainerInventoryData();
  return { containerInventory: containerInventoryData, containerInventoryLoading: loading };
};

export { useContainerInventory };
