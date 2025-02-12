import express from "express";
import AdminLogs from "../Controller/AdminLogsController.js";

const router = express.Router();

router.get('/', AdminLogs);

export default router;