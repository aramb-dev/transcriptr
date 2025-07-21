import { useEffect, useState } from "react";
import { initializeV2Debug } from "../lib/v2-debug";

// Hook to check if V2 announcement should be shown
export function useV2Announcement() {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // Check if user has seen V2 announcement
    const hasSeenV2 = localStorage.getItem("seenV2");
    if (!hasSeenV2) {
      setShouldShow(true);
    }

    // Initialize debug function
    initializeV2Debug();
  }, []);

  const hideAnnouncement = () => {
    setShouldShow(false);
  };

  return { shouldShow, hideAnnouncement };
}
