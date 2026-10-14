import TopBar from "../TopBar";
import Button from "../Button";
import HankoSeal from "../HankoSeal";
import AppIcon from "../Icon";

interface Props {
  /** Judul di TopBar, mis. "Kuis Pilihan" / "Kuis Ketik". */
  title: string;
  /** Jumlah soal pada kuis ini. */
  count: number;
  /** Kalimat aksi yang berbeda per kuis ("mulai kuis" / "mulai mengetik"). */
  hint: string;
  onStart: () => void;
  onBack: () => void;
}

/**
 * Layar konfirmasi sebelum kuis panjang dimulai (soal > CONFIRM_ABOVE).
 * Dipakai bersama oleh QuizPG & QuizKetik.
 */
export default function QuizConfirm({ title, count, hint, onStart, onBack }: Props) {
  return (
    <div className="min-h-full pb-24">
      <TopBar title={title} subtitle="Konfirmasi" onBack={onBack} />
      <div className="mx-auto max-w-md px-4 pt-16 text-center">
        <HankoSeal mark="問" size="lg" className="animate-fade-rise" />
        <p className="mt-6 font-display text-3xl text-ink">{count} soal</p>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
          Bab yang kamu pilih punya <b>{count}</b> kata. Kuis ini akan memuat semua kata
          tersebut — boleh jadi cukup panjang. {hint}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button onClick={onStart} iconRight="ph:arrow-right">
            Mulai kuis
          </Button>
          <button type="button" onClick={onBack} className="k-chip k-chip-off">
            <AppIcon icon="ph:caret-left" className="text-[13px]" />
            Kembali
          </button>
        </div>
      </div>
    </div>
  );
}
