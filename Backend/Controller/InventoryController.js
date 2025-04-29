import axios from 'axios';

export const InventoryItem = async (req, res) => {

    try{

    const response = await axios.get('https://agreemo-api-v2.onrender.com/inventory', {
        headers: {
          'x-api-key': process.env.API_KEY,  
        },
      });
      const itemInventoryTable  = response.data.inventory_records || [];
    
      res.json({ 
        
        itemInventoryTable,
     
      });
      
    } catch (error) {
      console.error("External API Error:", error.response?.data || error.message);
      res.status(error.response?.status || 500).json({
        error: error.response?.data?.error || 'Internal Server Error'
      });
    }
}

export const InventoryContainer = async (req, res) => {

    try{

    const response = await axios.get('https://agreemo-api-v2.onrender.com/inventory_container', {
        headers: {
          'x-api-key': process.env.API_KEY,  
        },
      });
      const containerInventoryTable  = response.data.inventory_containers || [];
    
      res.json({ 
        
        containerInventoryTable,
     
      });
      
    } catch (error) {
      console.error("External API Error:", error.response?.data || error.message);
      res.status(error.response?.status || 500).json({
        error: error.response?.data?.error || 'Internal Server Error'
      });
    }
}

 