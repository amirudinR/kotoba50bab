import { useEffect, useMemo, useState } from "react";
import {
  DOUSHI_TE,
  DOUSHI_TE_COUNT,
  type DoushiTe,
} from "../data/doushi_te";
import type { DoushiKind } from "../data/doushi";
import { BABS_META } from "../data";
import { useProgress } from "../store/progress";
import { useSpeech } from "../lib/speech";
import TopBar from "../components/TopBar";
import PaperCard from "../components/PaperCard";
import HankoSeal from "../components/HankoSeal";
import { Segmented, Chip } from "../components/Controls";
import { useColWidths, pickWidth } from "../store/colwidth";
import { useColVis, isVisible } from "../store/colvis";
import ColResizer from "../components/ColResizer";
import JpText from "../components/JpText";
import AppIcon from "../components/Icon";

interface Props {
  onBack: () => void;
}

type FilterKind = "semua" | "1" | "2" | "3";

const FILTER_OPTIONS = [
  { value: "semua" as const, label: `Semua (${DOUSHI_TE_COUNT.total})`, short: "Semua" },
  { value: "1" as const, label: `Gol 1 · ${DOUSHI_TE_COUNT.g1}`, short: "1" },
  { value: "2" as const, label: `Gol 2 · ${DOUSHI_TE_COUNT.g2}`, short: "2" },
  { value: "3" as const, label: `Gol 3 · ${DOUSHI_TE_COUNT.g3}`, short: "3" },
];

/** Baris aturan て-form per akhiran kamus (kartu bantu menghafal). */
const ATURAN: { title: string; jp: string; rows: [string, string, string][] }[] = [
  {
    title: "Golongan 1",
    jp: "五段 (godan)",
    rows: [
      ["う・つ・る", "って", "かう → かって"],
      ["む・ぶ・ぬ", "んで", "のむ → のんで"],
      ["く", "いて", "かく → かいて"],
      ["ぐ", "いで", "およぐ → およいで"],
      ["す", "して", "はなす → はなして"],
    ],
  },
  {
    title: "Golongan 2",
    jp: "一段 (ichidan)",
    rows: [["る", "て", "たべる → たべて"]],
  },
  {
    title: "Golongan 3",
    jp: "不規則 (fukisoku)",
    rows: [
      ["する", "して", "べんきょうする → して"],
      ["くる", "きて", "くる → きて"],
    ],
  },
];

const KIND_TONE: Record<DoushiKind, string> = {
  1: "bg-ink/[0.08] text-ink-soft",
  2: "bg-accent-soft text-accent",
  3: "bg-seal/10 text-seal",
};

const KIND_DESC: Record<FilterKind, string> = {
  semua: "Semua kata kerja — て-form dibentuk dari bentuk kamus.",
  "1": "Golongan 1 (五段): perubahan akhiran mengikuti baris kana.",
  "2": "Golongan 2 (一段): cukup buang る lalu tambah て.",
  "3": "Golongan 3 (不規則): hanya する → して dan くる → きて.",
};

/** Lebar default kolom (px) — bisa diubah pengguna lewat drag (disimpan di localStorage). */
const WIDTH = { no: 44, kata: 170, arti: 220, kamus: 148, te: 148 } as const;

type ColKeyTe = keyof typeof WIDTH;

/** Id tabel untuk menyimpan lebar kolom di localStorage. */
const TABLE_ID = "te";

/** 2 tombol chip untuk menyembunyikan/menampilkan kolom bentuk kata kerja. */
const BENTUK_TOGGLES: { key: ColKeyTe; label: string }[] = [
  { key: "kamus", label: "Kamus" },
  { key: "te", label: "て" },
];

function matches(d: DoushiTe, q: string): boolean {
  if (!q) return true;
  const n = q.toLowerCase().trim();
  return (
    d.kana.toLowerCase().includes(n) ||
    d.kamus.toLowerCase().includes(n) ||
    d.te.toLowerCase().includes(n) ||
    d.kanji.toLowerCase().includes(n) ||
    d.arti.toLowerCase().includes(n) ||
    d.romaji.toLowerCase().includes(n)
  );
}

export default function KataKerjaTe({ onBack }: Props) {
  const [filter, setFilter] = useState<FilterKind>("semua");
  const [query, setQuery] = useState("");
  const [showRules, setShowRules] = useState(true);
  const [open, setOpen] = useState<Set<number>>(() => new Set());
  const { isHafal, toggleHafal } = useProgress();
  const speech = useSpeech();
  const canSpeak = speech.supported && speech.hasVoice;
  const [speakingKey, setSpeakingKey] = useState<string | null>(null);
  // Kolom bentuk yang disembunyikan (chip di atas tabel).
  const hiddenBentuk = useColVis((s) => s.hidden[TABLE_ID]);
  const toggleCol = useColVis((s) => s.toggle);
  const setManyCols = useColVis((s) => s.setMany);
  const semuaTampil = BENTUK_TOGGLES.every((t) => isVisible(hiddenBentuk, t.key));

  const q = query.trim();

  // Mode "Semua bab": hanya saat filter = semua DAN tidak sedang mencari.
  const tampilSemuaBab = filter === "semua" && q === "";

  const babGroups = useMemo(() => {
    const map = new Map<number, DoushiTe[]>();
    for (const d of DOUSHI_TE) {
      if (filter !== "semua" && String(d.kind) !== filter) continue;
      if (!matches(d, q)) continue;
      const arr = map.get(d.bab);
      if (arr) arr.push(d);
      else map.set(d.bab, [d]);
    }
    if (tampilSemuaBab) {
      return BABS_META.map((b) => ({
        bab: b.bab,
        items: map.get(b.bab) ?? [],
      }));
    }
    return BABS_META.filter((b) => map.has(b.bab)).map((b) => ({
      bab: b.bab,
      items: map.get(b.bab)!,
    }));
  }, [filter, q, tampilSemuaBab]);

  const babIsi = useMemo(
    () => babGroups.filter((g) => g.items.length > 0),
    [babGroups],
  );

  const totalTampil = useMemo(
    () => babIsi.reduce((n, g) => n + g.items.length, 0),
    [babIsi],
  );

  const hafalCount = useMemo(
    () =>
      babIsi.reduce(
        (n, g) => n + g.items.filter((d) => isHafal(d.bab, d.no)).length,
        0,
      ),
    [babIsi, isHafal],
  );

  const allOpen =
    babIsi.length > 0 && babIsi.every((g) => open.has(g.bab));

  function toggleBab(bab: number) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(bab)) next.delete(bab);
      else next.add(bab);
      return next;
    });
  }

  function setAll(dibuka: boolean) {
    setOpen(dibuka ? new Set(babIsi.map((g) => g.bab)) : new Set<number>());
  }

  return (
    <div className="min-h-full pb-24">
      <TopBar title="Bentuk て" subtitle="どうし · て形" onBack={onBack} />

      <div className="mx-auto w-full px-4 pt-4">
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
                Tabel bentuk{" "}
                <span className="font-display text-ink">て</span> dari bentuk kamus, per
                bab — dipakai untuk permintaan, izin, dan menyambung kalimat.
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
            <Segmented options={FILTER_OPTIONS} value={filter} onChange={setFilter} />
            <span className="k-num font-mono text-[12px] text-muted">
              {totalTampil} kata · {babIsi.length} bab
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
              onClick={() => setManyCols(TABLE_ID, BENTUK_TOGGLES.map((t) => t.key), !semuaTampil)}
              className="k-chip k-chip-off ml-auto"
            >
              <AppIcon
                icon={semuaTampil ? "ph:eye-slash" : "ph:eye"}
                className="text-[13px]"
              />
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

        {/* —— Progres hafal + tombol buka/tutup semua bab —— */}
        {babIsi.length > 0 && (
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
        {totalTampil === 0 ? (
          <div className="py-16 text-center">
            <AppIcon icon="ph:magnifying-glass" className="mx-auto text-4xl text-muted/50" />
            <p className="mt-3 font-display text-2xl text-ink">見つかりません</p>
            <p className="mt-1.5 text-sm text-muted">
              Coba kata lain, atau ganti golongan.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-2.5">
            {babGroups.map((g) => (
              <BabTe
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
                hidden={hiddenBentuk}
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
   Satu blok bab: header buka/tutup + tabel て-form.
   Isi di-unmount setelah animasi tutup selesai (pola BabAccordion).
   ============================================================ */

interface BabTeProps {
  bab: number;
  items: DoushiTe[];
  open: boolean;
  onToggle: () => void;
  isHafal: (bab: number, no: number) => boolean;
  onToggleHafal: (bab: number, no: number) => void;
  canSpeak: boolean;
  speak: (t: string) => boolean;
  speakingKey: string | null;
  setSpeakingKey: (k: string | null) => void;
  /** Peta kolom yang disembunyikan (dari useColVis). */
  hidden: Record<string, boolean> | undefined;
}

function BabTe({
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
  hidden,
}: BabTeProps) {
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    const t = setTimeout(() => setMounted(false), 280);
    return () => clearTimeout(t);
  }, [open]);

  const hafalBab = items.filter((d) => isHafal(d.bab, d.no)).length;
  const kosong = items.length === 0;

  const overrides = useColWidths((s) => s.widths[TABLE_ID]);
  const setWidth = useColWidths((s) => s.setWidth);
  const widthOf = (key: ColKeyTe) => pickWidth(overrides, key, WIDTH[key]);

  // Kolom yang dirender (kamus & て bisa disembunyikan).
  const showKamus = isVisible(hidden, "kamus");
  const showTe = isVisible(hidden, "te");
  const fixed =
    widthOf("no") +
    widthOf("kata") +
    widthOf("arti") +
    (showKamus ? widthOf("kamus") : 0) +
    (showTe ? widthOf("te") : 0);

  // Bab tanpa kata kerja: header ditandai, tombol buka/tutup dimatikan.
  if (kosong) {
    return (
      <section className="k-card overflow-hidden opacity-60">
        <div className="flex w-full items-center gap-3 px-3 py-3 sm:px-4">
          <AppIcon icon="ph:minus" className="shrink-0 text-[15px] text-muted/60" />
          <span className="min-w-0 flex-1">
            <span className="flex items-baseline gap-2">
              <span className="font-display text-[16px] font-semibold leading-none text-ink-soft sm:text-[17px]">
                Bab {bab}
              </span>
              <span className="k-num text-[12.5px] text-muted">0 kata</span>
            </span>
            <span className="mt-1 block text-[12px] leading-none text-muted/70">
              Tidak ada kata kerja di bab ini
            </span>
          </span>
        </div>
      </section>
    );
  }

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
        aria-controls={`te-bab-${bab}-isi`}
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
        id={`te-bab-${bab}-isi`}
        className={["k-collapse", open ? "k-collapse-open" : ""].join(" ")}
      >
        <div>
          {mounted && (
            <div className="scroll-slim overflow-x-auto border-t border-line/[0.07]">
              <table
                className="w-full border-separate border-spacing-0 text-[14px]"
                style={{ minWidth: fixed + 140, tableLayout: "fixed" }}
              >
                <colgroup>
                  <col style={{ width: `${widthOf("no")}px` }} />
                  <col style={{ width: `${widthOf("kata")}px` }} />
                  <col style={{ width: `${widthOf("arti")}px` }} />
                  {showKamus && <col style={{ width: `${widthOf("kamus")}px` }} />}
                  {showTe && <col style={{ width: `${widthOf("te")}px` }} />}
                </colgroup>

                <thead>
                  <tr>
                    <th className="border-b border-line/10 bg-sunken/70 px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-muted/85">
                      No
                    </th>
                    <th className="relative border-b border-line/10 bg-sunken/70 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-muted/85">
                      Kata
                      <ColResizer
                        width={widthOf("kata")}
                        label="Lebar kolom Kata"
                        onResize={(w) => setWidth(TABLE_ID, "kata", w)}
                      />
                    </th>
                    <th className="relative border-b border-line/10 bg-sunken/70 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-muted/85">
                      Arti
                      <ColResizer
                        width={widthOf("arti")}
                        label="Lebar kolom Arti"
                        onResize={(w) => setWidth(TABLE_ID, "arti", w)}
                      />
                    </th>
                    {showKamus && (
                      <th className="relative border-b border-l border-line/10 bg-sunken/70 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-muted/85">
                        Kamus
                        <ColResizer
                          width={widthOf("kamus")}
                          label="Lebar kolom Kamus"
                          onResize={(w) => setWidth(TABLE_ID, "kamus", w)}
                        />
                      </th>
                    )}
                    {showTe && (
                      <th className="relative border-b border-l border-line/10 bg-accent-soft/60 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-accent">
                        て
                        <ColResizer
                          width={widthOf("te")}
                          label="Lebar kolom て"
                          onResize={(w) => setWidth(TABLE_ID, "te", w)}
                        />
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {items.map((d) => {
                    const key = `${d.bab}-${d.no}`;
                    const marked = isHafal(d.bab, d.no);
                    return (
                      <tr
                        key={key}
                        className="group transition-colors duration-100 hover:bg-ink/[0.045] focus-within:bg-ink/[0.045]"
                      >
                        <td className="k-rownum border-b border-line/[0.06] px-3 py-[9px] text-center">
                          {d.no}
                        </td>
                        <td className="border-b border-line/[0.06] px-3 py-[9px]">
                          <span className="flex items-center gap-1.5">
                            <span className="k-kana overflow-hidden whitespace-nowrap text-ellipsis" title={d.kamus}>
                              <JpText text={d.kamus} />
                            </span>
                            <span
                              className={`k-num shrink-0 rounded px-1 py-0.5 font-mono text-[9.5px] font-semibold ${KIND_TONE[d.kind]}`}
                            >
                              {d.kind}
                            </span>
                            <button
                              type="button"
                              onClick={() => onToggleHafal(d.bab, d.no)}
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
                          {d.kanji && (
                            <span className="k-kanji mt-0.5 block overflow-hidden whitespace-nowrap text-ellipsis text-[11.5px] text-muted" title={d.kanji}>
                              <JpText text={d.kanji} />
                            </span>
                          )}
                        </td>
                        <td className="border-b border-line/[0.06] px-3 py-[9px]">
                          <span className="flex items-center gap-2">
                            {canSpeak && (
                              <button
                                type="button"
                                onClick={() => setSpeakingKey(speak(d.te) ? key : null)}
                                aria-label={`Dengarkan ${d.te}`}
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
                              {d.arti}
                            </span>
                          </span>
                        </td>
                        {showKamus && (
                          <td className="border-b border-l border-line/[0.06] px-3 py-[9px] font-jp text-[14px] text-ink-soft">
                            <span className="block overflow-hidden whitespace-nowrap text-ellipsis" title={d.kamus}>
                              <JpText text={d.kamus} />
                            </span>
                          </td>
                        )}
                        {showTe && (
                          <td className="border-b border-l border-line/[0.06] px-3 py-[9px] font-jp text-[15px] font-semibold text-accent">
                            <span className="block overflow-hidden whitespace-nowrap text-ellipsis" title={d.te}>
                              <JpText text={d.te} />
                            </span>
                          </td>
                        )}
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
