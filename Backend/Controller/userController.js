// userController.js
import axios from "axios";
import qs from "qs";

// Endpoint to activate a user
export const activateUser = async (req, res) => {
  try {
    // Expecting req.body to contain { email: "user@example.com" }
    const { email } = req.body;
    const data = qs.stringify({ email });

    const config = {
      method: "post",
      url: "https://agreemo-api.onrender.com/user/activate",
      headers: {
        "x-api-key": process.env.API_KEY || "fallback_key",
      },
      data: data,
      maxBodyLength: Infinity,
    };

    const response = await axios(config);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error activating user:", error);
    res.status(500).json({ error: error.message });
  }
};

// Endpoint to deactivate a user
export const deactivateUser = async (req, res) => {
  try {
    const { email } = req.body;
    const data = qs.stringify({ email });

    const config = {
      method: "post",
      url: "https://agreemo-api.onrender.com/user/deactivate",
      headers: {
        "x-api-key": process.env.API_KEY || "fallback_key",
      },
      data: data,
      maxBodyLength: Infinity,
    };

    const response = await axios(config);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error deactivating user:", error);
    res.status(500).json({ error: error.message });
  }
};
