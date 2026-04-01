import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import ProductsPanel from "../components/admin/ProductsPanel";
import UsersPanel from "../components/admin/UsersPanel";
import LogsPanel from "../components/admin/LogsPanel";
import "../styles/dashboard.css";
import Seo from "../components/Seo";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout, isAdmin, isStaff } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const menuItems = useMemo(() => {
    const items = [{ key: "products", label: "Products", icon: "bi-box-seam" }];

    if (isAdmin) {
      items.push(
        { key: "users", label: "Users", icon: "bi-people" },
        { key: "logs", label: "View Logs", icon: "bi-journal-text" },
      );
    }

    return items;
  }, [isAdmin]);

  const [activeTab, setActiveTab] = useState("products");

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  if (!user) return null;

  const renderPanel = () => {
    if (activeTab === "products") return <ProductsPanel />;
    if (activeTab === "users" && isAdmin) return <UsersPanel />;
    if (activeTab === "logs" && isAdmin) return <LogsPanel />;
    return <ProductsPanel />;
  };

  return (
    <main className="admin-dashboard-shell">
      <Seo
        title="Admin Dashboard"
        description="Flexus Solutions internal operations dashboard."
        path="/admin/dashboard"
        noindex
      />
      <aside className="admin-sidebar">
        <div className="admin-brand-block">
          <div className="admin-brand-row">
            <img
              src={
                isDarkMode
                  ? require("../images/logo/flexus-logo-dark.png")
                  : require("../images/logo/flexus-logo.png")
              }
              alt="Flexus logo"
              className="admin-brand-logo"
            />
            <button
              type="button"
              className="admin-theme-toggle"
              onClick={toggleTheme}
              aria-label={
                isDarkMode ? "Switch to light mode" : "Switch to dark mode"
              }
              title={isDarkMode ? "Light mode" : "Dark mode"}
            >
              <i
                className={`bi ${isDarkMode ? "bi-sun-fill" : "bi-moon-fill"}`}
              ></i>
            </button>
          </div>
          <p className="admin-brand-meta">
            {user.firstName} {user.lastName}
          </p>
          <p className="admin-brand-role">
            {isAdmin ? "Administrator" : isStaff ? "Staff" : "User"}
          </p>
        </div>

        <nav className="admin-sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`admin-nav-item ${activeTab === item.key ? "active" : ""}`}
              onClick={() => setActiveTab(item.key)}
            >
              <i className={`bi ${item.icon}`}></i>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="admin-logout-wrap">
          {isLogoutConfirmOpen && (
            <div className="admin-inline-confirm">
              <p className="admin-inline-confirm-text">
                Are you sure you want to logout?
              </p>
              <div className="admin-inline-confirm-actions">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setIsLogoutConfirmOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={handleLogout}
                >
                  Confirm
                </button>
              </div>
            </div>
          )}

          <button
            type="button"
            className="admin-logout-btn"
            onClick={() => setIsLogoutConfirmOpen((prev) => !prev)}
          >
            <i className="bi bi-box-arrow-right"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <section className="admin-main-panel">
        <header className="admin-main-header">
          <h2>
            {menuItems.find((item) => item.key === activeTab)?.label ||
              "Dashboard"}
          </h2>
          <p>Manage your business operations from one place.</p>
        </header>

        {renderPanel()}
      </section>
    </main>
  );
};

export default Dashboard;
