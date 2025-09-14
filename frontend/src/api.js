import axios from 'axios';

const BASE =
  (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.replace(/\/$/, '')) ||
  'http://localhost:8080';

export const api = axios.create({
  baseURL: BASE,           
  withCredentials: true,   
});

console.log('[api] baseURL =', api.defaults.baseURL);
