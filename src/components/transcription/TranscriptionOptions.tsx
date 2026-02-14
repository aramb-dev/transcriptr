import { useState, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog"
import { Button } from "../ui/button"
import { Switch } from "../ui/switch"
import { Label } from "../ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"

const LANGUAGES = [
  { value: "auto", label: "Auto Detect" },
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "nl", label: "Dutch" },
  { value: "ja", label: "Japanese" },
  { value: "zh", label: "Chinese" },
  { value: "ar", label: "Arabic" },
  { value: "hi", label: "Hindi" },
  { value: "ru", label: "Russian" },
  { value: "ko", label: "Korean" },
  { value: "tr", label: "Turkish" },
  { value: "pl", label: "Polish" },
  { value: "uk", label: "Ukrainian" },
  { value: "vi", label: "Vietnamese" },
  { value: "th", label: "Thai" },
  { value: "id", label: "Indonesian" },
  { value: "sv", label: "Swedish" },
  { value: "da", label: "Danish" },
  { value: "fi", label: "Finnish" },
  { value: "no", label: "Norwegian" },
] as const

export interface AIFeatures {
  autoChapters: boolean
  summarization: boolean
  sentimentAnalysis: boolean
  entityDetection: boolean
  keyPhrases: boolean
  contentModeration: boolean
  topicDetection: boolean
}

const DEFAULT_AI_FEATURES: AIFeatures = {
  autoChapters: false,
  summarization: false,
  sentimentAnalysis: false,
  entityDetection: false,
  keyPhrases: false,
  contentModeration: false,
  topicDetection: false,
}

const AI_FEATURE_LIST: {
  key: keyof AIFeatures
  label: string
  description: string
}[] = [
  { key: "autoChapters", label: "Auto Chapters", description: "Break transcript into time-stamped chapters with summaries (excludes Summarization)" },
  { key: "summarization", label: "Summarization", description: "Generate a bullet-point summary of the audio (excludes Auto Chapters)" },
  { key: "sentimentAnalysis", label: "Sentiment Analysis", description: "Detect positive/negative/neutral sentiment per sentence" },
  { key: "entityDetection", label: "Entity Detection", description: "Identify people, locations, organizations mentioned" },
  { key: "keyPhrases", label: "Key Phrases", description: "Extract important phrases and keywords" },
  { key: "contentModeration", label: "Content Moderation", description: "Flag potentially unsafe content" },
  { key: "topicDetection", label: "Topic Detection", description: "Classify content by IAB taxonomy topics" },
]

export interface TranscriptionOptionsProps {
  onChange: (options: { language: string; diarize: boolean; aiFeatures: AIFeatures }) => void
}

export function TranscriptionOptions({ onChange }: TranscriptionOptionsProps) {
  const [language, setLanguage] = useState<string>("auto")
  const [diarize, setDiarize] = useState<boolean>(false)
  const [aiFeatures, setAiFeatures] = useState<AIFeatures>(DEFAULT_AI_FEATURES)
  const [showDonateModal, setShowDonateModal] = useState(false)
  const hasShownModal = useRef(false)

  // summarization is excluded from "all" since it's mutually exclusive with autoChapters
  const allEnabled = AI_FEATURE_LIST
    .filter((f) => f.key !== "summarization")
    .every((f) => aiFeatures[f.key])
  const anyEnabled = diarize || AI_FEATURE_LIST.some((f) => aiFeatures[f.key])

  const maybeShowModal = () => {
    if (!hasShownModal.current) {
      hasShownModal.current = true
      setShowDonateModal(true)
    }
  }

  const emitChange = (lang: string, dia: boolean, features: AIFeatures) => {
    onChange({ language: lang, diarize: dia, aiFeatures: features })
  }

  const handleLanguageChange = (value: string) => {
    setLanguage(value)
    emitChange(value, diarize, aiFeatures)
  }

  const handleDiarizeChange = (checked: boolean) => {
    setDiarize(checked)
    if (checked) maybeShowModal()
    emitChange(language, checked, aiFeatures)
  }

  const handleFeatureToggle = (key: keyof AIFeatures) => {
    const updated = { ...aiFeatures, [key]: !aiFeatures[key] }
    // autoChapters and summarization are mutually exclusive in AssemblyAI
    if (key === "autoChapters" && updated.autoChapters) {
      updated.summarization = false
    } else if (key === "summarization" && updated.summarization) {
      updated.autoChapters = false
    }
    if (updated[key]) maybeShowModal()
    setAiFeatures(updated)
    emitChange(language, diarize, updated)
  }

  const handleToggleAll = (checked: boolean) => {
    if (checked) maybeShowModal()
    const updated: AIFeatures = {
      autoChapters: checked,
      summarization: false, // mutually exclusive with autoChapters
      sentimentAnalysis: checked,
      entityDetection: checked,
      keyPhrases: checked,
      contentModeration: checked,
      topicDetection: checked,
    }
    setAiFeatures(updated)
    emitChange(language, diarize, updated)
  }

  return (
    <div className="space-y-5 rounded-lg border border-gray-100 bg-gray-50 px-4 py-6 dark:border-gray-700/50 dark:bg-gray-800/40">
      <h3 className="flex items-center gap-2 text-base font-medium text-gray-900 dark:text-gray-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
        >
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
        Transcription Options
      </h3>

      {/* Language */}
      <div className="space-y-2">
        <Label htmlFor="language">Language</Label>
        <Select value={language} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Select the language of the audio for better accuracy
        </p>
      </div>

      {/* Speaker Diarization */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <Label htmlFor="diarize">Speaker Diarization</Label>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Identify different speakers. Best for interviews and meetings.
          </p>
        </div>
        <Switch
          id="diarize"
          checked={diarize}
          onCheckedChange={handleDiarizeChange}
        />
      </div>

      {/* AI Analysis Features */}
      <div className="space-y-3 border-t border-gray-200 pt-4 dark:border-gray-700">
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            AI Analysis Features
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            These features use additional processing resources
          </p>
        </div>

        {/* Enable All */}
        <div className="flex items-center justify-between rounded-md bg-gray-100 px-3 py-2.5 dark:bg-gray-700/50">
          <Label htmlFor="enable-all-ai" className="cursor-pointer">
            Enable All
          </Label>
          <Switch
            id="enable-all-ai"
            checked={allEnabled}
            onCheckedChange={handleToggleAll}
          />
        </div>

        {/* Individual toggles */}
        <div className="space-y-1">
          {AI_FEATURE_LIST.map((feature) => (
            <div
              key={feature.key}
              className="flex items-center justify-between rounded-md px-1 py-2"
            >
              <div className="mr-4 space-y-0.5">
                <Label
                  htmlFor={`ai-${feature.key}`}
                  className="cursor-pointer text-sm font-normal text-gray-700 dark:text-gray-300"
                >
                  {feature.label}
                </Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
              <Switch
                id={`ai-${feature.key}`}
                checked={aiFeatures[feature.key]}
                onCheckedChange={() => handleFeatureToggle(feature.key)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Inline nudge */}
      {anyEnabled && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 dark:border-amber-800/50 dark:bg-amber-900/20">
          <p className="text-xs text-amber-800 dark:text-amber-300">
            These features cost us extra to run. If you find them useful, please
            consider{" "}
            <a
              href="https://donate.stripe.com/3cIeVe2e5dHxeEh7BKfUQ0h"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline hover:no-underline"
            >
              supporting the project
            </a>{" "}
            so we can keep them free for everyone.
          </p>
        </div>
      )}

      {/* Donation modal — shown once per session on first premium toggle */}
      <Dialog open={showDonateModal} onOpenChange={setShowDonateModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>These features cost us extra</DialogTitle>
            <DialogDescription>
              Speaker diarization and AI analysis features use additional
              processing resources that we pay for on every transcription. They
              are free for you to use, but if you find them helpful, a small
              donation helps us keep them available for everyone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setShowDonateModal(false)}
            >
              Got it
            </Button>
            <Button
              asChild
              className="bg-amber-500 text-white hover:bg-amber-600"
            >
              <a
                href="https://donate.stripe.com/3cIeVe2e5dHxeEh7BKfUQ0h"
                target="_blank"
                rel="noopener noreferrer"
              >
                Support the project
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
