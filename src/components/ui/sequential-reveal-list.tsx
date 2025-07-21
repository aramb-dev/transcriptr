import React from "react";
import { motion, Variants } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { sequentialFadeIn, sequentialItem } from "@/lib/animations";

interface SequentialRevealListProps {
  items: React.ReactNode[];
  className?: string;
  itemClassName?: string;
  containerVariants?: Variants;
  itemVariants?: Variants;
}

export function SequentialRevealList({
  items,
  className = "",
  itemClassName = "",
  containerVariants = sequentialFadeIn,
  itemVariants = sequentialItem,
}: SequentialRevealListProps) {
  const { ref, isInView } = useScrollAnimation(0.1);

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
    >
      {items.map((item, index) => (
        <motion.div
          key={index}
          className={itemClassName}
          variants={itemVariants}
        >
          {item}
        </motion.div>
      ))}
    </motion.div>
  );
}
