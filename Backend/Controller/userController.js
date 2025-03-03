import axios from "axios";
import qs from "qs";

// Endpoint to activate a user.
export const activateUser = async (req, res) => {
  try {
    const { email } = req.body;
    const admin_email = req.user.email;
    const data = qs.stringify({ user_email: email, admin_email });

    const config = {
      method: "post",
      url: "https://agreemo-api.onrender.com/user/activate",
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
    const errMsg =
      error.response &&
      (error.response.data.error || error.response.data.message)
        ? error.response.data.error || error.response.data.message
        : error.message;
    res.status(500).json({ error: errMsg });
  }
};

// Endpoint to deactivate a user.
export const deactivateUser = async (req, res) => {
  try {
    const { email } = req.body;
    const admin_email = req.user.email;
    const data = qs.stringify({ user_email: email, admin_email });

    const config = {
      method: "post",
      url: "https://agreemo-api.onrender.com/user/deactivate",
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
    const errMsg =
      error.response &&
      (error.response.data.error || error.response.data.message)
        ? error.response.data.error || error.response.data.message
        : error.message;
    res.status(500).json({ error: errMsg });
  }
};
