import axios from "axios";

const api = axios.create({
  baseURL: "https://office.demandhatbd.com/api",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Automatically add the token to every request if it exists in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
