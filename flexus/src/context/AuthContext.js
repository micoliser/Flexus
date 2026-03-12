import { createContext, useState, useContext, useEffect, useRef } from "react";
import api, { setAuthFailureHandler } from "../api/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const isHandlingAuthFailure = useRef(false);

  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("accessToken") || null;
  });

  const login = (userData, accessToken) => {
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("accessToken", accessToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
  };

  useEffect(() => {
    const handleAuthFailure = (message) => {
      if (isHandlingAuthFailure.current) return;

      isHandlingAuthFailure.current = true;

      logout();

      if (message) {
        localStorage.setItem("authLogoutMessage", message);
      }

      if (window.location.pathname !== "/admin/login") {
        window.location.replace("/admin/login");
      }

      setTimeout(() => {
        isHandlingAuthFailure.current = false;
      }, 300);
    };

    setAuthFailureHandler(handleAuthFailure);

    return () => {
      setAuthFailureHandler(null);
    };
  }, []);

  useEffect(() => {
    if (!token) return;

    const bootstrapAuth = async () => {
      try {
        const { data } = await api.get("/users/me");
        setUser(data.data);
        localStorage.setItem("user", JSON.stringify(data.data));
      } catch {
        // Interceptor handles logout/redirect centrally.
      }
    };

    bootstrapAuth();
  }, [token]);

  const isAuthenticated = !!token;
  const isAdmin = user?.isAdmin === true;
  const isStaff = user?.isStaff === true;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated,
        isAdmin,
        isStaff,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
