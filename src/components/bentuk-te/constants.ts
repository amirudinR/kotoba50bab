import type { DoushiKind } from "../../data/doushi";
import type { DoushiTe } from "../../data/doushi_te";
import { DOUSHI_TE_COUNT } from "../../data/doushi_te";

/* ============================================================
   Konstanta & tipe untuk halaman "Bentuk て".

   Dipisah dari halaman supaya page tinggal berisi orkestrasi state
   dan tiap bagian UI (toolbar, tabel per bab) punya file sendiri.
   ============================================================ */

export type FilterKind = "semua" | "1" | "2" | "3";

export const FILTER_OPTIONS = [
  { value: "semua" as const, label: `Semua (${DOUSHI_TE_COUNT.total})`, short: "Semua" },
  { value: "1" as const, label: `Gol 1 · ${DOUSHI_TE_COUNT.g1}`, short: "1" },
  { value: "2" as const, label: `Gol 2 · ${DOUSHI_TE_COUNT.g2}`, short: "2" },
  { value: "3" as const, label: `Gol 3 · ${DOUSHI_TE_COUNT.g3}`, short: "3" },
];

/** Baris aturan て-form per akhiran kamus (kartu bantu menghafal). */
export const ATURAN: { title: string; jp: string; rows: [string, string, string][] }[] = [
  {
    title: "Golongan 1",
    jp: "五段 (godan)",
    rows: [
      ["う・つ・る", "って", "かう → かって"],
      ["む・ぶ・ぬ", "んで", "のむ → のんで"],
      ["く", "いて", "かく → かいて"],
      ["ぐ", "いで", "およぐ → およいで"],
      ["す", "して", "はなす → はなして"],
    ],
  },
  {
    title: "Golongan 2",
    jp: "一段 (ichidan)",
    rows: [["る", "て", "たべる → たべて"]],
  },
  {
    title: "Golongan 3",
    jp: "不規則 (fukisoku)",
    rows: [
      ["する", "して", "べんきょうする → して"],
      ["くる", "きて", "くる → きて"],
    ],
  },
];

export const KIND_TONE: Record<DoushiKind, string> = {
  1: "bg-ink/[0.08] text-ink-soft",
  2: "bg-accent-soft text-accent",
  3: "bg-seal/10 text-seal",
};

export const KIND_DESC: Record<FilterKind, string> = {
  semua: "Semua kata kerja — て-form dibentuk dari bentuk kamus.",
  "1": "Golongan 1 (五段): perubahan akhiran mengikuti baris kana.",
  "2": "Golongan 2 (一段): cukup buang る lalu tambah て.",
  "3": "Golongan 3 (不規則): hanya する → して dan くる → きて.",
};

/** Lebar default kolom (px) — bisa diubah pengguna lewat drag (disimpan di localStorage). */
export const WIDTH = { no: 44, kata: 170, arti: 220, kamus: 148, te: 148 } as const;

export type ColKeyTe = keyof typeof WIDTH;

/** Id tabel untuk menyimpan lebar kolom di localStorage. */
export const TABLE_ID = "te";

/** 2 tombol chip untuk menyembunyikan/menampilkan kolom bentuk kata kerja. */
export const BENTUK_TOGGLES: { key: ColKeyTe; label: string }[] = [
  { key: "kamus", label: "Kamus" },
  { key: "te", label: "て" },
];

/** Pencocokan kata kerja dengan query (ます/kamus/て/kanji/arti/romaji). */
export function matches(d: DoushiTe, q: string): boolean {
  if (!q) return true;
  const n = q.toLowerCase().trim();
  return (
    d.kana.toLowerCase().includes(n) ||
    d.kamus.toLowerCase().includes(n) ||
    d.te.toLowerCase().includes(n) ||
    d.kanji.toLowerCase().includes(n) ||
    d.arti.toLowerCase().includes(n) ||
    d.romaji.toLowerCase().includes(n)
  );
}
