import express from "express";
import BarChart from "../Controller/BarChartController.js";

const router = express.Router();

router.get('/', BarChart);

export default router;