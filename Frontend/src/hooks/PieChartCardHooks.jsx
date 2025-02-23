import { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Tooltip, Cell } from 'recharts';

// Utility function to get today's date in 'YYYY-MM-DD' format
const getTodayDateString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const RejectedPieChart = () => {
  const [rejectToday, setChartData] = useState([]);

  useEffect(() => {
    const fetchRejectedData = async () => {
      try {
        // Adjust the endpoint URL as needed; here we're assuming your backend route is available at this URL.
        const response = await axios.get('http://localhost:3001/reason_for_rejection');
        // The response should return an object like { rejectedTable, totalReject }.
        const rejectedTable = response.data.rejectedTable || [];

        // Get today's date (YYYY-MM-DD)
        const todayDate = getTodayDateString();

        // Filter data to include only entries from today
        const todayData = rejectedTable.filter(
          (item) => item.rejection_date === todayDate
        );

        // Sum the values for each category
        let diseased = 0;
        let physically_damaged = 0;
        let too_small = 0;

        todayData.forEach((item) => {
          diseased += item.diseased;
          physically_damaged += item.physically_damaged;
          too_small += item.too_small;
        });

        // Format the data for the PieChart
        const dataForChart = [
          { name: 'Diseased', value: diseased },
          { name: 'Physically Damaged', value: physically_damaged },
          { name: 'Too Small', value: too_small },
        ];

        setChartData(dataForChart);
      } catch (error) {
        console.error("Error fetching rejected data:", error.response?.data || error.message);
      }
    };

    fetchRejectedData();
  }, []);

  return  rejectToday;

}


  export default RejectedPieChart;