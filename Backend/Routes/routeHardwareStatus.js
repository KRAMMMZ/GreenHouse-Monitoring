import express from "express";
import HardwareStatus from "../Controller/HardwareStatusController.js";

const router = express.Router();

router.get('/', HardwareStatus);

export default router;