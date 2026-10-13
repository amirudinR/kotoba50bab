import { create } from "zustand";
import { persist } from "zustand/middleware";

/* ============================================================
   Lebar kolom tabel yang bisa di-resize pengguna.

   Disimpan per "tabel" (id), mis. "list", "bentuk-sifat", "te".
   Setiap tabel menyimpan peta colKey -> lebar px. Nilai default
   disediakan oleh pemanggil; store hanya menampung override
   (kolom yang belum pernah diubah tidak disimpan).
   ============================================================ */

/** Lebar minimum supaya teks tetap terbaca & handle masih bisa digenggam. */
export const MIN_COL_WIDTH = 56;

interface ColWidthState {
  /** id tabel -> (colKey -> lebar px). */
  widths: Record<string, Record<string, number>>;
  setWidth: (tableId: string, colKey: string, px: number) => void;
  resetTable: (tableId: string) => void;
}

export const useColWidths = create<ColWidthState>()(
  persist(
    (set) => ({
      widths: {},
      setWidth: (tableId, colKey, px) =>
        set((s) => ({
          widths: {
            ...s.widths,
            [tableId]: {
              ...(s.widths[tableId] ?? {}),
              [colKey]: Math.max(MIN_COL_WIDTH, Math.round(px)),
            },
          },
        })),
      resetTable: (tableId) =>
        set((s) => {
          const next = { ...s.widths };
          delete next[tableId];
          return { widths: next };
        }),
    }),
    { name: "kotoba-colwidths" },
  ),
);

/** Ambil lebar efektif: override bila ada, kalau tidak pakai default. */
export function pickWidth(
  overrides: Record<string, number> | undefined,
  colKey: string,
  fallback: number,
): number {
  const v = overrides?.[colKey];
  return typeof v === "number" ? v : fallback;
}
