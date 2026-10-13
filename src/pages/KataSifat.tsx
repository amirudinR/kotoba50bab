import { useMemo, useState } from "react";
import { KEIYOUSHI, KEIYOUSHI_COUNT, type Keiyoushi } from "../data/keiyoushi";
import { useProgress } from "../store/progress";
import { useSpeech } from "../lib/speech";
import TopBar from "../components/TopBar";
import PaperCard from "../components/PaperCard";
import HankoSeal from "../components/HankoSeal";
import { Segmented } from "../components/Controls";
import JpText from "../components/JpText";
import AppIcon from "../components/Icon";

interface Props {
  onBack: () => void;
}

type FilterKind = "semua" | "na" | "i";

const FILTER_OPTIONS = [
  { value: "semua" as const, label: `Semua (${KEIYOUSHI_COUNT.total})` },
  { value: "na" as const, label: `な (${KEIYOUSHI_COUNT.na})` },
  { value: "i" as const, label: `い (${KEIYOUSHI_COUNT.i})` },
];

const FILTER_DESC: Record<FilterKind, string> = {
  semua: "Kata sifat な dan い dari seluruh bab.",
  na: "Kata sifat な — biasanya menerangkan kata benda dengan な.",
  i: "Kata sifat い — berakhiran い dan bisa dikonjugasi.",
};

function matches(k: Keiyoushi, q: string): boolean {
  if (!q) return true;
  const n = q.toLowerCase().trim();
  return (
    k.kana.toLowerCase().includes(n) ||
    k.kanji.toLowerCase().includes(n) ||
    k.arti.toLowerCase().includes(n)
  );
}

export default function KataSifat({ onBack }: Props) {
  const [filter, setFilter] = useState<FilterKind>("semua");
  const [query, setQuery] = useState("");
  const { isHafal, toggleHafal } = useProgress();
  const speech = useSpeech();
  const canSpeak = speech.supported && speech.hasVoice;
  const [speakingKey, setSpeakingKey] = useState<string | null>(null);

  const q = query.trim();

  const list = useMemo(() => {
    const byKind =
      filter === "semua" ? KEIYOUSHI : KEIYOUSHI.filter((k) => k.kind === filter);
    return byKind.filter((k) => matches(k, q));
  }, [filter, q]);

  const hafalCount = useMemo(
    () => list.filter((k) => isHafal(k.bab, k.no)).length,
    [list, isHafal],
  );

  return (
    <div className="min-h-full pb-24">
      <TopBar
        title="Kata Sifat"
        subtitle="けいようし · な & い"
        onBack={onBack}
      />

      <div className="mx-auto w-full px-4 pt-4">
        {/* —— Hero ringkas —— */}
        <PaperCard raised tape className="k-margin overflow-hidden pl-10 pr-5 py-5">
          <div className="flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="k-eyebrow">Keiyoushi · Minna no Nihongo</p>
              <div className="mt-1.5 flex items-baseline gap-2.5">
                <h2 className="font-display text-4xl leading-none text-ink">
                  形容詞
                </h2>
                <span className="k-num font-mono text-sm text-muted">
                  {KEIYOUSHI_COUNT.total} kata
                </span>
              </div>
              <p className="mt-2 text-[14px] leading-relaxed text-body">
                Kumpulan kata sifat dari 50 bab — pelajari yang berakhiran{" "}
                <span className="font-display text-ink">な</span> dan{" "}
                <span className="font-display text-ink">い</span>.
              </p>
            </div>
            <HankoSeal mark="形" size="lg" className="hidden shrink-0 rotate-[4deg] sm:block" />
          </div>
        </PaperCard>

        {/* —— Kontrol: switch jenis + pencarian —— */}
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Segmented options={FILTER_OPTIONS} value={filter} onChange={setFilter} />
            <span className="k-num font-mono text-[12px] text-muted">
              {list.length} kata
              {q && ` cocok`}
            </span>
          </div>

          <div className="relative">
            <AppIcon
              icon="ph:magnifying-glass"
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[17px] text-muted/70"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="search"
              placeholder="Cari kana, kanji, atau arti…"
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
                onClick={() => setQuery("")}
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
        </div>

        {/* —— Progres hafal (kata yang sedang tampil) —— */}
        {list.length > 0 && (
          <div className="mt-4 flex items-center gap-3 border-y border-line/15 py-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sunken text-ink-soft">
              <AppIcon icon="ph:star" className="text-lg" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[14px] text-body">Sudah hafal</span>
                <span className="k-num font-display text-lg leading-none text-ink">
                  {hafalCount}
                  <span className="text-muted">/{list.length}</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* —— Daftar —— */}
        {list.length === 0 ? (
          <div className="py-16 text-center">
            <AppIcon icon="ph:magnifying-glass" className="mx-auto text-4xl text-muted/50" />
            <p className="mt-3 font-display text-2xl text-ink">見つかりません</p>
            <p className="mt-1.5 text-sm text-muted">
              Coba kata lain, atau ganti jenis kata sifat.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((k) => {
              const marked = isHafal(k.bab, k.no);
              const key = `${k.bab}-${k.no}`;
              return (
                <PaperCard key={key} className="flex items-start gap-3 p-3.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-2xl leading-tight text-ink">
                        <JpText text={k.kana} />
                      </span>
                      <span
                        className={`shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold ${
                          k.kind === "na"
                            ? "bg-accent-soft text-accent"
                            : "bg-ink/[0.08] text-ink-soft"
                        }`}
                      >
                        {k.kind === "na" ? "な" : "い"}
                      </span>
                      {k.kanji && (
                        <span className="truncate font-display text-sm text-muted">
                          <JpText text={k.kanji} />
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[14px] leading-snug text-body">{k.arti}</p>
                    <p className="k-num mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                      bab {k.bab}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-center gap-1.5">
                    {canSpeak && (
                      <button
                        type="button"
                        onClick={() => {
                          const ok = speech.speak(k.kana);
                          setSpeakingKey(ok ? key : null);
                        }}
                        aria-label={`Dengarkan ${k.kana}`}
                        className={`grid h-9 w-9 place-items-center rounded-full text-base transition active:scale-90 ${
                          speakingKey === key
                            ? "bg-accent-soft text-accent"
                            : "bg-sunken/60 text-muted hover:text-ink"
                        }`}
                      >
                        <AppIcon icon="ph:speaker-high" className="text-base" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleHafal(k.bab, k.no)}
                      aria-pressed={marked}
                      aria-label={marked ? "Sudah hafal" : "Tandai sudah hafal"}
                      className={`grid h-9 w-9 place-items-center rounded-full text-base transition active:scale-90 ${
                        marked ? "bg-success-soft text-success" : "bg-sunken/60 text-muted"
                      }`}
                    >
                      <AppIcon
                        icon={marked ? "ph:check-circle" : "ph:star"}
                        className="text-base"
                      />
                    </button>
                  </div>
                </PaperCard>
              );
            })}
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={onBack}
            className="k-chip k-chip-off"
          >
            <AppIcon icon="ph:caret-left" className="text-[13px]" />
            Kembali ke Home
          </button>
        </div>
      </div>
    </div>
  );
}
