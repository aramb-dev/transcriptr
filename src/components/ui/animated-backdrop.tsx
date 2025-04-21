import * as React from 'react';
import { motion } from 'framer-motion';

interface AnimatedBackdropProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function AnimatedBackdrop({ children, onClick, className = '' }: AnimatedBackdropProps) {
  return (
    <motion.div
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}