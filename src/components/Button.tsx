import type { ButtonHTMLAttributes, ReactNode } from "react";
import AppIcon from "./Icon";
import type { IconName } from "./Icon";

type Variant = "ink" | "seal" | "ghost" | "quiet" | "accent";
type Size = "sm" | "md" | "lg";

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  iconRight?: IconName;
}

const VARIANTS: Record<Variant, string> = {
  // biru tinta — aksi utama
  ink: "bg-ink text-surface hover:brightness-110 active:brightness-95 shadow-soft",
  // merah stempel — aksi berintensitas/berbahaya
  seal: "bg-seal text-white hover:brightness-110 active:brightness-95 shadow-soft",
  // tombol dengan outline — sekunder
  ghost:
    "bg-surface text-ink border border-ink/20 hover:bg-raised hover:border-ink/35 active:scale-[0.98]",
  // paling halus — tersier
  quiet: "text-muted hover:text-ink hover:bg-ink/[0.06] active:scale-[0.98]",
  // aksen hangat — untuk CTA singkat
  accent: "bg-accent text-white hover:brightness-105 active:brightness-95 shadow-soft",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3 text-sm gap-1.5 rounded-lg",
  md: "h-11 px-4 text-[15px] gap-2 rounded-xl",
  lg: "h-12 px-6 text-base gap-2.5 rounded-xl",
};

export default function Button({
  children,
  variant = "ink",
  size = "md",
  icon,
  iconRight,
  className = "",
  type = "button",
  ...rest
}: BtnProps) {
  const iconSize = size === "sm" ? "text-base" : "text-lg";
  return (
    <button
      type={type}
      {...rest}
      className={[
        "inline-flex shrink-0 items-center justify-center font-semibold",
        "transition-[transform,background-color,color,filter,border-color] duration-150",
        "active:scale-[0.97] disabled:pointer-events-none disabled:opacity-45",
        SIZES[size],
        VARIANTS[variant],
        className,
      ].join(" ")}
    >
      {icon && <AppIcon icon={icon} className={iconSize} />}
      {children}
      {iconRight && <AppIcon icon={iconRight} className={iconSize} />}
    </button>
  );
}
