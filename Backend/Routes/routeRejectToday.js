import express from "express";
import totalRejectToday from "../Controller/RejectTodayController.js";

const router = express.Router();

router.get('/', totalRejectToday);

export default router;