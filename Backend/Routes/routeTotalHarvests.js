import express from "express";
import totalHarvests from "../Controller/totalHarvestController.js";

const router = express.Router();

router.get('/', totalHarvests);

export default router;