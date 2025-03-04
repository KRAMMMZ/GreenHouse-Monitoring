import { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";

// Create a single socket connection instance
const socket = io("http://localhost:3001");

// Helper to format a Date object as "YYYY-MM-DD"
const getDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper to create a friendly label (e.g., "Feb 14")
const formatDateLabel = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const useRejectionData = () => {
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [rawRejectionTable, setRawRejectionTable] = useState([]);
  const [loading, setLoading] = useState(true);

  // Function to process raw rejection table into grouped Last 7 Days data
  const processRejectionData = (rejectionTable) => {
    const currentDate = new Date();
    const startDate = new Date();
    startDate.setDate(currentDate.getDate() - 6);
    const dateRange = [];
    for (let i = 0; i < 7; i++) {
      const tempDate = new Date(startDate);
      tempDate.setDate(startDate.getDate() + i);
      dateRange.push(getDateString(tempDate));
    }
    const groupedData = {};
    rejectionTable.forEach((item) => {
      const itemDate = new Date(item.rejection_date);
      const dateStr = getDateString(itemDate);
      if (dateRange.includes(dateStr)) {
        if (!groupedData[dateStr]) {
          groupedData[dateStr] = { diseased: 0, physically_damaged: 0, too_small: 0 };
        }
        groupedData[dateStr].diseased += item.diseased || 0;
        groupedData[dateStr].physically_damaged += item.physically_damaged || 0;
        groupedData[dateStr].too_small += item.too_small || 0;
      }
    });
    return dateRange.map((dateStr) => ({
      date: formatDateLabel(dateStr),
      diseased: groupedData[dateStr] ? groupedData[dateStr].diseased : 0,
      physically_damaged: groupedData[dateStr] ? groupedData[dateStr].physically_damaged : 0,
      too_small: groupedData[dateStr] ? groupedData[dateStr].too_small : 0,
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:3001/reason_for_rejection");
        const rejectionTable = response.data.rejectedTable || [];
        setRawRejectionTable(rejectionTable);
        const sortedData = processRejectionData(rejectionTable);
        setTimeSeriesData(sortedData);
      } catch (error) {
        console.error("Error fetching rejection data:", error);
        setTimeSeriesData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Listen for real-time updates via Socket.IO
    socket.on("RejectData", (data) => {
      if (data && data.rejectedTable) {
        setRawRejectionTable(data.rejectedTable);
        const sortedData = processRejectionData(data.rejectedTable);
        setTimeSeriesData(sortedData);
      }
    });

    // Clean up the socket listener on unmount
    return () => {
      socket.off("RejectData");
    };
  }, []);

  // Function: Get rejection data for a specific month (user-selected)
  const getRejectionMonthData = (month, year) => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const dateRange = [];
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      dateRange.push(getDateString(new Date(d)));
    }
    const groupedData = {};
    rawRejectionTable.forEach((item) => {
      const itemDate = new Date(item.rejection_date);
      const dateStr = getDateString(itemDate);
      if (dateRange.includes(dateStr)) {
        if (!groupedData[dateStr]) {
          groupedData[dateStr] = { diseased: 0, physically_damaged: 0, too_small: 0 };
        }
        groupedData[dateStr].diseased += item.diseased || 0;
        groupedData[dateStr].physically_damaged += item.physically_damaged || 0;
        groupedData[dateStr].too_small += item.too_small || 0;
      }
    });
    return dateRange.map((dateStr) => ({
      date: formatDateLabel(dateStr),
      diseased: groupedData[dateStr] ? groupedData[dateStr].diseased : 0,
      physically_damaged: groupedData[dateStr] ? groupedData[dateStr].physically_damaged : 0,
      too_small: groupedData[dateStr] ? groupedData[dateStr].too_small : 0,
    }));
  };

  // Function: Get rejection data for the current day 
  const getCurrentDayDataRejection = () => {
    const today = new Date();
    const dateStr = getDateString(today);
    const groupedData = {};
    rawRejectionTable.forEach((item) => {
      const itemDate = new Date(item.rejection_date);
      const itemDateStr = getDateString(itemDate);
      if (itemDateStr === dateStr) {
        if (!groupedData[dateStr]) {
          groupedData[dateStr] = { diseased: 0, physically_damaged: 0, too_small: 0 };
        }
        groupedData[dateStr].diseased += item.diseased || 0;
        groupedData[dateStr].physically_damaged += item.physically_damaged || 0;
        groupedData[dateStr].too_small += item.too_small || 0;
      }
    });
    return [
      {
        date: formatDateLabel(dateStr),
        diseased: groupedData[dateStr] ? groupedData[dateStr].diseased : 0,
        physically_damaged: groupedData[dateStr] ? groupedData[dateStr].physically_damaged : 0,
        too_small: groupedData[dateStr] ? groupedData[dateStr].too_small : 0,
      },
    ];
  };

  // Function: Get overall total rejection data (aggregated)
  const getOverallTotalRejectionData = () => {
    return rawRejectionTable.reduce(
      (totals, item) => {
        totals.diseased += item.diseased || 0;
        totals.physically_damaged += item.physically_damaged || 0;
        totals.too_small += item.too_small || 0;
        return totals;
      },
      { diseased: 0, physically_damaged: 0, too_small: 0 }
    );
  };

  // Function: Get current month rejection data (using current month/year)
  const getRejectionCurrentMonthData = () => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    return getRejectionMonthData(currentMonth, currentYear);
  };

  // Function: Filter rejection data by a given FROM and TO date
  const filterRejectionData = (from, to) => {
    const start = new Date(from);
    const end = new Date(to);
    const dateRange = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dateRange.push(getDateString(new Date(d)));
    }
    const groupedData = {};
    rawRejectionTable.forEach((item) => {
      const itemDate = new Date(item.rejection_date);
      const dateStr = getDateString(itemDate);
      if (dateRange.includes(dateStr)) {
        if (!groupedData[dateStr]) {
          groupedData[dateStr] = { diseased: 0, physically_damaged: 0, too_small: 0 };
        }
        groupedData[dateStr].diseased += item.diseased || 0;
        groupedData[dateStr].physically_damaged += item.physically_damaged || 0;
        groupedData[dateStr].too_small += item.too_small || 0;
      }
    });
    return dateRange.map((dateStr) => ({
      date: formatDateLabel(dateStr),
      diseased: groupedData[dateStr] ? groupedData[dateStr].diseased : 0,
      physically_damaged: groupedData[dateStr] ? groupedData[dateStr].physically_damaged : 0,
      too_small: groupedData[dateStr] ? groupedData[dateStr].too_small : 0,
    }));
  };

  return {
    timeSeriesData,
    loading,
    getCurrentDayDataRejection,
    getOverallTotalRejectionData,
    getRejectionCurrentMonthData,
    getRejectionMonthData,
    filterRejectionData,
  };
};

export default useRejectionData;
