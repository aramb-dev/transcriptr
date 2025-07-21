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
        Format Not Supported
      </h3>
      <p className="mb-3 text-sm">
        The file format{" "}
        <strong className="font-semibold">{fileExtension}</strong> is not
        directly supported for transcription. Please convert your file to MP3,
        WAV, or FLAC format before uploading.
      </p>
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
          Convert with CloudConvert <ExternalLink className="ml-1.5 h-3 w-3" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() =>
            window.open("https://github.com/aramb-dev/transcriptr", "_blank")
          }
        >
          Contribute to Project <ExternalLink className="ml-1.5 h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
