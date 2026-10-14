import type { KotobaWithBab } from "../../types";
import TopBar from "../TopBar";
import Button from "../Button";
import ProgressBar from "../ProgressBar";
import PaperCard from "../PaperCard";
import HankoSeal from "../HankoSeal";
import JpText from "../JpText";
import AppIcon from "../Icon";

interface Props {
  /** Judul TopBar, mis. "Kuis Pilihan" / "Kuis Ketik". */
  title: string;
  score: number;
  total: number;
  wrong: KotobaWithBab[];
  onRestart: () => void;
  onBack: () => void;
  /** Kalau true, blok "Perlu diulang" selalu tampil (walau kosong). */
  alwaysShowWrong?: boolean;
}

/**
 * Layar ringkasan akhir kuis — skor, progres, daftar "Perlu diulang".
 * Dipakai bersama oleh QuizPG & QuizKetik.
 */
export default function QuizSummary({
  title,
  score,
  total,
  wrong,
  onRestart,
  onBack,
  alwaysShowWrong = false,
}: Props) {
  const perfect = score === total;
  const pct = Math.round((score / total) * 100);

  return (
    <div className="min-h-full pb-24">
      <TopBar title={title} subtitle="Selesai" onBack={onBack} />

      <div className="mx-auto max-w-xl px-4 pt-6">
        <PaperCard raised className="animate-fade-rise p-6 text-center">
          {perfect && (
            <div className="mb-4 flex justify-center">
              <HankoSeal mark="満" size="md" stamp />
            </div>
          )}

          <p className="k-eyebrow">Skor akhir</p>
          <div className="mt-2 flex items-end justify-center gap-1.5">
            <span className="k-num font-display text-6xl leading-none text-ink">{score}</span>
            <span className="k-num mb-1 font-display text-2xl text-muted">/ {total}</span>
          </div>

          <div className="mx-auto mt-4 max-w-[16rem]">
            <ProgressBar
              value={score}
              max={total}
              tone={perfect ? "success" : pct >= 50 ? "accent" : "seal"}
            />
          </div>

          <p className="mt-4 font-display text-xl text-ink">
            {perfect
              ? "Sempurna, semua benar."
              : pct >= 70
                ? "Bagus sekali, teruskan."
                : pct >= 40
                  ? "Sudah setengah jalan."
                  : "Awal yang baik, ulangi lagi."}
          </p>
          <p className="mt-1 text-[14px] text-muted">
            {perfect ? "Semua kata soal ini sudah ditandai hafal." : `${pct}% benar dari ${total} soal.`}
          </p>
        </PaperCard>

        {(alwaysShowWrong || wrong.length > 0) && (
          <section className="mt-6">
            <div className="mb-3 flex items-center gap-2">
              <AppIcon
                icon={wrong.length > 0 ? "ph:arrow-counter-clockwise" : "ph:target"}
                className={`text-base ${wrong.length > 0 ? "text-seal" : "text-success"}`}
              />
              <h2 className="font-display text-lg font-semibold text-ink">Perlu diulang</h2>
              <span
                className={`k-num rounded-pill px-2 py-0.5 font-mono text-[11px] ${
                  wrong.length > 0 ? "bg-seal/10 text-seal" : "bg-success/10 text-success"
                }`}
              >
                {wrong.length}
              </span>
            </div>

            {wrong.length === 0 ? (
              <PaperCard className="flex items-center gap-3 p-4">
                <AppIcon icon="ph:check-circle" className="shrink-0 text-2xl text-success" />
                <p className="text-[15px] leading-snug text-body">
                  Tidak ada. Semua soal terjawab benar.
                </p>
              </PaperCard>
            ) : (
              <ul className="space-y-2">
                {wrong.map((c) => (
                  <li key={`${c.bab}-${c.no}`}>
                    <PaperCard className="flex items-center gap-3 p-3">
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline gap-2">
                          <span className="font-display text-2xl leading-tight text-ink">
                            <JpText text={c.kana} />
                          </span>
                          {c.kanji && (
                            <span className="truncate font-display text-sm text-muted sm:text-base">
                              <JpText text={c.kanji} />
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 block text-[14px] leading-snug text-body">
                          {c.arti}
                        </span>
                      </span>
                      <span className="k-eyebrow shrink-0 normal-case tracking-normal">
                        bab {c.bab}
                      </span>
                    </PaperCard>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-center">
          <Button variant="ghost" icon="ph:arrow-counter-clockwise" onClick={onRestart}>
            Ulangi
          </Button>
          <Button iconRight="ph:arrow-right" onClick={onBack}>
            Kembali
          </Button>
        </div>
      </div>
    </div>
  );
}
