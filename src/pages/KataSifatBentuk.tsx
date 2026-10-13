import { useEffect, useMemo, useState } from "react";
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

const FILTER_OPTIONS = [
  { value: "semua" as const, label: `Semua (${KEIYOUSHI_BENTUK_COUNT.total})`, short: "Semua" },
  { value: "na" as const, label: `な (${KEIYOUSHI_BENTUK_COUNT.na})`, short: "な" },
  { value: "i" as const, label: `い (${KEIYOUSHI_BENTUK_COUNT.i})`, short: "い" },
];

const FILTER_DESC: Record<FilterKind, string> = {
  semua: "Kata sifat な dan い — kolom positif di kiri, negatif di kanan.",
  na: "Kata sifat な — menerangkan kata benda dengan な (げんきな人).",
  i: "Kata sifat い — berakhiran い dan berubah sendiri tanpa だ.",
};

/** Lebar kolom dalam px — dipakai bersama `table-layout: fixed` + `<colgroup>`. */
const WIDTH = {
  no: 44,
  kata: 150,
  arti: 0, // sisa ruang
  posKini: 132,
  posLampau: 148,
  negKini: 132,
  negLampau: 148,
} as const;

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
  const [query, setQuery] = useState("");
  /** Bab yang sedang terbuka (default: tertutup semua). */
  const [open, setOpen] = useState<Set<number>>(() => new Set());
  const { isHafal, toggleHafal } = useProgress();
  const speech = useSpeech();
  const canSpeak = speech.supported && speech.hasVoice;
  const [speakingKey, setSpeakingKey] = useState<string | null>(null);

  const q = query.trim();

  // Bab yang punya kata sifat, lengkap dengan daftar katanya (sudah difilter).
  const babGroups = useMemo(() => {
    const map = new Map<number, KeiyoushiBentuk[]>();
    for (const k of KEIYOUSHI_BENTUK) {
      if (filter !== "semua" && k.kind !== filter) continue;
      if (!matches(k, q)) continue;
      const arr = map.get(k.bab);
      if (arr) arr.push(k);
      else map.set(k.bab, [k]);
    }
    return BABS_META.filter((b) => map.has(b.bab)).map((b) => ({
      bab: b.bab,
      items: map.get(b.bab)!,
    }));
  }, [filter, q]);

  const totalTampil = useMemo(
    () => babGroups.reduce((n, g) => n + g.items.length, 0),
    [babGroups],
  );

  const hafalCount = useMemo(
    () =>
      babGroups.reduce(
        (n, g) => n + g.items.filter((k) => isHafal(k.bab, k.no)).length,
        0,
      ),
    [babGroups, isHafal],
  );

  const allOpen =
    babGroups.length > 0 && babGroups.every((g) => open.has(g.bab));

  function toggleBab(bab: number) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(bab)) next.delete(bab);
      else next.add(bab);
      return next;
    });
  }

  function setAll(dibuka: boolean) {
    setOpen(dibuka ? new Set(babGroups.map((g) => g.bab)) : new Set<number>());
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
                Tabel lengkap bentuk{" "}
                <span className="font-display text-ink">positif</span> (kiri) &{" "}
                <span className="font-display text-ink">negatif</span> (kanan) —
                kini & lampau, per bab.
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
            <Segmented options={FILTER_OPTIONS} value={filter} onChange={setFilter} />
            <span className="k-num font-mono text-[12px] text-muted">
              {totalTampil} kata · {babGroups.length} bab
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

          <p className="text-[13px] leading-relaxed text-muted">{FILTER_DESC[filter]}</p>
        </div>

        {/* —— Progres hafal + tombol buka/tutup semua bab —— */}
        {babGroups.length > 0 && (
          <div className="mt-4 flex items-center gap-3 border-y border-line/15 py-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sunken text-ink-soft">
              <AppIcon icon="ph:star" className="text-lg" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[14px] text-body">Sudah hafal</span>
                <span className="k-num font-display text-lg leading-none text-ink">
                  {hafalCount}
                  <span className="text-muted">/{totalTampil}</span>
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

        {/* —— Daftar tabel per bab —— */}
        {babGroups.length === 0 ? (
          <div className="py-16 text-center">
            <AppIcon icon="ph:magnifying-glass" className="mx-auto text-4xl text-muted/50" />
            <p className="mt-3 font-display text-2xl text-ink">見つかりません</p>
            <p className="mt-1.5 text-sm text-muted">
              Coba kata lain, atau ganti jenis kata sifat.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-2.5">
            {babGroups.map((g) => (
              <BabBentuk
                key={g.bab}
                bab={g.bab}
                items={g.items}
                open={open.has(g.bab)}
                onToggle={() => toggleBab(g.bab)}
                isHafal={isHafal}
                onToggleHafal={toggleHafal}
                canSpeak={canSpeak}
                speak={speech.speak}
                speakingKey={speakingKey}
                setSpeakingKey={setSpeakingKey}
              />
            ))}
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

/* ============================================================
   Satu blok bab: header buka/tutup + tabel bentuk.
   Isi di-unmount setelah animasi tutup selesai (pola BabAccordion),
   supaya DOM tidak menyimpan tabel bab yang sudah ditutup.
   ============================================================ */

interface BabBentukProps {
  bab: number;
  items: KeiyoushiBentuk[];
  open: boolean;
  onToggle: () => void;
  isHafal: (bab: number, no: number) => boolean;
  onToggleHafal: (bab: number, no: number) => void;
  canSpeak: boolean;
  speak: (t: string) => boolean;
  speakingKey: string | null;
  setSpeakingKey: (k: string | null) => void;
}

function BabBentuk({
  bab,
  items,
  open,
  onToggle,
  isHafal,
  onToggleHafal,
  canSpeak,
  speak,
  speakingKey,
  setSpeakingKey,
}: BabBentukProps) {
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    const t = setTimeout(() => setMounted(false), 280);
    return () => clearTimeout(t);
  }, [open]);

  const hafalBab = items.filter((k) => isHafal(k.bab, k.no)).length;

  const fixed = WIDTH.no + WIDTH.kata + WIDTH.posKini + WIDTH.posLampau + WIDTH.negKini + WIDTH.negLampau;

  return (
    <section
      className={[
        "k-card overflow-hidden transition-[border-color,box-shadow] duration-200",
        open ? "border-line/20" : "hover:border-line/25",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`bentuk-bab-${bab}-isi`}
        className="flex w-full items-center gap-3 px-3 py-3 text-left
          transition-colors duration-150 hover:bg-ink/[0.035] sm:px-4"
      >
        <AppIcon
          icon="ph:caret-right"
          className={[
            "shrink-0 text-[15px] text-muted transition-transform duration-200",
            open ? "rotate-90" : "",
          ].join(" ")}
        />
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline gap-2">
            <span className="font-display text-[16px] font-semibold leading-none text-ink sm:text-[17px]">
              Bab {bab}
            </span>
            <span className="k-num text-[12.5px] text-muted">{items.length} kata</span>
          </span>
          <span className="mt-1 block text-[12px] leading-none text-muted/80">
            {hafalBab} / {items.length} sudah hafal
          </span>
        </span>
        <AppIcon
          icon="ph:caret-down"
          className={[
            "shrink-0 text-[16px] text-muted transition-transform duration-200",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      <div
        id={`bentuk-bab-${bab}-isi`}
        className={["k-collapse", open ? "k-collapse-open" : ""].join(" ")}
      >
        <div>
          {mounted && (
            <div className="scroll-slim overflow-x-auto border-t border-line/[0.07]">
              <table
                className="w-full border-separate border-spacing-0 text-[14px]"
                style={{ minWidth: fixed + 120, tableLayout: "fixed" }}
              >
                <colgroup>
                  <col style={{ width: `${WIDTH.no}px` }} />
                  <col style={{ width: `${WIDTH.kata}px` }} />
                  <col />
                  <col style={{ width: `${WIDTH.posKini}px` }} />
                  <col style={{ width: `${WIDTH.posLampau}px` }} />
                  <col style={{ width: `${WIDTH.negKini}px` }} />
                  <col style={{ width: `${WIDTH.negLampau}px` }} />
                </colgroup>

                <thead>
                  <tr>
                    <th className="border-b border-line/10 bg-sunken/70 px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-muted/85">
                      No
                    </th>
                    <th className="border-b border-line/10 bg-sunken/70 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-muted/85">
                      Kata
                    </th>
                    <th className="border-b border-line/10 bg-sunken/70 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-muted/85">
                      Arti
                    </th>
                    <th
                      colSpan={2}
                      className="border-b border-l border-line/10 bg-success-soft/60 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-success"
                    >
                      Positif (肯定)
                    </th>
                    <th
                      colSpan={2}
                      className="border-b border-l border-line/10 bg-danger-soft/50 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-danger"
                    >
                      Negatif (否定)
                    </th>
                  </tr>
                  <tr>
                    <th className="border-b border-line/10 bg-sunken/40 px-3 py-1.5" aria-hidden />
                    <th className="border-b border-line/10 bg-sunken/40 px-3 py-1.5" aria-hidden />
                    <th className="border-b border-line/10 bg-sunken/40 px-3 py-1.5" aria-hidden />
                    <th className="border-b border-line/[0.07] bg-success-soft/40 px-3 py-1.5 text-left text-[10.5px] font-semibold text-ink-soft">
                      Kini
                    </th>
                    <th className="border-b border-line/[0.07] bg-success-soft/40 px-3 py-1.5 text-left text-[10.5px] font-semibold text-ink-soft">
                      Lampau
                    </th>
                    <th className="border-b border-line/[0.07] bg-danger-soft/30 px-3 py-1.5 text-left text-[10.5px] font-semibold text-ink-soft">
                      Kini
                    </th>
                    <th className="border-b border-line/[0.07] bg-danger-soft/30 px-3 py-1.5 text-left text-[10.5px] font-semibold text-ink-soft">
                      Lampau
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((k) => {
                    const key = `${k.bab}-${k.no}`;
                    const marked = isHafal(k.bab, k.no);
                    return (
                      <tr
                        key={key}
                        className="group transition-colors duration-100 hover:bg-ink/[0.045] focus-within:bg-ink/[0.045]"
                      >
                        <td className="k-rownum border-b border-line/[0.06] px-3 py-[9px] text-center">
                          {k.no}
                        </td>
                        <td className="border-b border-line/[0.06] px-3 py-[9px]">
                          <span className="flex items-center gap-1.5">
                            <span className="k-kana overflow-hidden whitespace-nowrap text-ellipsis" title={k.kana}>
                              <JpText text={k.kana} />
                            </span>
                            <span
                              className={`shrink-0 rounded px-1 py-0.5 font-mono text-[9.5px] font-semibold ${
                                k.kind === "na"
                                  ? "bg-accent-soft text-accent"
                                  : "bg-ink/[0.08] text-ink-soft"
                              }`}
                            >
                              {k.kind === "na" ? "な" : "い"}
                            </span>
                            <button
                              type="button"
                              onClick={() => onToggleHafal(k.bab, k.no)}
                              aria-pressed={marked}
                              aria-label={marked ? "Sudah hafal" : "Tandai sudah hafal"}
                              title={marked ? "Batalkan hafal" : "Tandai hafal"}
                              className={`ml-auto grid h-7 w-7 shrink-0 place-items-center rounded-full text-[13px] transition active:scale-90 ${
                                marked
                                  ? "bg-success-soft text-success"
                                  : "text-muted/50 hover:bg-ink/[0.06] hover:text-ink-soft"
                              }`}
                            >
                              <AppIcon icon={marked ? "ph:check-circle" : "ph:star"} />
                            </button>
                          </span>
                          {k.kanji && (
                            <span className="k-kanji mt-0.5 block overflow-hidden whitespace-nowrap text-ellipsis text-[11.5px] text-muted" title={k.kanji}>
                              <JpText text={k.kanji} />
                            </span>
                          )}
                        </td>
                        <td className="border-b border-line/[0.06] px-3 py-[9px]">
                          <span className="flex items-center gap-2">
                            {canSpeak && (
                              <button
                                type="button"
                                onClick={() => setSpeakingKey(speak(k.kana) ? key : null)}
                                aria-label={`Dengarkan ${k.kana}`}
                                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[13px] transition active:scale-90 ${
                                  speakingKey === key
                                    ? "bg-accent-soft text-accent"
                                    : "text-muted/50 hover:bg-ink/[0.06] hover:text-ink-soft"
                                }`}
                              >
                                <AppIcon icon="ph:speaker-high" />
                              </button>
                            )}
                            <span className="k-arti text-[13.5px] leading-snug text-body">
                              {k.arti}
                            </span>
                          </span>
                        </td>
                        <td className="border-b border-l border-line/[0.06] px-3 py-[9px] font-jp text-[14px] text-ink">
                          <span className="block overflow-hidden whitespace-nowrap text-ellipsis" title={k.positifKini}>
                            <JpText text={k.positifKini} />
                          </span>
                        </td>
                        <td className="border-b border-line/[0.06] px-3 py-[9px] font-jp text-[14px] text-ink">
                          <span className="block overflow-hidden whitespace-nowrap text-ellipsis" title={k.positifLampau}>
                            <JpText text={k.positifLampau} />
                          </span>
                        </td>
                        <td className="border-b border-l border-line/[0.06] px-3 py-[9px] font-jp text-[14px] text-seal">
                          <span className="block overflow-hidden whitespace-nowrap text-ellipsis" title={k.negatifKini}>
                            <JpText text={k.negatifKini} />
                          </span>
                        </td>
                        <td className="border-b border-line/[0.06] px-3 py-[9px] font-jp text-[14px] text-seal">
                          <span className="block overflow-hidden whitespace-nowrap text-ellipsis" title={k.negatifLampau}>
                            <JpText text={k.negatifLampau} />
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
