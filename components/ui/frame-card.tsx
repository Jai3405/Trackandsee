export function FrameCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-frame bg-parchment-dim shadow-sm ${className}`}>
      {children}
    </div>
  );
}
