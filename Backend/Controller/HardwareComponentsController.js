import axios from 'axios';

const HardwareComponents = async (req,res ) => {

    try{

   
     
    const response = await axios.get('https://agreemo-api-v2.onrender.com/hardware_components', {
        headers: {
          'x-api-key': process.env.API_KEY, // Ensure the API key is correctly set isn your environment variables
        },
      });
      const hardwareComponentsTable = response.data || [];
    
      res.json({ 
        
        hardwareComponentsTable,
     
      });
      
    } catch (error) {
      console.error("External API Error:", error.response?.data || error.message);
      res.status(error.response?.status || 500).json({
        error: error.response?.data?.error || 'Internal Server Error'
      });
    }
}

export default HardwareComponents;