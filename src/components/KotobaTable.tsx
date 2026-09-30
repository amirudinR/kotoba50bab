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
 * Lebar kolom dalam px. Sengaja tidak memakai `table-fixed` yang membagi rata
 * seluruh lebar — kolom "No" hanya berisi 1–2 digit sehingga akan menyisakan
 * ruang kosong besar, sementara kolom "Arti" justru butuh ruang paling lebar.
 */
const WIDTH: Record<ColKey, number> = {
  no: 52,
  kana: 150,
  katakana: 150,
  romaji: 230,
  kanji: 140,
  arti: 0, // sisa ruang
  audio: 52,
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
    <div className="overflow-x-auto">
      <table
        className="w-full border-separate border-spacing-0 text-[14px]"
        style={{ minWidth: fixed + 120 }}
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
                  "sticky top-0 z-10 border-b border-line/15 bg-sunken px-3 py-2.5",
                  "text-[11px] font-semibold uppercase tracking-wide text-muted",
                  k === "no" ? "text-center" : "text-left",
                  k === "no" ? "pl-0" : "",
                  k === keys[keys.length - 1] ? "pr-4" : "",
                ].join(" ")}
              >
                {LABEL[k] || <span className="sr-only">Audio</span>}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {items.map((it, i) => (
            <tr
              key={it.no}
              className={i % 2 === 0 ? "bg-surface" : "bg-raised/40"}
            >
              {visible.no && (
                <td className="k-num px-3 py-2.5 text-center text-muted">
                  {it.no}
                </td>
              )}
              {visible.kana && (
                <td className="whitespace-nowrap px-3 py-2.5 font-display text-ink">
                  {maybeKatakana(it.kana, katakanaMode)}
                </td>
              )}
              {visible.katakana && (
                <td className="whitespace-nowrap px-3 py-2.5 font-display text-ink">
                  {maybeKatakana(it.kana, "katakana")}
                </td>
              )}
              {visible.romaji && (
                <td className="whitespace-nowrap px-3 py-2.5 font-mono text-body">
                  {it.romaji}
                </td>
              )}
              {visible.kanji && (
                <td className="px-3 py-2.5 font-display text-ink-soft">
                  {it.kanji || "—"}
                </td>
              )}
              {visible.arti && (
                <td className="px-3 py-2.5 text-body last:pr-4">
                  {it.arti}
                </td>
              )}
              {canSpeak && (
                <td className="px-1 py-2.5 text-center">
                  <button
                    onClick={() => speak(it.kana)}
                    aria-label={`Dengarkan ${it.kana}`}
                    title="Dengarkan pelafalan"
                    className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition hover:bg-ink/10 hover:text-ink active:scale-90"
                  >
                    <AppIcon
                      icon={isSpeaking ? "ph:speaker-high" : "ph:speaker-simple"}
                      className="text-base"
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
