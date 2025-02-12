import { useState, useEffect } from "react";
import axios from "axios";

const useRejectedItems = () => {
  const [rejectedItems, setRejectedItems] = useState(0);

  //total count
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/reason_for_rejection");
        setRejectedItems(response.data.totalRejected || 0);
      } catch (error) {
        console.error("Error fetching rejected items:", error);
        setRejectedItems(0);
      }
    };

    fetchData();
  }, []);

  return rejectedItems;
};


const useRejectedTableItems = () => {
  const [rejectItems, setRejectItems] = useState([]); // Default to an empty array
  const [rejectLoading, setRejectLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/reason_for_rejection");
       
        const rejectedData = response.data.rejectedTable || [];
        if (Array.isArray(rejectedData)) {
          setRejectItems(rejectedData);  // Set it to an array
        } else {
          console.error("Unexpected data format:", rejectedData);
          setRejectItems([]);  // Set to an empty array in case of unexpected format
        }
      } catch (error) {
        console.error("Error fetching rejected items:", error);
        setRejectItems([]);  // Fallback to an empty array on error
      } finally {
        setRejectLoading(false);
      }
    };

    fetchData();
  }, []);

  return { rejectItems, rejectLoading }; // Return the data correctly
};


const useTotalRejectToday = () => {
  const [totalRejects, setTotalRejects] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/reason_for_rejection");
        // Access the CORRECT total count
        setTotalRejects(response.data.totalReject || 0);
        console.log("Backend Response:", response.data.totalReject);
      } catch (error) {
        console.error("Error:", error);
        setTotalRejects(0);
      }
    };

    fetchData();
  }, []);

  return totalRejects; // Returns 2 for your sample data
};


export { useRejectedItems, useRejectedTableItems, useTotalRejectToday};
