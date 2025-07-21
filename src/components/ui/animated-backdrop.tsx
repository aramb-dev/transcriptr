import * as React from "react";
import { motion } from "framer-motion";

interface AnimatedBackdropProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function AnimatedBackdrop({
  children,
  onClick,
  className = "",
}: AnimatedBackdropProps) {
  return (
    <motion.div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
