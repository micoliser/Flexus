import { useState } from "react";
import ProductFormModal from "./ProductFormModal";

const ProductsPanel = () => {
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);

  return (
    <section className="admin-panel-content">
      <div className="admin-panel-header">
        <h2 className="admin-panel-title">Products</h2>
        <button className="btn btn-brand-primary" onClick={() => setIsProductFormOpen(true)}>
          Add Product
        </button>
      </div>

      <div className="admin-stats-grid">
        <article className="admin-stat-card">
          <p className="admin-stat-label">Total Products</p>
          <h3 className="admin-stat-value">48</h3>
        </article>
        <article className="admin-stat-card">
          <p className="admin-stat-label">Out of Stock</p>
          <h3 className="admin-stat-value">5</h3>
        </article>
        <article className="admin-stat-card">
          <p className="admin-stat-label">Updated Today</p>
          <h3 className="admin-stat-value">12</h3>
        </article>
      </div>

      <div className="admin-table-card">
        <div className="admin-table-head">
          <span>Product</span>
          <span>Status</span>
          <span>Last Updated</span>
          <span>Actions</span>
        </div>
        <div className="admin-table-row">
          <span>Cashew Nuts</span>
          <span className="admin-pill admin-pill-live">Active</span>
          <span>2 hours ago</span>
          <div className="admin-actions-group">
            <button type="button" className="admin-icon-btn" title="Edit product" aria-label="Edit product">
              <i className="bi bi-pencil-square"></i>
            </button>
            <button type="button" className="admin-icon-btn admin-icon-btn-danger" title="Delete product" aria-label="Delete product">
              <i className="bi bi-trash"></i>
            </button>
          </div>
        </div>
        <div className="admin-table-row">
          <span>Ginger</span>
          <span className="admin-pill admin-pill-live">Active</span>
          <span>Today</span>
          <div className="admin-actions-group">
            <button type="button" className="admin-icon-btn" title="Edit product" aria-label="Edit product">
              <i className="bi bi-pencil-square"></i>
            </button>
            <button type="button" className="admin-icon-btn admin-icon-btn-danger" title="Delete product" aria-label="Delete product">
              <i className="bi bi-trash"></i>
            </button>
          </div>
        </div>
        <div className="admin-table-row">
          <span>Cocoa Beans</span>
          <span className="admin-pill admin-pill-draft">Draft</span>
          <span>Yesterday</span>
          <div className="admin-actions-group">
            <button type="button" className="admin-icon-btn" title="Edit product" aria-label="Edit product">
              <i className="bi bi-pencil-square"></i>
            </button>
            <button type="button" className="admin-icon-btn" title="Publish product" aria-label="Publish product">
              <i className="bi bi-upload"></i>
            </button>
          </div>
        </div>
      </div>

      <ProductFormModal
        isOpen={isProductFormOpen}
        onClose={() => setIsProductFormOpen(false)}
      />
    </section>
  );
};

export default ProductsPanel;
