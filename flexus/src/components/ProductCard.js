import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  const { id, name, description, image } = product;
  return (
    <div className="card h-100 border-0 shadow-sm rounded-3">
      <img className="card-img" src={image} alt={name} />
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
