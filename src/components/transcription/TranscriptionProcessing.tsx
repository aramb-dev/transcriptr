import React from 'react';
import { Button } from '../ui/button';

interface TranscriptionProcessingProps {
  progress: number;
  transStatus: 'starting' | 'processing';
  getProgressColor: () => string;
  statusMessages: Record<string, string>;
  showApiDetails: boolean;
  setShowApiDetails: (show: boolean) => void;
  apiResponses: Array<{ timestamp: Date, data: Record<string, unknown> }>;
  formatTimestamp: (date: Date) => string;
  onCancel: () => void;
}

export function TranscriptionProcessing({
  progress,
  transStatus,
  getProgressColor,
  statusMessages,
  showApiDetails,
  setShowApiDetails,
  apiResponses,
  formatTimestamp,
  onCancel
}: TranscriptionProcessingProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 space-y-6">
      <div className="w-full max-w-md mx-auto">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {progress < 15 && transStatus === 'starting'
              ? "Converting Format"
              : transStatus.charAt(0).toUpperCase() + transStatus.slice(1)}
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {Math.floor(progress)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-2.5 rounded-full bg-linear-to-r from-blue-400 to-indigo-500 transition-all duration-500 animate-pulse`}
            style={{ width: `${Math.floor(progress)}%` }}
          ></div>
        </div>
      </div>

      <p className="text-gray-700 dark:text-gray-300 text-center max-w-md font-medium">
        {progress < 15 && transStatus === 'starting'
          ? "Converting audio format for better compatibility..."
          : statusMessages[transStatus]}
      </p>

      <div className="w-full max-w-md">
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => setShowApiDetails(!showApiDetails)}
          >
            {showApiDetails ? 'Hide Details' : 'View Details'}
          </Button>
        </div>

        {showApiDetails && (
          <div className="mt-4 bg-gray-100 dark:bg-gray-800 rounded-md p-3 text-xs font-mono h-60 overflow-auto">
            {apiResponses.map((response, index) => (
              <div key={index} className="mb-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                <div className="text-gray-500 dark:text-gray-400">
                  [{formatTimestamp(response.timestamp)}]
                </div>
                <pre className="whitespace-pre-wrap text-gray-800 dark:text-gray-300 mt-1">
                  {JSON.stringify(response.data, null, 2)}
                </pre>
              </div>
            ))}
            {apiResponses.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 italic">Waiting for API responses...</p>
            )}
          </div>
        )}

        <div className="flex justify-center mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="text-red-500 border-red-300 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
          >
            Cancel Transcription
          </Button>
        </div>
      </div>
    </div>
  );
}