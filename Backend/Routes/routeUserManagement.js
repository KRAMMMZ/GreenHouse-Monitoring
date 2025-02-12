import express from "express";
import UserManagement from "../Controller/UserManagementController.js";

const router = express.Router();

router.get('/', UserManagement);

export default router;