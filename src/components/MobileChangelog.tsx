import React, { useState } from "react";
import Link from "next/link";
import { marked } from "marked";
import { Button } from "./ui/button";
import { X, ChevronDown, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { changelogItems } from "../data/changelog";

interface MobileChangelogProps {
  isModal?: boolean;
  onClose?: () => void;
}

export function MobileChangelog({
  isModal = false,
  onClose,
}: MobileChangelogProps) {
  const [expandedVersions, setExpandedVersions] = useState<string[]>([]);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleVersion = (version: string) => {
    setExpandedVersions((prev) =>
      prev.includes(version)
        ? prev.filter((v) => v !== version)
        : [...prev, version],
    );
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((s) => s !== sectionId)
        : [...prev, sectionId],
    );
  };

  const parseMarkdown = (markdown: string) => {
    const rawMarkup = marked(markdown, { breaks: true, gfm: true });
    return { __html: rawMarkup as string };
  };

  const content = (
    <div
      className={`mobile-changelog bg-white dark:bg-gray-900 ${isModal ? "rounded-lg shadow-xl" : "min-h-screen"} overflow-hidden`}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-4 dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              What's New
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Latest updates and improvements
            </p>
          </div>
          {isModal && onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-10 w-10 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6 px-4 py-6">
        {changelogItems.map((item) => (
          <div
            key={item.version}
            className="overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-800"
          >
            {/* Version Header */}
            <button
              onClick={() => toggleVersion(item.version)}
              className="mobile-changelog-section mobile-tap-target flex w-full items-center justify-between px-4 py-4 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Version {item.version}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {item.date}
                </p>
              </div>
              <motion.div
                animate={{
                  rotate: expandedVersions.includes(item.version) ? 180 : 0,
                }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </motion.div>
            </button>

            {/* Version Content */}
            <AnimatePresence>
              {expandedVersions.includes(item.version) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="space-y-3 px-4 pb-4">
                    {/* New Section */}
                    {item.changes.new && item.changes.new.length > 0 && (
                      <div className="overflow-hidden rounded-lg border-2 border-green-200 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-900/20 dark:text-green-200">
                        <button
                          onClick={() => toggleSection(`${item.version}-new`)}
                          className="mobile-changelog-section mobile-tap-target flex w-full items-center justify-between px-4 py-3 text-left transition-opacity hover:opacity-80"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">🚀</span>
                            <span className="font-medium">New</span>
                            <span className="bg-opacity-50 rounded-full bg-white px-2 py-1 text-xs font-medium">
                              {item.changes.new.length}
                            </span>
                          </div>
                          <motion.div
                            animate={{
                              rotate: expandedSections.includes(
                                `${item.version}-new`,
                              )
                                ? 90
                                : 0,
                            }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </motion.div>
                        </button>

                        <AnimatePresence>
                          {expandedSections.includes(`${item.version}-new`) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: "easeInOut" }}
                              className="bg-opacity-30 dark:bg-opacity-30 overflow-hidden bg-white dark:bg-black"
                            >
                              <div className="space-y-2 px-4 py-3">
                                {item.changes.new.map((change, changeIndex) => (
                                  <motion.div
                                    key={changeIndex}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: changeIndex * 0.05 }}
                                    className="flex items-start gap-3"
                                  >
                                    <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-current opacity-60" />
                                    <div
                                      className="mobile-changelog-item text-sm leading-relaxed"
                                      dangerouslySetInnerHTML={parseMarkdown(
                                        change,
                                      )}
                                    />
                                  </motion.div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* Improved Section */}
                    {item.changes.improved &&
                      item.changes.improved.length > 0 && (
                        <div className="overflow-hidden rounded-lg border-2 border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-200">
                          <button
                            onClick={() =>
                              toggleSection(`${item.version}-improved`)
                            }
                            className="mobile-changelog-section mobile-tap-target flex w-full items-center justify-between px-4 py-3 text-left transition-opacity hover:opacity-80"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-lg">✨</span>
                              <span className="font-medium">Improved</span>
                              <span className="bg-opacity-50 rounded-full bg-white px-2 py-1 text-xs font-medium">
                                {item.changes.improved.length}
                              </span>
                            </div>
                            <motion.div
                              animate={{
                                rotate: expandedSections.includes(
                                  `${item.version}-improved`,
                                )
                                  ? 90
                                  : 0,
                              }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </motion.div>
                          </button>

                          <AnimatePresence>
                            {expandedSections.includes(
                              `${item.version}-improved`,
                            ) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{
                                  duration: 0.2,
                                  ease: "easeInOut",
                                }}
                                className="bg-opacity-30 dark:bg-opacity-30 overflow-hidden bg-white dark:bg-black"
                              >
                                <div className="space-y-2 px-4 py-3">
                                  {item.changes.improved.map(
                                    (change, changeIndex) => (
                                      <motion.div
                                        key={changeIndex}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                          delay: changeIndex * 0.05,
                                        }}
                                        className="flex items-start gap-3"
                                      >
                                        <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-current opacity-60" />
                                        <div
                                          className="mobile-changelog-item text-sm leading-relaxed"
                                          dangerouslySetInnerHTML={parseMarkdown(
                                            change,
                                          )}
                                        />
                                      </motion.div>
                                    ),
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}

                    {/* Fixed Section */}
                    {item.changes.fixed && item.changes.fixed.length > 0 && (
                      <div className="overflow-hidden rounded-lg border-2 border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-200">
                        <button
                          onClick={() => toggleSection(`${item.version}-fixed`)}
                          className="mobile-changelog-section mobile-tap-target flex w-full items-center justify-between px-4 py-3 text-left transition-opacity hover:opacity-80"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">🐛</span>
                            <span className="font-medium">Fixed</span>
                            <span className="bg-opacity-50 rounded-full bg-white px-2 py-1 text-xs font-medium">
                              {item.changes.fixed.length}
                            </span>
                          </div>
                          <motion.div
                            animate={{
                              rotate: expandedSections.includes(
                                `${item.version}-fixed`,
                              )
                                ? 90
                                : 0,
                            }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </motion.div>
                        </button>

                        <AnimatePresence>
                          {expandedSections.includes(
                            `${item.version}-fixed`,
                          ) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: "easeInOut" }}
                              className="bg-opacity-30 dark:bg-opacity-30 overflow-hidden bg-white dark:bg-black"
                            >
                              <div className="space-y-2 px-4 py-3">
                                {item.changes.fixed.map(
                                  (change, changeIndex) => (
                                    <motion.div
                                      key={changeIndex}
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: changeIndex * 0.05 }}
                                      className="flex items-start gap-3"
                                    >
                                      <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-current opacity-60" />
                                      <div
                                        className="mobile-changelog-item text-sm leading-relaxed"
                                        dangerouslySetInnerHTML={parseMarkdown(
                                          change,
                                        )}
                                      />
                                    </motion.div>
                                  ),
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Footer */}
      {!isModal && (
        <div className="mobile-changelog-safe sticky bottom-0 border-t border-gray-200 bg-white px-4 py-4 dark:border-gray-700 dark:bg-gray-900">
          <Link href="/" className="block">
            <Button variant="outline" size="lg" className="w-full gap-2">
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

  return content;
}
