import axios from "axios";

const totalHarvests = async (req, res) => {
  try {
    const response = await axios.get('https://agreemo-api.onrender.com/harvests', {
      headers: {
        'x-api-key': process.env.API_KEY // Use backend environment variable
      }
    });

    // Assuming the external API returns an array of harvest itemss
    const harvestTable = response.data || [];
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