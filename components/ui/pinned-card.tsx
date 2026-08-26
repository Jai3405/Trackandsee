'use client';
import { motion } from 'motion/react';

const VARIANT_BG: Record<'parchment' | 'swatch', string> = {
  parchment: 'bg-parchment',
  swatch: 'bg-dusty-blue',
};
const VARIANT_HEX: Record<'parchment' | 'swatch', string> = {
  parchment: '#CEC1B0',
  swatch: '#9FBCD7',
};
const SIZE_PAD: Record<'sm' | 'md' | 'lg', string> = { sm: 'p-2', md: 'p-4', lg: 'p-6' };
const SIZE_SHADOW: Record<'sm' | 'md' | 'lg', string> = {
  sm: '0 3px 7px rgba(0,0,0,.3)',
  md: '0 4px 9px rgba(0,0,0,.3)',
  lg: '0 8px 20px rgba(0,0,0,.3)',
};

// Deterministic small rotation from an id, so a card's tilt is stable across
// re-renders and SSR/client hydration — never Math.random(), which would
// jitter on every render and cause a hydration mismatch.
export function pinRotation(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  const range = 7; // degrees, spread roughly -3.5..3.5
  return ((Math.abs(hash) % 1000) / 1000) * range - range / 2;
}

export function PinnedCard({
  id,
  variant = 'parchment',
  kindLabel,
  torn = false,
  size = 'md',
  className = '',
  children,
}: {
  id: string;
  variant?: 'parchment' | 'swatch';
  kindLabel?: string;
  torn?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
}) {
  const rotation = pinRotation(id);

  return (
    <motion.div
      style={{ rotate: rotation, boxShadow: SIZE_SHADOW[size] }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className={`relative rounded-md text-left ${VARIANT_BG[variant]} ${SIZE_PAD[size]} ${torn ? 'pb-3' : ''} ${className}`}
    >
      <span
        aria-hidden="true"
        className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-rust"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,.4)' }}
      />
      {kindLabel && (
        <p className="mb-1 text-[0.6rem] font-semibold uppercase tracking-wide text-ink/80">{kindLabel}</p>
      )}
      {children}
      {torn && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-1 left-0 right-0 h-1.5"
          style={{ background: `repeating-linear-gradient(-45deg, ${VARIANT_HEX[variant]} 0 3px, transparent 3px 6px)` }}
        />
      )}
    </motion.div>
  );
}
