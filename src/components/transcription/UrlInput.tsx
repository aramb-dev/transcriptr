import React from 'react';
import { Input } from '@/components/ui/input';
import { AlertTriangle } from 'lucide-react';

interface UrlInputProps {
  audioUrl: string;
  urlError: string | null;
  onUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function UrlInput({ audioUrl, urlError, onUrlChange }: UrlInputProps) {
  return (
    <div className="mt-6 flex flex-col items-center gap-4">
      <div className="w-full space-y-2">
        <label htmlFor="audio-url" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Audio URL
        </label>
        <Input
          id="audio-url"
          type="url"
          placeholder="https://example.com/audio.mp3"
          value={audioUrl}
          onChange={onUrlChange}
          className={urlError ? 'border-red-500 focus-visible:ring-red-500' : ''}
          aria-describedby={urlError ? 'url-error' : undefined}
          aria-invalid={!!urlError}
        />
        {urlError && (
          <p id="url-error" className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> {urlError}
          </p>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Paste a direct link to an MP3, WAV, FLAC, or OGG file. The link must end with the file extension.
        </p>
      </div>
    </div>
  );
}
