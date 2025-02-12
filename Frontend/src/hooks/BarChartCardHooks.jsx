import { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

// Utility function to get today's date in 'YYYY-MM-DD' format
const getTodayDateString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const useHarvestHistory = () => {
  const [harvestHistory, setHarvestHistory] = useState([]);

  useEffect(() => {
    const formatDateLabel = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/harvests');
        const harvestTable = response.data.harvestTable || [];

        // Get today's date in YYYY-MM-DD format
        const todayDate = getTodayDateString();

        // Group by date and sum values for the current day only
        const groupedData = harvestTable.reduce((acc, item) => {
          // Extract only the date part (YYYY-MM-DD) from harvest_date
          const date = new Date(item.harvest_date).toISOString().split('T')[0];
          
          // Only include data for today's date
          if (date === todayDate) {
            if (!acc[date]) {
              acc[date] = {
                accepted: 0,
                rejected: 0,
                totalYield: 0
              };
            }
            acc[date].accepted += item.accepted;
            acc[date].rejected += item.total_rejected;
            acc[date].totalYield += item.total_yield;
          }
          return acc;
        }, {});

        // Convert to array and format date labels
        const sortedData = Object.entries(groupedData)
          .map(([date, values]) => ({
            date: formatDateLabel(date),
            ...values
          }));

        setHarvestHistory(sortedData);
      } catch (error) {
        console.error('Error fetching harvest data:', error);
        setHarvestHistory([]);
      }
    };

    fetchData();
    socket.on('updateHarvests', fetchData);

    return () => {
      socket.off('updateHarvests');
    };
  }, []);

  return harvestHistory;
};

export default useHarvestHistory;
