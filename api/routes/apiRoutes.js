import express from "express";
import emailRoutes from "./emailRoutes.js";
import productRoutes from "./productRoutes.js";
import userRoutes from "./userRoutes.js";
import logRoutes from "./logRoutes.js";

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
router.use("/products", productRoutes);
router.use("/users", userRoutes);
router.use("/logs", logRoutes);

export default router;
