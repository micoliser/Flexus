import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/api";
import ProductFormModal from "./ProductFormModal";
import ConfirmModal from "./ConfirmModal";
import AdminTableSkeleton from "./AdminTableSkeleton";

const getProductId = (product) => product?.id || product?._id;

const ProductsPanel = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActioning, setIsActioning] = useState(false);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const fetchProducts = useCallback(
    async (nextPage = 1) => {
      setIsLoading(true);
      try {
        const params = { page: nextPage, limit: 20 };

        if (debouncedSearchTerm) {
          params.search = debouncedSearchTerm;
        }

        if (statusFilter && statusFilter !== "all") {
          params.status = statusFilter;
        }

        const { data } = await api.get("/products", { params });
        setProducts(data.data || []);
        setPagination(data.pagination || pagination);
        setPage(nextPage);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load products.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [debouncedSearchTerm, statusFilter],
  );

  useEffect(() => {
    fetchProducts(1);
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

  const handleUnpublishProduct = async (product) => {
    const productId = getProductId(product);
    if (!productId) {
      toast.error("Unable to identify product.");
      return;
    }

    try {
      setIsActioning(true);
      await api.patch(`/products/${productId}/unpublish`);
      toast.success("Product unpublished successfully.");
      fetchProducts();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to unpublish product.",
      );
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

    if (confirmAction.type === "unpublish") {
      handleUnpublishProduct(confirmAction.product);
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
    fetchProducts(page);
  };

  const totalProducts = pagination.total;
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
        <div className="admin-products-toolbar">
          <div className="admin-search-wrapper">
            <input
              type="text"
              className="admin-form-control"
              placeholder="Search by product name"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              aria-label="Search products by name"
            />
            {searchTerm && (
              <button
                type="button"
                className="admin-search-clear"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <select
            className="admin-form-control"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter products by status"
          >
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <div className="admin-table-head">
          <span>Product</span>
          <span>Status</span>
          <span>Last Updated</span>
          <span>Actions</span>
        </div>

        {isLoading && <AdminTableSkeleton columns={4} rows={6} />}

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
                {product.isPublished && (
                  <button
                    type="button"
                    className="admin-icon-btn"
                    title="Unpublish product"
                    aria-label="Unpublish product"
                    onClick={() =>
                      setConfirmAction({ type: "unpublish", product })
                    }
                  >
                    <i className="bi bi-download"></i>
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

        {!isLoading && pagination.total > 0 && (
          <div className="admin-pagination-row">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => fetchProducts(page - 1)}
              disabled={!pagination.hasPrevious}
            >
              Previous
            </button>
            <span className="admin-pagination-meta">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => fetchProducts(page + 1)}
              disabled={!pagination.hasNext}
            >
              Next
            </button>
          </div>
        )}
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
          confirmAction?.type === "publish"
            ? "Publish Draft"
            : confirmAction?.type === "unpublish"
              ? "Unpublish Product"
              : "Delete Product"
        }
        message={
          confirmAction?.type === "publish"
            ? `Are you sure you want to publish draft product "${confirmAction?.product?.name || "Untitled draft"}"?`
            : confirmAction?.type === "unpublish"
              ? `Are you sure you want to unpublish product "${confirmAction?.product?.name || "Untitled draft"}"?`
              : `Are you sure you want to delete product "${confirmAction?.product?.name || "Untitled draft"}"?`
        }
        confirmLabel={
          confirmAction?.type === "publish"
            ? "Yes, publish"
            : confirmAction?.type === "unpublish"
              ? "Yes, unpublish"
              : "Yes, delete"
        }
        loadingLabel={
          confirmAction?.type === "publish"
            ? "Publishing..."
            : confirmAction?.type === "unpublish"
              ? "Unpublishing..."
              : "Deleting..."
        }
        confirmVariant={
          confirmAction?.type === "publish"
            ? "primary"
            : confirmAction?.type === "unpublish"
              ? "secondary"
              : "danger"
        }
        onConfirm={handleConfirmAction}
        onCancel={() => !isActioning && setConfirmAction(null)}
        isLoading={isActioning}
      />
    </section>
  );
};

export default ProductsPanel;
