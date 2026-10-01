import { useEffect, useState } from "react";
import AppIcon from "./Icon";
import KotobaTable from "./KotobaTable";
import LoadingRows from "./LoadingRows";
import type { ColKey, KatakanaMode } from "../store/list";
import type { Kotoba } from "../types";

/* ============================================================
   Accordion satu bab.

   Isinya: header (nomor bab + jumlah kosakata + checkbox pilihan)
   dan tabel kosakata yang hanya dirender saat bab terbuka.

   Animasi buka/tutup pakai `k-collapse` (grid-template-rows 0fr→1fr)
   supaya halus tanpa perlu mengukur tinggi elemen di JavaScript.
   ============================================================ */

interface Props {
  bab: number;
  total: number;
  shown: number;
  /** Tabel sedang ditampilkan (bab terbuka ATAU sedang searching). */
  open: boolean;
  loading: boolean;
  picked: boolean;
  onToggle: () => void;
  onPick: () => void;
  items: Kotoba[];
  visible: Record<ColKey, boolean>;
  katakanaMode: KatakanaMode;
  speak: (t: string) => boolean;
  canSpeak: boolean;
  isSpeaking: boolean;
  /** Mode filter aktif — mengubah label jumlah menjadi "N dari M". */
  filtering: boolean;
}

export default function BabAccordion({
  bab,
  total,
  shown,
  open,
  loading,
  picked,
  onToggle,
  onPick,
  items,
  visible,
  katakanaMode,
  speak,
  canSpeak,
  isSpeaking,
  filtering,
}: Props) {
  // Tabel di-unmount setelah animasi tutup selesai. Kalau tidak, semua baris
  // dari bab yang pernah dibuka tetap menempel di DOM (bisa 2.910 baris)
  // padahal sudah tidak terlihat. Data-nya sendiri tetap ada di cache
  // `useBab`, jadi membuka bab ini lagi akan instan tanpa unduh ulang.
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    const t = setTimeout(() => setMounted(false), 280);
    return () => clearTimeout(t);
  }, [open]);

  return (
    <section
      className={[
        "k-card overflow-hidden transition-[border-color,box-shadow] duration-200",
        open ? "border-line/20" : "hover:border-line/25",
      ].join(" ")}
    >
      <div className="flex items-stretch">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={`bab-${bab}-isi`}
          className="group flex min-w-0 flex-1 items-center gap-3 px-3 py-3
            text-left transition-colors duration-150 hover:bg-ink/[0.035]
            sm:px-4"
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
              <span
                className="font-display text-[16px] font-semibold leading-none
                  text-ink sm:text-[17px]"
              >
                Bab {bab}
              </span>
              <span className="k-num text-[12.5px] text-muted">
                {filtering ? `${shown} / ${total}` : total}
              </span>
            </span>
            <span className="mt-1 block text-[12px] leading-none text-muted/80">
              {filtering
                ? `${shown} kosakata cocok`
                : `${total} kosakata`}
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={onPick}
          aria-pressed={picked}
          aria-label={
            picked ? `Hapus bab ${bab} dari pilihan` : `Pilih bab ${bab}`
          }
          title={picked ? "Batalkan pilihan" : "Pilih bab ini"}
          className={[
            "grid w-12 shrink-0 place-items-center border-l border-line/[0.07]",
            "transition-colors duration-150",
            picked
              ? "bg-accent/[0.12] text-accent"
              : "text-muted/60 hover:bg-ink/[0.04] hover:text-ink-soft",
          ].join(" ")}
        >
          <AppIcon
            icon={picked ? "ph:check-square" : "ph:square"}
            className="text-[19px]"
          />
        </button>
      </div>

      <div
        id={`bab-${bab}-isi`}
        className={["k-collapse", open ? "k-collapse-open" : ""].join(" ")}
      >
        <div>
          {mounted && (
            <div className="border-t border-line/[0.07]">
              {loading ? (
                <LoadingRows rows={4} label={`Memuat bab ${bab}…`} />
              ) : (
                <KotobaTable
                  items={items}
                  visible={visible}
                  katakanaMode={katakanaMode}
                  speak={speak}
                  canSpeak={canSpeak}
                  isSpeaking={isSpeaking}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
