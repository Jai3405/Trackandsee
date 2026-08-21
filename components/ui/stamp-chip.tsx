export function StampChip({ label }: { label: string }) {
  return (
    <span className="inline-block rounded border border-dashed border-dusty-blue px-2 py-0.5 text-xs text-dusty-blue">
      {label}
    </span>
  );
}
