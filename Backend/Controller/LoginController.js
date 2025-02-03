import axios from "axios";
import qs from "qs";

const login = async (req, res) => {
    const { email, password } = req.body;

    const data = qs.stringify({
        'email': email,
        'password': password
    });

    const config = {
        method: 'post',
        url: "https://agreemo-api.onrender.com/admin/login",
        headers: {
          "x-api-key": process.env.API_KEY || 'fallback_key', // Add fallback
        },
        data: data,
    };

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
};

export default login;
