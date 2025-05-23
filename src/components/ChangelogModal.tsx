import React from 'react';
import { Changelog } from './Changelog';
import { motion } from 'framer-motion';
import { scaleDown } from '../lib/animations';
import { AnimatedBackdrop } from './ui/animated-backdrop';

interface ChangelogModalProps {
  onClose: () => void;
}

export function ChangelogModal({ onClose }: ChangelogModalProps) {
  return (
    <AnimatedBackdrop onClick={onClose}>
      <motion.div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()} // Prevent clicks from closing the modal
        variants={scaleDown}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
      >
        <Changelog isModal={true} onClose={onClose} />
      </motion.div>
    </AnimatedBackdrop>
  );
}