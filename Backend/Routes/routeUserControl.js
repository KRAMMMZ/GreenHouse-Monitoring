// userRoutes.js
import express from "express";
import { activateUser, deactivateUser } from "../Controller/userController.js";

const router = express.Router();

// POST /user/activate will call activateUser
router.post("/activate", activateUser);

// POST /user/deactivate will call deactivateUser
router.post("/deactivate", deactivateUser);

export default router;
