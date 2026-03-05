import ProductCard from "../components/ProductCard";
import { Link } from "react-router-dom";

const Products = () => {
  const products = [
    {
      name: "Cashew Nuts",
      description: "Premium cashew nuts with excellent flavor and texture.",
      image: require("../images/cashew-nuts.png"),
    },
    {
      name: "Cocoa Beans",
      description: "Rich cocoa beans for chocolate production.",
      image: require("../images/cocoa-2.png"),
    },
    {
      name: "Corn",
      description:
        "Quality corn sourced from trusted farmers, ideal for any use",
      image: require("../images/corn-2.png"),
    },
    {
      name: "Tumeric",
      description:
        "Bright yellow turmeric with strong flavor and aroma, perfect for culinary and medicinal use.",
      image: require("../images/tumeric.png"),
    },
    {
      name: "Coconut",
      description:
        "Fresh coconuts with sweet water and creamy meat,for cooking and beverages.",
      image: require("../images/coconut.png"),
    },
    {
      name: "Sheanut",
      description:
        "Sheanut with high oil content, really good for skincare products.",
      image: require("../images/sheanut.png"),
    },
    {
      name: "Ginger",
      description:
        "Fresh ginger with a spicy kick and aromatic flavor, ideal for cooking and health remedies.",
      image: require("../images/ginger.png"),
    },
    {
      name: "Bitter Kola",
      description:
        "Bitter kola with a distinct bitter taste and potential health benefits, commonly used in traditional medicine.",
      image: require("../images/bitter-kola.png"),
    },
  ];
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
                key={index}
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
        className="cta-section py-5 text-center bg-light"
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
