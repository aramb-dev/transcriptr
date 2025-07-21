import React, { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileCheck2, XCircle } from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  expandCenter,
  springTransition,
  smoothLayoutTransition,
} from "../../lib/animations";

interface FileUploadInputProps {
  fileName: string | null;
  fileSize: number;
  fileError: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onButtonClick: () => void;
  onReset: () => void;
  validateAndSetFile: (file: File) => void; // Function to handle dragged files
}

const formatFileSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export function FileUploadInput({
  fileName,
  fileSize,
  fileError,
  fileInputRef,
  onFileChange,
  onButtonClick,
  onReset,
  validateAndSetFile,
}: FileUploadInputProps) {
  // State for drag and drop
  const [isDragging, setIsDragging] = useState(false);

  // Counter to track multiple drag events (browsers fire multiple events)
  const dragCounter = React.useRef(0);

  // Drag event handlers with improved counter logic
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      // Ensure dragging state is true when dragging over
      if (!isDragging) {
        setIsDragging(true);
      }
    },
    [isDragging],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;

      const files = e.dataTransfer.files;

      console.log("File dropped:", files?.[0]?.name);

      if (files && files.length > 0) {
        validateAndSetFile(files[0]);
      }
    },
    [validateAndSetFile],
  );

  // Reset the drag counter when component unmounts
  useEffect(() => {
    return () => {
      dragCounter.current = 0;
    };
  }, []);

  // Handle when the component loses focus to reset dragging state
  // This helps with edge cases where dragLeave might not fire
  useEffect(() => {
    const handleWindowDragEnd = () => {
      dragCounter.current = 0;
      setIsDragging(false);
    };

    window.addEventListener("dragend", handleWindowDragEnd);
    return () => {
      window.removeEventListener("dragend", handleWindowDragEnd);
    };
  }, []);

  return (
    <LayoutGroup id="file-upload-container">
      <div className="mt-6 flex flex-col items-center gap-4">
        <motion.div
          className={`w-full border-2 border-dashed ${
            isDragging
              ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20"
              : "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50"
          } cursor-pointer rounded-xl p-8 transition-all`}
          variants={expandCenter}
          initial="initial"
          animate="animate"
          whileHover={{
            scale: 1.01,
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
          }}
          transition={springTransition}
          layout="position"
          layoutId="drop-area"
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={onButtonClick} // Make entire area clickable
        >
          <label htmlFor="audio-file" className="sr-only">
            Upload audio file
          </label>
          <input
            id="audio-file"
            type="file"
            accept="audio/mpeg,audio/wav,audio/flac,audio/ogg,.mp3,.wav,.flac,.ogg"
            ref={fileInputRef}
            className="hidden"
            onChange={onFileChange}
          />

          <div className="text-center">
            <AnimatePresence mode="wait" initial={false}>
              {!fileName && (
                <motion.div
                  key="upload-prompt"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  layout
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <UploadCloud
                      className={`h-8 w-8 ${
                        isDragging
                          ? "scale-110 text-blue-500 transition-transform duration-200 dark:text-blue-300"
                          : "text-blue-600 dark:text-blue-400"
                      }`}
                    />
                  </div>
                  <h3 className="mt-2 text-lg font-semibold">
                    {isDragging
                      ? "Drop your file here"
                      : "Drop your audio file here"}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    MP3, WAV, FLAC or OGG file up to 100MB
                  </p>
                </motion.div>
              )}

              {fileName && !fileError && (
                <motion.div
                  key="file-success"
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={smoothLayoutTransition}
                  layout
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <FileCheck2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="mt-2 text-lg font-semibold">{fileName}</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {formatFileSize(fileSize || 0)}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the click on the parent div
                      onReset();
                    }}
                  >
                    Remove file
                  </Button>
                </motion.div>
              )}

              {fileError && (
                <motion.div
                  key="file-error"
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={smoothLayoutTransition}
                  layout
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                    <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-red-500 dark:text-red-400">
                    Error
                  </h3>
                  <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                    {fileError}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the click on the parent div
                      onReset();
                    }}
                  >
                    Try again
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div
          className="w-full text-center"
          layout
          transition={smoothLayoutTransition}
        >
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="w-full rounded-lg border-2 border-dashed border-gray-300 px-6 py-8 dark:border-gray-700"
            onClick={onButtonClick}
            disabled={!!fileError}
          >
            <span className="flex items-center justify-center">
              <UploadCloud className="mr-2 h-5 w-5" />
              {!fileName ? "Click to browse files" : "Choose a different file"}
            </span>
          </Button>
        </motion.div>
      </div>
    </LayoutGroup>
  );
}
