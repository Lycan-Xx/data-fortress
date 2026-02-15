import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let authToken: string | null = null;

export const setToken = (token: string | null) => {
  authToken = token;
};

export const getToken = () => authToken;

// Inject JWT on every request
api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

// Auth
export const checkAuthStatus = () => api.get('/api/auth/status');
export const setupMasterPassword = (masterPassword: string) =>
  api.post('/api/auth/setup', { masterPassword });
export const login = (masterPassword: string) =>
  api.post('/api/auth/login', { masterPassword });

// Credentials
export const getCredentials = () => api.get('/api/credentials');
export const createCredential = (data: {
  site_name: string;
  site_url: string;
  username: string;
  password: string;
}) => api.post('/api/credentials', data);
export const updateCredential = (
  id: number,
  data: Partial<{
    site_name: string;
    site_url: string;
    username: string;
    password: string;
  }>
) => api.put(`/api/credentials/${id}`, data);
export const deleteCredential = (id: number) =>
  api.delete(`/api/credentials/${id}`);
export const revealPassword = (id: number) =>
  api.get(`/api/credentials/${id}/reveal`);

// Breach
export const scanBreaches = (credentialId?: number) =>
  api.post('/api/breach/scan', credentialId ? { credentialId } : {});

export default api;
