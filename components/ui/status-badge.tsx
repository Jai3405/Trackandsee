const TONE_CLASS = { brass: 'bg-brass', sage: 'bg-sage', rust: 'bg-rust' } as const;

export function StatusBadge({ tone }: { tone: keyof typeof TONE_CLASS }) {
  return <span role="status" className={`inline-block h-3 w-3 rounded-full ${TONE_CLASS[tone]}`} />;
}
