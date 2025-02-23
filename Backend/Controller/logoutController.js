import axios from "axios";
import qs from "qs";

const logout = async (req, res) => {
  const { email } = req.body;

  const data = qs.stringify({
    email: email,
  });

  const config = {
    method: "post",
    url: "https://agreemo-api.onrender.com/admin/logout",
    headers: {
      "x-api-key": process.env.API_KEY || "fallback_key",
    },
    data: data,
  };

  try {
    const response = await axios(config);
    if (response.data.success) {
      // Clear the JWT cookie.
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return res.json({
        success: true,
        message: response.data.success.message,
        user_data: response.data.success.user_data,
      });
    } else {
      return res.status(400).json({ success: false, message: "INVALID CREDENTIALS" });
    }
  } catch (error) {
    console.error(
      "Error during logout:",
      error.response ? error.response.data : error.message
    );
    const status = error.response?.status || 500;
    let message = "INVALID CREDENTIALS";
    if (!error.response || !error.response.data) {
      message = "An error occurred, please try again.";
    }
    return res.status(status).json({ success: false, message });
  }
};

export default logout;
