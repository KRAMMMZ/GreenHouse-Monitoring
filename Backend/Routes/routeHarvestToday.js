import express from "express";
import totalHarvestsToday from "../Controller/HarvestTodayController.js";

const router = express.Router();

router.get('/', totalHarvestsToday);

export default router;