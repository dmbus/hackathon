import axios from 'axios';

const getBaseUrl = () => {
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
    // Default to local backend for development
    return 'http://localhost:8000';
};

export const API_BASE_URL = getBaseUrl();

export const api = axios.create({
    baseURL: API_BASE_URL,
});
