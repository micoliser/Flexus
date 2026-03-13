import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/api";
import ProductFormModal from "./ProductFormModal";
import ConfirmModal from "./ConfirmModal";

const getProductId = (product) => product?.id || product?._id;

const ProductsPanel = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActioning, setIsActioning] = useState(false);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get("/products");
      setProducts(data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load products.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleOpenAdd = () => {
    setSelectedProduct(null);
    setIsProductFormOpen(true);
  };

  const handleOpenEdit = (product) => {
    setSelectedProduct(product);
    setIsProductFormOpen(true);
  };

  const handleDelete = async (product) => {
    const productId = getProductId(product);
    if (!productId) {
      toast.error("Unable to identify product.");
      return;
    }

    try {
      setIsActioning(true);
      await api.delete(`/products/${productId}`);
      toast.success("Product deleted successfully.");
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete product.");
    } finally {
      setIsActioning(false);
      setConfirmAction(null);
    }
  };

  const handlePublishDraft = async (product) => {
    const productId = getProductId(product);
    if (!productId) {
      toast.error("Unable to identify product.");
      return;
    }

    try {
      setIsActioning(true);
      await api.patch(`/products/${productId}/publish`);
      toast.success("Draft published successfully.");
      fetchProducts();
    } catch (error) {
      const missingFields = error.response?.data?.missingFields;
      if (Array.isArray(missingFields) && missingFields.length > 0) {
        toast.error(`Missing required fields: ${missingFields.join(", ")}`);
      } else {
        toast.error(
          error.response?.data?.message || "Failed to publish draft.",
        );
      }
    } finally {
      setIsActioning(false);
      setConfirmAction(null);
    }
  };

  const handleConfirmAction = () => {
    if (!confirmAction?.product) return;

    if (confirmAction.type === "publish") {
      handlePublishDraft(confirmAction.product);
      return;
    }

    if (confirmAction.type === "delete") {
      handleDelete(confirmAction.product);
    }
  };

  const handleFormClose = () => {
    setSelectedProduct(null);
    setIsProductFormOpen(false);
  };

  const handleFormSuccess = () => {
    fetchProducts();
  };

  const totalProducts = products.length;
  const draftProducts = products.filter(
    (product) => !product.isPublished,
  ).length;
  const publishedProducts = products.filter(
    (product) => product.isPublished,
  ).length;

  return (
    <section className="admin-panel-content">
      <div className="admin-panel-header">
        <h2 className="admin-panel-title">Products</h2>
        <button className="btn btn-brand-primary" onClick={handleOpenAdd}>
          Add Product
        </button>
      </div>

      <div className="admin-stats-grid">
        <article className="admin-stat-card">
          <p className="admin-stat-label">Total Products</p>
          <h3 className="admin-stat-value">{totalProducts}</h3>
        </article>
        <article className="admin-stat-card">
          <p className="admin-stat-label">Draft Products</p>
          <h3 className="admin-stat-value">{draftProducts}</h3>
        </article>
        <article className="admin-stat-card">
          <p className="admin-stat-label">Published Products</p>
          <h3 className="admin-stat-value">{publishedProducts}</h3>
        </article>
      </div>

      <div className="admin-table-card">
        <div className="admin-table-head">
          <span>Product</span>
          <span>Status</span>
          <span>Last Updated</span>
          <span>Actions</span>
        </div>

        {isLoading && (
          <div className="admin-table-empty">Loading products...</div>
        )}

        {!isLoading && products.length === 0 && (
          <div className="admin-table-empty">No products found.</div>
        )}

        {!isLoading &&
          products.map((product) => (
            <div key={getProductId(product)} className="admin-table-row">
              <span>{product.name || "Untitled draft"}</span>
              <span
                className={`admin-pill ${product.isPublished ? "admin-pill-live" : "admin-pill-draft"}`}
              >
                {product.isPublished ? "Published" : "Draft"}
              </span>
              <span>
                {new Date(
                  product.updatedAt || product.createdAt,
                ).toLocaleString()}
              </span>
              <div className="admin-actions-group">
                <button
                  type="button"
                  className="admin-icon-btn"
                  title="Edit product"
                  aria-label="Edit product"
                  onClick={() => handleOpenEdit(product)}
                >
                  <i className="bi bi-pencil-square"></i>
                </button>
                {!product.isPublished && (
                  <button
                    type="button"
                    className="admin-icon-btn"
                    title="Publish draft"
                    aria-label="Publish draft"
                    onClick={() =>
                      setConfirmAction({ type: "publish", product })
                    }
                  >
                    <i className="bi bi-upload"></i>
                  </button>
                )}
                <button
                  type="button"
                  className="admin-icon-btn admin-icon-btn-danger"
                  title="Delete product"
                  aria-label="Delete product"
                  onClick={() => setConfirmAction({ type: "delete", product })}
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>
          ))}
      </div>

      <ProductFormModal
        isOpen={isProductFormOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        product={selectedProduct}
      />

      <ConfirmModal
        isOpen={!!confirmAction}
        title={
          confirmAction?.type === "publish" ? "Publish Draft" : "Delete Product"
        }
        message={
          confirmAction?.type === "publish"
            ? `Are you sure you want to publish draft product "${confirmAction?.product?.name || "Untitled draft"}"?`
            : `Are you sure you want to delete product "${confirmAction?.product?.name || "Untitled draft"}"?`
        }
        confirmLabel={
          confirmAction?.type === "publish" ? "Yes, publish" : "Yes, delete"
        }
        confirmVariant={
          confirmAction?.type === "publish" ? "primary" : "danger"
        }
        onConfirm={handleConfirmAction}
        onCancel={() => !isActioning && setConfirmAction(null)}
        isLoading={isActioning}
      />
    </section>
  );
};

export default ProductsPanel;
