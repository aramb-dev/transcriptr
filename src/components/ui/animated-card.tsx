import * as React from 'react';
import { motion } from 'framer-motion';
import { Card, CardProps } from './card';

export function AnimatedCard({ children, className, ...props }: CardProps) {
  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)" }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={className}
    >
      <Card {...props}>
        {children}
      </Card>
    </motion.div>
  );
}