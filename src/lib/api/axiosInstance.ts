import axios from 'axios';

const api = axios.create({
  baseURL: process.env.API_URL || 'http://localhost:3000/api',
  withCredentials: true,
  timeout: 1800000,
});

export default api;
