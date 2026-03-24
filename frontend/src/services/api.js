import axios from "axios";
import { API_BASE_URL } from "../utils/constants.js";
import { getToken, setToken, removeToken } from "../utils/helpers.js";

// ── Axios Instance ────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL:         API_BASE_URL,
  withCredentials: true,       // cookies send/receive cross-origin
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request Interceptor ───────────────────────────────────────────────────────
// Har request se pehle Authorization header mein token lagao
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ──────────────────────────────────────────────────────
// Access token expire ho gaya → refresh token se naya lo, request retry karo
let isRefreshing = false;
let failedQueue  = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  // ── Success → directly return response ──────────────────────────────────────
  (response) => response,

  // ── Error → handle 401 (token expired) ──────────────────────────────────────
  async (error) => {
    const originalRequest = error.config;

    // Agar 401 aaya aur refresh already try nahi kiya
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh-token") &&
      !originalRequest.url.includes("/auth/login")
    ) {
      if (isRefreshing) {
        // Queue mein daal do — refresh complete hone ka wait karo
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing            = true;

      try {
        // Refresh token se naya access token lo
        const response = await api.post("/auth/refresh-token");
        const newToken = response.data?.data?.accessToken;

        setToken(newToken);
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;

        processQueue(null, newToken);

        // Original failed request retry karo
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh bhi fail ho gaya → logout karo
        processQueue(refreshError, null);
        removeToken();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;