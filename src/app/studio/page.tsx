"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { TranscriptionStudio } from "@/components/transcription/TranscriptionStudio";
import { TranscriptionSession, getSession, getAllSessions } from "@/lib/persistence-service";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileAudio, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Toaster } from "sonner";

// Loading skeleton for the studio
function StudioSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        {/* Header skeleton */}
        <div className="mb-6 flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-64 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="h-10 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* Content skeleton */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="h-96 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="space-y-4">
            <div className="h-48 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
            <div className="h-32 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
            <div className="h-40 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Empty state when no session is found
function EmptyState() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-md px-4 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <FileAudio className="h-10 w-10 text-gray-400" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          No Transcription Found
        </h1>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Start a new transcription to use the studio, or select a session from your history.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={() => router.push("/")} className="flex items-center gap-2">
            <FileAudio className="h-4 w-4" />
            New Transcription
          </Button>
          <Button variant="outline" onClick={() => router.push("/?history=true")}>
            <Clock className="mr-2 h-4 w-4" />
            View History
          </Button>
        </div>
      </div>
    </div>
  );
}

// Error state
function ErrorState({ message }: { message: string }) {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-md px-4 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
          <AlertCircle className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          Error Loading Session
        </h1>
        <p className="mb-6 text-gray-600 dark:text-gray-400">{message}</p>
        <Button onClick={() => router.push("/")} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
      </div>
    </div>
  );
}

// Main studio content component
function StudioContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session");

  const [session, setSession] = useState<TranscriptionSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSession() {
      setIsLoading(true);
      setError(null);

      try {
        if (sessionId) {
          // Load specific session by ID
          const loadedSession = await getSession(sessionId);
          if (loadedSession) {
            setSession(loadedSession);
          } else {
            setError("Session not found. It may have expired or been deleted.");
          }
        } else {
          // Try to load the most recent completed session
          const allSessions = await getAllSessions();
          const completedSessions = allSessions
            .filter((s) => s.status === "succeeded" && s.result)
            .sort((a, b) => b.lastUpdatedAt - a.lastUpdatedAt);

          if (completedSessions.length > 0) {
            setSession(completedSessions[0]);
            // Update URL with session ID for deep linking
            const url = new URL(window.location.href);
            url.searchParams.set("session", completedSessions[0].id);
            window.history.replaceState({}, "", url.toString());
          }
        }
      } catch (err) {
        console.error("Failed to load session:", err);
        setError("Failed to load transcription session.");
      } finally {
        setIsLoading(false);
      }
    }

    loadSession();
  }, [sessionId]);

  const handleNewTranscription = () => {
    router.push("/");
  };

  if (isLoading) {
    return <StudioSkeleton />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!session || !session.result) {
    return <EmptyState />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Back navigation */}
      <div className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="container mx-auto flex items-center gap-4 px-4 py-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Transcriptr
          </Link>
          {session.audioSource?.name && (
            <span className="text-sm text-gray-400">|</span>
          )}
          {session.audioSource?.name && (
            <span className="truncate text-sm text-gray-600 dark:text-gray-400">
              {session.audioSource.name}
            </span>
          )}
        </div>
      </div>

      {/* Studio content */}
      <TranscriptionStudio
        transcription={session.result}
        audioSource={session.audioSource}
        segments={session.segments}
        intelligence={session.intelligence}
        onNewTranscription={handleNewTranscription}
      />

      <Toaster />
    </div>
  );
}

// Main page component with Suspense boundary
export default function StudioPage() {
  return (
    <Suspense fallback={<StudioSkeleton />}>
      <StudioContent />
    </Suspense>
  );
}
