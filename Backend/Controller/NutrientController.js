import axios from 'axios';

const NutrientController = async (req,res ) => {

    try{

   
     
    const response = await axios.get('https://agreemo-api-v2.onrender.com/nutrient_controllers', {
        headers: {
          'x-api-key': process.env.API_KEY, // Ensure the API key is correctly set isn your environment variables
        },
      });
      const nutrientControllerTable  = response.data || [];
    
      res.json({ 
        
        nutrientControllerTable,
     
      });
      
    } catch (error) {
      console.error("External API Error:", error.response?.data || error.message);
      res.status(error.response?.status || 500).json({
        error: error.response?.data?.error || 'Internal Server Error'
      });
    }
}

export default NutrientController;