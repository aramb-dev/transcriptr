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
      const input = {
        task: 'transcribe',
        audio: URL.createObjectURL(formData.get('file') as File),
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

  const handleReset = () => {
    setTranscription(null);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-background p-8">
      <div className="w-full max-w-[900px] mx-auto p-4 md:p-8">
        <Card className="shadow-xl border-4 border-gray-300 rounded-xl overflow-hidden">
          <CardHeader className="border-b p-8 !pb-8">
            <div className="text-center">
              <CardTitle className="text-2xl md:text-3xl font-bold mb-3">Audio Transcription</CardTitle>
              <CardDescription className="text-sm md:text-base text-gray-500">
                Upload an audio file to generate a transcription using AI.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-8 !pt-8 !pb-6 space-y-8">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent"></div>
                <p className="text-muted-foreground text-center">Transcribing your audio...</p>
              </div>
            ) : !transcription ? (
              <div className="py-4 max-w-xl mx-auto">
                <UploadAudio onUpload={handleUpload} />
              </div>
            ) : (
              <div className="py-4">
                <TranscriptionResult transcription={transcription} />
              </div>
            )}

            <div className="mt-8 pt-8 border-t text-center">
              <p className="text-sm text-gray-500">
                This tool uses AI to transcribe audio files with high accuracy.
              </p>
            </div>
          </CardContent>

          {transcription && (
            <CardFooter className="flex justify-center gap-4 border-t p-8">
              <Button variant="outline" onClick={handleReset} className="px-6">
                New Transcription
              </Button>
              <Button variant="default" onClick={() => navigator.clipboard.writeText(transcription)} className="px-6">
                Copy to Clipboard
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
