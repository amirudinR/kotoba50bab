import { useEffect, useMemo, useState } from "react";
import type { KotobaWithBab } from "../types";
import { shuffleArray } from "../lib/utils";
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

export default function Flashcard({ pool, shuffle, viewMode, onBack }: Props) {
  const { toggleHafal, isHafal, hafal } = useProgress();

  // Bangun deck dari pool; reshuffle saat pool/shuffle berubah.
  const deck = useMemo(() => {
    return shuffle ? shuffleArray(pool) : [...pool];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, shuffle]);

  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // reset ketika deck berubah
  useEffect(() => {
    setIdx(0);
    setFlipped(false);
  }, [deck]);

  const card = deck[idx];
  if (!card) {
    return (
      <div>
        <TopBar title="Flashcard" onBack={onBack} />
        <div className="mx-auto max-w-3xl px-4 py-16 text-center text-pencil">
          <p className="font-hand text-3xl">Pilih bab dulu ya ✏️</p>
        </div>
      </div>
    );
  }

  const marked = isHafal(card.bab, card.no);
  const done = deck.filter((c) => hafal.includes(`${c.bab}-${c.no}`)).length;

  const front = viewMode === "kana-arti" ? card.kana : card.arti;
  const back = viewMode === "kana-arti" ? card.arti : card.kana;
  const frontSub =
    viewMode === "kana-arti"
      ? card.kanji || undefined
      : card.kanji || undefined;
  const backSub = viewMode === "arti-kana" ? card.kanji || undefined : undefined;

  function next() {
    setFlipped(false);
    setTimeout(() => setIdx((i) => Math.min(i + 1, deck.length - 1)), 120);
  }
  function prev() {
    setFlipped(false);
    setTimeout(() => setIdx((i) => Math.max(i - 1, 0)), 120);
  }

  return (
    <div className="min-h-full pb-28">
      <TopBar
        title="Flashcard"
        subtitle={`Kartu ${idx + 1} / ${deck.length} · bab ${card.bab}`}
        onBack={onBack}
      />

      <div className="mx-auto max-w-xl px-4 pt-4">
        <ProgressBar value={done} max={deck.length} className="mb-4" />

        <div
          className="flip-perspective select-none"
          style={{ height: "min(56vh, 420px)" }}
          onClick={() => setFlipped((f) => !f)}
        >
          <div className={`flip-inner ${flipped ? "flipped" : ""}`}>
            {/* FRONT */}
            <div className="flip-face cursor-pointer">
              <FaceCard
                eyebrow={
                  viewMode === "kana-arti" ? "Bahasa Jepang" : "Arti (Indonesia)"
                }
                main={front}
                sub={frontSub}
                hint="Ketuk untuk membalik"
              />
            </div>
            {/* BACK */}
            <div className="flip-face flip-back cursor-pointer">
              <FaceCard
                eyebrow={
                  viewMode === "kana-arti" ? "Arti (Indonesia)" : "Bahasa Jepang"
                }
                main={back}
                sub={backSub}
                hint="Ketuk untuk kembali"
                revealed
              />
            </div>
          </div>
        </div>

        {/* Kontrol */}
        <div className="mt-5 flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={prev} disabled={idx === 0}>
            ← Sebelumnya
          </Button>

          <button
            onClick={() => toggleHafal(card.bab, card.no)}
            className={`flex h-12 w-12 items-center justify-center rounded-full text-xl shadow-paper transition active:scale-90 ${
              marked ? "bg-note-green text-green-800" : "bg-white/80 text-pencil"
            }`}
            title={marked ? "Sudah hafal" : "Tandai sudah hafal"}
          >
            {marked ? "✓" : "☆"}
          </button>

          <Button variant="ink" onClick={next} disabled={idx >= deck.length - 1}>
            Berikutnya →
          </Button>
        </div>

        <p className="mt-4 text-center text-xs text-pencil/70">
          Tap kartu untuk melihat {viewMode === "kana-arti" ? "arti" : "kosakata"}.
          Tandai ✓ untuk kata yang sudah kamu hafal.
        </p>
      </div>
    </div>
  );
}

function FaceCard({
  eyebrow,
  main,
  sub,
  hint,
  revealed,
}: {
  eyebrow: string;
  main: string;
  sub?: string;
  hint: string;
  revealed?: boolean;
}) {
  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center rounded-3xl border border-black/5 p-6 text-center shadow-card paper-grain ${
        revealed ? "bg-note-green/70" : "bg-white/95"
      }`}
    >
      <span className="font-hand text-xl text-margin">{eyebrow}</span>
      <span className="mt-3 break-words font-hand text-5xl leading-tight text-ink sm:text-6xl">
        {main}
      </span>
      {sub && <span className="mt-3 text-lg text-pencil/80">{sub}</span>}
      <span className="mt-auto pt-6 text-xs text-pencil/50">{hint}</span>
    </div>
  );
}
