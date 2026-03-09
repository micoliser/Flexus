import ProductCard from "../components/ProductCard";
import { Link } from "react-router-dom";
import { products } from "../data/products";

const Products = () => {
  return (
    <main className="m-0 p-0">
      <section className="products hero-section d-flex align-items-center position-relative">
        <div className="container">
          <div className="hero-content position-relative text-center text-white">
            <h1 className="display-4 fw-bold mb-4">Our Export Products</h1>
            <p className="fs-5 mb-4">
              Premium agricultural products sourced from trusted farers for
              global markets
            </p>
          </div>
        </div>
      </section>

      <section
        className="py-5 products-section bg-light"
        data-aos="fade-up"
        data-aos-duration="800"
      >
        <h4 className="fw-bold mb-4 text-center px-2">
          Explore Our Diverse Product Range available for Export
        </h4>
        <div className="container mt-4">
          <div className="row g-4">
            {products.map((product, index) => (
              <div
                className="col-6 col-lg-3 col-md-4"
                key={product.id}
                data-aos="fade-up"
                data-aos-delay={index * 50}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="cta-section py-5 text-center"
        data-aos="fade-up"
        data-aos-duration="800"
      >
        <div className="container py-5">
          <h2 className="fw-bold mb-4">Need something else?</h2>
          <Link
            to="/contact"
            className="btn btn-light text-white px-5 py-2 fw-bold rounded-pill"
          >
            Reach Out
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Products;
