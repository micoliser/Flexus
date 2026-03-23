import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import LogService from "../services/logService.js";

const signAccessToken = (user) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  return jwt.sign(
    {
      sub: user.id,
      emailAddress: user.emailAddress,
      isStaff: user.isStaff,
      isAdmin: user.isAdmin,
    },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" },
  );
};

const signRefreshToken = (user) => {
  const secret = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      "REFRESH_TOKEN_SECRET or JWT_SECRET must be defined in environment variables",
    );
  }

  return jwt.sign(
    {
      sub: user.id,
      tokenType: "refresh",
      jti: crypto.randomUUID(),
    },
    secret,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d" },
  );
};

const hashToken = (token) =>
  crypto.createHash("sha256").update(String(token)).digest("hex");

const parseDurationToMs = (duration, fallbackMs) => {
  const normalized = String(duration || "")
    .trim()
    .toLowerCase();
  if (!normalized) return fallbackMs;

  if (/^\d+$/.test(normalized)) {
    return Number(normalized) * 1000;
  }

  const match = normalized.match(/^(\d+)(ms|s|m|h|d)$/);
  if (!match) return fallbackMs;

  const value = Number(match[1]);
  const unit = match[2];

  if (unit === "ms") return value;
  if (unit === "s") return value * 1000;
  if (unit === "m") return value * 60 * 1000;
  if (unit === "h") return value * 60 * 60 * 1000;
  return value * 24 * 60 * 60 * 1000;
};

const getAccessCookieMaxAge = () =>
  parseDurationToMs(process.env.JWT_EXPIRES_IN || "15m", 15 * 60 * 1000);

const getRefreshCookieMaxAge = () =>
  parseDurationToMs(
    process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
    7 * 24 * 60 * 60 * 1000,
  );

const isCookieSecure = () => {
  if (process.env.COOKIE_SECURE !== undefined) {
    return String(process.env.COOKIE_SECURE).trim().toLowerCase() === "true";
  }

  return process.env.NODE_ENV === "production";
};

const getCookieSameSite = () => {
  const fromEnv = String(process.env.COOKIE_SAME_SITE || "")
    .trim()
    .toLowerCase();
  if (["strict", "lax", "none"].includes(fromEnv)) {
    return fromEnv;
  }

  return process.env.NODE_ENV === "production" ? "strict" : "lax";
};

const getCookieDomain = () => {
  const domain = String(process.env.COOKIE_DOMAIN || "").trim();
  return domain || undefined;
};

const buildCookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: isCookieSecure(),
  sameSite: getCookieSameSite(),
  path: "/",
  maxAge,
  ...(getCookieDomain() ? { domain: getCookieDomain() } : {}),
});

const setAuthCookies = (res, { accessToken, refreshToken }) => {
  res.cookie(
    "access_token",
    accessToken,
    buildCookieOptions(getAccessCookieMaxAge()),
  );
  res.cookie(
    "refresh_token",
    refreshToken,
    buildCookieOptions(getRefreshCookieMaxAge()),
  );
};

const clearAuthCookies = (res) => {
  const options = buildCookieOptions(0);
  res.clearCookie("access_token", options);
  res.clearCookie("refresh_token", options);
};

const buildRefreshSession = (refreshToken) => {
  return {
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + getRefreshCookieMaxAge()),
  };
};

const compactSessions = (sessions = []) => {
  const now = Date.now();
  const validSessions = sessions.filter(
    (session) =>
      session?.tokenHash &&
      session?.expiresAt &&
      new Date(session.expiresAt).getTime() > now,
  );

  return validSessions.slice(-5);
};

class UserController {
  // POST /api/v1/users/login
  static async login(req, res, next) {
    try {
      const { emailAddress, password } = req.body;

      if (!emailAddress || !password) {
        await LogService.createLog({
          action: "auth.login",
          entityType: "auth",
          message: "Failed login attempt: missing credentials",
          actorEmail: emailAddress,
          status: "failure",
        });
        return res.status(400).json({
          success: false,
          message: "emailAddress and password are required",
        });
      }

      const user = await User.findOne({ emailAddress }).select(
        "+password +refreshSessions",
      );

      if (!user) {
        await LogService.createLog({
          action: "auth.login",
          entityType: "auth",
          message: `Failed login attempt for ${emailAddress}`,
          actorEmail: emailAddress,
          status: "failure",
        });
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        await LogService.createLog({
          action: "auth.login",
          entityType: "auth",
          entityId: user.id,
          message: `Failed login attempt for ${emailAddress}`,
          actorUserId: user.id,
          actorName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          actorEmail: emailAddress,
          status: "failure",
        });
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      if (user.isDisabled) {
        await LogService.createLog({
          action: "auth.login",
          entityType: "auth",
          entityId: user.id,
          message: `Login attempt by disabled user ${emailAddress}`,
          actorUserId: user.id,
          actorEmail: emailAddress,
          status: "failure",
        });
        return res.status(403).json({
          success: false,
          message:
            "This account has been disabled. Contact admin for more information",
        });
      }

      const userData = user.toJSON();
      const accessToken = signAccessToken(userData);
      const refreshToken = signRefreshToken(userData);

      user.refreshSessions = compactSessions([
        ...(user.refreshSessions || []),
        buildRefreshSession(refreshToken),
      ]);
      await user.save();

      setAuthCookies(res, { accessToken, refreshToken });

      await LogService.createLog({
        action: "auth.login",
        entityType: "auth",
        entityId: userData.id,
        message: `User ${userData.emailAddress} logged in successfully`,
        actorUserId: userData.id,
        actorName:
          `${userData.firstName || ""} ${userData.lastName || ""}`.trim(),
        actorEmail: userData.emailAddress,
        status: "success",
      });

      res.json({
        success: true,
        message: "Login successful",
        data: {
          user: userData,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/users/logout
  static async logout(req, res, next) {
    try {
      const refreshToken = req.cookies?.refresh_token;

      if (req.user?.id && refreshToken) {
        const refreshHash = hashToken(refreshToken);
        await User.findByIdAndUpdate(req.user.id, {
          $pull: { refreshSessions: { tokenHash: refreshHash } },
        });
      }

      clearAuthCookies(res);

      await LogService.createLog({
        action: "auth.logout",
        entityType: "auth",
        entityId: req.user?.id,
        message: `User ${req.user?.emailAddress || "unknown"} logged out`,
        actorUserId: req.user?.id,
        actorEmail: req.user?.emailAddress,
        status: "success",
      });

      res.json({
        success: true,
        message: "Logout successful",
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/users/refresh
  static async refresh(req, res, next) {
    try {
      const token = req.cookies?.refresh_token;
      if (!token) {
        clearAuthCookies(res);
        return res.status(401).json({
          success: false,
          message: "Refresh token missing",
        });
      }

      const secret = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET;
      if (!secret) {
        throw new Error(
          "REFRESH_TOKEN_SECRET or JWT_SECRET must be defined in environment variables",
        );
      }

      const payload = jwt.verify(token, secret);
      if (payload?.tokenType !== "refresh" || !payload?.sub) {
        clearAuthCookies(res);
        return res.status(401).json({
          success: false,
          message: "Invalid refresh token",
        });
      }

      const tokenHash = hashToken(token);
      const user = await User.findById(payload.sub).select("+refreshSessions");

      if (!user || user.isDisabled) {
        clearAuthCookies(res);
        return res.status(401).json({
          success: false,
          message: "Invalid refresh token",
        });
      }

      const sessions = compactSessions(user.refreshSessions || []);
      const sessionExists = sessions.some(
        (session) => session.tokenHash === tokenHash,
      );

      if (!sessionExists) {
        user.refreshSessions = sessions;
        await user.save();
        clearAuthCookies(res);
        return res.status(401).json({
          success: false,
          message: "Invalid refresh token",
        });
      }

      const userData = user.toJSON();
      const accessToken = signAccessToken(userData);
      const newRefreshToken = signRefreshToken(userData);
      const newSession = buildRefreshSession(newRefreshToken);

      user.refreshSessions = compactSessions([
        ...sessions.filter((session) => session.tokenHash !== tokenHash),
        newSession,
      ]);
      await user.save();

      setAuthCookies(res, {
        accessToken,
        refreshToken: newRefreshToken,
      });

      return res.json({
        success: true,
        data: {
          user: userData,
        },
      });
    } catch (_error) {
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }
  }

  // GET /api/v1/users/me
  static async getCurrentUser(req, res, next) {
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/users
  static async getAllUsers(req, res, next) {
    try {
      const { search = "", role = "all" } = req.query;
      const query = {};

      const trimmedSearch = String(search || "").trim();
      if (trimmedSearch) {
        query.$or = [
          { firstName: { $regex: trimmedSearch, $options: "i" } },
          { lastName: { $regex: trimmedSearch, $options: "i" } },
        ];
      }

      const normalizedRole = String(role || "all")
        .trim()
        .toLowerCase();
      if (normalizedRole === "admin") {
        query.isDisabled = false;
        query.isAdmin = true;
      } else if (normalizedRole === "staff") {
        query.isDisabled = false;
        query.isAdmin = false;
        query.isStaff = true;
      } else if (normalizedRole === "disabled") {
        query.isDisabled = true;
      } else if (normalizedRole === "all") {
        // no-op
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid role filter. Use all, admin, staff, or disabled.",
        });
      }

      const users = await User.find(query).sort({ createdAt: -1 });
      res.json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/users/:id
  static async getUserById(req, res, next) {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/users
  static async createUser(req, res, next) {
    try {
      const { firstName, lastName, emailAddress, password, isStaff, isAdmin } =
        req.body;

      if (!firstName || !lastName || !emailAddress || !password) {
        return res.status(400).json({
          success: false,
          message:
            "firstName, lastName, emailAddress, and password are required",
        });
      }

      const existingUser = await User.findOne({ emailAddress });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "A user with this email already exists",
        });
      }

      const user = await User.create({
        firstName,
        lastName,
        emailAddress,
        password,
        isStaff,
        isAdmin,
      });

      await LogService.createLog({
        action: "user.create",
        entityType: "user",
        entityId: user.id,
        message: `User ${emailAddress} created by ${req.user?.emailAddress || "unknown"}`,
        actorUserId: req.user?.id,
        actorEmail: req.user?.emailAddress,
        status: "success",
        metadata: {
          isStaff: user.isStaff,
          isAdmin: user.isAdmin,
        },
      });

      res.status(201).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/v1/users/:id
  static async updateUser(req, res, next) {
    try {
      const updateData = { ...req.body };

      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 12);
      }

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true, runValidators: true },
      );

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      await LogService.createLog({
        action: "user.update",
        entityType: "user",
        entityId: user.id,
        message: `User ${user.emailAddress} updated by ${req.user?.emailAddress || "unknown"}`,
        actorUserId: req.user?.id,
        actorEmail: req.user?.emailAddress,
        status: "success",
        metadata: {
          updatedFields: Object.keys(updateData || {}),
        },
      });

      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/v1/users/:id/disable
  static async disableUser(req, res, next) {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      const newState = !user.isDisabled;
      user.isDisabled = newState;
      await user.save();

      const verb = newState ? "disabled" : "enabled";

      await LogService.createLog({
        action: newState ? "user.disable" : "user.enable",
        entityType: "user",
        entityId: user.id,
        message: `User ${user.emailAddress} ${verb} by ${req.user?.emailAddress || "unknown"}`,
        actorUserId: req.user?.id,
        actorEmail: req.user?.emailAddress,
        status: "success",
      });

      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/v1/users/:id
  static async deleteUser(req, res, next) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      await LogService.createLog({
        action: "user.delete",
        entityType: "user",
        entityId: user.id,
        message: `User ${user.emailAddress} deleted by ${req.user?.emailAddress || "unknown"}`,
        actorUserId: req.user?.id,
        actorEmail: req.user?.emailAddress,
        status: "success",
      });

      res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;
