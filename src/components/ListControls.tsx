import AppIcon from "./Icon";
import { Chip, Segmented } from "./Controls";
import type { IconName } from "./Icon";
import type { ColKey, KatakanaMode } from "../store/list";

/* ============================================================
   Panel kontrol Halaman List.

   Prinsip hierarchy:
     - Aksi utama  : "Buka semua" (filled, weight tinggi)
     - Aksi umum   : "Tutup semua" (outline)
     - Preferensi  : kolom & format kana (chip / segmented, low-key)
     - Aksi terpilih: tied ke "bab terpilih" (outline, disabled saat kosong)

   Panel sengaja dibuat compact: kontrol tidak boleh mengalahkan
   konten. Baris-baris dipisah hairline, bukan kartu besar bertumpuk.
   ============================================================ */

const COLS: { key: ColKey; label: string; icon?: IconName }[] = [
  { key: "no", label: "No" },
  { key: "kana", label: "Hiragana" },
  { key: "katakana", label: "Katakana" },
  { key: "romaji", label: "Romaji" },
  { key: "kanji", label: "Kanji" },
  { key: "arti", label: "Arti" },
];

const KANA_OPTIONS: {
  value: KatakanaMode;
  label: string;
  short: string;
  title: string;
}[] = [
  { value: "auto", label: "Auto", short: "Auto", title: "Tampilkan sesuai aslinya" },
  { value: "kana", label: "ひらがな", short: "ひら", title: "Selalu hiragana" },
  { value: "katakana", label: "カタカナ", short: "カタ", title: "Selalu katakana" },
];

interface Props {
  visible: Record<ColKey, boolean>;
  onToggleCol: (k: ColKey) => void;
  onShowAll: () => void;
  onReset: () => void;
  katakanaMode: KatakanaMode;
  onKana: (m: KatakanaMode) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  focusCount: number;
  onExpandPicked: () => void;
  onCollapsePicked: () => void;
}

export default function ListControls({
  visible,
  onToggleCol,
  onShowAll,
  onReset,
  katakanaMode,
  onKana,
  onExpandAll,
  onCollapseAll,
  focusCount,
  onExpandPicked,
  onCollapsePicked,
}: Props) {
  const noPicked = focusCount === 0;

  return (
    <div className="k-card overflow-hidden">
      {/* —— Baris 1: aksi utama &secondary —— */}
      <div className="flex flex-wrap items-center gap-2 px-3 py-3 sm:px-4">
        <button
          type="button"
          onClick={onExpandAll}
          className="inline-flex h-9 items-center gap-1.5 rounded-pill bg-ink
            px-3.5 text-[13px] font-semibold text-surface shadow-soft
            transition-[filter,transform] duration-150 hover:brightness-110
            active:scale-[0.97]"
        >
          <AppIcon icon="ph:arrows-out" className="text-[15px]" />
          Buka semua
        </button>
        <button
          type="button"
          onClick={onCollapseAll}
          className="inline-flex h-9 items-center gap-1.5 rounded-pill border
            border-line/20 bg-transparent px-3.5 text-[13px] font-semibold
            text-ink transition-colors duration-150 hover:border-line/35
            hover:bg-ink/[0.05] active:scale-[0.97]"
        >
          <AppIcon icon="ph:arrows-in" className="text-[15px]" />
          Tutup semua
        </button>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onShowAll}
            title="Tampilkan semua kolom"
            className="inline-flex h-8 items-center gap-1 rounded-pill px-2.5
              text-[12px] font-medium text-muted transition-colors
              hover:bg-ink/[0.06] hover:text-ink"
          >
            <AppIcon icon="ph:columns" className="text-[14px]" />
            Semua kolom
          </button>
          <button
            type="button"
            onClick={onReset}
            title="Kembalikan kolom ke tampilan awal"
            className="inline-flex h-8 items-center gap-1 rounded-pill px-2.5
              text-[12px] font-medium text-muted transition-colors
              hover:bg-ink/[0.06] hover:text-ink"
          >
            <AppIcon icon="ph:arrow-counter-clockwise" className="text-[14px]" />
            Reset
          </button>
        </div>
      </div>

      <div className="k-hairline border-t" />

      {/* —— Baris 2: format kana —— */}
      <div className="flex items-center gap-3 px-3 py-2.5 sm:px-4">
        <span className="w-[52px] shrink-0 text-[12px] font-medium text-muted">Kana</span>
        <Segmented
          options={KANA_OPTIONS}
          value={katakanaMode}
          onChange={onKana}
          className="max-w-[260px] flex-1"
        />
      </div>

      {/* —— Baris 3: toggle kolom —— */}
      <div className="k-hairline border-t px-3 py-2.5 sm:px-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-0.5 w-[52px] shrink-0 text-[12px] font-medium text-muted">Kolom</span>
          {COLS.map((c) => (
            <Chip
              key={c.key}
              active={visible[c.key]}
              onClick={() => onToggleCol(c.key)}
              icon={c.icon}
              title={`Tampilkan kolom ${c.label}`}
            >
              {c.label}
            </Chip>
          ))}
        </div>
      </div>

      {/* —— Baris 4: status & aksi bab terpilih —— */}
      <div className="k-hairline flex flex-wrap items-center gap-2 bg-sunken/40 px-3 py-2.5 sm:px-4">
        <span className="shrink-0 text-[12px] font-medium text-muted">Terpilih</span>
        <span
          className={
            focusCount === 0
              ? "text-[13px] text-muted"
              : "text-[13px] font-semibold text-ink"
          }
        >
          {focusCount === 0
            ? "Belum ada bab dipilih"
            : `${focusCount} bab dipilih`}
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            disabled={noPicked}
            onClick={onExpandPicked}
            className="inline-flex h-8 items-center gap-1 rounded-pill border
              border-line/[0.18] px-2.5 text-[12px] font-semibold text-ink
              transition-colors hover:border-line/35 hover:bg-ink/[0.05]
              disabled:pointer-events-none disabled:opacity-40"
          >
            <AppIcon icon="ph:eye" className="text-[13px]" />
            Buka terpilih
          </button>
          <button
            type="button"
            disabled={noPicked}
            onClick={onCollapsePicked}
            className="inline-flex h-8 items-center gap-1 rounded-pill border
              border-line/[0.18] px-2.5 text-[12px] font-semibold text-ink
              transition-colors hover:border-line/35 hover:bg-ink/[0.05]
              disabled:pointer-events-none disabled:opacity-40"
          >
            <AppIcon icon="ph:eye-slash" className="text-[13px]" />
            Tutup terpilih
          </button>
        </div>
      </div>
    </div>
  );
}
