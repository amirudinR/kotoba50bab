interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  /** Warna isi. */
  tone?: "ink" | "accent" | "seal" | "success" | "danger" | "warn";
}

const TONES: Record<string, string> = {
  ink: "bg-ink",
  accent: "bg-accent",
  seal: "bg-seal",
  success: "bg-success",
  danger: "bg-danger",
  warn: "bg-warn",
};

export default function ProgressBar({
  value,
  max,
  className = "",
  tone = "ink",
}: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div
      className={`h-1.5 w-full overflow-hidden rounded-pill bg-ink/10 ${className}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div
        className={`h-full rounded-pill ${TONES[tone]} transition-[width] duration-500 ease-out`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
