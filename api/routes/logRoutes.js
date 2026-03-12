import express from "express";
import LogController from "../controllers/logController.js";
import { authenticate, requireAdmin } from "../middleware/roleGuard.js";

const router = express.Router();

router.get("/", authenticate, requireAdmin, LogController.getLogs);

export default router;
