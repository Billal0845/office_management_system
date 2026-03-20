import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://office.demandhatbd.com/api", // Your Laravel API URL
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Automatically add the token to every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
