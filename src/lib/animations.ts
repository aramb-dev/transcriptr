import type { Variants, Target, TargetAndTransition } from "framer-motion";

// Fade in from below
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

// Slide in from right
export const slideInRight: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

// Expand from center
export const expandCenter: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.1 },
};

// Staggered children animation container
export const staggerContainer: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

// Staggered item
export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

// Spring transition presets
export const springTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 25
};

// Ease transition presets
export const easeTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.4
};

// Fade out downward (good for dismissing elements)
export const fadeOutDown: Variants = {
  initial: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20, transition: { duration: 0.2 } }
};

// Slide out to left (good for page transitions)
export const slideOutLeft: Variants = {
  initial: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -100, transition: { duration: 0.3 } }
};

// Scale down and fade (good for modals/dialogs)
export const scaleDown: Variants = {
  initial: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

// Flip out (good for cards)
export const flipOut: Variants = {
  initial: { rotateY: 0, opacity: 1 },
  exit: { rotateY: 90, opacity: 0, transition: { duration: 0.4 } }
};

// Add more specific exit transitions
export const exitTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.3
};

export const quickExitTransition = {
  type: "tween",
  ease: "easeOut",
  duration: 0.2
};

// Scroll animations
export const fadeInOnScroll: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6
    }
  }
};

export const scaleInOnScroll: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5
    }
  }
};

// Sequential stagger for list items
export const sequentialFadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

// Item for sequential animations
export const sequentialItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

// Gesture animations
export const tapBounce = {
  scale: 0.97,
  transition: { type: "spring", stiffness: 400, damping: 17 }
};

export const hoverScale = {
  scale: 1.02,
  transition: { type: "spring", stiffness: 400, damping: 17 }
};

export const dragConstraintBounce = {
  type: "spring",
  damping: 25,
  stiffness: 300,
  restDelta: 0.001
};

// Layout animation helpers
export const smoothLayoutTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30
};

// Animation presets
export const presets = {
  fastSpring: { type: "spring", stiffness: 400, damping: 20 },
  gentleSpring: { type: "spring", stiffness: 100, damping: 20 },
  quickEase: { type: "tween", ease: "easeOut", duration: 0.2 },
  longEase: { type: "tween", ease: "easeInOut", duration: 0.7 }
};

// Modal animations
export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

export const modalContent: Variants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.8, y: 20 }
};

// Spring transition for modals
export const modalTransition = {
  type: "spring" as const,
  damping: 25,
  stiffness: 300
};