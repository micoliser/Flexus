import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Lock body scroll when sidebar is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
  }, [isOpen]);

  const closeSidebar = () => setIsOpen(false);

  return (
    <header
      className="position-absolute top-0 start-0 end-0 w-100"
      style={{ zIndex: 1000 }}
    >
      <nav className="navbar navbar-expand-lg navbar-dark bg-transparent py-3">
        <div className="container">
          <NavLink className="navbar-brand" to="/">
            <img
              src={require("../images/flexus-logo-dark.png")}
              alt="flexus logo"
              className="header-img logo-img"
            />
          </NavLink>

          <ul className="navbar-nav ms-auto d-none d-lg-flex">
            <li className="nav-item">
              <NavLink to="/" className="nav-link text-white fw-medium px-3">
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/about"
                className="nav-link text-white fw-medium px-3"
              >
                About
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/products"
                className="nav-link text-white fw-medium px-3"
              >
                Products
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/contact"
                className="nav-link text-white fw-medium px-3"
              >
                Contact
              </NavLink>
            </li>
          </ul>

          <button
            className="navbar-toggler border-white border-opacity-50 d-lg-none"
            onClick={() => setIsOpen(true)}
          >
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>
      </nav>

      {/* Mobile Overlay */}
      <div
        className={`mobile-overlay ${isOpen ? "show" : ""}`}
        onClick={closeSidebar}
      >
        {/* Sidebar */}
        <div className="mobile-sidebar" onClick={(e) => e.stopPropagation()}>
          <div className="mobile-sidebar-header d-flex align-items-center justify-content-between px-2 py-3 border-bottom">
            <NavLink to="/" onClick={closeSidebar}>
              <img
                src={require("../images/flexus-logo.png")}
                alt="flexus logo"
                className="logo-img"
              />
            </NavLink>

            <button className="btn-close" onClick={closeSidebar}></button>
          </div>

          <div className="mobile-sidebar-body">
            <ul className="navbar-nav">
              <li className="nav-item px-3">
                <NavLink
                  to="/"
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `nav-link px-3 py-3 fs-5 d-flex align-items-center ${
                      isActive ? "mobile-active-link" : ""
                    }`
                  }
                >
                  <i className="bi bi-house me-3 fs-4"></i>
                  Home
                </NavLink>
              </li>

              <li className="nav-item px-3">
                <NavLink
                  to="/about"
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `nav-link px-3 py-3 fs-5 d-flex align-items-center ${
                      isActive ? "mobile-active-link" : ""
                    }`
                  }
                >
                  <i className="bi bi-info-circle me-3 fs-4"></i>
                  About
                </NavLink>
              </li>

              <li className="nav-item px-3">
                <NavLink
                  to="/products"
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `nav-link px-3 py-3 fs-5 d-flex align-items-center ${
                      isActive ? "mobile-active-link" : ""
                    }`
                  }
                >
                  <i className="bi bi-box-seam me-3 fs-4"></i>
                  Products
                </NavLink>
              </li>

              <li className="nav-item px-3">
                <NavLink
                  to="/contact"
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `nav-link px-3 py-3 fs-5 d-flex align-items-center ${
                      isActive ? "mobile-active-link" : ""
                    }`
                  }
                >
                  <i className="bi bi-envelope me-3 fs-4"></i>
                  Contact
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
