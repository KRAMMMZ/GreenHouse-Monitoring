import { Router } from "express";
import {getMe} from "../middleware/authenticateUser.js";

const router = Router();

router.get("/admin/me", getMe);

export default router;
 