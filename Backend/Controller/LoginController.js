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
    url: "https://agreemo-api-v2.onrender.com/admin/login",
    headers: {
      "x-api-key": process.env.API_KEY || "fallback_key",
    },
    data: data,
  };

  try {
    const response = await axios(configAxios);
    if (response.data.success) {
      // Use user_data from the response
      const user_data = response.data.success.user_data;

      // Sign a JWT token using user_data as the payload.
      const token = jwt.sign(
        { id: user_data._id, email: user_data.email, name: user_data.name },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
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
      // If "success" is false but we have a message from the API:
      return res.status(400).json({
        success: false,
        message: response.data.message || "Invalid Credentials",
      });
    }
  } catch (error) {
    console.error(
      "Error during authentication:",
      error.response ? error.response.data : error.message
    );

    // 1) Determine the status from the error response; default to 500
    const status = error.response?.status || 500;

    // 2) Extract the real error message if it exists
    //    For example, if your remote API returns: { error: { message: 'Password incorrect.' } }
    //    then error.response.data.error.message will be "Password incorrect."
    const message =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      "Something went wrong.";

    // 3) Return that exact message to the client
    return res.status(status).json({ success: false, message });
  }
};

export default login;
