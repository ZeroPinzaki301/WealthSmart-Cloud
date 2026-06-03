import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { TbArrowLeft, TbMail, TbSend, TbCheck } from "react-icons/tb";
import { useAuth } from "../context/AuthContext";
import WealthSmartBG from '../assets/WealthSmartBG.png';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyEmail, resendVerificationCode } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  
  const email = location.state?.email || "";
  const initialMessage = location.state?.message || "";

  useEffect(() => {
    if (initialMessage) {
      setSuccess(initialMessage);
    }
    if (!email) {
      navigate("/login");
    }
  }, [email, navigate, initialMessage]);

  const handleCodeChange = (index, value) => {
    if (value.length > 1) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    const verificationCode = code.join("");
    if (verificationCode.length !== 6) {
      setError("Please enter the 6-digit verification code");
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await verifyEmail(email, verificationCode);
      setSuccess(response.message || "Email verified successfully!");
      
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    setError(null);
    
    try {
      const response = await resendVerificationCode(email);
      setSuccess(response.message || "New verification code sent to your email.");
      setCode(["", "", "", "", "", ""]);
      document.getElementById("code-0")?.focus();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend verification code.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-0">
      {/* Background Image */}
      <div 
        className="fixed inset-0 bg-secondary z-0"
        style={{
          maskImage: `url(${WealthSmartBG})`,
          maskSize: 'cover',
          maskPosition: 'center',
          maskRepeat: 'no-repeat',
          height: '100vh',
        }}
      />
      
      {/* Main Container */}
      <div className="relative backdrop-blur-[3px] z-10 md:top-4 -top-[4em] md:max-w-[50%] mx-auto bg-secondary-darkest/90 border rounded-lg p-4 sm:p-8 mb-20 sm:mb-6">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/login")}
            className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
          >
            <TbArrowLeft className="text-xl sm:text-2xl" />
          </button>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">Verify Email</h1>
        </div>

        {/* Icon and Email Info */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <TbMail className="text-2xl sm:text-3xl text-primary" />
          </div>
          <p className="text-text text-sm sm:text-base mb-1">
            We've sent a verification code to:
          </p>
          <p className="text-primary font-semibold text-sm sm:text-base break-all">{email}</p>
          <p className="text-text-muted text-xs sm:text-sm mt-2">
            Enter the 6-digit code below to verify your account.
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-500/10 border border-green-500 text-green-500 rounded-lg p-3 mb-4 flex items-center gap-2 text-sm">
            <TbCheck className="text-base flex-shrink-0" />
            <p className="flex-1 break-words">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-3 mb-4 text-sm break-words">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-text font-medium mb-3 text-center text-sm sm:text-base">
              Verification Code
            </label>
            <div className="flex justify-center gap-2 sm:gap-3">
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-10 h-10 sm:w-12 sm:h-12 text-center text-xl sm:text-2xl font-bold bg-background-subtle border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text"
                  disabled={loading}
                  autoFocus={index === 0}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-darkest transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <TbCheck className="text-base sm:text-lg" />
                Verify Account
              </>
            )}
          </button>
        </form>

        {/* Resend Code */}
        <div className="mt-6 text-center">
          <p className="text-text-muted text-xs sm:text-sm">
            Didn't receive the code?{" "}
            <button
              onClick={handleResendCode}
              disabled={resendLoading}
              className="text-primary hover:underline font-semibold disabled:opacity-50 inline-flex items-center gap-1"
            >
              {resendLoading ? (
                <>
                  <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <TbSend className="text-xs sm:text-sm" />
                  Resend Code
                </>
              )}
            </button>
          </p>
        </div>

        {/* Back to Login */}
        <div className="mt-4 text-center">
          <Link to="/login" className="text-text-muted text-xs sm:text-sm hover:text-primary transition-colors">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}