interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
}

export default function ProgressBar({ value, max, className = "" }: ProgressBarProps) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className={`h-2.5 w-full overflow-hidden rounded-full bg-ink/10 ${className}`}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-ink to-ink-soft transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
