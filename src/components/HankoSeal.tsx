import type { ReactNode } from "react";

interface HankoSealProps {
  /** Kanji/character di dalam cap. */
  mark?: string;
  /** Ukuran cap. */
  size?: "sm" | "md" | "lg";
  /** Tampilkan animasi "membekas" saat mount. */
  stamp?: boolean;
  className?: string;
  children?: ReactNode;
}

const SIZES = {
  sm: { box: "h-7 w-7", text: "text-[13px]", ring: "inset-[1.5px]" },
  md: { box: "h-12 w-12", text: "text-2xl", ring: "inset-[2.5px]" },
  lg: { box: "h-20 w-20", text: "text-4xl", ring: "inset-[4px]" },
};

/**
 * HankoSeal — cap/segel merah ala Jepang (印章).
 *
 * Elemen signature aplikasi ini: kata-kata dihafal lalu "disegel"
 * dengan stempel tinta merah (朱肉). Dipakai sebagai penanda
 * "sudah dikuasai" sekaligus ornamen visual.
 *
 * Bentuk digambar dengan CSS, bukan glyph font, sehingga konsisten
 * di semua perangkat.
 */
export default function HankoSeal({
  mark = "言",
  size = "md",
  stamp = false,
  className = "",
  children,
}: HankoSealProps) {
  const s = SIZES[size];
  return (
    <span
      className={[
        "relative inline-grid place-items-center rounded-[28%] bg-seal text-white select-none",
        "shadow-seal",
        s.box,
        stamp ? "animate-stamp-in" : "",
        className,
      ].join(" ")}
    >
      {/* cincin dalam — meniru garis tepi hanko sungguhan */}
      <span
        className={`pointer-events-none absolute rounded-[24%] border border-white/45 ${s.ring}`}
      />
      {children ?? (
        <span
          className={`font-display font-semibold leading-none ${s.text}`}
          aria-hidden
        >
          {mark}
        </span>
      )}
    </span>
  );
}
