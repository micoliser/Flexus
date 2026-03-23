import express from "express";
import UserController from "../controllers/userController.js";
import { authenticate, requireAdmin } from "../middleware/roleGuard.js";
import { loginLimiter } from "../middleware/security.js";

const router = express.Router();

router.post("/login", loginLimiter, UserController.login);
router.post("/refresh", UserController.refresh);
router.post("/logout", authenticate, UserController.logout);
router.get("/me", authenticate, UserController.getCurrentUser);

router.get("/", authenticate, requireAdmin, UserController.getAllUsers);
router.get("/:id", authenticate, requireAdmin, UserController.getUserById);
router.post("/", authenticate, requireAdmin, UserController.createUser);
router.put("/:id", authenticate, requireAdmin, UserController.updateUser);
router.patch(
  "/:id/disable",
  authenticate,
  requireAdmin,
  UserController.disableUser,
);
router.delete("/:id", authenticate, requireAdmin, UserController.deleteUser);

export default router;
