import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const GlobalBackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const hiddenRoutes = ['/', '/login', '/register'];

  if (hiddenRoutes.includes(location.pathname)) {
    return null;
  }

  return (
    <button
      onClick={() => navigate('/')}
      className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition duration-200 z-50 flex items-center justify-center"
      title="Back to Home"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    </button>
  );
};

export default GlobalBackButton;
