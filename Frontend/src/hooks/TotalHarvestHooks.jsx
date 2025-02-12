import { useState, useEffect } from "react";
import axios from "axios";

// Helper function to get today's date in 'YYYY-MM-DD' format
const getTodayDateString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

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

const useTotalHarvestsToday = () => {
  const [harvestItemsToday, setHarvestItemsToday] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/harvests");

        // Log the fetched data to the console for debugging
        

        // Check if harvestTable is available and filter for today'ss date
        if (response.data && response.data.harvestTable) {
          const todayDate = getTodayDateString();

          // Filter harvests to only include those from today
          const harvestsToday = response.data.harvestTable.filter(harvest => {
            // Use the harvest_date field to match today's date
            return harvest.harvest_date === todayDate;
          });

          setHarvestItemsToday(harvestsToday.length); // Total count for today
          
        } else {
          console.error("Error: No harvest data received");
          setHarvestItemsToday(0); // Reset state if no data is found
        }
      } catch (error) {
        console.error("Error fetching total harvests for today:", error);
        setHarvestItemsToday(0); // Reset state in case of error
      }
    };

    fetchData();
  }, []); // Empty array ensures this runs only once when the component mounts

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

export { useTotalHarvests, useTotalHarvestsToday, useHarvestItems };
