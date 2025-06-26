/**
 * Service for handling persistence of transcription state and sessions
 * Uses IndexedDB for data storage and cookies for session identification
 */

import { TranscriptionStatus } from '@/services/transcription';

// Type definitions
export interface TranscriptionSession {
  id: string;                       // Unique session ID
  status: TranscriptionStatus;      // Current status
  predictionId: string | null;      // Replicate prediction ID
  progress: number;                 // Progress percentage
  firebaseFilePath: string | null;  // Path to temp file if applicable
  createdAt: number;                // Timestamp
  lastUpdatedAt: number;            // Last activity timestamp
  expiresAt: number;                // When this session should expire (24 hours by default)
  audioSource: {
    type: 'file' | 'url';
    name?: string;                  // Original filename
    size?: number;                  // File size
    url?: string;                   // URL for audio if applicable
  };
  options: {                        // Transcription options
    language: string;
    diarize: boolean;
  };
  apiResponses?: Array<{            // Optional API response history
    timestamp: Date;
    data: Record<string, unknown>;
  }>;
  result?: string;                  // Final transcription result if available
}

// Constants
const DB_NAME = 'transcriptr-db';
const STORE_NAME = 'transcription-sessions';
const DB_VERSION = 1;
const SESSION_COOKIE_NAME = 'transcriptr_session_id';
const DEFAULT_SESSION_EXPIRY_HOURS = 24;

/**
 * Initialize the IndexedDB database
 */
const initDb = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    // Check for IndexedDB support
    if (!window.indexedDB) {
      console.error("Your browser doesn't support IndexedDB");
      reject(new Error("IndexedDB not supported"));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("Database error:", event);
      reject(new Error("Could not open IndexedDB"));
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object store for sessions
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        
        // Create indexes for faster queries
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('expiresAt', 'expiresAt', { unique: false });
        store.createIndex('predictionId', 'predictionId', { unique: false });
      }
    };
  });
};

/**
 * Create a new session ID and store in cookie
 */
export const createSessionId = (): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 10);
  const sessionId = `${timestamp}-${randomString}`;
  
  // Set session cookie
  document.cookie = `${SESSION_COOKIE_NAME}=${sessionId}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;
  
  return sessionId;
};

/**
 * Get current session ID from cookie
 */
export const getSessionId = (): string | null => {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === SESSION_COOKIE_NAME) {
      return value;
    }
  }
  return null;
};

/**
 * Clear the session cookie
 */
export const clearSessionId = (): void => {
  document.cookie = `${SESSION_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
};

/**
 * Save a transcription session to IndexedDB
 */
export const saveSession = async (session: TranscriptionSession): Promise<void> => {
  try {
    const db = await initDb();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    // Update timestamp
    session.lastUpdatedAt = Date.now();
    
    // Save to store
    await new Promise<void>((resolve, reject) => {
      const request = store.put(session);
      request.onsuccess = () => resolve();
      request.onerror = (event) => {
        console.error("Error saving session:", event);
        reject(new Error("Failed to save session"));
      };
    });
    
    console.log('Session saved successfully:', session.id);
  } catch (error) {
    console.error('Error in saveSession:', error);
  }
};

/**
 * Create a new transcription session
 */
export const createSession = async (
  options: {
    language: string;
    diarize: boolean;
  },
  audioSource: {
    type: 'file' | 'url';
    name?: string;
    size?: number;
    url?: string;
  }
): Promise<TranscriptionSession> => {
  // Create a new session ID or use existing one from cookie
  const sessionId = getSessionId() || createSessionId();
  
  const now = Date.now();
  const expiryHours = DEFAULT_SESSION_EXPIRY_HOURS;
  
  const session: TranscriptionSession = {
    id: sessionId,
    status: 'starting',
    predictionId: null,
    progress: 0,
    firebaseFilePath: null,
    createdAt: now,
    lastUpdatedAt: now,
    expiresAt: now + (expiryHours * 60 * 60 * 1000), // 24 hours by default
    audioSource,
    options,
    apiResponses: []
  };
  
  await saveSession(session); // Save the new session immediately
  return session;
};

/**
 * Get a session by ID
 */
export const getSession = async (sessionId: string): Promise<TranscriptionSession | null> => {
  try {
    const db = await initDb();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    const session = await new Promise<TranscriptionSession | null>((resolve, reject) => {
      const request = store.get(sessionId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = (event) => {
        console.error("Error reading session:", event);
        reject(new Error("Failed to read session"));
      };
    });
    
    return session;
  } catch (error) {
    console.error('Error in getSession:', error);
    return null;
  }
};

/**
 * Get the most recent active session (not completed or failed)
 */
export const getActiveSession = async (): Promise<TranscriptionSession | null> => {
  try {
    const db = await initDb();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    // Get all sessions
    const sessions = await new Promise<TranscriptionSession[]>((resolve, reject) => {
      const request = store.index('status').getAll(IDBKeyRange.bound('starting', 'processing'));
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = (event) => {
        console.error("Error reading sessions:", event);
        reject(new Error("Failed to read sessions"));
      };
    });
    
    if (sessions.length === 0) {
      return null;
    }
    
    // Find the most recent session
    const currentSessionId = getSessionId();
    const now = Date.now();
    
    // First check if there's an active session matching the current session cookie
    if (currentSessionId) {
      const currentSession = sessions.find(s => s.id === currentSessionId);
      if (currentSession && currentSession.expiresAt > now) {
        return currentSession;
      }
    }
    
    // Otherwise return the most recent active session
    const validSessions = sessions.filter(s => s.expiresAt > now);
    if (validSessions.length === 0) {
      return null;
    }
    
    // Sort by last updated time (descending)
    validSessions.sort((a, b) => b.lastUpdatedAt - a.lastUpdatedAt);
    return validSessions[0];
  } catch (error) {
    console.error('Error in getActiveSession:', error);
    return null;
  }
};

/**
 * Update a session with new data
 */
export const updateSession = async (
  sessionId: string, 
  updates: Partial<TranscriptionSession>
): Promise<TranscriptionSession | null> => {
  try {
    const session = await getSession(sessionId);
    if (!session) {
      console.error('Session not found:', sessionId);
      return null;
    }
    
    // Apply updates
    const updatedSession: TranscriptionSession = {
      ...session,
      ...updates,
      lastUpdatedAt: Date.now()
    };
    
    await saveSession(updatedSession);
    return updatedSession;
  } catch (error) {
    console.error('Error in updateSession:', error);
    return null;
  }
};

/**
 * Delete a session by ID
 */
export const deleteSession = async (sessionId: string): Promise<boolean> => {
  try {
    const db = await initDb();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    await new Promise<void>((resolve, reject) => {
      const request = store.delete(sessionId);
      request.onsuccess = () => resolve();
      request.onerror = (event) => {
        console.error("Error deleting session:", event);
        reject(new Error("Failed to delete session"));
      };
    });
    
    // Clear session cookie if it matches
    if (getSessionId() === sessionId) {
      clearSessionId();
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteSession:', error);
    return false;
  }
};

/**
 * Clean up expired sessions
 */
export const cleanupExpiredSessions = async (): Promise<number> => {
  try {
    const db = await initDb();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const now = Date.now();
    
    // Get expired sessions
    const expiredSessions = await new Promise<TranscriptionSession[]>((resolve, reject) => {
      const request = store.index('expiresAt').getAll(IDBKeyRange.upperBound(now));
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = (event) => {
        console.error("Error reading expired sessions:", event);
        reject(new Error("Failed to read expired sessions"));
      };
    });
    
    if (expiredSessions.length === 0) {
      return 0;
    }
    
    // Delete each expired session
    let deletedCount = 0;
    for (const session of expiredSessions) {
      await new Promise<void>((resolve, reject) => {
        const request = store.delete(session.id);
        request.onsuccess = () => {
          deletedCount++;
          resolve();
        };
        request.onerror = (event) => {
          console.error("Error deleting session:", event);
          reject(new Error("Failed to delete session"));
        };
      });
    }
    
    console.log(`Cleaned up ${deletedCount} expired sessions`);
    return deletedCount;
  } catch (error) {
    console.error('Error in cleanupExpiredSessions:', error);
    return 0;
  }
};

/**
 * Get all sessions (for history view)
 */
export const getAllSessions = async (): Promise<TranscriptionSession[]> => {
  try {
    const db = await initDb();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    // Get all sessions
    const sessions = await new Promise<TranscriptionSession[]>((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = (event) => {
        console.error("Error reading all sessions:", event);
        reject(new Error("Failed to read sessions"));
      };
    });
    
    return sessions;
  } catch (error) {
    console.error('Error in getAllSessions:', error);
    return [];
  }
};