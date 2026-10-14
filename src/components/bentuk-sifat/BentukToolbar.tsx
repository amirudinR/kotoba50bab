import { KEIYOUSHI_BENTUK_COUNT } from "../../data/keiyoushi_konjugasi";
import { Segmented } from "../Controls";
import PaperCard from "../PaperCard";
import HankoSeal from "../HankoSeal";
import AppIcon from "../Icon";
import { useColVis, isVisible } from "../../store/colvis";
import { useColWidths } from "../../store/colwidth";
import PilBentuk from "./PilBentuk";
import {
  BENTUK_TOGGLES,
  FILTER_DESC,
  FILTER_OPTIONS,
  GAYA_OPTIONS,
  TABLE_ID,
  type FilterKind,
  type GayaBentuk,
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
 * Bagian atas halaman Bentuk Kata Sifat: hero, kartu cara baca,
 * kontrol filter & pencarian, dan panel pil kolom bentuk.
 */
export default function BentukToolbar({
  filter,
  onFilter,
  query,
  onQuery,
  totalTampil,
  babCount,
  hiddenBentuk,
}: Props) {
  const toggleCol = useColVis((s) => s.toggle);
  const setManyCols = useColVis((s) => s.setMany);
  const gaya = (useColVis((s) => s.gaya[TABLE_ID]) ?? "semua") as GayaBentuk;
  const setGaya = useColVis((s) => s.setGaya);

  // Tombol pil yang RELEVAN di gaya aktif (untuk "Sembunyikan/Tampilkan semua"):
  // pil khusus formal (じゃ/では) hanya relevan saat gaya = "formal".
  const togglesAktif = BENTUK_TOGGLES.filter((t) => {
    if (gaya === "semua") return !t.khususFormal;
    return t.gaya === gaya;
  });
  const semuaTampil = togglesAktif.every((t) => isVisible(hiddenBentuk, t.key));

  return (
    <>
      {/* —— Hero ringkas —— */}
      <PaperCard raised tape className="k-margin overflow-hidden pl-10 pr-5 py-5">
        <div className="flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="k-eyebrow">Keiyoushi · 現在 & 過去</p>
            <div className="mt-1.5 flex items-baseline gap-2.5">
              <h2 className="font-display text-4xl leading-none text-ink">形容詞</h2>
              <span className="k-num font-mono text-sm text-muted">
                {KEIYOUSHI_BENTUK_COUNT.total} kata
              </span>
            </div>
            <p className="mt-2 text-[14px] leading-relaxed text-body">
              Tabel lengkap bentuk <span className="font-display text-ink">positif</span>{" "}
              (kiri) & <span className="font-display text-ink">negatif</span> (kanan) —
              kini & lampau, per bab.
            </p>
          </div>
          <HankoSeal mark="変" size="lg" className="hidden shrink-0 rotate-[4deg] sm:block" />
        </div>
      </PaperCard>

      {/* —— Kartu cara membaca bentuk —— */}
      <section className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <PaperCard className="p-3.5">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-ink/[0.08] px-2 py-0.5 font-mono text-[11px] font-semibold text-ink-soft">
              い
            </span>
            <span className="font-display text-[15px] text-ink-soft">i-adjektiva</span>
          </div>
          <p className="mt-1.5 text-[13px] leading-snug text-body">
            ～い → ～かった / ～くない / ～くなかった.{" "}
            <span className="font-jp text-ink">たかい</span> →{" "}
            <span className="font-jp text-ink">たかくない</span>.
          </p>
        </PaperCard>
        <PaperCard className="p-3.5">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-accent-soft px-2 py-0.5 font-mono text-[11px] font-semibold text-accent">
              な
            </span>
            <span className="font-display text-[15px] text-ink-soft">na-adjektiva</span>
          </div>
          <p className="mt-1.5 text-[13px] leading-snug text-body">
            ～だ → ～だった / ～じゃない / ～じゃなかった.{" "}
            <span className="font-jp text-ink">げんきだ</span> →{" "}
            <span className="font-jp text-ink">げんきじゃない</span>.
          </p>
        </PaperCard>
      </section>

      {/* —— Kontrol: filter jenis + pencarian —— */}
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
            placeholder="Cari kana, kanji, arti, atau bentuk…"
            aria-label="Cari kata sifat"
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

        <p className="text-[13px] leading-relaxed text-muted">{FILTER_DESC[filter]}</p>

        {/* —— Gaya bentuk: Semua / Kasual / Formal —— */}
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <span className="k-eyebrow shrink-0">Gaya bentuk</span>
          <Segmented
            options={GAYA_OPTIONS}
            value={gaya}
            onChange={(v) => setGaya(TABLE_ID, v)}
          />
          <span className="text-[12px] text-muted">
            {gaya === "semua"
              ? "Kasual + formal ditampilkan"
              : gaya === "kasual"
                ? "Hanya bentuk kasual (普通形)"
                : "Hanya bentuk formal (丁寧形 · です)"}
          </span>
        </div>

        {/* —— Panel pil kolom bentuk (2 baris: Kasual / Formal) —— */}
        <div className="mt-2 space-y-2 rounded-card border border-line/[0.12] bg-surface px-3 py-2.5">
          {/* Baris Kasual */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="k-eyebrow w-[52px] shrink-0">Kasual</span>
            {BENTUK_TOGGLES.filter((t) => t.gaya === "kasual").map((t) => {
              const cocokGaya = gaya === "semua" || gaya === "kasual";
              const on = cocokGaya && isVisible(hiddenBentuk, t.key);
              return (
                <PilBentuk
                  key={t.key}
                  label={t.label}
                  title={`${t.full} — ${on ? "sembunyikan" : "tampilkan"}`}
                  tone={t.label.startsWith("+") ? "success" : "danger"}
                  active={on}
                  disabled={!cocokGaya}
                  onClick={() => toggleCol(TABLE_ID, t.key)}
                />
              );
            })}
          </div>

          {/* Baris Formal */}
          <div className="flex flex-wrap items-center gap-1.5 border-t border-line/[0.07] pt-2">
            <span className="k-eyebrow w-[52px] shrink-0">Formal</span>
            {BENTUK_TOGGLES.filter(
              (t) => t.gaya === "formal" && (!t.khususFormal || gaya === "formal"),
            ).map((t) => {
              const cocokGaya = gaya === "semua" || gaya === "formal";
              const on = cocokGaya && isVisible(hiddenBentuk, t.key);
              return (
                <PilBentuk
                  key={t.key}
                  label={t.label}
                  title={`${t.full} — ${on ? "sembunyikan" : "tampilkan"}`}
                  tone={t.label.startsWith("+") ? "success" : "danger"}
                  active={on}
                  disabled={!cocokGaya}
                  onClick={() => toggleCol(TABLE_ID, t.key)}
                />
              );
            })}
            {gaya === "formal" && (
              <span className="ml-1 text-[11px] text-muted/70">
                · variasi sopan じゃ/では
              </span>
            )}
          </div>

          {/* Aksi panel */}
          <div className="flex flex-wrap items-center gap-1.5 border-t border-line/[0.07] pt-2">
            <button
              type="button"
              onClick={() =>
                setManyCols(TABLE_ID, togglesAktif.map((t) => t.key), !semuaTampil)
              }
              className="k-chip k-chip-off"
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
      </div>
    </>
  );
}
