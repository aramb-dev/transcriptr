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
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50">
      <div className="w-full max-w-4xl p-4">
        <Card className="w-full !p-6 shadow-md">
          <CardHeader className="!px-6 !pb-4 text-center">
            <CardTitle className="text-2xl font-bold">Audio Transcription</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Upload an audio file to generate a transcription using AI.
            </CardDescription>
          </CardHeader>

          <CardContent className="!px-6 !py-4 space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent"></div>
                <p className="text-sm text-gray-500">Transcribing your audio... This may take a few moments.</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
                <p className="text-red-600 font-medium">Error: {error}</p>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            ) : !transcription ? (
              <div>
                <UploadAudio onUpload={handleUpload} />
              </div>
            ) : (
              <div>
                <TranscriptionResult transcription={transcription} />
              </div>
            )}
          </CardContent>

          {transcription && (
            <CardFooter className="!px-6 !pt-4 flex justify-center gap-4 border-t">
              <Button variant="outline" onClick={handleReset}>
                New Transcription
              </Button>
              <Button onClick={() => navigator.clipboard.writeText(transcription)}>
                Copy to Clipboard
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}