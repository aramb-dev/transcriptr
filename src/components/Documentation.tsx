import React from 'react';

export function Documentation() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 text-gray-900 dark:text-gray-100">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            <h1 className="text-3xl font-bold mb-6">Documentation</h1>
            <p>Welcome to the documentation page. Here you will find all the information you need to use our application.</p>
          </div>
        </div>
      </div>
    </div>
  );
}