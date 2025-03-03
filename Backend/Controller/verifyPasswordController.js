import axios from "axios";
import qs from "qs";

export const verifyActivateUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin_email = req.user.email;

    const data = qs.stringify({
      admin_email: admin_email,
      email: email,
      password: password,
    });

    const config = {
      method: "post",
      url: "https://agreemo-api.onrender.com/verify-user/activate",
      headers: {
        "x-api-key": process.env.API_KEY || "fallback_key",
      },
      data,
      maxBodyLength: Infinity,
    };

    const response = await axios(config);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error activating user:", error);
    // Extract exact error message if available from the API response
    const errorMessage =
      error.response?.data?.error?.message || error.message;
    res.status(500).json({ error: errorMessage });
  }
};

export const verifyDeactivateUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin_email = req.user.email;

    const data = qs.stringify({
      admin_email: admin_email,
      email: email,
      password: password,
    });

    const config = {
      method: "post",
      url: "https://agreemo-api.onrender.com/verify-user/deactivate",
      headers: {
        "x-api-key": process.env.API_KEY || "fallback_key",
      },
      data,
      maxBodyLength: Infinity,
    };

    const response = await axios(config);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error deactivating user:", error);
    // Extract exact error message if available from the API response
    const errorMessage =
      error.response?.data?.error?.message || error.message;
    res.status(500).json({ error: errorMessage });
  }
};
