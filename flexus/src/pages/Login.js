import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import api from "../api/api";
import "../styles/login.css";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const [formData, setFormData] = useState({
    emailAddress: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    const logoutMessage = localStorage.getItem("authLogoutMessage");

    if (logoutMessage) {
      setLoginError(logoutMessage);
      toast.error(logoutMessage);
      localStorage.removeItem("authLogoutMessage");
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
    if (loginError) {
      setLoginError("");
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.emailAddress) {
      newErrors.emailAddress = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.emailAddress)) {
      newErrors.emailAddress = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setLoginError("");

    try {
      const { data } = await api.post("/users/login", formData);

      login(data.data.user, data.data.accessToken);

      toast.success("Login successful!");

      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 500);
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to login. Please try again.";
      setLoginError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="m-0 p-0">
      <section className="py-5 login-content-section position-relative">
        <div className="login-top-buttons">
          <button
            type="button"
            className={`btn btn-link ${isDarkMode ? "text-light" : "text-dark"}`}
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
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate("/")}
            title="Back to main site"
          >
            ← Back to App
          </button>
        </div>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-md-6 col-lg-5">
              <div className="login-card p-5 rounded-4 bg-light shadow">
                <h2 className="text-center text-brand-dark fw-bold mb-4">
                  Login to your Flexus account
                </h2>

                {loginError && (
                  <div
                    className="alert alert-danger alert-dismissible fade show"
                    role="alert"
                  >
                    <span className="me-2">⚠️</span>
                    <strong>Login Failed:</strong> {loginError}
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setLoginError("")}
                      aria-label="Close"
                    ></button>
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  <div className="mb-3">
                    <label
                      htmlFor="emailAddress"
                      className="form-label fw-semibold"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      className={`form-control form-control-lg ${
                        errors.emailAddress ? "is-invalid" : ""
                      }`}
                      id="emailAddress"
                      name="emailAddress"
                      placeholder="Enter your email"
                      value={formData.emailAddress}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                    {errors.emailAddress && (
                      <div className="text-danger small mt-1">
                        {errors.emailAddress}
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="password"
                      className="form-label fw-semibold"
                    >
                      Password
                    </label>
                    <input
                      type="password"
                      className={`form-control form-control-lg ${
                        errors.password ? "is-invalid" : ""
                      }`}
                      id="password"
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                    {errors.password && (
                      <div className="text-danger small mt-1">
                        {errors.password}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-brand-primary btn-lg w-100"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Logging in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </button>
                </form>

                <div className="mt-4 pt-3 text-center">
                  <p className="text-muted small mb-0">
                    Make sure you have admin or staff privileges to access the
                    portal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Login;
