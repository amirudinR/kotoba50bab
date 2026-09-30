import { useMemo } from "react";
import { BABS, TOTAL_KOTOBA } from "../data";
import { useSettings } from "../store/settings";
import { useProgress, kataKey } from "../store/progress";
import { useApp } from "../store/app";
import PaperCard from "../components/PaperCard";
import ProgressBar from "../components/ProgressBar";

export default function Home() {
  const { selectedBabs, toggleBab, selectAll, clearBabs, shuffle, setShuffle } =
    useSettings();
  const hafal = useProgress((s) => s.hafal);
  const go = useApp((s) => s.go);

  const hafalSet = useMemo(() => new Set(hafal), [hafal]);

  const selectedKata = useMemo(
    () =>
      BABS.filter((b) => selectedBabs.includes(b.bab)).flatMap((b) =>
        b.items.map((it) => kataKey(b.bab, it.no)),
      ),
    [selectedBabs],
  );

  const hafalCount = selectedKata.filter((k) => hafalSet.has(k)).length;

  return (
    <div className="min-h-full">
      <header className="mx-auto max-w-3xl px-4 pt-8 pb-2">
        <div className="paper-margin pl-12 relative">
          <h1 className="font-hand text-4xl sm:text-5xl text-ink leading-none">
            日本語の言葉
          </h1>
          <p className="font-hand text-2xl text-margin -mt-1">
            Kotoba · Minna no Nihongo
          </p>
        </div>
        <p className="mt-3 text-pencil/90">
          Hafalkan kosakata bab <b>1–50</b> dengan kartu, kuis, dan pencarian.
          Total <b>{TOTAL_KOTOBA.toLocaleString("id-ID")}</b> kata.
        </p>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-28">
        {/* Menu mode */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <ModeButton
            emoji="🃏"
            label="Flashcard"
            desc="Balik kartu"
            onClick={() => go("flashcard")}
            disabled={selectedBabs.length === 0}
          />
          <ModeButton
            emoji="✅"
            label="Kuis Pilihan"
            desc="4 opsi"
            onClick={() => go("quiz-pg")}
            disabled={selectedBabs.length === 0}
          />
          <ModeButton
            emoji="✍️"
            label="Kuis Ketik"
            desc="Isi jawaban"
            onClick={() => go("quiz-ketik")}
            disabled={selectedBabs.length === 0}
          />
          <ModeButton emoji="🔍" label="Cari" desc="Cari kata" onClick={() => go("search")} />
          <ModeButton emoji="📊" label="Progres" desc="Statistik" onClick={() => go("progress")} />
        </div>

        {/* Opsi latihan */}
        <PaperCard className="mt-5 p-4" tape>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-hand text-2xl text-ink">Urutan acak</span>
            </div>
            <Toggle checked={shuffle} onChange={setShuffle} />
          </div>
        </PaperCard>

        {/* Bab selector */}
        <PaperCard className="mt-4 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-hand text-2xl text-ink">
              Pilih Bab
              <span className="ml-2 text-base text-pencil/70">
                ({selectedBabs.length} terpilih)
              </span>
            </h2>
            <div className="flex gap-2 text-sm">
              <button
                onClick={selectAll}
                className="rounded-lg px-2.5 py-1 font-bold text-ink bg-ink/10 hover:bg-ink/15"
              >
                Semua
              </button>
              <button
                onClick={clearBabs}
                className="rounded-lg px-2.5 py-1 font-bold text-margin bg-margin/10 hover:bg-margin/15"
              >
                Kosongkan
              </button>
            </div>
          </div>

          <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-10">
            {BABS.map((b) => {
              const active = selectedBabs.includes(b.bab);
              return (
                <button
                  key={b.bab}
                  onClick={() => toggleBab(b.bab)}
                  className={`flex h-10 items-center justify-center rounded-lg text-sm font-extrabold transition active:scale-95 ${
                    active
                      ? "bg-ink text-white shadow-paper"
                      : "bg-paper-dark/70 text-pencil hover:bg-paper-dark"
                  }`}
                  title={`Bab ${b.bab} (${b.items.length} kata)`}
                >
                  {b.bab}
                </button>
              );
            })}
          </div>
        </PaperCard>

        {/* Progres bab terpilih */}
        {selectedBabs.length > 0 && (
          <PaperCard className="mt-4 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-hand text-2xl text-ink">Kemajuan hafalan</span>
              <span className="text-sm font-bold text-ink">
                {hafalCount}/{selectedKata.length}
              </span>
            </div>
            <ProgressBar value={hafalCount} max={selectedKata.length} />
            <p className="mt-2 text-xs text-pencil/70">
              Tandai kata "sudah hafal" saat flashcard, atau lewat kuis.
            </p>
          </PaperCard>
        )}

        <footer className="mt-8 text-center text-xs text-pencil/50 font-hand text-base">
          Dibuat untuk belajar · selamat menghafal ✏️
        </footer>
      </main>
    </div>
  );
}

function ModeButton({
  emoji,
  label,
  desc,
  onClick,
  disabled,
}: {
  emoji: string;
  label: string;
  desc: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="group flex items-center gap-3 rounded-2xl bg-white/90 paper-grain border border-black/5 p-3 text-left shadow-paper transition active:scale-[0.97] disabled:opacity-40 hover:-translate-y-0.5"
    >
      <span className="text-2xl">{emoji}</span>
      <span className="min-w-0">
        <span className="block font-extrabold text-ink leading-tight">{label}</span>
        <span className="block text-xs text-pencil/70 truncate">{desc}</span>
      </span>
    </button>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 rounded-full transition ${
        checked ? "bg-ink" : "bg-pencil/30"
      }`}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${
          checked ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}
