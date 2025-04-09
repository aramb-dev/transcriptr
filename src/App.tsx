import { useState, useRef } from 'react';
import { UploadAudio } from './components/UploadAudio';
import { TranscriptionResult } from './components/TranscriptionResult';
import {
  Card,
  CardContent
} from './components/ui/card';
import { Button } from './components/ui/button';
import { isLargeFile, uploadLargeFile, deleteFile } from './lib/storage-service';
import { isFormatSupportedByReplicate } from './lib/audio-conversion';
import { FeedbackForm } from './components/FeedbackForm';

// Need to add this to recognize the feedbackType property
declare global {
  interface Window {
    feedbackType: 'general' | 'issue' | 'feature' | 'other';
  }
}

// Default to general feedback
window.feedbackType = 'general';

const isNetlify = typeof window !== 'undefined' &&
                 (window.location.hostname.includes('netlify.app') ||
                  process.env.DEPLOY_ENV === 'netlify');

const getApiUrl = (endpoint: string) => {
  return isNetlify
    ? `/.netlify/functions/${endpoint}`
    : `/api/${endpoint}`;
};

const MODEL_ID = 'vaibhavs10/incredibly-fast-whisper:3ab86df6c8f54c11309d4d1f930ac292bad43ace52d10c80d87eb258b3c9f79c';

type TranscriptionStatus = 'idle' | 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';

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
  const [apiResponses, setApiResponses] = useState<Array<{timestamp: Date, data: Record<string, unknown>}>>([]);
  const [showApiDetails, setShowApiDetails] = useState(false);
  const [progress, setProgress] = useState(0);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

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

  /*
  // Commented out since this function is not being used
  // If you need audio conversion, uncomment and call this function
  const convertAudioUsingNetlifyFunction = async (file: File): Promise<string> => {
    // First upload the file to Firebase to get a URL
    console.log('Uploading file to get URL for conversion');
    const { url, path } = await uploadLargeFile(file);

    try {
      console.log('File uploaded, URL:', url);
      console.log('Converting using CloudConvert');

      // Add timeout handling to prevent long-running requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      try {
        // Call the CloudConvert function with the URL
        const response = await fetch(getApiUrl('cloud-convert'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            audioUrl: url,
            fileName: file.name,
            fileType: file.type
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: response.statusText }));

          // Delete the original file since conversion failed
          try {
            await deleteFile(path);
            console.log('Deleted original file after failed conversion:', path);
          } catch (deleteError) {
            console.warn('Failed to delete original file:', deleteError);
          }

          throw new Error(`Conversion failed: ${errorData.error || response.statusText}`);
        }

        const data = await response.json();

        // Delete the original file since we now have a converted version
        try {
          await deleteFile(path);
          console.log('Deleted original file after successful conversion:', path);
        } catch (deleteError) {
          console.warn('Failed to delete original file:', deleteError);
        }

        return data.url;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error) {
      // If conversion fails, just use the original file
      console.error('Error in file conversion, using original file:', error);
      return url;
    }
  };
  */

  // Update handleUpload function to provide clear guidance for unsupported formats
  const handleUpload = async (formData: FormData, options: { language: string; diarize: boolean }) => {
    setTransStatus('starting');
    setError(null);
    setProgress(5);
    setApiResponses([]);

    let fileUrl: string | null = null;
    let firebaseFilePath: string | null = null;
    const requestBody: {
      options: {
        modelId?: string;
        task?: string;
        batch_size?: number;
        return_timestamps?: boolean;
        language?: string;
        diarize?: boolean;
      } | null;
      audioData?: string;
      audioUrl?: string;
    } = { options: null }; // Initialize requestBody to avoid undefined errors

    try {
      const file = formData.get('file') as File;

      if (!file) {
        throw new Error('No file selected');
      }

      console.log(`Processing file: ${file.name}, Size: ${file.size / 1024 / 1024} MB, Type: ${file.type}`);
      setApiResponses(prev => [...prev, {
        timestamp: new Date(),
        data: { message: `Processing file: ${file.name}, Size: ${(file.size / 1024 / 1024).toFixed(2)} MB, Type: ${file.type}` }
      }]);

      // Create the API options object
      const apiOptions = {
        modelId: MODEL_ID,
        task: 'transcribe',
        batch_size: 64,
        return_timestamps: true,
        language: options.language,
        diarize: options.diarize,
      };

      // Initialize requestBody with options
      requestBody.options = apiOptions;

      // Check if the file format is supported by Replicate
      if (!isFormatSupportedByReplicate(file)) {
        // Instead of trying complex conversion, show a helpful message
        setApiResponses(prev => [...prev, {
          timestamp: new Date(),
          data: {
            error: `File format not supported: ${file.type || file.name.split('.').pop()}`,
            message: `This file format is not directly supported by our transcription service. Please convert your file to MP3, WAV, or FLAC format before uploading. You can use a service like https://cloudconvert.com/m4a-to-mp3 to convert your file.`
          }
        }]);

        // Add contributor message
        setApiResponses(prev => [...prev, {
          timestamp: new Date(),
          data: {
            message: `We're working on adding support for more formats. If you'd like to help, please consider contributing: https://github.com/aramb-dev/transcriptr`
          }
        }]);

        throw new Error('Unsupported file format. Please convert to MP3, WAV, or FLAC before uploading.');
      }

      // Handle files based on size (for supported formats)
      if (isLargeFile(file)) {
        setProgress(10);
        setApiResponses(prev => [...prev, {
          timestamp: new Date(),
          data: { message: `Large file detected (${(file.size / 1024 / 1024).toFixed(2)}MB > ${import.meta.env.VITE_LARGE_FILE_THRESHOLD}MB). Uploading to temporary storage...` }
        }]);

        try {
          console.log(`Uploading file to Firebase: ${file.name}`);
          const uploadResult = await uploadLargeFile(file);
          fileUrl = uploadResult.url;
          firebaseFilePath = uploadResult.path;

          console.log('File uploaded successfully, URL:', fileUrl);
          setProgress(20);

          setApiResponses(prev => [...prev, {
            timestamp: new Date(),
            data: { message: 'File uploaded to temporary storage successfully', url: fileUrl }
          }]);

          // Set audioUrl in requestBody
          requestBody.audioUrl = fileUrl;
        } catch (uploadError) {
          console.error('Error uploading to Firebase:', uploadError);
          setApiResponses(prev => [...prev, {
            timestamp: new Date(),
            data: { error: `Firebase upload error: ${uploadError instanceof Error ? uploadError.message : String(uploadError)}` }
          }]);
          throw new Error(`Failed to upload file to temporary storage: ${uploadError instanceof Error ? uploadError.message : String(uploadError)}`);
        }
      } else {
        // For small files, convert to base64
        try {
          const base64Audio = await fileToBase64(file);
          setProgress(15);
          requestBody.audioData = base64Audio;
        } catch (base64Error) {
          console.error('Error converting file to base64:', base64Error);
          throw new Error(`Failed to prepare file for upload: ${base64Error instanceof Error ? base64Error.message : String(base64Error)}`);
        }
      }

      // Remove audioData if we have a URL to avoid sending both
      if (requestBody.audioUrl) {
        delete requestBody.audioData;
      }

      console.log('Sending request to server with options:', requestBody.options);
      console.log('Using method:', requestBody.audioUrl ? 'URL' : 'base64 data');

      const response = await fetch(getApiUrl('transcribe'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
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

      setProgress(25);

      // Check if the response contains an additional Firebase path (from Netlify function)
      if (data.firebaseFilePath && !firebaseFilePath) {
        firebaseFilePath = data.firebaseFilePath;
      }

      if (data.output && typeof data.output === 'string') {
        setTransStatus('succeeded');
        setProgress(100);
        setTranscription(data.output);
        console.log('Transcription successful (string output)');
      }
      else if (data.output && typeof data.output === 'object' && 'text' in data.output) {
        setTransStatus('succeeded');
        setProgress(100);
        setTranscription(data.output.text);
        console.log('Transcription successful (object with text)');
      }
      else if (data.id || data.urls?.get) {
        console.log('Async prediction started, polling for result...');
        const predictionId = data.id;
        await pollForResult(predictionId);
      }
      else {
        console.error('Unexpected API response format:', data);
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.error('Error transcribing audio:', error);
      setError(formatErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred'));
      setTransStatus('failed');
      setProgress(0);
      setTranscription(null);

      setApiResponses(prev => [...prev, {
        timestamp: new Date(),
        data: { error: error instanceof Error ? error.message : 'Unknown error occurred' }
      }]);
    } finally {
      // Only clean up the file after we're completely done with it
      if (firebaseFilePath) {
        try {
          // Add a slight delay to ensure the file isn't deleted before Replicate reads it
          setTimeout(async () => {
            await deleteFile(firebaseFilePath!);
            setApiResponses(prev => [...prev, {
              timestamp: new Date(),
              data: { message: 'Temporary storage file cleaned up' }
            }]);
          }, 10000); // 10 second delay before cleanup
        } catch (e) {
          console.error('Failed to delete temporary file:', e);
        }
      }
    }
  };

  const pollForResult = async (predictionId: string) => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    let attempts = 0;
    const maxAttempts = 200;
    const progressIncrement = 50 / maxAttempts;

    setProgress(prev => Math.min(prev + progressIncrement, 95));

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

          setApiResponses(prev => [...prev, {
            timestamp: new Date(),
            data: {
              message: `Status check #${attempts}`,
              status: data.status,
              response: data
            }
          }]);

          setProgress(prev => {
            const newProgress = Math.min(prev + progressIncrement, 95);
            return newProgress;
          });

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

            if (typeof data.output === 'string') {
              setTranscription(data.output);
            }
            else if (data.output && typeof data.output === 'object') {
              if ('text' in data.output) {
                setTranscription(data.output.text);
              }
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

    poll();

    pollIntervalRef.current = setInterval(poll, 1500);
  };

  const handleReset = () => {
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

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

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

  const isLoading = transStatus === 'starting' || transStatus === 'processing';

  const handleCopyToClipboard = async () => {
    if (transcription) {
      try {
        await navigator.clipboard.writeText(transcription);
        setCopySuccess(true);

        setTimeout(() => {
          setCopySuccess(false);
        }, 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };

  const formatErrorMessage = (error: string): string => {
    if (error.includes('Unsupported file format') || error.includes('File format not supported')) {
      return 'Unsupported file format. Please convert to MP3, WAV, or FLAC before uploading.';
    }
    if (error.includes('Soundfile is either not in the correct format')) {
      return 'The audio file format is not supported. Please try a different file or format (MP3, WAV, FLAC recommended).';
    }
    return error;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 text-gray-900 dark:text-gray-100">
      <div className="container mx-auto px-4 max-w-4xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Transcriptr</h1>
          <p className="text-gray-600 dark:text-gray-300">Convert audio to text with AI-powered transcription</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Developed by <a href="https://github.com/aramb-dev" className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">Abdur-Rahman Bilal (aramb-dev)</a> and AI | <a href="https://github.com/aramb-dev/transcriptr" className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">View on Github</a>
          </p>
        </header>

        <Card className="w-full overflow-hidden border-0 shadow-lg rounded-xl dark:bg-gray-800/60 dark:backdrop-blur-sm">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 space-y-6">
                <div className="w-full max-w-md mx-auto">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {progress < 15 && transStatus === 'starting'
                        ? "Converting Format"
                        : transStatus.charAt(0).toUpperCase() + transStatus.slice(1)}
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

                  {}
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
                    className="mt-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  >
                    Try Again
                  </Button>
                </div>

                {}
                {apiResponses.length > 0 && (
                  <div className="mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowApiDetails(!showApiDetails)}
                      className="mb-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
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
              <Button variant="outline" onClick={handleReset} className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                New Transcription
              </Button>
              <Button
                onClick={handleCopyToClipboard}
                className="gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
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

      {/* Footer */}
      <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <a
            href="#feedback"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('general-feedback-modal')?.classList.remove('hidden');
            }}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Provide Feedback
          </a>
          <span>•</span>
          <a
            href="#issue"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('issue-feedback-modal')?.classList.remove('hidden');
            }}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Report an Issue
          </a>
          <span>•</span>
          <a
            href="#feature"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('feature-feedback-modal')?.classList.remove('hidden');
            }}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Suggest a Feature
          </a>
          <span>•</span>
          <a
            href="https://github.com/aramb-dev/transcriptr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Star on GitHub
          </a>
        </div>
        <p className="mt-4">© {new Date().getFullYear()} Transcriptr. All rights reserved.</p>
      </footer>

      {/* General Feedback Modal */}
      <div
        id="general-feedback-modal"
        className="hidden fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      >
        <div className="relative w-full max-w-md">
          <button
            onClick={() => document.getElementById('general-feedback-modal')?.classList.add('hidden')}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <FeedbackForm
            initialType="general"
            onClose={() => document.getElementById('general-feedback-modal')?.classList.add('hidden')}
          />
        </div>
      </div>

      {/* Issue Report Modal */}
      <div
        id="issue-feedback-modal"
        className="hidden fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      >
        <div className="relative w-full max-w-md">
          <button
            onClick={() => document.getElementById('issue-feedback-modal')?.classList.add('hidden')}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <FeedbackForm
            initialType="issue"
            onClose={() => document.getElementById('issue-feedback-modal')?.classList.add('hidden')}
          />
        </div>
      </div>

      {/* Feature Request Modal */}
      <div
        id="feature-feedback-modal"
        className="hidden fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      >
        <div className="relative w-full max-w-md">
          <button
            onClick={() => document.getElementById('feature-feedback-modal')?.classList.add('hidden')}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <FeedbackForm
            initialType="feature"
            onClose={() => document.getElementById('feature-feedback-modal')?.classList.add('hidden')}
          />
        </div>
      </div>
    </div>
  );
}