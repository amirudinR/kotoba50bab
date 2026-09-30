import { create } from "zustand";

export type Route =
  | "home"
  | "flashcard"
  | "quiz-pg"
  | "quiz-ketik"
  | "search"
  | "progress";

interface AppState {
  route: Route;
  go: (r: Route) => void;
}

export const useApp = create<AppState>((set) => ({
  route: "home",
  go: (route) => {
    set({ route });
    // scroll ke atas tiap ganti halaman
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0 });
    }
  },
}));
