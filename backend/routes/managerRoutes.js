import express from "express";
import { getWorkers } from "../controllers/managerController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/workers", protect, getWorkers);

export default router;