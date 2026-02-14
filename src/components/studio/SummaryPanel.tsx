"use client"

import React from "react"

interface SummaryPanelProps {
  summary: string
}

export const SummaryPanel: React.FC<SummaryPanelProps> = ({ summary }) => {
  // The summary from AssemblyAI with summary_type "bullets" comes as bullet text
  const lines = summary.split("\n").filter((line) => line.trim())

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          AI Summary
        </h3>
        <ul className="space-y-2">
          {lines.map((line, index) => {
            // Strip leading bullet characters (-, *, etc.)
            const cleaned = line.replace(/^[\s\-\*\u2022]+/, "").trim()
            if (!cleaned) return null

            return (
              <li
                key={index}
                className="flex items-start gap-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300"
              >
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                {cleaned}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
