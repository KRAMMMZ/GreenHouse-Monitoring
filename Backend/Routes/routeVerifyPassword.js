//routeVerifyPassword.js
import express from "express";
import { verifyActivateUser, verifyDeactivateUser } from "../Controller/verifyPasswordController.js";
import { authenticateUser } from "../middleware/authenticateUser.js";

const router = express.Router();
 
router.post("/activate", authenticateUser, verifyActivateUser);
router.post("/deactivate", authenticateUser, verifyDeactivateUser);

export default router;
