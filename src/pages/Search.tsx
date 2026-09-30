import { useMemo, useState } from "react";
import { ALL_KOTOBA } from "../data";
import { useProgress } from "../store/progress";
import { normalize } from "../lib/utils";
import TopBar from "../components/TopBar";

interface Props {
  onBack: () => void;
}

export default function Search({ onBack }: Props) {
  const [q, setQ] = useState("");
  const { isHafal, toggleHafal } = useProgress();

  const results = useMemo(() => {
    const query = normalize(q);
    if (!query) return [];
    return ALL_KOTOBA.filter((k) => {
      return (
        normalize(k.kana).includes(query) ||
        normalize(k.kanji).includes(query) ||
        normalize(k.arti).includes(query)
      );
    }).slice(0, 120);
  }, [q]);

  return (
    <div className="min-h-full pb-24">
      <TopBar title="Cari Kosakata" subtitle="kana · kanji · arti" onBack={onBack} />

      <div className="mx-auto max-w-xl px-4 pt-4">
        <div className="sticky top-[68px] z-10 pb-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoFocus
            placeholder="Ketik untuk mencari... (mis. わたし / 私 / saya)"
            className="w-full rounded-2xl border-2 border-ink/20 bg-white/95 px-4 py-3 font-body text-lg text-ink outline-none focus:border-ink/50 shadow-paper"
          />
        </div>

        {q.trim() === "" ? (
          <div className="py-16 text-center text-pencil/70">
            <p className="font-hand text-3xl">Cari kata apa? 🔍</p>
            <p className="mt-2 text-sm">
              Bisa cari pakai huruf Jepang (kana/kanji) atau arti Indonesia.
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="py-16 text-center text-pencil/70">
            <p className="font-hand text-3xl">Tidak ditemukan 😕</p>
          </div>
        ) : (
          <>
            <p className="mb-2 text-xs text-pencil/60">
              {results.length} hasil
            </p>
            <div className="space-y-2">
              {results.map((k) => {
                const marked = isHafal(k.bab, k.no);
                return (
                  <div
                    key={`${k.bab}-${k.no}`}
                    className="flex items-center gap-3 rounded-2xl bg-white/90 border border-black/5 p-3 shadow-paper"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-hand text-2xl text-ink">
                          {k.kana}
                        </span>
                        {k.kanji && (
                          <span className="text-sm text-pencil/70">{k.kanji}</span>
                        )}
                        <span className="ml-auto rounded-md bg-ink/10 px-1.5 py-0.5 text-[10px] font-bold text-ink">
                          bab {k.bab}
                        </span>
                      </div>
                      <div className="text-sm text-ink-soft">{k.arti}</div>
                    </div>
                    <button
                      onClick={() => toggleHafal(k.bab, k.no)}
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg transition active:scale-90 ${
                        marked
                          ? "bg-note-green text-green-800"
                          : "bg-paper-dark/60 text-pencil"
                      }`}
                      title={marked ? "Sudah hafal" : "Tandai sudah hafal"}
                    >
                      {marked ? "✓" : "☆"}
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
