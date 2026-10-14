import { useState } from "react";
import AppIcon from "./Icon";
import { maybeKatakana, type KatakanaMode } from "../store/list";
import type { ColKey } from "../store/list";
import type { Kotoba } from "../types";

/* ============================================================
   Tampilan GRID untuk halaman List.

   Alternatif dari KotobaTable: tiap kosakata jadi kartu, disusun
   dalam beberapa kolom. Dipilih lewat toggle "List / Grid" di
   ListControls.

   Kartu selalu menampilkan blok yang sama supaya enak dipindai:
   - baris atas    : nomor (mono) + tombol audio
   - kana besar    : font-jp, ukuran baca (bukan hiasan)
   - romaji        : mono, redup
   - kanji         : hanya bila terisi (951 entri memang tanpa kanji)
   - arti          : teks paragraf

   Preferensi kolom (`visible`) dihormati sebagian: kana/wajib,
   katakana & romaji & kanji & arti ikut apa yang aktif. Nomor
   mengikuti `visible.no`; audio mengikuti `canSpeak`.
   ============================================================ */

interface Props {
  items: Kotoba[];
  visible: Record<ColKey, boolean>;
  katakanaMode: KatakanaMode;
  speak: (t: string) => boolean;
  /** @deprecated tombol suara kini selalu tampil — tak lagi dipakai. */
  canSpeak?: boolean;
  /** @deprecated tidak dipakai lagi — status bicara kini per-kartu. */
  isSpeaking?: boolean;
  /** Nomor bab — dipakai untuk aria-label tombol audio yang unik. */
  bab: number;
}

export default function KotobaGrid({
  items,
  visible,
  katakanaMode,
  speak,
  bab,
}: Props) {
  /** Kata (`bab-no`) yang sedang dibunyikan — agar ikon waveform hanya di kartu itu. */
  const [speakingKey, setSpeakingKey] = useState<string | null>(null);

  const showRomaji = visible.romaji;
  const showKanji = visible.kanji;
  const showArti = visible.arti;
  const showKatakana = visible.katakana;

  return (
    <div
      className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] items-start gap-2 p-2.5 sm:gap-2.5 sm:p-3"
      role="list"
    >
      {items.map((it) => {
        const kana = maybeKatakana(it.kana, katakanaMode);
        const katakana = maybeKatakana(it.kana, "katakana");
        /* Tampilkan baris katakana hanya kalau aktif DAN berbeda dari kana
           utama — supaya tidak ada dua baris identik. */
        const showKataRow = showKatakana && katakana !== kana;

        return (
          <article
            key={it.no}
            role="listitem"
            className="k-card relative flex flex-col gap-1.5 p-3 pr-11 transition-colors
              duration-150 hover:border-line/25"
          >
            {/* —— Baris atas: nomor —— */}
            <div className="flex items-center gap-2">
              {visible.no && (
                <span className="k-num text-[11px] font-medium tabular-nums text-muted/70">
                  #{it.no}
                </span>
              )}
            </div>

            {/* Tombol audio: absolute di kanan-atas supaya TIDAK pernah
                bertabrakan dengan kana/teks panjang di bawahnya. */}
            <button
              type="button"
              onClick={() => {
                const key = `${bab}-${it.no}`;
                const ok = speak(it.kana);
                setSpeakingKey(ok ? key : null);
              }}
              aria-label={`Dengarkan ${it.kana} (bab ${bab} nomor ${it.no})`}
              title={`Dengarkan ${it.romaji}`}
              className={`absolute right-2.5 top-2.5 grid h-7 w-7 place-items-center
                rounded-full transition-colors duration-150 active:scale-90
                focus-visible:text-accent ${
                  speakingKey === `${bab}-${it.no}`
                    ? "bg-accent/15 text-accent"
                    : "text-muted/70 hover:bg-accent/15 hover:text-accent"
                }`}
            >
              <AppIcon
                icon={
                  speakingKey === `${bab}-${it.no}`
                    ? "ph:waveform"
                    : "ph:speaker-high"
                }
                className="text-[15px]"
              />
            </button>

            {/* —— Kana utama —— */}
            <p className="min-w-0 overflow-hidden break-words font-jp text-[21px] font-medium leading-[1.3] text-ink">
              {kana}
            </p>

            {/* —— Katakana (opsional) —— */}
            {showKataRow && (
              <p className="min-w-0 overflow-hidden break-words font-jp text-[13px] leading-tight text-ink-soft/80">
                {katakana}
              </p>
            )}

            {/* —— Romaji —— */}
            {showRomaji && (
              <p className="min-w-0 overflow-hidden break-words font-mono text-[12px] leading-tight text-ink-soft/80">
                {it.romaji}
              </p>
            )}

            {/* —— Kanji (hanya bila terisi) —— */}
            {showKanji && it.kanji.trim() !== "" && (
              <p className="min-w-0 overflow-hidden break-words font-jp text-[15px] leading-[1.35] text-ink-soft">
                {it.kanji}
              </p>
            )}

            {/* —— Arti —— */}
            {showArti && (
              <p className="mt-auto border-t border-line/[0.07] pt-1.5 text-[13.5px]
                leading-[1.5] text-body">
                {it.arti || (
                  <span aria-hidden className="text-muted/40">
                    —
                  </span>
                )}
              </p>
            )}
          </article>
        );
      })}
    </div>
  );
}
