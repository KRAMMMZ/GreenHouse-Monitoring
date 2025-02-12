import axios from "axios";
import qs from "qs";

const ForgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required." });
        }

        const apiKey = process.env.API_KEY || 'fallback_key';
        if (!apiKey || apiKey === 'fallback_key') {
            console.error("Warning: API Key is missing or using fallback.");
        }

        const data = qs.stringify({ email });

        const config = {
            method: "post",
            url: "https://agreemo-api.onrender.com/admin",
            headers: {
                "x-api-key": apiKey,
            },
            data,
        };

        const response = await axios(config);

        if (response.data?.success) {
            return res.json({
                success: true,
                message: response.data.success.message, // "Reset link sent to your email. Check your inbox."
            });
        } else {
            return res.status(400).json({ success: false, message: "Unknown error occurred." });
        }
    } catch (error) {
        console.error("Authentication Error:", error.response ? error.response.data : error.message);

        let status = error.response?.status || 500;
        let message = "An unexpected error occurred. Please try again.";

        if (error.response?.data?.error?.message) {
            message = error.response.data.error.message; // "Email not found."
        }

        return res.status(status).json({ success: false, message });
    }
};

export default ForgotPassword;
