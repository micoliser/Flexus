import { createContext, useState, useContext, useEffect, useRef } from "react";
import api, { setAuthFailureHandler } from "../api/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const isHandlingAuthFailure = useRef(false);

  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const logoutWithRequest = async () => {
    try {
      await api.post("/users/logout", {}, { skipAuth: true });
    } catch {
      // Ignore network/logout errors and always clear local auth state.
    } finally {
      logout();
    }
  };

  useEffect(() => {
    const handleAuthFailure = (message) => {
      if (isHandlingAuthFailure.current) return;

      isHandlingAuthFailure.current = true;

      logoutWithRequest();

      if (message) {
        sessionStorage.setItem("authLogoutMessage", message);
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
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const { data } = await api.get("/users/me", { skipAuth: true });
        setUser(data.data);
      } catch {
        setUser(null);
      } finally {
        setIsAuthReady(true);
      }
    };

    bootstrapAuth();
  }, []);

  const isAuthenticated = !!user;
  const isAdmin = user?.isAdmin === true;
  const isStaff = user?.isStaff === true;

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout: logoutWithRequest,
        isAuthenticated,
        isAuthReady,
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
