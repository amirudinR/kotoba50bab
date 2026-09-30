/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f5efe0",
        "paper-dark": "#e8dfc9",
        ink: "#2b4c7e",
        "ink-soft": "#4a6fa5",
        margin: "#c0392b",
        pencil: "#6b6456",
        highlight: "#f7d774",
        "note-yellow": "#fff3b0",
        "note-green": "#d4e8c4",
        "note-pink": "#f8d7da",
        "note-blue": "#cfe2f3",
      },
      fontFamily: {
        hand: ['"Caveat"', "cursive"],
        body: ['"Nunito"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        paper: "0 1px 2px rgba(0,0,0,0.08), 0 6px 16px rgba(0,0,0,0.08)",
        note: "2px 3px 10px rgba(0,0,0,0.15)",
        card: "0 10px 30px rgba(0,0,0,0.15)",
      },
    },
  },
  plugins: [],
};
