// hooks/useRejectionData.js
import { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";

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
  // For yearly data, you might want to include the year if data spans multiple years,
  // but for a single selected year, "Mon Day" is usually fine.
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
        const rejectionType = item.type; 
        if (!groupedData[dateStr]) {
          groupedData[dateStr] = { diseased: 0, physically_damaged: 0, too_small: 0 };
        }

        if (rejectionType === 'diseased') {
          groupedData[dateStr].diseased += item.quantity || 0;
        } else if (rejectionType === 'physically_damaged') {
          groupedData[dateStr].physically_damaged += item.quantity || 0;
        } else if (rejectionType === 'too_small') {
          groupedData[dateStr].too_small += item.quantity || 0;
        }
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

    socket.on("RejectData", (data) => {
      if (data && data.rejectedTable) { 
        setRawRejectionTable(data.rejectedTable);
        // Re-process based on current filter if needed, or let component decide.
        // For simplicity, we'll update raw data and let active filter function re-evaluate.
        // If the current filter is "last7", we can update timeSeriesData here.
        // For other filters, the component will call the respective function which uses rawRejectionTable.
        const sortedData = processRejectionData(data.rejectedTable); // Assuming default view is last7
        setTimeSeriesData(sortedData);
      }
    });

    return () => {
      socket.off("RejectData");
    };
  }, []);

    const getRejectionMonthData = (month, year) => {
      const firstDay = new Date(year, month - 1, 1);
      const lastDay = new Date(year, month, 0); // Day 0 of next month is last day of current month
      lastDay.setHours(23, 59, 59, 999); // Ensure end of day

      const groupedData = {};
      const datesInMonth = new Set();

      rawRejectionTable.forEach((item) => {
        const itemDate = new Date(item.rejection_date);
        if (itemDate >= firstDay && itemDate <= lastDay) {
          const dateStr = getDateString(itemDate);
          datesInMonth.add(dateStr);
          const rejectionType = item.type;
          if (!groupedData[dateStr]) {
            groupedData[dateStr] = { diseased: 0, physically_damaged: 0, too_small: 0 };
          }
          if (rejectionType === 'diseased') {
            groupedData[dateStr].diseased += item.quantity || 0;
          } else if (rejectionType === 'physically_damaged') {
            groupedData[dateStr].physically_damaged += item.quantity || 0;
          } else if (rejectionType === 'too_small') {
            groupedData[dateStr].too_small += item.quantity || 0;
          }
        }
      });
      const sortedDates = Array.from(datesInMonth).sort((a,b) => new Date(a) - new Date(b));
      return sortedDates.map((dateStr) => ({
        date: formatDateLabel(dateStr),
        diseased: groupedData[dateStr] ? groupedData[dateStr].diseased : 0,
        physically_damaged: groupedData[dateStr] ? groupedData[dateStr].physically_damaged : 0,
        too_small: groupedData[dateStr] ? groupedData[dateStr].too_small : 0,
      }));
    };

  const getCurrentDayDataRejection = () => {
    const today = new Date();
    const dateStr = getDateString(today);
    const groupedData = {};
    rawRejectionTable.forEach((item) => {
      const itemDate = new Date(item.rejection_date);
      const itemDateStr = getDateString(itemDate);
      if (itemDateStr === dateStr) {
        const rejectionType = item.type;
        if (!groupedData[dateStr]) {
          groupedData[dateStr] = { diseased: 0, physically_damaged: 0, too_small: 0 };
        }
        if (rejectionType === 'diseased') {
          groupedData[dateStr].diseased += item.quantity || 0;
        } else if (rejectionType === 'physically_damaged') {
          groupedData[dateStr].physically_damaged += item.quantity || 0;
        } else if (rejectionType === 'too_small') {
          groupedData[dateStr].too_small += item.quantity || 0;
        }
      }
    });
    return [ // Return as an array for consistency with other data structures
      {
        date: formatDateLabel(dateStr),
        diseased: groupedData[dateStr] ? groupedData[dateStr].diseased : 0,
        physically_damaged: groupedData[dateStr] ? groupedData[dateStr].physically_damaged : 0,
        too_small: groupedData[dateStr] ? groupedData[dateStr].too_small : 0,
      },
    ];
  };

  const getOverallTotalRejectionData = () => {
    return rawRejectionTable.reduce(
      (totals, item) => {
        if (item.type === 'diseased') {
          totals.diseased += item.quantity || 0;
        } else if (item.type === 'physically_damaged') {
          totals.physically_damaged += item.quantity || 0;
        } else if (item.type === 'too_small') {
          totals.too_small += item.quantity || 0;
        }
        return totals;
      },
      // This needs a 'date' field if it's to be used directly in the chart.
      // For overall totals, the chart might be a single bar or display differently.
      // Let's assume it's processed in the component if needed, or add a generic date.
      { date: "Overall", diseased: 0, physically_damaged: 0, too_small: 0 }
    );
  };

  const getRejectionCurrentMonthData = () => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    return getRejectionMonthData(currentMonth, currentYear);
  };

   const filterRejectionData = (from, to) => {
    const startDate = new Date(from);
    startDate.setHours(0,0,0,0);
    const endDate = new Date(to);
    endDate.setHours(23,59,59,999);

    const groupedData = {};
    const datesInRange = new Set();

    rawRejectionTable.forEach((item) => {
      const itemDate = new Date(item.rejection_date);
      if (itemDate >= startDate && itemDate <= endDate) {
        const dateStr = getDateString(itemDate);
        datesInRange.add(dateStr);
        const rejectionType = item.type;
        if (!groupedData[dateStr]) {
          groupedData[dateStr] = { diseased: 0, physically_damaged: 0, too_small: 0 };
        }
        if (rejectionType === 'diseased') {
          groupedData[dateStr].diseased += item.quantity || 0;
        } else if (rejectionType === 'physically_damaged') {
          groupedData[dateStr].physically_damaged += item.quantity || 0;
        } else if (rejectionType === 'too_small') {
          groupedData[dateStr].too_small += item.quantity || 0;
        }
      }
    });
    const sortedDates = Array.from(datesInRange).sort((a,b) => new Date(a) - new Date(b));
    return sortedDates.map((dateStr) => ({
      date: formatDateLabel(dateStr),
      diseased: groupedData[dateStr] ? groupedData[dateStr].diseased : 0,
      physically_damaged: groupedData[dateStr] ? groupedData[dateStr].physically_damaged : 0,
      too_small: groupedData[dateStr] ? groupedData[dateStr].too_small : 0,
    }));
  };

  // NEW FUNCTION: Get rejection data for a specific year
  const getRejectionYearlyData = (year) => {
    const yearNumber = Number(year);
    const yearStart = new Date(yearNumber, 0, 1, 0, 0, 0, 0); // Jan 1st
    const yearEnd = new Date(yearNumber, 11, 31, 23, 59, 59, 999); // Dec 31st

    const groupedData = {};
    const datesInYear = new Set();

    rawRejectionTable.forEach((item) => {
      const itemDate = new Date(item.rejection_date);
      if (itemDate >= yearStart && itemDate <= yearEnd) {
        const dateStr = getDateString(itemDate); // YYYY-MM-DD
        datesInYear.add(dateStr);
        const rejectionType = item.type;
        if (!groupedData[dateStr]) {
          groupedData[dateStr] = { diseased: 0, physically_damaged: 0, too_small: 0 };
        }
        if (rejectionType === 'diseased') {
          groupedData[dateStr].diseased += item.quantity || 0;
        } else if (rejectionType === 'physically_damaged') {
          groupedData[dateStr].physically_damaged += item.quantity || 0;
        } else if (rejectionType === 'too_small') {
          groupedData[dateStr].too_small += item.quantity || 0;
        }
      }
    });

    const sortedDates = Array.from(datesInYear).sort((a, b) => new Date(a) - new Date(b));

    return sortedDates.map((dateStr) => ({
      date: formatDateLabel(dateStr), // "Mon Day" e.g. "Jan 01"
      diseased: groupedData[dateStr] ? groupedData[dateStr].diseased : 0,
      physically_damaged: groupedData[dateStr] ? groupedData[dateStr].physically_damaged : 0,
      too_small: groupedData[dateStr] ? groupedData[dateStr].too_small : 0,
    }));
  };

  return {
    timeSeriesData, // This is essentially "last 7 days" data by default
    loading,
    rawRejectionTable, // Export if component needs to do custom processing not covered by helpers
    getCurrentDayDataRejection,
    getOverallTotalRejectionData,
    getRejectionCurrentMonthData,
    getRejectionMonthData,
    filterRejectionData,
    getRejectionYearlyData, // Export new function
  };
};

export default useRejectionData;