"use client"

import React, { useMemo } from "react"
import type { SentimentResult } from "@/types/transcription"
import { cn } from "@/lib/utils"

interface SentimentPanelProps {
  sentimentResults: SentimentResult[]
  currentTime: number
  onSeek: (time: number) => void
}

const SENTIMENT_COLORS = {
  POSITIVE: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-800 dark:text-green-300",
    bar: "bg-green-500",
    badge: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
  NEUTRAL: {
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-700 dark:text-gray-300",
    bar: "bg-gray-400",
    badge: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  },
  NEGATIVE: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-800 dark:text-red-300",
    bar: "bg-red-500",
    badge: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  },
}

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export const SentimentPanel: React.FC<SentimentPanelProps> = ({
  sentimentResults,
  currentTime,
  onSeek,
}) => {
  const distribution = useMemo(() => {
    const total = sentimentResults.length
    if (total === 0) return { POSITIVE: 0, NEUTRAL: 0, NEGATIVE: 0 }

    const counts = { POSITIVE: 0, NEUTRAL: 0, NEGATIVE: 0 }
    sentimentResults.forEach((r) => {
      counts[r.sentiment] = (counts[r.sentiment] || 0) + 1
    })

    return {
      POSITIVE: Math.round((counts.POSITIVE / total) * 100),
      NEUTRAL: Math.round((counts.NEUTRAL / total) * 100),
      NEGATIVE: Math.round((counts.NEGATIVE / total) * 100),
    }
  }, [sentimentResults])

  return (
    <div className="space-y-4">
      {/* Distribution Bar */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Sentiment Distribution
        </h3>
        <div className="mb-2 flex h-4 overflow-hidden rounded-full">
          {distribution.POSITIVE > 0 && (
            <div
              className="bg-green-500 transition-all"
              style={{ width: `${distribution.POSITIVE}%` }}
            />
          )}
          {distribution.NEUTRAL > 0 && (
            <div
              className="bg-gray-400 transition-all"
              style={{ width: `${distribution.NEUTRAL}%` }}
            />
          )}
          {distribution.NEGATIVE > 0 && (
            <div
              className="bg-red-500 transition-all"
              style={{ width: `${distribution.NEGATIVE}%` }}
            />
          )}
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-green-600">Positive {distribution.POSITIVE}%</span>
          <span className="text-gray-500">Neutral {distribution.NEUTRAL}%</span>
          <span className="text-red-600">Negative {distribution.NEGATIVE}%</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="max-h-80 space-y-2 overflow-y-auto">
        {sentimentResults.map((result, index) => {
          const colors = SENTIMENT_COLORS[result.sentiment] || SENTIMENT_COLORS.NEUTRAL
          const isActive = currentTime >= result.start && currentTime < result.end

          return (
            <button
              key={index}
              onClick={() => onSeek(result.start)}
              className={cn(
                "w-full rounded-lg border p-3 text-left transition-all hover:shadow-sm",
                isActive
                  ? "border-blue-400 shadow-md dark:border-blue-600"
                  : "border-gray-100 dark:border-gray-700",
              )}
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="font-mono text-xs text-gray-500">
                  {formatDuration(result.start)}
                </span>
                <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", colors.badge)}>
                  {result.sentiment}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {result.text}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
