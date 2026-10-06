import { splitKana } from "../lib/jp";

interface Props {
  /** Teks apa saja — Indonesia, kana, kanji, atau campur. */
  text: string;
  className?: string;
}

/**
 * Render teks dengan bagian katakana diberi warna penanda (`text-accent`).
 *
 * Dipakai di halaman yang menampilkan tulisan Jepang — flashcard dan kuis —
 * supaya sabar bisa langsung melihat mana kosakata katakana (アメリカ, ノート)
 * dan mana campuran (けしゴム). Teks tanpa katakana dirender apa adanya,
 * tanpa span tambahan, jadi komponen ini aman dipasang di mana saja.
 *
 * Warna penanda hanya untuk teks besar (≥ 20px): rasio `accent` terhadap
 * `surface` adalah 4.01:1 di mode terang — lolos WCAG AA untuk teks besar
 * (≥ 3:1), bukan AA penuh (4.5:1). Jangan dipakai pada teks kecil.
 */
export default function JpText({ text, className }: Props) {
  const segments = splitKana(text);

  return (
    <span className={className}>
      {segments.map((seg, i) =>
        seg.katakana ? (
          <span key={i} className="text-accent">
            {seg.text}
          </span>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </span>
  );
}