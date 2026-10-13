import { create } from "zustand";
import { persist } from "zustand/middleware";

/* ============================================================
   Visibilitas kolom tabel halaman "bentuk".

   Dipakai oleh KataSifatBentuk (kolom: posKini, posLampau, negKini,
   negLampau) dan KataKerjaTe (kolom: kamus, te). Pengguna bisa
   menyembunyikan/menampilkan kolom lewat chip di atas tabel.

   Disimpan per "tabel" (id) di localStorage.
   ============================================================ */

export type BentukColKey = "posKini" | "posLampau" | "negKini" | "negLampau" | "kamus" | "te";

interface ColVisState {
  /** id tabel -> (colKey -> tampil?). Kolom yang tidak tercatat = tampil. */
  hidden: Record<string, Record<string, boolean>>;
  /** Balik tampil/sembunyi satu kolom. */
  toggle: (tableId: string, colKey: string) => void;
  /** Set beberapa kolom sekaligus (mis. tombol "Tampilkan semua"). */
  setMany: (tableId: string, colKeys: string[], visible: boolean) => void;
}

export const useColVis = create<ColVisState>()(
  persist(
    (set) => ({
      hidden: {},
      toggle: (tableId, colKey) =>
        set((s) => {
          const cur = s.hidden[tableId]?.[colKey] ?? false;
          return {
            hidden: {
              ...s.hidden,
              [tableId]: { ...(s.hidden[tableId] ?? {}), [colKey]: !cur },
            },
          };
        }),
      setMany: (tableId, colKeys, visible) =>
        set((s) => {
          const next = { ...(s.hidden[tableId] ?? {}) };
          for (const k of colKeys) next[k] = !visible;
          return { hidden: { ...s.hidden, [tableId]: next } };
        }),
    }),
    { name: "kotoba-colvis" },
  ),
);

/** Apakah kolom tampil? Kolom yang belum pernah diubah dianggap tampil. */
export function isVisible(
  hiddenMap: Record<string, boolean> | undefined,
  colKey: string,
): boolean {
  return !(hiddenMap?.[colKey] ?? false);
}
