import express from "express";
import Sales from "../Controller/SalesController.js";

const router = express.Router();

router.get('/', Sales);

export default router;