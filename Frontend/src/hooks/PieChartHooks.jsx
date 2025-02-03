import { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

// Helper function to get today's date in YYYY-MM-DD format (local time)
const getTodayDateString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const useRejectionDataPerDay = () => {
  const [rejectionData, setRejectionData] = useState({
    diseased: 0,
    physically_damaged: 0,
    too_small: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/reason_for_rejection");
        const rejectionTable = response.data.rejectionData || [];
        const today = getTodayDateString();

        const todaysData = rejectionTable.filter(item => item.rejection_date === today);

        const diseased = todaysData.reduce((sum, item) => sum + item.diseased, 0);
        const physicallyDamaged = todaysData.reduce((sum, item) => sum + item.physically_damaged, 0);
        const tooSmall = todaysData.reduce((sum, item) => sum + item.too_small, 0);

        setRejectionData({ diseased, physically_damaged: physicallyDamaged, too_small: tooSmall });
      } catch (error) {
        console.error("Error fetching rejection data:", error);
        setRejectionData({ diseased: 0, physically_damaged: 0, too_small: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    socket.on("updateRejections", fetchData);

    return () => {
      socket.off("updateRejections");
    };
  }, []);

  return { rejectionData, loading };
};

export default useRejectionDataPerDay;
