import type { ReactNode } from "react";

interface TopBarProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
}

export default function TopBar({ title, subtitle, onBack, right }: TopBarProps) {
  return (
    <div className="sticky top-0 z-20 bg-paper/90 backdrop-blur border-b border-ink/10">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Kembali"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/80 text-ink shadow-paper active:scale-95"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="font-hand text-2xl leading-tight text-ink truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-pencil/80 truncate">{subtitle}</p>
          )}
        </div>
        {right}
      </div>
    </div>
  );
}
