import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // step 1: enter email, step 2: enter otp and new password
  const [step, setStep] = useState(1);
  const [localError, setLocalError] = useState('');
  const [message, setMessage] = useState('');
  
  const { forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setMessage('');
    
    const result = await forgotPassword(email);
    if (result.success) {
      setMessage(result.message || 'Reset code sent to your email.');
      setStep(2);
    } else {
      setLocalError(result.message || 'Failed to send reset code.');
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setMessage('');

    const result = await resetPassword(email, otp, newPassword);
    if (result.success) {
      setMessage('Password reset successfully. You can now login.');
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setLocalError(result.message || 'Failed to reset password.');
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 transition-colors duration-200">
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
          {step === 1 ? 'Forgot Password' : 'Reset Password'}
        </h2>
        
        {localError && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4">
            {localError}
          </div>
        )}
        
        {message && (
          <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded mb-4">
            {message}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleEmailSubmit}>
            <div className="mb-6">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="email">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
            >
              Send Reset Code
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="otp">
                Reset Code (OTP)
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="newPassword">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600 transition duration-200"
            >
              Reset Password
            </button>
          </form>
        )}
        
        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Remembered your password? <Link to="/login" className="text-blue-500 hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
