import type { ReactNode } from "react";

interface PaperCardProps {
  children: ReactNode;
  className?: string;
  /** Naikkan elevasi (untuk elemen fokus). */
  raised?: boolean;
  /** Tampilkan pita selotip di atas kartu. */
  tape?: boolean;
  /** Sudut miring sedikit — kesan kertas lepas. */
  tilt?: number;
  /** Tombol klik opsional — membuat whole card bisa diklik. */
  onClick?: () => void;
}

export default function PaperCard({
  children,
  className = "",
  raised = false,
  tape = false,
  tilt = 0,
  onClick,
}: PaperCardProps) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      {...(onClick ? { onClick, type: "button" as const } : {})}
      className={[
        raised ? "k-card-raised" : "k-card",
        onClick
          ? "w-full text-left transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lift active:translate-y-0 active:scale-[0.995]"
          : "",
        className,
      ].join(" ")}
      style={tilt ? { transform: `rotate(${tilt}deg)` } : undefined}
    >
      {tape && (
        <span
          className="pointer-events-none absolute left-1/2 top-0 h-5 w-16 -translate-x-1/2 -translate-y-1/2 -rotate-2 rounded-[2px] bg-accent/45 shadow-soft"
          aria-hidden
        />
      )}
      {children}
    </Comp>
  );
}
