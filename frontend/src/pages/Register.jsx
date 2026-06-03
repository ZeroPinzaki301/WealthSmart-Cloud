import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { TbArrowLeft, TbEye, TbEyeOff, TbMail, TbUser, TbCalendar, TbLock } from "react-icons/tb";
import { useAuth } from "../context/AuthContext";
import WealthSmartBG from '../assets/WealthSmartBG.png';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    sex: "",
    birthdate: ""
  });

  // Refs for direct DOM manipulation
  const emailRef = useRef(null);
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const firstNameRef = useRef(null);
  const middleNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const sexRef = useRef(null);
  const birthdateRef = useRef(null);

  // Clear form EVERY time the register component mounts/loads
  useEffect(() => {
    // Reset React state to empty strings
    setFormData({
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      sex: "",
      birthdate: ""
    });
    setError(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setPasswordStrength({
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false
    });
    
    // Direct DOM manipulation to ensure inputs are empty
    const inputs = [emailRef, usernameRef, passwordRef, confirmPasswordRef, firstNameRef, middleNameRef, lastNameRef, sexRef, birthdateRef];
    inputs.forEach(ref => {
      if (ref.current) {
        ref.current.value = "";
      }
    });
    
    // Extra aggressive clearing after a tiny delay to catch any browser autofill
    const timer = setTimeout(() => {
      inputs.forEach(ref => {
        if (ref.current && ref.current.value !== "") {
          ref.current.value = "";
        }
      });
      setFormData({
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
        first_name: "",
        middle_name: "",
        last_name: "",
        sex: "",
        birthdate: ""
      });
    }, 10);
    
    return () => clearTimeout(timer);
  }, []); // Empty dependency array ensures this runs on every mount

  // Password strength indicators
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  // Check password strength in real-time
  const checkPasswordStrength = (password) => {
    setPasswordStrength({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>_\[\]]/.test(password)
    });
    return password;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === "password") {
      checkPasswordStrength(value);
    }
    
    if (error) setError(null);
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    
    if (formData.username.length < 3) {
      setError("Username must be at least 3 characters long");
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setError("Username can only contain letters, numbers, and underscores");
      return false;
    }
    
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    if (!passwordStrength.uppercase) {
      setError("Password must contain at least one uppercase letter");
      return false;
    }
    if (!passwordStrength.lowercase) {
      setError("Password must contain at least one lowercase letter");
      return false;
    }
    if (!passwordStrength.number) {
      setError("Password must contain at least one number");
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    
    if (!formData.first_name.trim()) {
      setError("First name is required");
      return false;
    }
    if (!formData.last_name.trim()) {
      setError("Last name is required");
      return false;
    }
    
    if (!formData.sex) {
      setError("Please select your gender");
      return false;
    }
    
    const birthDate = new Date(formData.birthdate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    if (age < 13) {
      setError("You must be at least 13 years old to register");
      return false;
    }
    if (age > 120) {
      setError("Please enter a valid birthdate");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const registrationData = {
        email: formData.email,
        username: formData.username,
        password: formData.password,
        first_name: formData.first_name,
        middle_name: formData.middle_name || null,
        last_name: formData.last_name,
        sex: formData.sex,
        birthdate: formData.birthdate
      };
      
      const response = await register(registrationData);
      
      // Redirect to verification page with email
      navigate("/verify-email", { 
        state: { 
          email: formData.email,
          message: response.message || "Please check your email for verification code."
        } 
      });
      
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthPercent = () => {
    const checks = Object.values(passwordStrength);
    const trueCount = checks.filter(Boolean).length;
    return (trueCount / 5) * 100;
  };

  const getPasswordStrengthColor = () => {
    const percent = getPasswordStrengthPercent();
    if (percent <= 20) return "bg-red-500";
    if (percent <= 40) return "bg-orange-500";
    if (percent <= 60) return "bg-yellow-500";
    if (percent <= 80) return "bg-blue-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    const percent = getPasswordStrengthPercent();
    if (percent <= 20) return "Very Weak";
    if (percent <= 40) return "Weak";
    if (percent <= 60) return "Fair";
    if (percent <= 80) return "Good";
    return "Strong";
  };

  return (
    <div className="container mx-auto md:px-4 md:py-8 min-h-screen flex items-center justify-center">
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
      
      <div className="relative backdrop-blur-[3px] z-10 w-full max-w-4xl mx-auto bg-secondary-darkest/90 border rounded-lg md:p-8 p-4 md:top-4 -top-[4.75em] sm:w-full md:mx-auto sm:mx-none">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary text-center">Create Account</h1>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
          <div className="bg-background rounded-lg border border-border p-6">
            <h2 className="text-xl font-semibold text-primary mb-4 text-center">Account Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-text font-medium mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <TbMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted text-lg" />
                  <input
                    ref={emailRef}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    autoComplete="off"
                    className="w-full pl-10 pr-4 py-2 bg-background-subtle border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text"
                    placeholder="you@example.com"
                    disabled={loading}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-text font-medium mb-2">
                  Username *
                </label>
                <div className="relative">
                  <TbUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted text-lg" />
                  <input
                    ref={usernameRef}
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    autoComplete="off"
                    className="w-full pl-10 pr-4 py-2 bg-background-subtle border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text"
                    placeholder="username123"
                    disabled={loading}
                    required
                  />
                </div>
                <p className="text-xs text-text-muted mt-1">
                  Only letters, numbers, and underscores. Min. 3 characters.
                </p>
              </div>
              
              <div>
                <label className="block text-text font-medium mb-2">
                  Password *
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
                    placeholder="Create a strong password"
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
                
                {formData.password && (
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex-1 h-2 bg-background-subtle rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                          style={{ width: `${getPasswordStrengthPercent()}%` }}
                        />
                      </div>
                      <span className={`text-xs ml-2 ${getPasswordStrengthColor().replace('bg-', 'text-')}`}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className={`flex items-center gap-1 ${passwordStrength.length ? 'text-green-500' : 'text-text-muted'}`}>
                        <span>✓</span> 8+ characters
                      </div>
                      <div className={`flex items-center gap-1 ${passwordStrength.uppercase ? 'text-green-500' : 'text-text-muted'}`}>
                        <span>✓</span> Uppercase letter
                      </div>
                      <div className={`flex items-center gap-1 ${passwordStrength.lowercase ? 'text-green-500' : 'text-text-muted'}`}>
                        <span>✓</span> Lowercase letter
                      </div>
                      <div className={`flex items-center gap-1 ${passwordStrength.number ? 'text-green-500' : 'text-text-muted'}`}>
                        <span>✓</span> Number
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-text font-medium mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <TbLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted text-lg" />
                  <input
                    ref={confirmPasswordRef}
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    autoComplete="new-password"
                    className="w-full pl-10 pr-10 py-2 bg-background-subtle border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text"
                    placeholder="Confirm your password"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-primary"
                  >
                    {showConfirmPassword ? <TbEyeOff className="text-lg" /> : <TbEye className="text-lg" />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-background rounded-lg border border-border p-6">
            <h2 className="text-xl font-semibold text-primary mb-4">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-text font-medium mb-2">
                  First Name *
                </label>
                <input
                  ref={firstNameRef}
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  autoComplete="off"
                  className="w-full px-4 py-2 bg-background-subtle border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text"
                  placeholder="John"
                  disabled={loading}
                  required
                />
              </div>
              
              <div>
                <label className="block text-text font-medium mb-2">
                  Middle Name (Optional)
                </label>
                <input
                  ref={middleNameRef}
                  type="text"
                  name="middle_name"
                  value={formData.middle_name}
                  onChange={handleInputChange}
                  autoComplete="off"
                  className="w-full px-4 py-2 bg-background-subtle border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text"
                  placeholder="Robert"
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-text font-medium mb-2">
                  Last Name *
                </label>
                <input
                  ref={lastNameRef}
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  autoComplete="off"
                  className="w-full px-4 py-2 bg-background-subtle border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text"
                  placeholder="Doe"
                  disabled={loading}
                  required
                />
              </div>
              
              <div>
                <label className="block text-text font-medium mb-2">
                  Gender *
                </label>
                <select
                  ref={sexRef}
                  name="sex"
                  value={formData.sex}
                  onChange={handleInputChange}
                  autoComplete="off"
                  className="w-full px-4 py-2 bg-background-subtle border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text"
                  disabled={loading}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-text font-medium mb-2">
                  Birthdate *
                </label>
                <div className="relative">
                  <TbCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted text-lg" />
                  <input
                    ref={birthdateRef}
                    type="date"
                    name="birthdate"
                    value={formData.birthdate}
                    onChange={handleInputChange}
                    autoComplete="off"
                    className="w-full pl-10 pr-4 py-2 bg-background-subtle border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text"
                    disabled={loading}
                    required
                  />
                </div>
                <p className="text-xs text-text-muted mt-1">
                  You must be at least 13 years old
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="terms"
              className="mt-1"
              required
              autoComplete="off"
            />
            <label htmlFor="terms" className="text-sm text-text">
              I agree to the <a href="/terms" className="text-primary hover:underline">Terms of Service</a> and 
              {" "}<a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
            </label>
          </div>

          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-6 py-2 bg-background-subtle text-text border border-border rounded-lg hover:bg-background transition-colors cursor-pointer"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-darkest transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-text-muted">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-semibold">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}