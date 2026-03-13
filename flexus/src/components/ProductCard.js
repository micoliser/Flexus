import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  const { id, name, description, image, otherImages = [] } = product;
  const [imageIndex, setImageIndex] = useState(0);

  const imageQueue = useMemo(() => [image, ...otherImages], [image, otherImages]);

  const handleNextImage = () => {
    if (imageQueue.length <= 1) return;
    setImageIndex((prev) => (prev + 1) % imageQueue.length);
  };

  return (
    <div className="card h-100 border-0 shadow-sm rounded-3">
      <button
        type="button"
        className="product-card-image-btn"
        onClick={handleNextImage}
        aria-label={`Show next image for ${name}`}
      >
        <img className="card-img" src={imageQueue[imageIndex]} alt={name} />
      </button>
      <div className="card-body d-flex flex-column">
        <h5 className="card-title text-brand-dark">{name}</h5>
        <p className="card-text text-muted">{description}</p>
        <div className="mt-auto">
          <Link
            to={`/products/${id}`}
            className="btn btn-brand-primary text-white"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
