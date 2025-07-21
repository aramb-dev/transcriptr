import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import DeviceDetector from "device-detector-js";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { staggerContainer, staggerItem } from "../../lib/animations";

type FeedbackType = "general" | "issue" | "feature" | "other";

interface MobileFeedbackFormProps {
  initialType?: FeedbackType;
  onClose?: () => void;
  isModal?: boolean;
}

export function MobileFeedbackForm({
  initialType = "general",
  onClose,
  isModal = false,
}: MobileFeedbackFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [feedbackType, setFeedbackType] = useState<FeedbackType>(initialType);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // For bug reports
  const [browser, setBrowser] = useState("");
  const [operatingSystem, setOperatingSystem] = useState("");

  // Detect browser and OS
  useEffect(() => {
    const detectDeviceInfo = () => {
      if (feedbackType === "issue") {
        try {
          const deviceDetector = new DeviceDetector();
          const userAgent = navigator.userAgent;
          const device = deviceDetector.parse(userAgent);

          const browserName = device.client?.name || "Unknown Browser";
          const browserVersion = device.client?.version || "";
          setBrowser(
            browserVersion ? `${browserName} ${browserVersion}` : browserName
          );

          const osName = device.os?.name || "Unknown OS";
          const osVersion = device.os?.version || "";
          setOperatingSystem(
            osVersion ? `${osName} ${osVersion}` : osName
          );
        } catch (error) {
          console.error("Device detection failed:", error);
          setBrowser(navigator.userAgent.includes("Chrome") ? "Chrome" : navigator.userAgent.includes("Firefox") ? "Firefox" : navigator.userAgent.includes("Safari") ? "Safari" : "Unknown Browser");
          setOperatingSystem(navigator.platform || "Unknown");
        }
      }
    };

    detectDeviceInfo();
  }, [feedbackType, initialType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      const params = new URLSearchParams();
      params.append("form-name", "feedback");
      params.append("name", name);
      params.append("email", email);
      params.append("feedbackType", feedbackType);
      params.append("feedback", feedback);

      if (feedbackType === "issue") {
        params.append("browser", browser);
        params.append("operatingSystem", operatingSystem);
      }

      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setTimeout(() => {
          onClose?.();
        }, 2000);
      } else {
        throw new Error("Failed to submit feedback");
      }
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFormTitle = () => {
    switch (feedbackType) {
      case "issue":
        return "Report an Issue";
      case "feature":
        return "Suggest a Feature";
      case "other":
        return "Other Feedback";
      default:
        return "Provide Feedback";
    }
  };

  const getPlaceholderText = () => {
    switch (feedbackType) {
      case "issue":
        return "Please describe what happened and what you expected to happen. Steps to reproduce the issue are helpful too.";
      case "feature":
        return "Describe the feature you'd like to see and how it would improve your experience with Transcriptr.";
      case "other":
        return "Your thoughts, suggestions, or questions about Transcriptr.";
      default:
        return "Share your thoughts, suggestions, or feedback about Transcriptr.";
    }
  };

  const getSuccessMessage = () => {
    switch (feedbackType) {
      case "issue":
        return "Issue reported successfully!";
      case "feature":
        return "Feature suggestion submitted!";
      default:
        return "Feedback submitted successfully!";
    }
  };

  // Mobile fullscreen layout
  const content = (
    <div className={`${isModal ? "h-full" : "min-h-screen"} bg-white dark:bg-gray-900 flex flex-col`}>
      {/* Header - Fixed at top */}
      <div className="flex-shrink-0 px-4 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {getFormTitle()}
          </h1>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 h-10 w-10"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {submitStatus === "success" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {getSuccessMessage()}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-sm">
                Thank you for helping us improve Transcriptr. Your input is valuable to us.
              </p>
            </motion.div>
          ) : (
            <motion.form
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              onSubmit={handleSubmit}
              name="feedback"
              method="post"
              data-netlify="true"
              data-netlify-honeypot="bot-field"
              className="space-y-6"
            >
              <input type="hidden" name="form-name" value="feedback" />
              <input type="hidden" name="feedbackType" value={feedbackType} />
              <div className="hidden">
                <label>
                  Don't fill this out if you're human: <input name="bot-field" />
                </label>
              </div>

              {/* Feedback Type */}
              <motion.div variants={staggerItem}>
                <Label htmlFor="feedback-type" className="text-base font-medium text-gray-900 dark:text-gray-100 mb-3 block">
                  What type of feedback is this?
                </Label>
                <Select
                  value={feedbackType}
                  onValueChange={(value) => setFeedbackType(value as FeedbackType)}
                >
                  <SelectTrigger className="w-full h-12 text-base">
                    <SelectValue placeholder="Select feedback type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800">
                    <SelectItem value="general">General Feedback</SelectItem>
                    <SelectItem value="issue">Report an Issue</SelectItem>
                    <SelectItem value="feature">Feature Request</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>

              {/* Name */}
              <motion.div variants={staggerItem}>
                <Label htmlFor="name" className="text-base font-medium text-gray-900 dark:text-gray-100 mb-3 block">
                  Your Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  className="w-full h-12 text-base"
                />
              </motion.div>

              {/* Email */}
              <motion.div variants={staggerItem}>
                <Label htmlFor="email" className="text-base font-medium text-gray-900 dark:text-gray-100 mb-3 block">
                  Email <span className="text-sm font-normal text-gray-500 dark:text-gray-400">(optional)</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full h-12 text-base"
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  We'll only contact you if we need more information about your {feedbackType === "issue" ? "issue" : "feedback"}.
                </p>
              </motion.div>

              {/* Auto-detected info for issues */}
              {feedbackType === "issue" && (
                <motion.div variants={staggerItem} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                    System Information <span className="font-normal text-gray-500">(auto-detected)</span>
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Browser:</span>
                      <span className="text-gray-900 dark:text-gray-100 font-medium">{browser || "Detecting..."}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Operating System:</span>
                      <span className="text-gray-900 dark:text-gray-100 font-medium">{operatingSystem || "Detecting..."}</span>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    This information helps us reproduce and fix issues faster.
                  </p>
                  
                  {/* Hidden inputs for form submission */}
                  <input type="hidden" name="browser" value={browser} />
                  <input type="hidden" name="operatingSystem" value={operatingSystem} />
                </motion.div>
              )}

              {/* Main feedback text */}
              <motion.div variants={staggerItem}>
                <Label htmlFor="feedback" className="text-base font-medium text-gray-900 dark:text-gray-100 mb-3 block">
                  {feedbackType === "issue" ? "Describe the Issue" : 
                   feedbackType === "feature" ? "Describe Your Feature Idea" : 
                   "Your Feedback"}
                </Label>
                <Textarea
                  id="feedback"
                  name="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={getPlaceholderText()}
                  required
                  className="min-h-[120px] w-full text-base resize-none"
                  rows={6}
                />
              </motion.div>

              {/* Error message */}
              <AnimatePresence>
                {submitStatus === "error" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-start rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-700 dark:bg-red-900/30"
                  >
                    <AlertCircle className="mt-0.5 mr-3 h-5 w-5 text-red-500 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-red-700 dark:text-red-300">
                        Failed to submit feedback
                      </p>
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errorMessage || "Please check your connection and try again."}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.form>
          )}
        </div>
      </div>

      {/* Footer - Fixed at bottom */}
      {submitStatus !== "success" && (
        <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 space-y-3">
          {/* Primary Submit Button */}
          <Button
            type="submit"
            form="feedback"
            disabled={isSubmitting}
            size="lg"
            className="w-full h-12 text-base font-medium bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </div>
            ) : (
              `Submit ${feedbackType === "issue" ? "Issue Report" : feedbackType === "feature" ? "Feature Request" : "Feedback"}`
            )}
          </Button>
          
          {/* Secondary Cancel Button */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 text-base font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );

  return content;
}
