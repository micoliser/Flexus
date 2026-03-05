import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-dark text-white pt-5 pb-3">
      <div className="container">
        <div className="row g-4">
          <div className="col-12 col-md-4">
            <Link className="navbar-brand" to="/">
              <img
                src={require("../images/flexus-logo.png")}
                alt="flexus logo"
                className="logo-img"
              />
            </Link>
            <p className="text-white-50 small">
              Your trusted partner for premium agricultural exports worldwide.
            </p>
          </div>

          <div className="col-12 col-md-4">
            <h5 className="fw-bold mb-3">Contact Us</h5>
            <ul className="list-unstyled small text-white-50">
              <li className="mb-2">
                <i className="bi bi-envelope me-2"></i>
                info@flexussolutions.com
              </li>
              <li className="mb-2">
                <i className="bi bi-telephone me-2"></i>
                +234 70 123 4567
              </li>
              <li className="mb-2">
                <i className="bi bi-geo-alt me-2"></i>
                4th Floor, Right Wing, Mulliner Towers, Plot 39 Alfred Rewane
                Road, Ikoyi, Lagos, Nigeria
              </li>
            </ul>
          </div>

          <div className="col-12 col-md-4">
            <h5 className="fw-bold mb-3">Follow Us</h5>
            <div className="d-flex gap-3">
              <a href="/" className="text-white fs-4" aria-label="Facebook">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="/" className="text-white fs-4" aria-label="Twitter">
                <i className="bi bi-twitter"></i>
              </a>
              <a href="/" className="text-white fs-4" aria-label="LinkedIn">
                <i className="bi bi-linkedin"></i>
              </a>
            </div>
          </div>
        </div>

        <hr className="my-4 border-secondary" />
        <div className="row align-items-center">
          <div className="col-12 col-md-6 text-center text-md-start">
            <p className="mb-0 small text-white-50">
              &copy; {new Date().getFullYear()} Flexus Solutions. All rights
              reserved.
            </p>
          </div>
          <div className="col-12 col-md-6 text-center text-md-end mt-2 mt-md-0">
            <Link
              to="/"
              className="text-white-50 text-decoration-none small me-3"
            >
              Privacy Policy
            </Link>
            <Link to="/" className="text-white-50 text-decoration-none small">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
