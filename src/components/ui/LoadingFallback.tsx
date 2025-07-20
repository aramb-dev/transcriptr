import React from 'react';

export const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-sky-50 to-white dark:from-gray-900 dark:to-gray-800">
    <div className="flex space-x-2">
      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse-dot-1"></div>
      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse-dot-2"></div>
      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse-dot-3"></div>
    </div>
  </div>
);
