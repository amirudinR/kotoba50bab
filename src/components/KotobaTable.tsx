import { useState } from "react";
import AppIcon from "./Icon";
import ColResizer from "./ColResizer";
import { useColWidths, pickWidth } from "../store/colwidth";
import { maybeKatakana, type KatakanaMode } from "../store/list";
import type { ColKey } from "../store/list";
import type { Kotoba } from "../types";

interface Props {
  items: Kotoba[];
  visible: Record<ColKey, boolean>;
  katakanaMode: KatakanaMode;
  speak: (t: string) => boolean;
  /** @deprecated tombol suara kini selalu tampil — tak lagi dipakai. */
  canSpeak?: boolean;
  /** @deprecated status bicara kini per-baris. */
  isSpeaking?: boolean;
}

/**
 * Lebar kolom dalam px (nilai DEFAULT — bisa diubah pengguna lewat drag,
 * lebar tersimpan di localStorage per kolom). Dipakai bersama
 * `table-layout: fixed` + `<colgroup>`, sehingga lebar yang ditulis dipatuhi.
 */
const WIDTH: Record<ColKey, number> = {
  no: 44,
  kana: 208,
  katakana: 196,
  romaji: 236,
  kanji: 128,
  arti: 220,
  audio: 44,
};

/** Id tabel untuk menyimpan lebar kolom di localStorage. */
const TABLE_ID = "list";

const LABEL: Record<ColKey, string> = {
  no: "No",
  kana: "Hiragana",
  katakana: "Katakana",
  romaji: "Romaji",
  kanji: "Kanji",
  arti: "Arti",
  audio: "",
};

export default function KotobaTable({
  items,
  visible,
  katakanaMode,
  speak,
}: Props) {
  const [speakingKey, setSpeakingKey] = useState<string | null>(null);
  const keys: ColKey[] = [];
  if (visible.no) keys.push("no");
  if (visible.kana) keys.push("kana");
  if (visible.katakana) keys.push("katakana");
  if (visible.romaji) keys.push("romaji");
  if (visible.kanji) keys.push("kanji");
  if (visible.arti) keys.push("arti");
  keys.push("audio");

  const overrides = useColWidths((s) => s.widths[TABLE_ID]);
  const setWidth = useColWidths((s) => s.setWidth);
  const widthOf = (k: ColKey) => pickWidth(overrides, k, WIDTH[k]);

  const fixed = keys.reduce((n, k) => n + widthOf(k), 0);

  return (
    <div className="scroll-slim overflow-x-auto">
      <table
        className="w-full border-separate border-spacing-0 text-[14px]"
        style={{ minWidth: fixed, tableLayout: "fixed" }}
      >
        <colgroup>
          {keys.map((k) => (
            <col key={k} style={{ width: `${widthOf(k)}px` }} />
          ))}
        </colgroup>

        <thead>
          <tr>
            {keys.map((k) => (
              <th
                key={k}
                scope="col"
                className={[
                  "border-b border-line/10 bg-sunken/70 px-3 py-2",
                  "text-[11px] font-semibold uppercase tracking-[0.08em] text-muted/85",
                  "relative",
                  k === "no" ? "text-center" : "text-left",
                ].join(" ")}
              >
                {LABEL[k] || <span className="sr-only">Audio</span>}
                {/* Kolom No & Audio tidak bisa di-resize (terlalu sempit). */}
                {k !== "no" && k !== "audio" && (
                  <ColResizer
                    width={widthOf(k)}
                    label={`Lebar kolom ${LABEL[k]}`}
                    onResize={(w) => setWidth(TABLE_ID, k, w)}
                  />
                )}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {items.map((it) => (
            <tr
              key={it.no}
              className="group transition-colors duration-100
                hover:bg-ink/[0.045] focus-within:bg-ink/[0.045]"
            >
              {visible.no && (
                <td className="k-rownum border-b border-line/[0.06] px-3 py-[11px] text-center">
                  {it.no}
                </td>
              )}
              {visible.kana && (
                <td
                  className="k-kana overflow-hidden whitespace-nowrap text-ellipsis border-b border-line/[0.06] px-3 py-[11px]"
                  title={it.kana}
                >
                  {maybeKatakana(it.kana, katakanaMode)}
                </td>
              )}
              {visible.katakana && (
                <td
                  className="overflow-hidden whitespace-nowrap text-ellipsis border-b border-line/[0.06] px-3 py-[11px] font-jp text-[15.5px] leading-[1.45] text-ink-soft"
                  title={maybeKatakana(it.kana, "katakana")}
                >
                  {maybeKatakana(it.kana, "katakana")}
                </td>
              )}
              {visible.romaji && (
                <td
                  className="k-romaji overflow-hidden whitespace-nowrap text-ellipsis border-b border-line/[0.06] px-3 py-[11px]"
                  title={it.romaji}
                >
                  {it.romaji}
                </td>
              )}
              {visible.kanji && (
                <td
                  className="k-kanji overflow-hidden whitespace-nowrap text-ellipsis border-b border-line/[0.06] px-3 py-[11px]"
                  title={it.kanji || undefined}
                >
                  {it.kanji || (
                    <span aria-hidden className="text-muted/40">
                      —
                    </span>
                  )}
                </td>
              )}
              {visible.arti && (
                <td
                  className="k-arti overflow-hidden text-ellipsis border-b border-line/[0.06] px-3 py-[11px]"
                  title={it.arti}
                >
                  {it.arti}
                </td>
              )}
              <td className="border-b border-line/[0.06] px-1 py-[7px] text-center">
                <button
                  onClick={() => {
                    const key = `${it.no}`;
                    setSpeakingKey(speak(it.kana) ? key : null);
                  }}
                  aria-label={`Dengarkan pelafalan ${it.kana}`}
                  title={`Dengarkan ${it.romaji}`}
                  className={`grid h-8 w-8 place-items-center rounded-full
                    transition-colors duration-150 active:scale-90
                    focus-visible:text-accent ${
                      speakingKey === `${it.no}`
                        ? "bg-accent/15 text-accent"
                        : "text-muted/70 hover:bg-accent/15 hover:text-accent"
                    }`}
                >
                  <AppIcon
                    icon={
                      speakingKey === `${it.no}`
                        ? "ph:waveform"
                        : "ph:speaker-high"
                    }
                    className="text-[15px]"
                  />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
