import express from "express";
import PieChart from "../Controller/PieChartController.js";

const router = express.Router();

router.get('/', PieChart);

export default router;