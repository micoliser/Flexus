import Product from "../models/Product.js";
import LogService from "../services/logService.js";

const PUBLISH_REQUIRED_FIELDS = [
  "name",
  "description",
  "image",
  "origin",
  "grade",
  "minOrder",
  "packaging",
  "shelfLife",
  "availability",
];

const normalizeListField = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const normalizePayload = (body = {}) => ({
  ...body,
  certifications:
    body.certifications !== undefined
      ? normalizeListField(body.certifications)
      : undefined,
  exportMarkets:
    body.exportMarkets !== undefined
      ? normalizeListField(body.exportMarkets)
      : undefined,
});

const validateForPublish = (payload = {}) => {
  const missingFields = [];

  PUBLISH_REQUIRED_FIELDS.forEach((field) => {
    const value = payload[field];
    if (typeof value !== "string" || !value.trim()) {
      missingFields.push(field);
    }
  });

  const exportMarkets = payload.exportMarkets;
  if (!Array.isArray(exportMarkets) || exportMarkets.length === 0) {
    missingFields.push("exportMarkets");
  }

  return missingFields;
};

const hasAtLeastOneDraftField = (payload = {}) => {
  const stringFields = [
    "name",
    "description",
    "image",
    "longDescription",
    "origin",
    "grade",
    "moisture",
    "minOrder",
    "packaging",
    "shelfLife",
    "availability",
  ];

  const hasStringValue = stringFields.some((field) => {
    const value = payload[field];
    return typeof value === "string" && value.trim().length > 0;
  });

  const hasCertifications =
    Array.isArray(payload.certifications) && payload.certifications.length > 0;
  const hasExportMarkets =
    Array.isArray(payload.exportMarkets) && payload.exportMarkets.length > 0;

  return hasStringValue || hasCertifications || hasExportMarkets;
};

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

  // POST /api/v1/products/draft
  static async saveDraft(req, res, next) {
    try {
      const payload = normalizePayload(req.body);

      if (!hasAtLeastOneDraftField(payload)) {
        return res.status(400).json({
          success: false,
          message: "Draft must contain at least one product field.",
        });
      }

      const product = await Product.create({
        ...payload,
        isPublished: false,
      });

      await LogService.createLog({
        action: "product.draft.save",
        entityType: "product",
        entityId: product.id,
        message: `Draft product \"${product.name || "Untitled"}\" saved by ${req.user?.emailAddress || "unknown"}`,
        actorUserId: req.user?.id,
        actorEmail: req.user?.emailAddress,
        status: "success",
      });

      res.status(201).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/products
  static async createProduct(req, res, next) {
    try {
      const payload = normalizePayload(req.body);
      const missingFields = validateForPublish(payload);

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Cannot publish product. Required fields are incomplete.",
          missingFields,
        });
      }

      const product = await Product.create({ ...payload, isPublished: true });

      await LogService.createLog({
        action: "product.publish",
        entityType: "product",
        entityId: product.id,
        message: `Product \"${product.name}\" published by ${req.user?.emailAddress || "unknown"}`,
        actorUserId: req.user?.id,
        actorEmail: req.user?.emailAddress,
        status: "success",
      });

      res.status(201).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/v1/products/:id
  static async updateProduct(req, res, next) {
    try {
      const existingProduct = await Product.findById(req.params.id);

      if (!existingProduct) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }

      const payload = normalizePayload(req.body);
      const mergedData = {
        ...existingProduct.toObject(),
        ...payload,
      };

      const nextIsPublished =
        payload.isPublished !== undefined
          ? payload.isPublished === true
          : existingProduct.isPublished === true;

      if (nextIsPublished) {
        const missingFields = validateForPublish(mergedData);
        if (missingFields.length > 0) {
          return res.status(400).json({
            success: false,
            message: "Cannot publish product. Required fields are incomplete.",
            missingFields,
          });
        }
      } else if (!hasAtLeastOneDraftField(mergedData)) {
        return res.status(400).json({
          success: false,
          message: "Draft must contain at least one product field.",
        });
      }

      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { $set: payload },
        { new: true, runValidators: true },
      );

      await LogService.createLog({
        action: "product.update",
        entityType: "product",
        entityId: product.id,
        message: `Product \"${product.name}\" updated by ${req.user?.emailAddress || "unknown"}`,
        actorUserId: req.user?.id,
        actorEmail: req.user?.emailAddress,
        status: "success",
        metadata: {
          updatedFields: Object.keys(payload || {}),
          isPublished: product.isPublished,
        },
      });

      res.json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/v1/products/:id/publish
  static async publishProduct(req, res, next) {
    try {
      const existingProduct = await Product.findById(req.params.id);

      if (!existingProduct) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }

      const payload = normalizePayload(req.body);
      const mergedData = {
        ...existingProduct.toObject(),
        ...payload,
      };

      const missingFields = validateForPublish(mergedData);
      if (missingFields.length > 0) {
        await LogService.createLog({
          action: "product.publish",
          entityType: "product",
          entityId: existingProduct.id,
          message: `Failed publish attempt for product \"${existingProduct.name || "Untitled"}\" by ${req.user?.emailAddress || "unknown"}`,
          actorUserId: req.user?.id,
          actorEmail: req.user?.emailAddress,
          status: "failure",
          metadata: { missingFields },
        });

        return res.status(400).json({
          success: false,
          message: "Cannot publish draft. Complete all required fields first.",
          missingFields,
        });
      }

      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { $set: { ...payload, isPublished: true } },
        { new: true, runValidators: true },
      );

      await LogService.createLog({
        action: "product.publish",
        entityType: "product",
        entityId: product.id,
        message: `Product \"${product.name}\" published by ${req.user?.emailAddress || "unknown"}`,
        actorUserId: req.user?.id,
        actorEmail: req.user?.emailAddress,
        status: "success",
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
