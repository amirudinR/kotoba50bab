import { useMemo, useState } from "react";
import { KEIYOUSHI_BENTUK, type KeiyoushiBentuk } from "../data/keiyoushi_konjugasi";
import { BABS_META } from "../data";
import { useProgress } from "../store/progress";
import { useSpeech } from "../lib/speech";
import { useColVis } from "../store/colvis";
import TopBar from "../components/TopBar";
import AppIcon from "../components/Icon";
import BentukToolbar from "../components/bentuk-sifat/BentukToolbar";
import BabBentuk from "../components/bentuk-sifat/BabBentuk";
import {
  TABLE_ID,
  matches,
  type FilterKind,
  type GayaBentuk,
} from "../components/bentuk-sifat/constants";

interface Props {
  onBack: () => void;
}

/* ============================================================
   Halaman "Bentuk Kata Sifat" — tabel konjugasi per bab.

   Logika orkestrasi (state, filter, grouping) ada di sini;
   tiap bagian UI dipecah ke components/bentuk-sifat/:
   - BentukToolbar.tsx : hero + filter + panel pil kolom
   - BabBentuk.tsx     : satu blok bab (akordeon + tabel)
   - PilBentuk.tsx     : pil kolom bentuk
   - constants.ts      : WIDTH, BENTUK_COLS, GRUP_INFO, dll.
   ============================================================ */
export default function KataSifatBentuk({ onBack }: Props) {
  const [filter, setFilter] = useState<FilterKind>("semua");
  const [query, setQuery] = useState("");
  /** Bab yang sedang terbuka (default: tertutup semua). */
  const [open, setOpen] = useState<Set<number>>(() => new Set());
  const { isHafal, toggleHafal } = useProgress();
  const speech = useSpeech();
  // Kolom bentuk yang disembunyikan (chip di atas tabel).
  const hiddenBentuk = useColVis((s) => s.hidden[TABLE_ID]);
  // Gaya aktif: semua / kasual / formal (persist per tabel).
  const gaya = (useColVis((s) => s.gaya[TABLE_ID]) ?? "semua") as GayaBentuk;
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

  const allOpen = babIsi.length > 0 && babIsi.every((g) => open.has(g.bab));

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
        <BentukToolbar
          filter={filter}
          onFilter={setFilter}
          query={query}
          onQuery={setQuery}
          totalTampil={totalTampil}
          babCount={babIsi.length}
          hiddenBentuk={hiddenBentuk}
        />

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
