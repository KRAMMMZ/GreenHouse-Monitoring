import { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

// Helper function to get today's date in YYYY-MM-DD format (local time)s
const getTodayDateString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const useAcceptedPerDay = () => {
  const [accepted, setAccepted] = useState(0);
  const [acceptedLoading, setAcceptedLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/harvests");
        const harvestTable = response.data.harvestTable || [];
        const today = getTodayDateString();
        
        const todaysData = harvestTable.filter(item => item.harvest_date === today);
        const totalAccepted = todaysData.reduce((sum, item) => sum + item.accepted, 0);
        
        setAccepted(totalAccepted);
      } catch (error) {
        console.error("Error fetching accepted items:", error);
        setAccepted(0);
      } finally {
        setAcceptedLoading(false);
      }
    };

    fetchData();
    socket.on("updateHarvests", fetchData);

    return () => {
      socket.off("updateHarvests");
    };
  }, []);

  return {accepted, acceptedLoading };
};

const useRejectedItemsPerDay = () => {
  const [rejected, setRejected] = useState(0);
  const [rejectedLoading, setRejectedLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/harvests");
        const harvestTable = response.data.harvestTable || [];
        const today = getTodayDateString();
        
        const todaysData = harvestTable.filter(item => item.harvest_date === today);
        const totalRejected = todaysData.reduce((sum, item) => sum + item.total_rejected, 0);
        
        setRejected(totalRejected);
      } catch (error) {
        console.error("Error fetching rejected items:", error);
        setRejected(0);
      }finally {
        setRejectedLoading(false);
      }
    };

    fetchData();
    socket.on("updateHarvests", fetchData);

    return () => {
      socket.off("updateHarvests");
    };
  }, []);

  return { rejected, rejectedLoading};
};

const useTotalYield = () => {
  const [totalYield, setTotalYield] = useState(0);
  const [totalYieldLoading, setTotalYieldLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/harvests");
        const harvestTable = response.data.harvestTable || [];
        const today = getTodayDateString();
        
        const todaysData = harvestTable.filter(item => item.harvest_date === today);
        const yieldTotal = todaysData.reduce((sum, item) => sum + item.total_yield, 0);
        
        setTotalYield(yieldTotal);
      } catch (error) {
        console.error("Error fetching total yield:", error);
        setTotalYield(0);
      } finally {
        setTotalYieldLoading(false);
      }
    };

    fetchData();
    socket.on("updateHarvests", fetchData);

    return () => {
      socket.off("updateHarvests");
    };
  }, []);

  return {totalYield, totalYieldLoading};
};

export { useAcceptedPerDay, useRejectedItemsPerDay, useTotalYield };