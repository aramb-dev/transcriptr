import { AnimatePresence } from "framer-motion";
import { MainLayout } from "./components/layout/MainLayout";

// Default: General Feedback
window.feedbackType = "general";

declare global {
  interface Window {
    feedbackType: "general" | "issue" | "feature" | "other";
  }
}

export default function App() {
  return (
    <AnimatePresence mode="wait">
      <MainLayout />
    </AnimatePresence>
  );
}
