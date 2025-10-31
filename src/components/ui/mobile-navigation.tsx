"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Clock,
  FileText,
  MessageCircle,
  Bug,
  Lightbulb,
  Github,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { Button } from "./button";

interface MobileNavigationProps {
  onOpenChangelog: () => void;
  onShowHistory?: () => void;
  onOpenFeedbackModal: (type: "general" | "issue" | "feature") => void;
  onShowV3?: () => void;
}

export function MobileNavigation({
  onOpenChangelog,
  onShowHistory,
  onOpenFeedbackModal,
  onShowV3,
}: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const menuVariants = {
    closed: {
      opacity: 0,
      x: "100%",
    },
    open: {
      opacity: 1,
      x: 0,
    },
  };

  const overlayVariants = {
    closed: {
      opacity: 0,
    },
    open: {
      opacity: 1,
    },
  };

  const itemVariants = {
    closed: { opacity: 0, x: 20 },
    open: {
      opacity: 1,
      x: 0,
    },
  };

  const containerVariants = {
    closed: {},
    open: {},
  };

  const handleHistoryClick = () => {
    onShowHistory?.();
    closeMenu();
  };

  const handleV3Click = () => {
    onShowV3?.();
    closeMenu();
  };

  const handleChangelogClick = () => {
    onOpenChangelog();
    closeMenu();
  };

  const handleFeedbackClick = (type: "general" | "issue" | "feature") => {
    onOpenFeedbackModal(type);
    closeMenu();
  };

  return (
    <div className="md:hidden">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleMenu}
        className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        aria-label="Open navigation menu"
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Overlay and Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              variants={overlayVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={closeMenu}
            />

            {/* Slide-out Menu */}
            <motion.div
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed top-0 right-0 z-50 h-full w-80 max-w-[85vw] bg-white shadow-2xl dark:bg-gray-900"
            >
              {/* Menu Header */}
              <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Menu
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeMenu}
                  className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Menu Content */}
              <motion.div
                variants={containerVariants}
                initial="closed"
                animate="open"
                transition={{ staggerChildren: 0.1, delayChildren: 0.1 }}
                className="flex flex-col p-4"
              >
                {/* History Button (if available) */}
                {onShowHistory && (
                  <motion.div variants={itemVariants}>
                    <Button
                      variant="ghost"
                      onClick={handleHistoryClick}
                      className="mb-3 w-full justify-start p-4 text-left text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                    >
                      <Clock className="mr-3 h-5 w-5" />
                      View History
                    </Button>
                  </motion.div>
                )}

                {/* V3 Announcement */}
                {onShowV3 && (
                  <motion.div variants={itemVariants}>
                    <Button
                      variant="ghost"
                      onClick={handleV3Click}
                      className="mb-3 w-full justify-start bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-left font-medium text-white hover:from-blue-600 hover:to-purple-700"
                    >
                      <span className="relative mr-3 flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
                      </span>
                      V3 is Here!
                    </Button>
                  </motion.div>
                )}

                {/* Changelog */}
                <motion.div variants={itemVariants}>
                  <Button
                    variant="ghost"
                    onClick={handleChangelogClick}
                    className="mb-3 w-full justify-start p-4 text-left text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                  >
                    <FileText className="mr-3 h-5 w-5" />
                    Changelog
                  </Button>
                </motion.div>

                {/* Divider */}
                <motion.div variants={itemVariants} className="my-2">
                  <hr className="border-gray-200 dark:border-gray-700" />
                </motion.div>

                {/* Feedback Section */}
                <motion.div variants={itemVariants} className="mb-2">
                  <p className="mb-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Feedback
                  </p>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Button
                    variant="ghost"
                    onClick={() => handleFeedbackClick("general")}
                    className="mb-3 w-full justify-start p-4 text-left text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <MessageCircle className="mr-3 h-5 w-5" />
                    Provide Feedback
                  </Button>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Button
                    variant="ghost"
                    onClick={() => handleFeedbackClick("issue")}
                    className="mb-3 w-full justify-start p-4 text-left text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <Bug className="mr-3 h-5 w-5" />
                    Report an Issue
                  </Button>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Button
                    variant="ghost"
                    onClick={() => handleFeedbackClick("feature")}
                    className="mb-3 w-full justify-start p-4 text-left text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <Lightbulb className="mr-3 h-5 w-5" />
                    Suggest a Feature
                  </Button>
                </motion.div>

                {/* Divider */}
                <motion.div variants={itemVariants} className="my-2">
                  <hr className="border-gray-200 dark:border-gray-700" />
                </motion.div>

                {/* External Links */}
                <motion.div variants={itemVariants} className="mb-2">
                  <p className="mb-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Links
                  </p>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Link
                    href="/documentation"
                    onClick={closeMenu}
                    className="mb-3 flex w-full items-center justify-start rounded-md p-4 text-left text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <BookOpen className="mr-3 h-5 w-5" />
                    Documentation
                  </Link>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <a
                    href="https://github.com/aramb-dev/transcriptr"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={closeMenu}
                    className="mb-3 flex w-full items-center justify-start rounded-md p-4 text-left text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <Github className="mr-3 h-5 w-5" />
                    Star on GitHub
                  </a>
                </motion.div>

                {/* Legal Links */}
                <motion.div variants={itemVariants} className="mt-4">
                  <div className="flex flex-col space-y-2 border-t border-gray-200 pt-4 dark:border-gray-700">
                    <Link
                      href="/terms"
                      onClick={closeMenu}
                      className="px-4 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      Terms of Service
                    </Link>
                    <Link
                      href="/privacy"
                      onClick={closeMenu}
                      className="px-4 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      Privacy Policy
                    </Link>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
