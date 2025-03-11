import express from "express";
import HardwareComponents from "../Controller/HardwareComponentsController.js";

const router = express.Router();

router.get('/', HardwareComponents);

export default router;