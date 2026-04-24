import axios from 'axios';
import { DEV_TOKEN } from './constants';

const API_BASE = import.meta.env.VITE_API_URL ?? 'https://api.gradicent.io/v1';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('gradicent_token') ?? DEV_TOKEN;
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('gradicent_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
