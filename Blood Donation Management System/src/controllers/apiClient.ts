import axios from 'axios';

// @ts-ignore
const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Helper to determine role from path (Duplicate of AuthContext logic, ideally shared)
const getRoleFromPath = (path: string): string => {
  if (path.startsWith('/super-admin')) return 'super_admin';
  if (path.startsWith('/admin')) return 'admin';
  if (path.startsWith('/staff')) return 'staff';
  if (path.startsWith('/hospital')) return 'hospital';
  if (path.startsWith('/donor-dashboard') || path.startsWith('/donors') || path.startsWith('/history') || path.startsWith('/requests') || path.startsWith('/inventory')) return 'donor';
  return 'donor';
};

apiClient.interceptors.request.use((config) => {
  // Determine context from window location
  const role = getRoleFromPath(window.location.pathname);

  // Try role-specific token first
  let token = sessionStorage.getItem(`token_${role}`) || localStorage.getItem(`token_${role}`);

  // Fallback for shared pages (like generic /api calls if any) or if no specific token found
  if (!token) {
    // Maybe check others? strictly speaking we should only send if context matches.
    // But for now let's just use what we found.
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));


