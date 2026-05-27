import axios from 'axios';

let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

if (baseUrl) {
    baseUrl = baseUrl.trim().replace(/\/$/, '');
    if (!baseUrl.endsWith('/api')) {
        baseUrl = `${baseUrl}/api`;
    }
}

const api = axios.create({
    baseURL: baseUrl,
});

// Request interceptor: attach token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: handle expired/invalid token
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Only redirect if we're not already on the login page to avoid 404 reloads on wrong credentials
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
