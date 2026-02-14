"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Card, CardHeader, CardContent } from "../ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Search,
  Copy,
  Download,
  FileAudio,
  Clock,
  FileText,
  Keyboard,
  X,
  Repeat,
  ChevronLeft,
  ChevronRight,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import type { TranscriptionSegment, TranscriptionWord, TranscriptionIntelligence } from "@/types/transcription";
import { ChaptersPanel } from "../studio/ChaptersPanel";
import { SummaryPanel } from "../studio/SummaryPanel";
import { SentimentPanel } from "../studio/SentimentPanel";
import { EntitiesPanel } from "../studio/EntitiesPanel";
import { KeyPhrasesPanel } from "../studio/KeyPhrasesPanel";

// Types
interface AudioSource {
  name?: string;
  url?: string;
  duration?: number;
  size?: number;
  type: "file" | "url";
}

// Speaker color schemes
const SPEAKER_COLORS = [
  { border: "border-l-blue-500", badge: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  { border: "border-l-green-500", badge: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  { border: "border-l-purple-500", badge: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
  { border: "border-l-orange-500", badge: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
  { border: "border-l-pink-500", badge: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200" },
  { border: "border-l-teal-500", badge: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200" },
];

const getSpeakerColor = (speaker: string) => {
  // Speaker labels from AssemblyAI are "A", "B", "C" etc.
  const index = speaker.charCodeAt(0) - "A".charCodeAt(0);
  return SPEAKER_COLORS[index % SPEAKER_COLORS.length];
};

// Binary search to find active word index
const findActiveWordIndex = (words: TranscriptionWord[], currentTime: number): number => {
  let low = 0;
  let high = words.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (currentTime >= words[mid].start && currentTime < words[mid].end) {
      return mid;
    } else if (currentTime < words[mid].start) {
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }
  return -1;
};

interface TranscriptionStudioProps {
  transcription: string;
  audioSource?: AudioSource;
  segments?: TranscriptionSegment[];
  intelligence?: TranscriptionIntelligence;
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
  segments?: TranscriptionSegment[];
  onSegmentChange?: (segmentIndex: number) => void;
}

// Playback speed options
const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  audioRef: externalAudioRef,
  onTimeUpdate,
  segments,
  onSegmentChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const [loopStart, setLoopStart] = useState<number | null>(null);
  const [loopEnd, setLoopEnd] = useState<number | null>(null);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const internalAudioRef = useRef<HTMLAudioElement>(null);
  const audioRef = externalAudioRef || internalAudioRef;

  // Get current segment index
  const currentSegmentIndex = segments?.findIndex(
    (seg) => currentTime >= seg.start && currentTime < seg.end
  ) ?? -1;

  // Handle playback speed change
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
    toast.success(`Playback speed: ${speed}x`);
  };

  // Navigate to previous segment
  const goToPrevSegment = () => {
    if (!segments || segments.length === 0) return;
    const prevIndex = Math.max(0, currentSegmentIndex - 1);
    if (audioRef.current && segments[prevIndex]) {
      audioRef.current.currentTime = segments[prevIndex].start;
      onSegmentChange?.(prevIndex);
    }
  };

  // Navigate to next segment
  const goToNextSegment = () => {
    if (!segments || segments.length === 0) return;
    const nextIndex = Math.min(segments.length - 1, currentSegmentIndex + 1);
    if (audioRef.current && segments[nextIndex]) {
      audioRef.current.currentTime = segments[nextIndex].start;
      onSegmentChange?.(nextIndex);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Set loop points
  const setLoopPoint = (type: 'start' | 'end') => {
    if (type === 'start') {
      setLoopStart(currentTime);
      toast.success(`Loop start: ${formatDuration(currentTime)}`);
    } else {
      setLoopEnd(currentTime);
      toast.success(`Loop end: ${formatDuration(currentTime)}`);
    }
  };

  // Clear loop
  const clearLoop = () => {
    setLoopStart(null);
    setLoopEnd(null);
    setIsLooping(false);
    toast.success('Loop cleared');
  };

  // Handle loop playback
  useEffect(() => {
    if (isLooping && loopStart !== null && loopEnd !== null && audioRef.current) {
      if (currentTime >= loopEnd) {
        audioRef.current.currentTime = loopStart;
      }
    }
  }, [currentTime, isLooping, loopStart, loopEnd, audioRef]);

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

              {/* Volume & Speed Controls */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMute}
                    className="h-8 w-8 p-0"
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="h-1 w-20"
                    aria-label="Volume control"
                  />
                </div>

                {/* Playback Speed */}
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                    className="h-8 px-2 text-xs"
                  >
                    {playbackSpeed}x
                  </Button>
                  {showSpeedMenu && (
                    <div className="absolute right-0 bottom-10 z-10 rounded-md border bg-white p-1 shadow-lg dark:bg-gray-800">
                      {PLAYBACK_SPEEDS.map((speed) => (
                        <button
                          key={speed}
                          onClick={() => handleSpeedChange(speed)}
                          className={cn(
                            "block w-full rounded px-3 py-1 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700",
                            playbackSpeed === speed && "bg-blue-100 dark:bg-blue-900"
                          )}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Loop Controls */}
                <div className="flex items-center gap-1">
                  <Button
                    variant={isLooping ? "default" : "ghost"}
                    size="sm"
                    onClick={() => {
                      if (loopStart !== null && loopEnd !== null) {
                        setIsLooping(!isLooping);
                      } else {
                        toast.error("Set loop start and end points first");
                      }
                    }}
                    className="h-8 w-8 p-0"
                    title="Toggle loop"
                  >
                    <Repeat className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Segment Navigation */}
              {segments && segments.length > 0 && (
                <div className="flex items-center justify-between border-t pt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToPrevSegment}
                    disabled={currentSegmentIndex <= 0}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Prev
                  </Button>
                  <span className="text-xs text-gray-500">
                    Segment {currentSegmentIndex + 1} of {segments.length}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToNextSegment}
                    disabled={currentSegmentIndex >= segments.length - 1}
                    className="flex items-center gap-1"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Loop Points Display */}
              {(loopStart !== null || loopEnd !== null) && (
                <div className="flex items-center justify-between border-t pt-3 text-xs">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setLoopPoint('start')} className="h-6 px-2 text-xs">
                      A: {loopStart !== null ? formatDuration(loopStart) : '--:--'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setLoopPoint('end')} className="h-6 px-2 text-xs">
                      B: {loopEnd !== null ? formatDuration(loopEnd) : '--:--'}
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearLoop} className="h-6 px-2 text-xs text-red-500">
                    Clear
                  </Button>
                </div>
              )}
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
  intelligence?: TranscriptionIntelligence;
}

// Statistics Component (Phase 4)
const TranscriptStatistics: React.FC<{ transcription: string; segments?: TranscriptionSegment[] }> = ({
  transcription,
  segments,
}) => {
  const stats = React.useMemo(() => {
    const words = transcription.trim().split(/\s+/).filter(w => w.length > 0);
    const characters = transcription.length;
    const sentences = transcription.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const paragraphs = transcription.split(/\n\n+/).filter(p => p.trim().length > 0).length;
    const avgWordLength = words.length > 0 ? (words.reduce((sum, w) => sum + w.length, 0) / words.length).toFixed(1) : '0';
    const totalDuration = segments && segments.length > 0 
      ? segments[segments.length - 1].end - segments[0].start 
      : 0;
    const wordsPerMinute = totalDuration > 0 ? Math.round(words.length / (totalDuration / 60)) : 0;
    
    // Find most common words (excluding short words)
    const wordFreq: Record<string, number> = {};
    words.forEach(w => {
      const word = w.toLowerCase().replace(/[^a-z]/g, '');
      if (word.length > 3) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });
    const topWords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return { words: words.length, characters, sentences, paragraphs, avgWordLength, totalDuration, wordsPerMinute, topWords };
  }, [transcription, segments]);

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-purple-600" />
          <h3 className="text-sm font-medium">Statistics</h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded bg-gray-100 p-2 dark:bg-gray-800">
            <div className="text-lg font-bold text-blue-600">{stats.words.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Words</div>
          </div>
          <div className="rounded bg-gray-100 p-2 dark:bg-gray-800">
            <div className="text-lg font-bold text-green-600">{stats.characters.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Characters</div>
          </div>
          <div className="rounded bg-gray-100 p-2 dark:bg-gray-800">
            <div className="text-lg font-bold text-purple-600">{stats.sentences}</div>
            <div className="text-xs text-gray-500">Sentences</div>
          </div>
          <div className="rounded bg-gray-100 p-2 dark:bg-gray-800">
            <div className="text-lg font-bold text-orange-600">{stats.wordsPerMinute}</div>
            <div className="text-xs text-gray-500">Words/min</div>
          </div>
        </div>
        {stats.topWords.length > 0 && (
          <div className="border-t pt-2">
            <div className="text-xs text-gray-500 mb-1">Top Words</div>
            <div className="flex flex-wrap gap-1">
              {stats.topWords.map(([word, count]) => (
                <span key={word} className="rounded bg-blue-100 px-2 py-0.5 text-xs dark:bg-blue-900">
                  {word} ({count})
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ExportControls: React.FC<ExportControlsProps> = ({
  transcription,
  segments,
  intelligence,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<"txt" | "docx" | "srt" | "vtt" | "json" | "csv" | "md">(
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
        const speakerPrefix = segment.speaker ? `[Speaker ${segment.speaker}] ` : "";
        return `${segment.id + 1}\n${startTime} --> ${endTime}\n${speakerPrefix}${segment.text.trim()}\n`;
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
        const speakerPrefix = segment.speaker ? `[Speaker ${segment.speaker}] ` : "";
        return `${startTime} --> ${endTime}\n${speakerPrefix}${segment.text.trim()}\n`;
      })
      .join("\n");
    return vtt;
  };

  // Generate JSON export
  const generateJSON = (): string => {
    return JSON.stringify({
      exportedAt: new Date().toISOString(),
      transcription,
      segments: segments || [],
      intelligence: intelligence || undefined,
      metadata: {
        wordCount: transcription.split(/\s+/).length,
        characterCount: transcription.length,
        segmentCount: segments?.length || 0,
      }
    }, null, 2);
  };

  // Generate CSV export (Phase 5)
  const generateCSV = (): string => {
    if (!segments || segments.length === 0) {
      return "id,start,end,text\n1,0,0,\"" + transcription.replace(/"/g, '""') + "\"";
    }
    const header = "id,start,end,duration,text";
    const rows = segments.map(seg => 
      `${seg.id},${seg.start.toFixed(3)},${seg.end.toFixed(3)},${(seg.end - seg.start).toFixed(3)},"${seg.text.replace(/"/g, '""')}"`
    );
    return [header, ...rows].join("\n");
  };

  // Generate Markdown export with timestamps
  const generateMarkdown = (): string => {
    let md = "# Transcription\n\n";
    md += `*Exported: ${new Date().toLocaleString()}*\n\n`;
    md += "---\n\n";

    // Include summary if available
    if (intelligence?.summary) {
      md += "## Summary\n\n";
      md += `${intelligence.summary}\n\n`;
      md += "---\n\n";
    }

    // Include chapters if available
    if (intelligence?.chapters && intelligence.chapters.length > 0) {
      md += "## Chapters\n\n";
      intelligence.chapters.forEach(ch => {
        md += `### ${ch.headline}\n\n`;
        md += `*${formatDuration(ch.start)} - ${formatDuration(ch.end)}*\n\n`;
        md += `${ch.summary}\n\n`;
      });
      md += "---\n\n";
    }

    if (segments && segments.length > 0) {
      md += "## Transcript\n\n";
      segments.forEach(seg => {
        const speakerPrefix = seg.speaker ? `**Speaker ${seg.speaker}:** ` : "";
        md += `**[${formatDuration(seg.start)} - ${formatDuration(seg.end)}]** ${speakerPrefix}\n\n`;
        md += `${seg.text.trim()}\n\n`;
      });
    } else {
      md += "## Full Transcript\n\n";
      md += transcription;
    }

    md += "\n---\n\n";
    md += `*Word count: ${transcription.split(/\s+/).length}*\n`;
    return md;
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
        const docChildren: Paragraph[] = [
          new Paragraph({
            text: "Transcription",
            heading: HeadingLevel.TITLE,
          }),
          new Paragraph({ children: [new TextRun("")] }),
        ];

        // Add summary if available
        if (intelligence?.summary) {
          docChildren.push(
            new Paragraph({ text: "Summary", heading: HeadingLevel.HEADING_1 }),
            new Paragraph({ children: [new TextRun("")] }),
            ...intelligence.summary.split("\n").filter(Boolean).map(
              (line: string) => new Paragraph({ children: [new TextRun(line.replace(/^[\-\*\u2022]\s*/, ""))] }),
            ),
            new Paragraph({ children: [new TextRun("")] }),
          );
        }

        docChildren.push(
          new Paragraph({ text: "Transcript", heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ children: [new TextRun("")] }),
          ...transcription.split("\n").map(
            (line: string) =>
              new Paragraph({
                children: [new TextRun(line)],
              }),
          ),
        );

        const doc = new Document({
          sections: [{ children: docChildren }],
        });
        const buffer = await Packer.toBuffer(doc);
        blob = new Blob([new Uint8Array(buffer)], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
      } else if (selectedFormat === "json") {
        blob = new Blob([generateJSON()], { type: "application/json" });
      } else if (selectedFormat === "csv") {
        blob = new Blob([generateCSV()], { type: "text/csv" });
      } else if (selectedFormat === "md") {
        blob = new Blob([generateMarkdown()], { type: "text/markdown" });
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
          <div className="grid grid-cols-4 gap-1">
            {(["txt", "docx", "srt", "vtt", "json", "csv", "md"] as const).map((format) => (
              <Button
                key={format}
                variant={selectedFormat === format ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFormat(format)}
                className="px-2 text-xs"
              >
                {format.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>

        {/* Format Info */}
        <div className="rounded-md bg-blue-50 p-2 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
          {selectedFormat === "srt" && "SRT - Subtitle format with timestamps"}
          {selectedFormat === "vtt" && "WebVTT - Web subtitle format"}
          {selectedFormat === "txt" && "Plain text transcription"}
          {selectedFormat === "docx" && "Microsoft Word document"}
          {selectedFormat === "json" && "JSON with full metadata & segments"}
          {selectedFormat === "csv" && "CSV spreadsheet with timestamps"}
          {selectedFormat === "md" && "Markdown with formatted timestamps"}
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
  const activeSegmentRef = useRef<HTMLDivElement>(null);
  const prevSegmentIndexRef = useRef<number | null>(null);

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
      const results: number[] = [];
      segments.forEach((segment, index) => {
        if (segment.text.toLowerCase().includes(term.toLowerCase())) {
          results.push(index);
        }
      });
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  // Determine if a segment is currently playing
  const currentSegmentIndex = segments
    ? segments.findIndex((seg) => currentTime >= seg.start && currentTime < seg.end)
    : -1;

  // Auto-scroll to active segment when it changes
  useEffect(() => {
    if (currentSegmentIndex >= 0 && currentSegmentIndex !== prevSegmentIndexRef.current) {
      prevSegmentIndexRef.current = currentSegmentIndex;
      activeSegmentRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentSegmentIndex]);

  // Render word-level karaoke for active segment
  const renderKaraokeWords = (words: TranscriptionWord[]) => {
    const activeWordIdx = findActiveWordIndex(words, currentTime);

    return words.map((word, idx) => {
      const isActive = idx === activeWordIdx;
      const isPast = currentTime >= word.end;

      return (
        <span
          key={idx}
          className={cn(
            "transition-colors duration-100",
            isActive && "rounded bg-blue-200 px-0.5 font-bold text-blue-900 dark:bg-blue-700 dark:text-blue-100",
            isPast && !isActive && "text-gray-400 dark:text-gray-500",
          )}
        >
          {word.word}{" "}
        </span>
      );
    });
  };

  return (
    <div className="space-y-4">
      {/* Search Bar + Copy */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Input
            ref={searchInputRef}
            placeholder="Search transcript... (Ctrl+F)"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyTranscript}
          disabled={copySuccess}
          className="flex-shrink-0"
        >
          {copySuccess ? (
            <><Copy className="h-4 w-4 text-green-500" /><span className="ml-1">Copied!</span></>
          ) : (
            <><Copy className="h-4 w-4" /><span className="ml-1">Copy All</span></>
          )}
        </Button>
      </div>

      {searchResults.length > 0 && (
        <p className="text-xs text-gray-500">
          Found {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Segments View */}
      {segments && segments.length > 0 ? (
        <div className="max-h-[60vh] overflow-y-auto">
          <div className="space-y-2 pr-2">
            {segments.map((segment, index) => {
              const isHighlighted = searchResults.includes(index);
              const isCurrentSegment = currentSegmentIndex === index;
              const speakerColor = segment.speaker ? getSpeakerColor(segment.speaker) : null;

              return (
                <div
                  key={segment.id}
                  ref={isCurrentSegment ? activeSegmentRef : undefined}
                  onClick={() => onSegmentClick?.(segment.start)}
                  className={cn(
                    "cursor-pointer rounded-lg border p-3 transition-all duration-200 hover:shadow-md",
                    speakerColor && `border-l-4 ${speakerColor.border}`,
                    isCurrentSegment
                      ? "border-blue-400 bg-blue-50 shadow-md dark:border-blue-600 dark:bg-blue-900/20"
                      : isHighlighted
                        ? "border-yellow-200 bg-yellow-50 dark:border-yellow-600 dark:bg-yellow-900/20"
                        : "border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-750",
                  )}
                  title="Click to play audio from this segment"
                >
                  {/* Timestamp + Speaker Badge */}
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded bg-gray-200 px-2 py-1 font-mono text-xs dark:bg-gray-700">
                      {formatDuration(segment.start)} - {formatDuration(segment.end)}
                    </span>
                    {segment.speaker && speakerColor && (
                      <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", speakerColor.badge)}>
                        Speaker {segment.speaker}
                      </span>
                    )}
                    {isCurrentSegment && (
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Now Playing
                      </span>
                    )}
                  </div>

                  {/* Transcript Text — karaoke for active segment */}
                  <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    {isCurrentSegment && segment.words && segment.words.length > 0
                      ? renderKaraokeWords(segment.words as TranscriptionWord[])
                      : searchTerm && isHighlighted
                        ? segment.text
                            .split(new RegExp(`(${searchTerm})`, "gi"))
                            .map((part, partIndex) =>
                              part.toLowerCase() === searchTerm.toLowerCase() ? (
                                <mark key={partIndex} className="rounded bg-yellow-200 px-1">{part}</mark>
                              ) : (
                                part
                              ),
                            )
                        : segment.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        // Fallback: full transcript
        <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="max-h-96 overflow-y-auto p-6">
            <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-gray-800 dark:text-gray-200">
              {transcription || "No transcript available"}
            </div>
          </div>
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
  intelligence,
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

  // Handle seeking to a specific time
  const handleSeek = useCallback((startTime: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = startTime;
      audioRef.current.play().catch((error) => {
        console.error("Audio playback failed:", error);
        toast.error("Failed to play audio");
      });
    }
  }, []);

  // Update current time for segment highlighting (throttled via requestAnimationFrame)
  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  // Build available intelligence tabs
  const intelligenceTabs = React.useMemo(() => {
    if (!intelligence) return [];
    const tabs: { value: string; label: string }[] = [];
    if (intelligence.chapters && intelligence.chapters.length > 0) tabs.push({ value: "chapters", label: "Chapters" });
    if (intelligence.summary) tabs.push({ value: "summary", label: "Summary" });
    if (intelligence.sentimentAnalysis && intelligence.sentimentAnalysis.length > 0) tabs.push({ value: "sentiment", label: "Sentiment" });
    if (intelligence.entities && intelligence.entities.length > 0) tabs.push({ value: "entities", label: "Entities" });
    if (intelligence.keyPhrases && intelligence.keyPhrases.length > 0) tabs.push({ value: "phrases", label: "Key Phrases" });
    return tabs;
  }, [intelligence]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputField = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

      if (e.key === "Escape") {
        if (searchInputRef.current) {
          searchInputRef.current.blur();
          searchInputRef.current.value = "";
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "c" && !isInputField) {
        e.preventDefault();
        navigator.clipboard.writeText(transcription).then(() => {
          toast.success("Transcript copied to clipboard!");
        }).catch(() => {
          toast.error("Failed to copy transcript");
        });
        return;
      }

      if (isInputField) return;

      const audio = audioRef.current;
      if (!audio) return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          if (audio.paused) {
            audio.play().catch(console.error);
          } else {
            audio.pause();
          }
          break;

        case "ArrowLeft":
          e.preventDefault();
          audio.currentTime = Math.max(0, audio.currentTime - (e.shiftKey ? 30 : 5));
          break;

        case "ArrowRight":
          e.preventDefault();
          audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + (e.shiftKey ? 30 : 5));
          break;

        case "ArrowUp": {
          e.preventDefault();
          const newVolUp = Math.min(1, audio.volume + 0.1);
          audio.volume = newVolUp;
          setVolume(newVolUp);
          toast.success(`Volume: ${Math.round(newVolUp * 100)}%`);
          break;
        }

        case "ArrowDown": {
          e.preventDefault();
          const newVolDown = Math.max(0, audio.volume - 0.1);
          audio.volume = newVolDown;
          setVolume(newVolDown);
          toast.success(`Volume: ${Math.round(newVolDown * 100)}%`);
          break;
        }

        case "m":
        case "M":
          e.preventDefault();
          audio.muted = !audio.muted;
          setIsMuted(audio.muted);
          toast.success(audio.muted ? "Muted" : "Unmuted");
          break;

        case "1": case "2": case "3": case "4": case "5":
        case "6": case "7": case "8": case "9": {
          e.preventDefault();
          const percentage = parseInt(e.key) * 10;
          if (audio.duration) {
            audio.currentTime = (audio.duration * percentage) / 100;
            toast.success(`Jumped to ${percentage}%`);
          }
          break;
        }

        case "0":
          e.preventDefault();
          audio.currentTime = 0;
          break;

        case "?":
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

          {/* Audio Player - Shows first on mobile */}
          <div className="order-1 lg:order-2 lg:col-span-1 lg:row-span-1">
            <div className="space-y-4 lg:max-h-full lg:overflow-y-auto">
              <AudioPlayer
                audioUrl={audioUrl}
                audioRef={audioRef}
                onTimeUpdate={handleTimeUpdate}
                segments={segments}
              />

              <TranscriptStatistics transcription={transcription} segments={segments} />

              <div className="hidden lg:block">
                <FileDetails audioSource={audioSource} />
              </div>

              <ExportControls transcription={transcription} segments={segments} intelligence={intelligence} />

              <ActionButtons transcription={transcription} segments={segments} />
            </div>
          </div>

          {/* Transcript + Intelligence Panel */}
          <div className="order-2 flex min-h-[400px] flex-col lg:order-1 lg:col-span-2">
            <Card className="flex flex-1 flex-col">
              <CardContent className="flex-1 overflow-hidden p-4 lg:p-6">
                {intelligenceTabs.length > 0 ? (
                  <Tabs defaultValue="transcript" className="flex h-full flex-col">
                    <TabsList className="mb-4 flex-shrink-0 flex-wrap">
                      <TabsTrigger value="transcript">Transcript</TabsTrigger>
                      {intelligenceTabs.map((tab) => (
                        <TabsTrigger key={tab.value} value={tab.value}>
                          {tab.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    <TabsContent value="transcript" className="flex-1 overflow-hidden">
                      <EnhancedTranscript
                        transcription={transcription}
                        segments={segments}
                        onSegmentClick={handleSeek}
                        currentTime={currentTime}
                        searchInputRef={searchInputRef}
                      />
                    </TabsContent>

                    {intelligence?.chapters && intelligence.chapters.length > 0 && (
                      <TabsContent value="chapters" className="flex-1 overflow-auto">
                        <ChaptersPanel
                          chapters={intelligence.chapters}
                          currentTime={currentTime}
                          onSeek={handleSeek}
                        />
                      </TabsContent>
                    )}

                    {intelligence?.summary && (
                      <TabsContent value="summary" className="flex-1 overflow-auto">
                        <SummaryPanel summary={intelligence.summary} />
                      </TabsContent>
                    )}

                    {intelligence?.sentimentAnalysis && intelligence.sentimentAnalysis.length > 0 && (
                      <TabsContent value="sentiment" className="flex-1 overflow-auto">
                        <SentimentPanel
                          sentimentResults={intelligence.sentimentAnalysis}
                          currentTime={currentTime}
                          onSeek={handleSeek}
                        />
                      </TabsContent>
                    )}

                    {intelligence?.entities && intelligence.entities.length > 0 && (
                      <TabsContent value="entities" className="flex-1 overflow-auto">
                        <EntitiesPanel
                          entities={intelligence.entities}
                          onSeek={handleSeek}
                        />
                      </TabsContent>
                    )}

                    {intelligence?.keyPhrases && intelligence.keyPhrases.length > 0 && (
                      <TabsContent value="phrases" className="flex-1 overflow-auto">
                        <KeyPhrasesPanel
                          keyPhrases={intelligence.keyPhrases}
                          onSeek={handleSeek}
                        />
                      </TabsContent>
                    )}
                  </Tabs>
                ) : (
                  <EnhancedTranscript
                    transcription={transcription}
                    segments={segments}
                    onSegmentClick={handleSeek}
                    currentTime={currentTime}
                    searchInputRef={searchInputRef}
                  />
                )}
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
