import { useEffect, useMemo, useState } from "react";
import type { Bab, Kotoba, KotobaWithBab } from "../types";
import indexRaw from "./index.json";

/* ------------------------------------------------------------------ *
 * Pemuatan data.
 *
 * Data penuh 2.910 entri terlalu besar untuk dikirim di bundle awal,
 * jadi dipecah:
 *   - index.json   metadata 50 bab, muat saat start
 *   - search.json  seluruh entri TANPA romaji, hanya untuk pencarian
 *   - bab/NN.json  satu bab penuh, dimuat saat bab itu dibuka
 *
 * `index.json` & `search.json` di-import statis (kecil), sedangkan
 * per-bab di-`import()` dinamis supaya tidak ikut di bundle awal.
 * ------------------------------------------------------------------ */

const index = indexRaw as { bab: number; count: number }[];

export interface BabMeta {
  bab: number;
  count: number;
}

/** Metadata semua bab — selalu tersedia, tanpa async. */
export const BABS_META: BabMeta[] = index.map((b) => ({
  bab: b.bab,
  count: b.count,
}));

export const TOTAL_KOTOBA = BABS_META.reduce((n, b) => n + b.count, 0);

/* ---------- Pencarian ---------- */

export interface SearchEntry {
  bab: number;
  no: number;
  kana: string;
  kanji: string;
  arti: string;
}

const normalizeQuery = (s: string) =>
  s
    .toLowerCase()
    .replace(/[。、．，,.\s～〜~()（）【】\[\]"'`!?！？:：;；…]/g, "")
    .trim();

function filterEntries(
  entries: SearchEntry[],
  q: string,
  limit: number
): SearchEntry[] {
  const query = normalizeQuery(q);
  if (!query) return [];
  const out: SearchEntry[] = [];
  for (const e of entries) {
    if (
      e.kana.toLowerCase().includes(query) ||
      e.kanji.toLowerCase().includes(query) ||
      e.arti.toLowerCase().includes(query)
    ) {
      out.push(e);
      if (out.length >= limit) break;
    }
  }
  return out;
}

let searchPromise: Promise<SearchEntry[]> | null = null;

/** Muat search index sekali lalu pakai lagi (cache di level modul). */
function loadSearchIndex(): Promise<SearchEntry[]> {
  if (!searchPromise) {
    searchPromise = fetch(searchUrl).then((r) => {
      if (!r.ok) throw new Error("Gagal memuat index pencarian");
      return r.json() as Promise<SearchEntry[]>;
    });
  }
  return searchPromise;
}

export const SEARCH_LIMIT = 120;

/**
 * Pencarian lintas seluruh 2.910 kata. `search.json` sengaja TIDAK di-import
 * statis — hanya diambil saat halaman Search benar-benar dibuka, supaya bundle
 * awal tetap kecil.
 */
export function useSearchIndex(): {
  query: string;
  setQuery: (q: string) => void;
  results: SearchEntry[];
  loading: boolean;
} {
  const [query, setQuery] = useState("");
  const [entries, setEntries] = useState<SearchEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    loadSearchIndex()
      .then((data) => {
        if (!alive) return;
        setEntries(data);
        setLoading(false);
      })
      .catch(() => {
        if (!alive) return;
        setEntries([]);
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const results = useMemo(
    () => filterEntries(entries, query, SEARCH_LIMIT),
    [entries, query],
  );

  return { query, setQuery, results, loading };
}

/* ---------- Lazy load per bab ---------- */

const cache = new Map<number, Bab>();

export function getBabCached(bab: number): Bab | undefined {
  return cache.get(bab);
}

/**
 * Peta URL chunk per bab. `?url` membuat Vite memindahkan tiap JSON menjadi
 * file `.json` tersendiri (bukan jadi potongan JS), sehingga bisa di-fetch
 * saat dibutuhkan dan dikecualikan dari precache service worker.
 */
const babUrls = import.meta.glob("./bab/*.json", {
  query: "?url",
  import: "default",
  eager: true,
}) as Record<string, string>;

const searchUrl = babUrlOf("./search.json");

function babUrlOf(key: string): string {
  return (import.meta.glob("./search.json", {
    query: "?url",
    import: "default",
    eager: true,
  }) as Record<string, string>)[key];
}

async function fetchBab(bab: number): Promise<Bab> {
  const hit = cache.get(bab);
  if (hit) return hit;
  const url = babUrls[`./bab/${String(bab).padStart(2, "0")}.json`];
  if (!url) throw new Error(`Data bab ${bab} tidak ditemukan`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Gagal memuat bab ${bab}`);
  const data = (await res.json()) as Bab;
  cache.set(bab, data);
  return data;
}

/**
 * Muat isi satu bab. `enabled` bernilai `false` berarti jangan unduh dulu —
 * dipakai List supaya 50 chunk tidak ikut terunduh hanya karena tabelnya
 * sedang tertutup.
 */
export function useBab(
  bab: number,
  enabled = true,
): { items: Kotoba[]; loading: boolean } {
  const [items, setItems] = useState<Kotoba[]>(() => {
    return cache.get(bab)?.items ?? [];
  });
  const [loading, setLoading] = useState(() => enabled && !cache.has(bab));

  useEffect(() => {
    let alive = true;
    const hit = cache.get(bab);
    if (hit) {
      setItems(hit.items);
      setLoading(false);
      return;
    }
    if (!enabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchBab(bab)
      .then((data) => {
        if (!alive) return;
        setItems(data.items);
        setLoading(false);
      })
      .catch(() => {
        if (!alive) return;
        setItems([]);
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [bab, enabled]);

  return { items, loading };
}

/**
 * Muat beberapa bab sekaligus dan gabungkan. Dipakai Home (untuk menghitung
 * hafalan per bab terpilih) dan App (untuk pool latihan).
 */
export function useKotobaByBabs(babList: number[]): {
  pool: KotobaWithBab[];
  loading: boolean;
} {
  const key = babList.join(",");
  const [pool, setPool] = useState<KotobaWithBab[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    const list = key ? key.split(",").map(Number) : [];
    if (list.length === 0) {
      setPool([]);
      setLoading(false);
      return;
    }

    const missing = list.filter((b) => !cache.has(b));
    if (missing.length === 0) {
      setPool(flatten(list));
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all(missing.map(fetchBab))
      .then(() => {
        if (!alive) return;
        setPool(flatten(list));
        setLoading(false);
      })
      .catch(() => {
        if (!alive) return;
        setPool(flatten(list));
        setLoading(false);
      });

    function flatten(list: number[]): KotobaWithBab[] {
      return list.flatMap((b) =>
        (cache.get(b)?.items ?? []).map((it) => ({ ...it, bab: b })),
      );
    }

    return () => {
      alive = false;
    };
  }, [key]);

  return { pool, loading };
}

/**
 * Muat seluruh data. Ini berat — hanya untuk halaman yang memang
 * butuh semua kata sekaligus (mis. kuis yang mengambil pengecoh
 * dari seluruh bank kata).
 */
export function useAllKotoba(): {
  all: KotobaWithBab[];
  loading: boolean;
} {
  const [all, setAll] = useState<KotobaWithBab[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const numbers = BABS_META.map((b) => b.bab);
    Promise.all(numbers.map(fetchBab))
      .then(() => {
        if (!alive) return;
        setAll(
          numbers.flatMap((b) =>
            (cache.get(b)?.items ?? []).map((it) => ({ ...it, bab: b })),
          ),
        );
        setLoading(false);
      })
      .catch(() => {
        if (!alive) return;
        setAll([]);
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return { all, loading };
}
