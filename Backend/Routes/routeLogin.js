import express from "express";
import login from "../Controller/LoginController.js";

const router = express.Router();

router.post('/', login);

export default router;