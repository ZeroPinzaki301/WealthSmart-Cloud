import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const api = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL_LAMBDA || import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api`,
    withCredentials: true
  });
  
  // Add token to requests
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  
  // Handle token refresh
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      // Don't retry if it's a login/register request or already retried
      if (originalRequest.url?.includes('/login') || 
          originalRequest.url?.includes('/register') ||
          originalRequest._retry) {
        return Promise.reject(error);
      }
      
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          // Try to refresh the token
          const response = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL_LAMBDA || import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api"}/auth/refresh-token`,
            {},
            { withCredentials: true }
          );
          
          const { accessToken } = response.data;
          localStorage.setItem("accessToken", accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
          
        } catch (refreshError) {
          // Refresh failed - logout
          localStorage.removeItem("accessToken");
          setUser(null);
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
      
      return Promise.reject(error);
    }
  );
  
  const register = async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  };
  
  const login = async (identifier, password) => {
    try {
      const response = await api.post("/auth/login", { email: identifier, password });
      const { accessToken, user } = response.data;
      
      console.log('Login response - accessToken:', accessToken ? 'Present' : 'Missing');
      console.log('Login response - user:', user);
      
      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
        console.log('Token stored in localStorage');
      } else {
        console.error('No accessToken in login response!');
      }
      
      setUser(user);
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };
  
  const verifyEmail = async (email, code) => {
    const response = await api.post("/auth/verify-email", { email, code });
    return response.data;
  };
  
  const resendVerificationCode = async (email) => {
    const response = await api.post("/auth/resend-verification", { email });
    return response.data;
  };
  
  const logout = async () => {
    try {
      // Call logout endpoint to clear refresh token on server
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear local storage and state
      localStorage.removeItem("accessToken");
      setUser(null);
      
      // Clear any remaining cookies by setting them to expire
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    }
  };
  
  const loadUser = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        const response = await api.get("/auth/me");
        setUser(response.data.user);
      }
    } catch (error) {
      console.error("Load user error:", error);
      localStorage.removeItem("accessToken");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadUser();
  }, []);
  
  return (
    <AuthContext.Provider value={{
      user,
      loading,
      register,
      login,
      verifyEmail,
      resendVerificationCode,
      logout,
      loadUser,
      api
    }}>
      {children}
    </AuthContext.Provider>
  );
};