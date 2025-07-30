import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from '../common/Layout';
import LoadingSpinner from '../common/LoadingSpinner';
import { apiService } from '../../services/api';
import { format } from 'date-fns';

const ClockOut = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [step, setStep] = useState('location'); // 'location', 'otp'
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    setLoading(true);
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLoading(false);
      },
      (error) => {
        let errorMessage = 'Failed to get location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
          default:
            errorMessage = 'An unknown error occurred';
            break;
        }
        setLocationError(errorMessage);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleInitiateClockOut = async () => {
    if (!location) {
      toast.error('Location is required for clock out');
      return;
    }

    setLoading(true);
    try {
      await apiService.initiateClockOut({
        latitude: location.latitude,
        longitude: location.longitude
      });
      
      toast.success('OTP sent to your email. Please check and enter below.');
      setStep('otp');
    } catch (error) {
      console.error('Clock out initiation error:', error);
      toast.error(error.response?.data?.message || 'Failed to initiate clock out');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    
    if (!otp.trim()) {
      toast.error('Please enter the OTP');
      return;
    }

    if (!location) {
      toast.error('Location is required for clock out verification');
      return;
    }

    setOtpLoading(true);
    try {
      await apiService.verifyClockOut({
        otp: otp.trim(),
        latitude: location.latitude,
        longitude: location.longitude
      });
      
      toast.success('Clock out successful!');
      navigate('/employee');
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const currentTime = format(new Date(), 'HH:mm:ss');
  const currentDate = format(new Date(), 'EEEE, MMMM dd, yyyy');

  return (
    <Layout title="Clock Out">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Clock Out</h2>
              <p className="text-sm text-gray-500 mt-2">{currentDate}</p>
              <p className="text-lg font-semibold text-blue-600">{currentTime}</p>
            </div>

            {step === 'location' && (
              <div className="space-y-6">
                {/* Location Status */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Location Verification</h3>
                  
                  {loading && (
                    <div className="flex items-center justify-center py-4">
                      <LoadingSpinner />
                      <span className="ml-2 text-sm text-gray-600">Getting your location...</span>
                    </div>
                  )}

                  {locationError && (
                    <div className="text-center py-4">
                      <div className="text-red-600 mb-2">
                        <svg className="h-8 w-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-sm text-red-600 mb-3">{locationError}</p>
                      <button
                        onClick={getCurrentLocation}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                      >
                        Retry Location
                      </button>
                    </div>
                  )}

                  {location && !loading && (
                    <div className="text-center py-4">
                      <div className="text-green-600 mb-2">
                        <svg className="h-8 w-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-sm text-green-600 mb-2">Location verified successfully</p>
                      <p className="text-xs text-gray-500">
                        Coordinates: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Clock Out Button */}
                <div className="text-center">
                  <button
                    onClick={handleInitiateClockOut}
                    disabled={!location || loading}
                    className={`w-full px-6 py-3 rounded-md text-lg font-medium ${
                      !location || loading
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {loading ? 'Processing...' : 'Clock Out Now'}
                  </button>
                </div>
              </div>
            )}

            {step === 'otp' && (
              <div className="space-y-6">
                {/* OTP Form */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Enter OTP</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    We've sent a verification code to your registered email address.
                  </p>
                  
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div>
                      <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                        Verification Code
                      </label>
                      <input
                        type="text"
                        id="otp"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter 6-digit OTP"
                        maxLength="6"
                        required
                      />
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        disabled={otpLoading}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                      >
                        {otpLoading ? 'Verifying...' : 'Verify & Clock Out'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep('location')}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Back
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Cancel Button */}
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/employee')}
                className="text-gray-600 hover:text-gray-800 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ClockOut;

