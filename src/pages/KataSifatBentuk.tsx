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
import { Segmented, Chip } from "../components/Controls";
import { useColWidths, pickWidth } from "../store/colwidth";
import { useColVis, isVisible } from "../store/colvis";
import ColResizer from "../components/ColResizer";
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

/** Lebar default kolom (px). Bisa diubah pengguna lewat drag (disimpan di localStorage). */
const WIDTH = {
  no: 44,
  kata: 150,
  arti: 200,
  kasPosKini: 118,
  kasPosLampau: 132,
  kasNegKini: 138,
  kasNegLampau: 156,
  forPosKini: 118,
  forPosLampau: 132,
  forNegKini: 148,
  forNegLampau: 166,
} as const;

type ColKeyBentuk = keyof typeof WIDTH;

/** Id tabel untuk menyimpan lebar kolom di localStorage. */
const TABLE_ID = "bentuk-sifat";

/** Nama grup untuk header gabungan. `null` = kolom dasar (No/Kata/Arti). */
type GrupBentuk =
  | "kasual-positif"
  | "kasual-negatif"
  | "formal-positif"
  | "formal-negatif";

/** Kolom tabel bentuk lengkap — urutan, label, grup, & pengambilan nilai. */
interface BentukColDef {
  key: ColKeyBentuk;
  /** Label baris-2 (sub-header). Kosong = kolom dasar (No/Kata/Arti). */
  sub: string;
  /** Grup untuk header gabungan; null = kolom dasar. */
  group: GrupBentuk | null;
  /** Nilai teks untuk sel body; null = kolom dasar (khusus). */
  nilai: ((k: KeiyoushiBentuk) => string) | null;
}

const BENTUK_COLS: BentukColDef[] = [
  { key: "no", sub: "", group: null, nilai: null },
  { key: "kata", sub: "", group: null, nilai: null },
  { key: "arti", sub: "", group: null, nilai: null },
  { key: "kasPosKini", sub: "Kini", group: "kasual-positif", nilai: (k) => k.positifKini },
  { key: "kasPosLampau", sub: "Lampau", group: "kasual-positif", nilai: (k) => k.positifLampau },
  { key: "kasNegKini", sub: "Kini", group: "kasual-negatif", nilai: (k) => k.negatifKini },
  { key: "kasNegLampau", sub: "Lampau", group: "kasual-negatif", nilai: (k) => k.negatifLampau },
  { key: "forPosKini", sub: "Kini", group: "formal-positif", nilai: (k) => k.formalPositifKini },
  { key: "forPosLampau", sub: "Lampau", group: "formal-positif", nilai: (k) => k.formalPositifLampau },
  { key: "forNegKini", sub: "Kini", group: "formal-negatif", nilai: (k) => k.formalNegatifKini },
  { key: "forNegLampau", sub: "Lampau", group: "formal-negatif", nilai: (k) => k.formalNegatifLampau },
];

/** Info grup: urutan, label, & tone warna (untuk header gabungan). */
const GRUP_INFO: { id: GrupBentuk; label: string; tone: "success" | "danger" }[] = [
  { id: "kasual-positif", label: "Kasual · Positif (普通形 肯定)", tone: "success" },
  { id: "kasual-negatif", label: "Kasual · Negatif (普通形 否定)", tone: "danger" },
  { id: "formal-positif", label: "Formal · Positif (丁寧形 肯定)", tone: "success" },
  { id: "formal-negatif", label: "Formal · Negatif (丁寧形 否定)", tone: "danger" },
];

/** Gaya bentuk: tampilkan semua, hanya kasual, atau hanya formal. */
type GayaBentuk = "semua" | "kasual" | "formal";

const GAYA_OPTIONS: { value: GayaBentuk; label: string; short: string }[] = [
  { value: "semua", label: "Semua", short: "Semua" },
  { value: "kasual", label: "Kasual (普通形)", short: "Kasual" },
  { value: "formal", label: "Formal (丁寧形)", short: "Formal" },
];

/**
 * 8 tombol chip untuk menyembunyikan/menampilkan kolom bentuk (satu per kolom).
 * `gaya` = "kasual" atau "formal"; chip dengan gaya di luar gaya aktif dinonaktifkan.
 */
const BENTUK_TOGGLES: {
  key: ColKeyBentuk;
  label: string;
  gaya: "kasual" | "formal";
}[] = [
  { key: "kasPosKini", label: "Kasual positif kini", gaya: "kasual" },
  { key: "kasPosLampau", label: "Kasual positif lampau", gaya: "kasual" },
  { key: "kasNegKini", label: "Kasual negatif kini", gaya: "kasual" },
  { key: "kasNegLampau", label: "Kasual negatif lampau", gaya: "kasual" },
  { key: "forPosKini", label: "Formal positif kini", gaya: "formal" },
  { key: "forPosLampau", label: "Formal positif lampau", gaya: "formal" },
  { key: "forNegKini", label: "Formal negatif kini", gaya: "formal" },
  { key: "forNegLampau", label: "Formal negatif lampau", gaya: "formal" },
];


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
  // Kolom bentuk yang disembunyikan (chip di atas tabel).
  const hiddenBentuk = useColVis((s) => s.hidden[TABLE_ID]);
  const toggleCol = useColVis((s) => s.toggle);
  const setManyCols = useColVis((s) => s.setMany);
  // Gaya aktif: semua / kasual / formal (persist per tabel).
  const gaya = (useColVis((s) => s.gaya[TABLE_ID]) ?? "semua") as GayaBentuk;
  const setGaya = useColVis((s) => s.setGaya);
  // Semua chip (dari gaya yang aktif) sedang tampil?
  const togglesAktif = BENTUK_TOGGLES.filter(
    (t) => gaya === "semua" || t.gaya === gaya,
  );
  const semuaTampil = togglesAktif.every((t) => isVisible(hiddenBentuk, t.key));
  const canSpeak = speech.supported && speech.hasVoice;
  const [speakingKey, setSpeakingKey] = useState<string | null>(null);

  const q = query.trim();

  // Mode "Semua bab": hanya saat filter = semua DAN tidak sedang mencari.
  // Di mode ini seluruh bab 1-50 ditampilkan; bab tanpa kata sifat ditandai
  // dan tidak bisa dibuka (tombolnya mati).
  const tampilSemuaBab = filter === "semua" && q === "";

  // Grup per bab + daftar katanya (sudah difilter).
  const babGroups = useMemo(() => {
    const map = new Map<number, KeiyoushiBentuk[]>();
    for (const k of KEIYOUSHI_BENTUK) {
      if (filter !== "semua" && k.kind !== filter) continue;
      if (!matches(k, q)) continue;
      const arr = map.get(k.bab);
      if (arr) arr.push(k);
      else map.set(k.bab, [k]);
    }
    if (tampilSemuaBab) {
      // Tampilkan bab 1-50 berurutan; yang kosong tetap muncul.
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

  // Hanya bab yang benar-benar ada isinya (untuk hitung total & buka semua).
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
        (n, g) => n + g.items.filter((k) => isHafal(k.bab, k.no)).length,
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
      <TopBar
        title="Bentuk Kata Sifat"
        subtitle="けいようし · 肯定 & 否定"
        onBack={onBack}
      />

      <div className="mx-auto w-full px-4 pt-4">
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

          {/* —— Pilih kolom bentuk (8 chip, satu per kolom) —— */}
          <div className="mt-2 flex flex-wrap items-center gap-2 rounded-card border border-line/[0.12] bg-surface px-3 py-2.5">
            <span className="k-eyebrow shrink-0">Kolom bentuk</span>
            {BENTUK_TOGGLES.map((t) => {
              const cocokGaya = gaya === "semua" || t.gaya === gaya;
              const on = cocokGaya && isVisible(hiddenBentuk, t.key);
              return (
                <Chip
                  key={t.key}
                  active={on}
                  disabled={!cocokGaya}
                  onClick={() => toggleCol(TABLE_ID, t.key)}
                  title={
                    cocokGaya
                      ? `${on ? "Sembunyikan" : "Tampilkan"} kolom ${t.label}`
                      : `Ganti gaya ke "${t.gaya}" untuk mengatur kolom ini`
                  }
                >
                  {t.label}
                </Chip>
              );
            })}
            <button
              type="button"
              onClick={() =>
                setManyCols(TABLE_ID, togglesAktif.map((t) => t.key), !semuaTampil)
              }
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
                hidden={hiddenBentuk}
                gaya={gaya}
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
  /** Peta kolom yang disembunyikan (dari useColVis). */
  hidden: Record<string, boolean> | undefined;
  /** Gaya aktif: semua/kasual/formal. */
  gaya: GayaBentuk;
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
  hidden,
  gaya,
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
  const kosong = items.length === 0;

  // Lebar kolom: default dari WIDTH, override dari store (drag pengguna).
  const overrides = useColWidths((s) => s.widths[TABLE_ID]);
  const setWidth = useColWidths((s) => s.setWidth);
  const widthOf = (key: ColKeyBentuk) =>
    pickWidth(overrides, key, WIDTH[key]);

  // Kolom yang benar-benar dirender: gaya cocok DAN kolom tidak disembunyikan chip.
  const cols = BENTUK_COLS.filter((c) => {
    if (c.group === null) return true;
    const g = c.group.startsWith("kasual") ? "kasual" : "formal";
    if (gaya !== "semua" && gaya !== g) return false;
    return isVisible(hidden, c.key);
  });

  const fixed = cols.reduce((n, c) => n + widthOf(c.key), 0);

  // Grup yang tampil + jumlah kolomnya (untuk header gabungan). Grup kosong dibuang.
  const grupTampil = GRUP_INFO.map((g) => ({
    ...g,
    span: cols.filter((c) => c.group === g.id).length,
  })).filter((g) => g.span > 0);

  // Bab tanpa kata sifat: header ditandai, tombol buka/tutup dimatikan.
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
              Tidak ada kata sifat di bab ini
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
                  {cols.map((c) => (
                    <col key={c.key} style={{ width: `${widthOf(c.key)}px` }} />
                  ))}
                </colgroup>

                <thead>
                  <tr>
                    {/* Kolom dasar: No / Kata / Arti (kosong di baris atas) */}
                    {cols
                      .filter((c) => c.group === null)
                      .map((c) => (
                        <th
                          key={c.key}
                          className={[
                            "border-b border-line/10 bg-sunken/70 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted/85",
                            c.key === "no" ? "text-center" : "text-left",
                            c.key === "no" ? "" : "relative",
                          ].join(" ")}
                        >
                          {c.key === "no" ? "No" : c.key === "kata" ? "Kata" : "Arti"}
                          {c.key !== "no" && (
                            <ColResizer
                              width={widthOf(c.key)}
                              label={`Lebar kolom ${c.key === "kata" ? "Kata" : "Arti"}`}
                              onResize={(w) => setWidth(TABLE_ID, c.key, w)}
                            />
                          )}
                        </th>
                      ))}
                    {/* Header 4 grup: kasual/formal x positif/negatif */}
                    {grupTampil.map((g) => (
                      <th
                        key={g.id}
                        colSpan={g.span}
                        className={[
                          "border-b border-l border-line/10 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.08em]",
                          g.tone === "success"
                            ? "bg-success-soft/60 text-success"
                            : "bg-danger-soft/50 text-danger",
                        ].join(" ")}
                      >
                        {g.label}
                      </th>
                    ))}
                  </tr>
                  <tr>
                    {/* sub-header kolom dasar kosong */}
                    {cols
                      .filter((c) => c.group === null)
                      .map((c) => (
                        <th
                          key={c.key}
                          className="border-b border-line/10 bg-sunken/40 px-3 py-1.5"
                          aria-hidden
                        />
                      ))}
                    {/* sub-header kolom bentuk (Kini / Lampau) */}
                    {cols
                      .filter((c) => c.group !== null)
                      .map((c) => {
                        const tone = c.group?.startsWith("kasual") ? "kasual" : "formal";
                        const isPos = c.group?.endsWith("positif");
                        return (
                          <th
                            key={c.key}
                            className={[
                              "relative border-b border-line/[0.07] px-3 py-1.5 text-left text-[10.5px] font-semibold text-ink-soft",
                              isPos ? "bg-success-soft/40" : "bg-danger-soft/30",
                              tone === "kasual" && c.sub === "Kini"
                                ? "border-l border-line/[0.06]"
                                : "",
                              tone === "formal" && c.sub === "Kini"
                                ? "border-l border-line/[0.06]"
                                : "",
                            ].join(" ")}
                          >
                            {c.sub}
                            <ColResizer
                              width={widthOf(c.key)}
                              label={`Lebar kolom ${c.group} ${c.sub}`}
                              onResize={(w) => setWidth(TABLE_ID, c.key, w)}
                            />
                          </th>
                        );
                      })}
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
                        {cols.map((c) => {
                          // Kolom No
                          if (c.key === "no")
                            return (
                              <td
                                key={c.key}
                                className="k-rownum border-b border-line/[0.06] px-3 py-[9px] text-center"
                              >
                                {k.no}
                              </td>
                            );
                          // Kolom Kata
                          if (c.key === "kata")
                            return (
                              <td key={c.key} className="border-b border-line/[0.06] px-3 py-[9px]">
                                <span className="flex items-center gap-1.5">
                                  <span
                                    className="k-kana overflow-hidden whitespace-nowrap text-ellipsis"
                                    title={k.kana}
                                  >
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
                                  <span
                                    className="k-kanji mt-0.5 block overflow-hidden whitespace-nowrap text-ellipsis text-[11.5px] text-muted"
                                    title={k.kanji}
                                  >
                                    <JpText text={k.kanji} />
                                  </span>
                                )}
                              </td>
                            );
                          // Kolom Arti
                          if (c.key === "arti")
                            return (
                              <td key={c.key} className="border-b border-line/[0.06] px-3 py-[9px]">
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
                            );
                          // Kolom bentuk: kasual/formal x positif/negatif
                          const teks = c.nilai ? c.nilai(k) : "";
                          const isPos = c.group?.endsWith("positif");
                          const isFormal = c.group?.startsWith("formal");
                          return (
                            <td
                              key={c.key}
                              className={[
                                "border-b border-line/[0.06] px-3 py-[9px] font-jp text-[14px]",
                                isPos ? "text-ink" : "text-seal",
                                isFormal ? "bg-ink/[0.015]" : "",
                                c.sub === "Kini" ? "border-l border-line/[0.06]" : "",
                              ].join(" ")}
                              title={isFormal ? "Bentuk formal (sopan)" : undefined}
                            >
                              <span
                                className="block overflow-hidden whitespace-nowrap text-ellipsis"
                                title={teks}
                              >
                                <JpText text={teks} />
                              </span>
                            </td>
                          );
                        })}
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
