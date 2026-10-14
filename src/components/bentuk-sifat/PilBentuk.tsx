import AppIcon from "../Icon";

interface PilBentukProps {
  label: string;
  title: string;
  active: boolean;
  disabled?: boolean;
  tone: "success" | "danger";
  onClick: () => void;
}

/**
 * Pil compact untuk panel kolom bentuk — lebih ringkas & modern dari `Chip`.
 * Tone positif (hijau) / negatif (merah) mengikuti grup kolomnya.
 */
export default function PilBentuk({
  label,
  title,
  active,
  disabled = false,
  tone,
  onClick,
}: PilBentukProps) {
  const toneOn =
    tone === "success"
      ? "border-success/30 bg-success-soft text-success"
      : "border-danger/30 bg-danger-soft text-danger";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      title={title}
      className={[
        "inline-flex h-[30px] items-center gap-1 rounded-full border px-2.5",
        "text-[11.5px] font-semibold leading-none transition-all duration-150",
        "active:scale-[0.96]",
        active
          ? toneOn
          : "border-line/[0.14] bg-transparent text-muted hover:border-line/30 hover:text-ink-soft",
        disabled ? "pointer-events-none opacity-30" : "",
      ].join(" ")}
    >
      {active && <AppIcon icon="ph:check" className="text-[11px]" />}
      {label}
    </button>
  );
}
