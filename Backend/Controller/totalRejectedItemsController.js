import axios from "axios";
import dotenv from "dotenv";

dotenv.config(); // Ensure .env is loaded

const totalRejecteditems = async (req, res) => {
    try {
        const response = await axios.get('https://agreemo-api-v2.onrender.com/reason_for_rejection', {
            headers: {
                'x-api-key': process.env.API_KEY // Use backend environment variable
            }
        });

        const rejectedTable = response.data.reasons_for_rejection || [];
        const totalReject = rejectedTable.length;
        res.json({ rejectedTable, totalReject });

      
        
    } catch (error) {
        console.error("External API Error:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            error: error.response?.data?.error || 'Internal Server Error'
        });
    }
};

export default totalRejecteditems;

  

  