import axios from 'axios';

const AdminLogs = async (req,res ) => {

    try{

   
     
    const response = await axios.get('https://agreemo-api.onrender.com/activity_logs/admin', {
        headers: {
          'x-api-key': process.env.API_KEY, // Ensure the API key is correctly set in your environment variables
        },
      });
      const AdminLogsTable = response.data || [];
   
      res.json({ 
        
        AdminLogsTable 
      });
      
    } catch (error) {
      console.error("External API Error:", error.response?.data || error.message);
      res.status(error.response?.status || 500).json({
        error: error.response?.data?.error || 'Internal Server Error'
      });
    }
}

export default AdminLogs;