import { useState, useEffect } from "react";
import axios from "axios";

const useTotalHarvests = () => {
  const [harvestItems, setHarvestItems] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/harvests");
        setHarvestItems(response.data.totalHarvests || 0);
      } catch (error) {
        console.error("Error fetching total harvests:", error);
        setHarvestItems(0);
      }
    };

    fetchData();
  }, []);

  return harvestItems;
};

// New hook to get total harvests for today
const useTotalHarvestsToday = () => {
  const [harvestItemsToday, setHarvestItemsToday] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/harvests");
        setHarvestItemsToday(response.data.totalHarvestsToday || 0);
 

      } catch (error) {
        console.error("Error fetching total harvests for today:", error);
        setHarvestItemsToday(0);
      }
    };

    fetchData();
  }, []);

  return harvestItemsToday;
};

const useHarvestItems = () => {
  const [harvestItems, setHarvestItems] = useState([]);
  const [harvestLoading, setHarvestLoading] = useState(true); // Use a meaningful name

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/harvests");
        setHarvestItems(response.data.harvestTable || []); // Ensure fallback to an array
      } catch (error) {
        console.error("Error fetching harvest items:", error);
        setHarvestItems([]);
      } finally {
        setHarvestLoading(false);
      }
    };

    fetchData();
  }, []);

  return { harvestItems, harvestLoading };
};

export { useTotalHarvests, useTotalHarvestsToday,  useHarvestItems };