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

export const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));


