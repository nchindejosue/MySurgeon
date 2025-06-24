import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hover = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -2, boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)' } : {}}
      className={`bg-white rounded-lg border border-neutral-200 shadow-sm ${className}`}
    >
      {children}
    </motion.div>
  );
};