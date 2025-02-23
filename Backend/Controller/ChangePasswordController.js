import axios from "axios";
import dotenv from "dotenv";
import qs from "qs"; // Used to convert JSON to form-urlencoded format

dotenv.config();

const ChangePassword = async (req, res) => {
    // Get the email from req.user (set by your authentication middleware)
    const userEmail = req.user?.email;
    const { old_password, new_password } = req.body;

    if (!userEmail || !old_password || !new_password) {
        return res.status(400).json({ success: false, message: "All fields are required." });
    }

    try {
        // Prepare the request body as form-urlencoded data
        const requestBody = qs.stringify({ email: userEmail, old_password, new_password });
        console.log("Sending to External API:", requestBody);

        const response = await axios.put(
            `https://agreemo-api.onrender.com/admin`,
            requestBody,
            {
                headers: {
                    "x-api-key": process.env.API_KEY || "fallback_key",
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Accept": "application/json",
                },
            }
        );

        console.log("External API Response:", response.data);
        res.json(response.data);
    } catch (error) {
        console.error("Error changing password:", error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: error.response?.data?.error?.message || "Password change failed due to server error.",
        });
    }
};

export default ChangePassword;
