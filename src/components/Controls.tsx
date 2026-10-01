import type { ReactNode } from "react";
import AppIcon from "./Icon";
import type { IconName } from "./Icon";

/* ============================================================
   Kontrol tampilan bersama (chip toggle & segmented control).

   Dipakai di Halaman List untuk kolom & format kana. Dipisah agar
   state aktif/pasif konsisten di seluruh aplikasi dan tidak
  depending pada warna saja (aktif juga pakai font.bold + centang).
   ============================================================ */

interface ChipProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  icon?: IconName;
  title?: string;
  /** Label yang dibaca screen reader bila children bukan teks. */
  srLabel?: string;
  className?: string;
}

export function Chip({
  active,
  onClick,
  children,
  icon,
  title,
  srLabel,
  className = "",
}: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={title}
      className={["k-chip", active ? "k-chip-on" : "k-chip-off", className].join(" ")}
    >
      {active ? (
        <AppIcon icon="ph:check" className="text-[12px]" />
      ) : icon ? (
        <AppIcon icon={icon} className="text-[13px] opacity-80" />
      ) : null}
      {srLabel ? <span className="sr-only">{srLabel}</span> : children}
    </button>
  );
}

interface SegmentOption<T extends string> {
  value: T;
  label: string;
  /** Label panjang untuk layar sangat kecil; default = label. */
  short?: string;
  title?: string;
}

interface SegmentedProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className = "",
}: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      className={["k-seg", className].join(" ")}
      onKeyDown={(e) => {
        // Panah kiri/kanan pindah pilihan — navigasi keyboard untuk radiogroup.
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        e.preventDefault();
        const i = options.findIndex((o) => o.value === value);
        const next =
          e.key === "ArrowRight"
            ? (i + 1) % options.length
            : (i - 1 + options.length) % options.length;
        onChange(options[next].value);
      }}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            title={o.title}
            onClick={() => onChange(o.value)}
            className={["k-seg-item", active ? "k-seg-on" : ""].join(" ")}
          >
            <span className="hidden sm:inline">{o.label}</span>
            <span className="sm:hidden">{o.short ?? o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
