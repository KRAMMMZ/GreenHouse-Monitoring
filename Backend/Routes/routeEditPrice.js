import express from "express";
import { updateHarvestPrice } from "../Controller/EditHarvestPriceController.js"



const router = express.Router();

router.patch("/:id", updateHarvestPrice);

export default router;
