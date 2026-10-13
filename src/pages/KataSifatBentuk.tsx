import { useMemo, useState } from "react";
import {
  KEIYOUSHI_BENTUK,
  KEIYOUSHI_BENTUK_COUNT,
  type KeiyoushiBentuk,
} from "../data/keiyoushi_konjugasi";
import { BABS_META } from "../data";
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
type BabPick = "semua" | number;

const FILTER_OPTIONS = [
  { value: "semua" as const, label: `Semua (${KEIYOUSHI_BENTUK_COUNT.total})`, short: "Semua" },
  { value: "na" as const, label: `な (${KEIYOUSHI_BENTUK_COUNT.na})`, short: "な" },
  { value: "i" as const, label: `い (${KEIYOUSHI_BENTUK_COUNT.i})`, short: "い" },
];

/** Empat bentuk yang ditampilkan per kata — urutan ini yang dipakai di UI. */
const BENTUK_KEYS = ["positifKini", "positifLampau", "negatifKini", "negatifLampau"] as const;
type BentukKey = (typeof BENTUK_KEYS)[number];

interface BentukMeta {
  label: string;
  jp: string;
  /** true = bentuk positif, dipakai untuk warna. */
  positif: boolean;
  /** true = bentuk lampau, dipakai untuk label sekunder. */
  lampau: boolean;
}

const BENTUK_META: Record<BentukKey, BentukMeta> = {
  positifKini: { label: "Positif kini", jp: "肯定・現在", positif: true, lampau: false },
  positifLampau: { label: "Positif lampau", jp: "肯定・過去", positif: true, lampau: true },
  negatifKini: { label: "Negatif kini", jp: "否定・現在", positif: false, lampau: false },
  negatifLampau: { label: "Negatif lampau", jp: "否定・過去", positif: false, lampau: true },
};

function matches(k: KeiyoushiBentuk, q: string): boolean {
  if (!q) return true;
  const n = q.toLowerCase().trim();
  return (
    k.kana.toLowerCase().includes(n) ||
    k.kanji.toLowerCase().includes(n) ||
    k.arti.toLowerCase().includes(n) ||
    k.positifKini.toLowerCase().includes(n) ||
    k.positifLampau.toLowerCase().includes(n) ||
    k.negatifKini.toLowerCase().includes(n) ||
    k.negatifLampau.toLowerCase().includes(n)
  );
}

export default function KataSifatBentuk({ onBack }: Props) {
  const [filter, setFilter] = useState<FilterKind>("semua");
  const [bab, setBab] = useState<BabPick>("semua");
  const [query, setQuery] = useState("");
  /** Kata yang bentuknya sedang dibuka (default: tertutup semua — untuk uji diri). */
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const { isHafal, toggleHafal } = useProgress();
  const speech = useSpeech();
  const canSpeak = speech.supported && speech.hasVoice;
  const [speakingKey, setSpeakingKey] = useState<string | null>(null);

  const q = query.trim();

  // Bab yang benar-benar punya kata sifat — untuk mengisi pemilih bab.
  const babTersedia = useMemo(() => {
    const set = new Set(KEIYOUSHI_BENTUK.map((k) => k.bab));
    return BABS_META.filter((b) => set.has(b.bab)).map((b) => b.bab);
  }, []);

  const list = useMemo(() => {
    return KEIYOUSHI_BENTUK.filter((k) => {
      if (filter !== "semua" && k.kind !== filter) return false;
      if (bab !== "semua" && k.bab !== bab) return false;
      return matches(k, q);
    });
  }, [filter, bab, q]);

  const hafalCount = useMemo(
    () => list.filter((k) => isHafal(k.bab, k.no)).length,
    [list, isHafal],
  );

  const allOpen = list.length > 0 && list.every((k) => open.has(`${k.bab}-${k.no}`));

  function toggleOpen(key: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function setAll(dibuka: boolean) {
    setOpen(() => {
      if (!dibuka) return new Set<string>();
      return new Set(list.map((k) => `${k.bab}-${k.no}`));
    });
  }

  return (
    <div className="min-h-full pb-24">
      <TopBar
        title="Bentuk Kata Sifat"
        subtitle="けいようし · 肯定 & 否定"
        onBack={onBack}
      />

      <div className="mx-auto max-w-3xl px-4 pt-4">
        {/* —— Hero ringkas —— */}
        <PaperCard raised tape className="k-margin overflow-hidden pl-10 pr-5 py-5">
          <div className="flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="k-eyebrow">Keiyoushi · 現在 & 過去</p>
              <div className="mt-1.5 flex items-baseline gap-2.5">
                <h2 className="font-display text-4xl leading-none text-ink">
                  形容詞
                </h2>
                <span className="k-num font-mono text-sm text-muted">
                  {KEIYOUSHI_BENTUK_COUNT.total} kata
                </span>
              </div>
              <p className="mt-2 text-[14px] leading-relaxed text-body">
                Perubahan <span className="font-display text-ink">positif</span> &{" "}
                <span className="font-display text-ink">negatif</span> kata sifat —
                kini & lampau. Buka tiap bentuk untuk menghafal.
              </p>
            </div>
            <HankoSeal mark="変" size="lg" className="hidden shrink-0 rotate-[4deg] sm:block" />
          </div>
        </PaperCard>

        {/* —— Kartu cara membaca bentuk —— */}
        <section className="mt-4 grid gap-2 sm:grid-cols-2">
          <PaperCard className="p-3.5">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-ink/[0.08] px-2 py-0.5 font-mono text-[11px] font-semibold text-ink-soft">
                い
              </span>
              <span className="font-display text-[15px] text-ink-soft">i-adjektiva</span>
            </div>
            <p className="mt-1.5 text-[13px] leading-snug text-body">
              い di akhir berubah jadi kunci:{" "}
              <span className="font-jp text-ink">たかい</span> →{" "}
              <span className="font-jp text-ink">たかくない</span>,{" "}
              <span className="font-jp text-ink">たかかった</span>.
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
              Dasar + penanda:{" "}
              <span className="font-jp text-ink">げんきだ</span> →{" "}
              <span className="font-jp text-ink">げんきじゃない</span>,{" "}
              <span className="font-jp text-ink">げんきだった</span>.
            </p>
          </PaperCard>
        </section>

        {/* —— Kontrol: filter jenis + pilih bab + pencarian —— */}
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Segmented options={FILTER_OPTIONS} value={filter} onChange={setFilter} />
            <span className="k-num font-mono text-[12px] text-muted">
              {list.length} kata{q && " cocok"}
            </span>
          </div>

          {/* Pemilih bab */}
          <div className="flex items-center gap-3">
            <label
              htmlFor="pilih-bab"
              className="k-eyebrow shrink-0"
            >
              Bab
            </label>
            <select
              id="pilih-bab"
              value={bab === "semua" ? "semua" : String(bab)}
              onChange={(e) =>
                setBab(e.target.value === "semua" ? "semua" : Number(e.target.value))
              }
              className="h-10 min-w-0 flex-1 rounded-card border border-line/[0.12] bg-surface px-3
                text-[14px] text-ink outline-none transition-[border-color,box-shadow] duration-150
                focus:border-accent/50 focus:shadow-soft"
            >
              <option value="semua">Semua bab</option>
              {babTersedia.map((b) => (
                <option key={b} value={b}>
                  Bab {b}
                </option>
              ))}
            </select>
            <span className="k-num shrink-0 font-mono text-[11px] text-muted">
              {babTersedia.length} bab
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

        {/* —— Progres hafal + tombol buka/tutup semua —— */}
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
            <button
              type="button"
              onClick={() => setAll(!allOpen)}
              aria-pressed={allOpen}
              className={["k-chip", allOpen ? "k-chip-on" : "k-chip-off"].join(" ")}
            >
              <AppIcon
                icon={allOpen ? "ph:caret-up" : "ph:caret-down"}
                className="text-[13px]"
              />
              {allOpen ? "Tutup semua" : "Buka semua"}
            </button>
          </div>
        )}

        {/* —— Daftar —— */}
        {list.length === 0 ? (
          <div className="py-16 text-center">
            <AppIcon icon="ph:magnifying-glass" className="mx-auto text-4xl text-muted/50" />
            <p className="mt-3 font-display text-2xl text-ink">見つかりません</p>
            <p className="mt-1.5 text-sm text-muted">
              Coba kata lain, ganti jenis, atau pilih bab berbeda.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-2.5">
            {list.map((k) => {
              const marked = isHafal(k.bab, k.no);
              const key = `${k.bab}-${k.no}`;
              const dibuka = open.has(key);
              return (
                <PaperCard key={key} className="overflow-hidden">
                  {/* Header kartu */}
                  <div className="flex items-start gap-3 p-3.5">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
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
                          <span className="font-display text-sm text-muted">
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
                  </div>

                  {/* Tombol buka/tutup + daftar 4 bentuk */}
                  <div className="border-t border-line/[0.08]">
                    <button
                      type="button"
                      onClick={() => toggleOpen(key)}
                      aria-expanded={dibuka}
                      className="flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left
                        transition hover:bg-ink/[0.03]"
                    >
                      <span className="flex items-center gap-2 text-[13px] font-semibold text-ink-soft">
                        <AppIcon icon="ph:arrows-clockwise" className="text-[15px]" />
                        Positif &amp; negatif · kini &amp; lampau
                      </span>
                      <AppIcon
                        icon="ph:caret-down"
                        className={`text-[15px] text-muted transition-transform duration-200 ${
                          dibuka ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* `k-collapse` men-transisi tinggi via grid-template-rows.
                        Isi di-unmount saat tertutup (sama seperti BabAccordion) supaya
                        DOM tidak menyimpan ratusan baris bentuk yang tak terlihat. */}
                    <div
                      className={["k-collapse", dibuka ? "k-collapse-open" : ""].join(" ")}
                    >
                      <div className="overflow-hidden">
                        {dibuka && (
                        <ul className="divide-y divide-line/[0.07] border-t border-line/[0.07]">
                          {BENTUK_KEYS.map((bk) => {
                            const meta = BENTUK_META[bk];
                            const teks = k[bk];
                            return (
                              <li
                                key={bk}
                                className="flex items-center gap-3 px-3.5 py-2.5"
                              >
                                <span className="w-28 shrink-0">
                                  <span className="block text-[13px] font-semibold leading-tight text-ink">
                                    {meta.label}
                                  </span>
                                  <span className="font-jp block text-[11px] leading-tight text-muted">
                                    {meta.jp}
                                  </span>
                                </span>
                                <span
                                  className={`font-display text-[19px] leading-tight ${
                                    meta.positif ? "text-ink" : "text-seal"
                                  }`}
                                >
                                  <JpText text={teks} />
                                </span>
                                <span className="ml-auto text-muted/40">
                                  <AppIcon
                                    icon={meta.positif ? "ph:check-circle" : "ph:x-circle"}
                                    className="text-[15px]"
                                  />
                                </span>
                              </li>
                            );
                          })}
                          {k.kind === "na" && (
                            <li className="flex items-center gap-3 bg-sunken/40 px-3.5 py-2">
                              <span className="w-28 shrink-0 text-[12px] font-semibold text-muted">
                                Bentuk + 名詞
                              </span>
                              <span className="font-jp text-[15px] text-ink-soft">
                                <JpText text={k.attributif} /> + 名詞
                              </span>
                              <span className="ml-auto font-mono text-[10px] uppercase tracking-wide text-muted/70">
                                na-adj
                              </span>
                            </li>
                          )}
                        </ul>
                        )}
                      </div>
                    </div>
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
