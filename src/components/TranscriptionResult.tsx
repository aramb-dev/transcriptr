import { Button } from './ui/button';

interface TranscriptionResultProps {
  transcription: string;
}

export function TranscriptionResult({ transcription }: TranscriptionResultProps) {
  const handleDownload = (format: string) => {
    const blob = new Blob([transcription], { type: `text/${format}` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcription.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <pre>{transcription}</pre>
      <div className="space-x-2">
        <Button onClick={() => handleDownload('txt')}>Download as TXT</Button>
        <Button onClick={() => handleDownload('md')}>Download as MD</Button>
        <Button onClick={() => handleDownload('pdf')}>Download as PDF</Button>
        <Button onClick={() => handleDownload('docx')}>Download as DOCX</Button>
      </div>
    </div>
  );
}
