import type { KotobaWithBab } from "../types";

/** Fisher-Yates shuffle (mengembalikan array baru). */
export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Ambil n elemen acak dari array. */
export function sampleN<T>(arr: T[], n: number): T[] {
  return shuffleArray(arr).slice(0, n);
}

/** Normalisasi jawaban: buang tanda baca, spasi berlebih, dan lowercase. */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[。、．，,.\s～〜~()（）【】\[\]"'`!?！？:：;；…]/g, "")
    .trim();
}

/** Ambil semua arti valid dari sebuah entri (pisahkan dengan koma/titik). */
export function artiVariants(arti: string): string[] {
  return arti
    .split(/[,，/;；、]|\.\s|\s{2,}/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Cek apakah jawaban user cocok dengan sebuah entri.
 * Ketik arah arti (Indonesia) atau kana/kanji.
 */
export function isAnswerCorrect(
  userInput: string,
  target: KotobaWithBab,
  mode: "kana-arti" | "arti-kana",
): boolean {
  const user = normalize(userInput);
  if (!user) return false;

  if (mode === "kana-arti") {
    // target arti (Indonesia) — cocokkan dengan salah satu varian
    const variants = artiVariants(target.arti);
    return variants.some((v) => {
      const nv = normalize(v);
      return nv.length > 0 && (nv === user || nv.includes(user) || user.includes(nv));
    });
  } else {
    // target kana atau kanji
    const cand = [normalize(target.kana), normalize(target.kanji)].filter(Boolean);
    return cand.some((c) => c === user);
  }
}
