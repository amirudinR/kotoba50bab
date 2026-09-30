import { useMemo, useState } from "react";
import { ALL_KOTOBA } from "../data";
import { useProgress } from "../store/progress";
import { normalize } from "../lib/utils";
import TopBar from "../components/TopBar";
import AppIcon from "../components/Icon";
import HankoSeal from "../components/HankoSeal";

interface Props {
  onBack: () => void;
}

const MAX_HASIL = 120;

export default function Search({ onBack }: Props) {
  const [q, setQ] = useState("");
  const { isHafal, toggleHafal } = useProgress();

  const results = useMemo(() => {
    const query = normalize(q);
    if (!query) return [];
    return ALL_KOTOBA.filter(
      (k) =>
        normalize(k.kana).includes(query) ||
        normalize(k.kanji).includes(query) ||
        normalize(k.arti).includes(query),
    ).slice(0, MAX_HASIL);
  }, [q]);

  const kosong = q.trim() === "";

  return (
    <div className="min-h-full pb-24">
      <TopBar
        title="Cari Kosakata"
        subtitle="kana · kanji · arti Indonesia"
        onBack={onBack}
      />

      <div className="mx-auto max-w-xl px-4 pt-4">
        {/* —— Input pencarian —— */}
        <div className="sticky top-16 z-20 -mx-4 bg-bg/85 px-4 pb-3 pt-1 backdrop-blur-md">
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
              <AppIcon icon="ph:magnifying-glass" className="text-xl" />
            </span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              autoFocus
              enterKeyHint="search"
              aria-label="Cari kosakata Jepang"
              placeholder="わたし / 私 / saya"
              className="h-12 w-full rounded-xl border border-line/15 bg-surface pl-11 pr-11 font-display text-lg text-ink shadow-soft transition placeholder:font-sans placeholder:text-[15px] placeholder:text-muted focus:border-accent/70"
            />
            {q.length > 0 && (
              <button
                onClick={() => setQ("")}
                aria-label="Hapus pencarian"
                className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-muted transition hover:bg-ink/[0.07] hover:text-ink active:scale-90"
              >
                <AppIcon icon="ph:x" className="text-lg" />
              </button>
            )}
          </div>
        </div>

        {kosong ? (
          <div className="flex flex-col items-center px-4 py-16 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-sunken text-muted">
              <AppIcon icon="ph:book-open" className="text-3xl" />
            </span>
            <p className="mt-5 font-display text-2xl text-ink">ことばをさがす</p>
            <p className="mt-1.5 text-sm text-muted">
              Cari dengan kana, kanji, atau arti Indonesia.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <ExampleChip text="わたし" />
              <ExampleChip text="私" />
              <ExampleChip text="saya" />
            </div>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center px-4 py-16 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-sunken text-muted">
              <AppIcon icon="ph:magnifying-glass" className="text-3xl" />
            </span>
            <p className="mt-5 font-display text-2xl text-ink">見つかりません</p>
            <p className="mt-1.5 text-sm text-muted">
              Tidak ditemukan. Coba kata kunci lain atau periksa ejaan kana.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <p className="k-eyebrow">{results.length} hasil</p>
              {results.length === MAX_HASIL && (
                <p className="k-eyebrow normal-case">dipotong 120</p>
              )}
            </div>

            <div className="max-h-[calc(100vh-15rem)] space-y-2 overflow-y-auto scroll-slim pb-2 pr-1">
              {results.map((k) => (
                <ResultRow
                  key={`${k.bab}-${k.no}`}
                  kanji={k.kanji}
                  kana={k.kana}
                  arti={k.arti}
                  bab={k.bab}
                  marked={isHafal(k.bab, k.no)}
                  onToggle={() => toggleHafal(k.bab, k.no)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ExampleChip({ text }: { text: string }) {
  return (
    <span className="k-num rounded-pill border border-line/15 bg-surface px-3 py-1.5 font-display text-sm text-ink-soft">
      {text}
    </span>
  );
}

function ResultRow({
  kana,
  kanji,
  arti,
  bab,
  marked,
  onToggle,
}: {
  kana: string;
  kanji: string;
  arti: string;
  bab: number;
  marked: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`k-card flex items-center gap-3 p-3 transition ${
        marked ? "bg-success-soft/60" : ""
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          {kanji ? (
            <>
              <span className="font-display text-[22px] leading-tight text-ink">
                {kanji}
              </span>
              <span className="min-w-0 truncate font-display text-[15px] text-ink-soft">
                {kana}
              </span>
            </>
          ) : (
            <span className="font-display text-[22px] leading-tight text-ink">
              {kana}
            </span>
          )}
          <span className="k-num ml-auto shrink-0 rounded-md bg-ink/[0.07] px-1.5 py-0.5 font-mono text-[10px] tracking-wider text-ink-soft">
            BAB {String(bab).padStart(2, "0")}
          </span>
        </div>
        <p className="mt-0.5 text-sm leading-snug text-body">{arti}</p>
      </div>

      <button
        onClick={onToggle}
        aria-pressed={marked}
        aria-label={
          marked ? `Batalkan hafalan ${kanji || kana}` : `Tandai hafal ${kanji || kana}`
        }
        title={marked ? "Sudah hafal" : "Tandai sudah hafal"}
        className="group grid h-11 w-11 shrink-0 place-items-center rounded-full transition active:scale-90"
      >
        {marked ? (
          <HankoSeal mark="済" size="sm" />
        ) : (
          <span className="grid h-8 w-8 place-items-center rounded-full border border-line/20 text-muted transition group-hover:border-ink/45 group-hover:text-ink-soft">
            <AppIcon icon="ph:check" className="text-base" />
          </span>
        )}
      </button>
    </div>
  );
}
