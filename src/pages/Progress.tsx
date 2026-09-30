import { useMemo, useState } from "react";
import { BABS, TOTAL_KOTOBA } from "../data";
import { useProgress, kataKey } from "../store/progress";
import TopBar from "../components/TopBar";
import PaperCard from "../components/PaperCard";
import ProgressBar from "../components/ProgressBar";
import Button from "../components/Button";
import HankoSeal from "../components/HankoSeal";
import AppIcon from "../components/Icon";

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

  const totalJawab = totalBenar + totalSalah;
  const akurasi = totalJawab > 0 ? Math.round((totalBenar / totalJawab) * 100) : 0;
  const pctHafal =
    TOTAL_KOTOBA > 0 ? Math.round((hafal.length / TOTAL_KOTOBA) * 1000) / 10 : 0;

  const rows = useMemo(
    () =>
      BABS.map((b) => {
        const total = b.items.length;
        let done = 0;
        for (const it of b.items) {
          if (hafalSet.has(kataKey(b.bab, it.no))) done += 1;
        }
        return {
          bab: b.bab,
          done,
          total,
          pct: total > 0 ? Math.round((done / total) * 100) : 0,
        };
      }),
    [hafalSet],
  );

  const babSelesai = rows.filter((r) => r.total > 0 && r.pct === 100).length;
  const kosong = hafal.length === 0 && totalJawab === 0;

  if (kosong) {
    return (
      <div className="min-h-full pb-24">
        <TopBar title="Progres" onBack={onBack} />
        <div className="mx-auto max-w-md px-4 pt-14 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-line/15 bg-surface text-2xl text-accent shadow-soft animate-fade-rise">
            <AppIcon icon="ph:notebook" />
          </div>
          <h2 className="mt-6 font-display text-2xl text-ink">
            Lembar progres masih kosong
          </h2>
          <p className="mt-2.5 text-[15px] leading-relaxed text-body">
            Setiap kata yang kamu kuasai akan tercatat di sini. Mulai dari satu
            bab kecil — hafal 5 kata sehari sudah jauh.
          </p>
          <Button className="mt-7" iconRight="ph:arrow-right" onClick={onBack}>
            Mulai latihan
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full pb-24">
      <TopBar title="Progres" onBack={onBack} />

      <div className="mx-auto max-w-3xl space-y-4 px-4 pt-4">
        {/* ===== Ringkasan utama ===== */}
        <PaperCard raised className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="k-eyebrow">Ringkasan</p>
            {hafal.length > 0 && (
              <HankoSeal mark="記" size="sm" className="opacity-90" />
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-end gap-x-5 gap-y-4">
            {/* Hero: sudah dihafal */}
            <div className="min-w-[9rem] flex-1">
              <div className="flex items-baseline gap-1.5">
                <span className="k-num font-display text-5xl leading-none text-ink">
                  {hafal.length.toLocaleString("id-ID")}
                </span>
                <span className="k-num font-display text-xl text-muted">
                  / {TOTAL_KOTOBA.toLocaleString("id-ID")}
                </span>
              </div>
              <p className="k-eyebrow mt-2">Sudah dihafal</p>
            </div>

            {/* Statistik sekunder */}
            <div className="grid flex-1 grid-cols-3 gap-2 sm:min-w-[19rem]">
              <Stat label="Benar" value={totalBenar} tone="text-success" />
              <Stat label="Salah" value={totalSalah} tone="text-danger" />
              <Stat
                label="Akurasi"
                value={totalJawab > 0 ? `${akurasi}%` : "—"}
                tone="text-ink"
              />
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <span className="text-[14px] text-body">
                Hafalan total
              </span>
              <span className="k-num font-display text-2xl leading-none text-ink">
                {pctHafal}%
              </span>
            </div>
            <ProgressBar
              value={hafal.length}
              max={TOTAL_KOTOBA}
              tone="ink"
              className="h-2"
            />
            <p className="mt-2 text-[13px] text-muted">
              <span className="k-num">{hafal.length.toLocaleString("id-ID")}</span>{" "}
              dari{" "}
              <span className="k-num">{TOTAL_KOTOBA.toLocaleString("id-ID")}</span>{" "}
              kata
            </p>
          </div>

          <div className="mt-5 border-t border-line/10 pt-5">
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <span className="flex items-center gap-2 text-[14px] text-body">
                <AppIcon icon="ph:target" className="text-base text-muted" />
                Akurasi kuis
              </span>
              <span
                className={`k-num font-display text-2xl leading-none ${
                  totalJawab === 0
                    ? "text-muted"
                    : akurasi >= 80
                      ? "text-success"
                      : akurasi >= 50
                        ? "text-ink"
                        : "text-danger"
                }`}
              >
                {totalJawab > 0 ? `${akurasi}%` : "—"}
              </span>
            </div>
            <ProgressBar
              value={akurasi}
              max={100}
              tone={
                totalJawab === 0
                  ? "ink"
                  : akurasi >= 80
                    ? "success"
                    : akurasi >= 50
                      ? "accent"
                      : "seal"
              }
              className="h-2"
            />
            <p className="mt-2 text-[13px] text-muted">
              <span className="k-num">{totalBenar}</span> benar dari{" "}
              <span className="k-num">{totalJawab}</span> jawaban
              {babSelesai > 0 && (
                <>
                  {" · "}
                  <span className="k-num">{babSelesai}</span> bab tuntas
                </>
              )}
            </p>
          </div>
        </PaperCard>

        {/* ===== Per bab ===== */}
        <PaperCard className="p-5 sm:p-6">
          <div className="mb-1 flex items-baseline justify-between gap-3">
            <h2 className="font-display text-lg font-semibold text-ink">
              Hafalan per bab
            </h2>
            <span className="k-eyebrow">50 bab</span>
          </div>
          <p className="mb-4 text-[13px] text-muted">
            {babSelesai > 0
              ? `${babSelesai} bab sudah tuntas — ditandai dengan segel.`
              : "Belum ada bab tuntas. Selesaikan satu bab sampai 100% dulu."}
          </p>

          <ul className="grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
            {rows.map((r) => {
              const tuntas = r.total > 0 && r.pct === 100;
              return (
                <li key={r.bab} className="flex items-center gap-2.5">
                  <span className="k-num w-11 shrink-0 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                    bab {r.bab}
                  </span>
                  <ProgressBar
                    value={r.done}
                    max={r.total}
                    tone={tuntas ? "success" : "ink"}
                    className="h-1.5 min-w-0 flex-1"
                  />
                  <span
                    className={`k-num w-10 shrink-0 text-right font-mono text-[11px] ${
                      tuntas ? "text-success" : r.pct > 0 ? "text-ink" : "text-muted"
                    }`}
                  >
                    {r.pct}%
                  </span>
                  <span className="grid w-5 shrink-0 place-items-center">
                    {tuntas && (
                      <AppIcon
                        icon="ph:seal-check"
                        className="text-base text-seal"
                        label={`Bab ${r.bab} tuntas`}
                      />
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </PaperCard>

        {/* ===== Reset ===== */}
        <PaperCard className="p-5">
          {!confirming ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[14px] text-body">Mulai dari awal?</p>
                <p className="mt-0.5 text-[13px] text-muted">
                  Menghapus seluruh hafalan dan statistik kuis di perangkat ini.
                </p>
              </div>
              <Button
                variant="quiet"
                size="sm"
                icon="ph:trash"
                onClick={() => setConfirming(true)}
              >
                Reset progres
              </Button>
            </div>
          ) : (
            <div className="animate-fade-rise rounded-xl border border-danger/35 bg-danger-soft p-4">
              <div className="flex items-start gap-2.5">
                <AppIcon
                  icon="ph:trash"
                  className="mt-0.5 shrink-0 text-lg text-danger"
                />
                <div>
                  <p className="font-display text-base text-danger">
                    Hapus semua progres?
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-body">
                    <span className="k-num">{hafal.length}</span> kata hafalan dan{" "}
                    <span className="k-num">{totalJawab}</span> catatan kuis akan
                    hilang permanen. Tidak bisa dibatalkan.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  variant="seal"
                  size="sm"
                  icon="ph:trash"
                  onClick={() => {
                    resetProgress();
                    setConfirming(false);
                  }}
                >
                  Ya, hapus
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
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
  tone,
}: {
  label: string;
  value: number | string;
  tone: string;
}) {
  return (
    <div className="rounded-xl border border-line/10 bg-sunken/60 px-2 py-3 text-center">
      <div className={`k-num font-display text-2xl leading-none ${tone}`}>{value}</div>
      <div className="k-eyebrow mt-1.5">{label}</div>
    </div>
  );
}
