import axios from "axios";

let authFailureHandler = null;

export const setAuthFailureHandler = (handler) => {
  authFailureHandler = handler;
};

const api = axios.create({
  baseURL: `${process.env.REACT_APP_API_ADDRESS}/api/${process.env.REACT_APP_API_VERSION}`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let pendingRequests = [];

const resolvePendingRequests = (error) => {
  pendingRequests.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  });
  pendingRequests = [];
};

const shouldTryRefresh = (error) => {
  const status = error?.response?.status;
  const originalRequest = error?.config || {};
  const requestUrl = originalRequest.url || "";

  if (status !== 401) return false;
  if (originalRequest.skipAuth === true) return false;
  if (originalRequest._retry === true) return false;
  if (requestUrl.includes("/users/login")) return false;
  if (requestUrl.includes("/users/refresh")) return false;

  return true;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config || {};

    if (shouldTryRefresh(error)) {
      if (isRefreshing) {
        try {
          await new Promise((resolve, reject) => {
            pendingRequests.push({ resolve, reject });
          });

          originalRequest._retry = true;
          return api(originalRequest);
        } catch (queuedError) {
          return Promise.reject(queuedError);
        }
      }

      isRefreshing = true;
      originalRequest._retry = true;

      try {
        await api.post("/users/refresh", {}, { skipAuth: true });
        resolvePendingRequests(null);
        return api(originalRequest);
      } catch (refreshError) {
        resolvePendingRequests(refreshError);

        if (authFailureHandler) {
          const message =
            refreshError?.response?.data?.message ||
            "Session expired. Please login again.";
          authFailureHandler(message);
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const status = error?.response?.status;
    const requestUrl = error?.config?.url || "";

    const isAuthFailure = status === 401 || status === 403;
    const isLoginRequest = requestUrl.includes("/users/login");
    const isRefreshRequest = requestUrl.includes("/users/refresh");
    const isPublicRequest = error?.config?.skipAuth === true;

    if (
      isAuthFailure &&
      !isLoginRequest &&
      !isRefreshRequest &&
      !isPublicRequest &&
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
