import ProductCardSkeleton from "./ProductCardSkeleton";

const ProductCardSkeletonGrid = ({
  count = 4,
  colClassName = "col-6 col-lg-3 col-md-4",
}) => {
  return (
    <div className="row g-4" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div className={colClassName} key={`product-skeleton-${index}`}>
          <ProductCardSkeleton />
        </div>
      ))}
    </div>
  );
};

export default ProductCardSkeletonGrid;
