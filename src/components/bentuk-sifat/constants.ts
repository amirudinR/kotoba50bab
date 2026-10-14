import {
  KEIYOUSHI_BENTUK_COUNT,
  type KeiyoushiBentuk,
} from "../../data/keiyoushi_konjugasi";

/* ============================================================
   Konstanta & tipe untuk halaman "Bentuk Kata Sifat".

   Dipisah dari halaman supaya page tinggal berisi orkestrasi state
   dan tiap bagian UI (toolbar, tabel per bab) punya file sendiri.
   ============================================================ */

export type FilterKind = "semua" | "na" | "i";

export const FILTER_OPTIONS = [
  { value: "semua" as const, label: `Semua (${KEIYOUSHI_BENTUK_COUNT.total})`, short: "Semua" },
  { value: "na" as const, label: `な (${KEIYOUSHI_BENTUK_COUNT.na})`, short: "な" },
  { value: "i" as const, label: `い (${KEIYOUSHI_BENTUK_COUNT.i})`, short: "い" },
];

export const FILTER_DESC: Record<FilterKind, string> = {
  semua: "Kata sifat な dan い — kolom positif di kiri, negatif di kanan.",
  na: "Kata sifat な — menerangkan kata benda dengan な (げんきな人).",
  i: "Kata sifat い — berakhiran い dan berubah sendiri tanpa だ.",
};

/** Lebar default kolom (px). Bisa diubah pengguna lewat drag (disimpan di localStorage). */
export const WIDTH = {
  no: 44,
  kata: 150,
  arti: 200,
  kasPosKini: 118,
  kasPosLampau: 132,
  kasNegKini: 138,
  kasNegLampau: 156,
  forPosKini: 118,
  forPosLampau: 132,
  forNegKini: 148,
  forNegLampau: 166,
  forNeg2Kini: 168,
  forNeg2Lampau: 210,
  forNeg3Kini: 178,
  forNeg3Lampau: 220,
} as const;

export type ColKeyBentuk = keyof typeof WIDTH;

/** Id tabel untuk menyimpan lebar kolom di localStorage. */
export const TABLE_ID = "bentuk-sifat";

/** Nama grup untuk header gabungan. `null` = kolom dasar (No/Kata/Arti). */
export type GrupBentuk =
  | "kasual-positif"
  | "kasual-negatif"
  | "formal-positif"
  | "formal-negatif";

/** Kolom tabel bentuk lengkap — urutan, label, grup, & pengambilan nilai. */
export interface BentukColDef {
  key: ColKeyBentuk;
  /** Label baris-2 (sub-header). Kosong = kolom dasar (No/Kata/Arti). */
  sub: string;
  /** Grup untuk header gabungan; null = kolom dasar. */
  group: GrupBentuk | null;
  /** Nilai teks untuk sel body; null = kolom dasar (khusus). */
  nilai: ((k: KeiyoushiBentuk) => string) | null;
  /** Kolom variasi negatif sopan (na-adj: じゃ/ではありません; i-adj: 〜くありません): hanya dirender saat gaya = "formal". */
  khususFormal?: boolean;
}

export const BENTUK_COLS: BentukColDef[] = [
  { key: "no", sub: "", group: null, nilai: null },
  { key: "kata", sub: "", group: null, nilai: null },
  { key: "arti", sub: "", group: null, nilai: null },
  { key: "kasPosKini", sub: "Kini", group: "kasual-positif", nilai: (k) => k.positifKini },
  { key: "kasPosLampau", sub: "Lampau", group: "kasual-positif", nilai: (k) => k.positifLampau },
  { key: "kasNegKini", sub: "Kini", group: "kasual-negatif", nilai: (k) => k.negatifKini },
  { key: "kasNegLampau", sub: "Lampau", group: "kasual-negatif", nilai: (k) => k.negatifLampau },
  { key: "forPosKini", sub: "Kini", group: "formal-positif", nilai: (k) => k.formalPositifKini },
  { key: "forPosLampau", sub: "Lampau", group: "formal-positif", nilai: (k) => k.formalPositifLampau },
  { key: "forNegKini", sub: "Kini", group: "formal-negatif", nilai: (k) => k.formalNegatifKini },
  { key: "forNegLampau", sub: "Lampau", group: "formal-negatif", nilai: (k) => k.formalNegatifLampau },
  { key: "forNeg2Kini", sub: "Kini", group: "formal-negatif", nilai: (k) => k.formalNegatif2Kini, khususFormal: true },
  { key: "forNeg2Lampau", sub: "Lampau", group: "formal-negatif", nilai: (k) => k.formalNegatif2Lampau, khususFormal: true },
  { key: "forNeg3Kini", sub: "Kini", group: "formal-negatif", nilai: (k) => k.formalNegatif3Kini, khususFormal: true },
  { key: "forNeg3Lampau", sub: "Lampau", group: "formal-negatif", nilai: (k) => k.formalNegatif3Lampau, khususFormal: true },
];

/** Info grup: urutan, label, & tone warna (untuk header gabungan). */
export const GRUP_INFO: { id: GrupBentuk; label: string; tone: "success" | "danger" }[] = [
  { id: "kasual-positif", label: "Kasual · Positif (普通形 肯定)", tone: "success" },
  { id: "kasual-negatif", label: "Kasual · Negatif (普通形 否定)", tone: "danger" },
  { id: "formal-positif", label: "Formal · Positif (丁寧形 肯定)", tone: "success" },
  { id: "formal-negatif", label: "Formal · Negatif (丁寧形 否定)", tone: "danger" },
];

/** Gaya bentuk: tampilkan semua, hanya kasual, atau hanya formal. */
export type GayaBentuk = "semua" | "kasual" | "formal";

export const GAYA_OPTIONS: { value: GayaBentuk; label: string; short: string }[] = [
  { value: "semua", label: "Semua", short: "Semua" },
  { value: "kasual", label: "Kasual (普通形)", short: "Kasual" },
  { value: "formal", label: "Formal (丁寧形)", short: "Formal" },
];

/**
 * Tombol pil untuk menyembunyikan/menampilkan kolom bentuk (satu per kolom).
 * - `label` = teks ringkas di pil; `full` = tooltip lengkap.
 * - `gaya` = "kasual" | "formal"; pil dengan gaya di luar gaya aktif dinonaktifkan.
 * - `khususFormal: true` = pil negatif sopan (じゃ/ではありません atau 〜くありません); HANYA dirender saat gaya = "formal".
 */
export const BENTUK_TOGGLES: {
  key: ColKeyBentuk;
  label: string;
  full: string;
  gaya: "kasual" | "formal";
  khususFormal?: boolean;
}[] = [
  { key: "kasPosKini", label: "+ kini", full: "Kasual positif kini", gaya: "kasual" },
  { key: "kasPosLampau", label: "+ lampau", full: "Kasual positif lampau", gaya: "kasual" },
  { key: "kasNegKini", label: "− kini", full: "Kasual negatif kini", gaya: "kasual" },
  { key: "kasNegLampau", label: "− lampau", full: "Kasual negatif lampau", gaya: "kasual" },
  { key: "forPosKini", label: "+ kini", full: "Formal positif kini (です)", gaya: "formal" },
  { key: "forPosLampau", label: "+ lampau", full: "Formal positif lampau (でした)", gaya: "formal" },
  { key: "forNegKini", label: "− kini", full: "Formal negatif kini (じゃないです)", gaya: "formal" },
  { key: "forNegLampau", label: "− lampau", full: "Formal negatif lampau (じゃなかったです)", gaya: "formal" },
  { key: "forNeg2Kini", label: "じゃ/くありません", full: "Negatif sopan kini — na-adj: じゃありません, i-adj: 〜くありません", gaya: "formal", khususFormal: true },
  { key: "forNeg2Lampau", label: "じゃ/くありませんでした", full: "Negatif sopan lampau — na-adj: じゃありませんでした, i-adj: 〜くありませんでした", gaya: "formal", khususFormal: true },
  { key: "forNeg3Kini", label: "ではありません", full: "Formal negatif kini (ではありません, na-adj saja)", gaya: "formal", khususFormal: true },
  { key: "forNeg3Lampau", label: "ではありませんでした", full: "Formal negatif lampau (ではありませんでした, na-adj saja)", gaya: "formal", khususFormal: true },
];

/** Pencocokan kata sifat dengan query (kana/kanji/arti/semua bentuk). */
export function matches(k: KeiyoushiBentuk, q: string): boolean {
  if (!q) return true;
  const n = q.toLowerCase().trim();
  return (
    k.kana.toLowerCase().includes(n) ||
    k.kanji.toLowerCase().includes(n) ||
    k.arti.toLowerCase().includes(n) ||
    k.positifKini.toLowerCase().includes(n) ||
    k.positifLampau.toLowerCase().includes(n) ||
    k.negatifKini.toLowerCase().includes(n) ||
    k.negatifLampau.toLowerCase().includes(n) ||
    k.formalPositifKini.toLowerCase().includes(n) ||
    k.formalPositifLampau.toLowerCase().includes(n) ||
    k.formalNegatifKini.toLowerCase().includes(n) ||
    k.formalNegatifLampau.toLowerCase().includes(n) ||
    k.formalNegatif2Kini.toLowerCase().includes(n) ||
    k.formalNegatif3Kini.toLowerCase().includes(n)
  );
}
