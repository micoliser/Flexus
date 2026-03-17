const ProductCardSkeleton = () => {
  return (
    <div
      className="card h-100 border-0 shadow-sm rounded-3 product-card-skeleton"
      aria-hidden="true"
    >
      <div className="product-skeleton-image"></div>
      <div className="card-body d-flex flex-column">
        <span className="product-skeleton-line product-skeleton-title"></span>
        <span className="product-skeleton-line"></span>
        <span className="product-skeleton-line product-skeleton-line-short"></span>
        <div className="mt-auto">
          <span className="product-skeleton-button"></span>
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
