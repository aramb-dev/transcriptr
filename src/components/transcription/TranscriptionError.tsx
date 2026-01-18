import { Button } from "../ui/button";

interface TranscriptionErrorProps {
  status: "failed" | "canceled";
  error: string | null;
  onReset: () => void;
  apiResponses: Array<{ timestamp: Date; data: Record<string, unknown> }>;
  showApiDetails: boolean;
  setShowApiDetails: (show: boolean) => void;
  formatTimestamp: (date: Date) => string;
}

export function TranscriptionError({
  status,
  error,
  onReset,
  apiResponses,
  showApiDetails,
  setShowApiDetails,
  formatTimestamp,
}: TranscriptionErrorProps) {
  const statusMessages = {
    failed: "The transcription encountered an error during processing.",
    canceled: "This transcription was cancelled, please try again.",
  };

  return (
    <div className="p-8 text-center">
      <div
        className={`${
          status === "failed"
            ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
            : "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20"
        } mb-4 rounded-lg border p-6`}
      >
        <div className="mb-4 flex justify-center">
          <div
            className={`rounded-full p-3 ${
              status === "failed"
                ? "bg-red-100 text-red-500 dark:bg-red-800/30 dark:text-red-400"
                : "bg-orange-100 text-orange-500 dark:bg-orange-800/30 dark:text-orange-400"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {status === "failed" ? (
                <>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </>
              ) : (
                <>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </>
              )}
            </svg>
          </div>
        </div>
        <p
          className={`mb-2 text-lg font-medium ${
            status === "failed"
              ? "text-red-600 dark:text-red-400"
              : "text-orange-600 dark:text-orange-400"
          }`}
        >
          {statusMessages[status]}
        </p>
        {error && (
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
            Error: {error}
          </p>
        )}
        <Button
          onClick={onReset}
          className="mt-2 bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300"
        >
          Try Again
        </Button>
      </div>

      {apiResponses.length > 0 && (
        <div className="mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowApiDetails(!showApiDetails)}
            className="mb-4 bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            {showApiDetails ? "Hide Error Details" : "View Error Details"}
          </Button>

          {showApiDetails && (
            <div className="h-60 overflow-auto rounded-md bg-gray-100 p-3 text-left font-mono text-xs dark:bg-gray-800">
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}
