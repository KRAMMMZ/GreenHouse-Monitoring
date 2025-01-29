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

const useHarvestItems = () => {
  const [harvestItems, setHarvestItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/harvests");
        // Access the harvestTable property from the response data
        setHarvestItems(response.data.harvestTable || []);
      } catch (error) {
        console.error("Error fetching harvest items:", error);
        setHarvestItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { harvestItems, loading };
};

export { useTotalHarvests, useHarvestItems };