import express from "express";
import NutrientController from "../Controller/NutrientController.js";

const router = express.Router();

router.get('/', NutrientController);

export default router;