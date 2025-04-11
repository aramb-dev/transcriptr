import { useState } from 'react';
import { UploadAudio } from '../UploadAudio';
import { TranscriptionProcessing } from './TranscriptionProcessing';
import { TranscriptionError } from './TranscriptionError';
import { TranscriptionResult } from './TranscriptionResult';
import {
  TranscriptionStatus,
  statusMessages,
  getApiUrl,
  fileToBase64,
  formatErrorMessage,
  formatTimestamp
} from '../../services/transcription';
import { trackEvent } from '../../lib/analytics';
import { isLargeFile, uploadLargeFile, deleteFile } from '../../lib/storage-service';
import { isFormatSupportedByReplicate } from '../../lib/audio-conversion';
import { Button } from '../ui/button';
import { useRef } from 'react';

// Constants
const MODEL_ID = 'vaibhavs10/incredibly-fast-whisper:3ab86df6c8f54c11309d4d1f930ac292bad43ace52d10c80d87eb258b3c9f79c';

interface TranscriptionFormProps {
  onShowSuccess: () => void;
}

export function TranscriptionForm({ onShowSuccess }: TranscriptionFormProps) {
  const [transcription, setTranscription] = useState<string | null>(null);
  const [transStatus, setTransStatus] = useState<TranscriptionStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [apiResponses, setApiResponses] = useState<Array<{timestamp: Date, data: Record<string, unknown>}>>([]);
  const [showApiDetails, setShowApiDetails] = useState(false);
  const [progress, setProgress] = useState(0);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

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
    } = { options: null };

    trackEvent('Transcription', 'Start', options.language);

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

      const apiOptions = {
        modelId: MODEL_ID,
        task: 'transcribe',
        batch_size: 64,
        return_timestamps: true,
        language: options.language,
        diarize: options.diarize,
      };

      requestBody.options = apiOptions;

      if (!isFormatSupportedByReplicate(file)) {
        setApiResponses(prev => [...prev, {
          timestamp: new Date(),
          data: {
            error: `File format not supported: ${file.type || file.name.split('.').pop()}`,
            message: `This file format is not directly supported by our transcription service. Please convert your file to MP3, WAV, or FLAC format before uploading. You can use a service like https://cloudconvert.com/m4a-to-mp3 to convert your file.`
          }
        }]);

        setApiResponses(prev => [...prev, {
          timestamp: new Date(),
          data: {
            message: `We're working on adding support for more formats. If you'd like to help, please consider contributing: https://github.com/aramb-dev/transcriptr`
          }
        }]);

        throw new Error('Unsupported file format. Please convert to MP3, WAV, or FLAC before uploading.');
      }

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
        try {
          const base64Audio = await fileToBase64(file);
          setProgress(15);
          requestBody.audioData = base64Audio;
        } catch (base64Error) {
          console.error('Error converting file to base64:', base64Error);
          throw new Error(`Failed to prepare file for upload: ${base64Error instanceof Error ? base64Error.message : String(base64Error)}`);
        }
      }

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

      if (data.firebaseFilePath && !firebaseFilePath) {
        firebaseFilePath = data.firebaseFilePath;
      }

      if (data.output && typeof data.output === 'string') {
        setTransStatus('succeeded');
        setProgress(100);
        setTranscription(data.output);
        console.log('Transcription successful (string output)');
        onShowSuccess();
      }
      else if (data.output && typeof data.output === 'object' && 'text' in data.output) {
        setTransStatus('succeeded');
        setProgress(100);
        setTranscription(data.output.text);
        console.log('Transcription successful (object with text)');
        onShowSuccess();
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

      trackEvent('Transcription', 'Success', options.language);
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

      trackEvent('Transcription', 'Error', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      if (firebaseFilePath) {
        try {
          setTimeout(async () => {
            await deleteFile(firebaseFilePath!);
            setApiResponses(prev => [...prev, {
              timestamp: new Date(),
              data: { message: 'Temporary storage file cleaned up' }
            }]);
          }, 10000);
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
            onShowSuccess();

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

  return (
    <>
      {isLoading ? (
        <TranscriptionProcessing
          progress={progress}
          transStatus={transStatus as 'starting' | 'processing'}
          getProgressColor={getProgressColor}
          statusMessages={statusMessages}
          showApiDetails={showApiDetails}
          setShowApiDetails={setShowApiDetails}
          apiResponses={apiResponses}
          formatTimestamp={formatTimestamp}
          onCancel={handleReset}
        />
      ) : transStatus === 'failed' || transStatus === 'canceled' ? (
        <TranscriptionError
          status={transStatus as 'failed' | 'canceled'}
          error={error}
          onReset={handleReset}
          apiResponses={apiResponses}
          showApiDetails={showApiDetails}
          setShowApiDetails={setShowApiDetails}
          formatTimestamp={formatTimestamp}
        />
      ) : !transcription ? (
        <div className="p-8">
          <UploadAudio onUpload={handleUpload} />
        </div>
      ) : (
        <>
          <div className="p-8">
            <TranscriptionResult transcription={transcription} />
          </div>
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
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1-2 2v1"></path>
                  </svg>
                  Copy to Clipboard
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </>
  );
}