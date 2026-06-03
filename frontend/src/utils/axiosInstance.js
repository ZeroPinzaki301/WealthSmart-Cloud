import axios from 'axios';

// Determine the base URL properly
const getBaseURL = () => {
  // Use Lambda URL if provided (production)
  if (import.meta.env.VITE_BACKEND_URL_LAMBDA) {
    return `${import.meta.env.VITE_BACKEND_URL_LAMBDA}/api`;
  }
  // Use local URL if provided
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  // Fallback
  return 'http://localhost:5000/api';
};

const baseURL = getBaseURL();

console.log('Axios baseURL:', baseURL);

const axiosInstance = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Don't retry if it's a login/register request
    if (originalRequest.url?.includes('/login') || 
        originalRequest.url?.includes('/register') ||
        originalRequest._retry) {
      return Promise.reject(error);
    }
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // ✅ FIXED: Use axiosInstance, not hardcoded URL
        const response = await axiosInstance.post('/auth/refresh-token', {}, { withCredentials: true });
        
        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
        
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;