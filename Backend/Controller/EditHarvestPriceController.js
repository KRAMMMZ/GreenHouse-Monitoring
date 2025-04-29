// Controller (EditHarvestPriceController.js)
import axios from "axios";
import dotenv from "dotenv";
import qs from "qs"; // Used to convert JSON to form-urlencoded format

dotenv.config();

export const updateHarvestPrice = async (req, res) => {
    const { id } = req.params;
    const rawPrice = req.body.price;
    const price = parseFloat(rawPrice);

    if (isNaN(price)) {
        return res.status(400).json({ message: "Invalid price value" });
    }

    // get admin email from your auth middleware
    const userEmail = req.user?.email;

    try {
        // Prepare the request body as form-urlencoded data
        const requestBody = qs.stringify({
            price: price,
            admin_email: userEmail,
        });
        console.log("Sending to External API:", requestBody);

        const response = await axios.patch(
            `https://agreemo-api-v2.onrender.com/harvests/${id}`,
            requestBody,
            {
                headers: {
                    "x-api-key": process.env.API_KEY || "fallback_key",
                    "Content-Type": "application/x-www-form-urlencoded", // Correct Content-Type
                    "Accept": "application/json",
                },
            }
        );

        console.log("External API Response:", response.data);
        res.json(response.data);
    } catch (err) {
        console.error("updateHarvestPrice:", err);

        if (err.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error("Data:", err.response.data);
            console.error("Status:", err.response.status);
            console.error("Headers:", err.response.headers);
            return res.status(err.response.status).json({ message: `External API Error: ${err.response.status} - ${err.response.data.message || err.response.statusText}` });
        } else if (err.request) {
            // The request was made but no response was received
            console.error("Request:", err.request);
            return res.status(500).json({ message: "No response from external API" });
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error("Error:", err.message);
            return res.status(500).json({ message: err.message });
        }
    }
};



