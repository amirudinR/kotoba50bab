import { useMemo } from "react";
import TopBar from "../components/TopBar";
import PaperCard from "../components/PaperCard";
import Button from "../components/Button";
import AppIcon from "../components/Icon";
import { BABS } from "../data";
import { useList, maybeKatakana, type KatakanaMode } from "../store/list";

interface Props {
  onBack: () => void;
}

export default function List({ onBack }: Props) {
  const {
    collapsed,
    visible,
    katakanaMode,
    focusBabs,
    toggleBab,
    expandAll,
    collapseAll,
    expandOnly,
    toggleCol,
    showAllCols,
    resetCols,
    setKatakanaMode,
    toggleFocusBab,
  } = useList();

  const katMap: Record<KatakanaMode, string> = {
    auto: "Auto",
    kana: "Hiragana",
    katakana: "Katakana",
  };

  const cols = useMemo(
    () => [
      visible.no && "No",
      visible.kana && "Hiragana",
      visible.katakana && "Katakana",
      visible.romaji && "Romaji",
      visible.kanji && "Kanji",
      visible.arti && "Arti",
    ].filter(Boolean) as string[],
    [visible],
  );

  return (
    <div className="min-h-full pb-24">
      <TopBar
        title="Daftar Kosakata"
        subtitle="Tampilkan semua per bab — bisa buka/tutup"
        onBack={onBack}
      />

      <main className="mx-auto max-w-5xl px-3 pb-6 sm:px-4">
        {/* Toolbar */}
        <PaperCard className="mt-4 p-3 sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <Button
                variant="ghost"
                size="sm"
                icon="ph:arrows-out"
                onClick={expandAll}
              >
                Buka semua
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon="ph:arrows-in"
                onClick={collapseAll}
              >
                Tutup semua
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon="ph:columns"
                onClick={showAllCols}
              >
                Semua kolom
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon="ph:columns"
                onClick={resetCols}
              >
                Reset kolom
              </Button>
            </div>
          </div>

          {/* Aksi untuk bab terpilih */}
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line/10 pt-3">
            <span className="k-eyebrow">Bab terpilih</span>
            <span className="text-[13px] font-semibold text-ink">
              {focusBabs.length === 0
                ? "belum ada"
                : focusBabs.length > 6
                  ? `${focusBabs.length} bab`
                  : focusBabs.map((n) => n).join(", ")}
            </span>
            <div className="ml-auto flex flex-wrap items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                icon="ph:eye"
                disabled={focusBabs.length === 0}
                onClick={() => expandOnly(focusBabs)}
              >
                Buka terpilih
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon="ph:eye-slash"
                disabled={focusBabs.length === 0}
                onClick={() => {
                  const c: Record<number, boolean> = {};
                  for (const n of focusBabs) c[n] = true;
                  useList.setState({ collapsed: { ...collapsed, ...c } });
                }}
              >
                Tutup terpilih
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="k-eyebrow hidden sm:inline">Format kana</span>
              <div className="flex items-center gap-1 overflow-hidden rounded-pill border border-line/15 bg-surface p-0.5 shadow-soft">
                {(["auto", "kana", "katakana"] as KatakanaMode[]).map((m) => {
                  const active = katakanaMode === m;
                  return (
                    <button
                      key={m}
                      onClick={() => setKatakanaMode(m)}
                      className={`h-8 rounded-pill px-2.5 text-[13px] font-medium transition ${
                        active
                          ? "bg-ink text-surface shadow-soft"
                          : "text-muted hover:text-ink"
                      }`}
                    >
                      {katMap[m]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Kolom toggle */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {(
              [
                ["no", "No"],
                ["kana", "Hiragana"],
                ["katakana", "Katakana"],
                ["romaji", "Romaji"],
                ["kanji", "Kanji"],
                ["arti", "Arti"],
              ] as const
            ).map(([k, label]) => {
              const act = visible[k];
              return (
                <button
                  key={k}
                  onClick={() => toggleCol(k)}
                  className={`rounded-pill border px-2.5 py-1 text-[12px] font-medium transition ${
                    act
                      ? "border-ink/35 bg-ink text-surface"
                      : "border-line/15 bg-sunken/60 text-muted hover:text-ink"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </PaperCard>

        {/* Daftar per bab */}
        <div className="mt-3 space-y-3">
          {BABS.map((b) => {
            const isCollapsed = !!collapsed[b.bab];
            const isPicked = focusBabs.includes(b.bab);
            return (
              <PaperCard key={b.bab} className="overflow-hidden">
                <div className="flex items-stretch">
                  <button
                    onClick={() => toggleBab(b.bab)}
                    aria-expanded={!isCollapsed}
                    className="flex min-w-0 flex-1 items-center justify-between gap-3 px-3 py-3 text-left sm:px-4"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <AppIcon
                        icon={isCollapsed ? "ph:caret-right" : "ph:caret-down"}
                        className="text-base text-ink-soft"
                      />
                      <h2 className="truncate font-display text-base font-semibold text-ink sm:text-lg">
                        Bab {b.bab}
                      </h2>
                      <span className="k-eyebrow hidden sm:inline">
                        {b.items.length} kata
                      </span>
                    </div>
                  </button>

                  {/* Pilih bab untuk buka/tertutup terpilih */}
                  <button
                    onClick={() => toggleFocusBab(b.bab)}
                    aria-pressed={isPicked}
                    aria-label={`Pilih bab ${b.bab} untuk buka/tertutup terpilih`}
                    className={`grid w-11 shrink-0 place-items-center border-l border-line/10 transition ${
                      isPicked
                        ? "bg-accent/15 text-accent"
                        : "text-muted hover:bg-sunken/60 hover:text-ink"
                    }`}
                  >
                    <AppIcon
                      icon={isPicked ? "ph:check-square" : "ph:square"}
                      className="text-lg"
                    />
                  </button>
                </div>

                {!isCollapsed && (
                  <div className="overflow-x-auto border-t border-line/10">
                    <table className="w-full min-w-[860px] table-fixed border-separate border-spacing-0 text-[14px]">
                      <thead>
                        <tr className="bg-sunken/40">
                          {cols.map((c) => (
                            <th
                              key={c}
                              className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-muted first:pl-4 last:pr-4"
                            >
                              {c}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {b.items.map((it, i) => {
                          const kataDisp = maybeKatakana(it.kana, katakanaMode);
                          const rowBg = i % 2 === 0 ? "bg-surface" : "bg-raised/40";
                          return (
                            <tr
                              key={`${b.bab}-${it.no}`}
                              className={`${rowBg} hover:bg-ink/[0.04]`}
                            >
                              {visible.no && (
                                <td className="k-num whitespace-nowrap px-3 py-2 text-muted first:pl-4">
                                  {it.no}
                                </td>
                              )}
                              {visible.kana && (
                                <td className="whitespace-nowrap px-3 py-2 font-display text-ink first:pl-4">
                                  {kataDisp}
                                </td>
                              )}
                              {visible.katakana && (
                                <td className="whitespace-nowrap px-3 py-2 font-display text-ink">
                                  {maybeKatakana(it.kana, "katakana")}
                                </td>
                              )}
                              {visible.romaji && (
                                <td className="whitespace-nowrap px-3 py-2 font-mono text-body">
                                  {it.romaji}
                                </td>
                              )}
                              {visible.kanji && (
                                <td className="whitespace-nowrap px-3 py-2 font-display text-ink-soft">
                                  {it.kanji || ""}
                                </td>
                              )}
                              {visible.arti && (
                                <td className="max-w-[360px] px-3 py-2 text-body last:pr-4">
                                  {it.arti}
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </PaperCard>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            Kembali ke Home
          </Button>
        </div>
      </main>
    </div>
  );
}
