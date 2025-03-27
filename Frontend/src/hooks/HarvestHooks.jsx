import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { io } from "socket.io-client";

// Create a single socket connection instance
const socket = io("http://localhost:3001");

// Helper function to get today's date in 'YYYY-MM-DD' format 
const getTodayDateString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/*
  Generic hook to fetch harvest data once and share it among metric hooks.
  Uses a fallback fetch and listens for Socket.IO "harvestData" events for real-time updates.
*/
const useHarvests = () => {
  const [harvestTable, setHarvestTable] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:3001/harvests");
      setHarvestTable(response.data.harvestTable || []);
    } catch (error) {
      console.error("Error fetching harvest data:", error);
      setHarvestTable([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch in case socket update takes a moment.
    fetchData();

    // Listen for real-time updates
    socket.on("harvestData", (data) => {
      if (data && data.harvestTable) {
        setHarvestTable(data.harvestTable);
        setLoading(false);
      }
    });

    // Clean up the event listener on unmount
    return () => {
      socket.off("harvestData");
    };
  }, []);

  return { harvestTable, loading };
};

/*
  One-time fetch hooks that now share the same data from useHarvests.
*/

// Returns all harvest items.
export const useHarvestItems = () => {
  const { harvestTable, loading } = useHarvests();
  return { harvestItems: harvestTable, harvestLoading: loading };
};

// Returns the count of harvest items for today's date.
export const useTotalHarvestsToday = () => {
  const { harvestTable, loading } = useHarvests();
  const todayDate = getTodayDateString();
  const harvestsToday = harvestTable.filter(
    (harvest) => harvest.harvest_date === todayDate
  );
  return { harvestItemsToday: harvestsToday.length, isLoading: loading };
};

/*
  New Hook: useHarvestHistory
  Groups today's harvest data by date and aggregates accepted, rejected, and total yield values.
  Returns an array of grouped data (which your BarChart component expects).
*/
export const useHarvestHistory = () => {
  const { harvestTable } = useHarvests();

  return useMemo(() => {
    // Function to format the date for display (e.g. "Jan 1")
    const formatDateLabel = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const todayDate = getTodayDateString();

    // Group data by date for today's entries only
    const groupedData = harvestTable.reduce((acc, item) => {
      // Extract only the date part (YYYY-MM-DD) from harvest_date
      const date = new Date(item.harvest_date).toISOString().split('T')[0];
      
      // Only include data for today's date
      if (date === todayDate) {
        if (!acc[date]) {
          acc[date] = {
            accepted: 0,
            rejected: 0,
            totalYield: 0,
          };
        }
        acc[date].accepted += item.accepted;
        acc[date].rejected += item.total_rejected;
        acc[date].totalYield += item.total_yield;
      }
      return acc;
    }, {});

    // Convert grouped object to an array with formatted date labels
    return Object.entries(groupedData).map(([date, values]) => ({
      date: formatDateLabel(date),
      ...values,
    }));
  }, [harvestTable]);
};

/*
  Helper functions for filtering data by date (if needed for additional metrics)
*/
const filterByDateRange = (harvestTable, days) => {
  const today = new Date();
  const pastDate = new Date();
  pastDate.setDate(today.getDate() - (days - 1));
  return harvestTable.filter(item => {
    const itemDate = new Date(item.harvest_date);
    return itemDate >= pastDate && itemDate <= today;
  });
};

const filterToday = (harvestTable) => {
  const today = new Date();
  return harvestTable.filter(item => {
    const date = new Date(item.harvest_date);
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  });
};

// Utility to compute totals by key (accepted, total_rejected, total_yield)
const computeTotal = (data, key) =>
  data.reduce((sum, item) => sum + (item[key] || 0), 0);

/*
  Derived Metrics Hooks
*/

// Overall Metrics
export const useAcceptedOverall = () => {
  const { harvestTable, loading } = useHarvests();
  const overallAccepted = useMemo(
    () => computeTotal(harvestTable, "accepted"),
    [harvestTable]
  );
  return { overallAccepted, overallAcceptedLoading: loading };
};

export const useRejectedOverall = () => {
  const { harvestTable, loading } = useHarvests();
  const overallRejected = useMemo(
    () => computeTotal(harvestTable, "total_rejected"),
    [harvestTable]
  );
  return { overallRejected, overallRejectedLoading: loading };
};

export const useTotalOverallYield = () => {
  const { harvestTable, loading } = useHarvests();
  const overallTotalYield = useMemo(
    () => computeTotal(harvestTable, "total_yield"),
    [harvestTable]
  );
  return { overallTotalYield, overallTotalYieldLoading: loading };
};

// Last 7 Days Metrics
export const useAcceptedLast7Days = () => {
  const { harvestTable, loading } = useHarvests();
  const acceptedLast7Days = useMemo(() => {
    const filtered = filterByDateRange(harvestTable, 7);
    return computeTotal(filtered, "accepted");
  }, [harvestTable]);
  return { acceptedLast7Days, acceptedLast7DaysLoading: loading };
};

export const useRejectedLast7Days = () => {
  const { harvestTable, loading } = useHarvests();
  const rejectedLast7Days = useMemo(() => {
    const filtered = filterByDateRange(harvestTable, 7);
    return computeTotal(filtered, "total_rejected");
  }, [harvestTable]);
  return { rejectedLast7Days, rejectedLast7DaysLoading: loading };
};

export const useTotalYieldLast7Days = () => {
  const { harvestTable, loading } = useHarvests();
  const totalYieldLast7Days = useMemo(() => {
    const filtered = filterByDateRange(harvestTable, 7);
    return computeTotal(filtered, "total_yield");
  }, [harvestTable]);
  return { totalYieldLast7Days, totalYieldLast7DaysLoading: loading };
};

// Last 31 Days Metrics
export const useAcceptedLast31Days = () => {
  const { harvestTable, loading } = useHarvests();
  const acceptedLast31Days = useMemo(() => {
    const filtered = filterByDateRange(harvestTable, 31);
    return computeTotal(filtered, "accepted");
  }, [harvestTable]);
  return { acceptedLast31Days, acceptedLast31DaysLoading: loading };
};

export const useRejectedLast31Days = () => {
  const { harvestTable, loading } = useHarvests();
  const rejectedLast31Days = useMemo(() => {
    const filtered = filterByDateRange(harvestTable, 31);
    return computeTotal(filtered, "total_rejected");
  }, [harvestTable]);
  return { rejectedLast31Days, rejectedLast31DaysLoading: loading };
};

export const useTotalYieldLast31Days = () => {
  const { harvestTable, loading } = useHarvests();
  const totalYieldLast31Days = useMemo(() => {
    const filtered = filterByDateRange(harvestTable, 31);
    return computeTotal(filtered, "total_yield");
  }, [harvestTable]);
  return { totalYieldLast31Days, totalYieldLast31DaysLoading: loading };
};

// Today's Metrics
export const useAcceptedToday = () => {
  const { harvestTable, loading } = useHarvests();
  const todayAccepted = useMemo(() => {
    const filtered = filterToday(harvestTable);
    return computeTotal(filtered, "accepted");
  }, [harvestTable]);
  return { todayAccepted, todayAcceptedLoading: loading };
};

export const useRejectedToday = () => {
  const { harvestTable, loading } = useHarvests();
  const todayRejected = useMemo(() => {
    const filtered = filterToday(harvestTable);
    return computeTotal(filtered, "total_rejected");
  }, [harvestTable]);
  return { todayRejected, todayRejectedLoading: loading };
};

export const useTotalYieldToday = () => {
  const { harvestTable, loading } = useHarvests();
  const todayTotalYield = useMemo(() => {
    const filtered = filterToday(harvestTable);
    return computeTotal(filtered, "total_yield");
  }, [harvestTable]);
  return { todayTotalYield, todayTotalYieldLoading: loading };
};
