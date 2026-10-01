import { useMemo } from "react";
import { BABS_META, TOTAL_KOTOBA } from "../data";
import { useSettings } from "../store/settings";
import { useProgress } from "../store/progress";
import { useApp } from "../store/app";
import PaperCard from "../components/PaperCard";
import ProgressBar from "../components/ProgressBar";
import HankoSeal from "../components/HankoSeal";
import AppIcon from "../components/Icon";
import type { IconName } from "../components/Icon";

export default function Home() {
  const { selectedBabs, toggleBab, selectAll, clearBabs, shuffle, setShuffle } =
    useSettings();
  const hafal = useProgress((s) => s.hafal);
  const go = useApp((s) => s.go);

  const hafalSet = useMemo(() => new Set(hafal), [hafal]);

  // Jumlah kata per bab sudah ada di metadata, jadi tidak perlu memuat isi bab.
  const selectedTotal = useMemo(
    () =>
      BABS_META.filter((b) => selectedBabs.includes(b.bab)).reduce(
        (n, b) => n + b.count,
        0,
      ),
    [selectedBabs],
  );

  // Kata yang sudah hafal dihitung dari awalan "bab-", bukan dari isi bab.
  const hafalCount = useMemo(() => {
    let n = 0;
    for (const k of hafalSet) {
      if (selectedBabs.includes(Number(k.split("-")[0]))) n += 1;
    }
    return n;
  }, [hafalSet, selectedBabs]);

  const totalWords = TOTAL_KOTOBA.toLocaleString("id-ID");
  const belumAdaBab = selectedBabs.length === 0;

  return (
    <div className="min-h-full">
      {/* —— Hero: sampul buku, bukan dashboard —— */}
      <div className="mx-auto max-w-3xl px-4 pt-6 sm:pt-9">
        <PaperCard raised tape className="k-margin overflow-hidden pl-10 pr-5 pt-7 pb-6">
          <p className="k-eyebrow">
            Minna no Nihongo · {totalWords} kata · {BABS_META.length} bab
          </p>

          <div className="mt-3 flex items-end gap-4 sm:gap-6">
            <div className="min-w-0">
              {/* Kanji sebagai elemen visual utama: instantly terbaca sebagai "bahasa Jepang". */}
              <h1 className="font-display text-[64px] leading-[0.86] tracking-tight text-ink sm:text-[88px]">
                言葉
              </h1>
              <p className="k-underline mt-2 inline-block font-display text-2xl text-ink-soft sm:text-3xl">
                Kotoba
              </p>
            </div>
            <HankoSeal
              mark="言"
              size="lg"
              stamp
              className="mb-1 shrink-0 rotate-[-4deg] sm:mb-2"
            />
          </div>

          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-body">
            Hafalkan kosakata <span className="font-medium text-ink">Minna no Nihongo</span>{" "}
            bab 1–50 lewat kartu, kuis, dan pencarian cepat.
          </p>
        </PaperCard>
      </div>

      <main className="mx-auto max-w-3xl px-4 pb-24">
        {/* —— Statistik: kesan produk serius, tanpa chart —— */}
        <div className="mt-4 grid grid-cols-3 divide-x divide-line/15 border-y border-line/15 py-4">
          <Stat value={totalWords} label="Kosakata" />
          <Stat value={String(BABS_META.length)} label="Bab" />
          <Stat value={String(hafal.length)} label="Dihafal" />
        </div>

        {/* —— Mode utama —— */}
        <section aria-label="Mode latihan utama" className="mt-7">
          <h2 className="k-eyebrow">Mode latihan</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <ModeCard
              icon="ph:cards"
              title="Flashcard"
              desc="Balik kartu, tandai yang sudah dikuasai"
              onClick={() => go("flashcard")}
              disabled={belumAdaBab}
            />
            <ModeCard
              icon="ph:check-circle"
              title="Kuis Pilihan Ganda"
              desc="10 soal · 4 opsi · cek otomatis"
              onClick={() => go("quiz-pg")}
              disabled={belumAdaBab}
            />
          </div>
        </section>

        {/* —— Mode pendukung —— */}
        <section
          aria-label="Mode lain"
          className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          <ModeRow
            icon="ph:keyboard"
            title="Kuis Ketik"
            desc="Tulis jawabannya"
            onClick={() => go("quiz-ketik")}
            disabled={belumAdaBab}
          />
          <ModeRow
            icon="ph:magnifying-glass"
            title="Cari"
            desc="Telusuri 2.910 kata"
            onClick={() => go("search")}
          />
          <ModeRow
            icon="ph:list-bullets"
            title="Daftar"
            desc="Lihat semua per bab"
            onClick={() => go("list")}
          />
          <ModeRow
            icon="ph:chart-bar"
            title="Progres"
            desc="Statistik hafalan"
            onClick={() => go("progress")}
          />
        </section>

        {/* —— Urutan acak —— */}
        <PaperCard className="mt-6 flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sunken text-ink-soft">
              <AppIcon icon="ph:shuffle" className="text-lg" />
            </span>
            <div className="min-w-0">
              <p className="text-[15px] font-semibold leading-tight text-ink">
                Urutan acak
              </p>
              <p className="text-xs leading-tight text-muted">
                Campur semua kata tiap sesi
              </p>
            </div>
          </div>
          <Switch
            checked={shuffle}
            onChange={setShuffle}
            label="Urutan acak"
          />
        </PaperCard>

        {/* —— Pemilih bab —— */}
        <PaperCard className="mt-4 p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-xl text-ink">
              Pilih bab
              <span className="k-num ml-2 font-sans text-sm text-muted">
                {selectedBabs.length} dipilih
              </span>
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={selectAll}
                className="h-9 rounded-lg px-2.5 text-sm font-semibold text-ink-soft transition hover:bg-ink/[0.07] hover:text-ink active:scale-95"
              >
                Semua
              </button>
              <button
                onClick={clearBabs}
                className="h-9 rounded-lg px-2.5 text-sm font-semibold text-muted transition hover:bg-ink/[0.07] hover:text-ink active:scale-95"
              >
                Kosongkan
              </button>
            </div>
          </div>

          <div
            className="grid grid-cols-6 gap-1.5 sm:grid-cols-10"
            role="group"
            aria-label="Daftar bab 1 sampai 50"
          >
            {BABS_META.map((b) => {
              const active = selectedBabs.includes(b.bab);
              return (
                <button
                  key={b.bab}
                  onClick={() => toggleBab(b.bab)}
                  aria-pressed={active}
                  title={`Bab ${b.bab} · ${b.count} kata`}
                  className={`k-num h-10 rounded-lg border font-mono text-sm transition duration-150 active:scale-95 ${
                    active
                      ? "border-ink bg-ink text-surface shadow-soft"
                      : "border-transparent bg-sunken text-body/60 hover:text-ink"
                  }`}
                >
                  {b.bab}
                </button>
              );
            })}
          </div>
        </PaperCard>

        {/* —— Kemajuan hafalan bab terpilih —— */}
        {selectedBabs.length > 0 && (
          <PaperCard className="mt-4 p-4 sm:p-5">
            <div className="mb-2.5 flex items-baseline justify-between gap-3">
              <h2 className="k-eyebrow">Kemajuan hafalan · bab terpilih</h2>
              <span className="k-num shrink-0 font-display text-lg text-ink">
                {hafalCount}
                <span className="text-muted">/{selectedTotal}</span>
              </span>
            </div>
            <ProgressBar
              value={hafalCount}
              max={selectedTotal}
              tone="seal"
            />
            <p className="mt-2.5 text-xs text-muted">
              Tandai kata saat flashcard, atau otomatis saat menjawab kuis dengan benar.
            </p>
          </PaperCard>
        )}

        <footer className="mt-9 text-center">
          <p className="k-eyebrow">Kotoba · belajar kosakata Jepang</p>
        </footer>
      </main>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="px-2 text-center">
      <div className="k-num font-display text-2xl leading-none text-ink sm:text-3xl">
        {value}
      </div>
      <div className="k-eyebrow mt-1.5">{label}</div>
    </div>
  );
}

function ModeCard({
  icon,
  title,
  desc,
  onClick,
  disabled,
}: {
  icon: IconName;
  title: string;
  desc: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="k-card-raised group p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-deep active:translate-y-0 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-45"
    >
      <span className="flex items-start gap-3.5">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
          <AppIcon icon={icon} className="text-[22px]" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5 font-display text-lg leading-tight text-ink">
            {title}
            <AppIcon
              icon="ph:arrow-right"
              className="text-base text-muted opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            />
          </span>
          <span className="mt-0.5 block text-[13px] leading-snug text-muted">
            {desc}
          </span>
        </span>
      </span>
    </button>
  );
}

function ModeRow({
  icon,
  title,
  desc,
  onClick,
  disabled,
}: {
  icon: IconName;
  title: string;
  desc: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="k-card flex min-h-[72px] w-full items-center gap-3 px-3.5 py-3 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-lift active:translate-y-0 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-45"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sunken text-ink-soft">
        <AppIcon icon={icon} className="text-xl" />
      </span>
      <span className="min-w-0">
        <span className="block text-[15px] font-semibold leading-tight text-ink">
          {title}
        </span>
        <span className="block truncate text-xs leading-tight text-muted">
          {desc}
        </span>
      </span>
    </button>
  );
}

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="grid h-11 w-16 shrink-0 place-items-center rounded-pill transition active:scale-95"
    >
      <span
        className={`relative block h-6 w-11 rounded-pill border transition-colors duration-200 ease-out ${
          checked ? "border-ink bg-ink" : "border-line/20 bg-sunken"
        }`}
      >
        <span
          className={`absolute top-1/2 h-[18px] w-[18px] -translate-y-1/2 rounded-full shadow-soft transition-all duration-200 ease-spring ${
            checked ? "left-[25px] bg-surface" : "left-[2px] bg-muted"
          }`}
        />
      </span>
    </button>
  );
}
