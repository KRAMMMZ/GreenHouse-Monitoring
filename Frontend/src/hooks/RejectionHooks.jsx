import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { io } from "socket.io-client";

// Create a single socket connection instance
const socket = io("http://localhost:3001");

// Utility: Get today's date string in YYYY-MM-DD format
const getTodayDateString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Single hook to fetch rejection reasons from the endpoint with socket updates
const useRejectionReasons = () => {
  const [rejectedTable, setRejectedTable] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:3001/reason_for_rejection");
      setRejectedTable(response.data.rejectedTable || []);
    } catch (error) {
      console.error("Error fetching rejection reasons:", error);
      setRejectedTable([]);
    } finally {
      setLoading(false);
    } 
  };

  useEffect(() => {
    fetchData();
    // Listen for real-time updates using Socket.IO on event "RejectData"
    socket.on("RejectData", (data) => {
      if (data && data.rejectedTable) {
        setRejectedTable(data.rejectedTable);
        setLoading(false);
      }
    });

    // Clean up the event listener on unmount
    return () => {
      socket.off("RejectData");
    };
  }, []);

  return { rejectedTable, loading, fetchReject: fetchData  };
};

// Legacy hook: returns rejection table items and loading state
export const useRejectedTableItems = () => {
  const { rejectedTable, loading, fetchReject } = useRejectionReasons();
  return { rejectItems: rejectedTable, rejectLoading: loading, fetchRejectItems: fetchReject };
};

// Legacy hook: returns the total number of rejections for today
export const useTotalRejectToday = () => {
  const { rejectedTable, loading } = useRejectionReasons();
  const totalRejects = useMemo(() => {
    const todayDate = getTodayDateString();
    return rejectedTable.filter((item) => {
      // Using direct string comparison as in your original code
      return item.rejection_date === todayDate;
    }).length;
  }, [rejectedTable]);
  return { totalRejects, loading };
};

// Updated hook: returns data formatted for a PieChart
export const RejectedPieChart = () => {
  const { rejectedTable } = useRejectionReasons();

  const pieChartData = useMemo(() => {
    const todayDate = getTodayDateString();
    // Filter data to include only entries from today using direct string comparison
    const todayData = rejectedTable.filter(
      (item) => item.rejection_date === todayDate
    );

    // Sum the values for each category
    const diseased = todayData.reduce((sum, item) => sum + (item.diseased || 0), 0);
    const physically_damaged = todayData.reduce((sum, item) => sum + (item.physically_damaged || 0), 0);
    const too_small = todayData.reduce((sum, item) => sum + (item.too_small || 0), 0);

    // Format the data for the PieChart
    return [
      { name: 'Diseased', value: diseased },
      { name: 'Physically Damaged', value: physically_damaged },
      { name: 'Too Small', value: too_small },
    ];
  }, [rejectedTable]);

  // Return the data directly as your original hook did
  return pieChartData;
};

/* --- Additional helper hooks for metrics --- */

// Helper: Filter data within a date range (last N days, inclusive)
const filterByDateRange = (data, days) => {
  const today = new Date();
  const pastDate = new Date();
  pastDate.setDate(today.getDate() - (days - 1));
  return data.filter((item) => {
    const itemDate = new Date(item.rejection_date);
    return itemDate >= pastDate && itemDate <= today;
  });
};

// Helper: Filter items from the current day
const filterCurrentDay = (data) => {
  const today = new Date();
  return data.filter((item) => {
    const itemDate = new Date(item.rejection_date);
    return (
      itemDate.getDate() === today.getDate() &&
      itemDate.getMonth() === today.getMonth() &&
      itemDate.getFullYear() === today.getFullYear()
    );
  });
};

// Helper: Sum a specific field in an array of data
const computeTotal = (data, key) =>
  data.reduce((sum, item) => sum + (item[key] || 0), 0);

/* Overall Metrics Hooks */
export const useDiseasedOverall = () => {
  const { rejectedTable, loading } = useRejectionReasons();
  const overallDiseased = useMemo(() => computeTotal(rejectedTable, "diseased"), [rejectedTable]);
  return { overallDiseased, overallDiseasedLoading: loading };
};

export const usePhysicallyDamageOverall = () => {
  const { rejectedTable, loading } = useRejectionReasons();
  const overallPhysicallyDamage = useMemo(
    () => computeTotal(rejectedTable, "physically_damaged"),
    [rejectedTable]
  );
  return { overallPhysicallyDamage, overallPhysicallyDamageLoading: loading };
};

export const useTooSmallOverall = () => {
  const { rejectedTable, loading } = useRejectionReasons();
  const overallTooSmall = useMemo(() => computeTotal(rejectedTable, "too_small"), [rejectedTable]);
  return { overallTooSmall, overallTooSmallLoading: loading };
};

/* Last 7 Days Metrics Hooks */
export const useDiseasedLast7Days = () => {
  const { rejectedTable, loading } = useRejectionReasons();
  const diseasedLast7Days = useMemo(() => {
    const filtered = filterByDateRange(rejectedTable, 7);
    return computeTotal(filtered, "diseased");
  }, [rejectedTable]);
  return { diseasedLast7Days, diseasedLast7DaysLoading: loading };
};

export const usePhysicallyDamageLast7Days = () => {
  const { rejectedTable, loading } = useRejectionReasons();
  const physicallyDamageLast7Days = useMemo(() => {
    const filtered = filterByDateRange(rejectedTable, 7);
    return computeTotal(filtered, "physically_damaged");
  }, [rejectedTable]);
  return { physicallyDamageLast7Days, physicallyDamageLast7DaysLoading: loading };
};

export const useTooSmallLast7Days = () => {
  const { rejectedTable, loading } = useRejectionReasons();
  const tooSmallLast7Days = useMemo(() => {
    const filtered = filterByDateRange(rejectedTable, 7);
    return computeTotal(filtered, "too_small");
  }, [rejectedTable]);
  return { tooSmallLast7Days, tooSmallLast7DaysLoading: loading };
};

/* Last 31 Days Metrics Hooks */
export const useDiseasedLast31Days = () => {
  const { rejectedTable, loading } = useRejectionReasons();
  const diseasedLast31Days = useMemo(() => {
    const filtered = filterByDateRange(rejectedTable, 31);
    return computeTotal(filtered, "diseased");
  }, [rejectedTable]);
  return { diseasedLast31Days, diseasedLast31DaysLoading: loading };
};

export const usePhysicallyDamageLast31Days = () => {
  const { rejectedTable, loading } = useRejectionReasons();
  const physicallyDamageLast31Days = useMemo(() => {
    const filtered = filterByDateRange(rejectedTable, 31);
    return computeTotal(filtered, "physically_damaged");
  }, [rejectedTable]);
  return { physicallyDamageLast31Days, physicallyDamageLast31DaysLoading: loading };
};

export const useTooSmallLast31Days = () => {
  const { rejectedTable, loading } = useRejectionReasons();
  const tooSmallLast31Days = useMemo(() => {
    const filtered = filterByDateRange(rejectedTable, 31);
    return computeTotal(filtered, "too_small");
  }, [rejectedTable]);
  return { tooSmallLast31Days, tooSmallLast31DaysLoading: loading };
};

/* Current Day Metrics Hooks */
export const useDiseasedCurrentDay = () => {
  const { rejectedTable, loading } = useRejectionReasons();
  const diseasedCurrentDay = useMemo(() => {
    const filtered = filterCurrentDay(rejectedTable);
    return computeTotal(filtered, "diseased");
  }, [rejectedTable]);
  return { diseasedCurrentDay, diseasedCurrentDayLoading: loading };
};

export const usePhysicallyDamageCurrentDay = () => {
  const { rejectedTable, loading } = useRejectionReasons();
  const physicallyDamageCurrentDay = useMemo(() => {
    const filtered = filterCurrentDay(rejectedTable);
    return computeTotal(filtered, "physically_damaged");
  }, [rejectedTable]);
  return { physicallyDamageCurrentDay, physicallyDamageCurrentDayLoading: loading };
};

export const useTooSmallCurrentDay = () => {
  const { rejectedTable, loading } = useRejectionReasons();
  const tooSmallCurrentDay = useMemo(() => {
    const filtered = filterCurrentDay(rejectedTable);
    return computeTotal(filtered, "too_small");
  }, [rejectedTable]);
  return { tooSmallCurrentDay, tooSmallCurrentDayLoading: loading };
};
