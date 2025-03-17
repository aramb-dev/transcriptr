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

const replicate = new Replicate({
  auth: import.meta.env.VITE_REPLICATE_API_TOKEN,
  userAgent: 'https://www.npmjs.com/package/create-replicate',
});

export default function App() {
  const [transcription, setTranscription] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleUpload = async (formData: FormData) => {
    setIsLoading(true);
    try {
      const model = 'vaibhavs10/incredibly-fast-whisper:3ab86df6c8f54c11309d4d1f930ac292bad43ace52d10c80d87eb258b3c9f79c';

      const file = formData.get('file') as File;

      const base64Audio = await fileToBase64(file);

      const input = {
        task: 'transcribe',
        audio: base64Audio,
        batch_size: 64,
        return_timestamps: true,
      };

      const output = await replicate.run(model, { input });
      setTranscription((output as { text: string }).text);
    } catch (error) {
      console.error('Error transcribing audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleReset = () => {
    setTranscription(null);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50">
      <div className="w-full max-w-4xl p-4">
        {}
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
                <p className="text-sm text-gray-500">Transcribing your audio...</p>
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