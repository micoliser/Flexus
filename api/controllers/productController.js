import Product from "../models/Product.js";
import LogService from "../services/logService.js";

class ProductController {
  // GET /api/v1/products
  static async getAllProducts(req, res, next) {
    try {
      const products = await Product.find().sort({ createdAt: -1 });
      res.json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/products/:id
  static async getProductById(req, res, next) {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }
      res.json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/products
  static async createProduct(req, res, next) {
    try {
      const {
        name,
        description,
        image,
        longDescription,
        origin,
        grade,
        moisture,
        minOrder,
        packaging,
        shelfLife,
        certifications,
        exportMarkets,
        availability,
      } = req.body;

      if (
        !name ||
        !description ||
        !image ||
        !origin ||
        !grade ||
        !minOrder ||
        !packaging ||
        !shelfLife ||
        !availability
      ) {
        return res.status(400).json({
          success: false,
          message:
            "name, description, image, origin, grade, minOrder, packaging, shelfLife, and availability are required",
        });
      }

      const product = await Product.create({
        name,
        description,
        image,
        longDescription,
        origin,
        grade,
        moisture,
        minOrder,
        packaging,
        shelfLife,
        certifications,
        exportMarkets,
        availability,
        isPublished: req.body.isPublished,
      });

      await LogService.createLog({
        action: "product.create",
        entityType: "product",
        entityId: product.id,
        message: `Product \"${product.name}\" created by ${req.user?.emailAddress || "unknown"}`,
        actorUserId: req.user?.id,
        actorName: req.user?.name,
        actorEmail: req.user?.emailAddress,
        status: "success",
        metadata: {
          isPublished: product.isPublished,
        },
      });

      res.status(201).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/v1/products/:id
  static async updateProduct(req, res, next) {
    try {
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true },
      );

      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }

      await LogService.createLog({
        action: "product.update",
        entityType: "product",
        entityId: product.id,
        message: `Product \"${product.name}\" updated by ${req.user?.emailAddress || "unknown"}`,
        actorUserId: req.user?.id,
        actorName: req.user?.name,
        actorEmail: req.user?.emailAddress,
        status: "success",
        metadata: {
          updatedFields: Object.keys(req.body || {}),
        },
      });

      res.json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/v1/products/:id
  static async deleteProduct(req, res, next) {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);

      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }

      await LogService.createLog({
        action: "product.delete",
        entityType: "product",
        entityId: product.id,
        message: `Product \"${product.name}\" deleted by ${req.user?.emailAddress || "unknown"}`,
        actorUserId: req.user?.id,
        actorName: req.user?.name,
        actorEmail: req.user?.emailAddress,
        status: "success",
      });

      res.json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}

export default ProductController;
