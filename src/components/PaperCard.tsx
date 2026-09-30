import type { ReactNode } from "react";

interface PaperCardProps {
  children: ReactNode;
  className?: string;
  /** Sedikit rotasi untuk kesan kertas miring. */
  tilt?: number;
  /** Tampilkan selotip di atas kartu. */
  tape?: boolean;
}

export default function PaperCard({
  children,
  className = "",
  tilt = 0,
  tape = false,
}: PaperCardProps) {
  return (
    <div
      className={`relative rounded-[14px] bg-white/95 paper-grain shadow-paper border border-black/5 ${className}`}
      style={tilt ? { transform: `rotate(${tilt}deg)` } : undefined}
    >
      {tape && (
        <span
          className="tape"
          style={{ top: -10, left: "50%", transform: "translateX(-50%) rotate(-2deg)" }}
        />
      )}
      {children}
    </div>
  );
}
