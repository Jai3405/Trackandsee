'use client';
import { useEffect } from 'react';
import { useSpring, useTransform, motion } from 'motion/react';

export function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(value, { stiffness: 200, damping: 30 });
  const display = useTransform(spring, (v) => v.toFixed(2));
  useEffect(() => { spring.set(value); }, [value, spring]);
  return <motion.span>{display}</motion.span>;
}
