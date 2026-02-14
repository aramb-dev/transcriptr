"use client"

import React from "react"
import type { Chapter } from "@/types/transcription"
import { cn } from "@/lib/utils"

interface ChaptersPanelProps {
  chapters: Chapter[]
  currentTime: number
  onSeek: (time: number) => void
}

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export const ChaptersPanel: React.FC<ChaptersPanelProps> = ({
  chapters,
  currentTime,
  onSeek,
}) => {
  const activeIndex = chapters.findIndex(
    (ch) => currentTime >= ch.start && currentTime < ch.end,
  )

  return (
    <div className="space-y-3">
      {chapters.map((chapter, index) => {
        const isActive = activeIndex === index

        return (
          <button
            key={index}
            onClick={() => onSeek(chapter.start)}
            className={cn(
              "w-full rounded-lg border p-4 text-left transition-all hover:shadow-md",
              isActive
                ? "border-blue-400 bg-blue-50 shadow-md dark:border-blue-600 dark:bg-blue-900/20"
                : "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-750",
            )}
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {chapter.headline}
              </span>
              {isActive && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Now
                </span>
              )}
            </div>
            <p className="mb-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              {chapter.summary}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono dark:bg-gray-700">
                {formatDuration(chapter.start)} - {formatDuration(chapter.end)}
              </span>
              <span className="text-gray-400">
                {chapter.gist}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
