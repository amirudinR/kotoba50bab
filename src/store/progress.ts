import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Kunci unik untuk sebuah kata: bab + nomor. */
export function kataKey(bab: number, no: number): string {
  return `${bab}-${no}`;
}

export interface QuizStat {
  benar: number;
  salah: number;
}

interface ProgressState {
  /** Set kata yang sudah ditandai hafal (disimpan sebagai array agar bisa di-serialize). */
  hafal: string[];
  /** Statistik jawaban per kata. */
  stats: Record<string, QuizStat>;

  toggleHafal: (bab: number, no: number) => void;
  isHafal: (bab: number, no: number) => boolean;
  recordAnswer: (bab: number, no: number, benar: boolean) => void;
  resetProgress: () => void;
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      hafal: [],
      stats: {},

      toggleHafal: (bab, no) => {
        const key = kataKey(bab, no);
        const cur = get().hafal;
        set({
          hafal: cur.includes(key)
            ? cur.filter((k) => k !== key)
            : [...cur, key],
        });
      },

      isHafal: (bab, no) => get().hafal.includes(kataKey(bab, no)),

      recordAnswer: (bab, no, benar) => {
        const key = kataKey(bab, no);
        const prev = get().stats[key] ?? { benar: 0, salah: 0 };
        set({
          stats: {
            ...get().stats,
            [key]: {
              benar: prev.benar + (benar ? 1 : 0),
              salah: prev.salah + (benar ? 0 : 1),
            },
          },
        });
      },

      resetProgress: () => set({ hafal: [], stats: {} }),
    }),
    { name: "kotoba-progress" },
  ),
);
