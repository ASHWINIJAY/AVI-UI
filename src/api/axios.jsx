import axios from "axios";

const api = axios.create({
  baseURL: "http://41.87.206.94/AVIapi/api", // update port if needed
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;