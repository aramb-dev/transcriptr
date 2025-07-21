import { useState } from "react";

const LANGUAGES = [
  { value: "None", label: "Auto Detect" },
  { value: "english", label: "English" },
  { value: "spanish", label: "Spanish" },
  { value: "french", label: "French" },
  { value: "german", label: "German" },
  { value: "italian", label: "Italian" },
  { value: "portuguese", label: "Portuguese" },
  { value: "dutch", label: "Dutch" },
  { value: "japanese", label: "Japanese" },
  { value: "chinese", label: "Chinese" },
  { value: "arabic", label: "Arabic" },
  { value: "hindi", label: "Hindi" },
  { value: "russian", label: "Russian" },
] as const;

export interface TranscriptionOptionsProps {
  onChange: (options: { language: string; diarize: boolean }) => void;
}

export function TranscriptionOptions({ onChange }: TranscriptionOptionsProps) {
  const [language, setLanguage] = useState<string>("None");
  const [diarize, setDiarize] = useState<boolean>(false);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    onChange({ language: newLanguage, diarize });
  };

  const handleDiarizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDiarize = e.target.checked;
    setDiarize(newDiarize);
    onChange({ language, diarize: newDiarize });
  };

  return (
    <div className="space-y-4 rounded-lg border border-gray-100 bg-gray-50 px-4 py-6 dark:border-gray-700/50 dark:bg-gray-800/40">
      <h3 className="flex items-center gap-2 text-base font-medium text-gray-900 dark:text-gray-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
        >
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
        Advanced Options
      </h3>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="language"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Language
          </label>
          <select
            id="language"
            value={language}
            onChange={handleLanguageChange}
            className="focus:border-primary focus:ring-primary dark:focus:border-primary w-full rounded-md border border-gray-300 bg-white py-2 pr-10 pl-3 text-sm text-gray-900 shadow-sm focus:ring-1 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          >
            {LANGUAGES.map((lang) => (
              <option
                key={lang.value}
                value={lang.value}
                className="text-gray-900 dark:text-gray-100"
              >
                {lang.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Select the language of the audio for better accuracy
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="diarize"
            className="flex items-center space-x-3 text-gray-700 dark:text-gray-300"
          >
            <input
              type="checkbox"
              id="diarize"
              checked={diarize}
              onChange={handleDiarizeChange}
              className="text-primary focus:ring-primary h-4 w-4 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            />
            <span className="text-sm font-medium">Speaker Diarization</span>
          </label>
          <p className="ml-7 text-xs text-gray-500 dark:text-gray-400">
            Identify different speakers in the transcription
          </p>
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Note: Only MP3, WAV, FLAC, and OGG formats are currently supported for
        direct transcription.
      </div>
    </div>
  );
}
