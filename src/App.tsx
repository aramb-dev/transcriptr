import { useState } from 'react';
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

// Initialize Replicate client with API token
const replicate = new Replicate({
  auth: import.meta.env.VITE_REPLICATE_API_TOKEN,
  userAgent: 'transcriptr-app',
});

// Model ID for Incredibly Fast Whisper
const MODEL_ID = 'vaibhavs10/incredibly-fast-whisper:3ab86df6c8f54c11309d4d1f930ac292bad43ace52d10c80d87eb258b3c9f79c';

export default function App() {
  const [transcription, setTranscription] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

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
    setIsLoading(true);
    setError(null);

    try {
      const file = formData.get('file') as File;

      if (!file) {
        throw new Error('No file selected');
      }

      // Log file details for debugging
      console.log(`Processing file: ${file.name}, Size: ${file.size / 1024 / 1024} MB, Type: ${file.type}`);

      // Convert file to base64
      const base64Audio = await fileToBase64(file);

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
      const response = await fetch('/api/transcribe', {
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
      console.log('API response data:', data); // Log the full response for debugging

      // If we get an immediate result (less common with Replicate)
      if (data.output && typeof data.output === 'string') {
        // Some models return text directly as a string
        setTranscription(data.output);
        console.log('Transcription successful (string output)');
      }
      else if (data.output && typeof data.output === 'object' && 'text' in data.output) {
        // Some models return {text: "transcription"}
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
      setTranscription(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Poll for the result of an asynchronous prediction
  const pollForResult = async (predictionId: string) => {
    const maxAttempts = 60; // Poll for up to 5 minutes (60 * 5s = 5 min)
    let attempts = 0;

    const checkResult = async () => {
      if (attempts >= maxAttempts) {
        throw new Error('Transcription timed out after 5 minutes');
      }

      attempts++;

      console.log(`Checking transcription status (attempt ${attempts})...`);
      const response = await fetch(`/api/prediction/${predictionId}`);
      if (!response.ok) {
        throw new Error(`Failed to check prediction status: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Prediction status response:', data);

      if (data.status === 'succeeded') {
        // Display success message
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);

        // Handle different output formats
        if (typeof data.output === 'string') {
          setTranscription(data.output);
          console.log('Transcription successful (string output)');
          return;
        }
        else if (data.output && typeof data.output === 'object') {
          if ('text' in data.output) {
            setTranscription(data.output.text);
            console.log('Transcription successful (object with text)');
            return;
          }
          // Sometimes the output is an array where the first element is the text
          else if (Array.isArray(data.output) && data.output.length > 0) {
            setTranscription(String(data.output[0]));
            console.log('Transcription successful (array output)');
            return;
          }
        }
        console.error('Unexpected output format:', data.output);
        throw new Error('Invalid transcription result format');
      } else if (data.status === 'failed') {
        throw new Error(`Transcription failed: ${data.error || 'Unknown error'}`);
      } else {
        // Still processing, wait and check again
        console.log(`Current status: ${data.status || 'unknown'}`);
        setTimeout(checkResult, 5000); // Check every 5 seconds
      }
    };

    await checkResult();
  };

  // Reset the transcription state
  const handleReset = () => {
    setTranscription(null);
    setError(null);
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
              <div className="flex flex-col items-center justify-center py-16 px-6 space-y-4">
                <div className="h-14 w-14 animate-spin rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent"></div>
                <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
                  Transcribing your audio... This may take a few moments depending on the file length.
                </p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-4">
                  <p className="text-red-600 dark:text-red-400 font-medium mb-2">Error: {error}</p>
                  <p className="text-sm text-red-500 dark:text-red-300 mb-4">
                    There was a problem processing your audio file. Please try again.
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="bg-white dark:bg-gray-800"
                  >
                    Try Again
                  </Button>
                </div>
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
              <Button onClick={() => navigator.clipboard.writeText(transcription)}
                    className="gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                Copy to Clipboard
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