import { useCallback, useRef } from "react";

/* ============================================================
   Pegangan (handle) untuk melebarkan/menyempitkan kolom tabel.

   Cara pakai: tempatkan di dalam sel <th> kolom yang mau di-resize
   (posisi absolute di sisi kanan). Saat digeser, `onResize` menerima
   lebar baru kolom itu + deltaX. Pemanggil yang menyimpan lebarnya.

   Mendukung mouse, sentuh (pointer events), dan keyboard (← / →).
   ============================================================ */

interface Props {
  /** Lebar kolom saat ini (px) — titik awal drag. */
  width: number;
  /** Dipanggil saat digeser; terima lebar baru (px) & delta sejak mulai. */
  onResize: (nextWidth: number, deltaX: number) => void;
  /** Dipanggil saat drag selesai (untuk komit / simpan). */
  onCommit?: (finalWidth: number) => void;
  /** Label untuk screen reader. */
  label: string;
}

export default function ColResizer({ width, onResize, onCommit, label }: Props) {
  const startX = useRef(0);
  const startW = useRef(width);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      startX.current = e.clientX;
      startW.current = width;
      const el = e.currentTarget;
      el.setPointerCapture(e.pointerId);

      const move = (ev: PointerEvent) => {
        const dx = ev.clientX - startX.current;
        onResize(startW.current + dx, dx);
      };
      const up = (ev: PointerEvent) => {
        el.releasePointerCapture?.(ev.pointerId);
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerup", up);
        el.removeEventListener("pointercancel", up);
        onCommit?.(startW.current + (ev.clientX - startX.current));
      };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerup", up);
      el.addEventListener("pointercancel", up);
    },
    [width, onResize, onCommit],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const step = e.shiftKey ? 24 : 8;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        onResize(width + step, step);
        onCommit?.(width + step);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        onResize(Math.max(0, width - step), -step);
        onCommit?.(Math.max(0, width - step));
      }
    },
    [width, onResize, onCommit],
  );

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      onClick={(e) => e.stopPropagation()}
      className="group absolute right-0 top-0 z-10 flex h-full w-2.5
        cursor-col-resize touch-none select-none items-center justify-center
        outline-none"
    >
      {/* garis pemisah tipis, menebal saat hover/fokus */}
      <span
        className="h-full w-px bg-line/[0.12] transition-[width,background-color]
          group-hover:w-[3px] group-hover:bg-accent/60
          group-focus-visible:w-[3px] group-focus-visible:bg-accent"
        aria-hidden
      />
    </div>
  );
}
