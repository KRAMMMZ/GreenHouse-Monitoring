import axios from "axios";
import dotenv from "dotenv";
import qs from "qs";  // Import qs to convert JSON to form-urlencoded format

dotenv.config();

const ChangePassword = async (req, res) => {
    console.log("Params:", req.params);
    console.log("Body:", req.body);

    const { email } = req.params;
    const { old_password, new_password } = req.body; // Match the Postman request format

    if (!email || !old_password || !new_password) {
        return res.status(400).json({ success: false, message: "All fields are required." });
    }

    try {
        const requestBody = qs.stringify({ old_password, new_password }); // Convert JSON to form-urlencoded

        console.log("Sending to External API:", requestBody);

        const response = await axios.put(
            `https://agreemo-api.onrender.com/admin/${email}`,
            requestBody, // Send as form-urlencoded
            {
                headers: {
                    "x-api-key": process.env.API_KEY || "fallback_key",
                    "Content-Type": "application/x-www-form-urlencoded", // Change Content-Type
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
