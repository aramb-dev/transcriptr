"use client"

import React from "react"
import type { KeyPhrase } from "@/types/transcription"

interface KeyPhrasesPanelProps {
  keyPhrases: KeyPhrase[]
  onSeek: (time: number) => void
}

export const KeyPhrasesPanel: React.FC<KeyPhrasesPanelProps> = ({
  keyPhrases,
  onSeek,
}) => {
  // Already sorted by rank from the API, but ensure it
  const sorted = [...keyPhrases].sort((a, b) => b.rank - a.rank)
  const maxRank = sorted.length > 0 ? sorted[0].rank : 1

  return (
    <div className="space-y-2">
      {sorted.map((phrase, index) => {
        const barWidth = maxRank > 0 ? (phrase.rank / maxRank) * 100 : 0

        return (
          <button
            key={index}
            onClick={() => {
              if (phrase.timestamps.length > 0) {
                onSeek(phrase.timestamps[0].start)
              }
            }}
            className="w-full rounded-lg border border-gray-200 bg-white p-3 text-left transition-all hover:shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {phrase.text}
              </span>
              <span className="text-xs text-gray-500">
                {phrase.count}x
              </span>
            </div>
            {/* Relevance bar */}
            <div className="h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{ width: `${barWidth}%` }}
              />
            </div>
          </button>
        )
      })}
    </div>
  )
}
