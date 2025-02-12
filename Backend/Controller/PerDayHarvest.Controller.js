// controllers/harvestController.js
import axios from 'axios';

// controllers/harvestController.js
const totalHarvestsPerDay = async (req, res) => {
  try {
    const response = await axios.get('https://agreemo-api.onrender.com/harvests', {
      headers: {
        'x-api-key': process.env.API_KEY
      }
    });

    const harvestTable = response.data || [];
    
    // Get local date string
    const getLocalDateString = () => {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const today = getLocalDateString(); // Use local dates
    // Aggregate data for all days
    const harvestDataPerDay = harvestTable.reduce((acc, item) => {
      const date = item.harvest_date;
      if (!acc[date]) {
        acc[date] = { accepted: 0, total_rejected: 0, total_yield: 0 };
      }
      acc[date].accepted += item.accepted;
      acc[date].total_rejected += item.total_rejected;
      acc[date].total_yield += item.total_yield;
      return acc;
    }, {});

    res.json({
      harvestTable,
      harvestDataPerDay,
      todayHarvestData: harvestDataPerDay[today] || { accepted: 0, total_rejected: 0, total_yield: 0 }
    });
  } catch (error) {
    console.error('External API Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || 'Internal Server Error'
    });
  }
};

export default totalHarvestsPerDay;