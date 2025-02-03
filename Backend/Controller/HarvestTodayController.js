import axios from "axios";

const totalHarvestsToday = async (req, res) => {
    try {
      const response = await axios.get('https://agreemo-api.onrender.com/harvests', {
        headers: {
          'x-api-key': process.env.API_KEY // Use backend environment variable
        }
      });
  
      // Assuming the external API returns an array of harvest items
      const harvestTable = response.data || [];
  
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split("T")[0];
  
      // Filter harvests by today's date
      const todaysHarvests = harvestTable.filter((harvest) => harvest.harvest_date === today);
  
      // Calculate the total (count) of today's harvests
      const totalHarvestsToday = todaysHarvests.length;
  
      res.json({ 
        totalHarvestsToday, 
        harvestTable: todaysHarvests // Send only today's harvests
      });
      
    } catch (error) {
      console.error("External API Error:", error.response?.data || error.message);
      res.status(error.response?.status || 500).json({
        error: error.response?.data?.error || 'Internal Server Error'
      });
    }
  };

  export default totalHarvestsToday;