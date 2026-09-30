import { useEffect, useMemo, useState } from "react";
import type { KotobaWithBab } from "../types";
import { sampleN, shuffleArray, normalize } from "../lib/utils";
import { useProgress } from "../store/progress";
import type { ViewMode } from "../store/settings";
import TopBar from "../components/TopBar";
import Button from "../components/Button";
import ProgressBar from "../components/ProgressBar";

interface Props {
  pool: KotobaWithBab[];
  allPool: KotobaWithBab[];
  shuffle: boolean;
  viewMode: ViewMode;
  onBack: () => void;
}

const QUIZ_LEN = 10;

interface Question {
  card: KotobaWithBab;
  options: string[];
  answer: string;
}

function labelFor(card: KotobaWithBab, viewMode: ViewMode): string {
  // Yang ditanyakan (prompt) & yang dicari (jawaban)
  return viewMode === "kana-arti" ? card.kana : card.arti;
}
function answerFor(card: KotobaWithBab, viewMode: ViewMode): string {
  return viewMode === "kana-arti" ? card.arti : card.kana;
}

export default function QuizPG({
  pool,
  allPool,
  shuffle,
  viewMode,
  onBack,
}: Props) {
  const recordAnswer = useProgress((s) => s.recordAnswer);
  const toggleHafal = useProgress((s) => s.toggleHafal);

  const questions = useMemo<Question[]>(() => {
    if (pool.length === 0) return [];
    const picks = shuffle
      ? sampleN(pool, Math.min(QUIZ_LEN, pool.length))
      : pool.slice(0, Math.min(QUIZ_LEN, pool.length));

    return picks.map((card) => {
      const answer = answerFor(card, viewMode);
      const distractors = new Set<string>();
      // ambil pengecoh dari seluruh bank kata agar bervariasi
      const source = allPool.length >= 4 ? allPool : pool;
      const shuffledSource = shuffleArray(source);
      for (const c of shuffledSource) {
        if (distractors.size >= 3) break;
        const cand = answerFor(c, viewMode);
        if (normalize(cand) === normalize(answer)) continue;
        distractors.add(cand);
      }
      const options = shuffleArray([answer, ...distractors]);
      return { card, options, answer };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, allPool, shuffle, viewMode]);

  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState<KotobaWithBab[]>([]);

  useEffect(() => {
    setQi(0);
    setPicked(null);
    setScore(0);
    setWrong([]);
  }, [questions]);

  if (questions.length === 0) {
    return (
      <div>
        <TopBar title="Kuis Pilihan" onBack={onBack} />
        <p className="mx-auto max-w-3xl px-4 py-16 text-center font-hand text-3xl text-pencil">
          Pilih bab dulu ya ✏️
        </p>
      </div>
    );
  }

  const q = questions[qi];
  const isLast = qi >= questions.length - 1;
  const answered = picked !== null;
  const correct = picked !== null && normalize(picked) === normalize(q.answer);

  function choose(opt: string) {
    if (answered) return;
    setPicked(opt);
    const ok = normalize(opt) === normalize(q.answer);
    recordAnswer(q.card.bab, q.card.no, ok);
    if (ok) {
      setScore((s) => s + 1);
      toggleHafal(q.card.bab, q.card.no);
    } else {
      setWrong((w) => [...w, q.card]);
    }
  }

  function nextQ() {
    setPicked(null);
    setQi((i) => i + 1);
  }

  // ===== Ringkasan =====
  if (isLast && answered) {
    return (
      <div className="min-h-full pb-24">
        <TopBar title="Kuis Pilihan" subtitle="Selesai" onBack={onBack} />
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
            <Button variant="ghost" onClick={() => { setQi(0); setPicked(null); setScore(0); setWrong([]); }}>
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
        title="Kuis Pilihan"
        subtitle={`Soal ${qi + 1} / ${questions.length} · skor ${score}`}
        onBack={onBack}
      />

      <div className="mx-auto max-w-xl px-4 pt-4">
        <ProgressBar value={qi + (answered ? 1 : 0)} max={questions.length} className="mb-5" />

        <div className="rounded-3xl bg-white/95 border border-black/5 paper-grain p-6 text-center shadow-card">
          <span className="font-hand text-xl text-margin">
            {viewMode === "kana-arti" ? "Bahasa Jepang" : "Arti (Indonesia)"}
          </span>
          <div className="mt-2 font-hand text-4xl sm:text-5xl text-ink break-words">
            {labelFor(q.card, viewMode)}
          </div>
          {q.card.kanji && (
            <div className="mt-1 text-sm text-pencil/60">{q.card.kanji}</div>
          )}
        </div>

        <p className="mt-5 mb-2 text-sm font-bold text-pencil">
          Pilih {viewMode === "kana-arti" ? "arti" : "kosakata"} yang benar:
        </p>

        <div className="grid gap-2.5">
          {q.options.map((opt) => {
            const isThis = normalize(opt) === normalize(q.answer);
            const isPicked = picked !== null && normalize(opt) === normalize(picked);
            let cls =
              "bg-white/90 border-black/5 hover:bg-white text-ink";
            if (answered && isThis)
              cls = "bg-note-green border-green-600/40 text-green-900 animate-pop";
            else if (answered && isPicked)
              cls = "bg-note-pink border-margin/40 text-red-900 animate-shake";
            else if (answered) cls = "bg-white/60 border-black/5 text-pencil/60";
            return (
              <button
                key={opt}
                onClick={() => choose(opt)}
                disabled={answered}
                className={`rounded-2xl border px-4 py-3.5 text-left font-bold shadow-paper transition active:scale-[0.98] ${cls}`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {answered && (
          <div className="mt-5 flex items-center justify-between gap-3">
            <span
              className={`font-hand text-3xl ${
                correct ? "text-green-700" : "text-margin"
              }`}
            >
              {correct ? "Benar! ✓" : "Kurang tepat ✗"}
            </span>
            <Button onClick={nextQ}>{isLast ? "Lihat hasil" : "Soal berikutnya →"}</Button>
          </div>
        )}
      </div>
    </div>
  );
}
