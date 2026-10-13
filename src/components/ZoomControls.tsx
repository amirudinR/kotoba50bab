import AppIcon from "./Icon";
import { useZoom, ZOOM_STEPS, DEFAULT_ZOOM } from "../store/zoom";

/* ============================================================
   Kontrol zoom (skala tampilan) untuk TopBar.

   Tiga bagian: tombol perkecil, label persen (klik = reset 100%),
   tombol perbesar. Disembunyikan di layar sangat kecil supaya
   header tidak sesak; zoom tetap bisa dipakai di layar lega.
   ============================================================ */

export default function ZoomControls() {
  const pct = useZoom((s) => s.pct);
  const zoomIn = useZoom((s) => s.zoomIn);
  const zoomOut = useZoom((s) => s.zoomOut);
  const resetZoom = useZoom((s) => s.resetZoom);

  const minIdx = ZOOM_STEPS.indexOf(ZOOM_STEPS[0]);
  const maxIdx = ZOOM_STEPS.length - 1;
  const idx = ZOOM_STEPS.indexOf(pct);
  const atMin = idx <= minIdx;
  const atMax = idx >= maxIdx;

  const baseBtn =
    "grid h-8 w-8 place-items-center rounded-full text-[16px] transition-colors " +
    "duration-150 hover:bg-ink/[0.07] hover:text-ink active:scale-95 " +
    "disabled:pointer-events-none disabled:opacity-35";

  return (
    <div className="hidden items-center rounded-pill border border-line/[0.14] bg-surface/60 sm:flex">
      <button
        type="button"
        onClick={zoomOut}
        disabled={atMin}
        aria-label="Perkecil tampilan"
        title="Perkecil tampilan"
        className={baseBtn + " ml-0.5 text-muted"}
      >
        <AppIcon icon="ph:magnifying-glass-minus" />
      </button>

      <button
        type="button"
        onClick={resetZoom}
        aria-label={`Ukuran tampilan ${pct} persen. Klik untuk kembali ke 100 persen.`}
        title={pct === DEFAULT_ZOOM ? "Ukuran normal" : "Klik untuk normal (100%)"}
        className="k-num min-w-[44px] px-1 text-center font-mono text-[12px] font-semibold
          leading-none text-ink-soft tabular-nums transition-colors hover:text-ink"
      >
        {pct}%
      </button>

      <button
        type="button"
        onClick={zoomIn}
        disabled={atMax}
        aria-label="Perbesar tampilan"
        title="Perbesar tampilan"
        className={baseBtn + " mr-0.5 text-muted"}
      >
        <AppIcon icon="ph:magnifying-glass-plus" />
      </button>
    </div>
  );
}
