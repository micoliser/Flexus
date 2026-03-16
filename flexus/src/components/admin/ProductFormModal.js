import axios from "axios";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/api";

const initialProductForm = {
  name: "",
  description: "",
  image: null,
  longDescription: "",
  origin: "",
  grade: "",
  moisture: "",
  minOrder: "",
  packaging: "",
  shelfLife: "",
  certifications: "",
  exportMarkets: "",
  availability: "",
};

const PUBLISH_REQUIRED_FIELDS = [
  "name",
  "description",
  "image",
  "origin",
  "grade",
  "minOrder",
  "packaging",
  "shelfLife",
  "exportMarkets",
  "availability",
];

const getProductId = (product) => product?.id || product?._id;
const MAX_OTHER_IMAGES = 10;
const MAX_IMAGE_FILE_SIZE_BYTES = 5 * 1024 * 1024;

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
    typeof payload.certifications === "string" &&
    payload.certifications
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean).length > 0;

  const hasExportMarkets =
    typeof payload.exportMarkets === "string" &&
    payload.exportMarkets
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean).length > 0;

  const hasOtherImages =
    Array.isArray(payload.otherImages) && payload.otherImages.length > 0;

  return (
    hasStringValue || hasCertifications || hasExportMarkets || hasOtherImages
  );
};

const ProductFormModal = ({ isOpen, onClose, onSuccess, product = null }) => {
  const [formData, setFormData] = useState(initialProductForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDraftConfirm, setShowDraftConfirm] = useState(false);
  const [existingOtherImages, setExistingOtherImages] = useState([]);
  const [otherImageFiles, setOtherImageFiles] = useState([]);
  const [mainImagePreviewUrl, setMainImagePreviewUrl] = useState("");
  const mainImageInputRef = useRef(null);
  const isEditMode = !!product;

  useEffect(() => {
    if (!isOpen) return undefined;

    if (isEditMode) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        image: null,
        longDescription: product.longDescription || "",
        origin: product.origin || "",
        grade: product.grade || "",
        moisture: product.moisture || "",
        minOrder: product.minOrder || "",
        packaging: product.packaging || "",
        shelfLife: product.shelfLife || "",
        certifications: Array.isArray(product.certifications)
          ? product.certifications.join(", ")
          : "",
        exportMarkets: Array.isArray(product.exportMarkets)
          ? product.exportMarkets.join(", ")
          : "",
        availability: product.availability || "",
      });
      setExistingOtherImages(
        Array.isArray(product.otherImages)
          ? product.otherImages
              .map((item) => String(item).trim())
              .filter(Boolean)
          : [],
      );
      setOtherImageFiles([]);
      setMainImagePreviewUrl(product.image || "");
    } else {
      setFormData(initialProductForm);
      setExistingOtherImages([]);
      setOtherImageFiles([]);
      setMainImagePreviewUrl("");
    }

    setErrors({});
    setShowDraftConfirm(false);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, isEditMode, product]);

  useEffect(() => {
    if (!isOpen) return undefined;

    if (formData.image && typeof formData.image === "object") {
      const objectUrl = URL.createObjectURL(formData.image);
      setMainImagePreviewUrl(objectUrl);

      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }

    if (isEditMode && product?.image) {
      setMainImagePreviewUrl(product.image);
      return undefined;
    }

    setMainImagePreviewUrl("");
    return undefined;
  }, [formData.image, isEditMode, isOpen, product]);

  const imageValue = useMemo(() => {
    if (formData.image && typeof formData.image === "object") {
      return formData.image.name || "";
    }

    return isEditMode ? product?.image || "" : "";
  }, [formData.image, isEditMode, product]);

  if (!isOpen) return null;

  const hasAnyInput = () => {
    if (formData.image) return true;
    if (otherImageFiles.some(Boolean)) return true;

    return Object.entries(formData).some(([key, value]) => {
      if (key === "image") return false;
      return typeof value === "string" && value.trim().length > 0;
    });
  };

  const buildPayload = ({ imageOverride, otherImagesOverride } = {}) => ({
    name: formData.name.trim(),
    description: formData.description.trim(),
    image: imageOverride !== undefined ? imageOverride : imageValue,
    otherImages:
      otherImagesOverride !== undefined
        ? otherImagesOverride
        : [
            ...existingOtherImages,
            ...otherImageFiles
              .map((file) =>
                file && typeof file === "object" ? file.name : "",
              )
              .filter(Boolean),
          ],
    longDescription: formData.longDescription.trim(),
    origin: formData.origin.trim(),
    grade: formData.grade.trim(),
    moisture: formData.moisture.trim(),
    minOrder: formData.minOrder.trim(),
    packaging: formData.packaging.trim(),
    shelfLife: formData.shelfLife.trim(),
    certifications: formData.certifications,
    exportMarkets: formData.exportMarkets,
    availability: formData.availability.trim(),
  });

  const validateForPublish = () => {
    const payload = buildPayload();
    const nextErrors = {};

    PUBLISH_REQUIRED_FIELDS.forEach((field) => {
      if (!payload[field]) {
        nextErrors[field] = "This field is required.";
      }
    });

    if (
      payload.exportMarkets &&
      payload.exportMarkets
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean).length === 0
    ) {
      nextErrors.exportMarkets = "Enter at least one export market.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = ({ target }) => {
    const { name, value, type, files } = target;
    const newValue = type === "file" ? (files && files[0]) || null : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const totalOtherImages = existingOtherImages.length + otherImageFiles.length;
  const remainingOtherImages = Math.max(0, MAX_OTHER_IMAGES - totalOtherImages);

  const handleAddOtherImageField = () => {
    if (totalOtherImages >= MAX_OTHER_IMAGES) {
      setErrors((prev) => ({ ...prev, otherImages: "Max limit reached" }));
      toast.error("Max limit reached");
      return;
    }

    setOtherImageFiles((prev) => [...prev, null]);
    if (errors.otherImages) {
      setErrors((prev) => ({ ...prev, otherImages: "" }));
    }
  };

  const handleOtherImageFileChange = (index, file) => {
    setOtherImageFiles((prev) => {
      const next = [...prev];
      next[index] = file;
      return next;
    });

    if (errors.otherImages) {
      setErrors((prev) => ({ ...prev, otherImages: "" }));
    }
  };

  const handleRemoveExistingOtherImage = (imageToRemove) => {
    setExistingOtherImages((prev) =>
      prev.filter((image) => image !== imageToRemove),
    );

    if (errors.otherImages) {
      setErrors((prev) => ({ ...prev, otherImages: "" }));
    }
  };

  const openMainImagePicker = () => {
    mainImageInputRef.current?.click();
  };

  const handleRemoveOtherImageField = (index) => {
    setOtherImageFiles((prev) =>
      prev.filter((_, currentIndex) => currentIndex !== index),
    );

    if (errors.otherImages) {
      setErrors((prev) => ({ ...prev, otherImages: "" }));
    }
  };

  const validateUploadedImages = () => {
    const nextErrors = {};

    if (formData.image && typeof formData.image === "object") {
      if (!formData.image.type?.startsWith("image/")) {
        nextErrors.image = "Product image must be an image file.";
      } else if (formData.image.size > MAX_IMAGE_FILE_SIZE_BYTES) {
        nextErrors.image = "Product image must not be more than 5MB.";
      }
    }

    const invalidOtherImage = otherImageFiles.find((file) => {
      if (!file || typeof file !== "object") return false;
      if (!file.type?.startsWith("image/")) return true;
      if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) return true;
      return false;
    });

    if (invalidOtherImage) {
      if (!invalidOtherImage.type?.startsWith("image/")) {
        nextErrors.otherImages = "Each uploaded image must be an image file.";
      } else {
        nextErrors.otherImages =
          "Each uploaded image must not be more than 5MB.";
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...nextErrors }));
      toast.error(nextErrors.image || nextErrors.otherImages);
      return false;
    }

    return true;
  };

  const requestProductUploadUrl = async ({ fileName, fileType }) => {
    const { data } = await api.post("/products/upload-url", {
      fileName,
      fileType,
    });

    return data?.data;
  };

  const uploadFileToPresignedUrl = async ({ uploadUrl, file, fileType }) => {
    await axios.put(uploadUrl, file, {
      headers: {
        "Content-Type": fileType,
      },
    });
  };

  const uploadSelectedImagesToS3 = async () => {
    let mainImageUrl;
    const otherImageUrls = [];

    if (formData.image && typeof formData.image === "object") {
      const uploadTarget = await requestProductUploadUrl({
        fileName: formData.image.name,
        fileType: formData.image.type,
      });

      await uploadFileToPresignedUrl({
        uploadUrl: uploadTarget.uploadUrl,
        file: formData.image,
        fileType: formData.image.type,
      });

      mainImageUrl = uploadTarget.fileUrl;
    }

    const newOtherImageFiles = otherImageFiles.filter(
      (file) => file && typeof file === "object",
    );

    for (const file of newOtherImageFiles) {
      const uploadTarget = await requestProductUploadUrl({
        fileName: file.name,
        fileType: file.type,
      });

      await uploadFileToPresignedUrl({
        uploadUrl: uploadTarget.uploadUrl,
        file,
        fileType: file.type,
      });

      otherImageUrls.push(uploadTarget.fileUrl);
    }

    return {
      mainImageUrl,
      otherImageUrls,
    };
  };

  const closeModal = () => {
    setShowDraftConfirm(false);
    onClose();
  };

  const saveDraft = async () => {
    if (isSubmitting) return;
    if (!validateUploadedImages()) return;

    const payload = buildPayload();
    if (!hasAtLeastOneDraftField(payload)) {
      toast.error("Draft must contain at least one product field.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { mainImageUrl, otherImageUrls } = await uploadSelectedImagesToS3();

      const payload = buildPayload({
        imageOverride: mainImageUrl !== undefined ? mainImageUrl : imageValue,
        otherImagesOverride: [...existingOtherImages, ...otherImageUrls],
      });

      if (isEditMode) {
        const productId = getProductId(product);
        await api.put(`/products/${productId}`, {
          ...payload,
          isPublished: product.isPublished === true,
        });
        toast.success("Draft updated successfully.");
      } else {
        await api.post("/products/draft", payload);
        toast.success("Draft saved successfully.");
      }

      onSuccess();
      setFormData(initialProductForm);
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save draft.");
    } finally {
      setIsSubmitting(false);
      setShowDraftConfirm(false);
    }
  };

  const publishProduct = async () => {
    if (isSubmitting) return;
    if (!validateUploadedImages()) return;
    if (!validateForPublish()) return;

    setIsSubmitting(true);

    try {
      const { mainImageUrl, otherImageUrls } = await uploadSelectedImagesToS3();

      const payload = buildPayload({
        imageOverride: mainImageUrl !== undefined ? mainImageUrl : imageValue,
        otherImagesOverride: [...existingOtherImages, ...otherImageUrls],
      });

      if (isEditMode) {
        const productId = getProductId(product);
        if (product.isPublished) {
          await api.put(`/products/${productId}`, {
            ...payload,
            isPublished: true,
          });
          toast.success("Product updated successfully.");
        } else {
          await api.patch(`/products/${productId}/publish`, payload);
          toast.success("Draft published successfully.");
        }
      } else {
        await api.post("/products", payload);
        toast.success("Product published successfully.");
      }

      onSuccess();
      closeModal();
    } catch (error) {
      const missingFields = error.response?.data?.missingFields;
      if (Array.isArray(missingFields) && missingFields.length > 0) {
        toast.error(`Missing required fields: ${missingFields.join(", ")}`);
      } else {
        toast.error(
          error.response?.data?.message || "Failed to publish product.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (!isEditMode && hasAnyInput()) {
      setShowDraftConfirm(true);
      return;
    }
    closeModal();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isEditMode && !product?.isPublished) {
      saveDraft();
      return;
    }
    publishProduct();
  };

  return (
    <div className="admin-modal-overlay" onClick={handleCancel}>
      <div
        className="admin-modal-card"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="admin-modal-header">
          <div>
            <h3 className="admin-modal-title">
              {isEditMode ? "Manage Product" : "Add Product"}
            </h3>
            <p className="admin-modal-subtitle">
              {isEditMode
                ? "Update details, save draft, or publish this product."
                : "Fill all required fields to publish immediately, or save draft to complete later."}
            </p>
          </div>
          <button
            type="button"
            className="admin-modal-close"
            onClick={handleCancel}
            aria-label="Close"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <form className="admin-form-grid" onSubmit={handleSubmit} noValidate>
          <div className="admin-form-group admin-form-group-full">
            <label htmlFor="product-name" className="admin-form-label">
              Name *
            </label>
            <input
              id="product-name"
              name="name"
              className={`admin-form-control ${errors.name ? "is-invalid" : ""}`}
              value={formData.name}
              onChange={handleChange}
              placeholder="Eg Premium Arabica Coffee"
            />
            {errors.name && <p className="admin-form-error">{errors.name}</p>}
          </div>

          <div className="admin-form-group admin-form-group-full">
            <label htmlFor="product-description" className="admin-form-label">
              Description *
            </label>
            <textarea
              id="product-description"
              name="description"
              rows="3"
              className={`admin-form-control ${errors.description ? "is-invalid" : ""}`}
              value={formData.description}
              onChange={handleChange}
              placeholder="Eg Rich, smooth flavor with chocolate notes"
            ></textarea>
            {errors.description && (
              <p className="admin-form-error">{errors.description}</p>
            )}
          </div>

          <div className="admin-form-group admin-form-group-full">
            <label htmlFor="product-image" className="admin-form-label">
              Product Image *
            </label>
            {isEditMode ? (
              <div className="admin-image-panel">
                <input
                  ref={mainImageInputRef}
                  id="product-image"
                  name="image"
                  type="file"
                  accept="image/*"
                  className={`admin-form-control ${errors.image ? "is-invalid" : ""}`}
                  onChange={handleChange}
                  style={{ display: "none" }}
                />

                {mainImagePreviewUrl ? (
                  <div className="admin-image-preview-card">
                    <img
                      src={mainImagePreviewUrl}
                      alt={formData.name || product?.name || "Product image"}
                      className="admin-image-preview"
                    />
                    <div className="admin-image-preview-meta">
                      <p className="admin-image-preview-label">
                        {formData.image
                          ? "Selected replacement image"
                          : "Current saved image"}
                      </p>
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={openMainImagePicker}
                        disabled={isSubmitting}
                      >
                        Change Image
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="admin-image-empty-state">
                    <p className="admin-form-info mb-2">
                      No image selected yet.
                    </p>
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={openMainImagePicker}
                      disabled={isSubmitting}
                    >
                      Select Image
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <input
                id="product-image"
                name="image"
                type="file"
                accept="image/*"
                className={`admin-form-control ${errors.image ? "is-invalid" : ""}`}
                onChange={handleChange}
              />
            )}
            {!!imageValue && (
              <p className="admin-form-info">Selected: {imageValue}</p>
            )}
            {errors.image && <p className="admin-form-error">{errors.image}</p>}
          </div>

          <div className="admin-form-group admin-form-group-full">
            <label
              htmlFor="product-longDescription"
              className="admin-form-label"
            >
              Long Description (Optional)
            </label>
            <textarea
              id="product-longDescription"
              name="longDescription"
              rows="4"
              className="admin-form-control"
              value={formData.longDescription}
              onChange={handleChange}
              placeholder="Eg Sourced from high altitude farms in the region..."
            ></textarea>
          </div>

          <div className="admin-form-group admin-form-group-full">
            <div className="d-flex align-items-center justify-content-between gap-2">
              <label className="admin-form-label mb-0">
                Other Images (Optional)
              </label>
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={handleAddOtherImageField}
                disabled={isSubmitting}
                aria-label="Add other image field"
              >
                <i className="bi bi-plus-lg me-1"></i>
                Add Image
              </button>
            </div>

            <p className="admin-form-info mb-2">
              Max {MAX_OTHER_IMAGES} images. {remainingOtherImages} slot
              {remainingOtherImages === 1 ? "" : "s"} remaining.
            </p>

            {existingOtherImages.length > 0 && (
              <div className="admin-existing-images-grid mb-2">
                {existingOtherImages.map((imageUrl, index) => (
                  <article
                    key={`${imageUrl}-${index}`}
                    className="admin-existing-image-card"
                  >
                    <img
                      src={imageUrl}
                      alt={`Saved product ${index + 1}`}
                      className="admin-existing-image-preview"
                    />
                    <div className="admin-existing-image-actions">
                      <span className="admin-form-info">
                        Saved image {index + 1}
                      </span>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleRemoveExistingOtherImage(imageUrl)}
                        disabled={isSubmitting}
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {isEditMode && existingOtherImages.length > 0 && (
              <p className="admin-form-info mb-2">
                Deleted saved images are only removed after you save or publish
                this product.
              </p>
            )}

            {otherImageFiles.length === 0 && (
              <p className="admin-form-info mb-0">
                Click + to add image upload fields.
              </p>
            )}

            {otherImageFiles.map((file, index) => (
              <div
                key={`other-image-${index}`}
                className="d-flex align-items-center gap-2 mb-2"
              >
                <input
                  name={`otherImageFile-${index}`}
                  type="file"
                  accept="image/*"
                  className="admin-form-control"
                  onChange={(event) =>
                    handleOtherImageFileChange(
                      index,
                      (event.target.files && event.target.files[0]) || null,
                    )
                  }
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => handleRemoveOtherImageField(index)}
                  disabled={isSubmitting}
                  aria-label="Remove other image field"
                >
                  <i className="bi bi-dash-lg"></i>
                </button>
                {file?.name && (
                  <span className="small text-muted">{file.name}</span>
                )}
              </div>
            ))}

            {errors.otherImages && (
              <p className="admin-form-error mb-0">{errors.otherImages}</p>
            )}
          </div>

          <div className="admin-form-group">
            <label htmlFor="product-origin" className="admin-form-label">
              Origin *
            </label>
            <input
              id="product-origin"
              name="origin"
              className={`admin-form-control ${errors.origin ? "is-invalid" : ""}`}
              value={formData.origin}
              onChange={handleChange}
              placeholder="Eg Colombia"
            />
            {errors.origin && (
              <p className="admin-form-error">{errors.origin}</p>
            )}
          </div>

          <div className="admin-form-group">
            <label htmlFor="product-grade" className="admin-form-label">
              Grade *
            </label>
            <input
              id="product-grade"
              name="grade"
              className={`admin-form-control ${errors.grade ? "is-invalid" : ""}`}
              value={formData.grade}
              onChange={handleChange}
              placeholder="Eg Grade A"
            />
            {errors.grade && <p className="admin-form-error">{errors.grade}</p>}
          </div>

          <div className="admin-form-group">
            <label htmlFor="product-moisture" className="admin-form-label">
              Moisture (Optional)
            </label>
            <input
              id="product-moisture"
              name="moisture"
              className="admin-form-control"
              value={formData.moisture}
              onChange={handleChange}
              placeholder="Eg Max 5%"
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="product-minOrder" className="admin-form-label">
              Minimum Order *
            </label>
            <input
              id="product-minOrder"
              name="minOrder"
              className={`admin-form-control ${errors.minOrder ? "is-invalid" : ""}`}
              value={formData.minOrder}
              onChange={handleChange}
              placeholder="Eg 500kg"
            />
            {errors.minOrder && (
              <p className="admin-form-error">{errors.minOrder}</p>
            )}
          </div>

          <div className="admin-form-group">
            <label htmlFor="product-packaging" className="admin-form-label">
              Packaging *
            </label>
            <input
              id="product-packaging"
              name="packaging"
              className={`admin-form-control ${errors.packaging ? "is-invalid" : ""}`}
              value={formData.packaging}
              onChange={handleChange}
              placeholder="Eg 1kg bags"
            />
            {errors.packaging && (
              <p className="admin-form-error">{errors.packaging}</p>
            )}
          </div>

          <div className="admin-form-group">
            <label htmlFor="product-shelfLife" className="admin-form-label">
              Shelf Life *
            </label>
            <input
              id="product-shelfLife"
              name="shelfLife"
              className={`admin-form-control ${errors.shelfLife ? "is-invalid" : ""}`}
              value={formData.shelfLife}
              onChange={handleChange}
              placeholder="Eg 24 months"
            />
            {errors.shelfLife && (
              <p className="admin-form-error">{errors.shelfLife}</p>
            )}
          </div>

          <div className="admin-form-group admin-form-group-full">
            <label
              htmlFor="product-certifications"
              className="admin-form-label"
            >
              Certifications (Optional)
            </label>
            <input
              id="product-certifications"
              name="certifications"
              className="admin-form-control"
              value={formData.certifications}
              onChange={handleChange}
              placeholder="Eg Fair Trade, Organic (comma separated)"
            />
          </div>

          <div className="admin-form-group admin-form-group-full">
            <label htmlFor="product-exportMarkets" className="admin-form-label">
              Export Markets *
            </label>
            <input
              id="product-exportMarkets"
              name="exportMarkets"
              className={`admin-form-control ${errors.exportMarkets ? "is-invalid" : ""}`}
              value={formData.exportMarkets}
              onChange={handleChange}
              placeholder="Eg USA, Canada, Mexico (comma separated)"
            />
            {errors.exportMarkets && (
              <p className="admin-form-error">{errors.exportMarkets}</p>
            )}
          </div>

          <div className="admin-form-group admin-form-group-full">
            <label htmlFor="product-availability" className="admin-form-label">
              Availability *
            </label>
            <input
              id="product-availability"
              name="availability"
              className={`admin-form-control ${errors.availability ? "is-invalid" : ""}`}
              value={formData.availability}
              onChange={handleChange}
              placeholder="Eg In stock"
            />
            {errors.availability && (
              <p className="admin-form-error">{errors.availability}</p>
            )}
          </div>

          <div className="admin-form-actions admin-form-group-full">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>

            {!isEditMode && (
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => saveDraft()}
                disabled={isSubmitting}
              >
                Save Draft
              </button>
            )}

            {isEditMode && !product?.isPublished && (
              <button
                type="button"
                className="btn btn-brand-secondary"
                onClick={publishProduct}
                disabled={isSubmitting}
              >
                Publish Draft
              </button>
            )}

            <button
              type="submit"
              className="btn btn-brand-primary"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Please wait..."
                : isEditMode
                  ? product?.isPublished
                    ? "Update Product"
                    : "Update Draft"
                  : "Publish Product"}
            </button>
          </div>
        </form>

        {showDraftConfirm && (
          <div
            className="admin-modal-overlay"
            onClick={() => setShowDraftConfirm(false)}
          >
            <div
              className="admin-modal-card admin-modal-card-sm"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="admin-modal-header">
                <div>
                  <h3 className="admin-modal-title">Save Draft?</h3>
                  <p className="admin-modal-subtitle">
                    Save this product as draft before closing?
                  </p>
                </div>
                <button
                  type="button"
                  className="admin-modal-close"
                  onClick={() => setShowDraftConfirm(false)}
                  aria-label="Close"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>

              <div className="admin-confirm-actions">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowDraftConfirm(false)}
                  disabled={isSubmitting}
                >
                  Go Back
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={closeModal}
                  disabled={isSubmitting}
                >
                  No
                </button>
                <button
                  type="button"
                  className="btn btn-brand-primary"
                  onClick={saveDraft}
                  disabled={isSubmitting}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductFormModal;
