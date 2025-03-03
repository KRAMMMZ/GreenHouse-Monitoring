// authController.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const getMe = (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({
      success: true,
      user_data: { 
        id: decoded.id, 
        email: decoded.email, 
        name: decoded.name 
      },
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

export const authenticateUser = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Store admin's details on req.user for use in later middleware or controllers
    req.user = { id: decoded.id, email: decoded.email, name: decoded.name };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};
