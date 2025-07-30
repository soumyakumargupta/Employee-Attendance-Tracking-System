import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // ← Removed unused 'Link'
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import { ShieldCheckIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

// Rest of the component remains the same...

const OTPVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const { verifyOTP, otpSession, clearOtpSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const inputRefs = useRef([]);

  // Get email from state or otpSession
  const email = location.state?.email || otpSession?.email;
  const message = location.state?.message || otpSession?.message;

  // Redirect if no OTP session
  useEffect(() => {
    if (!email && !otpSession) {
      toast.error('No OTP session found. Please login again.');
      navigate('/login', { replace: true });
    }
  }, [email, otpSession, navigate]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all fields filled
    if (newOtp.every(digit => digit !== '') && !isLoading) {
      handleSubmit(newOtp.join(''));
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
    setOtp(newOtp);

    // Auto-submit if complete
    if (pastedData.length === 6) {
      handleSubmit(pastedData);
    }
  };

  // Submit OTP verification
  const handleSubmit = async (otpCode = otp.join('')) => {
    if (otpCode.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP');
      return;
    }

    setIsLoading(true);

    try {
      const result = await verifyOTP(otpCode);

      if (result.success) {
        toast.success(`Welcome, ${result.user.firstName}!`);
        const redirectPath = result.user.role === 'admin' ? '/admin' : '/employee';
        navigate(redirectPath, { replace: true });
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error(error.message || 'Invalid OTP. Please try again.');
      
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP (placeholder - implement based on your backend)
  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      // Call your resend OTP API endpoint
      toast.info('New OTP sent to your email');
      setCountdown(30);
      setCanResend(false);
    } catch (error) {
      toast.error('Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Go back to login
  const handleGoBack = () => {
    clearOtpSession();
    navigate('/login');
  };

  if (!email && !otpSession) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <ShieldCheckIcon className="mx-auto h-16 w-16 text-primary-600" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Verify your email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a 6-digit verification code to
          </p>
          <p className="text-sm font-medium text-primary-600">
            {email}
          </p>
          {message && (
            <p className="mt-2 text-xs text-gray-500">
              {message}
            </p>
          )}
        </div>

        {/* OTP Input */}
        <div className="mt-8">
          <div className="flex justify-center space-x-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                maxLength={1}
                className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={digit}
                onChange={e => handleOtpChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={isLoading}
              />
            ))}
          </div>

          {/* Submit Button */}
          <div className="mt-6">
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={isLoading || otp.some(digit => digit === '')}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="small" />
                  <span className="ml-2">Verifying...</span>
                </div>
              ) : (
                'Verify OTP'
              )}
            </button>
          </div>

          {/* Resend OTP */}
          <div className="mt-4 text-center">
            {canResend ? (
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={isLoading}
                className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200"
              >
                Resend OTP
              </button>
            ) : (
              <p className="text-sm text-gray-600">
                Resend OTP in <span className="font-medium">{countdown}s</span>
              </p>
            )}
          </div>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={handleGoBack}
              className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-1" />
              Back to login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
