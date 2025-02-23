import { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

// Helper to format a Date object as "YYYY-MM-DD"
const getDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to format a date string to a more readable label (e.g., "Feb 14")
const formatDateLabel = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const useHarvestHistory = () => {
  const [harvestHistory, setHarvestHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:3001/harvests');
        const harvestTable = response.data.harvestTable || [];
        
        // Build an array of date strings for the last 7 days (including today)
        const today = new Date();
        const dateRange = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          dateRange.push(getDateString(date));
        }

        // Group the harvest data by date string (YYYY-MM-DD)
        const groupedData = {};
        harvestTable.forEach(item => {
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

        // Ensure every day in the 7-day range is represented, even if no data exists
        const sortedData = dateRange.map(dateStr => ({
          date: formatDateLabel(dateStr),
          accepted: groupedData[dateStr] ? groupedData[dateStr].accepted : 0,
          rejected: groupedData[dateStr] ? groupedData[dateStr].rejected : 0,
          totalYield: groupedData[dateStr] ? groupedData[dateStr].totalYield : 0,
        }));

        setHarvestHistory(sortedData);
      } catch (error) {
        console.error('Error fetching harvest data:', error);
        setHarvestHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    socket.on('updateHarvests', fetchData);

    return () => {
      socket.off('updateHarvests', fetchData);
    };
  }, []);

  return { harvestHistory, loading };
};

export default useHarvestHistory;
