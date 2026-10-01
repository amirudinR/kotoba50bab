import { useMemo } from "react";
import TopBar from "../components/TopBar";
import PaperCard from "../components/PaperCard";
import Button from "../components/Button";
import AppIcon from "../components/Icon";
import KotobaTable from "../components/KotobaTable";
import LoadingRows from "../components/LoadingRows";
import { BABS_META, TOTAL_KOTOBA, useBab } from "../data";
import { useList, type KatakanaMode } from "../store/list";
import { useSpeech } from "../lib/speech";
import type { Kotoba } from "../types";

interface Props {
  onBack: () => void;
}

function matches(it: Kotoba, q: string): boolean {
  if (!q) return true;
  const n = q.toLowerCase().trim();
  return (
    it.kana.toLowerCase().includes(n) ||
    it.kanji.toLowerCase().includes(n) ||
    it.romaji.toLowerCase().includes(n) ||
    it.arti.toLowerCase().includes(n)
  );
}

export default function List({ onBack }: Props) {
  const {
    collapsed,
    visible,
    katakanaMode,
    focusBabs,
    query,
    onlyWithKanji,
    sortBy,
    toggleBab,
    expandAll,
    collapseAll,
    expandOnly,
    toggleCol,
    showAllCols,
    resetCols,
    setKatakanaMode,
    toggleFocusBab,
    setQuery,
    toggleOnlyKanji,
    setSortBy,
    clearFilters,
  } = useList();

  const speech = useSpeech();
  const q = query.trim();
  const filtering = q.length > 0 || onlyWithKanji;

  const katMap: Record<KatakanaMode, string> = {
    auto: "Auto",
    kana: "Hiragana",
    katakana: "Katakana",
  };

  return (
    <div className="min-h-full pb-24">
      <TopBar
        title="Daftar Kosakata"
        subtitle="Buka/tutup per bab, atur kolom, dengarkan pelafalan"
        onBack={onBack}
      />

      <main className="mx-auto max-w-5xl px-3 pb-6 sm:px-4">
        {/* —— Pencarian & filter —— */}
        <PaperCard className="mt-4 p-3 sm:p-4">
          <div className="relative">
            <AppIcon
              icon="ph:magnifying-glass"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-muted"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari kana, kanji, romaji, atau arti…"
              aria-label="Cari kosakata"
              className="h-11 w-full rounded-pill border border-line/20 bg-surface pl-10 pr-10 font-sans text-[15px] text-ink outline-none transition placeholder:text-muted focus:border-accent/60"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Bersihkan pencarian"
                className="absolute right-2.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-muted transition hover:bg-ink/10 hover:text-ink"
              >
                <AppIcon icon="ph:x" className="text-base" />
              </button>
            )}
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <button
              onClick={toggleOnlyKanji}
              aria-pressed={onlyWithKanji}
              className={`rounded-pill border px-2.5 py-1 text-[12px] font-medium transition ${
                onlyWithKanji
                  ? "border-ink/35 bg-ink text-surface"
                  : "border-line/15 bg-sunken/60 text-muted hover:text-ink"
              }`}
            >
              <AppIcon icon="ph:ideogram" className="mr-1 inline text-[13px]" />
              Hanya yang punya kanji
            </button>

            <span className="k-eyebrow ml-1">Urutkan</span>
            {(["bab", "romaji"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                aria-pressed={sortBy === s}
                className={`rounded-pill border px-2.5 py-1 text-[12px] font-medium transition ${
                  sortBy === s
                    ? "border-ink/35 bg-ink text-surface"
                    : "border-line/15 bg-sunken/60 text-muted hover:text-ink"
                }`}
              >
                {s === "bab" ? "Per bab" : "Abjad romaji"}
              </button>
            ))}

            {filtering && (
              <button
                onClick={clearFilters}
                className="ml-auto rounded-pill px-2.5 py-1 text-[12px] font-semibold text-seal underline underline-offset-2"
              >
                Bersihkan filter
              </button>
            )}
          </div>
        </PaperCard>

        {/* —— Toolbar kolom & format —— */}
        <PaperCard className="mt-3 p-3 sm:p-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="k-eyebrow mr-1">Kolom</span>
            {(
              [
                ["no", "No"],
                ["kana", "Hiragana"],
                ["katakana", "Katakana"],
                ["romaji", "Romaji"],
                ["kanji", "Kanji"],
                ["arti", "Arti"],
              ] as const
            ).map(([k, label]) => {
              const act = visible[k];
              return (
                <button
                  key={k}
                  onClick={() => toggleCol(k)}
                  aria-pressed={act}
                  className={`rounded-pill border px-2.5 py-1 text-[12px] font-medium transition ${
                    act
                      ? "border-ink/35 bg-ink text-surface"
                      : "border-line/15 bg-sunken/60 text-muted hover:text-ink"
                  }`}
                >
                  {label}
                </button>
              );
            })}
            <Button
              variant="ghost"
              size="sm"
              icon="ph:columns"
              onClick={showAllCols}
              className="ml-1"
            >
              Semua kolom
            </Button>
            <Button variant="ghost" size="sm" icon="ph:columns" onClick={resetCols}>
              Reset
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line/10 pt-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                icon="ph:arrows-out"
                onClick={expandAll}
              >
                Buka semua
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon="ph:arrows-in"
                onClick={collapseAll}
              >
                Tutup semua
              </Button>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="k-eyebrow hidden sm:inline">Format kana</span>
              <div className="flex items-center gap-0.5 overflow-hidden rounded-pill border border-line/15 bg-surface p-0.5">
                {(["auto", "kana", "katakana"] as KatakanaMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setKatakanaMode(m)}
                    aria-pressed={katakanaMode === m}
                    className={`h-8 rounded-pill px-2.5 text-[13px] font-medium transition ${
                      katakanaMode === m
                        ? "bg-ink text-surface shadow-soft"
                        : "text-muted hover:text-ink"
                    }`}
                  >
                    {katMap[m]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Aksi bab terpilih */}
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line/10 pt-3">
            <span className="k-eyebrow">Bab terpilih</span>
            <span className="text-[13px] font-semibold text-ink">
              {focusBabs.length === 0
                ? "belum ada"
                : focusBabs.length > 6
                  ? `${focusBabs.length} bab`
                  : focusBabs.join(", ")}
            </span>
            <div className="ml-auto flex flex-wrap items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                icon="ph:eye"
                disabled={focusBabs.length === 0}
                onClick={() => expandOnly(focusBabs)}
              >
                Buka terpilih
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon="ph:eye-slash"
                disabled={focusBabs.length === 0}
                onClick={() => {
                  const c: Record<number, boolean> = {};
                  for (const n of focusBabs) c[n] = true;
                  useList.setState({ collapsed: { ...collapsed, ...c } });
                }}
              >
                Tutup terpilih
              </Button>
            </div>
          </div>
        </PaperCard>

        {/* —— Daftar per bab —— */}
        <div className="mt-3 space-y-3">
          {BABS_META.map((meta) => (
            <BabBlock
              key={meta.bab}
              meta={meta}
              collapsed={!!collapsed[meta.bab]}
              isPicked={focusBabs.includes(meta.bab)}
              onToggle={() => toggleBab(meta.bab)}
              onPick={() => toggleFocusBab(meta.bab)}
              visible={visible}
              katakanaMode={katakanaMode}
              query={q}
              onlyWithKanji={onlyWithKanji}
              sorting={sortBy}
              speech={speech}
            />
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            Kembali ke Home
          </Button>
        </div>
      </main>
    </div>
  );
}

function BabBlock({
  meta,
  collapsed,
  isPicked,
  onToggle,
  onPick,
  visible,
  katakanaMode,
  query,
  onlyWithKanji,
  sorting,
  speech,
}: {
  meta: { bab: number; count: number };
  collapsed: boolean;
  isPicked: boolean;
  onToggle: () => void;
  onPick: () => void;
  visible: Record<string, boolean>;
  katakanaMode: KatakanaMode;
  query: string;
  onlyWithKanji: boolean;
  sorting: "bab" | "romaji";
  speech: ReturnType<typeof useSpeech>;
}) {
  // Saat searching/filtering, tabel harus tetap terlihat walau babnya dalam
  // keadaan tertutup — kalau tidak, hasil pencarian tidak akan terlihat sama
  // sekali. Bab yang tidak ditampilkan tidak perlu diunduh.
  const showTable = !collapsed || !!query || onlyWithKanji;
  const { items, loading } = useBab(meta.bab, showTable);

  const filtered = useMemo(() => {
    const out = items.filter(
      (it) => (!onlyWithKanji || it.kanji.trim() !== "") && matches(it, query),
    );
    if (sorting === "romaji" && query) {
      return [...out].sort((a, b) => a.romaji.localeCompare(b.romaji));
    }
    return out;
  }, [items, query, onlyWithKanji, sorting]);

  // Bab tanpa hasil disembunyikan sepenuhnya, termasuk saat belum selesai dimuat
  // (loading) supaya tidak muncul lalu menghilang.
  if ((query || onlyWithKanji) && filtered.length === 0) return null;

  return (
    <PaperCard className="overflow-hidden">
      <div className="flex items-stretch">
        <button
          onClick={onToggle}
          aria-expanded={showTable}
          className="flex min-w-0 flex-1 items-center justify-between gap-3 px-3 py-3 text-left sm:px-4"
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <AppIcon
              icon={collapsed ? "ph:caret-right" : "ph:caret-down"}
              className="text-base text-ink-soft"
            />
            <h2 className="truncate font-display text-base font-semibold text-ink sm:text-lg">
              Bab {meta.bab}
            </h2>
            <span className="k-eyebrow hidden sm:inline">
              {query || onlyWithKanji
                ? `${filtered.length} dari ${meta.count}`
                : `${meta.count} kata`}
            </span>
          </div>
        </button>

        <button
          onClick={onPick}
          aria-pressed={isPicked}
          aria-label={`Pilih bab ${meta.bab}`}
          className={`grid w-11 shrink-0 place-items-center border-l border-line/10 transition ${
            isPicked
              ? "bg-accent/15 text-accent"
              : "text-muted hover:bg-sunken/60 hover:text-ink"
          }`}
        >
          <AppIcon
            icon={isPicked ? "ph:check-square" : "ph:square"}
            className="text-lg"
          />
        </button>
      </div>

      {showTable && (
        <div className="border-t border-line/10">
          {loading ? (
            <LoadingRows rows={5} label={`Memuat bab ${meta.bab}…`} />
          ) : (
            <KotobaTable
              items={filtered}
              visible={visible as never}
              katakanaMode={katakanaMode}
              speak={speech.speak}
              canSpeak={speech.supported && speech.hasVoice}
              isSpeaking={speech.isSpeaking}
            />
          )}
        </div>
      )}
    </PaperCard>
  );
}

export { TOTAL_KOTOBA };
