import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

// Use VITE_API_URL env var if provided (e.g. http://127.0.0.1:8000).
// When empty, all requests go to the same origin (/api/...) and are
// proxied to the backend by the Vite dev/preview server — avoiding CORS.
const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// A plain axios instance used ONLY for refreshing the access token.
// It must NOT go through the auth interceptors (avoiding infinite loops),
// but it still respects the baseURL.
const refreshAxios = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

// Single-flight refresh promise so concurrent 401s share ONE refresh call.
// This is critical because the backend rotates the refresh token — if two
// requests refresh simultaneously, the second one would fail with the now-
// invalidated refresh token.
let refreshPromise: Promise<string> | null = null;

const clearTokens = () => {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
};

const redirectToLogin = () => {
  clearTokens();
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

const doRefresh = async (): Promise<string> => {
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (!refreshToken) {
    throw new Error("No refresh token");
  }

  const res = await refreshAxios.post("/api/auth/refresh", {
    refresh_token: refreshToken,
  });

  const newAccessToken = res.data.access_token;
  if (!newAccessToken) {
    throw new Error("Refresh returned no access token");
  }
  localStorage.setItem(ACCESS_KEY, newAccessToken);

  // Token rotation: the refresh endpoint also returns a new refresh token.
  if (res.data.refresh_token) {
    localStorage.setItem(REFRESH_KEY, res.data.refresh_token);
  }

  return newAccessToken;
};

// Returns a promise that resolves to a fresh access token.
// Uses single-flight to avoid concurrent refresh calls (token rotation).
const getFreshAccessToken = (): Promise<string> => {
  if (!refreshPromise) {
    refreshPromise = doRefresh()
      .then((token) => {
        refreshPromise = null;
        return token;
      })
      .catch((err) => {
        refreshPromise = null;
        throw err;
      });
  }
  return refreshPromise;
};

// Request interceptor: attach access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: handle 401 and auto-refresh (single-flight).
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only handle 401 + not already retried + not the refresh/login endpoints.
    const isAuthEndpoint = originalRequest?.url?.includes("/api/auth/");
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;

      try {
        const newToken = await getFreshAccessToken();
        // Retry the original request with the fresh token.
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch {
        // Refresh failed — logout and redirect.
        redirectToLogin();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
