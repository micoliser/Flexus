import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import { connectDB } from "../config/db.js";
import routes from "../routes/apiRoutes.js";
import { notFoundHandler, errorHandler } from "../middleware/errorHandler.js";
import { apiLimiter, corsOptions } from "../middleware/security.js";

dotenv.config();

const app = express();

const trustProxy = String(process.env.TRUST_PROXY || "")
  .trim()
  .toLowerCase();

if (["1", "true", "yes"].includes(trustProxy)) {
  app.set("trust proxy", 1);
}

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use(`/api/${process.env.API_VERSION}`, apiLimiter);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// API Routes
app.use(`/api/${process.env.API_VERSION}`, routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server (skip in test environment)
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== "test") {
  startServer();
}

export default app;
