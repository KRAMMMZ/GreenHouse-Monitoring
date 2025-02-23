import { useState, useEffect } from "react";
import axios from "axios";

const getTodayDateString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};


 


const useRejectedTableItems = () => {
  const [rejectItems, setRejectItems] = useState([]); // Default to an empty arrays
  const [rejectLoading, setRejectLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/reason_for_rejection");
       
        
        setRejectItems(response.data.rejectedTable || []);
         
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:3001/reason_for_rejection");
        
        if (response.data && response.data.rejectedTable) {
          const todayDate = getTodayDateString();
          // Filter rejections to only include those from today using the rejectedTable array
          const totalRejectToday = response.data.rejectedTable.filter(reject => {
            return reject.rejection_date === todayDate;
          });

          setTotalRejects(totalRejectToday.length);
        } else {
          console.error("Error: No rejection data received");
          setTotalRejects(0);
        }
      } catch (error) {
        console.error("Error:", error);
        setTotalRejects(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { totalRejects, loading };
};


 


export {   useRejectedTableItems, useTotalRejectToday};
