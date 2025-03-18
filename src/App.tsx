import { useState, useRef, useEffect } from 'react';
import Replicate from 'replicate';
import { UploadAudio } from './components/UploadAudio';
import { TranscriptionResult } from './components/TranscriptionResult';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './components/ui/card';
import { Button } from './components/ui/button';

// Add this near the top of your App.tsx file
const isNetlify = typeof window !== 'undefined' &&
                 (window.location.hostname.includes('netlify.app') ||
                  process.env.DEPLOY_ENV === 'netlify');

// Get the appropriate API base URL
const getApiUrl = (endpoint: string) => {
  return isNetlify
    ? `/.netlify/functions/${endpoint}`
    : `/api/${endpoint}`;
};

// Initialize Replicate client with API token
const replicate = new Replicate({
  auth: import.meta.env.VITE_REPLICATE_API_TOKEN,
  userAgent: 'transcriptr-app',
});

// Model ID for Incredibly Fast Whisper
const MODEL_ID = 'vaibhavs10/incredibly-fast-whisper:3ab86df6c8f54c11309d4d1f930ac292bad43ace52d10c80d87eb258b3c9f79c';

// Define possible transcription statuses
type TranscriptionStatus = 'idle' | 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';

// Define status messages
const statusMessages: Record<TranscriptionStatus, string> = {
  idle: 'Ready to transcribe',
  starting: 'Transcription engine starting. Please wait 4-5 seconds.',
  processing: 'Processing audio. This will depend on the length of your audio.',
  succeeded: 'Processing complete! Loading result...',
  failed: 'The transcription encountered an error during processing.',
  canceled: 'This transcription was cancelled, please try again.'
};

export default function App() {
  const [transcription, setTranscription] = useState<string | null>(null);
  const [transStatus, setTransStatus] = useState<TranscriptionStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [apiResponses, setApiResponses] = useState<Array<{timestamp: Date, data: any}>>([]);
  const [showApiDetails, setShowApiDetails] = useState(false);
  const [progress, setProgress] = useState(0);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Convert file to base64 for API submission
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle file upload and transcription
  const handleUpload = async (formData: FormData, options: { language: string; diarize: boolean }) => {
    setTransStatus('starting');
    setError(null);
    setProgress(5); // Start at 5%
    setApiResponses([]);

    try {
      const file = formData.get('file') as File;

      if (!file) {
        throw new Error('No file selected');
      }

      // Log file details for debugging
      console.log(`Processing file: ${file.name}, Size: ${file.size / 1024 / 1024} MB, Type: ${file.type}`);
      setApiResponses(prev => [...prev, {
        timestamp: new Date(),
        data: { message: `Processing file: ${file.name}, Size: ${(file.size / 1024 / 1024).toFixed(2)} MB, Type: ${file.type}` }
      }]);

      // Convert file to base64
      const base64Audio = await fileToBase64(file);
      setProgress(15); // File converted to base64

      // Define API input parameters with user-selected options
      const apiOptions = {
        modelId: MODEL_ID,
        task: 'transcribe',
        batch_size: 64,
        return_timestamps: true,
        language: options.language, // Use the selected language
        diarize: options.diarize,   // Use the diarization option
      };

      // Call our proxy API
      console.log('Sending request to proxy server with options:', apiOptions);

      setApiResponses(prev => [...prev, {
        timestamp: new Date(),
        data: { message: 'Sending request to server', options: {...apiOptions, audioData: '[BASE64_DATA]'} }
      }]);

      const response = await fetch(getApiUrl('transcribe'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioData: base64Audio,
          options: apiOptions
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API response data:', data);

      setApiResponses(prev => [...prev, {
        timestamp: new Date(),
        data: { message: 'Received initial response', response: data }
      }]);

      setProgress(25); // Request sent and initial response received

      // If we get an immediate result (less common with Replicate)
      if (data.output && typeof data.output === 'string') {
        // Some models return text directly as a string
        setTransStatus('succeeded');
        setProgress(100);
        setTranscription(data.output);
        console.log('Transcription successful (string output)');
      }
      else if (data.output && typeof data.output === 'object' && 'text' in data.output) {
        // Some models return {text: "transcription"}
        setTransStatus('succeeded');
        setProgress(100);
        setTranscription(data.output.text);
        console.log('Transcription successful (object with text)');
      }
      // If we need to poll for the result (typical for Replicate)
      else if (data.id || data.urls?.get) {
        console.log('Async prediction started, polling for result...');
        // If we have an ID, use it for polling
        const predictionId = data.id;
        await pollForResult(predictionId);
      }
      else {
        console.error('Unexpected API response format:', data);
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.error('Error transcribing audio:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setTransStatus('failed');
      setProgress(0);
      setTranscription(null);

      setApiResponses(prev => [...prev, {
        timestamp: new Date(),
        data: { error: error instanceof Error ? error.message : 'Unknown error occurred' }
      }]);
    }
  };

  // Poll for the result of an asynchronous prediction
  const pollForResult = async (predictionId: string) => {
    // Clear any existing interval
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    let attempts = 0;
    const maxAttempts = 200; // Higher limit for longer transcriptions (about 5 minutes at 1.5s intervals)
    let progressIncrement = 50 / maxAttempts; // Distribute 50% of progress over polling duration

    // Set initial polling progress
    setProgress(prev => Math.min(prev + progressIncrement, 95)); // Start at current + increment, max 95%

    const poll = () => {
      attempts++;

      fetch(getApiUrl(`prediction/${predictionId}`))
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to check prediction status: ${response.status} ${response.statusText}`);
          }
          return response.json();
        })
        .then(data => {
          console.log(`Prediction status (attempt ${attempts}):`, data);

          // Add response to API responses log
          setApiResponses(prev => [...prev, {
            timestamp: new Date(),
            data: {
              message: `Status check #${attempts}`,
              status: data.status,
              response: data
            }
          }]);

          // Update progress based on status
          setProgress(prev => {
            // Calculate new progress, keeping within bounds
            const newProgress = Math.min(25 + (attempts * progressIncrement), 95);
            return newProgress;
          });

          // Update status based on API response
          if (data.status === 'starting') {
            setTransStatus('starting');
          } else if (data.status === 'processing') {
            setTransStatus('processing');
          } else if (data.status === 'succeeded') {
            clearInterval(pollIntervalRef.current!);
            setTransStatus('succeeded');
            setProgress(100);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);

            // Handle different output formats
            if (typeof data.output === 'string') {
              setTranscription(data.output);
            }
            else if (data.output && typeof data.output === 'object') {
              if ('text' in data.output) {
                setTranscription(data.output.text);
              }
              // Sometimes the output is an array where the first element is the text
              else if (Array.isArray(data.output) && data.output.length > 0) {
                setTranscription(String(data.output[0]));
              } else {
                throw new Error('Invalid transcription result format');
              }
            } else {
              throw new Error('Invalid transcription result format');
            }
          } else if (data.status === 'failed') {
            clearInterval(pollIntervalRef.current!);
            setTransStatus('failed');
            setProgress(0);
            throw new Error(`Transcription failed: ${data.error || 'Unknown error'}`);
          } else if (data.status === 'canceled') {
            clearInterval(pollIntervalRef.current!);
            setTransStatus('canceled');
            setProgress(0);
            throw new Error('Transcription was canceled');
          }

          // Stop if we've reached the maximum number of attempts
          if (attempts >= maxAttempts) {
            clearInterval(pollIntervalRef.current!);
            throw new Error('Transcription timed out');
          }
        })
        .catch(error => {
          console.error('Error during polling:', error);
          clearInterval(pollIntervalRef.current!);
          setError(error.message);
          setTransStatus('failed');
          setProgress(0);

          setApiResponses(prev => [...prev, {
            timestamp: new Date(),
            data: { error: error.message }
          }]);
        });
    };

    // Initial poll
    poll();

    // Start polling at 1.5-second intervals
    pollIntervalRef.current = setInterval(poll, 1500);
  };

  // Reset the transcription state
  const handleReset = () => {
    // Clear polling interval if it exists
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    setTranscription(null);
    setTransStatus('idle');
    setError(null);
    setProgress(0);
    setApiResponses([]);
    setShowApiDetails(false);
  };

  // Format timestamp for API responses
  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  // Generate progress bar color based on status
  const getProgressColor = () => {
    switch (transStatus) {
      case 'starting': return 'bg-blue-500';
      case 'processing': return 'bg-indigo-500';
      case 'succeeded': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'canceled': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  // Determine if we're in a loading state
  const isLoading = transStatus === 'starting' || transStatus === 'processing';

  // Add this function to handle clipboard copy with feedback
  const handleCopyToClipboard = async () => {
    if (transcription) {
      try {
        await navigator.clipboard.writeText(transcription);
        setCopySuccess(true);

        // Reset after 2 seconds
        setTimeout(() => {
          setCopySuccess(false);
        }, 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Transcriptr</h1>
          <p className="text-gray-600 dark:text-gray-300">Convert audio to text with AI-powered transcription</p>
        </header>

        <Card className="w-full overflow-hidden border-0 shadow-lg rounded-xl dark:bg-gray-800/60 dark:backdrop-blur-sm">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 space-y-6">
                {/* Progress bar */}
                <div className="w-full max-w-md mx-auto">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {transStatus.charAt(0).toUpperCase() + transStatus.slice(1)}
                    </span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${getProgressColor()}`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Status message */}
                <p className="text-gray-700 dark:text-gray-300 text-center max-w-md font-medium">
                  {statusMessages[transStatus]}
                </p>

                {/* Additional information */}
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

                  {/* API response log */}
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
                      onClick={handleReset}
                      className="text-red-500 border-red-300 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                    >
                      Cancel Transcription
                    </Button>
                  </div>
                </div>
              </div>
            ) : transStatus === 'failed' || transStatus === 'canceled' ? (
              <div className="p-8 text-center">
                <div className={`${
                  transStatus === 'failed'
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                } border rounded-lg p-6 mb-4`}>
                  <div className="flex justify-center mb-4">
                    <div className={`rounded-full p-3 ${
                      transStatus === 'failed'
                        ? 'bg-red-100 dark:bg-red-800/30 text-red-500 dark:text-red-400'
                        : 'bg-orange-100 dark:bg-orange-800/30 text-orange-500 dark:text-orange-400'
                    }`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {transStatus === 'failed' ? (
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
                  <p className={`font-medium text-lg mb-2 ${
                    transStatus === 'failed'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-orange-600 dark:text-orange-400'
                  }`}>
                    {statusMessages[transStatus]}
                  </p>
                  {error && (
                    <p className="text-sm mb-4 text-gray-600 dark:text-gray-300">
                      Error: {error}
                    </p>
                  )}
                  <Button
                    onClick={handleReset}
                    className="mt-2"
                  >
                    Try Again
                  </Button>
                </div>

                {/* API Logs for debugging */}
                {apiResponses.length > 0 && (
                  <div className="mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowApiDetails(!showApiDetails)}
                      className="mb-4"
                    >
                      {showApiDetails ? 'Hide Error Details' : 'View Error Details'}
                    </Button>

                    {showApiDetails && (
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-3 text-xs font-mono h-60 overflow-auto text-left">
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
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : !transcription ? (
              <div className="p-8">
                <UploadAudio onUpload={handleUpload} />
              </div>
            ) : (
              <div className="p-8">
                <TranscriptionResult transcription={transcription} />
              </div>
            )}
          </CardContent>

          {transcription && (
            <div className="px-8 py-4 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700 flex justify-center gap-4">
              <Button variant="outline" onClick={handleReset} className="bg-white dark:bg-gray-800">
                New Transcription
              </Button>
              <Button
                onClick={handleCopyToClipboard}
                className="gap-2"
                disabled={copySuccess}
              >
                {copySuccess ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                      <path d="M20 6L9 17l-5-5"></path>
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    Copy to Clipboard
                  </>
                )}
              </Button>
            </div>
          )}
        </Card>
      </div>

      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-100 dark:bg-green-900/70 p-4 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-top">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <span className="text-green-800 dark:text-green-200 font-medium">Transcription complete!</span>
        </div>
      )}
    </div>
  );
}