/**
 * Utility functions for handling and formatting errors
 */

export interface NetworkError {
  isNetworkError: boolean;
  userMessage: string;
  originalError: unknown;
}

/**
 * Checks if an error is a network-related error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    // fetch() throws TypeError for network failures
    return (
      error.message.includes("fetch") ||
      error.message.includes("network") ||
      error.message.includes("Failed to fetch")
    );
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("network") ||
      message.includes("connection") ||
      message.includes("offline") ||
      message.includes("timeout") ||
      message.includes("enotfound") ||
      message.includes("econnrefused")
    );
  }

  return false;
}

/**
 * Converts an error into a user-friendly message
 */
export function getUserFriendlyErrorMessage(error: unknown): NetworkError {
  // Check if it's a network error
  if (isNetworkError(error)) {
    return {
      isNetworkError: true,
      userMessage:
        "Lost internet connection. Please check your network and try again.",
      originalError: error,
    };
  }

  // Check for specific HTTP error codes
  if (error instanceof Response) {
    if (error.status >= 500 && error.status < 600) {
      return {
        isNetworkError: false,
        userMessage:
          "Our servers are having trouble. Please try again in a moment.",
        originalError: error,
      };
    }
    if (error.status === 429) {
      return {
        isNetworkError: false,
        userMessage:
          "Too many requests. Please wait a moment and try again.",
        originalError: error,
      };
    }
    if (error.status === 413) {
      return {
        isNetworkError: false,
        userMessage:
          "The audio file is too large. Please try a smaller file.",
        originalError: error,
      };
    }
  }

  // Check error message for specific patterns
  if (error instanceof Error) {
    const message = error.message;

    if (message.includes("413") || message.includes("too large")) {
      return {
        isNetworkError: false,
        userMessage:
          "The audio file is too large. Please try a smaller file.",
        originalError: error,
      };
    }

    if (message.includes("429") || message.includes("rate limit")) {
      return {
        isNetworkError: false,
        userMessage:
          "Too many requests. Please wait a moment and try again.",
        originalError: error,
      };
    }

    if (message.includes("500") || message.includes("502") || message.includes("503")) {
      return {
        isNetworkError: false,
        userMessage:
          "Our servers are having trouble. Please try again in a moment.",
        originalError: error,
      };
    }

    // Return the error message as-is if it's already user-friendly
    if (message && !message.includes("Error:") && message.length < 150) {
      return {
        isNetworkError: false,
        userMessage: message,
        originalError: error,
      };
    }
  }

  // Generic fallback
  return {
    isNetworkError: false,
    userMessage:
      "Something went wrong. Please try again or contact support if the issue persists.",
    originalError: error,
  };
}

/**
 * Wraps fetch with network error handling
 */
export async function fetchWithNetworkErrorHandling(
  url: string,
  options?: RequestInit,
): Promise<Response> {
  try {
    const response = await fetch(url, options);
    return response;
  } catch (error) {
    // Re-throw with additional context
    if (isNetworkError(error)) {
      throw new Error(
        "Lost internet connection. Please check your network and try again.",
      );
    }
    throw error;
  }
}
