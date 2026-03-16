import axios from "axios";

let authFailureHandler = null;

export const setAuthFailureHandler = (handler) => {
  authFailureHandler = handler;
};

const api = axios.create({
  baseURL: `${process.env.REACT_APP_API_ADDRESS}/api/${process.env.REACT_APP_API_VERSION}`,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const hasStoredToken = !!localStorage.getItem("accessToken");
    const requestUrl = error?.config?.url || "";

    const isAuthFailure = status === 401 || status === 403;
    const isLoginRequest = requestUrl.includes("/users/login");

    if (
      hasStoredToken &&
      isAuthFailure &&
      !isLoginRequest &&
      authFailureHandler
    ) {
      const message =
        error?.response?.data?.message ||
        "Session expired. Please login again.";
      authFailureHandler(message);
    }

    return Promise.reject(error);
  },
);

export default api;
