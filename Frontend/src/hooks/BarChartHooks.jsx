// hooks/harvestHooks.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

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
        
        // Group by date and sum values
        const groupedData = harvestTable.reduce((acc, item) => {
          const date = item.harvest_date;
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
          return acc;
        }, {});

        // Convert to array and sort by date
        const sortedData = Object.entries(groupedData)
          .map(([date, values]) => ({
            date: formatDateLabel(date),
            ...values
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date));

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