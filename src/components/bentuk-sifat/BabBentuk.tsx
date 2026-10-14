import { useEffect, useState } from "react";
import type { KeiyoushiBentuk } from "../../data/keiyoushi_konjugasi";
import { useColWidths, pickWidth } from "../../store/colwidth";
import { isVisible } from "../../store/colvis";
import ColResizer from "../ColResizer";
import JpText from "../JpText";
import AppIcon from "../Icon";
import {
  BENTUK_COLS,
  GRUP_INFO,
  TABLE_ID,
  WIDTH,
  type ColKeyBentuk,
  type GayaBentuk,
} from "./constants";

interface BabBentukProps {
  bab: number;
  items: KeiyoushiBentuk[];
  open: boolean;
  onToggle: () => void;
  isHafal: (bab: number, no: number) => boolean;
  onToggleHafal: (bab: number, no: number) => void;
  speak: (t: string) => boolean;
  speakingKey: string | null;
  setSpeakingKey: (k: string | null) => void;
  /** Peta kolom yang disembunyikan (dari useColVis). */
  hidden: Record<string, boolean> | undefined;
  /** Gaya aktif: semua/kasual/formal. */
  gaya: GayaBentuk;
}

/* ============================================================
   Satu blok bab: header buka/tutup + tabel bentuk.
   Isi di-unmount setelah animasi tutup selesai (pola BabAccordion),
   supaya DOM tidak menyimpan tabel bab yang sudah ditutup.
   ============================================================ */
export default function BabBentuk({
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
  gaya,
}: BabBentukProps) {
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    const t = setTimeout(() => setMounted(false), 280);
    return () => clearTimeout(t);
  }, [open]);

  const hafalBab = items.filter((k) => isHafal(k.bab, k.no)).length;
  const kosong = items.length === 0;

  // Lebar kolom: default dari WIDTH, override dari store (drag pengguna).
  const overrides = useColWidths((s) => s.widths[TABLE_ID]);
  const setWidth = useColWidths((s) => s.setWidth);
  const widthOf = (key: ColKeyBentuk) => pickWidth(overrides, key, WIDTH[key]);

  // Kolom yang benar-benar dirender: gaya cocok DAN kolom tidak disembunyikan chip.
  const cols = BENTUK_COLS.filter((c) => {
    if (c.group === null) return true;
    // Kolom variasi sopan じゃ/ではありません hanya saat gaya = "formal".
    if (c.khususFormal && gaya !== "formal") return false;
    const g = c.group.startsWith("kasual") ? "kasual" : "formal";
    if (gaya !== "semua" && gaya !== g) return false;
    return isVisible(hidden, c.key);
  });

  const fixed = cols.reduce((n, c) => n + widthOf(c.key), 0);

  // Grup yang tampil + jumlah kolomnya (untuk header gabungan). Grup kosong dibuang.
  const grupTampil = GRUP_INFO.map((g) => ({
    ...g,
    span: cols.filter((c) => c.group === g.id).length,
  })).filter((g) => g.span > 0);

  // Bab tanpa kata sifat: header ditandai, tombol buka/tutup dimatikan.
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
              Tidak ada kata sifat di bab ini
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
        aria-controls={`bentuk-bab-${bab}-isi`}
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
        id={`bentuk-bab-${bab}-isi`}
        className={["k-collapse", open ? "k-collapse-open" : ""].join(" ")}
      >
        <div>
          {mounted && (
            <div className="scroll-slim overflow-x-auto border-t border-line/[0.07]">
              <table
                className="w-full border-separate border-spacing-0 text-[14px]"
                style={{ minWidth: fixed + 120, tableLayout: "fixed" }}
              >
                <colgroup>
                  {cols.map((c) => (
                    <col key={c.key} style={{ width: `${widthOf(c.key)}px` }} />
                  ))}
                </colgroup>

                <thead>
                  <tr>
                    {/* Kolom dasar: No / Kata / Arti (kosong di baris atas) */}
                    {cols
                      .filter((c) => c.group === null)
                      .map((c) => (
                        <th
                          key={c.key}
                          className={[
                            "border-b border-line/10 bg-sunken/70 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted/85",
                            c.key === "no" ? "text-center" : "text-left",
                            c.key === "no" ? "" : "relative",
                          ].join(" ")}
                        >
                          {c.key === "no" ? "No" : c.key === "kata" ? "Kata" : "Arti"}
                          {c.key !== "no" && (
                            <ColResizer
                              width={widthOf(c.key)}
                              label={`Lebar kolom ${c.key === "kata" ? "Kata" : "Arti"}`}
                              onResize={(w) => setWidth(TABLE_ID, c.key, w)}
                            />
                          )}
                        </th>
                      ))}
                    {/* Header 4 grup: kasual/formal x positif/negatif */}
                    {grupTampil.map((g) => (
                      <th
                        key={g.id}
                        colSpan={g.span}
                        className={[
                          "border-b border-l border-line/10 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.08em]",
                          g.tone === "success"
                            ? "bg-success-soft/60 text-success"
                            : "bg-danger-soft/50 text-danger",
                        ].join(" ")}
                      >
                        {g.label}
                      </th>
                    ))}
                  </tr>
                  <tr>
                    {/* sub-header kolom dasar kosong */}
                    {cols
                      .filter((c) => c.group === null)
                      .map((c) => (
                        <th
                          key={c.key}
                          className="border-b border-line/10 bg-sunken/40 px-3 py-1.5"
                          aria-hidden
                        />
                      ))}
                    {/* sub-header kolom bentuk (Kini / Lampau) */}
                    {cols
                      .filter((c) => c.group !== null)
                      .map((c) => {
                        const tone = c.group?.startsWith("kasual") ? "kasual" : "formal";
                        const isPos = c.group?.endsWith("positif");
                        return (
                          <th
                            key={c.key}
                            className={[
                              "relative border-b border-line/[0.07] px-3 py-1.5 text-left text-[10.5px] font-semibold text-ink-soft",
                              isPos ? "bg-success-soft/40" : "bg-danger-soft/30",
                              tone === "kasual" && c.sub === "Kini"
                                ? "border-l border-line/[0.06]"
                                : "",
                              tone === "formal" && c.sub === "Kini"
                                ? "border-l border-line/[0.06]"
                                : "",
                            ].join(" ")}
                          >
                            {c.sub}
                            <ColResizer
                              width={widthOf(c.key)}
                              label={`Lebar kolom ${c.group} ${c.sub}`}
                              onResize={(w) => setWidth(TABLE_ID, c.key, w)}
                            />
                          </th>
                        );
                      })}
                  </tr>
                </thead>

                <tbody>
                  {items.map((k) => {
                    const key = `${k.bab}-${k.no}`;
                    const marked = isHafal(k.bab, k.no);
                    return (
                      <tr
                        key={key}
                        className="group transition-colors duration-100 hover:bg-ink/[0.045] focus-within:bg-ink/[0.045]"
                      >
                        {cols.map((c) => {
                          // Kolom No
                          if (c.key === "no")
                            return (
                              <td
                                key={c.key}
                                className="k-rownum border-b border-line/[0.06] px-3 py-[9px] text-center"
                              >
                                {k.no}
                              </td>
                            );
                          // Kolom Kata
                          if (c.key === "kata")
                            return (
                              <td key={c.key} className="border-b border-line/[0.06] px-3 py-[9px]">
                                <span className="flex items-center gap-1.5">
                                  <span
                                    className="k-kana overflow-hidden whitespace-nowrap text-ellipsis"
                                    title={k.kana}
                                  >
                                    <JpText text={k.kana} />
                                  </span>
                                  <span
                                    className={`shrink-0 rounded px-1 py-0.5 font-mono text-[9.5px] font-semibold ${
                                      k.kind === "na"
                                        ? "bg-accent-soft text-accent"
                                        : "bg-ink/[0.08] text-ink-soft"
                                    }`}
                                  >
                                    {k.kind === "na" ? "な" : "い"}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => onToggleHafal(k.bab, k.no)}
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
                                {k.kanji && (
                                  <span
                                    className="k-kanji mt-0.5 block overflow-hidden whitespace-nowrap text-ellipsis text-[11.5px] text-muted"
                                    title={k.kanji}
                                  >
                                    <JpText text={k.kanji} />
                                  </span>
                                )}
                              </td>
                            );
                          // Kolom Arti (dengan tombol audio)
                          if (c.key === "arti")
                            return (
                              <td key={c.key} className="border-b border-line/[0.06] px-3 py-[9px]">
                                <span className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setSpeakingKey(speak(k.kana) ? key : null)}
                                    aria-label={`Dengarkan ${k.kana}`}
                                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[13px] transition active:scale-90 ${
                                      speakingKey === key
                                        ? "bg-accent-soft text-accent"
                                        : "text-muted/50 hover:bg-ink/[0.06] hover:text-ink-soft"
                                    }`}
                                  >
                                    <AppIcon icon="ph:speaker-high" />
                                  </button>
                                  <span className="k-arti text-[13.5px] leading-snug text-body">
                                    {k.arti}
                                  </span>
                                </span>
                              </td>
                            );
                          // Kolom bentuk: kasual/formal x positif/negatif
                          const teks = c.nilai ? c.nilai(k) : "";
                          const isPos = c.group?.endsWith("positif");
                          const isFormal = c.group?.startsWith("formal");
                          if (!teks) {
                            // Kolom tidak berlaku untuk kata ini (mis. ではありません
                            // untuk i-adj). Tampilkan tanda "–" redup agar rapi.
                            return (
                              <td
                                key={c.key}
                                className={[
                                  "border-b border-line/[0.06] px-3 py-[9px] text-[14px] text-muted/40",
                                  c.sub === "Kini" ? "border-l border-line/[0.06]" : "",
                                ].join(" ")}
                                title="Tidak berlaku untuk kata ini"
                              >
                                –
                              </td>
                            );
                          }
                          return (
                            <td
                              key={c.key}
                              className={[
                                "border-b border-line/[0.06] px-3 py-[9px] font-jp text-[14px]",
                                isPos ? "text-ink" : "text-seal",
                                isFormal ? "bg-ink/[0.015]" : "",
                                c.sub === "Kini" ? "border-l border-line/[0.06]" : "",
                              ].join(" ")}
                              title={isFormal ? "Bentuk formal (sopan)" : undefined}
                            >
                              <span
                                className="block overflow-hidden whitespace-nowrap text-ellipsis"
                                title={teks}
                              >
                                <JpText text={teks} />
                              </span>
                            </td>
                          );
                        })}
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
