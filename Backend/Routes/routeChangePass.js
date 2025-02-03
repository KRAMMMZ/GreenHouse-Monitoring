import express from "express";
import ChangePassword from "../Controller/ChangePasswordController.js";

const router = express.Router();

router.post("/admin", ChangePassword);

export default router;