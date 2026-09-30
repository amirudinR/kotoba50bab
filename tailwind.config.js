/** @type {import('tailwindcss').Config} */

// Semua warna dan font melewati CSS variable supaya dark mode
// cukup lewat kelas `dark` di <html> — bukan duplikasi token.
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Memakai `rgb(var(--x) / <alpha-value>)` agar opacity modifier Tailwind
        // (bg-ink/10, text-margin/60) tetap berfungsi pada mode gelap.
        bg: "rgb(var(--c-bg) / <alpha-value>)",
        surface: "rgb(var(--c-surface) / <alpha-value>)",
        raised: "rgb(var(--c-raised) / <alpha-value>)",
        sunken: "rgb(var(--c-sunken) / <alpha-value>)",
        ink: "rgb(var(--c-ink) / <alpha-value>)",
        "ink-soft": "rgb(var(--c-ink-soft) / <alpha-value>)",
        body: "rgb(var(--c-body) / <alpha-value>)",
        muted: "rgb(var(--c-muted) / <alpha-value>)",
        line: "rgb(var(--c-line) / <alpha-value>)",
        accent: "rgb(var(--c-accent) / <alpha-value>)",
        "accent-soft": "rgb(var(--c-accent-soft) / <alpha-value>)",
        seal: "rgb(var(--c-seal) / <alpha-value>)",
        success: "rgb(var(--c-success) / <alpha-value>)",
        "success-soft": "rgb(var(--c-success-soft) / <alpha-value>)",
        danger: "rgb(var(--c-danger) / <alpha-value>)",
        "danger-soft": "rgb(var(--c-danger-soft) / <alpha-value>)",
        warn: "rgb(var(--c-warn) / <alpha-value>)",
      },
      fontFamily: {
        // Display: mincho Jepang —-serif klasik dari mesin cetak Kyoto.
        display: ['"Shippori Mincho"', "Yu Mincho", "Hiragino Mincho ProN", "serif"],
        // Body: grotesque modern, netral tapi tegas.
        sans: ['"Manrope"', "system-ui", "sans-serif"],
        // Data/label kecil: monospace agar angka & nomor bab rapi.
        mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
      },
      borderRadius: {
        card: "1rem",
        pill: "999px",
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        lift: "var(--shadow-lift)",
        deep: "var(--shadow-deep)",
        seal: "0 2px 10px rgb(var(--c-seal) / 0.28)",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      keyframes: {
        "stamp-in": {
          "0%": { transform: "scale(1.9) rotate(-18deg)", opacity: "0" },
          "60%": { transform: "scale(0.94) rotate(3deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(-4deg)", opacity: "1" },
        },
        "fade-rise": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "ink-spread": {
          "0%": { opacity: "0", transform: "scale(0.8)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "draw-line": {
          from: { transform: "scaleX(0)" },
          to: { transform: "scaleX(1)" },
        },
      },
      animation: {
        "stamp-in": "stamp-in 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        "fade-rise": "fade-rise 0.4s ease both",
        "ink-spread": "ink-spread 0.5s ease both",
        "draw-line": "draw-line 0.6s ease both",
      },
    },
  },
  plugins: [],
};
