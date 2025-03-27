// authController.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const getMe = (req, res) => {
  const token = req.cookies.token;
  console.log("[getMe] Token from cookies:", token);

  if (!token) {
    console.log("[getMe] No token found.");
    return res.status(401).json({ success: false, message: "Not authenticated gett" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("[getMe] Decoded token:", decoded);
    return res.json({
      success: true,
      user_data: { 
        id: decoded.id, 
        email: decoded.email, 
        name: decoded.name 
      },
    });
  } catch (error) {
    console.error("[getMe] Error verifying token:", error);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

export const authenticateUser = (req, res, next) => {
  const token = req.cookies.token;
  console.log("[authenticateUser] Token from cookies:", token);

  if (!token) {
    console.log("[authenticateUser] No token found.");
    return res.status(401).json({ success: false, message: "Not authenticated AGAF" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("[authenticateUser] Decoded token:", decoded);
    // Store admin's details on req.user for use in later middleware or controllers
    req.user = { id: decoded.id, email: decoded.email, name: decoded.name };
    next();
  } catch (error) {
    console.error("[authenticateUser] Error verifying token:", error);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};
