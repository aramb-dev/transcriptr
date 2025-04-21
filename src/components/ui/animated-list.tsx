import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedListProps {
  items: React.ReactNode[];
  keyExtractor: (item: any, index: number) => string | number;
  className?: string;
  itemClassName?: string;
}

export function AnimatedList({ items, keyExtractor, className = '', itemClassName = '' }: AnimatedListProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      animate="show"
      exit="exit"
    >
      <AnimatePresence>
        {items.map((itemContent, index) => (
          <motion.div
            key={keyExtractor(itemContent, index)}
            variants={item}
            className={itemClassName}
            layout
          >
            {itemContent}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}