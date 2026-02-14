"use client"

import React, { useMemo } from "react"
import type { Entity } from "@/types/transcription"

interface EntitiesPanelProps {
  entities: Entity[]
  onSeek: (time: number) => void
}

const ENTITY_TYPE_COLORS: Record<string, string> = {
  person_name: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  location: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  organization: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  date: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  event: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  nationality: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
  occupation: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  money_amount: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  phone_number: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
  email_address: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
}

const DEFAULT_COLOR = "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"

const formatEntityType = (type: string): string => {
  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export const EntitiesPanel: React.FC<EntitiesPanelProps> = ({
  entities,
  onSeek,
}) => {
  // Group entities by type, deduplicating text values
  const grouped = useMemo(() => {
    const groups: Record<string, { text: string, start: number }[]> = {}
    const seen: Record<string, Set<string>> = {}

    entities.forEach((entity) => {
      if (!groups[entity.entityType]) {
        groups[entity.entityType] = []
        seen[entity.entityType] = new Set()
      }
      if (!seen[entity.entityType].has(entity.text)) {
        seen[entity.entityType].add(entity.text)
        groups[entity.entityType].push({ text: entity.text, start: entity.start })
      }
    })

    return Object.entries(groups).sort((a, b) => b[1].length - a[1].length)
  }, [entities])

  return (
    <div className="space-y-4">
      {grouped.map(([type, items]) => {
        const colorClass = ENTITY_TYPE_COLORS[type] || DEFAULT_COLOR

        return (
          <div key={type}>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {formatEntityType(type)} ({items.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {items.map((item, index) => (
                <button
                  key={index}
                  onClick={() => onSeek(item.start)}
                  className={`rounded-full px-3 py-1 text-sm font-medium transition-all hover:shadow-md ${colorClass}`}
                >
                  {item.text}
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
