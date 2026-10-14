import type { ReactNode } from "react";
import AppIcon from "../Icon";

interface Props {
  correct: boolean;
  /** Blok khusus saat salah (mis. "kamu pilih …" / "kamu tulis …"). */
  wrongDetail?: ReactNode;
  /** Render jawaban benar (boleh multi-span: teks + kanji). */
  answerContent: ReactNode;
}

/**
 * Kartu umpan balik setelah menjawab — benar/salah.
 * Dipakai bersama oleh QuizPG & QuizKetik.
 */
export default function FeedbackCard({ correct, wrongDetail, answerContent }: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`rounded-card border p-4 ${
        correct ? "border-success/35 bg-success-soft" : "border-danger/35 bg-danger-soft"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <AppIcon
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

      {!correct && wrongDetail}

      <p className="mt-1.5 text-[14px] text-body">
        <span className="k-eyebrow mr-1.5 normal-case tracking-normal">jawaban benar</span>
        <span className="font-display text-lg text-ink">{answerContent}</span>
      </p>
    </div>
  );
}
