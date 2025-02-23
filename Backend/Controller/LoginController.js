// routeLogin.js
import axios from "axios";
import qs from "qs";
import jwt from "jsonwebtoken";
import { config } from "dotenv";
config();

const login = async (req, res) => {
  const { email, password } = req.body;

  const data = qs.stringify({ email, password });

  const configAxios = {
    method: "post",
    url: "https://agreemo-api.onrender.com/admin/login",
    headers: {
      "x-api-key": process.env.API_KEY || "fallback_key",
    },
    data: data,
  };

  try {
    const response = await axios(configAxios);
    if (response.data.success) {
      // Correct: use user_data from the response
      const user_data = response.data.success.user_data;

      // Sign a JWT token using user_data as the payload.
      const token = jwt.sign(
        { id: user_data._id, email: user_data.email, name: user_data.name },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      // Set the token in an HTTP-only cookie.
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // true in production
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
      });

      return res.json({
        success: true,
        message: response.data.success.message,
        user_data: user_data,
      });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "INVALID CREDENTIALS" });
    }
  } catch (error) {
    console.error(
      "Error during authentication:",
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

export default login;
