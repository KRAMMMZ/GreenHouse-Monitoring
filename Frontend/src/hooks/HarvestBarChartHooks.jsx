import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { io } from "socket.io-client";

// Create a single socket connection instance
const socket = io("http://localhost:3001");

// Helper to format a Date object as "YYYY-MM-DD"
const getDateString = (date) => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    // console.warn("getDateString received an invalid date:", date); // Optional: for debugging
    return null;
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper to create a friendly label (e.g., "Feb 14")
function formatDateLabel(dateStr) {
  if (!dateStr || typeof dateStr !== 'string' || !dateStr.includes('-')) return dateStr; // Basic validation
  const [year, month, day] = dateStr.split('-');
  return new Date(+year, +month - 1, +day).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    // year: 'numeric', // Optional: include year in label if needed
  });
}

const useHarvestHistory = () => {
  const [harvestHistory, setHarvestHistory] = useState([]); // Stores last 7 days by default
  const [rawHarvestTable, setRawHarvestTable] = useState([]);
  const [loading, setLoading] = useState(true);

  // Function to process raw table data into grouped Last 7 Days data
  const processHarvestDataForLast7Days = useCallback((table) => {
    if (!table || table.length === 0) return [];
    const today = new Date();
    const dateRange = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = getDateString(date);
      if (dateStr) dateRange.push(dateStr);
    }

    const groupedData = {};
    table.forEach((item) => {
      if (!item.harvest_date) return;
      const itemDate = new Date(item.harvest_date);
      if (isNaN(itemDate.getTime())) return;
      const dateStr = getDateString(itemDate);

      if (dateStr && dateRange.includes(dateStr)) {
        if (!groupedData[dateStr]) {
          groupedData[dateStr] = { accepted: 0, rejected: 0, totalYield: 0 };
        }
        groupedData[dateStr].accepted += item.accepted || 0;
        groupedData[dateStr].rejected += item.total_rejected || 0;
        groupedData[dateStr].totalYield += item.total_yield || 0;
      }
    });
    return dateRange.map((dateStr) => ({
      date: formatDateLabel(dateStr),
      accepted: groupedData[dateStr] ? groupedData[dateStr].accepted : 0,
      rejected: groupedData[dateStr] ? groupedData[dateStr].rejected : 0,
      totalYield: groupedData[dateStr] ? groupedData[dateStr].totalYield : 0,
    }));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:3001/harvests");
        const table = response.data.harvestTable || [];
        setRawHarvestTable(table);
        const last7DaysData = processHarvestDataForLast7Days(table);
        setHarvestHistory(last7DaysData);
      } catch (error) {
        console.error("Error fetching harvest data:", error);
        setHarvestHistory([]);
        setRawHarvestTable([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    socket.on("harvestData", (data) => {
      if (data && data.harvestTable) {
        setRawHarvestTable(data.harvestTable);
        const last7DaysData = processHarvestDataForLast7Days(data.harvestTable);
        setHarvestHistory(last7DaysData);
        // Note: If other views are active, they won't auto-update unless
        // the component re-requests data (e.g., by changing activeFilter).
        // For a fully reactive system on all views, you'd need a more complex state management.
      }
    });

    return () => {
      socket.off("harvestData");
    };
  }, [processHarvestDataForLast7Days]);

  const getMonthData = useCallback(
    (month, year) => {
      if (!rawHarvestTable || rawHarvestTable.length === 0) return [];
      const firstDay = new Date(year, month - 1, 1);
      const lastDay = new Date(year, month, 0);
      const dateRange = [];
      for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
        const dateStr = getDateString(new Date(d));
        if (dateStr) dateRange.push(dateStr);
      }

      const groupedData = {};
      rawHarvestTable.forEach((item) => {
        if (!item.harvest_date) return;
        const itemDate = new Date(item.harvest_date);
        if (isNaN(itemDate.getTime())) return;
        const dateStr = getDateString(itemDate);

        if (dateStr && dateRange.includes(dateStr)) {
          if (!groupedData[dateStr]) {
            groupedData[dateStr] = { accepted: 0, rejected: 0, totalYield: 0 };
          }
          groupedData[dateStr].accepted += item.accepted || 0;
          groupedData[dateStr].rejected += item.total_rejected || 0;
          groupedData[dateStr].totalYield += item.total_yield || 0;
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

  const getCurrentDayData = useCallback(() => {
    if (!rawHarvestTable || rawHarvestTable.length === 0) return [];
    const today = new Date();
    const dateStr = getDateString(today);
    if (!dateStr) return [];

    const groupedData = { accepted: 0, rejected: 0, totalYield: 0 }; // Only one entry for today
    rawHarvestTable.forEach((item) => {
      if (!item.harvest_date) return;
      const itemDate = new Date(item.harvest_date);
      if (isNaN(itemDate.getTime())) return;
      const itemDateStr = getDateString(itemDate);

      if (itemDateStr === dateStr) {
        groupedData.accepted += item.accepted || 0;
        groupedData.rejected += item.total_rejected || 0;
        groupedData.totalYield += item.total_yield || 0;
      }
    });
    return [{
      date: formatDateLabel(dateStr), // The chart expects an array
      ...groupedData
    }];
  }, [rawHarvestTable]);

  const getOverallTotalData = useCallback(() => {
    if (!rawHarvestTable || rawHarvestTable.length === 0) return { accepted: 0, rejected: 0, totalYield: 0, date: "Overall" };
    const totals = rawHarvestTable.reduce(
      (acc, item) => {
        acc.accepted += item.accepted || 0;
        acc.rejected += item.total_rejected || 0;
        acc.totalYield += item.total_yield || 0;
        return acc;
      },
      { accepted: 0, rejected: 0, totalYield: 0, date: "Overall" } // 'date' for chart compatibility
    );
    return totals; // This will be wrapped in an array by the component if needed
  }, [rawHarvestTable]);

  const getCurrentMonthData = useCallback(() => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    return getMonthData(currentMonth, currentYear);
  }, [getMonthData]);

  const filterHarvestData = useCallback(
    (from, to) => {
      if (!rawHarvestTable || rawHarvestTable.length === 0) return [];
      const start = new Date(from);
      const end = new Date(to);

      if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return [];

      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      const dateRange = [];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = getDateString(new Date(d));
        if (dateStr) dateRange.push(dateStr);
      }

      const groupedData = {};
      rawHarvestTable.forEach((item) => {
        if (!item.harvest_date) return;
        const itemDate = new Date(item.harvest_date);
        if (isNaN(itemDate.getTime())) return;

        if (itemDate >= start && itemDate <= end) {
          const dateStr = getDateString(itemDate);
          if (dateStr) {
            if (!groupedData[dateStr]) {
              groupedData[dateStr] = { accepted: 0, rejected: 0, totalYield: 0 };
            }
            groupedData[dateStr].accepted += item.accepted || 0;
            groupedData[dateStr].rejected += item.total_rejected || 0;
            groupedData[dateStr].totalYield += item.total_yield || 0;
          }
        }
      });
      return dateRange.map((dateStr) => ({
        date: formatDateLabel(dateStr),
        accepted: groupedData[dateStr] ? groupedData[dateStr].accepted : 0,
        rejected: groupedData[dateStr] ? groupedData[dateStr].rejected : 0,
        totalYield: groupedData[dateStr] ? groupedData[dateStr].totalYield : 0,
      })).filter(d => d.accepted > 0 || d.rejected > 0 || d.totalYield > 0);
    },
    [rawHarvestTable]
  );

  const getYearlyData = useCallback(
    (year) => {
      if (!rawHarvestTable || rawHarvestTable.length === 0 || !year) return [];
      const targetYear = Number(year);
      if (isNaN(targetYear)) return [];

      const yearlyAggregatedData = {};
      const orderedMonthsForChart = [];

      for (let month = 0; month < 12; month++) {
        const monthKey = new Date(targetYear, month, 1).toLocaleString('en-US', { month: 'short' });
        orderedMonthsForChart.push(monthKey); // For ordered X-axis
        yearlyAggregatedData[monthKey] = {
          date: monthKey,
          accepted: 0,
          rejected: 0,
          totalYield: 0,
        };
      }

      rawHarvestTable.forEach((item) => {
        if (!item.harvest_date) return;
        const itemDate = new Date(item.harvest_date);
        if (isNaN(itemDate.getTime()) || itemDate.getFullYear() !== targetYear) {
          return;
        }
        const monthKey = itemDate.toLocaleString('en-US', { month: 'short' });
        if (yearlyAggregatedData[monthKey]) { // Ensure monthKey is valid
            yearlyAggregatedData[monthKey].accepted += item.accepted || 0;
            yearlyAggregatedData[monthKey].rejected += item.total_rejected || 0;
            yearlyAggregatedData[monthKey].totalYield += item.total_yield || 0;
        }
      });

      return orderedMonthsForChart.map(monthKey => yearlyAggregatedData[monthKey]);
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
    getYearlyData,
  };
};

export default useHarvestHistory;