import { useEffect } from "react";
import { useSettings } from "./store/settings";
import { BABS, getKotobaByBabs } from "./data";
import Home from "./pages/Home";
import Flashcard from "./pages/Flashcard";
import QuizPG from "./pages/QuizPG";
import QuizKetik from "./pages/QuizKetik";
import Search from "./pages/Search";
import Progress from "./pages/Progress";
import List from "./pages/List";
import { useApp, type Route } from "./store/app";

export default function App() {
  const route = useApp((s) => s.route);
  const go = useApp((s) => s.go);
  const { selectedBabs } = useSettings();

  // Validasi: kalau tak ada bab terpilih saat masuk mode latihan, arahkan ke Home.
  useEffect(() => {
    const needsBabs: Route[] = ["flashcard", "quiz-pg", "quiz-ketik"];
    if (needsBabs.includes(route) && selectedBabs.length === 0) {
      go("home");
    }
  }, [route, selectedBabs, go]);

  const pool = getKotobaByBabs(selectedBabs);

  switch (route) {
    case "home":
      return <Home />;
    case "flashcard":
      return (
        <Flashcard
          pool={pool}
          shuffle={useSettings.getState().shuffle}
          viewMode={useSettings.getState().viewMode}
          onBack={() => go("home")}
        />
      );
    case "quiz-pg":
      return (
        <QuizPG
          pool={pool}
          allPool={BABS.flatMap((b) => b.items.map((it) => ({ ...it, bab: b.bab })))}
          shuffle={useSettings.getState().shuffle}
          viewMode={useSettings.getState().viewMode}
          onBack={() => go("home")}
        />
      );
    case "quiz-ketik":
      return (
        <QuizKetik
          pool={pool}
          shuffle={useSettings.getState().shuffle}
          viewMode={useSettings.getState().viewMode}
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
