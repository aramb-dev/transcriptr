import Link from "next/link";
import { MobileFooter } from "./MobileFooter";

interface FooterProps {
  onOpenFeedbackModal: (type: "general" | "issue" | "feature") => void;
  onOpenChangelog: () => void;
}

export function Footer({ onOpenFeedbackModal, onOpenChangelog }: FooterProps) {
  return (
    <>
      {/* Mobile Footer */}
      <MobileFooter
        onOpenFeedbackModal={onOpenFeedbackModal}
        onOpenChangelog={onOpenChangelog}
      />

      {/* Desktop Footer */}
      <footer className="mt-12 hidden border-t border-gray-200 pt-8 text-center text-sm text-gray-500 md:block dark:border-gray-700 dark:text-gray-400">
        <div className="flex flex-col items-center justify-center space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
          <a
            href="#feedback"
            onClick={(e) => {
              e.preventDefault();
              onOpenFeedbackModal("general");
            }}
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Provide Feedback
          </a>
          <span>•</span>
          <a
            href="#issue"
            onClick={(e) => {
              e.preventDefault();
              onOpenFeedbackModal("issue");
            }}
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Report an Issue
          </a>
          <span>•</span>
          <a
            href="#feature"
            onClick={(e) => {
              e.preventDefault();
              onOpenFeedbackModal("feature");
            }}
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Suggest a Feature
          </a>
          <span>•</span>
          <a
            href="#changelog"
            onClick={(e) => {
              e.preventDefault();
              onOpenChangelog();
            }}
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Changelog
          </a>
          <span>•</span>
          <a
            href="https://github.com/aramb-dev/transcriptr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Star on GitHub
          </a>
          <span>•</span>
          <Link
            href="/terms"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Terms of Service
          </Link>
          <span>•</span>
          <Link
            href="/privacy"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Privacy Policy
          </Link>
          <span>•</span>
          <Link
            href="/documentation"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Documentation
          </Link>
          <span>•</span>
          <a
            href="https://donate.stripe.com/3cIeVe2e5dHxeEh7BKfUQ0h"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-600 hover:underline dark:text-amber-400"
          >
            Donate
          </a>
        </div>

        {/* Peerlist Project Embed */}
        <div className="mt-6 flex justify-center">
          <a
            href="https://peerlist.io/arambdev/project/transcriptr--ai-audio-transcription"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-opacity hover:opacity-80"
          >
            <img
              src="https://peerlist.io/api/v1/projects/embed/PRJHDNDKB9EAMOEDB2LJQBODEP9PRE?showUpvote=true&theme=light"
              alt="Transcriptr | AI Audio Transcription"
              style={{ width: 'auto', height: '72px' }}
              className="rounded-lg shadow-sm"
            />
          </a>
        </div>

        <p className="mt-4">
          © {new Date().getFullYear()} Transcriptr. All rights reserved.
        </p>
      </footer>
    </>
  );
}
