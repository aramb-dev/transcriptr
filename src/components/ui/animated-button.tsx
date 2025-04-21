import * as React from 'react';
import { motion } from 'framer-motion';
import { Button, ButtonProps } from './button';

export function AnimatedButton({ children, ...props }: ButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      <Button {...props}>
        {children}
      </Button>
    </motion.div>
  );
}