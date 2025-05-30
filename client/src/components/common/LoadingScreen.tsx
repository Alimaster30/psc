import React from 'react';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Logo */}
        <div className="mb-8">
          <img
            src="/logo.png"
            alt="Prime Skin Clinic"
            className="w-20 h-20 mx-auto object-contain"
          />
        </div>

        {/* Loading Animation */}
        <div className="relative mb-6">
          <div className="flex space-x-2 justify-center items-center">
            <div className="h-4 w-4 bg-primary-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-4 w-4 bg-primary-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-4 w-4 bg-primary-600 rounded-full animate-bounce"></div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="text-gray-600 dark:text-gray-400 text-lg font-medium">
          {message}
        </div>

        {/* Clinic Name */}
        <div className="mt-4 text-primary-600 dark:text-primary-400 font-semibold text-xl">
          Prime Skin Clinic
        </div>
        <div className="text-gray-500 dark:text-gray-500 text-sm">
          Pakistan's Premier Dermatology Solution
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
