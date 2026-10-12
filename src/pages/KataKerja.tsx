import { useMemo, useState } from "react";
import { DOUSHI, DOUSHI_COUNT, type Doushi, type DoushiKind } from "../data/doushi";
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

type FilterKind = "semua" | "1" | "2" | "3";

const FILTER_OPTIONS = [
  { value: "semua" as const, label: `Semua (${DOUSHI_COUNT.total})`, short: "Semua" },
  { value: "1" as const, label: `Gol 1 · ${DOUSHI_COUNT.g1}`, short: "1" },
  { value: "2" as const, label: `Gol 2 · ${DOUSHI_COUNT.g2}`, short: "2" },
  { value: "3" as const, label: `Gol 3 · ${DOUSHI_COUNT.g3}`, short: "3" },
];

/** Penjelasan singkat tiap golongan — untuk kartu aturan menghafal. */
const GOL_INFO: Record<DoushiKind, { judul: string; jp: string; tips: string }> = {
  1: {
    judul: "Golongan 1",
    jp: "五段 (godan)",
    tips: "Kana sebelum ます bukan -i / -e. Pindah kana ke baris -u/-a/-o (mis. のみ → のむ, のまない, のもう).",
  },
  2: {
    judul: "Golongan 2",
    jp: "一段 (ichidan)",
    tips: "Kana sebelum ます berbunyi -i atau -e. Cukup ganti ます → る (mis. たべ → たべる, み → みる).",
  },
  3: {
    judul: "Golongan 3",
    jp: "不規則 (fukisoku)",
    tips: "Hanya します & きます (dan semua kata ～します). Hafalkan khusus, tidak ikut pola.",
  },
};

const KIND_TONE: Record<DoushiKind, string> = {
  1: "bg-ink/[0.08] text-ink-soft",
  2: "bg-accent-soft text-accent",
  3: "bg-seal/10 text-seal",
};

function matches(d: Doushi, q: string): boolean {
  if (!q) return true;
  const n = q.toLowerCase().trim();
  return (
    d.kana.toLowerCase().includes(n) ||
    d.kamus.toLowerCase().includes(n) ||
    d.kanji.toLowerCase().includes(n) ||
    d.arti.toLowerCase().includes(n) ||
    d.romaji.toLowerCase().includes(n)
  );
}

export default function KataKerja({ onBack }: Props) {
  const [filter, setFilter] = useState<FilterKind>("semua");
  const [query, setQuery] = useState("");
  const [showRules, setShowRules] = useState(true);
  const { isHafal, toggleHafal } = useProgress();
  const speech = useSpeech();
  const canSpeak = speech.supported && speech.hasVoice;
  const [speakingKey, setSpeakingKey] = useState<string | null>(null);

  const q = query.trim();

  const list = useMemo(() => {
    const byKind =
      filter === "semua"
        ? DOUSHI
        : DOUSHI.filter((d) => String(d.kind) === filter);
    return byKind.filter((d) => matches(d, q));
  }, [filter, q]);

  const hafalCount = useMemo(
    () => list.filter((d) => isHafal(d.bab, d.no)).length,
    [list, isHafal],
  );

  return (
    <div className="min-h-full pb-24">
      <TopBar title="Kata Kerja" subtitle="どうし · golongan 1 · 2 · 3" onBack={onBack} />

      <div className="mx-auto max-w-3xl px-4 pt-4">
        {/* —— Hero ringkas —— */}
        <PaperCard raised tape className="k-margin overflow-hidden pl-10 pr-5 py-5">
          <div className="flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="k-eyebrow">Doushi · Minna no Nihongo</p>
              <div className="mt-1.5 flex items-baseline gap-2.5">
                <h2 className="font-display text-4xl leading-none text-ink">動詞</h2>
                <span className="k-num font-mono text-sm text-muted">
                  {DOUSHI_COUNT.total} kata
                </span>
              </div>
              <p className="mt-2 text-[14px] leading-relaxed text-body">
                Kata kerja dari 50 bab, dibagi golongan{" "}
                <span className="font-display text-ink">1</span>,{" "}
                <span className="font-display text-ink">2</span>, dan{" "}
                <span className="font-display text-ink">3</span> — plus bentuk kamus.
              </p>
            </div>
            <HankoSeal mark="動" size="lg" className="hidden shrink-0 rotate-[4deg] sm:block" />
          </div>
        </PaperCard>

        {/* —— Kartu aturan menghafal —— */}
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
                Cara cepat mengenali golongan
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
            <div className="mt-2 grid gap-2 animate-fade-rise sm:grid-cols-3">
              {([1, 2, 3] as DoushiKind[]).map((g) => (
                <PaperCard key={g} className="p-3.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`k-num rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold ${KIND_TONE[g]}`}
                    >
                      Gol {g}
                    </span>
                    <span className="font-display text-[15px] text-ink-soft">
                      {GOL_INFO[g].jp}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[13px] leading-snug text-body">
                    {GOL_INFO[g].tips}
                  </p>
                </PaperCard>
              ))}
            </div>
          )}
        </section>

        {/* —— Kontrol: switch golongan + pencarian —— */}
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Segmented options={FILTER_OPTIONS} value={filter} onChange={setFilter} />
            <span className="k-num font-mono text-[12px] text-muted">
              {list.length} kata{q && " cocok"}
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
              placeholder="Cari ます / kamus / kanji / arti…"
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
        </div>

        {/* —— Progres hafal —— */}
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
              Coba kata lain, atau ganti golongan.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {list.map((d) => {
              const marked = isHafal(d.bab, d.no);
              const key = `${d.bab}-${d.no}`;
              return (
                <PaperCard key={key} className="flex items-start gap-3 p-3.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-2xl leading-tight text-ink">
                        <JpText text={d.kana} />
                      </span>
                      <span
                        className={`k-num shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold ${KIND_TONE[d.kind]}`}
                      >
                        {d.kind}
                      </span>
                      {d.kanji && (
                        <span className="truncate font-display text-sm text-muted">
                          <JpText text={d.kanji} />
                        </span>
                      )}
                    </div>

                    {/* bentuk kamus — membantu menghafal pola */}
                    <p className="mt-1 flex items-center gap-1.5 text-[13px] text-muted">
                      <AppIcon icon="ph:arrow-elbow-down-right" className="text-xs" />
                      <span className="font-display text-ink-soft">
                        <JpText text={d.kamus} />
                      </span>
                      <span className="k-num font-mono text-[10px] uppercase tracking-wide">
                        kamus
                      </span>
                    </p>

                    <p className="mt-0.5 text-[14px] leading-snug text-body">{d.arti}</p>
                    <p className="k-num mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                      bab {d.bab}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-center gap-1.5">
                    {canSpeak && (
                      <button
                        type="button"
                        onClick={() => {
                          const ok = speech.speak(d.kana);
                          setSpeakingKey(ok ? key : null);
                        }}
                        aria-label={`Dengarkan ${d.kana}`}
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
                      onClick={() => toggleHafal(d.bab, d.no)}
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
          <button type="button" onClick={onBack} className="k-chip k-chip-off">
            <AppIcon icon="ph:caret-left" className="text-[13px]" />
            Kembali ke Home
          </button>
        </div>
      </div>
    </div>
  );
}
