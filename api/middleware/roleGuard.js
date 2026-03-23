import jwt from "jsonwebtoken";
import User from "../models/User.js";

const parseBearerToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) return null;

  return token;
};

const parseAccessToken = (req) => {
  const bearerToken = parseBearerToken(req);
  if (bearerToken) return bearerToken;

  const cookieToken = req.cookies?.access_token;
  if (typeof cookieToken === "string" && cookieToken.trim()) {
    return cookieToken.trim();
  }

  return null;
};

export const authenticate = async (req, res, next) => {
  try {
    const token = parseAccessToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({
        success: false,
        message: "JWT_SECRET is not configured",
      });
    }

    const payload = jwt.verify(token, secret);

    const dbUser = await User.findById(payload.sub).select("isDisabled");
    if (!dbUser) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (dbUser.isDisabled) {
      return res.status(403).json({
        success: false,
        message:
          "This account has been disabled. Contact admin for more information",
      });
    }

    req.user = {
      id: payload.sub,
      emailAddress: payload.emailAddress,
      isStaff: payload.isStaff === true,
      isAdmin: payload.isAdmin === true,
    };

    return next();
  } catch (_error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export const optionalAuthenticate = async (req, _res, next) => {
  try {
    const token = parseAccessToken(req);
    if (!token) return next();

    const secret = process.env.JWT_SECRET;
    if (!secret) return next();

    const payload = jwt.verify(token, secret);

    const dbUser = await User.findById(payload.sub).select("isDisabled");
    if (!dbUser || dbUser.isDisabled) return next();

    req.user = {
      id: payload.sub,
      emailAddress: payload.emailAddress,
      isStaff: payload.isStaff === true,
      isAdmin: payload.isAdmin === true,
    };

    return next();
  } catch (_error) {
    return next();
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }

  next();
};

export const requireStaffOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (!req.user.isAdmin && !req.user.isStaff) {
    return res.status(403).json({
      success: false,
      message: "Staff or admin access required",
    });
  }

  next();
};
