import { useEffect } from "react";

interface Options {
  /** Sudah menjawab soal saat ini? */
  answered: boolean;
  /** Jawaban benar? hanya `true` yang memicu auto-lanjut. */
  correct: boolean;
  /** Indeks soal saat ini. */
  qi: number;
  /** Total soal. */
  total: number;
  /** Dipanggil untuk pindah ke soal berikutnya (soal non-terakhir). */
  onNext: () => void;
  /** Dipanggil saat soal TERAKHIR benar (setelah delay) — mis. tampilkan hasil. */
  onFinish: () => void;
  /** Delay sebelum auto-lanjut (ms). Default 1000. */
  delay?: number;
}

/**
 * Auto-lanjut HANYA saat jawaban benar, setelah delay pendek (~1 dtk).
 * - Soal non-terakhir → `onNext()`.
 * - Soal terakhir → `onFinish()` (feedback sempat tampil dulu).
 * Jawaban salah TIDAK memicu apa pun (tetap manual).
 *
 * Timer dibersihkan otomatis kalau `answered`/`correct`/`qi` berubah —
 * mencegah lompat dua soal.
 */
export function useAutoAdvance({
  answered,
  correct,
  qi,
  total,
  onNext,
  onFinish,
  delay = 1000,
}: Options) {
  useEffect(() => {
    if (!answered || !correct) return;
    const isLastQ = qi >= total - 1;
    const t = setTimeout(() => {
      if (isLastQ) onFinish();
      else onNext();
    }, delay);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answered, correct, qi, total, delay]);
}
