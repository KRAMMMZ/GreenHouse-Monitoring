import express from "express";
import ChangePassword from "../Controller/ChangePasswordController.js";  // Import the ChangePassword controller

const router = express.Router();

// Define the PUT route for changing the password
router.put("/:email", ChangePassword);  // Use PUT directly for the password change route

export default router;
