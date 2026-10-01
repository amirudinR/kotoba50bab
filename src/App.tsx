import { useEffect } from "react";
import { useSettings } from "./store/settings";
import { useKotobaByBabs } from "./data";
import Home from "./pages/Home";
import Flashcard from "./pages/Flashcard";
import QuizPG from "./pages/QuizPG";
import QuizKetik from "./pages/QuizKetik";
import Search from "./pages/Search";
import Progress from "./pages/Progress";
import List from "./pages/List";
import { useApp, type Route } from "./store/app";
import LoadingRows from "./components/LoadingRows";

export default function App() {
  const route = useApp((s) => s.route);
  const go = useApp((s) => s.go);
  const { selectedBabs, shuffle, viewMode } = useSettings();

  const { pool, loading } = useKotobaByBabs(selectedBabs);

  // Validasi: kalau tak ada bab terpilih saat masuk mode latihan, arahkan ke Home.
  useEffect(() => {
    const needsBabs: Route[] = ["flashcard", "quiz-pg", "quiz-ketik"];
    if (needsBabs.includes(route) && selectedBabs.length === 0) {
      go("home");
    }
  }, [route, selectedBabs, go]);

  switch (route) {
    case "home":
      return <Home />;
    case "flashcard":
      return loading ? (
        <Frame title="Flashcard">
          <LoadingRows label="Memuat kosakata…" />
        </Frame>
      ) : (
        <Flashcard
          pool={pool}
          shuffle={shuffle}
          viewMode={viewMode}
          onBack={() => go("home")}
        />
      );
    case "quiz-pg":
      return loading ? (
        <Frame title="Kuis Pilihan">
          <LoadingRows label="Menyiapkan soal…" />
        </Frame>
      ) : (
        <QuizPG
          pool={pool}
          allPool={pool}
          shuffle={shuffle}
          viewMode={viewMode}
          onBack={() => go("home")}
        />
      );
    case "quiz-ketik":
      return loading ? (
        <Frame title="Kuis Ketik">
          <LoadingRows label="Menyiapkan soal…" />
        </Frame>
      ) : (
        <QuizKetik
          pool={pool}
          shuffle={shuffle}
          viewMode={viewMode}
          onBack={() => go("home")}
        />
      );
    case "search":
      return <Search onBack={() => go("home")} />;
    case "progress":
      return <Progress onBack={() => go("home")} />;
    case "list":
      return <List onBack={() => go("home")} />;
    default:
      return <Home />;
  }
}

function Frame({ title, children }: { title: string; children: React.ReactNode }) {
  const go = useApp((s) => s.go);
  return (
    <div className="min-h-full">
      <div className="sticky top-0 z-30 border-b border-line/10 bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-2 px-3 sm:px-4">
          <button
            onClick={() => go("home")}
            aria-label="Kembali"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink-soft transition hover:bg-ink/[0.07] hover:text-ink"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <h1 className="font-display text-[19px] font-semibold text-ink">{title}</h1>
        </div>
      </div>
      <div className="mx-auto max-w-3xl">{children}</div>
    </div>
  );
}
