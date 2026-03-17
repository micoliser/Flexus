import rateLimit from "express-rate-limit";

const defaultAllowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

const parseAllowedOrigins = () => {
  const fromEnv = String(process.env.CORS_ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return new Set(fromEnv.length > 0 ? fromEnv : defaultAllowedOrigins);
};

export const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    const allowedOrigins = parseAllowedOrigins();
    if (allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Origin is not allowed by CORS"));
  },
  credentials: true,
  optionsSuccessStatus: 204,
};

const createLimiter = ({ windowMs, max, message }) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message,
    },
  });

export const apiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: "Too many requests from this IP, please try again later.",
});

export const loginLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many login attempts. Please try again later.",
});

export const contactLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  max: 8,
  message: "Too many contact requests. Please try again later.",
});

export const quoteLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  max: 8,
  message: "Too many quote requests. Please try again later.",
});
