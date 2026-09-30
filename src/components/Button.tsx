import type { ButtonHTMLAttributes, ReactNode } from "react";

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "ink" | "red" | "ghost" | "note";
}

const styles: Record<string, string> = {
  ink: "bg-ink text-white hover:bg-ink-soft shadow-paper",
  red: "bg-margin text-white hover:brightness-110 shadow-paper",
  ghost: "bg-white/70 text-ink border border-ink/25 hover:bg-white",
  note: "bg-note-yellow text-pencil border border-black/10 hover:brightness-105 shadow-note",
};

export default function Button({
  children,
  variant = "ink",
  className = "",
  ...rest
}: BtnProps) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-bold transition active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
