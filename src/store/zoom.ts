import { create } from "zustand";
import { persist } from "zustand/middleware";

/* ============================================================
   Zoom (skala tampilan) aplikasi.

   7 langkah tetap. Skala diterapkan ke <html> lewat properti CSS
   `zoom` supaya SEMUA ukuran (px maupun rem) ikut membesar —
   banyak elemen di app ini memakai px absolut, jadi mengubah
   root font-size saja tidak cukup.

   Disimpan di localStorage key `kotoba-zoom`.
   ============================================================ */

/** Langkah zoom (persen) yang tersedia. */
export const ZOOM_STEPS = [75, 85, 100, 115, 130, 150, 175] as const;

export type ZoomStep = (typeof ZOOM_STEPS)[number];

export const DEFAULT_ZOOM: ZoomStep = 100;

/** Batas indeks supaya aman saat nilai tersimpan tidak dikenal. */
function nearestIndex(pct: number): number {
  let best = 0;
  let bestDiff = Infinity;
  ZOOM_STEPS.forEach((v, i) => {
    const d = Math.abs(v - pct);
    if (d < bestDiff) {
      bestDiff = d;
      best = i;
    }
  });
  return best;
}

/** Terapkan skala ke <html>. 100% = tanpa zoom (properti dibuang). */
export function applyZoom(pct: number) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (pct === 100) root.style.removeProperty("zoom");
  else root.style.setProperty("zoom", String(pct / 100));
}

interface ZoomState {
  /** Skala aktif dalam persen (salah satu ZOOM_STEPS). */
  pct: ZoomStep;
  /** Perbesar satu langkah (berhenti di maksimum). */
  zoomIn: () => void;
  /** Perkecil satu langkah (berhenti di minimum). */
  zoomOut: () => void;
  /** Kembalikan ke 100%. */
  resetZoom: () => void;
  /** Set langsung ke nilai tertentu (dibulatkan ke langkah terdekat). */
  setZoom: (pct: number) => void;
}

export const useZoom = create<ZoomState>()(
  persist(
    (set, get) => ({
      pct: DEFAULT_ZOOM,

      zoomIn: () => {
        const i = nearestIndex(get().pct);
        const next = ZOOM_STEPS[Math.min(i + 1, ZOOM_STEPS.length - 1)];
        applyZoom(next);
        set({ pct: next });
      },

      zoomOut: () => {
        const i = nearestIndex(get().pct);
        const next = ZOOM_STEPS[Math.max(i - 1, 0)];
        applyZoom(next);
        set({ pct: next });
      },

      resetZoom: () => {
        applyZoom(DEFAULT_ZOOM);
        set({ pct: DEFAULT_ZOOM });
      },

      setZoom: (pct) => {
        const next = ZOOM_STEPS[nearestIndex(pct)];
        applyZoom(next);
        set({ pct: next });
      },
    }),
    { name: "kotoba-zoom" },
  ),
);

/** Dipanggil sekali saat boot untuk menerapkan skala tersimpan. */
export function initZoom() {
  applyZoom(useZoom.getState().pct);
}
