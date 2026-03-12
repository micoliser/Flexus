import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import { connectDB } from "../config/db.js";
import routes from "../routes/apiRoutes.js";
import { notFoundHandler, errorHandler } from "../middleware/errorHandler.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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
