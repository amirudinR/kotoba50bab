import AppIcon from "./Icon";
import { maybeKatakana, type KatakanaMode } from "../store/list";
import type { ColKey } from "../store/list";
import type { Kotoba } from "../types";

interface Props {
  items: Kotoba[];
  visible: Record<ColKey, boolean>;
  katakanaMode: KatakanaMode;
  speak: (t: string) => boolean;
  canSpeak: boolean;
  isSpeaking: boolean;
}

/**
 * Lebar kolom dalam px. Dipakai bersama `table-layout: fixed` + `<colgroup>`,
 * sehingga lebar yang ditulis di sini dipatuhi persis. Versi sebelumnya
 * memakai `table-fixed` tanpa `colgroup`, yang membuat browser membagi rata
 * seluruh lebar — kolom "No" berisi 1–2 digit jadi menyisakan ruang kosong
 * besar, sedangkan kolom "Arti" justru terpotong.
 */
const WIDTH: Record<ColKey, number> = {
  no: 44,
  kana: 168,
  katakana: 156,
  romaji: 196,
  kanji: 128,
  arti: 0, // sisa ruang
  audio: 44,
};

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
  canSpeak,
  isSpeaking,
}: Props) {
  const keys: ColKey[] = [];
  if (visible.no) keys.push("no");
  if (visible.kana) keys.push("kana");
  if (visible.katakana) keys.push("katakana");
  if (visible.romaji) keys.push("romaji");
  if (visible.kanji) keys.push("kanji");
  if (visible.arti) keys.push("arti");
  if (canSpeak) keys.push("audio");

  const fixed = keys.reduce((n, k) => n + (WIDTH[k] || 0), 0);

  return (
    <div className="scroll-slim overflow-x-auto">
      <table
        className="w-full border-separate border-spacing-0 text-[14px]"
        style={{ minWidth: fixed + 140, tableLayout: "fixed" }}
      >
        <colgroup>
          {keys.map((k) => (
            <col
              key={k}
              style={{ width: WIDTH[k] ? `${WIDTH[k]}px` : undefined }}
            />
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
                  k === "no" ? "text-center" : "text-left",
                ].join(" ")}
              >
                {LABEL[k] || <span className="sr-only">Audio</span>}
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
                <td className="k-kana whitespace-nowrap border-b border-line/[0.06] px-3 py-[11px]">
                  {maybeKatakana(it.kana, katakanaMode)}
                </td>
              )}
              {visible.katakana && (
                <td className="whitespace-nowrap border-b border-line/[0.06] px-3 py-[11px] font-jp text-[15.5px] leading-[1.45] text-ink-soft">
                  {maybeKatakana(it.kana, "katakana")}
                </td>
              )}
              {visible.romaji && (
                <td className="k-romaji whitespace-nowrap border-b border-line/[0.06] px-3 py-[11px]">
                  {it.romaji}
                </td>
              )}
              {visible.kanji && (
                <td className="k-kanji border-b border-line/[0.06] px-3 py-[11px]">
                  {it.kanji || (
                    <span aria-hidden className="text-muted/40">
                      —
                    </span>
                  )}
                </td>
              )}
              {visible.arti && (
                <td className="k-arti border-b border-line/[0.06] px-3 py-[11px]">
                  {it.arti}
                </td>
              )}
              {canSpeak && (
                <td className="border-b border-line/[0.06] px-1 py-[7px] text-center">
                  <button
                    onClick={() => speak(it.kana)}
                    aria-label={`Dengarkan pelafalan ${it.kana}`}
                    title={`Dengarkan ${it.romaji}`}
                    className="grid h-8 w-8 place-items-center rounded-full
                      text-muted/70 transition-colors duration-150
                      hover:bg-accent/15 hover:text-accent active:scale-90
                      focus-visible:text-accent"
                  >
                    <AppIcon
                      icon={isSpeaking ? "ph:waveform" : "ph:speaker-high"}
                      className="text-[15px]"
                    />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
