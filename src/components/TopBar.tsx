import type { ReactNode } from "react";
import AppIcon from "./Icon";
import type { IconName } from "./Icon";
import { useTheme, type Theme } from "../store/theme";

interface TopBarProps {
  title: string;
  subtitle?: ReactNode;
  onBack?: () => void;
  right?: ReactNode;
}

const THEME_ICON: Record<Theme, IconName> = {
  light: "ph:sun",
  dark: "ph:moon",
  system: "ph:laptop",
};

const THEME_LABEL: Record<Theme, string> = {
  light: "Terang",
  dark: "Gelap",
  system: "Ikuti sistem",
};

export default function TopBar({ title, subtitle, onBack, right }: TopBarProps) {
  const theme = useTheme((s) => s.theme);
  const cycle = useTheme((s) => s.cycle);

  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-3xl items-center gap-2 px-3 sm:px-4">
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Kembali"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink-soft transition hover:bg-ink/[0.07] hover:text-ink active:scale-95"
          >
            <AppIcon icon="ph:caret-left" className="text-xl" />
          </button>
        )}

        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-[19px] font-semibold leading-tight tracking-tight text-ink">
            {title}
          </h1>
          {subtitle && (
            <p className="k-eyebrow mt-0.5 truncate normal-case tracking-normal">
              {subtitle}
            </p>
          )}
        </div>

        {right}

        <button
          onClick={cycle}
          aria-label={`Tema: ${THEME_LABEL[theme]}. Klik untuk ganti.`}
          title={`Tema: ${THEME_LABEL[theme]}`}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink-soft transition hover:bg-ink/[0.07] hover:text-ink active:scale-95"
        >
          <AppIcon icon={THEME_ICON[theme]} className="text-xl" />
        </button>
      </div>
    </header>
  );
}
