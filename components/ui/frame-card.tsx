'use client';
import { motion } from 'motion/react';

export function FrameCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: '0 16px 32px -8px rgba(17, 41, 75, 0.28)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className={`rounded-frame bg-parchment-dim shadow-frame ${className}`}
    >
      {children}
    </motion.div>
  );
}
