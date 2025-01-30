import express from "express";
import totalHarvestsPerDay from "../Controller/PerDayHarvest.Controller.js";

const router = express.Router();

router.get('/', totalHarvestsPerDay);

export default router;