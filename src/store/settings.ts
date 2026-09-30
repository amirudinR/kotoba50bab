import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ViewMode = "kana-arti" | "arti-kana";

interface SettingsState {
  /** Bab yang sedang dipilih untuk latihan. */
  selectedBabs: number[];
  /** Urutan acak. */
  shuffle: boolean;
  /** Arah kartu/soal: kana->arti atau arti->kana. */
  viewMode: ViewMode;

  setSelectedBabs: (babs: number[]) => void;
  toggleBab: (bab: number) => void;
  selectAll: () => void;
  clearBabs: () => void;
  setShuffle: (v: boolean) => void;
  setViewMode: (v: ViewMode) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set, get) => ({
      selectedBabs: [1],
      shuffle: true,
      viewMode: "kana-arti",

      setSelectedBabs: (babs) => set({ selectedBabs: babs }),
      toggleBab: (bab) => {
        const cur = get().selectedBabs;
        set({
          selectedBabs: cur.includes(bab)
            ? cur.filter((b) => b !== bab)
            : [...cur, bab].sort((a, b) => a - b),
        });
      },
      selectAll: () =>
        set({ selectedBabs: Array.from({ length: 50 }, (_, i) => i + 1) }),
      clearBabs: () => set({ selectedBabs: [] }),
      setShuffle: (v) => set({ shuffle: v }),
      setViewMode: (v) => set({ viewMode: v }),
    }),
    { name: "kotoba-settings" },
  ),
);
