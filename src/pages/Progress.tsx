import { useMemo, useState } from "react";
import { BABS, TOTAL_KOTOBA } from "../data";
import { useProgress, kataKey } from "../store/progress";
import TopBar from "../components/TopBar";
import PaperCard from "../components/PaperCard";
import ProgressBar from "../components/ProgressBar";
import Button from "../components/Button";

interface Props {
  onBack: () => void;
}

export default function Progress({ onBack }: Props) {
  const { hafal, stats, resetProgress } = useProgress();
  const [confirming, setConfirming] = useState(false);

  const hafalSet = useMemo(() => new Set(hafal), [hafal]);

  const { totalBenar, totalSalah } = useMemo(() => {
    let b = 0;
    let s = 0;
    for (const k in stats) {
      b += stats[k].benar;
      s += stats[k].salah;
    }
    return { totalBenar: b, totalSalah: s };
  }, [stats]);

  const akurasi =
    totalBenar + totalSalah > 0
      ? Math.round((totalBenar / (totalBenar + totalSalah)) * 100)
      : 0;

  return (
    <div className="min-h-full pb-24">
      <TopBar title="Progres Belajar" onBack={onBack} />

      <div className="mx-auto max-w-xl px-4 pt-4 space-y-4">
        {/* Ringkasan total */}
        <PaperCard className="p-5" tape>
          <h2 className="font-hand text-2xl text-ink mb-3">Ringkasan</h2>
          <div className="grid grid-cols-3 gap-3 text-center mb-4">
            <Stat label="Hafal" value={`${hafal.length}`} accent="text-ink" />
            <Stat label="Benar" value={`${totalBenar}`} accent="text-green-700" />
            <Stat label="Salah" value={`${totalSalah}`} accent="text-margin" />
          </div>

          <div className="mb-1 flex justify-between text-sm">
            <span className="text-pencil">Hafal dari total {TOTAL_KOTOBA}</span>
            <span className="font-bold text-ink">
              {Math.round((hafal.length / TOTAL_KOTOBA) * 100)}%
            </span>
          </div>
          <ProgressBar value={hafal.length} max={TOTAL_KOTOBA} />

          <div className="mt-4 mb-1 flex justify-between text-sm">
            <span className="text-pencil">Akurasi kuis</span>
            <span className="font-bold text-ink">{akurasi}%</span>
          </div>
          <ProgressBar value={akurasi} max={100} />
        </PaperCard>

        {/* Per bab */}
        <PaperCard className="p-5">
          <h2 className="font-hand text-2xl text-ink mb-3">Per Bab</h2>
          <div className="space-y-2">
            {BABS.map((b) => {
              const total = b.items.length;
              const done = b.items.filter((it) =>
                hafalSet.has(kataKey(b.bab, it.no)),
              ).length;
              const pct = total ? Math.round((done / total) * 100) : 0;
              return (
                <div key={b.bab} className="flex items-center gap-3">
                  <span className="w-14 shrink-0 font-bold text-sm text-pencil">
                    Bab {b.bab}
                  </span>
                  <div className="flex-1">
                    <ProgressBar value={done} max={total} />
                  </div>
                  <span className="w-14 shrink-0 text-right text-xs font-bold text-ink">
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </PaperCard>

        {/* Reset */}
        <PaperCard className="p-5">
          {!confirming ? (
            <button
              onClick={() => setConfirming(true)}
              className="text-sm font-bold text-margin underline underline-offset-2"
            >
              Reset semua progres
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-pencil">
                Yakin hapus semua progres & statistik?
              </span>
              <div className="flex gap-2">
                <Button variant="red" onClick={() => { resetProgress(); setConfirming(false); }}>
                  Ya, hapus
                </Button>
                <Button variant="ghost" onClick={() => setConfirming(false)}>
                  Batal
                </Button>
              </div>
            </div>
          )}
        </PaperCard>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-xl bg-paper-dark/50 py-3">
      <div className={`font-hand text-3xl ${accent}`}>{value}</div>
      <div className="text-xs text-pencil/70">{label}</div>
    </div>
  );
}
