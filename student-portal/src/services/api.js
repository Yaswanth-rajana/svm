import axios from 'axios';
import { getSession, clearSession } from '../utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

// Request Interceptor: Attach bearer token and student session header
// Development only: x-student-email header session linkage. Replace with JWT bearer authentication in production.
api.interceptors.request.use(
  (config) => {
    const session = getSession();
    if (session?.token) {
      config.headers.Authorization = `Bearer ${session.token}`;
    }
    if (session?.email) {
      config.headers['x-student-email'] = session.email;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global error logging and session expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearSession();
    }
    return Promise.reject(error);
  }
);

export default api;
