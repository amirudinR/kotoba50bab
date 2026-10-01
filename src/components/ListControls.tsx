import AppIcon from "./Icon";
import { Chip, Segmented } from "./Controls";
import type { ColKey, KatakanaMode } from "../store/list";

/* ============================================================
   Panel kontrol Halaman List.

   "Buka semua / Tutup semua" bekerja pada KOLOM (Hiragana, Romaji,
   Kanji, Arti), bukan pada 50 bab. Kontrol untuk 50 bab karena itu
   diberi label eksplisit "Buka semua bab" / "Tutup semua bab"
   supaya tidak tertukar dengan toggle kolom.

   Prinsip hierarchy:
     - Aksi utama   : Buka / Tutup semua kolom (filled + outline)
     - Preferensi   : kolom & format kana (chip / segmented, low-key)
     - Aksi bab     : buka/tutup seluruh 50 bab (outline)
     - Aksi terpilih: tied ke "bab terpilih" (outline, disabled saat kosong)

   Panel sengaja compact: kontrol tidak boleh mengalahkan konten.
   Baris-baris dipisah hairline, bukan kartu besar bertumpuk.
   ============================================================ */

/** Kolom isi yang ditutup "Tutup semua". No & audio bukan bagian dari ini. */
const MAIN_COLS: ColKey[] = ["kana", "romaji", "kanji", "arti"];

const COLS: { key: ColKey; label: string }[] = [
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
  onShowAllCols: () => void;
  onHideMainCols: () => void;
  onReset: () => void;
  katakanaMode: KatakanaMode;
  onKana: (m: KatakanaMode) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  focusCount: number;
  onExpandPicked: () => void;
  onCollapsePicked: () => void;
}

const OUTLINE =
  "inline-flex h-9 items-center gap-1.5 rounded-pill border border-line/20 " +
  "bg-transparent px-3.5 text-[13px] font-semibold text-ink " +
  "transition-colors duration-150 hover:border-line/35 hover:bg-ink/[0.05] " +
  "active:scale-[0.97]";

const QUIET =
  "inline-flex h-8 items-center gap-1 rounded-pill px-2.5 text-[12px] " +
  "font-medium text-muted transition-colors hover:bg-ink/[0.06] hover:text-ink";

/* Versi "terpilih": butuh tombol, bukan hanya teks links. */
const OUTLINE_SM =
  "inline-flex h-8 items-center gap-1 rounded-pill border border-line/[0.18] " +
  "px-2.5 text-[12px] font-semibold text-ink transition-colors " +
  "hover:border-line/35 hover:bg-ink/[0.05] " +
  "disabled:pointer-events-none disabled:opacity-40";

export default function ListControls({
  visible,
  onToggleCol,
  onShowAllCols,
  onHideMainCols,
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
  const mainOn = MAIN_COLS.filter((k) => visible[k]).length;
  /* "Buka semua" nonaktif hanya kalau benar-benar tidak ada kolom tersembunyi,
     termasuk Katakana — kalau hanya cek 4 kolom utama, tombol mati padahal
     Kolom masih ada yang belum tampil. */
  const allColsOn = COLS.every((c) => visible[c.key]);

  return (
    <div className="k-card overflow-hidden">
      {/* —— Baris 1: aksi utama kolom —— */}
      <div className="flex flex-wrap items-center gap-2 px-3 py-3 sm:px-4">
        <button
          type="button"
          onClick={onShowAllCols}
          disabled={allColsOn}
          title="Tampilkan semua kolom"
          className="inline-flex h-9 items-center gap-1.5 rounded-pill bg-ink
            px-3.5 text-[13px] font-semibold text-surface shadow-soft
            transition-[filter,transform] duration-150 hover:brightness-110
            active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40"
        >
          <AppIcon icon="ph:eye" className="text-[15px]" />
          Buka semua
        </button>
        <button
          type="button"
          onClick={onHideMainCols}
          disabled={mainOn === 0}
          title="Tutup kolom Hiragana, Romaji, Kanji, dan Arti"
          className={OUTLINE + " disabled:pointer-events-none disabled:opacity-40"}
        >
          <AppIcon icon="ph:eye-slash" className="text-[15px]" />
          Tutup semua
        </button>

        <div className="ml-auto flex items-center gap-1">
          <button type="button" onClick={onReset} title="Kembalikan kolom ke tampilan awal" className={QUIET}>
            <AppIcon icon="ph:arrow-counter-clockwise" className="text-[14px]" />
            Reset
          </button>
        </div>
      </div>

      {/* —— Baris 2: toggle kolom —— */}
      <div className="k-hairline border-t px-3 py-2.5 sm:px-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-0.5 w-[52px] shrink-0 text-[12px] font-medium text-muted">Kolom</span>
          {COLS.map((c) => (
            <Chip
              key={c.key}
              active={visible[c.key]}
              onClick={() => onToggleCol(c.key)}
              title={`${visible[c.key] ? "Sembunyikan" : "Tampilkan"} kolom ${c.label}`}
            >
              {c.label}
            </Chip>
          ))}
        </div>
      </div>

      {/* —— Baris 3: format kana —— */}
      <div className="k-hairline flex items-center gap-3 px-3 py-2.5 sm:px-4">
        <span className="w-[52px] shrink-0 text-[12px] font-medium text-muted">Kana</span>
        <Segmented
          options={KANA_OPTIONS}
          value={katakanaMode}
          onChange={onKana}
          className="max-w-[260px] flex-1"
        />
      </div>

      {/* —— Baris 4: buka/tutup 50 bab —— */}
      <div className="k-hairline flex flex-wrap items-center gap-2 px-3 py-2.5 sm:px-4">
        <span className="w-[52px] shrink-0 text-[12px] font-medium text-muted">Bab</span>
        <button type="button" onClick={onExpandAll} title="Buka seluruh 50 bab" className={OUTLINE}>
          <AppIcon icon="ph:arrows-out" className="text-[15px]" />
          Buka semua bab
        </button>
        <button type="button" onClick={onCollapseAll} title="Tutup seluruh 50 bab" className={OUTLINE}>
          <AppIcon icon="ph:arrows-in" className="text-[15px]" />
          Tutup semua bab
        </button>
      </div>

      {/* —— Baris 5: status & aksi bab terpilih —— */}
      <div className="k-hairline flex flex-wrap items-center gap-2 bg-sunken/40 px-3 py-2.5 sm:px-4">
        <span className="w-[52px] shrink-0 text-[12px] font-medium text-muted">Terpilih</span>
        <span
          className={
            focusCount === 0
              ? "text-[13px] text-muted"
              : "text-[13px] font-semibold text-ink"
          }
        >
          {focusCount === 0 ? "Belum ada bab dipilih" : `${focusCount} bab dipilih`}
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            disabled={noPicked}
            onClick={onExpandPicked}
            title="Buka bab yang dipilih"
            className={OUTLINE_SM}
          >
            <AppIcon icon="ph:caret-right" className="text-[13px]" />
            Buka terpilih
          </button>
          <button
            type="button"
            disabled={noPicked}
            onClick={onCollapsePicked}
            title="Tutup bab yang dipilih"
            className={OUTLINE_SM}
          >
            <AppIcon icon="ph:caret-down" className="text-[13px]" />
            Tutup terpilih
          </button>
        </div>
      </div>
    </div>
  );
}