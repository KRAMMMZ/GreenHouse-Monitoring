import express from "express";
import PlantedCrops from "../Controller/plantedCropsController.js";

const router = express.Router();

router.get('/', PlantedCrops);

export default router;