// controllers/rejectionController.js
import axios from "axios";

const totalRejectionsPerDay = async (req, res) => {
  try {
    const response = await axios.get('https://agreemo-api.onrender.com/reason_for_rejection', {
      headers: {
        'x-api-key': process.env.API_KEY, // Ensure the API key is correctly set in your environment variables
      },
    });

    const rejectionData = response.data || [];

    // Get local date string
    const getLocalDateString = () => {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const today = getLocalDateString(); // Use local date

    // Aggregate data for all days
    const rejectionCountsPerDay = rejectionData.reduce((acc, item) => {
      const date = item.rejection_date;
      if (!acc[date]) {
        acc[date] = { diseased: 0, physically_damaged: 0, too_small: 0 };
      }
      acc[date].diseased += item.diseased;
      acc[date].physically_damaged += item.physically_damaged;
      acc[date].too_small += item.too_small;
      return acc;
    }, {});

    res.json({
      rejectionData,
      rejectionCountsPerDay,
      todayRejectionData: rejectionCountsPerDay[today] || { diseased: 0, physically_damaged: 0, too_small: 0 }
    });
  } catch (error) {
    console.error('External API Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || 'Internal Server Error'
    });
  }
};

export default totalRejectionsPerDay;
