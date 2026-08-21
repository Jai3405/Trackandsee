export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-frame bg-parchment-dim p-8 text-center font-display">
      <p className="mb-2 text-lg">{title}</p>
      <p className="mb-4 font-sans text-sm text-ink/70">{description}</p>
      {action}
    </div>
  );
}
