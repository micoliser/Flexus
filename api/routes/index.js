import express from "express";
import emailRoutes from "./emailRoutes.js";
import emailController from "../controllers/emailController.js";

const router = express.Router();

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    status: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// API routes
router.use("/email", emailRoutes);

export default router;
