import React from "react";
import Link from "next/link";
import { marked } from "marked";
import { Button } from "./ui/button";
import { X } from "lucide-react";
import { MobileChangelog } from "./MobileChangelog";
import { changelogItems } from "../data/changelog";

interface ChangelogProps {
  readonly isModal?: boolean;
  readonly onClose?: () => void;
}

export function Changelog({ isModal = false, onClose }: ChangelogProps) {
  // Mobile-first: Use MobileChangelog on small screens
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Use mobile version on small screens
  if (isMobile) {
    return <MobileChangelog isModal={isModal} onClose={onClose} />;
  }

  const parseMarkdown = (markdown: string) => {
    const rawMarkup = marked(markdown, { breaks: true, gfm: true });
    // Important: Ensure the type is compatible with dangerouslySetInnerHTML
    return { __html: rawMarkup as string };
  };

  const content = (
    <div
      className={`bg-white dark:bg-gray-800 ${isModal ? "rounded-lg shadow-xl" : "rounded-xl shadow-lg"} overflow-hidden`}
    >
      <div className="p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Changelog
          </h2>
          {isModal && onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Timeline */}
        <div className="relative space-y-8">
          {changelogItems.map((item, index) => (
            <div key={`${item.version}-${item.date}`} className="relative flex items-start sm:space-x-4">
              {/* Date and Version */}
              <div className="w-24 shrink-0 pr-4 text-right sm:w-32 sm:pr-0 sm:text-left">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {item.date}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  v{item.version}
                </p>
              </div>

              {/* Dot */}
              <div className="absolute top-1 left-0 mt-1 hidden h-2 w-2 rounded-full bg-blue-500 sm:left-[calc(8rem+1rem-4px)] sm:block" />

              {/* Changes */}
              <div className="space-y-4 pl-0 sm:pl-4">
                {item.changes.new && item.changes.new.length > 0 && (
                  <div>
                    <h3 className="text-md mb-2 font-medium text-green-600 dark:text-green-400">
                      New
                    </h3>
                    <ul className="list-disc space-y-1 pl-5 text-gray-700 dark:text-gray-300">
                      {item.changes.new.map((change) => (
                        <li
                          key={`new-${change.slice(0, 50)}`}
                          dangerouslySetInnerHTML={parseMarkdown(change)}
                        />
                      ))}
                    </ul>
                  </div>
                )}

                {item.changes.improved && item.changes.improved.length > 0 && (
                  <div>
                    <h3 className="text-md mb-2 font-medium text-blue-600 dark:text-blue-400">
                      Improved
                    </h3>
                    <ul className="list-disc space-y-1 pl-5 text-gray-700 dark:text-gray-300">
                      {item.changes.improved.map((change) => (
                        <li
                          key={`improved-${change.slice(0, 50)}`}
                          dangerouslySetInnerHTML={parseMarkdown(change)}
                        />
                      ))}
                    </ul>
                  </div>
                )}

                {item.changes.fixed && item.changes.fixed.length > 0 && (
                  <div>
                    <h3 className="text-md mb-2 font-medium text-amber-600 dark:text-amber-400">
                      Fixed
                    </h3>
                    <ul className="list-disc space-y-1 pl-5 text-gray-700 dark:text-gray-300">
                      {item.changes.fixed.map((change) => (
                        <li
                          key={`fixed-${change.slice(0, 50)}`}
                          dangerouslySetInnerHTML={parseMarkdown(change)}
                        />
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {index < changelogItems.length - 1 && (
                <div className="absolute top-10 bottom-0 left-0 hidden w-px bg-gray-200 sm:block dark:bg-gray-700" />
              )}
            </div>
          ))}
        </div>
      </div>

      {!isModal && (
        <div className="flex justify-center border-t border-gray-200 p-4 dark:border-gray-700">
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Transcriptr
            </Button>
          </Link>
        </div>
      )}
    </div>
  );

  if (isModal) {
    return content;
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-sky-50 to-white py-12 text-gray-900 dark:from-gray-900 dark:to-gray-800 dark:text-gray-100">
      <div className="container mx-auto max-w-3xl px-4">{content}</div>
    </div>
  );
}
