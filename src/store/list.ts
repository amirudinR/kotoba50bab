import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ColKey = "no" | "kana" | "katakana" | "romaji" | "kanji" | "arti" | "audio";

export type KatakanaMode = "auto" | "kana" | "katakana";

export interface ListState {
  /** Bab yang dibuka (collapsed = false). true = ditutup (collapsed). */
  collapsed: Record<number, boolean>;
  /** Kolom yang aktif (tampilkan). */
  visible: Record<ColKey, boolean>;
  katakanaMode: KatakanaMode;

  toggleBab: (bab: number) => void;
  setBabCollapsed: (bab: number, v: boolean) => void;
  /** Bab yang dipilih pengguna — dipakai untuk "Buka/Tutup terpilih". */
  focusBabs: number[];
  setFocusBabs: (babs: number[]) => void;
  toggleFocusBab: (bab: number) => void;
  expandAll: () => void;
  collapseAll: () => void;
  /** Buka hanya bab yang dipilih, tutup sisanya. */
  expandOnly: (babs: number[]) => void;
  toggleCol: (k: ColKey) => void;
  setCol: (k: ColKey, v: boolean) => void;
  /** Set beberapa kolom sekaligus — dipakai "Buka semua" / "Tutup semua". */
  setCols: (keys: ColKey[], v: boolean) => void;
  showAllCols: () => void;
  resetCols: () => void;
  setKatakanaMode: (m: KatakanaMode) => void;

  // —— pencarian & filter ——
  query: string;
  onlyWithKanji: boolean;
  sortBy: "bab" | "romaji";
  setQuery: (q: string) => void;
  toggleOnlyKanji: () => void;
  setSortBy: (s: "bab" | "romaji") => void;
  clearFilters: () => void;
}

const COL_ALL: Record<ColKey, boolean> = {
  no: true,
  kana: true,
  katakana: true,
  romaji: true,
  kanji: true,
  arti: true,
  audio: true,
};

const COL_DEFAULT: Record<ColKey, boolean> = {
  no: true,
  kana: true,
  katakana: false,
  romaji: true,
  kanji: true,
  arti: true,
  audio: true,
};

export function toKatakana(s: string): string {
  if (!s) return s;
  let out = "";
  for (const ch of s) {
    const c = ch.codePointAt(0);
    if (c && c >= 0x3041 && c <= 0x309f) {
      out += String.fromCodePoint(c + 0x60);
    } else {
      out += ch;
    }
  }
  return out;
}

export function maybeKatakana(s: string, mode: KatakanaMode): string {
  if (mode === "katakana") return toKatakana(s);
  if (mode === "kana") return s;
  // auto: jika sebagian besar katakana, tampilkan katakana; else kana
  let k = 0;
  let t = 0;
  for (const ch of s) {
    const c = ch.codePointAt(0);
    if (!c) continue;
    if (c >= 0x30a1 && c <= 0x30ff) k++;
    if (c >= 0x3041 && c <= 0x309f) t++;
  }
  if (k > t) return toKatakana(s);
  return s;
}

const COLLAPSED_ALL: Record<number, boolean> = Object.fromEntries(
  Array.from({ length: 50 }, (_, i) => [i + 1, true]),
);

export const useList = create<ListState>()(
  persist(
    (set) => ({
      // Default semua bab tertutup: halaman List jadi instan (tidak perlu
      // mengunduh 50 chunk data), dan bab yang dibuka dimuat saat itu juga.
      collapsed: { ...COLLAPSED_ALL },
      focusBabs: [],
      visible: { ...COL_DEFAULT },
      katakanaMode: "auto",

      toggleBab: (bab) =>
        set((s) => ({ collapsed: { ...s.collapsed, [bab]: !s.collapsed[bab] } })),
      setBabCollapsed: (bab, v) =>
        set((s) => ({ collapsed: { ...s.collapsed, [bab]: v } })),
      setFocusBabs: (babs) => set({ focusBabs: babs }),
      toggleFocusBab: (bab) =>
        set((s) => ({
          focusBabs: s.focusBabs.includes(bab)
            ? s.focusBabs.filter((x) => x !== bab)
            : [...s.focusBabs, bab].sort((x, y) => x - y),
        })),
      expandAll: () => set({ collapsed: {} }),
      expandOnly: (babs) => {
        const pick = new Set(babs);
        const c: Record<number, boolean> = {};
        for (let i = 1; i <= 50; i++) c[i] = !pick.has(i);
        set({ collapsed: c, focusBabs: babs });
      },
      collapseAll: () => {
        const c: Record<number, boolean> = {};
        for (let i = 1; i <= 50; i++) c[i] = true;
        set({ collapsed: c });
      },
      toggleCol: (k) =>
        set((s) => ({ visible: { ...s.visible, [k]: !s.visible[k] } })),
      setCol: (k, v) => set((s) => ({ visible: { ...s.visible, [k]: v } })),
      setCols: (keys, v) =>
        set((s) => {
          const visible = { ...s.visible };
          for (const k of keys) visible[k] = v;
          return { visible };
        }),
      showAllCols: () => set({ visible: { ...COL_ALL } }),
      resetCols: () => set({ visible: { ...COL_DEFAULT } }),
      setKatakanaMode: (m) => set({ katakanaMode: m }),

      query: "",
      onlyWithKanji: false,
      sortBy: "bab",
      setQuery: (q) => set({ query: q }),
      toggleOnlyKanji: () => set((s) => ({ onlyWithKanji: !s.onlyWithKanji })),
      setSortBy: (sortBy) => set({ sortBy }),
      clearFilters: () =>
        set({ query: "", onlyWithKanji: false, sortBy: "bab" }),
    }),
    { name: "kotoba-list" },
  ),
);
