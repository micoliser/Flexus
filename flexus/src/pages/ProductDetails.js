import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import QuoteForm from "../components/QuoteForm";
import { getProductById, products } from "../data/products";

const ProductDetails = () => {
  const { id } = useParams();
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const product = getProductById(id);
  const suggestedProducts = useMemo(() => {
    const otherProducts = products.filter((item) => item.id !== id);
    const shuffled = [...otherProducts].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, [id]);

  if (!product) {
    return (
      <main className="m-0 p-0 product-details-page">
        <section className="product-details-section py-5 bg-light">
          <div className="container py-5 text-center">
            <h2 className="fw-bold text-brand-dark mb-3">Product Not Found</h2>
            <p className="text-muted mb-4">
              The product you are looking for does not exist.
            </p>
            <Link to="/products" className="btn btn-brand-primary">
              Back to Products
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="m-0 p-0 product-details-page">
      <section
        className="product-details-section py-5 bg-light"
        data-aos="fade-up"
      >
        <div className="container">
          <div className="row g-4 align-items-stretch">
            <div className="col-12 col-lg-5">
              <div className="product-details-image-card h-50 rounded-4 overflow-hidden shadow-sm">
                <img
                  src={product.image}
                  alt={product.name}
                  className="img-fluid w-100 h-100 object-fit-cover"
                />
              </div>
            </div>

            <div className="col-12 col-lg-7">
              <div className="product-details-card bg-white rounded-4 p-4 p-lg-5 shadow-sm h-100">
                <h2 className="fw-bold text-brand-dark mb-3">{product.name}</h2>
                <p className="text-muted mb-4">{product.longDescription}</p>

                <div className="row g-3 mb-4">
                  <div className="col-12 col-md-6">
                    <div className="product-meta-item">
                      <span className="meta-label">Origin</span>
                      <p className="mb-0 fw-medium">{product.origin}</p>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="product-meta-item">
                      <span className="meta-label">Grade</span>
                      <p className="mb-0 fw-medium">{product.grade}</p>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="product-meta-item">
                      <span className="meta-label">Moisture</span>
                      <p className="mb-0 fw-medium">{product.moisture}</p>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="product-meta-item">
                      <span className="meta-label">Minimum Order</span>
                      <p className="mb-0 fw-medium">{product.minOrder}</p>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="product-meta-item">
                      <span className="meta-label">Packaging</span>
                      <p className="mb-0 fw-medium">{product.packaging}</p>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="product-meta-item">
                      <span className="meta-label">Shelf Life</span>
                      <p className="mb-0 fw-medium">{product.shelfLife}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h5 className="fw-bold text-brand-dark mb-2">
                    Certifications
                  </h5>
                  <div className="d-flex flex-wrap gap-2">
                    {product.certifications.map((certification) => (
                      <span key={certification} className="badge product-badge">
                        {certification}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <h5 className="fw-bold text-brand-dark mb-2">
                    Export Markets
                  </h5>
                  <p className="mb-0 text-muted">
                    {product.exportMarkets.join(", ")}
                  </p>
                </div>

                <div className="d-flex flex-wrap gap-3 align-items-center">
                  <button
                    type="button"
                    onClick={() => setIsQuoteOpen(true)}
                    className="btn btn-brand-primary px-4 py-2"
                  >
                    Request Quote
                  </button>
                  <span className="text-muted small">
                    Availability: {product.availability}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="other-products-section py-5 bg-white"
        data-aos="fade-up"
      >
        <div className="container px-5">
          <h3 className="fw-bold text-brand-dark mb-4 text-center">
            Other products you might like
          </h3>
          <div className="row g-4">
            {suggestedProducts.map((suggestedProduct) => (
              <div
                className="col-12 col-sm-6 col-lg-4"
                key={suggestedProduct.id}
              >
                <ProductCard product={suggestedProduct} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <QuoteForm
        isOpen={isQuoteOpen}
        productName={product.name}
        onClose={() => setIsQuoteOpen(false)}
      />
    </main>
  );
};

export default ProductDetails;
