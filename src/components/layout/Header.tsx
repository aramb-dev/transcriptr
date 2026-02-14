import { MobileHeader } from "./MobileHeader";

interface HeaderProps {
  onOpenChangelog: () => void;
  onShowHistory?: () => void;
  onOpenFeedbackModal?: (type: "general" | "issue" | "feature") => void;
  onShowV3?: () => void;
}

export function Header({
  onOpenChangelog,
  onShowHistory,
  onOpenFeedbackModal,
  onShowV3,
}: HeaderProps) {
  return (
    <>
      {/* Mobile Header */}
      {onOpenFeedbackModal && (
        <MobileHeader
          onOpenChangelog={onOpenChangelog}
          onShowHistory={onShowHistory}
          onOpenFeedbackModal={onOpenFeedbackModal}
          onShowV3={onShowV3}
        />
      )}

      {/* Desktop Header */}
      <header className="mb-8 hidden text-center md:block">
        <div className="flex items-center justify-between">
          <div className="flex flex-1 justify-start">
            {onShowHistory && (
              <button
                onClick={onShowHistory}
                className="flex items-center text-sm text-blue-600 hover:underline dark:text-blue-400"
                aria-label="View transcription history"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-1 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                History
              </button>
            )}
          </div>

          <div className="flex-1">
            <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
              Transcriptr
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Convert audio to text with AI-powered transcription
            </p>
          </div>

          <div className="flex flex-1 items-center justify-end gap-3">
            {onShowV3 && (
              <button
                onClick={onShowV3}
                className="group relative flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-1 text-sm font-medium text-white shadow-md transition-all hover:shadow-lg hover:scale-105"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
                </span>
                V3.2
              </button>
            )}
            <a
              href="#changelog"
              onClick={(e) => {
                e.preventDefault();
                onOpenChangelog();
              }}
              className="text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              Changelog
            </a>
          </div>
        </div>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Developed by{" "}
          <a
            href="https://aramb.dev"
            className="text-blue-600 hover:underline dark:text-blue-400"
            target="_blank"
            rel="noopener noreferrer"
          >
            Abdur-Rahman Bilal (aramb-dev)
          </a>{" "}
          and AI |{" "}
          <a
            href="https://github.com/aramb-dev/transcriptr"
            className="text-blue-600 hover:underline dark:text-blue-400"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Github
          </a>
        </p>
      </header>
    </>
  );
}
