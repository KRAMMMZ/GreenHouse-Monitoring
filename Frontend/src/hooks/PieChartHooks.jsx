import { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

const useRejectionData = () => {
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Helper to format a Date object as "YYYY-MM-DD"
    const getDateString = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    // Helper to create a friendly label like "Feb 14"
    const formatDateLabel = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:3001/reason_for_rejection");
        const rejectionTable = response.data.rejectedTable || [];

        const currentDate = new Date();
        const startDate = new Date();
        // Subtract 6 days so that the range includes the current day (7 days total)
        startDate.setDate(currentDate.getDate() - 6);

        // Build an array of date strings for the last 7 days (including today)
        const dateRange = [];
        for (let i = 0; i < 7; i++) {
          const tempDate = new Date(startDate);
          tempDate.setDate(startDate.getDate() + i);
          dateRange.push(getDateString(tempDate));
        }

        // Group the rejection data by date (using YYYY-MM-DD as the key)
        const groupedData = rejectionTable.reduce((acc, item) => {
          const itemDate = new Date(item.rejection_date);
          const itemDateStr = getDateString(itemDate);
          // Only include data from the last 7 days
          if (dateRange.includes(itemDateStr)) {
            if (!acc[itemDateStr]) {
              acc[itemDateStr] = { diseased: 0, physically_damaged: 0, too_small: 0 };
            }
            acc[itemDateStr].diseased += item.diseased || 0;
            acc[itemDateStr].physically_damaged += item.physically_damaged || 0;
            acc[itemDateStr].too_small += item.too_small || 0;
          }
          return acc;
        }, {});

        // Construct the final array ensuring every day in dateRange is represented
        const sortedData = dateRange.map(dateStr => ({
          date: formatDateLabel(dateStr),
          diseased: groupedData[dateStr] ? groupedData[dateStr].diseased : 0,
          physically_damaged: groupedData[dateStr] ? groupedData[dateStr].physically_damaged : 0,
          too_small: groupedData[dateStr] ? groupedData[dateStr].too_small : 0,
        }));

        setTimeSeriesData(sortedData);
      } catch (error) {
        console.error("Error fetching rejection data:", error);
        setTimeSeriesData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    socket.on("updateRejections", fetchData);

    return () => {
      socket.off("updateRejections", fetchData);
    };
  }, []);

  return { timeSeriesData, loading };
};

export default useRejectionData;
