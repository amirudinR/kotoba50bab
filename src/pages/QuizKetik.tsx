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
import JpText from "../components/JpText";
import AppIcon from "../components/Icon";
import QuizConfirm from "../components/quiz/QuizConfirm";
import FeedbackCard from "../components/quiz/FeedbackCard";
import QuizSummary from "../components/quiz/QuizSummary";
import { useAutoAdvance } from "../hooks/useAutoAdvance";

interface Props {
  pool: KotobaWithBab[];
  shuffle: boolean;
  viewMode: ViewMode;
  onBack: () => void;
}

/** Ambang jumlah soal yang memicu layar konfirmasi sebelum kuis dimulai. */
const CONFIRM_ABOVE = 150;

export default function QuizKetik({ pool, shuffle, viewMode, onBack }: Props) {
  const recordAnswer = useProgress((s) => s.recordAnswer);
  const toggleHafal = useProgress((s) => s.toggleHafal);

  const questions = useMemo(() => {
    if (pool.length === 0) return [];
    // Soal sebanyak seluruh kata bab terpilih (tanpa batas keras).
    return shuffle ? sampleN(pool, pool.length) : pool.slice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, shuffle, viewMode]);

  const [qi, setQi] = useState(0);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<null | boolean>(null);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState<KotobaWithBab[]>([]);
  /** Konfirmasi sebelum mulai kalau soalnya banyak. */
  const [started, setStarted] = useState(false);
  /** Di soal terakhir: tunggu sebentar setelah benar sebelum layar hasil. */
  const [showResult, setShowResult] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function restart() {
    setQi(0);
    setInput("");
    setResult(null);
    setScore(0);
    setWrong([]);
    setStarted(false);
    setShowResult(false);
  }

  useEffect(() => {
    restart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [qi, result]);

  /**
   * Auto-lanjut HANYA saat jawaban benar (delay pendek ~1 dtk).
   * Salah → tetap manual lewat tombol "Soal berikutnya".
   */
  useAutoAdvance({
    answered: result !== null,
    correct: result === true,
    qi,
    total: questions.length,
    onNext: nextQ,
    onFinish: () => setShowResult(true),
  });

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

  // Layar konfirmasi kalau soal banyak & belum dimulai.
  if (questions.length > CONFIRM_ABOVE && !started) {
    return (
      <QuizConfirm
        title="Kuis Ketik"
        count={questions.length}
        hint="Mau lanjut?"
        onStart={() => setStarted(true)}
        onBack={onBack}
      />
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
    if (qi >= questions.length - 1) {
      setShowResult(true);
      return;
    }
    setInput("");
    setResult(null);
    setQi((i) => i + 1);
  }

  // ===== Ringkasan =====
  if (isLast && answered && showResult) {
    return (
      <QuizSummary
        title="Kuis Ketik"
        score={score}
        total={questions.length}
        wrong={wrong}
        onRestart={restart}
        onBack={onBack}
      />
    );
  }

  // ===== Soal =====
  return (
    <div className="min-h-full pb-28 lg:flex lg:h-screen lg:flex-col lg:overflow-hidden lg:pb-0">
      <TopBar
        title="Kuis Ketik"
        subtitle={`Soal ${qi + 1} / ${questions.length} · benar ${score}`}
        onBack={onBack}
      />

      <div className="mx-auto w-full px-4 pt-4 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:pt-3">
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

        {/* Desktop: 2 kolom (soal kiri, input/feedback kanan) muat tanpa scroll. */}
        <div className="lg:grid lg:min-h-0 lg:flex-1 lg:grid-cols-[1fr_1.1fr] lg:items-stretch lg:gap-6">
          {/* Kolom kiri: kartu pertanyaan */}
          <PaperCard
            raised
            className="k-margin px-5 py-7 text-center lg:self-start"
          >
            <p className="k-eyebrow">{labelPrompt}</p>

            <div
              className={`mt-3 break-words font-display leading-tight text-ink ${
                viewMode === "kana-arti"
                  ? "text-[2.75rem] sm:text-5xl lg:text-[3.5rem]"
                  : "text-2xl sm:text-3xl lg:text-4xl"
              }`}
            >
              <JpText text={prompt} />
            </div>

            {viewMode === "arti-kana" && q.kanji && (
              <p className="mt-3 text-[14px] text-muted">
                <span className="k-eyebrow mr-1.5 normal-case tracking-normal">
                  petunjuk
                </span>
                <JpText text={q.kanji} />
              </p>
            )}

            <p className="k-eyebrow mt-5 normal-case tracking-normal">bab {q.bab}</p>
          </PaperCard>

          {/* Kolom kanan: input / feedback */}
          <div className="lg:flex lg:min-h-0 lg:flex-col lg:overflow-y-auto lg:pr-1 scroll-slim">
            {!answered ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submit();
                }}
                className="mt-5 lg:mt-0"
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
              <div className="mt-5 animate-fade-rise lg:mt-0">
                <FeedbackCard
                  correct={result === true}
                  wrongDetail={
                    !result ? (
                      <p className="mt-3 text-[14px] text-body">
                        <span className="k-eyebrow mr-1.5 normal-case tracking-normal">
                          kamu tulis
                        </span>
                        <span className="k-underline font-medium">{input || "—"}</span>
                      </p>
                    ) : undefined
                  }
                  answerContent={
                    <>
                      <JpText text={expected} />
                      {q.kanji && viewMode === "kana-arti" && (
                        <span className="text-muted">
                          {" · "}
                          <JpText text={q.kanji} />
                        </span>
                      )}
                    </>
                  }
                />

                <Button
                  className="mt-4 w-full"
                  size="lg"
                  onClick={nextQ}
                  iconRight="ph:arrow-right"
                >
                  {isLast ? "Lihat hasil" : result ? "Lanjut…" : "Soal berikutnya"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
