import React, { forwardRef } from "react";
import { motion, useInView } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface ScrollRevealSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  threshold?: number;
  variants?: any;
}

export function ScrollRevealSection({
  children,
  className = "",
  delay = 0,
  threshold = 0.1,
  variants,
}: ScrollRevealSectionProps) {
  const { ref, isInView } = useScrollAnimation(threshold);

  const defaultVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants || defaultVariants}
    >
      {children}
    </motion.div>
  );
}
