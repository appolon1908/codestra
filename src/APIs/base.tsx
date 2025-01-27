import axios from "axios";

export const base_url = axios.create({
    baseURL: import.meta.env.VITE_API_ENDPOINT,
    timeout: 35000,
});


export const setAuthToken = () => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      base_url.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete base_url.defaults.headers.common["Authorization"];
    }
  };
  
  base_url.interceptors.response.use((response) => response);
  