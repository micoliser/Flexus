const ProductCard = ({ product }) => {
  const { name, description, image } = product;
  return (
    <div className="card h-100 border-0 shadow-sm rounded-3">
      <img
        className="card-img"
        src={image}
        alt={name}
        height="70"
        width="100"
      />
      <div className="card-body d-flex flex-column">
        <h5 className="card-title text-brand-dark">{name}</h5>
        <p className="card-text text-muted">{description}</p>
        <div className="mt-auto">
          <button className="btn btn-brand-primary w-20">View Details</button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
