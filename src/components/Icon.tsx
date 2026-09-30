import { Icon } from "@iconify/react";

/**
 * Nama ikon yang dipakai di aplikasi ini.
 *
 * Format: `ph:<nama>`. Collection Phosphor (`@iconify-json/ph`) di-bundle
 * lokal, jadi ikon tetap tampil tanpa koneksi internet.
 *
 * Tipe sengaja `string` (bukan union literal) supaya kolom ikon pada
 * array data — mis. daftar mode di Home — tidak perlu `as const`
 * di setiap tempat.
 */
export type IconName = `ph:${string}`;

interface Props {
  icon: IconName;
  className?: string;
  /** Aria-label; kalau diisi, ikon dibungkus span berlabel. */
  label?: string;
}

/**
 * Wrapper tipis di atas Iconify. Karena collection di-bundle lokal,
 * ikon tetap tampil tanpa koneksi internet.
 */
export default function AppIcon({ icon, className = "", label }: Props) {
  const el = <Icon icon={icon} className={className} aria-hidden={!label} />;
  if (!label) return el;
  return (
    <span role="img" aria-label={label} className="inline-flex">
      {el}
    </span>
  );
}
