import React from "react";
import { Button } from "../ui/button";

interface TranscriptionProcessingProps {
  progress: number;
  transStatus: "converting" | "starting" | "processing";
  getProgressColor: () => string;
  statusMessages: Record<string, string>;
  showApiDetails: boolean;
  setShowApiDetails: (show: boolean) => void;
  apiResponses: Array<{ timestamp: Date; data: Record<string, unknown> }>;
  formatTimestamp: (date: Date) => string;
  onCancel: () => void;
  frameProgress?: {
    percentage: number;
    current: number;
    total: number;
  } | null;
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
  onCancel,
  frameProgress,
}: TranscriptionProcessingProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 px-6 py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-1 flex justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {progress < 15 && transStatus === "starting"
              ? "Converting Format"
              : transStatus.charAt(0).toUpperCase() + transStatus.slice(1)}
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {Math.floor(progress)}%
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className={`h-2.5 animate-pulse rounded-full transition-all duration-500 ${getProgressColor()}`}
            style={{ width: `${Math.floor(progress)}%` }}
          ></div>
        </div>
      </div>

      <p className="max-w-md text-center font-medium text-gray-700 dark:text-gray-300">
        {progress < 15 && transStatus === "starting"
          ? "Converting audio format for better compatibility..."
          : statusMessages[transStatus]}
      </p>

      {frameProgress && transStatus === "processing" && (
        <p className="max-w-md text-center text-sm text-gray-600 dark:text-gray-400">
          Processing frame {frameProgress.current.toLocaleString()} of{" "}
          {frameProgress.total.toLocaleString()}
        </p>
      )}

      <div className="w-full max-w-md">
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => setShowApiDetails(!showApiDetails)}
          >
            {showApiDetails ? "Hide Details" : "View Details"}
          </Button>
        </div>

        {showApiDetails && (
          <div className="mt-4 h-60 overflow-auto rounded-md bg-gray-100 p-3 font-mono text-xs dark:bg-gray-800">
            {apiResponses.map((response, index) => (
              <div
                key={index}
                className="mb-2 border-b border-gray-200 pb-2 dark:border-gray-700"
              >
                <div className="text-gray-500 dark:text-gray-400">
                  [{formatTimestamp(response.timestamp)}]
                </div>
                <pre className="mt-1 whitespace-pre-wrap text-gray-800 dark:text-gray-300">
                  {JSON.stringify(response.data, null, 2)}
                </pre>
              </div>
            ))}
            {apiResponses.length === 0 && (
              <p className="text-gray-500 italic dark:text-gray-400">
                Waiting for API responses...
              </p>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="border-red-300 text-red-500 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
          >
            Cancel Transcription
          </Button>
        </div>
      </div>
    </div>
  );
}
