const TONE_CLASS = { accent: 'bg-accent', sage: 'bg-sage', rust: 'bg-rust' } as const;

export function StatusBadge({ tone }: { tone: keyof typeof TONE_CLASS }) {
  return <span role="status" className={`inline-block h-3 w-3 rounded-full shadow-seal ${TONE_CLASS[tone]}`} />;
}
