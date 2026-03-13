import { useEffect, useMemo, useState } from "react";
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

  return hasStringValue || hasCertifications || hasExportMarkets;
};

const ProductFormModal = ({ isOpen, onClose, onSuccess, product = null }) => {
  const [formData, setFormData] = useState(initialProductForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDraftConfirm, setShowDraftConfirm] = useState(false);
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
    } else {
      setFormData(initialProductForm);
    }

    setErrors({});
    setShowDraftConfirm(false);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, isEditMode, product]);

  const imageValue = useMemo(() => {
    if (formData.image && typeof formData.image === "object") {
      return formData.image.name || "";
    }

    return isEditMode ? product?.image || "" : "";
  }, [formData.image, isEditMode, product]);

  if (!isOpen) return null;

  const hasAnyInput = () => {
    if (formData.image) return true;

    return Object.entries(formData).some(([key, value]) => {
      if (key === "image") return false;
      return typeof value === "string" && value.trim().length > 0;
    });
  };

  const buildPayload = () => ({
    name: formData.name.trim(),
    description: formData.description.trim(),
    image: imageValue,
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

  const closeModal = () => {
    setShowDraftConfirm(false);
    onClose();
  };

  const saveDraft = async () => {
    if (isSubmitting) return;

    const payload = buildPayload();
    if (!hasAtLeastOneDraftField(payload)) {
      toast.error("Draft must contain at least one product field.");
      return;
    }

    setIsSubmitting(true);

    try {
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
    if (!validateForPublish()) return;

    setIsSubmitting(true);

    try {
      const payload = buildPayload();

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
            <input
              id="product-image"
              name="image"
              type="file"
              accept="image/*"
              className={`admin-form-control ${errors.image ? "is-invalid" : ""}`}
              onChange={handleChange}
            />
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
          <div className="admin-modal-overlay" onClick={() => setShowDraftConfirm(false)}>
            <div className="admin-modal-card admin-modal-card-sm" onClick={(event) => event.stopPropagation()}>
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
