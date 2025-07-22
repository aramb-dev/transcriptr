"use client";

import React, { useState, useRef } from "react";
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
  Users,
  AlertCircle,
  Sparkles,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Types
interface AudioSource {
  name?: string;
  url?: string;
  duration?: number;
  size?: number;
  type: "file" | "url";
}

interface TranscriptionStudioProps {
  transcription: string;
  audioSource?: AudioSource;
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
const AudioPlayer: React.FC<{ audioSource?: AudioSource }> = ({
  audioSource,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const skip = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(
        0,
        audioRef.current.currentTime + seconds,
      );
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
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
        {audioSource?.url ? (
          <>
            <audio
              ref={audioRef}
              src={audioSource.url}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              preload="metadata"
            />

            <div className="space-y-4">
              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => skip(-10)}
                  className="h-8 w-8 p-0"
                >
                  <SkipBack className="h-4 w-4" />
                </Button>

                <Button
                  onClick={togglePlay}
                  size="sm"
                  className="h-10 w-10 rounded-full p-0"
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
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{formatDuration(currentTime)}</span>
                  <span>{formatDuration(audioSource.duration)}</span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-100"
                    style={{
                      width: audioSource.duration
                        ? `${(currentTime / audioSource.duration) * 100}%`
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
            <p className="text-sm">Audio player will be available soon</p>
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
const ExportControls: React.FC<{ transcription: string }> = ({
  transcription,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<"txt" | "docx" | "srt">(
    "txt",
  );
  const [includeTimestamps, setIncludeTimestamps] = useState(true);
  const [includeSpeakers, setIncludeSpeakers] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Simulate download process
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `transcription_${timestamp}.${selectedFormat}`;

      let content = transcription;
      if (selectedFormat === "srt") {
        // Convert to SRT format (placeholder)
        content =
          "1\n00:00:01,000 --> 00:00:05,000\n" +
          transcription.substring(0, 50) +
          "...";
      }

      const blob = new Blob([content], {
        type:
          selectedFormat === "docx"
            ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            : "text/plain",
      });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => URL.revokeObjectURL(url), 100);
      toast.success(`${selectedFormat.toUpperCase()} file downloaded!`);
    } catch {
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
          <div className="flex gap-2">
            {(["txt", "docx", "srt"] as const).map((format) => (
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

        {/* Options */}
        <div className="space-y-2">
          <label className="text-xs text-gray-600">Include</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeTimestamps}
                onChange={(e) => setIncludeTimestamps(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600"
              />
              <span className="text-sm">Timestamps</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeSpeakers}
                onChange={(e) => setIncludeSpeakers(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600"
              />
              <span className="text-sm">Speaker names</span>
            </label>
          </div>
        </div>

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
const ActionButtons: React.FC<{ transcription: string }> = ({
  transcription,
}) => {
  const [copySuccess, setCopySuccess] = useState(false);

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

  const handleDownloadAll = async () => {
    toast.success("Preparing all formats...");
    // This would integrate with existing download functionality
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
        className="w-full text-sm"
        size="sm"
      >
        <Download className="mr-2 h-3 w-3" />
        Download All Formats
      </Button>
    </div>
  );
};

// Coming Soon Banner Component
const ComingSoonBanner: React.FC<{ onDismiss: () => void }> = ({
  onDismiss,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="relative mb-4 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 p-3"
    >
      <div className="flex items-start gap-2 pr-8">
        <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
        <div>
          <p className="text-sm font-medium text-blue-900">
            ✨ <strong>Coming Soon:</strong> Interactive Transcript!
          </p>
          <p className="mt-1 text-xs text-blue-700">
            You'll be able to click any word to play the audio from that point,
            navigate with timestamps, and more.
          </p>
        </div>
      </div>
      <button
        onClick={onDismiss}
        className="absolute top-2 right-2 rounded-full p-1 transition-colors hover:bg-blue-100"
        title="Dismiss notification"
      >
        <X className="h-3 w-3 text-blue-600" />
      </button>
    </motion.div>
  );
};

// Enhanced Transcript Display Component
const EnhancedTranscript: React.FC<{ transcription: string }> = ({
  transcription,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showComingSoonBanner, setShowComingSoonBanner] = useState(true);

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

  // Format transcription with better readability
  const formatTranscription = (text: string) => {
    // Split into paragraphs (looking for natural breaks)
    const paragraphs = text
      .split(/\n\n|\. (?=[A-Z])/g)
      .filter((p) => p.trim().length > 0)
      .map((p) => p.trim());

    return paragraphs;
  };

  // Add mock timestamps and speakers for demonstration
  const addMockTimestamps = (text: string, index: number) => {
    // Mock timestamps every ~30 seconds
    const mockTime = `[${String(Math.floor(index * 0.5)).padStart(2, "0")}:${String((index * 30) % 60).padStart(2, "0")}]`;
    const mockSpeaker =
      index % 3 === 0 ? "Speaker 1:" : index % 3 === 1 ? "Speaker 2:" : "";

    return { timestamp: mockTime, speaker: mockSpeaker, text };
  };

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      // Simple search implementation
      const results: number[] = [];
      const paragraphs = formatTranscription(transcription);
      paragraphs.forEach((paragraph, index) => {
        if (paragraph.toLowerCase().includes(term.toLowerCase())) {
          results.push(index);
        }
      });
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const paragraphs = formatTranscription(transcription);

  return (
    <div className="space-y-6">
      {showComingSoonBanner && (
        <ComingSoonBanner onDismiss={() => setShowComingSoonBanner(false)} />
      )}

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
            placeholder="Search transcript..."
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

      {/* Enhanced Preview with Mock Features */}
      <div>
        <h4 className="mb-3 text-sm font-medium tracking-wide text-gray-600 uppercase dark:text-gray-400">
          Preview: Enhanced Features (Coming Soon)
        </h4>
        <div className="max-h-96 overflow-y-auto">
          <div className="space-y-3 pr-2">
            {paragraphs.map((paragraph, index) => {
              const { timestamp, speaker, text } = addMockTimestamps(
                paragraph,
                index,
              );
              const isHighlighted = searchResults.includes(index);

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "cursor-pointer rounded-lg border p-3 opacity-75 transition-all duration-200 hover:opacity-90 hover:shadow-sm",
                    isHighlighted
                      ? "border-yellow-200 bg-yellow-50 shadow-sm"
                      : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800",
                  )}
                  title="Interactive features coming soon - click to play audio from this point"
                >
                  {/* Timestamp and Speaker (Static for now) */}
                  <div className="mb-2 flex items-center gap-3 text-xs text-gray-500">
                    <span className="rounded bg-gray-200 px-2 py-1 font-mono text-xs dark:bg-gray-700">
                      {timestamp}
                    </span>
                    {speaker && (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span className="font-medium">{speaker}</span>
                      </div>
                    )}
                  </div>

                  {/* Transcript Text */}
                  <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    {searchTerm && isHighlighted
                      ? text
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
                      : text}
                  </p>
                </motion.div>
              );
            })}

            {paragraphs.length === 0 && (
              <div className="py-12 text-center text-gray-500">
                <AlertCircle className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p>No transcript content available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main TranscriptionStudio Component
export const TranscriptionStudio: React.FC<TranscriptionStudioProps> = ({
  transcription,
  audioSource,
  onNewTranscription,
}) => {
  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto flex h-full flex-col px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex flex-shrink-0 items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Transcription Studio
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Professional audio transcription workspace
            </p>
          </div>

          <Button
            variant="outline"
            onClick={onNewTranscription}
            className="flex items-center gap-2"
          >
            <FileAudio className="h-4 w-4" />
            New Transcription
          </Button>
        </div>

        {/* Two-Column Layout */}
        <div className="grid flex-1 grid-cols-1 gap-6 overflow-hidden lg:grid-cols-3">
          {/* Left Panel - Transcript */}
          <div className="flex flex-col lg:col-span-2">
            <Card className="flex flex-1 flex-col">
              <CardHeader className="flex-shrink-0">
                <h2 className="text-lg font-semibold">Transcript</h2>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-6">
                <EnhancedTranscript transcription={transcription} />
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Controls */}
          <div className="max-h-full space-y-4 overflow-y-auto">
            {/* Audio Player */}
            <AudioPlayer audioSource={audioSource} />

            {/* File Details */}
            <FileDetails audioSource={audioSource} />

            {/* Export Controls */}
            <ExportControls transcription={transcription} />

            {/* Action Buttons */}
            <ActionButtons transcription={transcription} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranscriptionStudio;
