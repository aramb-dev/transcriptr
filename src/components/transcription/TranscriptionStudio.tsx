"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Card, CardHeader, CardContent } from "../ui/card";
import {
  Play,
  Pause,
  Volume2,
  SkipBack,
  SkipForward,
  Search,
  Copy,
  Download,
  FileAudio,
  Clock,
  FileText,
  AlertCircle,
  Keyboard,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";

// Types
interface AudioSource {
  name?: string;
  url?: string;
  duration?: number;
  size?: number;
  type: "file" | "url";
}

interface TranscriptionSegment {
  id: number;
  start: number;
  end: number;
  text: string;
}

interface TranscriptionStudioProps {
  transcription: string;
  audioSource?: AudioSource;
  segments?: TranscriptionSegment[];
  onNewTranscription: () => void;
}

// Format duration from seconds to MM:SS
const formatDuration = (seconds?: number): string => {
  if (!seconds) return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

// Format file size
const formatFileSize = (bytes?: number): string => {
  if (!bytes) return "--";
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
};

// Audio Player Component
interface AudioPlayerProps {
  audioUrl?: string;
  audioRef?: React.RefObject<HTMLAudioElement | null>;
  onTimeUpdate?: (time: number) => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  audioRef: externalAudioRef,
  onTimeUpdate,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const internalAudioRef = useRef<HTMLAudioElement>(null);
  const audioRef = externalAudioRef || internalAudioRef;

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((error) => {
          console.error("Audio playback failed:", error);
          toast.error("Failed to play audio");
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const skip = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(
        0,
        Math.min(duration, audioRef.current.currentTime + seconds),
      );
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const time = audioRef.current.currentTime;
      setCurrentTime(time);
      onTimeUpdate?.(time);
    }
  };

  const handleDurationChange = () => {
    if (audioRef.current && audioRef.current.duration) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgressBarClick = (
    e: React.MouseEvent<HTMLDivElement>,
  ) => {
    const progressBar = e.currentTarget;
    const clickX = e.clientX - progressBar.getBoundingClientRect().left;
    const percentage = clickX / progressBar.clientWidth;
    const newTime = percentage * duration;

    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(duration, newTime));
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <FileAudio className="h-4 w-4 text-blue-600" />
          <h3 className="text-sm font-medium">Audio Player</h3>
        </div>
      </CardHeader>
      <CardContent>
        {audioUrl ? (
          <>
            <audio
              ref={audioRef}
              src={audioUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleDurationChange}
              onEnded={() => setIsPlaying(false)}
              preload="metadata"
              crossOrigin="anonymous"
              className="hidden"
            />

            <div className="space-y-4">
              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => skip(-10)}
                  className="h-8 w-8 p-0"
                  title="Skip back 10 seconds"
                >
                  <SkipBack className="h-4 w-4" />
                </Button>

                <Button
                  onClick={togglePlay}
                  size="sm"
                  className="h-10 w-10 rounded-full p-0"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => skip(10)}
                  className="h-8 w-8 p-0"
                  title="Skip forward 10 seconds"
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{formatDuration(currentTime)}</span>
                  <span>{formatDuration(duration)}</span>
                </div>
                <div
                  className="h-1 cursor-pointer overflow-hidden rounded-full bg-gray-200 transition-all duration-100 hover:h-2"
                  onClick={handleProgressBarClick}
                  role="slider"
                  aria-label="Audio progress"
                  aria-valuemin={0}
                  aria-valuemax={duration || 0}
                  aria-valuenow={currentTime}
                >
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-100"
                    style={{
                      width:
                        duration && duration > 0
                          ? `${(currentTime / duration) * 100}%`
                          : "0%",
                    }}
                  />
                </div>
              </div>

              {/* Volume */}
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-gray-500" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="h-1 flex-1"
                  aria-label="Volume control"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="py-8 text-center text-gray-500">
            <FileAudio className="mx-auto mb-2 h-8 w-8 opacity-50" />
            <p className="text-sm">No audio file available for playback</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// File Details Component
const FileDetails: React.FC<{ audioSource?: AudioSource }> = ({
  audioSource,
}) => {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-green-600" />
          <h3 className="text-sm font-medium">File Details</h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between">
          <span className="text-sm text-gray-600">Filename</span>
          <span className="max-w-[200px] truncate text-right text-sm font-medium">
            {audioSource?.name || "Unknown"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Duration</span>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-gray-500" />
            <span className="text-sm">
              {formatDuration(audioSource?.duration)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Size</span>
          <span className="text-sm">{formatFileSize(audioSource?.size)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Type</span>
          <Badge variant="secondary" className="text-xs">
            {audioSource?.type === "file" ? "Upload" : "URL"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

// Export Controls Component
interface ExportControlsProps {
  transcription: string;
  segments?: TranscriptionSegment[];
}

const ExportControls: React.FC<ExportControlsProps> = ({
  transcription,
  segments,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<"txt" | "docx" | "srt" | "vtt">(
    "txt",
  );
  const [isDownloading, setIsDownloading] = useState(false);

  // Helper to format time for SRT (HH:MM:SS,mmm)
  const formatTimeForSRT = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const milliseconds = Math.round((seconds % 1) * 1000);
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")},${milliseconds.toString().padStart(3, "0")}`;
  };

  // Helper to format time for VTT (HH:MM:SS.mmm)
  const formatTimeForVTT = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const milliseconds = Math.round((seconds % 1) * 1000);
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`;
  };

  // Generate SRT content from segments
  const generateSRT = (): string => {
    if (!segments || segments.length === 0) {
      return "1\n00:00:00,000 --> 00:00:00,100\n" + transcription;
    }

    return segments
      .map((segment, _index) => {
        const startTime = formatTimeForSRT(segment.start);
        const endTime = formatTimeForSRT(segment.end);
        return `${segment.id + 1}\n${startTime} --> ${endTime}\n${segment.text.trim()}\n`;
      })
      .join("\n");
  };

  // Generate VTT content from segments
  const generateVTT = (): string => {
    if (!segments || segments.length === 0) {
      return "WEBVTT\n\n00:00:00.000 --> 00:00:00.100\n" + transcription;
    }

    let vtt = "WEBVTT\n\n";
    vtt += segments
      .map((segment) => {
        const startTime = formatTimeForVTT(segment.start);
        const endTime = formatTimeForVTT(segment.end);
        return `${startTime} --> ${endTime}\n${segment.text.trim()}\n`;
      })
      .join("\n");
    return vtt;
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `transcription_${timestamp}.${selectedFormat}`;
      let blob: Blob;

      if (selectedFormat === "srt") {
        const content = generateSRT();
        blob = new Blob([content], { type: "text/plain" });
      } else if (selectedFormat === "vtt") {
        const content = generateVTT();
        blob = new Blob([content], { type: "text/vtt" });
      } else if (selectedFormat === "docx") {
        // Create proper DOCX document
        const doc = new Document({
          sections: [
            {
              children: [
                new Paragraph({
                  text: "Transcription",
                  heading: HeadingLevel.TITLE,
                }),
                new Paragraph({ children: [new TextRun("")] }),
                ...transcription.split("\n").map(
                  (line: string) =>
                    new Paragraph({
                      children: [new TextRun(line)],
                    }),
                ),
              ],
            },
          ],
        });
        const buffer = await Packer.toBuffer(doc);
        blob = new Blob([new Uint8Array(buffer)], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
      } else {
        blob = new Blob([transcription], { type: "text/plain" });
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => URL.revokeObjectURL(url), 100);
      toast.success(`${selectedFormat.toUpperCase()} file downloaded!`);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Download failed");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Download className="h-4 w-4 text-purple-600" />
          <h3 className="text-sm font-medium">Export Options</h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Format Selection */}
        <div>
          <label className="mb-2 block text-xs text-gray-600">Format</label>
          <div className="grid grid-cols-2 gap-2">
            {(["txt", "srt", "vtt", "docx"] as const).map((format) => (
              <Button
                key={format}
                variant={selectedFormat === format ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFormat(format)}
                className="text-xs"
              >
                {format.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>

        {/* Format Info */}
        {segments && (
          <div className="rounded-md bg-blue-50 p-2 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
            {selectedFormat === "srt"
              ? "SRT format with timestamps from transcription segments"
              : selectedFormat === "vtt"
                ? "WebVTT format with timestamps from transcription segments"
                : "Plain text transcription"}
          </div>
        )}

        {/* Download Button */}
        <Button
          onClick={handleDownload}
          disabled={isDownloading}
          className="w-full"
          size="sm"
        >
          {isDownloading
            ? "Downloading..."
            : `Download ${selectedFormat.toUpperCase()}`}
        </Button>
      </CardContent>
    </Card>
  );
};

// Copy/Download Actions Component
interface ActionButtonsProps {
  transcription: string;
  segments?: TranscriptionSegment[];
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  transcription,
  segments,
}) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(transcription);
      setCopySuccess(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  // Helper functions for subtitle formats
  const formatTimeForSRT = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const milliseconds = Math.round((seconds % 1) * 1000);
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")},${milliseconds.toString().padStart(3, "0")}`;
  };

  const formatTimeForVTT = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const milliseconds = Math.round((seconds % 1) * 1000);
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`;
  };

  const generateSRT = (): string => {
    if (!segments || segments.length === 0) {
      return "1\n00:00:00,000 --> 00:00:00,100\n" + transcription;
    }
    return segments
      .map((segment) => {
        const startTime = formatTimeForSRT(segment.start);
        const endTime = formatTimeForSRT(segment.end);
        return `${segment.id + 1}\n${startTime} --> ${endTime}\n${segment.text.trim()}\n`;
      })
      .join("\n");
  };

  const generateVTT = (): string => {
    if (!segments || segments.length === 0) {
      return "WEBVTT\n\n00:00:00.000 --> 00:00:00.100\n" + transcription;
    }
    let vtt = "WEBVTT\n\n";
    vtt += segments
      .map((segment) => {
        const startTime = formatTimeForVTT(segment.start);
        const endTime = formatTimeForVTT(segment.end);
        return `${startTime} --> ${endTime}\n${segment.text.trim()}\n`;
      })
      .join("\n");
    return vtt;
  };

  const handleDownloadAll = async () => {
    setIsDownloadingAll(true);
    toast.info("Preparing all formats...");

    try {
      const timestamp = new Date().toISOString().split("T")[0];
      const downloads: Array<{ content: Blob; filename: string }> = [];

      // TXT
      downloads.push({
        content: new Blob([transcription], { type: "text/plain" }),
        filename: `transcription_${timestamp}.txt`,
      });

      // SRT
      downloads.push({
        content: new Blob([generateSRT()], { type: "text/plain" }),
        filename: `transcription_${timestamp}.srt`,
      });

      // VTT
      downloads.push({
        content: new Blob([generateVTT()], { type: "text/vtt" }),
        filename: `transcription_${timestamp}.vtt`,
      });

      // DOCX
      const doc = new Document({
        sections: [
          {
            children: [
              new Paragraph({
                text: "Transcription",
                heading: HeadingLevel.TITLE,
              }),
              new Paragraph({ children: [new TextRun("")] }),
              ...transcription.split("\n").map(
                (line: string) =>
                  new Paragraph({
                    children: [new TextRun(line)],
                  }),
              ),
            ],
          },
        ],
      });
      const buffer = await Packer.toBuffer(doc);
      downloads.push({
        content: new Blob([new Uint8Array(buffer)], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        }),
        filename: `transcription_${timestamp}.docx`,
      });

      // Download all files with a small delay between each
      for (let i = 0; i < downloads.length; i++) {
        const { content, filename } = downloads[i];
        const url = URL.createObjectURL(content);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 100);
        
        // Small delay between downloads to prevent browser blocking
        if (i < downloads.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      }

      toast.success(`Downloaded ${downloads.length} files!`);
    } catch (error) {
      console.error("Download all failed:", error);
      toast.error("Failed to download all formats");
    } finally {
      setIsDownloadingAll(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={handleCopy}
        disabled={copySuccess}
        className="w-full"
        size="lg"
      >
        {copySuccess ? (
          <>
            <Copy className="mr-2 h-4 w-4 text-green-500" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="mr-2 h-4 w-4" />
            Copy to Clipboard
          </>
        )}
      </Button>

      <Button
        variant="outline"
        onClick={handleDownloadAll}
        disabled={isDownloadingAll}
        className="w-full text-sm"
        size="sm"
      >
        <Download className="mr-2 h-3 w-3" />
        {isDownloadingAll ? "Downloading..." : "Download All Formats"}
      </Button>
    </div>
  );
};

// Enhanced Transcript Display Component
interface EnhancedTranscriptProps {
  transcription: string;
  segments?: TranscriptionSegment[];
  onSegmentClick?: (startTime: number) => void;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
  currentTime?: number;
}

const EnhancedTranscript: React.FC<EnhancedTranscriptProps> = ({
  transcription,
  segments,
  onSegmentClick,
  currentTime = 0,
  searchInputRef,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);

  // Copy transcript to clipboard
  const handleCopyTranscript = async () => {
    try {
      await navigator.clipboard.writeText(transcription);
      setCopySuccess(true);
      toast.success("Transcript copied to clipboard!");
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      toast.error("Failed to copy transcript");
    }
  };

  // Handle search in segments or transcription
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim() && segments) {
      // Search in segments
      const results: number[] = [];
      segments.forEach((segment, index) => {
        if (segment.text.toLowerCase().includes(term.toLowerCase())) {
          results.push(index);
        }
      });
      setSearchResults(results);
    } else if (term.trim()) {
      // Fallback: search in full transcription
      setSearchResults([]);
    } else {
      setSearchResults([]);
    }
  };

  // Determine if a segment is currently playing
  const getCurrentSegmentIndex = (): number | null => {
    if (!segments) return null;
    return (
      segments.findIndex(
        (seg) =>
          currentTime >= seg.start && currentTime < seg.end,
      ) ?? null
    );
  };

  const currentSegmentIndex = getCurrentSegmentIndex();

  return (
    <div className="space-y-6">
      {/* Full Transcript Container */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Full Transcript
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyTranscript}
            disabled={copySuccess}
            className="flex items-center gap-2"
          >
            {copySuccess ? (
              <>
                <Copy className="h-4 w-4 text-green-500" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy All</span>
              </>
            )}
          </Button>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="max-h-96 overflow-y-auto p-6">
            <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-gray-800 dark:text-gray-200">
              {transcription || "No transcript available"}
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div>
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Input
            ref={searchInputRef}
            placeholder="Search transcript... (Ctrl+F)"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        {searchResults.length > 0 && (
          <p className="mt-1 text-xs text-gray-500">
            Found {searchResults.length} result
            {searchResults.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Segments View (if available) */}
      {segments && segments.length > 0 ? (
        <div>
          <h4 className="mb-3 text-sm font-medium tracking-wide text-gray-600 uppercase dark:text-gray-400">
            Interactive Segments
          </h4>
          <div className="max-h-96 overflow-y-auto">
            <div className="space-y-3 pr-2">
              {segments.map((segment, index) => {
                const isHighlighted = searchResults.includes(index);
                const isCurrentSegment = currentSegmentIndex === index;

                return (
                  <motion.div
                    key={segment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    onClick={() => onSegmentClick?.(segment.start)}
                    className={cn(
                      "cursor-pointer rounded-lg border p-3 transition-all duration-200 hover:shadow-md",
                      isCurrentSegment
                        ? "border-blue-400 bg-blue-50 shadow-md dark:border-blue-600 dark:bg-blue-900/20"
                        : isHighlighted
                          ? "border-yellow-200 bg-yellow-50 dark:border-yellow-600 dark:bg-yellow-900/20"
                          : "border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-750",
                    )}
                    title="Click to play audio from this segment"
                  >
                    {/* Timestamp */}
                    <div className="mb-2 flex items-center gap-2">
                      <span className="rounded bg-gray-200 px-2 py-1 font-mono text-xs dark:bg-gray-700">
                        {formatDuration(segment.start)} -{" "}
                        {formatDuration(segment.end)}
                      </span>
                      {isCurrentSegment && (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          Now Playing
                        </span>
                      )}
                    </div>

                    {/* Transcript Text */}
                    <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                      {searchTerm && isHighlighted
                        ? segment.text
                            .split(new RegExp(`(${searchTerm})`, "gi"))
                            .map((part, partIndex) =>
                              part.toLowerCase() === searchTerm.toLowerCase() ? (
                                <mark
                                  key={partIndex}
                                  className="rounded bg-yellow-200 px-1"
                                >
                                  {part}
                                </mark>
                              ) : (
                                part
                              ),
                            )
                        : segment.text}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-800">
          <AlertCircle className="mx-auto mb-2 h-8 w-8 text-gray-400" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Segment data not available. Showing full transcript above.
          </p>
        </div>
      )}
    </div>
  );
};

// Main TranscriptionStudio Component
// Keyboard Shortcuts Modal
const KeyboardShortcutsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: "Space", action: "Play / Pause" },
    { key: "←", action: "Skip back 5s" },
    { key: "→", action: "Skip forward 5s" },
    { key: "Shift + ←", action: "Skip back 30s" },
    { key: "Shift + →", action: "Skip forward 30s" },
    { key: "↑ / ↓", action: "Volume up / down" },
    { key: "M", action: "Mute / Unmute" },
    { key: "0-9", action: "Jump to 0%-90%" },
    { key: "Ctrl/⌘ + F", action: "Focus search" },
    { key: "Ctrl/⌘ + C", action: "Copy transcript" },
    { key: "Esc", action: "Clear search" },
    { key: "?", action: "Show shortcuts" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2">
          {shortcuts.map(({ key, action }) => (
            <div key={key} className="flex items-center justify-between rounded px-2 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
              <span className="text-gray-600 dark:text-gray-300">{action}</span>
              <kbd className="rounded bg-gray-200 px-2 py-1 font-mono text-xs dark:bg-gray-700">{key}</kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const TranscriptionStudio: React.FC<TranscriptionStudioProps> = ({
  transcription,
  audioSource,
  segments,
  onNewTranscription,
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [, setIsMuted] = useState(false);
  const [, setVolume] = useState(1);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Get audio URL from localStorage or prop
  const audioUrl =
    typeof window !== "undefined"
      ? localStorage.getItem("studioAudioUrl") || audioSource?.url
      : audioSource?.url;

  // Handle segment click to seek to that point
  const handleSegmentClick = (startTime: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = startTime;
      audioRef.current.play().catch((error) => {
        console.error("Audio playback failed:", error);
        toast.error("Failed to play audio");
      });
    }
  };

  // Update current time for segment highlighting
  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = e.target as HTMLElement;
      const isInputField = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

      // Allow Escape even in input fields
      if (e.key === "Escape") {
        if (searchInputRef.current) {
          searchInputRef.current.blur();
          searchInputRef.current.value = "";
        }
        return;
      }

      // Ctrl/Cmd + F to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      // Ctrl/Cmd + C to copy (only when not in input)
      if ((e.ctrlKey || e.metaKey) && e.key === "c" && !isInputField) {
        e.preventDefault();
        navigator.clipboard.writeText(transcription).then(() => {
          toast.success("Transcript copied to clipboard!");
        }).catch(() => {
          toast.error("Failed to copy transcript");
        });
        return;
      }

      // Skip other shortcuts if in input field
      if (isInputField) return;

      const audio = audioRef.current;
      if (!audio) return;

      switch (e.key) {
        case " ": // Space - Play/Pause
          e.preventDefault();
          if (audio.paused) {
            audio.play().catch(console.error);
          } else {
            audio.pause();
          }
          break;

        case "ArrowLeft": // Left arrow - Skip back
          e.preventDefault();
          audio.currentTime = Math.max(0, audio.currentTime - (e.shiftKey ? 30 : 5));
          break;

        case "ArrowRight": // Right arrow - Skip forward
          e.preventDefault();
          audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + (e.shiftKey ? 30 : 5));
          break;

        case "ArrowUp": // Up arrow - Volume up
          e.preventDefault();
          const newVolUp = Math.min(1, audio.volume + 0.1);
          audio.volume = newVolUp;
          setVolume(newVolUp);
          toast.success(`Volume: ${Math.round(newVolUp * 100)}%`);
          break;

        case "ArrowDown": // Down arrow - Volume down
          e.preventDefault();
          const newVolDown = Math.max(0, audio.volume - 0.1);
          audio.volume = newVolDown;
          setVolume(newVolDown);
          toast.success(`Volume: ${Math.round(newVolDown * 100)}%`);
          break;

        case "m": // M - Mute/Unmute
        case "M":
          e.preventDefault();
          audio.muted = !audio.muted;
          setIsMuted(audio.muted);
          toast.success(audio.muted ? "Muted" : "Unmuted");
          break;

        case "1": case "2": case "3": case "4": case "5":
        case "6": case "7": case "8": case "9":
          // Number keys 1-9 - Jump to percentage
          e.preventDefault();
          const percentage = parseInt(e.key) * 10;
          if (audio.duration) {
            audio.currentTime = (audio.duration * percentage) / 100;
            toast.success(`Jumped to ${percentage}%`);
          }
          break;

        case "0": // 0 - Jump to start
          e.preventDefault();
          audio.currentTime = 0;
          break;

        case "?": // ? - Show keyboard shortcuts
          e.preventDefault();
          setShowShortcuts(true);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [transcription]);

  return (
    <>
      <KeyboardShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
      
      <div className="min-h-full bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto flex min-h-full flex-col px-4 py-4 lg:py-6">
          {/* Header */}
          <div className="mb-4 flex flex-shrink-0 flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
                Transcription Studio
              </h1>
              <p className="text-sm text-gray-600 sm:text-base dark:text-gray-400">
                Professional audio transcription workspace
                <button
                  onClick={() => setShowShortcuts(true)}
                  className="ml-2 hidden text-xs text-gray-400 hover:text-gray-600 lg:inline dark:hover:text-gray-300"
                >
                  • Press <kbd className="rounded bg-gray-200 px-1 dark:bg-gray-700">?</kbd> for shortcuts
                </button>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowShortcuts(true)}
                className="hidden lg:flex"
                title="Keyboard shortcuts"
              >
                <Keyboard className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={onNewTranscription}
                className="flex items-center gap-2"
                size="sm"
              >
                <FileAudio className="h-4 w-4" />
                <span className="hidden sm:inline">New Transcription</span>
                <span className="sm:hidden">New</span>
              </Button>
            </div>
          </div>

          {/* Mobile-first Layout: stacked on mobile, side-by-side on desktop */}
          <div className="flex flex-1 flex-col gap-4 lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-hidden">
          {/* Mobile: Audio player first, then transcript */}
          {/* Desktop: Transcript left, controls right */}
          
          {/* Audio Player - Shows first on mobile */}
          <div className="order-1 lg:order-2 lg:col-span-1 lg:row-span-1">
            <div className="space-y-4 lg:max-h-full lg:overflow-y-auto">
              {/* Audio Player */}
              <AudioPlayer
                audioUrl={audioUrl}
                audioRef={audioRef}
                onTimeUpdate={handleTimeUpdate}
              />

              {/* File Details - Hidden on mobile, shown on desktop */}
              <div className="hidden lg:block">
                <FileDetails audioSource={audioSource} />
              </div>

              {/* Export Controls */}
              <ExportControls transcription={transcription} segments={segments} />

              {/* Action Buttons */}
              <ActionButtons transcription={transcription} segments={segments} />
            </div>
          </div>

          {/* Transcript Panel - Shows second on mobile, first on desktop */}
          <div className="order-2 flex min-h-[400px] flex-col lg:order-1 lg:col-span-2">
            <Card className="flex flex-1 flex-col">
              <CardHeader className="flex-shrink-0 pb-2 lg:pb-4">
                <h2 className="text-base font-semibold lg:text-lg">Transcript</h2>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-4 lg:p-6">
                <EnhancedTranscript
                  transcription={transcription}
                  segments={segments}
                  onSegmentClick={handleSegmentClick}
                  currentTime={currentTime}
                  searchInputRef={searchInputRef}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default TranscriptionStudio;
