import { useEffect, useMemo, useState } from "react";
import type { KotobaWithBab } from "../types";
import { sampleN, shuffleArray, normalize } from "../lib/utils";
import { useProgress } from "../store/progress";
import type { ViewMode } from "../store/settings";
import TopBar from "../components/TopBar";
import Button from "../components/Button";
import ProgressBar from "../components/ProgressBar";
import PaperCard from "../components/PaperCard";
import HankoSeal from "../components/HankoSeal";
import JpText from "../components/JpText";
import Icon from "../components/Icon";

interface Props {
  pool: KotobaWithBab[];
  allPool: KotobaWithBab[];
  shuffle: boolean;
  viewMode: ViewMode;
  onBack: () => void;
}

const QUIZ_LEN = 10;
const LETTERS = ["A", "B", "C", "D"];

interface Question {
  card: KotobaWithBab;
  options: string[];
  answer: string;
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
  }, [pool, allPool, shuffle, viewMode]);

  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState<KotobaWithBab[]>([]);

  function restart() {
    setQi(0);
    setPicked(null);
    setScore(0);
    setWrong([]);
  }

  useEffect(() => {
    restart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions]);

  if (questions.length === 0) {
    return (
      <div className="min-h-full pb-24">
        <TopBar title="Kuis Pilihan" onBack={onBack} />
        <div className="mx-auto max-w-md px-4 pt-16 text-center">
          <HankoSeal mark="空" size="lg" className="animate-fade-rise" />
          <p className="mt-6 font-display text-2xl text-ink">Belum ada bab dipilih</p>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">
            Pilih bab yang mau dilatih, lalu kembali ke sini untuk mulai kuis.
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
  const answered = picked !== null;
  const correct = picked !== null && normalize(picked) === normalize(q.answer);

  const isKanaMode = viewMode === "kana-arti";
  const prompt = isKanaMode ? q.card.kana : q.card.arti;
  const promptLabel = isKanaMode ? "Apa artinya?" : "Apa kosakatanya?";

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
    const total = questions.length;
    const perfect = score === total;
    const pct = Math.round((score / total) * 100);

    return (
      <div className="min-h-full pb-24">
        <TopBar title="Kuis Pilihan" subtitle="Selesai" onBack={onBack} />

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
                / {total}
              </span>
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
              {perfect
                ? "Semua kata soal ini sudah ditandai hafal."
                : `${pct}% benar dari ${total} soal.`}
            </p>
          </PaperCard>

          <section className="mt-6">
            <div className="mb-3 flex items-center gap-2">
              <Icon
                icon={wrong.length > 0 ? "ph:arrow-counter-clockwise" : "ph:target"}
                className={`text-base ${wrong.length > 0 ? "text-seal" : "text-success"}`}
              />
              <h2 className="font-display text-lg font-semibold text-ink">
                Perlu diulang
              </h2>
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
                <Icon icon="ph:check-circle" className="shrink-0 text-2xl text-success" />
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
                            <span className="truncate font-display text-base text-muted">
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
        title="Kuis Pilihan"
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
          <span className="k-num shrink-0 rounded-pill bg-ink/[0.07] px-2 py-0.5 font-mono text-[11px] text-ink">
            {score} benar
          </span>
        </div>

        {/* Kartu pertanyaan */}
        <PaperCard raised className="k-margin px-5 py-7 text-center">
          <p className="k-eyebrow">{promptLabel}</p>

          <div
            className={`mt-3 break-words font-display font-medium leading-tight text-ink ${
              isKanaMode
                ? "text-[2.75rem] sm:text-5xl"
                : "text-2xl sm:text-3xl"
            }`}
          >
            <JpText text={prompt} />
          </div>

          {!isKanaMode && q.card.kanji && (
            <p className="mt-3 text-[14px] text-muted">
              <span className="k-eyebrow mr-1.5 normal-case tracking-normal">
                petunjuk
              </span>
              <JpText text={q.card.kanji} />
            </p>
          )}

          <p className="k-eyebrow mt-5 normal-case tracking-normal">bab {q.card.bab}</p>
        </PaperCard>

        <p className="k-eyebrow mb-2.5 mt-5 normal-case tracking-normal">
          Pilih {isKanaMode ? "arti" : "kosakata"} yang benar
        </p>

        {/* Opsi */}
        <div className="grid gap-2.5" role="group" aria-label="Pilihan jawaban">
          {q.options.map((opt, i) => {
            const isThis = normalize(opt) === normalize(q.answer);
            const isPicked = answered && normalize(opt) === normalize(picked);

            let tone =
              "border-line/20 bg-surface text-ink hover:border-ink/35 hover:bg-raised active:scale-[0.99]";
            let badge = "border-line/20 bg-sunken text-body/75";
            let mark: "check" | "x" | null = null;

            if (answered && isThis) {
              tone = "border-success/50 bg-success-soft text-success";
              badge = "border-success/40 bg-success/15 text-success";
              mark = "check";
            } else if (answered && isPicked) {
              tone = "border-danger/50 bg-danger-soft text-danger";
              badge = "border-danger/40 bg-danger/15 text-danger";
              mark = "x";
            } else if (answered) {
              tone = "border-line/10 bg-surface/50 text-muted opacity-60";
              badge = "border-line/10 bg-sunken/60 text-body/60";
            }

            return (
              <button
                key={opt}
                onClick={() => choose(opt)}
                disabled={answered}
                className={`flex min-h-[3.25rem] w-full items-center gap-3 rounded-card border px-3.5 py-4 text-left text-[15px] font-semibold shadow-soft transition-[transform,background-color,color,border-color,opacity] duration-150 disabled:pointer-events-none ${tone} ${
                  mark === "check" ? "animate-stamp-in" : ""
                }`}
              >
                <span
                  className={`k-num grid h-7 w-7 shrink-0 place-items-center rounded-lg border font-mono text-[11px] font-semibold ${badge}`}
                >
                  {LETTERS[i]}
                </span>

                <span
                  className={`min-w-0 flex-1 break-words ${
                    isKanaMode ? "font-display text-xl" : ""
                  }`}
                >
                  {/* Penanda katakana hanya sebelum dijawab. Setelah itu
                      warna status (hijau/merah/redup) yang harus dominan —
                      kalau tidak, amber menimpa penanda benar/salah. */}
                  {answered ? opt : <JpText text={opt} />}
                </span>

                {mark && (
                  <Icon
                    icon={mark === "check" ? "ph:check-circle" : "ph:x-circle"}
                    className="shrink-0 text-2xl"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {answered && (
          <div className="mt-5 animate-fade-rise">
            <div
              role="status"
              aria-live="polite"
              className={`rounded-card border p-4 ${
                correct
                  ? "border-success/35 bg-success-soft"
                  : "border-danger/35 bg-danger-soft"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  icon={correct ? "ph:check-circle" : "ph:x-circle"}
                  className={`shrink-0 text-2xl ${correct ? "text-success" : "text-danger"}`}
                />
                <span
                  className={`font-display text-2xl leading-none ${
                    correct ? "text-success" : "text-danger"
                  }`}
                >
                  {correct ? "Benar" : "Kurang tepat"}
                </span>
              </div>

              {!correct && (
                <p className="mt-3 text-[14px] text-body">
                  <span className="k-eyebrow mr-1.5 normal-case tracking-normal">
                    kamu pilih
                  </span>
                  <span className="k-underline font-medium">{picked}</span>
                </p>
              )}

              <p className="mt-1.5 text-[14px] text-body">
                <span className="k-eyebrow mr-1.5 normal-case tracking-normal">
                  jawaban benar
                </span>
                <span className="font-display text-lg text-ink">
                  <JpText text={q.answer} />
                </span>
                {isKanaMode && q.card.kanji && (
                  <span className="text-muted">
                    {" · "}
                    <JpText text={q.card.kanji} />
                  </span>
                )}
              </p>
            </div>

            <Button
              className="mt-4 w-full py-3.5"
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
