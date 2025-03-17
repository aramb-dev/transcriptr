import { useState } from 'react';

// Language options based on error message
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

// Full list available as needed from the error message
// Uncomment to add more languages
/*
const ALL_LANGUAGES = [
  { value: "None", label: "Auto Detect" },
  { value: "afrikaans", label: "Afrikaans" },
  { value: "albanian", label: "Albanian" },
  // ...and so on
];
*/

export interface TranscriptionOptionsProps {
  onChange: (options: {
    language: string;
    diarize: boolean;
  }) => void;
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
    <div className="space-y-4 py-4 border-t border-b border-gray-100 dark:border-gray-800">
      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Transcription Options</h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Language
          </label>
          <select
            id="language"
            value={language}
            onChange={handleLanguageChange}
            className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Select the language of the audio for better accuracy
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="diarize"
              checked={diarize}
              onChange={handleDiarizeChange}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600"
            />
            <label htmlFor="diarize" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Enable Speaker Diarization
            </label>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 pl-6">
            Identify different speakers in the audio (may reduce accuracy for some languages)
          </p>
        </div>
      </div>
    </div>
  );
}