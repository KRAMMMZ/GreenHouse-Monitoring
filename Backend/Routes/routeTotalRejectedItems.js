import express from "express";
import totalRejecteditems from "../Controller/totalRejectedItemsController.js";

const router = express.Router();

router.get('/', totalRejecteditems);

export default router;