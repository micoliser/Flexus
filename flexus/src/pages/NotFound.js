import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <main className="not-found-page">
      <section className="not-found-section position-relative overflow-hidden">
        <div className="not-found-orb orb-one" aria-hidden="true"></div>
        <div className="not-found-orb orb-two" aria-hidden="true"></div>
        <div className="not-found-orb orb-three" aria-hidden="true"></div>

        <div className="container py-5">
          <div
            className="not-found-shell mx-auto text-center"
            data-aos="zoom-in-up"
          >
            <div className="not-found-icons" aria-hidden="true">
              <i className="bi bi-compass"></i>
              <i className="bi bi-globe2"></i>
              <i className="bi bi-stars"></i>
            </div>

            <p className="not-found-kicker mb-2">Oops, wrong turn</p>
            <h1 className="not-found-code mb-2">404</h1>
            <h2 className="not-found-title mb-3">This page got lost</h2>
            <p className="not-found-copy text-muted mb-4">
              The link may be outdated, or the page has moved. Let us get you
              back to a product route that actually ships.
            </p>

            <div className="d-flex flex-wrap justify-content-center gap-3">
              <Link
                to="/"
                className="btn btn-brand-primary px-4 py-2 not-found-btn"
              >
                <i className="bi bi-house-door me-2"></i>
                Back Home
              </Link>
              <Link
                to="/products"
                className="btn btn-outline-success px-4 py-2 not-found-btn-secondary"
              >
                <i className="bi bi-box-seam me-2"></i>
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default NotFound;
