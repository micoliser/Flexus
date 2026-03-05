import ProductCard from "../components/ProductCard";
import { Link } from "react-router-dom";
import CardR from "../components/CardR";

const Home = () => {
  const products = [
    {
      name: "Corn",
      description: "High-quality corn sourced from trusted farmers.",
      image: require("../images/corn.png"),
    },
    {
      name: "Cashew",
      description: "Premium cashew nuts with excellent flavor and texture.",
      image: require("../images/cashew-bowl.png"),
    },
    {
      name: "Cocoa",
      description: "Rich cocoa beans for chocolate production.",
      image: require("../images/cocoa.png"),
    },
  ];

  return (
    <main className="m-0 p-0">
      <section className="home hero-section d-flex align-items-center position-relative">
        <div className="container">
          <div className="hero-content position-relative text-center text-white">
            <h1 className="display-4 fw-bold mb-4">
              Premium Agricultural Exports Worldwide
            </h1>
            <p className="fs-5 mb-4">
              Supplying high-quality corn, cashew, and farm produce to global
              markets
            </p>
            <div className="mt-4">
              <Link
                to="/products"
                className="btn btn-brand-primary btn-lg me-3"
              >
                View Products
              </Link>
              <Link to="/contact" className="btn btn-outline-light btn-lg">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        className="py-5 about-section"
        data-aos="fade-up"
        data-aos-duration="800"
      >
        <div className="container">
          <div className="about-panel position-relative overflow-hidden rounded-4 p-4 p-lg-5">
            <div className="about-content pe-lg-5">
              <h2 className="fw-bold mb-3 text-brand-dark">
                About Flexus Solutions
              </h2>
              <hr className="my-3" />

              <div className="row g-4 align-items-start">
                <div className="col-12 col-lg-6">
                  <p className="mb-0 text-muted fs-6">
                    Flexus is committed to delivering premium agricultural
                    produce to global markets with consistency, transparency,
                    and care. We work directly with trusted farmers and apply
                    strict quality standards from sourcing to shipment.
                  </p>
                </div>

                <div className="col-12 col-lg-6">
                  <ul className="list-unstyled mb-0">
                    <li className="d-flex align-items-center mb-1">
                      <i
                        className="bi bi-check-circle-fill me-3 fs-4 text-brand-light"
                        aria-hidden="true"
                      ></i>
                      <span className="fs-6">Experience</span>
                    </li>
                    <li className="d-flex align-items-center mb-1">
                      <i
                        className="bi bi-check-circle-fill me-3 fs-4 text-brand-light"
                        aria-hidden="true"
                      ></i>
                      <span className="fs-6">Quality and Sustainability</span>
                    </li>
                    <li className="d-flex align-items-center">
                      <i
                        className="bi bi-check-circle-fill me-3 fs-4 text-brand-light"
                        aria-hidden="true"
                      ></i>
                      <span className="fs-6">Strong Farmer Partnerships</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <img
              src={require("../images/about-bg.png")}
              alt="Corn and cashew produce"
              className="about-panel-image d-none d-lg-block"
            />
          </div>
        </div>
      </section>

      <section
        className="why-choose-section py-5 text-white"
        data-aos="fade-up"
        data-aos-duration="800"
      >
        <div className="container">
          <h2 className="text-center fw-bold mb-3">Why Choose Us?</h2>
          <div className="row g-4 text-center">
            <CardR
              icon="bi-shield-check"
              title="Quality Assured"
              description="Strict quality control at every stage"
            />
            <CardR
              icon="bi-truck"
              title="Reliable Logistics"
              description="On-time delivery to global markets"
            />
            <CardR
              icon="bi-flower1"
              title="Sustainable Farming"
              description="Eco-friendly and ethical practices"
            />
            <CardR
              icon="bi-globe"
              title="Global Distribution"
              description="Serving markets worldwide"
            />
          </div>
        </div>
      </section>

      <section
        className="py-5 products-section"
        data-aos="fade-up"
        data-aos-duration="800"
      >
        <h1 className="text-center fw-bold mb-5">Our Products</h1>
        <div className="container px-5">
          <div className="row g-4">
            {products.map((product, index) => (
              <div
                className="col-12 col-lg-4 col-md-6"
                key={index}
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <Link to="/products">View All Products</Link>
          </div>
        </div>
      </section>

      <section
        className="cta-section py-5 text-center"
        data-aos="fade-up"
        data-aos-duration="800"
      >
        <div className="container py-5">
          <h2 className="fw-bold mb-4">
            Ready to Import Premium Agricultural Products?
          </h2>
          <Link
            to="/contact"
            className="btn btn-light text-white px-5 py-2 fw-bold rounded-pill"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Home;
