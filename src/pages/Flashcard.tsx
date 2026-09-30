import { useEffect, useMemo, useState } from "react";
import type { KotobaWithBab } from "../types";
import { shuffleArray } from "../lib/utils";
import { useProgress } from "../store/progress";
import type { ViewMode } from "../store/settings";
import TopBar from "../components/TopBar";
import Button from "../components/Button";
import ProgressBar from "../components/ProgressBar";
import HankoSeal from "../components/HankoSeal";
import Icon from "../components/Icon";

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
      <div className="min-h-full pb-24">
        <TopBar title="Flashcard" onBack={onBack} />
        <div className="mx-auto max-w-md px-4 pt-16 text-center">
          <HankoSeal mark="空" size="lg" className="animate-fade-rise" />
          <p className="mt-6 font-display text-2xl text-ink">Belum ada bab dipilih</p>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">
            Pilih bab yang mau dilatih, lalu kembali ke sini untuk mulai menghafal.
          </p>
          <Button className="mt-6" onClick={onBack} iconRight="ph:arrow-right">
            Pilih bab
          </Button>
        </div>
      </div>
    );
  }

  const marked = isHafal(card.bab, card.no);
  const done = deck.filter((c) => hafal.includes(`${c.bab}-${c.no}`)).length;

  const isKanaMode = viewMode === "kana-arti";
  const front = isKanaMode ? card.kana : card.arti;
  const back = isKanaMode ? card.arti : card.kana;
  const modeLabel = isKanaMode ? "Kana → Arti" : "Arti → Kana";

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
      <TopBar title="Flashcard" subtitle={`Bab ${card.bab}`} onBack={onBack} />

      <div className="mx-auto max-w-xl px-4 pt-4">
        {/* Kemajuan hafalan */}
        <div className="mb-3.5">
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <span className="k-eyebrow">Sudah hafal</span>
            <span className="k-num font-mono text-[11px] text-muted">
              {done}/{deck.length}
            </span>
          </div>
          <ProgressBar value={done} max={deck.length} tone="seal" />
        </div>

        {/* Posisi kartu + arah mode (pill, read-only) */}
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="k-num font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
            Kartu {idx + 1} / {deck.length}
          </span>
          <span
            className="k-eyebrow rounded-pill border border-line/15 bg-surface px-2.5 py-1 shadow-soft"
            title={`Mode kartu: ${modeLabel}`}
          >
            {modeLabel}
          </span>
        </div>

        {/* Kartu */}
        <div
          className="flip-perspective select-none"
          style={{ height: "clamp(280px, 52vh, 420px)" }}
          onClick={() => setFlipped((f) => !f)}
          onKeyDown={(e) => {
            if (e.key === " " || e.key === "Enter") {
              e.preventDefault();
              setFlipped((f) => !f);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label={`Balik kartu. ${flipped ? "Tampil arti" : "Tampil jawaban"}`}
        >
          <div className={`flip-inner ${flipped ? "flipped" : ""}`}>
            {/* Sisi depan — yang ditanyakan */}
            <div className="flip-face cursor-pointer">
              <FaceCard
                eyebrow={isKanaMode ? "Jawaban" : "Arti"}
                main={front}
                sub={!isKanaMode ? card.kanji || undefined : undefined}
                hint="Ketuk untuk membalik"
                marked={marked}
                isKanaSide={isKanaMode}
              />
            </div>
            {/* Sisi belakang — jawabannya */}
            <div className="flip-face flip-back cursor-pointer">
              <FaceCard
                eyebrow={isKanaMode ? "Arti" : "Jawaban"}
                main={back}
                sub={!isKanaMode ? undefined : card.kanji || undefined}
                hint="Ketuk untuk kembali"
                revealed
                marked={marked}
                isKanaSide={!isKanaMode}
              />
            </div>
          </div>
        </div>

        {/* Kontrol */}
        <div className="mt-5 flex items-center gap-2.5">
          <Button
            variant="ghost"
            icon="ph:caret-left"
            onClick={prev}
            disabled={idx === 0}
            aria-label="Kartu sebelumnya"
            title="Kartu sebelumnya"
          />

          <button
            onClick={() => toggleHafal(card.bab, card.no)}
            aria-pressed={marked}
            className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-pill border text-[15px] font-semibold transition-[transform,background-color,color,border-color] duration-150 active:scale-[0.98] ${
              marked
                ? "border-success/45 bg-success-soft text-success"
                : "border-ink/20 bg-surface text-ink hover:border-ink/35 hover:bg-raised"
            }`}
          >
            <Icon
              icon={marked ? "ph:check-circle" : "ph:star"}
              className="text-lg"
            />
            {marked ? "Sudah hafal" : "Belum hafal"}
          </button>

          <Button
            iconRight="ph:caret-right"
            onClick={next}
            disabled={idx >= deck.length - 1}
            aria-label="Kartu berikutnya"
            title="Kartu berikutnya"
          />
        </div>

        <p className="mt-4 text-center text-[13px] leading-relaxed text-muted">
          Ketuk kartu untuk melihat {isKanaMode ? "arti" : "kosakata"}.
          Tandai yang sudah dikuasai.
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
  marked,
  isKanaSide,
}: {
  eyebrow: string;
  main: string;
  sub?: string;
  hint: string;
  revealed?: boolean;
  marked?: boolean;
  isKanaSide: boolean;
}) {
  // Kana butuh ruang lebih; arti bisa panjang jadi turun satu tingkat.
  const mainSize = isKanaSide
    ? "text-[3.25rem] sm:text-6xl md:text-7xl"
    : "text-3xl sm:text-4xl md:text-5xl";

  return (
    <div
      className={`k-card-raised relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-3xl border-line/15 px-6 py-7 text-center ${
        revealed ? "bg-accent-soft/70" : "bg-surface"
      }`}
    >
      {marked && (
        <span className="absolute right-4 top-4 -rotate-6 animate-stamp-in">
          <HankoSeal size="sm" />
        </span>
      )}

      <span className="k-eyebrow">{eyebrow}</span>

      <span
        className={`mt-3.5 break-words font-display font-medium leading-[1.15] text-ink ${mainSize}`}
      >
        {main}
      </span>

      {sub && (
        <span className="mt-3 break-words font-display text-base leading-snug text-muted sm:text-lg">
          {sub}
        </span>
      )}

      <span className="mt-auto pt-6 text-[13px] text-muted">{hint}</span>
    </div>
  );
}
