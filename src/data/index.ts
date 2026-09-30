import raw from "./kotoba.json";
import type { Bab, KotobaWithBab } from "../types";

const data = raw as { babs: Bab[] };

export const BABS: Bab[] = data.babs;

/** Semua kosakata digabung, dengan info bab. */
export const ALL_KOTOBA: KotobaWithBab[] = BABS.flatMap((b) =>
  b.items.map((it) => ({ ...it, bab: b.bab })),
);

export const TOTAL_KOTOBA = ALL_KOTOBA.length;

export function getBab(bab: number): Bab | undefined {
  return BABS.find((b) => b.bab === bab);
}

export function getKotobaByBabs(babList: number[]): KotobaWithBab[] {
  const set = new Set(babList);
  return ALL_KOTOBA.filter((k) => set.has(k.bab));
}
