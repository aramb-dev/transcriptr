// Debug utilities for V2 announcement modal

// Extend the Window interface to include our debug function
declare global {
  interface Window {
    seenV2: (seen: boolean) => void;
  }
}

// Initialize debug function
export const initializeV2Debug = () => {
  if (typeof window !== "undefined") {
    window.seenV2 = (seen: boolean) => {
      if (seen) {
        localStorage.setItem("seenV2", "true");
        console.log("V2 announcement disabled - will not show on next visit");
      } else {
        localStorage.removeItem("seenV2");
        console.log("V2 announcement enabled - will show on next page refresh");
      }
    };
  }
};
