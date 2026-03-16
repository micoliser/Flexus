import Product from "../models/Product.js";
import LogService from "../services/logService.js";
import { DeleteObjectsCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3Client, { s3BucketName } from "../config/s3.js";

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
const MAX_OTHER_IMAGES = 10;

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

const normalizeImageListField = (value) => {
  return [...new Set(normalizeListField(value))];
};

const isHttpUrl = (value) => {
  try {
    const url = new URL(String(value));
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const isAllowedImageHost = (value) => {
  if (!s3BucketName) return true;

  try {
    const url = new URL(String(value));
    const region = process.env.AWS_REGION;
    const allowedHosts = new Set([
      `${s3BucketName}.s3.amazonaws.com`,
      `${s3BucketName}.s3.${region}.amazonaws.com`,
    ]);

    return allowedHosts.has(url.hostname);
  } catch {
    return false;
  }
};

const getImageUrlList = (payload = {}) => {
  const urls = [];

  if (typeof payload.image === "string" && payload.image.trim()) {
    urls.push(payload.image.trim());
  }

  if (Array.isArray(payload.otherImages)) {
    payload.otherImages.forEach((item) => {
      if (typeof item === "string" && item.trim()) {
        urls.push(item.trim());
      }
    });
  }

  return [...new Set(urls)];
};

const getObjectKeyFromUrl = (value) => {
  if (!value || !isAllowedImageHost(value)) return null;

  try {
    const url = new URL(String(value));
    const key = decodeURIComponent(url.pathname.replace(/^\//, ""));
    return key || null;
  } catch {
    return null;
  }
};

const deleteS3ObjectsByKeys = async (keys = []) => {
  if (!s3BucketName || !Array.isArray(keys) || keys.length === 0) return;

  const uniqueKeys = [...new Set(keys)].filter(Boolean);
  if (uniqueKeys.length === 0) return;

  await s3Client.send(
    new DeleteObjectsCommand({
      Bucket: s3BucketName,
      Delete: {
        Objects: uniqueKeys.map((key) => ({ Key: key })),
        Quiet: true,
      },
    }),
  );
};

const validateImageFields = (
  payload = {},
  { requireImage = false, validateAllImageFields = false } = {},
) => {
  const errors = [];

  const shouldValidateImage =
    validateAllImageFields || payload.image !== undefined;
  const shouldValidateOtherImages =
    validateAllImageFields || payload.otherImages !== undefined;

  const imageValue =
    typeof payload.image === "string" ? payload.image.trim() : payload.image;

  if (requireImage && (!imageValue || typeof imageValue !== "string")) {
    errors.push({ field: "image", message: "Product image URL is required." });
  }

  if (shouldValidateImage && imageValue) {
    if (typeof imageValue !== "string" || !isHttpUrl(imageValue)) {
      errors.push({
        field: "image",
        message: "Product image must be a valid HTTP(S) URL.",
      });
    } else if (!isAllowedImageHost(imageValue)) {
      errors.push({
        field: "image",
        message: "Product image URL must belong to the configured S3 bucket.",
      });
    }
  }

  if (shouldValidateOtherImages) {
    const otherImages = Array.isArray(payload.otherImages)
      ? payload.otherImages
      : [];

    if (otherImages.length > MAX_OTHER_IMAGES) {
      errors.push({
        field: "otherImages",
        message: `You can upload at most ${MAX_OTHER_IMAGES} additional images.`,
      });
    }

    otherImages.forEach((item, index) => {
      if (!isHttpUrl(item)) {
        errors.push({
          field: `otherImages[${index}]`,
          message: "Each additional image must be a valid HTTP(S) URL.",
        });
        return;
      }

      if (!isAllowedImageHost(item)) {
        errors.push({
          field: `otherImages[${index}]`,
          message:
            "Additional image URLs must belong to the configured S3 bucket.",
        });
      }
    });
  }

  return errors;
};

const normalizePayload = (body = {}) => ({
  ...body,
  ...(body.image !== undefined ? { image: String(body.image).trim() } : {}),
  ...(body.otherImages !== undefined
    ? { otherImages: normalizeImageListField(body.otherImages) }
    : {}),
  ...(body.certifications !== undefined
    ? { certifications: normalizeListField(body.certifications) }
    : {}),
  ...(body.exportMarkets !== undefined
    ? { exportMarkets: normalizeListField(body.exportMarkets) }
    : {}),
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
  const hasOtherImages =
    Array.isArray(payload.otherImages) && payload.otherImages.length > 0;

  return (
    hasStringValue || hasCertifications || hasExportMarkets || hasOtherImages
  );
};

const sanitizeFileName = (name = "") => {
  const trimmed = String(name).trim();
  if (!trimmed) return "upload";

  return trimmed
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]/g, "");
};

class ProductController {
  // POST /api/v1/products/upload-url
  static async generateUploadUrl(req, res, next) {
    try {
      const { fileName, fileType } = req.body || {};

      if (!fileName || !fileType) {
        return res.status(400).json({
          success: false,
          message: "fileName and fileType are required.",
        });
      }

      if (!s3BucketName) {
        return res.status(500).json({
          success: false,
          message: "S3 bucket is not configured on the server.",
        });
      }

      const safeName = sanitizeFileName(fileName);
      const objectKey = `products/${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${safeName}`;

      const command = new PutObjectCommand({
        Bucket: s3BucketName,
        Key: objectKey,
        ContentType: fileType,
      });

      const uploadUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 60,
      });

      const fileUrl = `https://${s3BucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${objectKey}`;

      res.json({
        success: true,
        data: {
          uploadUrl,
          fileUrl,
          key: objectKey,
          expiresIn: 60,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/products
  static async getAllProducts(req, res, next) {
    try {
      const { search = "", status } = req.query;
      const isStaffOrAdmin =
        req.user?.isAdmin === true || req.user?.isStaff === true;

      const query = {};

      const trimmedSearch = String(search || "").trim();
      if (trimmedSearch) {
        query.name = { $regex: trimmedSearch, $options: "i" };
      }

      if (status !== undefined && status !== "") {
        if (!isStaffOrAdmin) {
          return res.status(403).json({
            success: false,
            message: "Status filter is only available to staff or admin users.",
          });
        }

        const normalizedStatus = String(status).trim().toLowerCase();
        if (normalizedStatus === "published") {
          query.isPublished = true;
        } else if (normalizedStatus === "draft") {
          query.isPublished = false;
        } else if (normalizedStatus === "all") {
          // no status filter
        } else {
          return res.status(400).json({
            success: false,
            message: "Invalid status filter. Use published, draft, or all.",
          });
        }
      } else if (!isStaffOrAdmin) {
        query.isPublished = true;
      }

      const products = await Product.find(query).sort({ createdAt: -1 });
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
      const imageErrors = validateImageFields(payload, {
        requireImage: false,
        validateAllImageFields: false,
      });

      if (imageErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid image fields.",
          invalidFields: imageErrors,
        });
      }

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
      const imageErrors = validateImageFields(payload, {
        requireImage: true,
        validateAllImageFields: true,
      });

      if (imageErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid image fields.",
          invalidFields: imageErrors,
        });
      }

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
      const previousImageUrls = getImageUrlList(existingProduct.toObject());

      const nextIsPublished =
        payload.isPublished !== undefined
          ? payload.isPublished === true
          : existingProduct.isPublished === true;
      const isPublishingNow =
        existingProduct.isPublished !== true && nextIsPublished === true;

      const imageValidationTarget =
        nextIsPublished && isPublishingNow ? mergedData : payload;
      const imageErrors = validateImageFields(imageValidationTarget, {
        requireImage: isPublishingNow,
        validateAllImageFields: isPublishingNow,
      });

      if (imageErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid image fields.",
          invalidFields: imageErrors,
        });
      }

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

      const currentImageUrls = getImageUrlList(product.toObject());
      const obsoleteImageUrls = previousImageUrls.filter(
        (url) => !currentImageUrls.includes(url),
      );
      const obsoleteKeys = obsoleteImageUrls
        .map((url) => getObjectKeyFromUrl(url))
        .filter(Boolean);

      try {
        await deleteS3ObjectsByKeys(obsoleteKeys);
      } catch (cleanupError) {
        await LogService.createLog({
          action: "product.image.cleanup",
          entityType: "product",
          entityId: product.id,
          message: `Failed image cleanup for product \"${product.name}\"`,
          actorUserId: req.user?.id,
          actorEmail: req.user?.emailAddress,
          status: "failure",
          metadata: {
            obsoleteKeys,
            error: cleanupError.message,
          },
        });
      }

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
      const previousImageUrls = getImageUrlList(existingProduct.toObject());
      const imageErrors = validateImageFields(mergedData, {
        requireImage: true,
        validateAllImageFields: true,
      });

      if (imageErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid image fields.",
          invalidFields: imageErrors,
        });
      }

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

      const currentImageUrls = getImageUrlList(product.toObject());
      const obsoleteImageUrls = previousImageUrls.filter(
        (url) => !currentImageUrls.includes(url),
      );
      const obsoleteKeys = obsoleteImageUrls
        .map((url) => getObjectKeyFromUrl(url))
        .filter(Boolean);

      try {
        await deleteS3ObjectsByKeys(obsoleteKeys);
      } catch (cleanupError) {
        await LogService.createLog({
          action: "product.image.cleanup",
          entityType: "product",
          entityId: product.id,
          message: `Failed image cleanup for product \"${product.name}\"`,
          actorUserId: req.user?.id,
          actorEmail: req.user?.emailAddress,
          status: "failure",
          metadata: {
            obsoleteKeys,
            error: cleanupError.message,
          },
        });
      }

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

  // PATCH /api/v1/products/:id/unpublish
  static async unpublishProduct(req, res, next) {
    try {
      const existingProduct = await Product.findById(req.params.id);

      if (!existingProduct) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }

      if (existingProduct.isPublished !== true) {
        return res.status(400).json({
          success: false,
          message: "Product is already a draft.",
        });
      }

      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { $set: { isPublished: false } },
        { new: true, runValidators: true },
      );

      await LogService.createLog({
        action: "product.unpublish",
        entityType: "product",
        entityId: product.id,
        message: `Product \"${product.name}\" unpublished by ${req.user?.emailAddress || "unknown"}`,
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
