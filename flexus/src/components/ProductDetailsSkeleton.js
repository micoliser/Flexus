const ProductDetailsSkeleton = () => {
  return (
    <section
      className="product-details-section py-5 bg-light"
      aria-hidden="true"
    >
      <div className="container">
        <div className="row g-4 align-items-stretch">
          <div className="col-12 px-lg-5">
            <div className="product-details-card bg-white rounded-4 p-4 p-lg-5 shadow-sm h-100 product-details-skeleton">
              <div className="product-details-top mb-4">
                <div className="product-details-summary">
                  <span className="product-details-skeleton-line product-details-skeleton-title"></span>
                  <span className="product-details-skeleton-line"></span>
                  <span className="product-details-skeleton-line"></span>
                  <span className="product-details-skeleton-line product-details-skeleton-line-short"></span>
                </div>

                <div className="product-image-side-meta">
                  <div className="product-meta-item product-meta-item-compact product-details-skeleton-box"></div>
                  <div className="product-meta-item product-meta-item-compact product-details-skeleton-box"></div>
                </div>

                <div className="product-details-main-image-wrap">
                  <div className="product-details-image-card rounded-4 overflow-hidden shadow-sm product-details-skeleton-image"></div>
                </div>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-12 col-md-6">
                  <div className="product-meta-item product-details-skeleton-box"></div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="product-meta-item product-details-skeleton-box"></div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="product-meta-item product-details-skeleton-box"></div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="product-meta-item product-details-skeleton-box"></div>
                </div>
              </div>

              <div className="mb-4">
                <span className="product-details-skeleton-line product-details-skeleton-subtitle"></span>
                <div className="d-flex flex-wrap gap-2">
                  <span className="product-details-skeleton-pill"></span>
                  <span className="product-details-skeleton-pill"></span>
                  <span className="product-details-skeleton-pill"></span>
                </div>
              </div>

              <div className="mb-4">
                <span className="product-details-skeleton-line product-details-skeleton-subtitle"></span>
                <span className="product-details-skeleton-line"></span>
              </div>

              <div className="d-flex flex-wrap gap-3 align-items-center">
                <span className="product-details-skeleton-btn"></span>
                <span className="product-details-skeleton-line product-details-skeleton-inline"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetailsSkeleton;
