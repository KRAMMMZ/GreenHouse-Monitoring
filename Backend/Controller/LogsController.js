import axios from 'axios';

export const AdminLogs = async (req,res ) => {

    try{

   
     
    const response = await axios.get('https://agreemo-api.onrender.com/activity_logs/admin', {
        headers: {
          'x-api-key': process.env.API_KEY, // Ensure the API key is correctly set in your environment varsiables
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


export const UserLogs = async (req,res) => {
    try{

      const response = await axios.get('https://agreemo-api.onrender.com/activity_logs/user', {
        headers: {
          'x-api-key': process.env.API_KEY, // Ensure the API key is correctly set in your environment varsiables
        },
      });
      const UserLogsTable = response.data || [];
   
      res.json({ 
        
        UserLogsTable 
      });
      
    } catch (error) {
      console.error("External API Error:", error.response?.data || error.message);
      res.status(error.response?.status || 500).json({
        error: error.response?.data?.error || 'Internal Server Error'
      });
    }
}


export const RejectionLogs = async (req,res) => {
  try{

    const response = await axios.get('https://agreemo-api.onrender.com/activity_logs/rejection', {
      headers: {
        'x-api-key': process.env.API_KEY, // Ensure the API key is correctly set in your environment varsiables
      },
    });
    const RejectionTable = response.data || [];
 
    res.json({ 
      
      RejectionTable 
    });
    
  } catch (error) {
    console.error("External API Error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || 'Internal Server Error'
    });
  }
}

export const MaintenanceLogs = async (req,res) => {
  try{

    const response = await axios.get('https://agreemo-api.onrender.com/activity_logs/maintenance', {
      headers: {
        'x-api-key': process.env.API_KEY, // Ensure the API key is correctly set in your environment varsiables
      },
    });
    const MaintenanceTable = response.data || [];
 
    res.json({ 
      
      MaintenanceTable 
    });
    
  } catch (error) {
    console.error("External API Error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || 'Internal Server Error'
    });
  }
}


