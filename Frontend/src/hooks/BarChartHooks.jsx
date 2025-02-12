import { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

const useHarvestHistory = () => {
  const [harvestHistory, setHarvestHistory] = useState([]);
  const [loading, setLoading] = useState(true); // Added loading state

  useEffect(() => {
    const formatDateLabel = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const fetchData = async () => {
      setLoading(true); // Set loading to true before fetching
      try {
        const response = await axios.get('http://localhost:3001/harvests');
        const harvestTable = response.data.harvestTable || [];
        
        const currentDate = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(currentDate.getDate() - 7);

        const groupedData = harvestTable.reduce((acc, item) => {
          const date = new Date(item.harvest_date);
          if (date >= sevenDaysAgo) {
            const formattedDate = date.toISOString().split('T')[0];
            if (!acc[formattedDate]) {
              acc[formattedDate] = { accepted: 0, rejected: 0, totalYield: 0 };
            }
            acc[formattedDate].accepted += item.accepted;
            acc[formattedDate].rejected += item.total_rejected;
            acc[formattedDate].totalYield += item.total_yield;
          }
          return acc;
        }, {});

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
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchData();
    socket.on('updateHarvests', fetchData);

    return () => {
      socket.off('updateHarvests');
    };
  }, []);

  return { harvestHistory, loading }; // Return loading state
};

export default useHarvestHistory;
