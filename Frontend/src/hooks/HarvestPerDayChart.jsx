// hooks.js
import { useState, useEffect } from "react";
import axios from "axios";

// Helper functions to filter the harvest data by date.
const filterLast7Days = (harvestTable) => {
  const today = new Date();
  const pastDate = new Date();
  pastDate.setDate(today.getDate() - 6);
  
  return harvestTable.filter(item => {
    const itemDate = new Date(item.harvest_date);
    return itemDate >= pastDate && itemDate <= today;
  });
};

const filterLast31Days = (harvestTable) => {
  const today = new Date();
  const pastDate = new Date();
  pastDate.setDate(today.getDate() - 30);
  
  return harvestTable.filter(item => {
    const itemDate = new Date(item.harvest_date);
    return itemDate >= pastDate && itemDate <= today;
  });
};

// Overall hooks
export const useAcceptedOverall = () => {
  const [overallAccepted, setOverallAccepted] = useState(0);
  const [overallAcceptedLoading, setOverallAcceptedLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/harvests");
        const harvestTable = response.data.harvestTable || [];
        const totalAccepted = harvestTable.reduce((sum, item) => sum + item.accepted, 0);
        setOverallAccepted(totalAccepted);
      } catch (error) {
        console.error("Error fetching accepted items:", error);
        setOverallAccepted(0);
      } finally {
        setOverallAcceptedLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return { overallAccepted, overallAcceptedLoading };
};

export const useRejectedOverall = () => {
  const [overallRejected, setOverallRejected] = useState(0);
  const [overallRejectedLoading, setOverallRejectedLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/harvests");
        const harvestTable = response.data.harvestTable || [];
        const totalRejected = harvestTable.reduce((sum, item) => sum + item.total_rejected, 0);
        setOverallRejected(totalRejected);
      } catch (error) {
        console.error("Error fetching rejected items:", error);
        setOverallRejected(0);
      } finally {
        setOverallRejectedLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return { overallRejected, overallRejectedLoading };
};

export const useTotalOverallYield = () => {
  const [overallTotalYield, setOverallTotalYield] = useState(0);
  const [overallTotalYieldLoading, setOverallTotalYieldLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/harvests");
        const harvestTable = response.data.harvestTable || [];
        const yieldTotal = harvestTable.reduce((sum, item) => sum + item.total_yield, 0);
        setOverallTotalYield(yieldTotal);
      } catch (error) {
        console.error("Error fetching total yield:", error);
        setOverallTotalYield(0);
      } finally {
        setOverallTotalYieldLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return { overallTotalYield, overallTotalYieldLoading };
};

// Last 7 Days hooks
export const useAcceptedLast7Days = () => {
  const [acceptedLast7Days, setAcceptedLast7Days] = useState(0);
  const [acceptedLast7DaysLoading, setAcceptedLast7DaysLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/harvests");
        const harvestTable = response.data.harvestTable || [];
        const filtered = filterLast7Days(harvestTable);
        const totalAccepted = filtered.reduce((sum, item) => sum + item.accepted, 0);
        setAcceptedLast7Days(totalAccepted);
      } catch (error) {
        console.error("Error fetching accepted items (last 7 days):", error);
        setAcceptedLast7Days(0);
      } finally {
        setAcceptedLast7DaysLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return { acceptedLast7Days, acceptedLast7DaysLoading };
};

export const useRejectedLast7Days = () => {
  const [rejectedLast7Days, setRejectedLast7Days] = useState(0);
  const [rejectedLast7DaysLoading, setRejectedLast7DaysLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/harvests");
        const harvestTable = response.data.harvestTable || [];
        const filtered = filterLast7Days(harvestTable);
        const totalRejected = filtered.reduce((sum, item) => sum + item.total_rejected, 0);
        setRejectedLast7Days(totalRejected);
      } catch (error) {
        console.error("Error fetching rejected items (last 7 days):", error);
        setRejectedLast7Days(0);
      } finally {
        setRejectedLast7DaysLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return { rejectedLast7Days, rejectedLast7DaysLoading };
};

export const useTotalYieldLast7Days = () => {
  const [totalYieldLast7Days, setTotalYieldLast7Days] = useState(0);
  const [totalYieldLast7DaysLoading, setTotalYieldLast7DaysLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/harvests");
        const harvestTable = response.data.harvestTable || [];
        const filtered = filterLast7Days(harvestTable);
        const yieldTotal = filtered.reduce((sum, item) => sum + item.total_yield, 0);
        setTotalYieldLast7Days(yieldTotal);
      } catch (error) {
        console.error("Error fetching total yield (last 7 days):", error);
        setTotalYieldLast7Days(0);
      } finally {
        setTotalYieldLast7DaysLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return { totalYieldLast7Days, totalYieldLast7DaysLoading };
};

// Last 31 Days hooks
export const useAcceptedLast31Days = () => {
  const [acceptedLast31Days, setAcceptedLast31Days] = useState(0);
  const [acceptedLast31DaysLoading, setAcceptedLast31DaysLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/harvests");
        const harvestTable = response.data.harvestTable || [];
        const filtered = filterLast31Days(harvestTable);
        const totalAccepted = filtered.reduce((sum, item) => sum + item.accepted, 0);
        setAcceptedLast31Days(totalAccepted);
      } catch (error) {
        console.error("Error fetching accepted items (last 31 days):", error);
        setAcceptedLast31Days(0);
      } finally {
        setAcceptedLast31DaysLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return { acceptedLast31Days, acceptedLast31DaysLoading };
};

export const useRejectedLast31Days = () => {
  const [rejectedLast31Days, setRejectedLast31Days] = useState(0);
  const [rejectedLast31DaysLoading, setRejectedLast31DaysLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/harvests");
        const harvestTable = response.data.harvestTable || [];
        const filtered = filterLast31Days(harvestTable);
        const totalRejected = filtered.reduce((sum, item) => sum + item.total_rejected, 0);
        setRejectedLast31Days(totalRejected);
      } catch (error) {
        console.error("Error fetching rejected items (last 31 days):", error);
        setRejectedLast31Days(0);
      } finally {
        setRejectedLast31DaysLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return { rejectedLast31Days, rejectedLast31DaysLoading };
};

export const useTotalYieldLast31Days = () => {
  const [totalYieldLast31Days, setTotalYieldLast31Days] = useState(0);
  const [totalYieldLast31DaysLoading, setTotalYieldLast31DaysLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/harvests");
        const harvestTable = response.data.harvestTable || [];
        const filtered = filterLast31Days(harvestTable);
        const yieldTotal = filtered.reduce((sum, item) => sum + item.total_yield, 0);
        setTotalYieldLast31Days(yieldTotal);
      } catch (error) {
        console.error("Error fetching total yield (last 31 days):", error);
        setTotalYieldLast31Days(0);
      } finally {
        setTotalYieldLast31DaysLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return { totalYieldLast31Days, totalYieldLast31DaysLoading };
};

// Functions for Today's Metrics
const getTodayAccepted = (harvestTable) => {
  const today = new Date();
  return harvestTable
    .filter(item => {
      const date = new Date(item.harvest_date);
      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    })
    .reduce((sum, item) => sum + item.accepted, 0);
};

const getTodayRejected = (harvestTable) => {
  const today = new Date();
  return harvestTable
    .filter(item => {
      const date = new Date(item.harvest_date);
      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    })
    .reduce((sum, item) => sum + item.total_rejected, 0);
};

const getTodayTotalYield = (harvestTable) => {
  const today = new Date();
  return harvestTable
    .filter(item => {
      const date = new Date(item.harvest_date);
      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    })
    .reduce((sum, item) => sum + item.total_yield, 0);
};

// Today's Metrics Hooks
export const useAcceptedToday = () => {
  const [todayAccepted, setTodayAccepted] = useState(0);
  const [todayAcceptedLoading, setTodayAcceptedLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/harvests");
        const harvestTable = response.data.harvestTable || [];
        const total = getTodayAccepted(harvestTable);
        setTodayAccepted(total);
      } catch (error) {
        console.error("Error fetching today's accepted items:", error);
        setTodayAccepted(0);
      } finally {
        setTodayAcceptedLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return { todayAccepted, todayAcceptedLoading };
};

export const useRejectedToday = () => {
  const [todayRejected, setTodayRejected] = useState(0);
  const [todayRejectedLoading, setTodayRejectedLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/harvests");
        const harvestTable = response.data.harvestTable || [];
        const total = getTodayRejected(harvestTable);
        setTodayRejected(total);
      } catch (error) {
        console.error("Error fetching today's rejected items:", error);
        setTodayRejected(0);
      } finally {
        setTodayRejectedLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return { todayRejected, todayRejectedLoading };
};

export const useTotalYieldToday = () => {
  const [todayTotalYield, setTodayTotalYield] = useState(0);
  const [todayTotalYieldLoading, setTodayTotalYieldLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/harvests");
        const harvestTable = response.data.harvestTable || [];
        const total = getTodayTotalYield(harvestTable);
        setTodayTotalYield(total);
      } catch (error) {
        console.error("Error fetching today's total yield:", error);
        setTodayTotalYield(0);
      } finally {
        setTodayTotalYieldLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return { todayTotalYield, todayTotalYieldLoading };
};
