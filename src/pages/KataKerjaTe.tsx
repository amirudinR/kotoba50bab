import { useMemo, useState } from "react";
import { DOUSHI_TE, type DoushiTe } from "../data/doushi_te";
import { BABS_META } from "../data";
import { useProgress } from "../store/progress";
import { useSpeech } from "../lib/speech";
import { useColVis } from "../store/colvis";
import TopBar from "../components/TopBar";
import AppIcon from "../components/Icon";
import TeToolbar from "../components/bentuk-te/TeToolbar";
import BabTe from "../components/bentuk-te/BabTe";
import { TABLE_ID, matches, type FilterKind } from "../components/bentuk-te/constants";

interface Props {
  onBack: () => void;
}

/* ============================================================
   Halaman "Bentuk て" — tabel bentuk て per bab.

   Logika orkestrasi (state, filter, grouping) ada di sini;
   tiap bagian UI dipecah ke components/bentuk-te/:
   - TeToolbar.tsx : hero + aturan + filter + chip kolom
   - BabTe.tsx     : satu blok bab (akordeon + tabel)
   - constants.ts  : WIDTH, ATURAN, KIND_TONE, dll.
   ============================================================ */
export default function KataKerjaTe({ onBack }: Props) {
  const [filter, setFilter] = useState<FilterKind>("semua");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Set<number>>(() => new Set());
  const { isHafal, toggleHafal } = useProgress();
  const speech = useSpeech();
  const [speakingKey, setSpeakingKey] = useState<string | null>(null);
  // Kolom bentuk yang disembunyikan (chip di atas tabel).
  const hiddenBentuk = useColVis((s) => s.hidden[TABLE_ID]);

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
      <TopBar title="Bentuk て" subtitle="どうし · て形" onBack={onBack} />

      <div className="mx-auto w-full px-4 pt-4">
        <TeToolbar
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
