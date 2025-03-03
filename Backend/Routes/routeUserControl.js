// routeUserControl.js
import express from "express";
import { activateUser, deactivateUser } from "../Controller/userController.js";
import { authenticateUser } from "../middleware/authenticateUser.js"; // Adjust the path as needed
0
const router = express.Router();

// POST /user/activate will now first run authenticateUser to populate req.users
router.post("/activate", authenticateUser, activateUser);

// POST /user/deactivate will now first run authenticateUser to populate req.user
router.post("/deactivate", authenticateUser, deactivateUser);

export default router;
