import axios from 'axios';
import { env } from '@/config/env';

const api = axios.create({
  baseURL: env.api.url,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(env.auth.tokenKey);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(env.auth.tokenKey);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 