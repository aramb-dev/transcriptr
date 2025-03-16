import { useState } from 'react';
import { Button } from './ui/button';

interface UploadAudioProps {
  onUpload: (formData: FormData) => void;
}

export function UploadAudio({ onUpload }: UploadAudioProps) {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      onUpload(formData);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="audio-file" className="font-medium">
          Select audio file
        </label>
        <input
          id="audio-file"
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          aria-describedby="file-upload-help"
        />
        {!file && (
          <p id="file-upload-help" className="text-sm text-gray-500">
            Choose an audio file to transcribe
          </p>
        )}
        {file && (
          <p className="text-sm">Selected file: {file.name}</p>
        )}
      </div>
      <Button
        onClick={handleSubmit}
        disabled={!file}
      >
        Upload and Transcribe
      </Button>
    </div>
  );
}
