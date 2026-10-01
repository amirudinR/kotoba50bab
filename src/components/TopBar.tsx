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
    <header className="sticky top-0 z-30 border-b border-line/[0.07] bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-3 sm:px-5">
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Kembali ke halaman sebelumnya"
            title="Kembali"
            className="k-icon-round -ml-1 grid h-9 w-9 shrink-0 place-items-center rounded-full
              text-muted transition-colors duration-150
              hover:bg-ink/[0.07] hover:text-ink active:scale-95"
          >
            <AppIcon icon="ph:caret-left" className="text-[22px]" />
          </button>
        )}

        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-[20px] font-semibold leading-[1.15] tracking-[-0.01em] text-ink sm:text-[22px]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-[3px] truncate text-[12.5px] leading-tight text-muted">
              {subtitle}
            </p>
          )}
        </div>

        {right}

        <button
          onClick={cycle}
          aria-label={`Tema ${THEME_LABEL[theme]}. Klik untuk berganti.`}
          title={`Tema: ${THEME_LABEL[theme]}`}
          className="k-icon-round -mr-1 grid h-9 w-9 shrink-0 place-items-center rounded-full
            text-muted transition-colors duration-150
            hover:bg-ink/[0.07] hover:text-ink active:scale-95"
        >
          <AppIcon icon={THEME_ICON[theme]} className="text-[19px]" />
        </button>
      </div>
    </header>
  );
}
