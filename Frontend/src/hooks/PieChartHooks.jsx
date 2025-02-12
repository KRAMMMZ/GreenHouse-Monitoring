import { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

const getTodayDateString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`; // Format as 'YYYY-MM-DD'
};

const useRejectionDataPerDay = () => {
  const [rejectionData, setRejectionData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/reason_for_rejection");
        
        const rejectionTable = response.data.rejectedTable || []; // Correct the key
        
        const todayDate = getTodayDateString(); // Get today's date as string (YYYY-MM-DD)

        const groupedData = rejectionTable.reduce(
          (acc, item) => {
            // Ensure we only compare the date part (YYYY-MM-DD)
            const date = item.rejection_date.split("T")[0]; // Split by 'T' and get the date part
            if (date === todayDate) {
              acc.diseased += item.diseased || 0;
              acc.physically_damaged += item.physically_damaged || 0;
              acc.too_small += item.too_small || 0; // Ensure all categories are accounted for
            }
            return acc;
          },
          { diseased: 0, physically_damaged: 0, too_small: 0 }
        );

       setRejectionData([
          { name: "Diseased", value: groupedData.diseased },
          { name: "Physically Damaged", value: groupedData.physically_damaged },
          { name: "Too Small", value: groupedData.too_small },
        ]);
      } catch (error) {
        console.error("Error fetching rejection data:", error);
        setRejectionData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    socket.on("updateRejections", fetchData); // Listen for updates to rejection data

    return () => {
      socket.off("updateRejections"); // Clean up socket listener on component unmount
    };
  }, []); // Empty array ensures this runs only once when the component mounts

  return { rejectionData, loading };
};

export default useRejectionDataPerDay;
