import { useEffect, useState } from "react";
import type { DoushiTe } from "../../data/doushi_te";
import { useColWidths, pickWidth } from "../../store/colwidth";
import { isVisible } from "../../store/colvis";
import ColResizer from "../ColResizer";
import JpText from "../JpText";
import AppIcon from "../Icon";
import { KIND_TONE, TABLE_ID, WIDTH, type ColKeyTe } from "./constants";

interface BabTeProps {
  bab: number;
  items: DoushiTe[];
  open: boolean;
  onToggle: () => void;
  isHafal: (bab: number, no: number) => boolean;
  onToggleHafal: (bab: number, no: number) => void;
  speak: (t: string) => boolean;
  speakingKey: string | null;
  setSpeakingKey: (k: string | null) => void;
  /** Peta kolom yang disembunyikan (dari useColVis). */
  hidden: Record<string, boolean> | undefined;
}

/* ============================================================
   Satu blok bab: header buka/tutup + tabel て-form.
   Isi di-unmount setelah animasi tutup selesai (pola BabAccordion).
   ============================================================ */
export default function BabTe({
  bab,
  items,
  open,
  onToggle,
  isHafal,
  onToggleHafal,
  speak,
  speakingKey,
  setSpeakingKey,
  hidden,
}: BabTeProps) {
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    const t = setTimeout(() => setMounted(false), 280);
    return () => clearTimeout(t);
  }, [open]);

  const hafalBab = items.filter((d) => isHafal(d.bab, d.no)).length;
  const kosong = items.length === 0;

  const overrides = useColWidths((s) => s.widths[TABLE_ID]);
  const setWidth = useColWidths((s) => s.setWidth);
  const widthOf = (key: ColKeyTe) => pickWidth(overrides, key, WIDTH[key]);

  // Kolom yang dirender (kamus & て bisa disembunyikan).
  const showKamus = isVisible(hidden, "kamus");
  const showTe = isVisible(hidden, "te");
  const fixed =
    widthOf("no") +
    widthOf("kata") +
    widthOf("arti") +
    (showKamus ? widthOf("kamus") : 0) +
    (showTe ? widthOf("te") : 0);

  // Bab tanpa kata kerja: header ditandai, tombol buka/tutup dimatikan.
  if (kosong) {
    return (
      <section className="k-card overflow-hidden opacity-60">
        <div className="flex w-full items-center gap-3 px-3 py-3 sm:px-4">
          <AppIcon icon="ph:minus" className="shrink-0 text-[15px] text-muted/60" />
          <span className="min-w-0 flex-1">
            <span className="flex items-baseline gap-2">
              <span className="font-display text-[16px] font-semibold leading-none text-ink-soft sm:text-[17px]">
                Bab {bab}
              </span>
              <span className="k-num text-[12.5px] text-muted">0 kata</span>
            </span>
            <span className="mt-1 block text-[12px] leading-none text-muted/70">
              Tidak ada kata kerja di bab ini
            </span>
          </span>
        </div>
      </section>
    );
  }

  return (
    <section
      className={[
        "k-card overflow-hidden transition-[border-color,box-shadow] duration-200",
        open ? "border-line/20" : "hover:border-line/25",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`te-bab-${bab}-isi`}
        className="flex w-full items-center gap-3 px-3 py-3 text-left
          transition-colors duration-150 hover:bg-ink/[0.035] sm:px-4"
      >
        <AppIcon
          icon="ph:caret-right"
          className={[
            "shrink-0 text-[15px] text-muted transition-transform duration-200",
            open ? "rotate-90" : "",
          ].join(" ")}
        />
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline gap-2">
            <span className="font-display text-[16px] font-semibold leading-none text-ink sm:text-[17px]">
              Bab {bab}
            </span>
            <span className="k-num text-[12.5px] text-muted">{items.length} kata</span>
          </span>
          <span className="mt-1 block text-[12px] leading-none text-muted/80">
            {hafalBab} / {items.length} sudah hafal
          </span>
        </span>
        <AppIcon
          icon="ph:caret-down"
          className={[
            "shrink-0 text-[16px] text-muted transition-transform duration-200",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      <div
        id={`te-bab-${bab}-isi`}
        className={["k-collapse", open ? "k-collapse-open" : ""].join(" ")}
      >
        <div>
          {mounted && (
            <div className="scroll-slim overflow-x-auto border-t border-line/[0.07]">
              <table
                className="w-full border-separate border-spacing-0 text-[14px]"
                style={{ minWidth: fixed + 140, tableLayout: "fixed" }}
              >
                <colgroup>
                  <col style={{ width: `${widthOf("no")}px` }} />
                  <col style={{ width: `${widthOf("kata")}px` }} />
                  <col style={{ width: `${widthOf("arti")}px` }} />
                  {showKamus && <col style={{ width: `${widthOf("kamus")}px` }} />}
                  {showTe && <col style={{ width: `${widthOf("te")}px` }} />}
                </colgroup>

                <thead>
                  <tr>
                    <th className="border-b border-line/10 bg-sunken/70 px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-muted/85">
                      No
                    </th>
                    <th className="relative border-b border-line/10 bg-sunken/70 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-muted/85">
                      Kata
                      <ColResizer
                        width={widthOf("kata")}
                        label="Lebar kolom Kata"
                        onResize={(w) => setWidth(TABLE_ID, "kata", w)}
                      />
                    </th>
                    <th className="relative border-b border-line/10 bg-sunken/70 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-muted/85">
                      Arti
                      <ColResizer
                        width={widthOf("arti")}
                        label="Lebar kolom Arti"
                        onResize={(w) => setWidth(TABLE_ID, "arti", w)}
                      />
                    </th>
                    {showKamus && (
                      <th className="relative border-b border-l border-line/10 bg-sunken/70 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-muted/85">
                        Kamus
                        <ColResizer
                          width={widthOf("kamus")}
                          label="Lebar kolom Kamus"
                          onResize={(w) => setWidth(TABLE_ID, "kamus", w)}
                        />
                      </th>
                    )}
                    {showTe && (
                      <th className="relative border-b border-l border-line/10 bg-accent-soft/60 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-accent">
                        て
                        <ColResizer
                          width={widthOf("te")}
                          label="Lebar kolom て"
                          onResize={(w) => setWidth(TABLE_ID, "te", w)}
                        />
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {items.map((d) => {
                    const key = `${d.bab}-${d.no}`;
                    const marked = isHafal(d.bab, d.no);
                    return (
                      <tr
                        key={key}
                        className="group transition-colors duration-100 hover:bg-ink/[0.045] focus-within:bg-ink/[0.045]"
                      >
                        <td className="k-rownum border-b border-line/[0.06] px-3 py-[9px] text-center">
                          {d.no}
                        </td>
                        <td className="border-b border-line/[0.06] px-3 py-[9px]">
                          <span className="flex items-center gap-1.5">
                            <span className="k-kana overflow-hidden whitespace-nowrap text-ellipsis" title={d.kamus}>
                              <JpText text={d.kamus} />
                            </span>
                            <span
                              className={`k-num shrink-0 rounded px-1 py-0.5 font-mono text-[9.5px] font-semibold ${KIND_TONE[d.kind]}`}
                            >
                              {d.kind}
                            </span>
                            <button
                              type="button"
                              onClick={() => onToggleHafal(d.bab, d.no)}
                              aria-pressed={marked}
                              aria-label={marked ? "Sudah hafal" : "Tandai sudah hafal"}
                              title={marked ? "Batalkan hafal" : "Tandai hafal"}
                              className={`ml-auto grid h-7 w-7 shrink-0 place-items-center rounded-full text-[13px] transition active:scale-90 ${
                                marked
                                  ? "bg-success-soft text-success"
                                  : "text-muted/50 hover:bg-ink/[0.06] hover:text-ink-soft"
                              }`}
                            >
                              <AppIcon icon={marked ? "ph:check-circle" : "ph:star"} />
                            </button>
                          </span>
                          {d.kanji && (
                            <span className="k-kanji mt-0.5 block overflow-hidden whitespace-nowrap text-ellipsis text-[11.5px] text-muted" title={d.kanji}>
                              <JpText text={d.kanji} />
                            </span>
                          )}
                        </td>
                        <td className="border-b border-line/[0.06] px-3 py-[9px]">
                          <span className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSpeakingKey(speak(d.te) ? key : null)}
                              aria-label={`Dengarkan ${d.te}`}
                              className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[13px] transition active:scale-90 ${
                                speakingKey === key
                                  ? "bg-accent-soft text-accent"
                                  : "text-muted/50 hover:bg-ink/[0.06] hover:text-ink-soft"
                              }`}
                            >
                              <AppIcon icon="ph:speaker-high" />
                            </button>
                            <span className="k-arti text-[13.5px] leading-snug text-body">
                              {d.arti}
                            </span>
                          </span>
                        </td>
                        {showKamus && (
                          <td className="border-b border-l border-line/[0.06] px-3 py-[9px] font-jp text-[14px] text-ink-soft">
                            <span className="block overflow-hidden whitespace-nowrap text-ellipsis" title={d.kamus}>
                              <JpText text={d.kamus} />
                            </span>
                          </td>
                        )}
                        {showTe && (
                          <td className="border-b border-l border-line/[0.06] px-3 py-[9px] font-jp text-[15px] font-semibold text-accent">
                            <span className="block overflow-hidden whitespace-nowrap text-ellipsis" title={d.te}>
                              <JpText text={d.te} />
                            </span>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
