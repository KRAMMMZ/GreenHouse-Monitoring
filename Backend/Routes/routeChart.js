import express from "express";
import totalAcceptedPerDay from "../Controller/ChartController.js";

const router = express.Router();

router.get('/', totalAcceptedPerDay);

export default router;