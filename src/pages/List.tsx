import { useEffect, useMemo, useReducer, useRef } from "react";
import TopBar from "../components/TopBar";
import Button from "../components/Button";
import AppIcon from "../components/Icon";
import ListControls from "../components/ListControls";
import BabAccordion from "../components/BabAccordion";
import { Chip } from "../components/Controls";
import { BABS_META, TOTAL_KOTOBA, useBab } from "../data";
import { useList, type ColKey, type KatakanaMode } from "../store/list";
import { useSpeech } from "../lib/speech";
import type { Kotoba } from "../types";

interface Props {
  onBack: () => void;
}

const SORT_OPTIONS = [
  { value: "bab", label: "Per bab" },
  { value: "romaji", label: "Abjad romaji" },
] as const;

type SortBy = (typeof SORT_OPTIONS)[number]["value"];

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
  const canSpeak = speech.supported && speech.hasVoice;

  // Total hasil pencarian ditampilkan di header. tiap bab melaporkan
  // jumlah barisnya sendiri lewat `report`; efeknya hanya jalan saat
  // jumlah berubah, jadi tidak memicu render berulang.
  const counts = useRef(new Map<number, number>());
  const [hits, bump] = useReducer((n: number) => n + 1, 0);

  const report = (bab: number, n: number) => {
    if (counts.current.get(bab) !== n) {
      counts.current.set(bab, n);
      bump();
    }
  };

  useEffect(() => {
    if (!filtering) counts.current.clear();
  }, [filtering, q, onlyWithKanji]);

  const total = useMemo(
    () => [...counts.current.values()].reduce((a, b) => a + b, 0),
    [filtering, hits],
  );

  return (
    <div className="min-h-full pb-20">
      <TopBar
        title="Daftar Kosakata"
        subtitle={
          filtering
            ? `${total.toLocaleString("id-ID")} dari ${TOTAL_KOTOBA.toLocaleString("id-ID")} kata cocok`
            : `${TOTAL_KOTOBA.toLocaleString("id-ID")} kosakata · 50 bab`
        }
        onBack={onBack}
      />

      <main className="mx-auto max-w-5xl px-3 pb-8 pt-4 sm:px-5">
        {/* —— Pencarian —— */}
        <div className="relative">
          <AppIcon
            icon="ph:magnifying-glass"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[17px] text-muted/70"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            placeholder="Cari kana, kanji, romaji, atau arti…"
            aria-label="Cari kosakata"
            className="h-11 w-full rounded-card border border-line/[0.12] bg-surface
              pl-11 pr-11 text-[14.5px] text-ink outline-none
              transition-[border-color,box-shadow] duration-150
              placeholder:text-muted/70 focus:border-accent/50 focus:shadow-soft
              [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Bersihkan pencarian"
              title="Bersihkan pencarian"
              className="absolute right-2.5 top-1/2 grid h-7 w-7 -translate-y-1/2
                place-items-center rounded-full text-muted transition-colors
                hover:bg-ink/[0.07] hover:text-ink"
            >
              <AppIcon icon="ph:x" className="text-[15px]" />
            </button>
          )}
        </div>

        {/* —— Filter cepat —— */}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <Chip
            active={onlyWithKanji}
            onClick={toggleOnlyKanji}
            icon="ph:text-t"
            title="Tampilkan hanya kosakata yang punya kanji"
          >
            Punya kanji
          </Chip>

          <span className="mx-0.5 h-4 w-px bg-line/[0.12]" aria-hidden />

          <span className="mr-0.5 text-[12px] font-medium text-muted">Urut</span>
          {SORT_OPTIONS.map((s) => (
            <Chip
              key={s.value}
              active={sortBy === s.value}
              onClick={() => setSortBy(s.value)}
              title={`Urutkan ${s.label.toLowerCase()}`}
            >
              {s.label}
            </Chip>
          ))}

          {filtering && (
            <button
              type="button"
              onClick={clearFilters}
              className="ml-auto inline-flex h-7 items-center gap-1 rounded-pill
                px-2.5 text-[12px] font-semibold text-accent transition-colors
                hover:bg-accent/[0.12]"
            >
              <AppIcon icon="ph:x-circle" className="text-[14px]" />
              Bersihkan filter
            </button>
          )}
        </div>

        {/* —— Panel kontrol tampilan —— */}
        <div className="mt-3">
          <ListControls
            visible={visible}
            onToggleCol={toggleCol}
            onShowAll={showAllCols}
            onReset={resetCols}
            katakanaMode={katakanaMode}
            onKana={setKatakanaMode}
            onExpandAll={expandAll}
            onCollapseAll={collapseAll}
            focusCount={focusBabs.length}
            onExpandPicked={() => expandOnly(focusBabs)}
            onCollapsePicked={() => {
              const c: Record<number, boolean> = { ...collapsed };
              for (const n of focusBabs) c[n] = true;
              useList.setState({ collapsed: c });
            }}
          />
        </div>

        {/* —— Daftar per bab —— */}
        <div className="mt-3 space-y-2">
          {BABS_META.map((meta) => (
            <BabRow
              key={meta.bab}
              bab={meta.bab}
              total={meta.count}
              collapsed={!!collapsed[meta.bab]}
              picked={focusBabs.includes(meta.bab)}
              onToggle={() => toggleBab(meta.bab)}
              onPick={() => toggleFocusBab(meta.bab)}
              visible={visible as Record<ColKey, boolean>}
              katakanaMode={katakanaMode}
              query={q}
              onlyWithKanji={onlyWithKanji}
              sortBy={sortBy}
              canSpeak={canSpeak}
              speech={speech}
              report={report}
            />
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            icon="ph:caret-left"
          >
            Kembali ke Home
          </Button>
        </div>
      </main>
    </div>
  );
}

function BabRow({
  bab,
  total,
  collapsed,
  picked,
  onToggle,
  onPick,
  visible,
  katakanaMode,
  query,
  onlyWithKanji,
  sortBy,
  canSpeak,
  speech,
  report,
}: {
  bab: number;
  total: number;
  collapsed: boolean;
  picked: boolean;
  onToggle: () => void;
  onPick: () => void;
  visible: Record<ColKey, boolean>;
  katakanaMode: KatakanaMode;
  query: string;
  onlyWithKanji: boolean;
  sortBy: SortBy;
  canSpeak: boolean;
  speech: ReturnType<typeof useSpeech>;
  report: (bab: number, n: number) => void;
}) {
  // Saat searching/filtering tabel harus tetap terlihat walau bab tertutup,
  // karena kalau tidak hasil pencarian tidak akan terlihat sama sekali.
  const filtering = !!query || onlyWithKanji;
  const open = !collapsed || filtering;
  const { items, loading } = useBab(bab, open);

  const filtered = useMemo(() => {
    const out = items.filter(
      (it) => (!onlyWithKanji || it.kanji.trim() !== "") && matches(it, query),
    );
    if (sortBy === "romaji" && query) {
      return [...out].sort((a, b) => a.romaji.localeCompare(b.romaji));
    }
    return out;
  }, [items, query, onlyWithKanji, sortBy]);

  useEffect(() => {
    report(bab, filtering ? filtered.length : 0);
  }, [bab, filtering, filtered.length, report]);

  // Bab tanpa hasil disembunyikan sepenuhnya, termasuk saat masih memuat,
  // supaya tidak muncul lalu menghilang.
  if (filtering && filtered.length === 0) return null;

  return (
    <BabAccordion
      bab={bab}
      total={total}
      shown={filtered.length}
      open={open}
      loading={loading}
      picked={picked}
      onToggle={onToggle}
      onPick={onPick}
      items={filtered}
      visible={visible}
      katakanaMode={katakanaMode}
      speak={speech.speak}
      canSpeak={canSpeak}
      isSpeaking={speech.isSpeaking}
      filtering={filtering}
    />
  );
}
