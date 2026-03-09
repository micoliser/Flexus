import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const isProductDetailsPage = /^\/products\/[^/]+$/.test(location.pathname);
  const { isDarkMode, toggleTheme } = useTheme();
  const isHeaderSolid = isScrolled || isProductDetailsPage;

  // Lock body scroll when sidebar is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
  }, [isOpen]);

  // Handle scroll event
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const navElement = document.getElementsByClassName("navbar-header")[0];

      if (isProductDetailsPage) {
        if (navElement) {
          navElement.style.display = "block";
        }
        setIsScrolled(true);
        return;
      }

      if (scrollPosition > 150 && scrollPosition < 500) {
        if (navElement) {
          navElement.style.display = "none";
        }
      } else {
        if (navElement) {
          navElement.style.display = "block";
        }
      }
      setIsScrolled(scrollPosition > 500);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isProductDetailsPage]);

  const closeSidebar = () => setIsOpen(false);

  return (
    <header
      className={`navbar-header ${isHeaderSolid ? "scrolled" : ""}`}
      style={{ zIndex: 1000 }}
    >
      <nav
        className={`navbar navbar-expand-lg py-0 ${isHeaderSolid ? (isDarkMode ? "navbar-dark" : "navbar-light") : "navbar-dark bg-transparent"}`}
      >
        <div className="container mx-auto">
          <NavLink className="navbar-brand" to="/">
            <img
              src={
                isHeaderSolid && !isDarkMode
                  ? require("../images/flexus-logo.png")
                  : require("../images/flexus-logo-dark.png")
              }
              alt="flexus logo"
              className="header-img logo-img"
            />
          </NavLink>

          <ul className="navbar-nav ms-auto d-none d-lg-flex">
            <li className="nav-item">
              <NavLink
                to="/"
                className={`nav-link fw-medium px-3 ${isHeaderSolid ? "text-dark" : "text-white"}`}
              >
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/about"
                className={`nav-link fw-medium px-3 ${isHeaderSolid ? "text-dark" : "text-white"}`}
              >
                About
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/products"
                className={`nav-link fw-medium px-3 ${isHeaderSolid ? "text-dark" : "text-white"}`}
              >
                Products
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/contact"
                className={`nav-link fw-medium px-3 ${isHeaderSolid ? "text-dark" : "text-white"}`}
              >
                Contact
              </NavLink>
            </li>
            <li className="nav-item d-flex align-items-center">
              <button
                type="button"
                className={`btn btn-link nav-link px-3 ${isHeaderSolid ? "text-dark" : "text-white"}`}
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
            className={`navbar-toggler d-lg-none ${isHeaderSolid ? (isDarkMode ? "border-light" : "border-dark") : "border-white border-opacity-50"}`}
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
                src={
                  isDarkMode
                    ? require("../images/flexus-logo-dark.png")
                    : require("../images/flexus-logo.png")
                }
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
              <li className="nav-item px-3 mt-2 border-top pt-3">
                <button
                  type="button"
                  className="nav-link px-3 py-3 fs-5 d-flex align-items-center w-100 text-start btn btn-link text-decoration-none text-dark"
                  onClick={toggleTheme}
                  aria-label={
                    isDarkMode ? "Switch to light mode" : "Switch to dark mode"
                  }
                >
                  <i
                    className={`bi ${isDarkMode ? "bi-sun-fill" : "bi-moon-fill"} me-3 fs-4`}
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
