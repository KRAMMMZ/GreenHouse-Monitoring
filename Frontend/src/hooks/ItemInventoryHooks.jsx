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

const useItemInventoryData = () => {
  const [itemInventoryData, setItemInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from API
  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:3001/all-inventory/inventory");
      // Assume the data structure has a key "itemInventoryTable"
      setItemInventoryData(response.data.itemInventoryTable || []);
    } catch (error) {
      console.error("Error fetching inventory data:", error);
      setItemInventoryData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Listen for real-time updates on "ItemInventoryData"
    socket.on("ItemInventoryData", (data) => {
      if (data && data.itemInventoryTable) {
        setItemInventoryData(data.itemInventoryTable);
        setLoading(false);
      }
    });

    return () => {
      socket.off("ItemInventoryData");
    };
  }, []);

  return { itemInventoryData, loading };
};

/**
 * useItemInventory
 * Returns the inventory data and a loading state.
 */
const useItemInventory = () => {
  const { itemInventoryData, loading } = useItemInventoryData();
  return { itemInventory: itemInventoryData, itemInventoryLoading: loading };
};

export { useItemInventory };
