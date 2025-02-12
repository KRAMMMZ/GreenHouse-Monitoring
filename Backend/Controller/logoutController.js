import axios from "axios";
import qs from "qs";

const logout = async (req, res) => {

    const { email} = req.body;

    
    const data = qs.stringify({
        'email': email,
         
    });

    const config = {
        method: 'post',
        url: "https://agreemo-api.onrender.com/admin/logout",
        headers: {
          "x-api-key": process.env.API_KEY || 'fallback_key', 
        },
        data: data,
    }

    try {
        const response = await axios(config);
        if (response.data.success) {
            res.json({
                success: true,
                message: response.data.success.message,
                user_data: response.data.success.user_data
            });
        } else {
            res.status(400).json({ success: false, message: "INVALID CREDENTIALS" });
        }
    } catch (error) {
        console.error('Error during authentication:', error.response ? error.response.data : error.message);
        const status = error.response?.status || 500;
        let message = "INVALID CREDENTIALS";

        if (!error.response || !error.response.data) {
            message = "An error occurred, please try again.";
        }
        
        res.status(status).json({ success: false, message });
    }
}


export default logout;