import { useProgress } from "../store/progress";
import { TOTAL_KOTOBA, useSearchIndex } from "../data";
import TopBar from "../components/TopBar";
import AppIcon from "../components/Icon";
import PaperCard from "../components/PaperCard";

interface Props {
  onBack: () => void;
}

export default function Search({ onBack }: Props) {
  const { query: q, setQuery: setQ, results, loading } = useSearchIndex();
  const { isHafal, toggleHafal } = useProgress();

  return (
    <div className="min-h-full pb-24">
      <TopBar title="Cari Kosakata" subtitle="kana · kanji · arti" onBack={onBack} />

      <div className="mx-auto max-w-xl px-4 pt-4">
        <div className="sticky top-[4.25rem] z-10 pb-3">
          <div className="relative">
            <AppIcon
              icon="ph:magnifying-glass"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-muted"
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              autoFocus
              placeholder="わたし / 私 / saya"
              aria-label="Cari kosakata"
              className="h-12 w-full rounded-2xl border-2 border-line/20 bg-surface pl-11 pr-10 font-display text-lg text-ink outline-none transition placeholder:font-sans placeholder:text-[15px] placeholder:text-muted focus:border-accent/60"
            />
            {q && (
              <button
                onClick={() => setQ("")}
                aria-label="Bersihkan"
                className="absolute right-2.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-muted transition hover:bg-ink/10 hover:text-ink"
              >
                <AppIcon icon="ph:x" className="text-base" />
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="py-14 text-center">
            <AppIcon icon="ph:circle-notch" className="mx-auto animate-spin text-3xl text-muted" />
            <p className="mt-3 text-sm text-muted">Memuat index pencarian…</p>
          </div>
        ) : q.trim() === "" ? (
          <div className="py-14 text-center">
            <AppIcon
              icon="ph:book-open"
              className="mx-auto text-4xl text-muted/50"
            />
            <p className="mt-3 font-display text-2xl text-ink">
              ことばをさがす
            </p>
            <p className="mt-1.5 text-sm text-muted">
              Cari kata dari {TOTAL_KOTOBA.toLocaleString("id-ID")} kosakata
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-1.5">
              {["わたし", "私", "saya", "がっこう"].map((s) => (
                <button
                  key={s}
                  onClick={() => setQ(s)}
                  className="rounded-pill border border-line/15 bg-sunken/60 px-2.5 py-1 font-display text-sm text-ink-soft transition hover:bg-sunken hover:text-ink"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : results.length === 0 ? (
          <div className="py-14 text-center">
            <AppIcon icon="ph:magnifying-glass" className="mx-auto text-4xl text-muted/50" />
            <p className="mt-3 font-display text-2xl text-ink">見つかりません</p>
            <p className="mt-1.5 text-sm text-muted">
              Coba kata lain, atau pakai ejaan lain.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-2 text-xs text-muted">
              {results.length} hasil
            </p>
            <div className="space-y-2">
              {results.map((k) => {
                const marked = isHafal(k.bab, k.no);
                return (
                  <PaperCard key={`${k.bab}-${k.no}`} className="flex items-center gap-3 p-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-xl text-ink">
                          {k.kana}
                        </span>
                        {k.kanji && (
                          <span className="font-display text-sm text-muted">
                            {k.kanji}
                          </span>
                        )}
                        <span className="ml-auto shrink-0 rounded-md bg-ink/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-ink">
                          bab {k.bab}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-ink-soft">{k.arti}</p>
                    </div>
                    <button
                      onClick={() => toggleHafal(k.bab, k.no)}
                      aria-label={marked ? "Sudah hafal" : "Tandai sudah hafal"}
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-lg transition active:scale-90 ${
                        marked ? "bg-success-soft text-success" : "bg-sunken/60 text-muted"
                      }`}
                    >
                      <AppIcon icon={marked ? "ph:check-circle" : "ph:star"} className="text-lg" />
                    </button>
                  </PaperCard>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
