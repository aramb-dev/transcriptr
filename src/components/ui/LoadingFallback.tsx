import React from "react";

export const LoadingFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-sky-50 to-white dark:from-gray-900 dark:to-gray-800">
    <div className="flex space-x-2">
      <div className="animate-pulse-dot-1 h-3 w-3 rounded-full bg-blue-500"></div>
      <div className="animate-pulse-dot-2 h-3 w-3 rounded-full bg-blue-500"></div>
      <div className="animate-pulse-dot-3 h-3 w-3 rounded-full bg-blue-500"></div>
    </div>
  </div>
);
