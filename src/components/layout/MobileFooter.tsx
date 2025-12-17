"use client";

import Link from "next/link";

interface MobileFooterProps {
  onOpenFeedbackModal: (type: "general" | "issue" | "feature") => void;
  onOpenChangelog: () => void;
}

export function MobileFooter({
  onOpenFeedbackModal,
  onOpenChangelog,
}: MobileFooterProps) {
  return (
    <footer className="mt-8 border-t border-gray-200 pt-6 text-center text-sm text-gray-500 md:hidden dark:border-gray-700 dark:text-gray-400">
      {/* Mobile Footer - Stacked Layout */}
      <div className="space-y-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 px-4">
          <button
            onClick={() => onOpenFeedbackModal("general")}
            className="rounded-lg bg-blue-50 px-4 py-3 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100 active:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
          >
            💬 Feedback
          </button>
          <button
            onClick={() => onOpenFeedbackModal("issue")}
            className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 active:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
          >
            🐛 Report Bug
          </button>
        </div>

        {/* Additional Links */}
        <div className="flex flex-wrap justify-center gap-4 px-4">
          <button
            onClick={() => onOpenFeedbackModal("feature")}
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            💡 Suggest Feature
          </button>
          <button
            onClick={onOpenChangelog}
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            📝 Changelog
          </button>
        </div>

        {/* External Links */}
        <div className="flex flex-wrap justify-center gap-4 px-4">
          <a
            href="https://github.com/aramb-dev/transcriptr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            ⭐ Star on GitHub
          </a>
          <Link
            href="/documentation"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            📚 Docs
          </Link>
        </div>

        {/* Legal Links */}
        <div className="flex flex-wrap justify-center gap-4 px-4">
          <Link
            href="/terms"
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            Terms
          </Link>
          <Link
            href="/privacy"
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            Privacy
          </Link>
        </div>

        {/* Peerlist Project Embed */}
        <div className="flex justify-center px-4">
          <a
            href="https://peerlist.io/arambdev/project/transcriptr--ai-audio-transcription"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-opacity hover:opacity-80"
          >
            <img
              src="https://peerlist.io/api/v1/projects/embed/PRJHDNDKB9EAMOEDB2LJQBODEP9PRE?showUpvote=true&theme=light"
              alt="Transcriptr | AI Audio Transcription"
              style={{ width: 'auto', height: '64px' }}
              className="rounded-lg shadow-sm"
            />
          </a>
        </div>

        {/* Copyright */}
        <div className="px-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Transcriptr. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
