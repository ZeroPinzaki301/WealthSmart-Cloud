import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { TbEye, TbEyeOff, TbMail, TbLock, TbArrowLeft, TbUser } from "react-icons/tb";
import { useAuth } from "../context/AuthContext";
import WealthSmartBG from '../assets/WealthSmartBG.png';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    identifier: "",
    password: ""
  });
  
  // Refs for direct DOM manipulation
  const identifierRef = useRef(null);
  const passwordRef = useRef(null);

  // Clear form EVERY time the login component mounts/loads
  useEffect(() => {
    // Reset React state to empty strings
    setFormData({
      identifier: "",
      password: ""
    });
    setError(null);
    setShowPassword(false);
    
    // Direct DOM manipulation to ensure inputs are empty
    if (identifierRef.current) {
      identifierRef.current.value = "";
    }
    if (passwordRef.current) {
      passwordRef.current.value = "";
    }
    
    // Extra aggressive clearing after a tiny delay to catch any browser autofill
    const timer = setTimeout(() => {
      if (identifierRef.current) {
        if (identifierRef.current.value !== "") {
          identifierRef.current.value = "";
          setFormData(prev => ({ ...prev, identifier: "" }));
        }
      }
      if (passwordRef.current) {
        if (passwordRef.current.value !== "") {
          passwordRef.current.value = "";
          setFormData(prev => ({ ...prev, password: "" }));
        }
      }
    }, 10);
    
    return () => clearTimeout(timer);
  }, []); // Empty dependency array ensures this runs on every mount

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.identifier || !formData.password) {
      setError("Please enter both email/username and password");
      return;
    }
    
    setLoading(true);
    
    try {
      // Pass the identifier (which can be email OR username) to login
      await login(formData.identifier, formData.password);
      navigate("/dashboard");
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.needsVerification) {
        // Redirect to verification page
        navigate("/verify-email", { 
          state: { 
            email: err.response?.data?.email || formData.identifier,
            message: "Please verify your email address first."
          } 
        });
      } else {
        setError(err.response?.data?.message || "Login failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto md:px-4 md:py-8 md:min-h-screen flex items-center justify-center">
      <div 
        className="absolute fixed inset-0 bg-secondary z-0"
        style={{
          maskImage: `url(${WealthSmartBG})`,
          maskSize: 'cover',
          maskPosition: 'center',
          maskRepeat: 'no-repeat',
          height: '100vh',
        }}
      />
      
      <div className="relative backdrop-blur-[3px] z-10 w-full max-w-md mx-auto bg-secondary-darkest/90 border rounded-lg p-8 md:top-4 -top-[3em]  sm:w-full md:mx-auto sm:mx-none">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/")}
            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
          >
            <TbArrowLeft className="text-2xl" />
          </button>
          <h1 className="text-3xl font-bold text-primary">Sign In</h1>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
          <div>
            <label className="block text-text font-medium mb-2">
              Email or Username
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted">
                <TbMail className="text-lg absolute -translate-y-1/2 top-1/2" />
                <TbUser className="text-lg absolute -translate-y-1/2 top-1/2 opacity-0" />
              </div>
              <input
                ref={identifierRef}
                type="text"
                name="identifier"
                value={formData.identifier}
                onChange={handleInputChange}
                autoComplete="off"
                className="w-full pl-10 pr-4 py-2 bg-background-subtle border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text"
                placeholder="email@example.com or username"
                disabled={loading}
                required
              />
            </div>
            <p className="text-xs text-text-muted mt-1">
              Use your email address or username
            </p>
          </div>
          
          <div>
            <label className="block text-text font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <TbLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted text-lg" />
              <input
                ref={passwordRef}
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                autoComplete="new-password"
                className="w-full pl-10 pr-10 py-2 bg-background-subtle border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text"
                placeholder="Enter your password"
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-primary"
              >
                {showPassword ? <TbEyeOff className="text-lg" /> : <TbEye className="text-lg" />}
              </button>
            </div>
          </div>

          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-primary hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-darkest transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-text-muted">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:underline font-semibold">
              Create one here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}