import { useState } from "react";
import { DOUSHI_TE_COUNT } from "../../data/doushi_te";
import { Segmented, Chip } from "../Controls";
import PaperCard from "../PaperCard";
import HankoSeal from "../HankoSeal";
import AppIcon from "../Icon";
import { useColVis, isVisible } from "../../store/colvis";
import { useColWidths } from "../../store/colwidth";
import {
  ATURAN,
  BENTUK_TOGGLES,
  FILTER_OPTIONS,
  KIND_DESC,
  TABLE_ID,
  type FilterKind,
} from "./constants";

interface Props {
  filter: FilterKind;
  onFilter: (f: FilterKind) => void;
  query: string;
  onQuery: (q: string) => void;
  totalTampil: number;
  babCount: number;
  /** Kolom bentuk yang disembunyikan (dari useColVis). */
  hiddenBentuk: Record<string, boolean> | undefined;
}

/**
 * Bagian atas halaman Bentuk て: hero, kartu aturan て-form,
 * kontrol filter & pencarian, dan chip kolom bentuk.
 */
export default function TeToolbar({
  filter,
  onFilter,
  query,
  onQuery,
  totalTampil,
  babCount,
  hiddenBentuk,
}: Props) {
  const [showRules, setShowRules] = useState(true);
  const toggleCol = useColVis((s) => s.toggle);
  const setManyCols = useColVis((s) => s.setMany);
  const semuaTampil = BENTUK_TOGGLES.every((t) => isVisible(hiddenBentuk, t.key));

  return (
    <>
      {/* —— Hero ringkas —— */}
      <PaperCard raised tape className="k-margin overflow-hidden pl-10 pr-5 py-5">
        <div className="flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="k-eyebrow">Doushi · て形 (te-form)</p>
            <div className="mt-1.5 flex items-baseline gap-2.5">
              <h2 className="font-display text-4xl leading-none text-ink">動詞</h2>
              <span className="k-num font-mono text-sm text-muted">
                {DOUSHI_TE_COUNT.total} kata
              </span>
            </div>
            <p className="mt-2 text-[14px] leading-relaxed text-body">
              Tabel bentuk <span className="font-display text-ink">て</span> dari bentuk
              kamus, per bab — dipakai untuk permintaan, izin, dan menyambung kalimat.
            </p>
          </div>
          <HankoSeal mark="て" size="lg" className="hidden shrink-0 rotate-[4deg] sm:block" />
        </div>
      </PaperCard>

      {/* —— Kartu aturan て-form —— */}
      <section className="mt-4">
        <button
          type="button"
          onClick={() => setShowRules((v) => !v)}
          aria-expanded={showRules}
          className="flex w-full items-center justify-between gap-2 rounded-card border border-line/[0.12] bg-surface px-4 py-3 text-left transition hover:border-line/25"
        >
          <span className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-sunken text-ink-soft">
              <AppIcon icon="ph:lightbulb" className="text-lg" />
            </span>
            <span className="font-display text-[17px] text-ink">
              Cara membentuk て-form
            </span>
          </span>
          <AppIcon
            icon="ph:caret-down"
            className={`text-base text-muted transition-transform duration-200 ${
              showRules ? "rotate-180" : ""
            }`}
          />
        </button>

        {showRules && (
          <div className="mt-2 grid gap-2 animate-fade-rise sm:grid-cols-2 lg:grid-cols-3">
            {ATURAN.map((g) => (
              <PaperCard key={g.title} className="p-3.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-display text-[15px] text-ink">{g.title}</span>
                  <span className="font-jp text-[12px] text-muted">{g.jp}</span>
                </div>
                <ul className="mt-2 space-y-1.5">
                  {g.rows.map(([dari, jadi, contoh]) => (
                    <li key={dari + jadi} className="flex flex-col leading-tight">
                      <span className="flex items-baseline gap-1.5">
                        <span className="font-jp text-[14px] text-ink-soft">{dari}</span>
                        <AppIcon icon="ph:arrow-right" className="text-[11px] text-muted" />
                        <span className="font-jp text-[14px] font-semibold text-ink">
                          {jadi}
                        </span>
                      </span>
                      <span className="font-jp text-[11.5px] text-muted">{contoh}</span>
                    </li>
                  ))}
                </ul>
              </PaperCard>
            ))}
          </div>
        )}
      </section>

      {/* —— Kontrol: filter golongan + pencarian —— */}
      <div className="mt-4 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Segmented options={FILTER_OPTIONS} value={filter} onChange={onFilter} />
          <span className="k-num font-mono text-[12px] text-muted">
            {totalTampil} kata · {babCount} bab
          </span>
        </div>

        <div className="relative">
          <AppIcon
            icon="ph:magnifying-glass"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[17px] text-muted/70"
          />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            type="search"
            placeholder="Cari ます / kamus / て / kanji / arti…"
            aria-label="Cari kata kerja"
            className="h-11 w-full rounded-card border border-line/[0.12] bg-surface
              pl-11 pr-11 text-[14.5px] text-ink outline-none
              transition-[border-color,box-shadow] duration-150
              placeholder:text-muted/70 focus:border-accent/50 focus:shadow-soft
              [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQuery("")}
              aria-label="Bersihkan pencarian"
              className="absolute right-2.5 top-1/2 grid h-7 w-7 -translate-y-1/2
                place-items-center rounded-full text-muted transition-colors
                hover:bg-ink/[0.07] hover:text-ink"
            >
              <AppIcon icon="ph:x" className="text-[15px]" />
            </button>
          )}
        </div>

        <p className="text-[13px] leading-relaxed text-muted">{KIND_DESC[filter]}</p>

        {/* —— Tampilkan/sembunyikan kolom bentuk (chip) —— */}
        <div className="flex flex-wrap items-center gap-2 rounded-card border border-line/[0.12] bg-surface px-3 py-2.5">
          <span className="k-eyebrow shrink-0">Kolom bentuk</span>
          {BENTUK_TOGGLES.map((t) => (
            <Chip
              key={t.key}
              active={isVisible(hiddenBentuk, t.key)}
              onClick={() => toggleCol(TABLE_ID, t.key)}
            >
              {t.label}
            </Chip>
          ))}
          <button
            type="button"
            onClick={() =>
              setManyCols(TABLE_ID, BENTUK_TOGGLES.map((t) => t.key), !semuaTampil)
            }
            className="k-chip k-chip-off ml-auto"
          >
            <AppIcon icon={semuaTampil ? "ph:eye-slash" : "ph:eye"} className="text-[13px]" />
            {semuaTampil ? "Sembunyikan semua" : "Tampilkan semua"}
          </button>
          <button
            type="button"
            onClick={() => useColWidths.getState().resetTable(TABLE_ID)}
            title="Kembalikan lebar kolom ke ukuran awal"
            className="k-chip k-chip-off"
          >
            <AppIcon icon="ph:arrows-in" className="text-[13px]" />
            Reset lebar
          </button>
        </div>
      </div>
    </>
  );
}
