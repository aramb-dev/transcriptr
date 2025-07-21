import { useState, useEffect, useCallback } from "react";
import {
  getActiveSession,
  createSession,
  updateSession,
  deleteSession,
  TranscriptionSession,
} from "@/lib/persistence-service";
import { TranscriptionStatus } from "@/services/transcription";

export interface UseSessionPersistenceProps {
  onSessionRecovered?: (session: TranscriptionSession) => void;
}

export interface UseSessionPersistenceResult {
  activeSession: TranscriptionSession | null;
  hasRecoverableSession: boolean;
  isLoading: boolean;
  createNewSession: (
    options: { language: string; diarize: boolean },
    audioSource: {
      type: "file" | "url";
      name?: string;
      size?: number;
      url?: string;
    },
  ) => Promise<TranscriptionSession>;
  updateSessionData: (updates: Partial<TranscriptionSession>) => Promise<void>;
  recoverSession: () => Promise<void>;
  discardSession: () => Promise<void>;
}

/**
 * Hook for managing transcription session persistence
 */
export const useSessionPersistence = ({
  onSessionRecovered,
}: UseSessionPersistenceProps = {}): UseSessionPersistenceResult => {
  const [activeSession, setActiveSession] =
    useState<TranscriptionSession | null>(null);
  const [hasRecoverableSession, setHasRecoverableSession] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check for active session on mount
  useEffect(() => {
    const checkForActiveSession = async () => {
      try {
        setIsLoading(true);
        const session = await getActiveSession();

        if (session) {
          console.log("Found active session:", session.id);

          // Only consider it recoverable if it's in certain states
          const isRecoverable = ["starting", "processing"].includes(
            session.status,
          );
          setHasRecoverableSession(isRecoverable);

          // Store the session but don't auto-activate it
          setActiveSession(session);
        } else {
          setHasRecoverableSession(false);
        }
      } catch (error) {
        console.error("Error checking for active session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkForActiveSession();
  }, []);

  // Create a new session
  const createNewSession = useCallback(
    async (
      options: { language: string; diarize: boolean },
      audioSource: {
        type: "file" | "url";
        name?: string;
        size?: number;
        url?: string;
      },
    ): Promise<TranscriptionSession> => {
      const newSession = await createSession(options, audioSource);
      setActiveSession(newSession);
      return newSession;
    },
    [],
  );

  // Update session data
  const updateSessionData = useCallback(
    async (updates: Partial<TranscriptionSession>) => {
      if (!activeSession) {
        console.warn("No active session to update");
        return;
      }

      try {
        const updatedSession = await updateSession(activeSession.id, updates);
        if (updatedSession) {
          setActiveSession(updatedSession);
        }
      } catch (error) {
        console.error("Error updating session:", error);
      }
    },
    [activeSession],
  );

  // Recover an active session
  const recoverSession = useCallback(async () => {
    if (!activeSession) {
      console.warn("No active session to recover");
      return;
    }

    try {
      // Call the onSessionRecovered callback with the session data
      if (onSessionRecovered) {
        onSessionRecovered(activeSession);
      }

      // Update the session status if needed
      if (activeSession.status === "starting") {
        // If it was just starting, keep the status
        await updateSessionData({ lastUpdatedAt: Date.now() });
      } else if (activeSession.status === "processing") {
        // If it was processing, resume processing
        await updateSessionData({ lastUpdatedAt: Date.now() });
      }

      setHasRecoverableSession(false);
    } catch (error) {
      console.error("Error recovering session:", error);
    }
  }, [activeSession, onSessionRecovered, updateSessionData]);

  // Discard an active session
  const discardSession = useCallback(async () => {
    if (!activeSession) {
      return;
    }

    try {
      await deleteSession(activeSession.id);
      setActiveSession(null);
      setHasRecoverableSession(false);
    } catch (error) {
      console.error("Error discarding session:", error);
    }
  }, [activeSession]);

  return {
    activeSession,
    hasRecoverableSession,
    isLoading,
    createNewSession,
    updateSessionData,
    recoverSession,
    discardSession,
  };
};

export default useSessionPersistence;
