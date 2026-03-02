// src/config/axios.config.ts
import axios from 'axios';
import { API_ENDPOINTS, API_CONFIG } from './api.config';

// the build process should supply VITE_API_URL; fail early if it's absent
const baseURL = import.meta.env.VITE_API_URL as string;
if (!baseURL) {
  // in development we might want a fallback, but for production it's safer to crash
  console.error('VITE_API_URL is not defined – set it in your .env or build environment');
}

const axiosInstance = axios.create({
  baseURL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  maxBodyLength: Infinity,
  maxContentLength: Infinity,
});

// ── Request interceptor — attach Bearer token ─────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — global error handling ──────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      const requestUrl: string = error.config?.url || '';

      switch (status) {
        case 401: {
          // Let auth.service handle login/signup 401s (wrong password etc.)
          // Don't redirect — just let the error propagate to the caller
          const isLoginRequest  = requestUrl.includes(API_ENDPOINTS.AUTH.LOGIN);
          const isSignupRequest = requestUrl.includes(API_ENDPOINTS.AUTH.SIGNUP);

          if (isLoginRequest || isSignupRequest) break;

          // All other 401s = expired/invalid token while using the app
          // Clear session and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;
        }

        case 403:
          console.error('Access forbidden:', data?.message);
          break;

        case 404:
          console.error('Resource not found:', data?.message);
          break;

        case 500:
          console.error('Server error:', data?.message);
          break;

        default:
          console.error('API Error:', data?.message);
      }

    } else if (error.request) {
      console.error('Network error - no response from server');
    } else {
      console.error('Request error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;