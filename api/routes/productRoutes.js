import express from "express";
import ProductController from "../controllers/productController.js";
import {
  authenticate,
  optionalAuthenticate,
  requireStaffOrAdmin,
} from "../middleware/roleGuard.js";

const router = express.Router();

router.get("/", optionalAuthenticate, ProductController.getAllProducts);
router.post(
  "/upload-url",
  authenticate,
  requireStaffOrAdmin,
  ProductController.generateUploadUrl,
);
router.get("/:id", ProductController.getProductById);
router.post(
  "/draft",
  authenticate,
  requireStaffOrAdmin,
  ProductController.saveDraft,
);
router.post(
  "/",
  authenticate,
  requireStaffOrAdmin,
  ProductController.createProduct,
);
router.put(
  "/:id",
  authenticate,
  requireStaffOrAdmin,
  ProductController.updateProduct,
);
router.patch(
  "/:id/publish",
  authenticate,
  requireStaffOrAdmin,
  ProductController.publishProduct,
);
router.patch(
  "/:id/unpublish",
  authenticate,
  requireStaffOrAdmin,
  ProductController.unpublishProduct,
);
router.delete(
  "/:id",
  authenticate,
  requireStaffOrAdmin,
  ProductController.deleteProduct,
);

export default router;
