import { useEffect, useState } from "react";

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

const ProductFormModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState(initialProductForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const requiredFields = [
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

  const validate = () => {
    const nextErrors = {};

    requiredFields.forEach((field) => {
      if (!formData[field].trim()) {
        nextErrors[field] = "This field is required.";
      }
    });

    if (formData.image.trim() && !/^https?:\/\/|^\//i.test(formData.image.trim())) {
      nextErrors.image = "Enter a valid image URL or absolute path.";
    }

    if (
      formData.exportMarkets.trim() &&
      formData.exportMarkets
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

  const handleSubmit = (event) => {
    event.preventDefault();
    validate();
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="admin-modal-header">
          <div>
            <h3 className="admin-modal-title">Add Product</h3>
            <p className="admin-modal-subtitle">
              Fill in the product information. Submission wiring comes next.
            </p>
          </div>
          <button type="button" className="admin-modal-close" onClick={onClose} aria-label="Close">
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <form className="admin-form-grid" onSubmit={handleSubmit} noValidate>
          <div className="admin-form-group admin-form-group-full">
            <label htmlFor="product-name" className="admin-form-label">Name *</label>
            <input id="product-name" name="name" className={`admin-form-control ${errors.name ? "is-invalid" : ""}`} value={formData.name} onChange={handleChange} placeholder="Eg Premium Arabica Coffee" />
            {errors.name && <p className="admin-form-error">{errors.name}</p>}
          </div>

          <div className="admin-form-group admin-form-group-full">
            <label htmlFor="product-description" className="admin-form-label">Description *</label>
            <textarea id="product-description" name="description" rows="3" className={`admin-form-control ${errors.description ? "is-invalid" : ""}`} value={formData.description} onChange={handleChange} placeholder="Eg Rich, smooth flavor with chocolate notes"></textarea>
            {errors.description && <p className="admin-form-error">{errors.description}</p>}
          </div>

          <div className="admin-form-group admin-form-group-full">
            <label htmlFor="product-image" className="admin-form-label">Product Image *</label>
            <input id="product-image" name="image" type="file" accept="image/*" className={`admin-form-control ${errors.image ? "is-invalid" : ""}`} onChange={handleChange} />
            {formData.image && <p className="admin-form-info" style={{ fontSize: "0.85rem", color: "#666", margin: "0.4rem 0 0" }}>Selected: {formData.image.name}</p>}
            {errors.image && <p className="admin-form-error">{errors.image}</p>}
          </div>

          <div className="admin-form-group admin-form-group-full">
            <label htmlFor="product-longDescription" className="admin-form-label">Long Description (Optional)</label>
            <textarea id="product-longDescription" name="longDescription" rows="4" className="admin-form-control" value={formData.longDescription} onChange={handleChange} placeholder="Eg Sourced from high altitude farms in the region..."></textarea>
          </div>

          <div className="admin-form-group">
            <label htmlFor="product-origin" className="admin-form-label">Origin *</label>
            <input id="product-origin" name="origin" className={`admin-form-control ${errors.origin ? "is-invalid" : ""}`} value={formData.origin} onChange={handleChange} placeholder="Eg Colombia" />
            {errors.origin && <p className="admin-form-error">{errors.origin}</p>}
          </div>

          <div className="admin-form-group">
            <label htmlFor="product-grade" className="admin-form-label">Grade *</label>
            <input id="product-grade" name="grade" className={`admin-form-control ${errors.grade ? "is-invalid" : ""}`} value={formData.grade} onChange={handleChange} placeholder="Eg Grade A" />
            {errors.grade && <p className="admin-form-error">{errors.grade}</p>}
          </div>

          <div className="admin-form-group">
            <label htmlFor="product-moisture" className="admin-form-label">Moisture (Optional)</label>
            <input id="product-moisture" name="moisture" className="admin-form-control" value={formData.moisture} onChange={handleChange} placeholder="Eg Max 5%" />
          </div>

          <div className="admin-form-group">
            <label htmlFor="product-minOrder" className="admin-form-label">Minimum Order *</label>
            <input id="product-minOrder" name="minOrder" className={`admin-form-control ${errors.minOrder ? "is-invalid" : ""}`} value={formData.minOrder} onChange={handleChange} placeholder="Eg 500kg" />
            {errors.minOrder && <p className="admin-form-error">{errors.minOrder}</p>}
          </div>

          <div className="admin-form-group">
            <label htmlFor="product-packaging" className="admin-form-label">Packaging *</label>
            <input id="product-packaging" name="packaging" className={`admin-form-control ${errors.packaging ? "is-invalid" : ""}`} value={formData.packaging} onChange={handleChange} placeholder="Eg 1kg bags" />
            {errors.packaging && <p className="admin-form-error">{errors.packaging}</p>}
          </div>

          <div className="admin-form-group">
            <label htmlFor="product-shelfLife" className="admin-form-label">Shelf Life *</label>
            <input id="product-shelfLife" name="shelfLife" className={`admin-form-control ${errors.shelfLife ? "is-invalid" : ""}`} value={formData.shelfLife} onChange={handleChange} placeholder="Eg 24 months" />
            {errors.shelfLife && <p className="admin-form-error">{errors.shelfLife}</p>}
          </div>

          <div className="admin-form-group admin-form-group-full">
            <label htmlFor="product-certifications" className="admin-form-label">Certifications (Optional)</label>
            <input id="product-certifications" name="certifications" className="admin-form-control" value={formData.certifications} onChange={handleChange} placeholder="Eg Fair Trade, Organic (comma separated)" />
          </div>

          <div className="admin-form-group admin-form-group-full">
            <label htmlFor="product-exportMarkets" className="admin-form-label">Export Markets *</label>
            <input id="product-exportMarkets" name="exportMarkets" className={`admin-form-control ${errors.exportMarkets ? "is-invalid" : ""}`} value={formData.exportMarkets} onChange={handleChange} placeholder="Eg USA, Canada, Mexico (comma separated)" />
            {errors.exportMarkets && <p className="admin-form-error">{errors.exportMarkets}</p>}
          </div>

          <div className="admin-form-group admin-form-group-full">
            <label htmlFor="product-availability" className="admin-form-label">Availability *</label>
            <input id="product-availability" name="availability" className={`admin-form-control ${errors.availability ? "is-invalid" : ""}`} value={formData.availability} onChange={handleChange} placeholder="Eg In stock" />
            {errors.availability && <p className="admin-form-error">{errors.availability}</p>}
          </div>

          <div className="admin-form-actions admin-form-group-full">
            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-brand-primary">Save Product</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;
