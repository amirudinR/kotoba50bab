import { useEffect, useMemo, useRef, useState } from "react";
import type { KotobaWithBab } from "../types";
import { isAnswerCorrect, sampleN } from "../lib/utils";
import { useProgress } from "../store/progress";
import type { ViewMode } from "../store/settings";
import TopBar from "../components/TopBar";
import Button from "../components/Button";
import ProgressBar from "../components/ProgressBar";
import PaperCard from "../components/PaperCard";
import HankoSeal from "../components/HankoSeal";
import AppIcon from "../components/Icon";

interface Props {
  pool: KotobaWithBab[];
  shuffle: boolean;
  viewMode: ViewMode;
  onBack: () => void;
}

const QUIZ_LEN = 10;

export default function QuizKetik({ pool, shuffle, viewMode, onBack }: Props) {
  const recordAnswer = useProgress((s) => s.recordAnswer);
  const toggleHafal = useProgress((s) => s.toggleHafal);

  const questions = useMemo(() => {
    if (pool.length === 0) return [];
    return shuffle
      ? sampleN(pool, Math.min(QUIZ_LEN, pool.length))
      : pool.slice(0, Math.min(QUIZ_LEN, pool.length));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, shuffle, viewMode]);

  const [qi, setQi] = useState(0);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<null | boolean>(null);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState<KotobaWithBab[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  function restart() {
    setQi(0);
    setInput("");
    setResult(null);
    setScore(0);
    setWrong([]);
  }

  useEffect(() => {
    restart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [qi, result]);

  if (questions.length === 0) {
    return (
      <div className="min-h-full pb-24">
        <TopBar title="Kuis Ketik" onBack={onBack} />
        <div className="mx-auto max-w-md px-4 pt-16 text-center">
          <HankoSeal mark="空" size="lg" className="animate-fade-rise" />
          <p className="mt-6 font-display text-2xl text-ink">Belum ada bab dipilih</p>
          <p className="mt-2 text-[15px] leading-relaxed text-body">
            Pilih bab yang mau dilatih, lalu kembali ke sini untuk mulai mengetik.
          </p>
          <Button className="mt-6" onClick={onBack} iconRight="ph:arrow-right">
            Pilih bab
          </Button>
        </div>
      </div>
    );
  }

  const q = questions[qi];
  const isLast = qi >= questions.length - 1;
  const answered = result !== null;

  const prompt = viewMode === "kana-arti" ? q.kana : q.arti;
  const expected = viewMode === "kana-arti" ? q.arti : q.kana;
  const labelPrompt =
    viewMode === "kana-arti" ? "Ketik artinya…" : "Ketik kosakatanya…";

  function submit() {
    if (answered) return;
    if (!input.trim()) return;
    const ok = isAnswerCorrect(input, q, viewMode);
    setResult(ok);
    recordAnswer(q.bab, q.no, ok);
    if (ok) {
      setScore((s) => s + 1);
      toggleHafal(q.bab, q.no);
    } else {
      setWrong((w) => [...w, q]);
    }
  }

  function nextQ() {
    setInput("");
    setResult(null);
    setQi((i) => i + 1);
  }

  // ===== Ringkasan =====
  if (isLast && answered) {
    const perfect = score === questions.length;
    const pctHafal = Math.round((score / questions.length) * 100);

    return (
      <div className="min-h-full pb-24">
        <TopBar title="Kuis Ketik" subtitle="Selesai" onBack={onBack} />

        <div className="mx-auto max-w-xl px-4 pt-6">
          <PaperCard raised className="animate-fade-rise p-6 text-center">
            {perfect && (
              <div className="mb-4 flex justify-center">
                <HankoSeal mark="満" size="md" stamp />
              </div>
            )}

            <p className="k-eyebrow">Skor akhir</p>
            <div className="mt-2 flex items-end justify-center gap-1.5">
              <span className="k-num font-display text-6xl leading-none text-ink">
                {score}
              </span>
              <span className="k-num mb-1 font-display text-2xl text-muted">
                / {questions.length}
              </span>
            </div>

            <div className="mx-auto mt-4 max-w-[16rem]">
              <ProgressBar
                value={score}
                max={questions.length}
                tone={perfect ? "success" : pctHafal >= 50 ? "accent" : "seal"}
              />
            </div>

            <p className="mt-4 font-display text-xl text-ink">
              {perfect
                ? "Sempurna, semua benar."
                : pctHafal >= 70
                  ? "Bagus sekali, teruskan."
                  : pctHafal >= 40
                    ? "Sudah setengah jalan."
                    : "Awal yang baik, ulangi lagi."}
            </p>
            {perfect && (
              <p className="mt-1 text-[14px] text-muted">
                Semua kata soal ini sudah ditandai hafal.
              </p>
            )}
          </PaperCard>

          {wrong.length > 0 && (
            <section className="mt-6">
              <div className="mb-3 flex items-center gap-2">
                <AppIcon icon="ph:arrow-counter-clockwise" className="text-base text-seal" />
                <h2 className="font-display text-lg font-semibold text-ink">
                  Perlu diulang
                </h2>
                <span className="k-num rounded-pill bg-seal/10 px-2 py-0.5 font-mono text-[11px] text-seal">
                  {wrong.length}
                </span>
              </div>

              <ul className="space-y-2">
                {wrong.map((c) => (
                  <li key={`${c.bab}-${c.no}`}>
                    <PaperCard className="flex items-center gap-3 p-3">
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline gap-2">
                          <span className="font-display text-2xl leading-tight text-ink">
                            {c.kana}
                          </span>
                          {c.kanji && (
                            <span className="truncate font-display text-base text-muted">
                              {c.kanji}
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
            </section>
          )}

          <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-center">
            <Button variant="ghost" icon="ph:arrow-counter-clockwise" onClick={restart}>
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

  // ===== Soal =====
  return (
    <div className="min-h-full pb-28">
      <TopBar
        title="Kuis Ketik"
        subtitle={`Soal ${qi + 1} / ${questions.length} · benar ${score}`}
        onBack={onBack}
      />

      <div className="mx-auto max-w-xl px-4 pt-4">
        <div className="mb-3 flex items-center gap-3">
          <ProgressBar
            value={qi + (answered ? 1 : 0)}
            max={questions.length}
            tone="accent"
            className="h-1.5 flex-1"
          />
          <span className="k-num shrink-0 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
            {qi + 1}/{questions.length}
          </span>
        </div>

        {/* Kartu pertanyaan */}
        <PaperCard raised className="k-margin px-5 py-7 text-center">
          <p className="k-eyebrow">{labelPrompt}</p>

          <div
            className={`mt-3 break-words font-display leading-tight text-ink ${
              viewMode === "kana-arti"
                ? "text-[2.75rem] sm:text-5xl"
                : "text-2xl sm:text-3xl"
            }`}
          >
            {prompt}
          </div>

          {viewMode === "arti-kana" && q.kanji && (
            <p className="mt-3 text-[14px] text-muted">
              <span className="k-eyebrow mr-1.5 normal-case tracking-normal">
                petunjuk
              </span>
              {q.kanji}
            </p>
          )}

          <p className="k-eyebrow mt-5 normal-case tracking-normal">bab {q.bab}</p>
        </PaperCard>

        {!answered ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="mt-5"
          >
            <label htmlFor="jawaban" className="k-eyebrow mb-2 block">
              Jawabanmu
            </label>
            <div className="k-card-raised flex items-center gap-3 border-line/20 bg-surface px-4 py-1 transition focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/35">
              <AppIcon icon="ph:keyboard" className="shrink-0 text-lg text-muted" />
              <input
                id="jawaban"
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  viewMode === "kana-arti"
                    ? "Tulis artinya di sini…"
                    : "Tulis kana/kanji di sini…"
                }
                aria-describedby="cara-periksa"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                className="min-w-0 flex-1 bg-transparent py-4 font-display text-2xl text-ink outline-none placeholder:text-muted/70"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="mt-3.5 w-full"
              disabled={!input.trim()}
              iconRight="ph:arrow-right"
            >
              Periksa jawaban
            </Button>

            <p id="cara-periksa" className="mt-2.5 text-center text-[13px] text-muted">
              Tekan Enter untuk periksa. Huruf besar dan tanda baca tidak berpengaruh.
            </p>
          </form>
        ) : (
          <div className="mt-5 animate-fade-rise">
            <div
              role="status"
              aria-live="polite"
              className={`rounded-card border p-4 ${
                result
                  ? "border-success/35 bg-success-soft"
                  : "border-danger/35 bg-danger-soft"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <AppIcon
                  icon={result ? "ph:check-circle" : "ph:x-circle"}
                  className={`shrink-0 text-2xl ${result ? "text-success" : "text-danger"}`}
                />
                <span
                  className={`font-display text-2xl leading-none ${
                    result ? "text-success" : "text-danger"
                  }`}
                >
                  {result ? "Benar" : "Kurang tepat"}
                </span>
              </div>

              {!result && (
                <p className="mt-3 text-[14px] text-body">
                  <span className="k-eyebrow mr-1.5 normal-case tracking-normal">
                    kamu tulis
                  </span>
                  <span className="k-underline font-medium">{input || "—"}</span>
                </p>
              )}

              <p className="mt-1.5 text-[14px] text-body">
                <span className="k-eyebrow mr-1.5 normal-case tracking-normal">
                  jawaban benar
                </span>
                <span className="font-display text-lg text-ink">{expected}</span>
                {q.kanji && viewMode === "kana-arti" && (
                  <span className="text-muted"> · {q.kanji}</span>
                )}
              </p>
            </div>

            <Button
              className="mt-4 w-full"
              size="lg"
              onClick={nextQ}
              iconRight="ph:arrow-right"
            >
              {isLast ? "Lihat hasil" : "Soal berikutnya"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
