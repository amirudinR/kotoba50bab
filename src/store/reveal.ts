import { create } from "zustand";
import { persist } from "zustand/middleware";

/* ============================================================
   Buka-tutup PER SEL di tabel Daftar Kosakata (mode latihan).

   Tujuan: pengguna bisa meng-klik SATU kotak (mis. kana "うし") sehingga
   HANYA kotak itu yang tertutup — kotak lain di baris & kolom yang sama
   tetap terlihat. Klik lagi untuk membuka.

   Ini berbeda dari:
   - `store/list.ts`  : menyembunyikan SELURUH kolom (semua baris).
   - `BabAccordion`   : menyembunyikan seluruh isi bab.

   Kunci sel: `${bab}-${no}-${col}` (mis. "9-1-kana"). Disimpan di
   localStorage key `kotoba-reveal`.
   ============================================================ */

export type SelCol = "no" | "kana" | "katakana" | "romaji" | "kanji" | "arti";

/** Kunci unik satu sel. */
export function selKey(bab: number, no: number, col: SelCol): string {
  return `${bab}-${no}-${col}`;
}

interface RevealState {
  /** Set kunci sel yang sedang TERTUTUP. */
  hidden: string[];
  /** Balik buka/tutup satu sel. */
  toggleSel: (key: string) => void;
  /** Apakah sel tertutup? */
  isHidden: (key: string) => boolean;
  /** Buka semua sel (tombol "Tampilkan semua"). */
  showAll: () => void;
}

export const useReveal = create<RevealState>()(
  persist(
    (set, get) => ({
      hidden: [],
      toggleSel: (key) =>
        set((s) => ({
          hidden: s.hidden.includes(key)
            ? s.hidden.filter((k) => k !== key)
            : [...s.hidden, key],
        })),
      isHidden: (key) => get().hidden.includes(key),
      showAll: () => set({ hidden: [] }),
    }),
    { name: "kotoba-reveal" },
  ),
);

/** Apakah sel tertentu tertutup? (murni — untuk dipakai di selector). */
export function isSelHidden(hidden: string[], key: string): boolean {
  return hidden.includes(key);
}
