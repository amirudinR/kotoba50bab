import { useEffect, useMemo, useRef, useState } from "react";
import type { KotobaWithBab } from "../types";
import { isAnswerCorrect, sampleN } from "../lib/utils";
import { useProgress } from "../store/progress";
import type { ViewMode } from "../store/settings";
import TopBar from "../components/TopBar";
import Button from "../components/Button";
import ProgressBar from "../components/ProgressBar";

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

  useEffect(() => {
    setQi(0);
    setInput("");
    setResult(null);
    setScore(0);
    setWrong([]);
  }, [questions]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [qi, result]);

  if (questions.length === 0) {
    return (
      <div>
        <TopBar title="Kuis Ketik" onBack={onBack} />
        <p className="mx-auto max-w-3xl px-4 py-16 text-center font-hand text-3xl text-pencil">
          Pilih bab dulu ya ✏️
        </p>
      </div>
    );
  }

  const q = questions[qi];
  const isLast = qi >= questions.length - 1;
  const answered = result !== null;

  const prompt =
    viewMode === "kana-arti" ? q.kana : q.arti;
  const expected =
    viewMode === "kana-arti" ? q.arti : q.kana;

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

  // Ringkasan
  if (isLast && answered) {
    return (
      <div className="min-h-full pb-24">
        <TopBar title="Kuis Ketik" subtitle="Selesai" onBack={onBack} />
        <div className="mx-auto max-w-xl px-4 pt-6 text-center">
          <div className="font-hand text-6xl text-ink">
            {score}/{questions.length}
          </div>
          <p className="font-hand text-2xl text-margin mt-1">
            {score === questions.length
              ? "Sempurna! 🎉"
              : score >= questions.length / 2
                ? "Bagus! Terus berlatih ✏️"
                : "Semangat, ulangi lagi 💪"}
          </p>

          {wrong.length > 0 && (
            <div className="mt-6 text-left">
              <h2 className="font-hand text-2xl text-ink mb-2">
                Perlu diulang ({wrong.length})
              </h2>
              <div className="space-y-2">
                {wrong.map((c) => (
                  <div
                    key={`${c.bab}-${c.no}`}
                    className="rounded-xl bg-white/90 border border-black/5 p-3 shadow-paper"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-hand text-2xl text-ink">{c.kana}</span>
                      <span className="text-xs text-pencil/60">bab {c.bab}</span>
                    </div>
                    {c.kanji && (
                      <div className="text-sm text-pencil/70">{c.kanji}</div>
                    )}
                    <div className="text-sm text-ink-soft">{c.arti}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-center gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setQi(0);
                setInput("");
                setResult(null);
                setScore(0);
                setWrong([]);
              }}
            >
              Ulangi
            </Button>
            <Button onClick={onBack}>Kembali</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full pb-28">
      <TopBar
        title="Kuis Ketik"
        subtitle={`Soal ${qi + 1} / ${questions.length} · skor ${score}`}
        onBack={onBack}
      />

      <div className="mx-auto max-w-xl px-4 pt-4">
        <ProgressBar
          value={qi + (answered ? 1 : 0)}
          max={questions.length}
          className="mb-5"
        />

        <div className="rounded-3xl bg-white/95 border border-black/5 paper-grain p-6 text-center shadow-card">
          <span className="font-hand text-xl text-margin">
            Ketik {viewMode === "kana-arti" ? "artinya (Indonesia)" : "kosakatanya (Jepang)"}
          </span>
          <div className="mt-2 font-hand text-4xl sm:text-5xl text-ink break-words">
            {prompt}
          </div>
          {viewMode === "arti-kana" && q.kanji && (
            <div className="mt-1 text-sm text-pencil/50">(petunjuk: {q.kanji})</div>
          )}
        </div>

        {!answered ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="mt-5"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ketik jawabanmu..."
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              className="w-full rounded-2xl border-2 border-ink/20 bg-white/95 px-4 py-3.5 font-hand text-2xl text-ink outline-none focus:border-ink/50"
            />
            <Button type="submit" className="mt-3 w-full" disabled={!input.trim()}>
              Periksa jawaban
            </Button>
            <p className="mt-2 text-center text-xs text-pencil/60">
              Tidak apa-apa beda huruf besar/kecil atau tanda baca.
            </p>
          </form>
        ) : (
          <div className="mt-5">
            <div
              className={`rounded-2xl border p-4 shadow-paper ${
                result
                  ? "bg-note-green border-green-600/40"
                  : "bg-note-pink border-margin/40"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{result ? "✓" : "✗"}</span>
                <span
                  className={`font-hand text-3xl ${
                    result ? "text-green-800" : "text-margin"
                  }`}
                >
                  {result ? "Benar!" : "Kurang tepat"}
                </span>
              </div>
              {!result && (
                <div className="mt-2 text-sm text-pencil">
                  Jawabanmu: <b>{input || "-"}</b>
                </div>
              )}
              <div className="mt-1 text-sm text-pencil">
                Jawaban benar: <b className="text-ink">{expected}</b>
                {q.kanji && viewMode === "kana-arti" && (
                  <span className="text-pencil/60"> · {q.kanji}</span>
                )}
              </div>
            </div>

            <Button onClick={nextQ} className="mt-4 w-full">
              {isLast ? "Lihat hasil" : "Soal berikutnya →"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
