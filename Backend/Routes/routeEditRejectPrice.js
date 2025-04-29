import express from "express";
import { updateRejectPrice } from "../Controller/EditRejectPriceController.js";



const router = express.Router();

router.patch("/:id", updateRejectPrice);

export default router;
