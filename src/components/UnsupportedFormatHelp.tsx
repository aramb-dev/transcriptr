import { ExternalLink } from "lucide-react";
import { Button } from "./ui/button";

interface UnsupportedFormatHelpProps {
  fileName: string;
  fileType: string;
}

export function UnsupportedFormatHelp({
  fileName,
  fileType,
}: UnsupportedFormatHelpProps) {
  const fileExtension =
    fileName.split(".").pop()?.toLowerCase() ||
    fileType.split("/").pop() ||
    "unknown";

  return (
    <div className="mt-4 rounded-lg border border-yellow-300 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950/50">
      <h3 className="mb-2 font-medium text-yellow-800 dark:text-yellow-300">
        Conversion Failed
      </h3>
      <p className="mb-3 text-sm text-yellow-700 dark:text-yellow-300">
        We tried to automatically convert your{" "}
        <strong className="font-semibold">{fileExtension}</strong> file to MP3,
        but the conversion failed. This could be due to a corrupted file or an
        unsupported codec.
      </p>
      <div className="mb-3 rounded-md bg-blue-50 p-3 dark:bg-blue-900/20">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          💡 <strong>What we support:</strong> Most common formats including
          M4A, AAC, MP4, WMA are automatically converted. Directly supported:
          MP3, WAV, FLAC, OGG.
        </p>
      </div>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:gap-3">
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() =>
            window.open(
              `https://cloudconvert.com/${fileExtension}-to-mp3`,
              "_blank",
            )
          }
        >
          Convert Manually <ExternalLink className="ml-1.5 h-3 w-3" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() =>
            window.open("https://github.com/aramb-dev/transcriptr", "_blank")
          }
        >
          Report Issue <ExternalLink className="ml-1.5 h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
