import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  /** Hasil resolve dari `system` — apa yang benar-benar tampil. */
  resolved: "light" | "dark";
  setTheme: (t: Theme) => void;
  cycle: () => void;
  syncFromSystem: () => void;
}

function systemPrefersDark(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

function resolve(t: Theme): "light" | "dark" {
  if (t === "system") return systemPrefersDark() ? "dark" : "light";
  return t;
}

/** Terapkan kelas `dark` ke <html> dan sinkronkan theme-color meta. */
export function applyTheme(resolved: "light" | "dark") {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  // Transisi halus, lalu buang kelasnya supaya tidak menunda interaksi
  root.classList.add("theme-transition");
  window.setTimeout(() => root.classList.remove("theme-transition"), 320);
}

const CYCLE: Theme[] = ["light", "dark", "system"];

export const useTheme = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "system",
      resolved: resolve("system"),

      setTheme: (theme) => {
        const resolved = resolve(theme);
        applyTheme(resolved);
        set({ theme, resolved });
      },

      cycle: () => {
        const next = CYCLE[(CYCLE.indexOf(get().theme) + 1) % CYCLE.length];
        get().setTheme(next);
      },

      syncFromSystem: () => {
        if (get().theme !== "system") return;
        const resolved = resolve("system");
        if (resolved !== get().resolved) {
          applyTheme(resolved);
          set({ resolved });
        }
      },
    }),
    { name: "kotoba-theme" },
  ),
);

/** Pasang listener perubahan preferensi sistem. */
export function initTheme() {
  if (typeof window === "undefined") return;
  const { theme, syncFromSystem } = useTheme.getState();
  applyTheme(resolve(theme));

  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", () => syncFromSystem());
}
