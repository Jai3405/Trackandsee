export function Flourish({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M32 58C32 40 30 28 18 14" />
      <path d="M18 14c-3 3-4 7-3 10" />
      <path d="M18 14c1-4 4-7 8-8" />
      <path d="M32 40c6-2 10-6 11-11" />
      <path d="M32 40c-6 1-11-1-14-6" />
      <circle cx="32" cy="58" r="2" />
    </svg>
  );
}
