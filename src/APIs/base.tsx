import axios from "axios";

export const base_url = axios.create({
    baseURL: import.meta.env.VITE_API_ENDPOINT,
    timeout: 35000,
});