import axios from "axios";

const totalHarvests = async (req, res) => {
  try {
    const response = await axios.get('https://agreemo-api-v2.onrender.com/harvests', {
      headers: {
        'x-api-key': process.env.API_KEY // Use backend environment variable
      }
    });

    // Extract the harvests array from the response data
    const harvestTable = response.data.harvests || [];
    const totalHarvests = harvestTable.length;

    res.json({ 
      totalHarvests, 
      harvestTable 
    });
    
  } catch (error) {
    console.error("External API Error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || 'Internal Server Error'
    });
  }
};

export default totalHarvests;
