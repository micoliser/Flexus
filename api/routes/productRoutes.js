import express from "express";
import ProductController from "../controllers/productController.js";
import { authenticate, requireStaffOrAdmin } from "../middleware/roleGuard.js";

const router = express.Router();

router.get("/", ProductController.getAllProducts);
router.get("/:id", ProductController.getProductById);
router.post("/", authenticate, requireStaffOrAdmin, ProductController.createProduct);
router.put("/:id", authenticate, requireStaffOrAdmin, ProductController.updateProduct);
router.delete("/:id", authenticate, requireStaffOrAdmin, ProductController.deleteProduct);

export default router;
