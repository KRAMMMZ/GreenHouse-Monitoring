import { useState, useEffect, useCallback } from "react";
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
function formatDateLabel(dateStr) {
  const [year, month, day] = dateStr.split('-');
  // e.g. "2025-02-01" -> "Feb 1, 2025"
  return new Date(+year, +month - 1, +day).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  
  });
}
function parseDateLocal(dateString) {
  const [year, month, day] = dateString.split('-');
  return new Date(+year, +month - 1, +day);
}

const useHarvestHistory = () => {
  const [harvestHistory, setHarvestHistory] = useState([]);
  const [rawHarvestTable, setRawHarvestTable] = useState([]);
  const [loading, setLoading] = useState(true);

  // Function to process raw table data into grouped Last 7 Days data
  const processHarvestData = (table) => {
    const today = new Date();
    const dateRange = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dateRange.push(getDateString(date));
    }
    const groupedData = {};
    table.forEach((item) => {
      const itemDate = new Date(item.harvest_date);
      const dateStr = getDateString(itemDate);
      if (dateRange.includes(dateStr)) {
        if (!groupedData[dateStr]) {
          groupedData[dateStr] = { accepted: 0, rejected: 0, totalYield: 0 };
        }
        groupedData[dateStr].accepted += item.accepted;
        groupedData[dateStr].rejected += item.total_rejected;
        groupedData[dateStr].totalYield += item.total_yield;
      }
    });
    return dateRange.map((dateStr) => ({
      date: formatDateLabel(dateStr),
      accepted: groupedData[dateStr] ? groupedData[dateStr].accepted : 0,
      rejected: groupedData[dateStr] ? groupedData[dateStr].rejected : 0,
      totalYield: groupedData[dateStr] ? groupedData[dateStr].totalYield : 0,
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:3001/harvests");
        const table = response.data.harvestTable || [];
        setRawHarvestTable(table);
        const sortedData = processHarvestData(table);
        setHarvestHistory(sortedData);
      } catch (error) {
        console.error("Error fetching harvest data:", error);
        setHarvestHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Listen for harvest updates via Socket.IO
    socket.on("harvestData", (data) => {
      if (data && data.harvestTable) {
        setRawHarvestTable(data.harvestTable);
        const sortedData = processHarvestData(data.harvestTable);
        setHarvestHistory(sortedData);
      }
    });

    // Clean up the socket listener on unmount
    return () => {
      socket.off("harvestData");
    };
  }, []);

  // Function: Get harvest data for a specific month (user-selected)
  const getMonthData = useCallback(
    (month, year) => {
      const firstDay = new Date(year, month - 1, 1);
      const lastDay = new Date(year, month, 0);
      const dateRange = [];
      for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
        dateRange.push(getDateString(new Date(d)));
      }
      const groupedData = {};
      rawHarvestTable.forEach((item) => {
        const itemDate = new Date(item.harvest_date);
        const dateStr = getDateString(itemDate);
        if (dateRange.includes(dateStr)) {
          if (!groupedData[dateStr]) {
            groupedData[dateStr] = { accepted: 0, rejected: 0, totalYield: 0 };
          }
          groupedData[dateStr].accepted += item.accepted;
          groupedData[dateStr].rejected += item.total_rejected;
          groupedData[dateStr].totalYield += item.total_yield;
        }
      });
      return dateRange.map((dateStr) => ({
        date: formatDateLabel(dateStr),
        accepted: groupedData[dateStr] ? groupedData[dateStr].accepted : 0,
        rejected: groupedData[dateStr] ? groupedData[dateStr].rejected : 0,
        totalYield: groupedData[dateStr] ? groupedData[dateStr].totalYield : 0,
      }));
    },
    [rawHarvestTable]
  );

  // Function: Get current day harvest data
  const getCurrentDayData = useCallback(() => {
    const today = new Date();
    const dateStr = getDateString(today);
    const groupedData = {};
    rawHarvestTable.forEach((item) => {
      const itemDate = new Date(item.harvest_date);
      const itemDateStr = getDateString(itemDate);
      if (itemDateStr === dateStr) {
        if (!groupedData[dateStr]) {
          groupedData[dateStr] = { accepted: 0, rejected: 0, totalYield: 0 };
        }
        groupedData[dateStr].accepted += item.accepted;
        groupedData[dateStr].rejected += item.total_rejected;
        groupedData[dateStr].totalYield += item.total_yield;
      }
    });
    return [
      {
        date: formatDateLabel(dateStr),
        accepted: groupedData[dateStr] ? groupedData[dateStr].accepted : 0,
        rejected: groupedData[dateStr] ? groupedData[dateStr].rejected : 0,
        totalYield: groupedData[dateStr] ? groupedData[dateStr].totalYield : 0,
      },
    ];
  }, [rawHarvestTable]);

  // Function: Get overall total harvest data (aggregated) 
  const getOverallTotalData = useCallback(() => {
    return rawHarvestTable.reduce(
      (totals, item) => {
        totals.accepted += item.accepted || 0;
        totals.rejected += item.total_rejected || 0;
        totals.totalYield += item.total_yield || 0;
        return totals;
      },
      { accepted: 0, rejected: 0, totalYield: 0 }
    );
  }, [rawHarvestTable]);

  // Function: Get current month harvest data (using current month/year)
  const getCurrentMonthData = useCallback(() => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    return getMonthData(currentMonth, currentYear);
  }, [getMonthData]);

  // Function: Filter harvest data by a given FROM and TO date
  const filterHarvestData = useCallback(
    (from, to) => {
      const start = new Date(from);
      const end = new Date(to);
      const dateRange = [];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dateRange.push(getDateString(new Date(d)));
      }
      const groupedData = {};
      rawHarvestTable.forEach((item) => {
        const itemDate = new Date(item.harvest_date);
        const dateStr = getDateString(itemDate);
        if (dateRange.includes(dateStr)) {
          if (!groupedData[dateStr]) {
            groupedData[dateStr] = { accepted: 0, rejected: 0, totalYield: 0 };
          }
          groupedData[dateStr].accepted += item.accepted;
          groupedData[dateStr].rejected += item.total_rejected;
          groupedData[dateStr].totalYield += item.total_yield;
        }
      });
      return dateRange.map((dateStr) => ({
        date: formatDateLabel(dateStr),
        accepted: groupedData[dateStr] ? groupedData[dateStr].accepted : 0,
        rejected: groupedData[dateStr] ? groupedData[dateStr].rejected : 0,
        totalYield: groupedData[dateStr] ? groupedData[dateStr].totalYield : 0,
      }));
    },
    [rawHarvestTable]
  );

  return {
    harvestHistory,
    loading,
    getCurrentDayData,
    getOverallTotalData,
    getCurrentMonthData,
    getMonthData,
    filterHarvestData,
  };
};

export default useHarvestHistory;
