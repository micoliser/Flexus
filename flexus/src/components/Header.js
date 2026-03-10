import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  // Lock body scroll when sidebar is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
  }, [isOpen]);

  const closeSidebar = () => setIsOpen(false);

  return (
    <header className="navbar-header" style={{ zIndex: 1000 }}>
      <nav
        className={`navbar navbar-expand-lg py-0 ${isDarkMode ? "navbar-dark" : "navbar-light"}`}
      >
        <div className="container-nav mx-auto pe-4">
          <NavLink className="navbar-brand" to="/">
            <img
              src={
                isDarkMode
                  ? require("../images/logo/flexus-logo-dark.png")
                  : require("../images/logo/flexus-logo.png")
              }
              alt="flexus logo"
              className="header-img logo-img"
            />
          </NavLink>

          <ul className="navbar-nav ms-auto d-none d-lg-flex">
            <li className="nav-item">
              <NavLink
                to="/"
                className={`nav-link fw-medium px-3 ${isDarkMode ? "text-light" : "text-dark"}`}
              >
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/about"
                className={`nav-link fw-medium px-3 ${isDarkMode ? "text-light" : "text-dark"}`}
              >
                About
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/products"
                className={`nav-link fw-medium px-3 ${isDarkMode ? "text-light" : "text-dark"}`}
              >
                Products
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/contact"
                className={`nav-link fw-medium px-3 ${isDarkMode ? "text-light" : "text-dark"}`}
              >
                Contact
              </NavLink>
            </li>
            <li className="nav-item d-flex align-items-center">
              <button
                type="button"
                className={`btn btn-link nav-link px-3 ${isDarkMode ? "text-light" : "text-dark"}`}
                onClick={toggleTheme}
                aria-label={
                  isDarkMode ? "Switch to light mode" : "Switch to dark mode"
                }
                title={isDarkMode ? "Light mode" : "Dark mode"}
              >
                <i
                  className={`bi ${isDarkMode ? "bi-sun-fill" : "bi-moon-fill"} fs-5`}
                ></i>
              </button>
            </li>
          </ul>

          <button
            className={`navbar-toggler d-lg-none ${isDarkMode ? "border-light" : "border-dark"}`}
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
          <div className="mobile-sidebar-header d-flex align-items-center justify-content-between px-2 py-2 border-bottom">
            <NavLink to="/" onClick={closeSidebar}>
              <img
                src={
                  isDarkMode
                    ? require("../images/logo/flexus-logo-dark.png")
                    : require("../images/logo/flexus-logo.png")
                }
                alt="flexus logo"
                className="logo-img"
              />
            </NavLink>

            <button className="btn-close" onClick={closeSidebar}></button>
          </div>

          <div className="mobile-sidebar-body">
            <ul className="navbar-nav">
              <li className="nav-item px-2">
                <NavLink
                  to="/"
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `nav-link px-2 py-2 fs-6 d-flex align-items-center ${
                      isActive ? "mobile-active-link" : ""
                    }`
                  }
                >
                  <i className="bi bi-house me-2 fs-5"></i>
                  Home
                </NavLink>
              </li>

              <li className="nav-item px-2">
                <NavLink
                  to="/about"
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `nav-link px-2 py-2 fs-6 d-flex align-items-center ${
                      isActive ? "mobile-active-link" : ""
                    }`
                  }
                >
                  <i className="bi bi-info-circle me-2 fs-5"></i>
                  About
                </NavLink>
              </li>

              <li className="nav-item px-2">
                <NavLink
                  to="/products"
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `nav-link px-2 py-2 fs-6 d-flex align-items-center ${
                      isActive ? "mobile-active-link" : ""
                    }`
                  }
                >
                  <i className="bi bi-box-seam me-2 fs-5"></i>
                  Products
                </NavLink>
              </li>

              <li className="nav-item px-2">
                <NavLink
                  to="/contact"
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `nav-link px-2 py-2 fs-6 d-flex align-items-center ${
                      isActive ? "mobile-active-link" : ""
                    }`
                  }
                >
                  <i className="bi bi-envelope me-2 fs-5"></i>
                  Contact
                </NavLink>
              </li>
              <li className="nav-item px-2 mt-1 border-top pt-2">
                <button
                  type="button"
                  className="nav-link px-2 py-2 fs-6 d-flex align-items-center w-100 text-start btn btn-link text-decoration-none text-dark"
                  onClick={toggleTheme}
                  aria-label={
                    isDarkMode ? "Switch to light mode" : "Switch to dark mode"
                  }
                >
                  <i
                    className={`bi ${isDarkMode ? "bi-sun-fill" : "bi-moon-fill"} me-2 fs-5`}
                  ></i>
                  {isDarkMode ? "Light Mode" : "Dark Mode"}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
