import axios from "axios";

const totalRejectToday = async (req, res) => {
    try {
        const response = await axios.get('https://agreemo-api.onrender.com/reason_for_rejection', {
            headers: { 'x-api-key': process.env.API_KEY }
        });

          // Assuming the external API returns an array of harvest itemss
      const rejectedTable = response.data || [];
  
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split("T")[0];
  
      // Filter harvests by today's date
   
  
      
        // Filter the data to include only today's rejection records
        const todaysRejects = rejectedTable.filter(item => item.rejection_date === today);

        const totalRejectToday = todaysRejects.length;
  
        // Return the total count of today's rejects
             res.json({ 
            totalRejectToday,   
            rejectedTable: todaysRejects // Optionally, return the rejection records for today
        });

    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            error: error.response?.data?.error || 'Internal Server Error'
        });
    }
};

export default totalRejectToday;
