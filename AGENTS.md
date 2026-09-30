# AGENTS.md

Aplikasi hafalan kosakata Jepang **Kotoba** — kumpulan 2.910 kata dari *Minna no Nihongo* bab 1–50, ekstraksi otomatis dari satu file PDF. Tujuannya dipakai pelajar/pemula yang sedang belajar bahasa Jepang: memilih bab mana saja yang mau dilatih, lalu menghafal lewat flashcard, kuis pilihan ganda, kuis ketik, atau mencari kata.

Visualnya memakai estetika buku catatan Jepang dengan **dua mode**: **washi** (kertas hangat + tinta biru) untuk light, dan **sumi** (tinta hitam pekat + teks krem) untuk dark. Tipografi berbasis **Shippori Mincho** (mincho Jepang) untuk kanji/kana dan judul, **Manrope** untuk body, dan **IBM Plex Mono** untuk label serta angka. Elemen signature-nya adalah **HankoSeal** — cap merah ala stempel tinta (朱肉) yang menandai kata yang sudah dikuasai. Progres hafalan dan statistik kuis disimpan **di perangkat masing-masing** (`localStorage`), jadi aplikasi ini sepenuhnya statis: tidak ada backend, tidak ada akun, tidak ada database. Dokumen ini adalah panduan untuk AI agent (atau developer) yang akan mengerjakan perubahan di proyek ini.

## Ringkasan Proyek

| Item | Nilai |
| --- | --- |
| Nama paket | `kotoba-app` (private, `version` 1.0.0) |
| Fungsi | Hafalan kosakata Minna no Nihongo bab 1–50 |
| Target deploy | Static site di Vercel (framework preset Vite, output `dist/`) |
| Repository git | `https://github.com/amirudinR/kotoba50bab.git` (remote `origin`, branch aktif `main`, 1 commit: `9b99f3d`) |
| Bahasa UI | Indonesia (beberapa label/heading Jepang) |
| Root folder kerja | `D:\LPK\Kotoba N5danN4\kotoba-app` |
| Data sumber | `../kotoba minna no nihonggo bab 1-50-1.pdf` (folder induk, ±5,0 MB) |
| Lisensi | tidak ditemukan di repo |

## Tech Stack

Versi diambil persis dari `package.json` (caret range) dan hasil `npm ls` (versi terpasang):

| Teknologi | `package.json` | Terpasang | Gunanya |
| --- | --- | --- | --- |
| react | `^18.3.1` | 18.3.1 | UI library |
| react-dom | `^18.3.1` | 18.3.1 | Mount React ke DOM |
| zustand | `^5.0.1` | 5.0.15 | Store global + routing + persistensi `localStorage` |
| @iconify/react | `^6.0.2` | 6.0.2 | Komponen `<Icon>` untuk semua ikon aplikasi |
| @iconify-json/ph | `^1.2.2` | 1.2.2 | Data ikon collection Phosphor, **di-bundle lokal** (bisa offline) |
| framer-motion | `^11.11.17` | 11.18.2 | **Dependensi tapi TIDAK dipakai** — `rg "framer-motion" src/` mengembalikan tidak ada match. Semua animasi murni CSS (keyframes Tailwind + `@layer utilities`) |
| vite | `^6.0.3` | 6.4.3 | Dev server + bundler |
| @vitejs/plugin-react | `^4.3.4` | 4.7.0 | Fast refresh / transform JSX |
| vite-plugin-pwa | `^0.21.1` | 0.21.2 | Manifest + service worker (mode `generateSW`) |
| typescript | `^5.6.3` | 5.9.3 | Typing + type-check saat build |
| tailwindcss | `^3.4.15` | 3.4.19 | Utility CSS + token warna/font/shadow/animasi kustom |
| postcss | `^8.4.49` | 8.5.28 | Pipeline CSS |
| autoprefixer | `^10.4.20` | 10.6.1 | Vendor prefix |
| @types/react / @types/react-dom | `^18.3.12` / `^18.3.1` | 18.3.31 / 18.3.7 | Typing React |

Python (di luar `package.json`) dipakai untuk tooling: **PyMuPDF** (`fitz`) untuk ekstraksi PDF dan **Pillow** untuk membuat ikon PWA.

Tidak ada `react-router`, tidak ada library state selain zustand, tidak ada test runner, tidak ada linter.

## Cara Menjalankan

```bash
# dari folder D:\LPK\Kotoba N5danN4\kotoba-app
npm install        # pasang dependency sesuai package-lock.json
npm run dev        # dev server Vite (localhost:5173, otomatis pindah port bila dipakai)
npm run build      # tsc -b lalu vite build -> output dist/
npm run preview    # serve hasil build dari dist/
```

Catatan:

- Hanya ada tiga script: `dev`, `build`, `preview`. **Tidak ada** script `test`, `lint`, atau `typecheck` — verifikasi memakai `npm run build` saja (lihat Gotcha).
- Output build di **`dist/`** dan itu juga output produksi untuk Vercel. Hasil build terakhir: `index.html` (2,23 kB), `assets/index-*.css` (31,56 kB / 6,46 kB gzip), `assets/index-*.js` (427,56 kB / 124,25 kB gzip), plus `manifest.webmanifest`, `sw.js`, `registerSW.js`, `workbox-*.js`. PWA precache 9 entri (±450 KiB).
- `base: "./"` di `vite.config.ts` membuat semua path aset relatif, jadi `dist/` bisa dipublish dari path mana pun tanpa rewrite base.
- Kalau menjalankan perintah shell dari agent, **jangan pakai `cd`**; set working directory ke folder app.
- Ada `dev.log`, `dev.err.log`, `dev2.log`, dan `dev.pid` di root — artefak sesi dev sebelumnya, bukan bagian dari script resmi. Semuanya sudah tercakup `.gitignore` (`*.log`, `dev.pid`).

## Regenerasi Data Kosakata

Sumber kebenaran data adalah PDF di **folder induk**: `D:\LPK\Kotoba N5danN4\kotoba minna no nihonggo bab 1-50-1.pdf`.

Skrip ekstraksi ada di **dua tempat dengan isi identik** (hash SHA-256 sama):

- `D:\LPK\Kotoba N5danN4\kotoba-app\tools\extract_pdf.py` (di dalam app)
- `D:\LPK\Kotoba N5danN4\tools\extract_pdf.py` (folder induk)

Skrip butuh PyMuPDF dan menerima dua argumen opsional: path PDF dan path output, default-nya `kotoba minna no nihonggo bab 1-50-1.pdf` dan `src/data/kotoba.json`.

```bash
# dari folder app (memakai skrip di dalam app)
python tools/extract_pdf.py "../kotoba minna no nihonggo bab 1-50-1.pdf" "src/data/kotoba.json"
```

Output: JSON `{ "babs": [ { "bab": 1, "items": [ { "no", "kana", "kanji", "arti" } ] } ] }`, ditulis dengan `ensure_ascii=False, indent=2`. Ukuran saat ini **426.483 byte (±416 KiB)** dan ikut ter-bundle ke JS (lihat Gotcha).

### Gotcha teknis ekstraksi (sudah pernah ketemu, jangan diulang)

Struktur PDF: tiap bab punya tabel dengan kolom `番号 | 日本語 | 漢字 | インドネシア語`. Teks diekstrak **per baris**, jadi tabel harus diparse dengan **state machine**, bukan regex per entri.

- **Nomor halaman harus dibuang.** Angka halaman muncul sebagai baris angka tunggal di dekat footer `By: Agus Hinji`. Kalau tidak dibuang, angka itu dibaca state machine sebagai nomor entri dan **seluruh entri setelahnya bergeser**. Solusinya di kode: `extract_lines` mencari indeks baris footer lalu membuang baris pada offset `-2..+2` yang isinya sama dengan nomor halaman. Pola footer: `FOOTER_RE = ^By:\s*Agus\s*Hinji` (case-insensitive).
- **Jangan hapus kata `番号` / `日本語` / `漢字` / `インドネシア語` secara global.** Kata-kata itu bisa jadi header tabel **dan** kanji kosakata yang sah. Hapus HANYA sebagai rangkaian 4 baris berurutan lewat `strip_header_rows` dengan konstanta `HEADER_SEQ = ("番号", "日本語", "漢字", "インドネシア語")`.
- **Label `BAB N` tidak boleh terparse sebagai kana.** Pola `BAB_RE = ^BAB\s+(\d+)\s*$`. Saat membaca kana maupun kanji, baris yang cocok `BAB_RE` harus dilewati.
- **Arti boleh terpecah multi-baris dan harus digabung** sampai ketemu baris angka berikutnya atau `BAB N`, lalu whitespace-nya dirapikan (`arti_parts` → join → `re.sub(r"\s+", " ", ...)`).
- **Satu bab bisa melebihi satu halaman, dan satu halaman bisa memuat dua bab.** Jangan mengasumsikan 1 bab = 1 halaman atau memproses per halaman sebagai unit bab.
- **Baris kosong itu bermakna**: kana yang kosong berarti entri punya kanji kosong. `is_noise` sengaja `return False` untuk baris kosong supaya penandanya tidak hilang.
- Entri tanpa kana dibuang saat `flush_bab()` (`filter(it.get("kana"))`).
- `is_noise` juga membuang baris `みんなのにほんご`, `だい１か`, `だい50か`.

### Gejala bug yang pernah muncul

- Hanya **29 dari 50 bab** terbaca → biasanya `strip_header_rows` terlalu agresif sehingga state machine kehilangan penanda `BAB`.
- `no` tidak sama dengan jumlah entri per bab → indikasi nomor halaman tidak terbuang, atau nomor entri bergeser.

Skrip sudah mencetak ringkasan sendiri (`Total bab`, `Total kosakata`, `PERINGATAN bab hilang`). Validasi tambahan:

```bash
python -c "import json; d=json.load(open('src/data/kotoba.json',encoding='utf-8')); b=d['babs']; print('bab:',len(b),'total:',sum(len(x['items']) for x in b)); bad=[(x['bab'],max(i['no'] for i in x['items'])) for x in b if x['items'] and max(i['no'] for i in x['items'])!=len(x['items'])]; print('mismatch:', bad if bad else 'tidak ada')"
```

Nilai yang terverifikasi saat ini: **bab: 50, total: 2910, mismatch: tidak ada**.

### Ikon PWA

`scripts/gen_icons.py` (Pillow, di dalam folder app) menggambar ulang `public/favicon.svg`, `public/icon-192.png`, `public/icon-512.png`, dan `public/icon-512-maskable.png` — kartu biru tinta dengan kanji `言` digambar dari primitif vektor (bukan font) plus garis merah. **Tidak ada dependensi font CJK.** Varian maskable memakai `MASKABLE_SCALE = 0.68` supaya muat di safe circle 80% milik Android.

```bash
python scripts/gen_icons.py
```

## Struktur Proyek

```
kotoba-app/
├─ index.html                 # shell, Google Fonts (Shippori Mincho/Manrope/IBM Plex Mono),
│                             # meta theme-color light+dark, script anti-flash tema
├─ package.json               # 3 script: dev / build / preview
├─ tsconfig.json              # strict + noUnusedLocals + noUnusedParameters + resolveJsonModule
├─ vite.config.ts             # base "./" + VitePWA (registerType autoUpdate)
├─ tailwind.config.js         # darkMode "class", token warna via CSS variable, font, shadow, keyframes
├─ postcss.config.js          # tailwindcss + autoprefixer
├─ vercel.json                # rewrite SPA ke /index.html
├─ .gitignore                 # node_modules, dist, *.log, dev.pid, *.tsbuildinfo
├─ public/
│  ├─ favicon.svg
│  ├─ icon-192.png
│  ├─ icon-512.png
│  └─ icon-512-maskable.png
├─ scripts/
│  └─ gen_icons.py            # generator ikon PWA (Pillow, vektor murni)
├─ tools/
│  └─ extract_pdf.py          # skrip ekstraksi PDF -> src/data/kotoba.json (duplikat di folder induk)
├─ src/
│  ├─ main.tsx                # initTheme() lalu mount React StrictMode ke #root
│  ├─ App.tsx                 # router berbasis switch (state), guard selectedBabs kosong
│  ├─ index.css               # CSS variables light/dark, base, components (k-*), utilities, reduced-motion
│  ├─ types.ts                # Kotoba, Bab, KotobaWithBab
│  ├─ data/
│  │  ├─ kotoba.json          # 50 bab / 2.910 entri (426.483 byte) — hasil ekstraksi PDF
│  │  └─ index.ts             # BABS, ALL_KOTOBA, TOTAL_KOTOBA, getBab, getKotobaByBabs
│  ├─ lib/
│  │  └─ utils.ts             # shuffleArray, sampleN, normalize, artiVariants, isAnswerCorrect
│  ├─ store/
│  │  ├─ app.ts               # route + go() (TIDAK persist)
│  │  ├─ settings.ts          # selectedBabs, shuffle, viewMode (persist)
│  │  ├─ progress.ts          # hafal, stats (persist) + kataKey()
│  │  └─ theme.ts             # theme light/dark/system + applyTheme + initTheme (persist)
│  ├─ components/
│  │  ├─ Button.tsx           # variant ink|seal|ghost|quiet|accent, size sm|md|lg, icon/iconRight
│  │  ├─ PaperCard.tsx        # pembungkus k-card/k-card-raised, props raised|tape|tilt|onClick
│  │  ├─ ProgressBar.tsx      # progressbar ARIA, tone ink|accent|seal|success|danger|warn
│  │  ├─ TopBar.tsx           # header sticky + tombol kembali + tombol siklus tema
│  │  ├─ Icon.tsx             # wrapper @iconify/react + tipe IconName = `ph:${string}`
│  │  └─ HankoSeal.tsx        # cap merah Jepang (CSS shape), size sm|md|lg, prop stamp
│  └─ pages/
│     ├─ Home.tsx             # hero sampul buku, statistik, 5 mode, toggle acak, grid bab 1–50
│     ├─ Flashcard.tsx        # kartu balik 3D, ProgressBar hafalan, tombol hafal
│     ├─ QuizPG.tsx           # kuis pilihan ganda (4 opsi, A–D)
│     ├─ QuizKetik.tsx        # kuis ketik jawaban (<form onSubmit>)
│     ├─ Search.tsx           # cari kana/kanji/arti, maks 120 hasil
│     └─ Progress.tsx         # statistik + hafalan per bab + reset progres
├─ dist/                      # output build (jangan di-commit)
└─ dev.log / dev.err.log / dev2.log / dev.pid   # artefak dev, di-gitignore
```

## Arsitektur

### Routing — tanpa react-router

Aplikasi **tidak memakai** `react-router`. Navigasi sepenuhnya lewat Zustand: `useApp` menyimpan field `route` bertipe `Route`, dan `App.tsx` melakukan `switch (route)` untuk me-render halaman. Perpindahan halaman dipicu `go(route)`, yang sekaligus melakukan `window.scrollTo({ top: 0 })`.

| Nilai route | Komponen |
| --- | --- |
| `"home"` | `Home` (default) |
| `"flashcard"` | `Flashcard` |
| `"quiz-pg"` | `QuizPG` |
| `"quiz-ketik"` | `QuizKetik` |
| `"search"` | `Search` |
| `"progress"` | `Progress` |

Konsekuensi untuk agent: menambah halaman = tambah union type di `store/app.ts`, tambah komponen di `src/pages/`, tambah `case` di `App.tsx`. Tidak ada URL, tidak ada history, tidak ada deep-link. `App.tsx` juga memvalidasi: kalau masuk `flashcard` / `quiz-pg` / `quiz-ketik` sementara `selectedBabs` kosong, otomatis balik ke `home` (array `needsBabs`).

### State & persistensi

Empat store Zustand, tiga di antaranya memakai middleware `persist` yang menulis ke `localStorage`:

| Store | File | Dipersist? | Nama key `localStorage` | Isi |
| --- | --- | --- | --- | --- |
| `useApp` | `store/app.ts` | Tidak | — (tidak ada key) | `route`, `go()` |
| `useSettings` | `store/settings.ts` | Ya | **`kotoba-settings`** | `selectedBabs: number[]` (default `[1]`), `shuffle: boolean` (default `true`), `viewMode: "kana-arti" \| "arti-kana"` (default `"kana-arti"`) + aksi `setSelectedBabs`, `toggleBab`, `selectAll` (1–50), `clearBabs`, `setShuffle`, `setViewMode` |
| `useProgress` | `store/progress.ts` | Ya | **`kotoba-progress`** | `hafal: string[]` (daftar key kata yang ditandai hafal) dan `stats: Record<string, QuizStat>` di mana `QuizStat = { benar: number; salah: number }` + aksi `toggleHafal`, `isHafal`, `recordAnswer`, `resetProgress` |
| `useTheme` | `store/theme.ts` | Ya | **`kotoba-theme`** | `theme: "light" \| "dark" \| "system"` (default `"system"`), `resolved: "light" \| "dark"` + aksi `setTheme`, `cycle`, `syncFromSystem` |

Tiga key itu (`kotoba-settings`, `kotoba-progress`, `kotoba-theme`) adalah satu-satunya key `localStorage` yang dipakai aplikasi.

`hafal` disimpan sebagai array of string, bukan `Set`, supaya bisa di-serialize JSON. Kunci unik tiap kata dibuat oleh helper `kataKey(bab, no)` → `` `${bab}-${no}` `` (format `"1-3"`). Pola ini dipakai ulang sebagai `key` React di Search, QuizPG, dan QuizKetik — konsisten dengan `kataKey`, tapi di beberapa tempat ditulis langsung sebagai template literal.

### Tema & Dark Mode

Mechanismenya **class strategy**, bukan `prefers-color-scheme` murni:

1. **Tailwind** diset `darkMode: "class"` di `tailwind.config.js`.
2. **Semua warna** didefinisikan sebagai CSS variable RGB-space di `src/index.css`, dua blok: `:root` (light/washi) dan `.dark` (sumi). Config Tailwind hanya bridging: `ink: "rgb(var(--c-ink) / <alpha-value>)"` — pola `<alpha-value>` itu yang membuat modifier opacity (`bg-ink/10`, `text-seal/60`) tetap jalan di kedua mode.
3. **Class `dark`** ditambahkan/di.remove pada elemen `<html>` oleh `applyTheme()` di `src/store/theme.ts`.
4. **Anti-flash**: `index.html` punya IIFE inline sebelum React mount yang membaca `localStorage["kotoba-theme"]` (`JSON.parse(raw).state.theme`, default `"system"`), mencocokkan `prefers-color-scheme`, lalu `document.documentElement.classList.add("dark")`. Ada juga inline `<style>` yang menyamakan `background` `html`/`html.dark` dengan `--c-bg`/`#121419` supaya tidak ada kilatan putih.
5. **`initTheme()`** dipanggil sekali di `src/main.tsx` sebelum `createRoot`. Fungsi ini memanggil `applyTheme(resolve(theme))` dan memasang listener `matchMedia("(prefers-color-scheme: dark)").addEventListener("change", ...)` → `syncFromSystem()` (hanya bereaksi kalau `theme === "system"`).
6. **Siklus tombol** di `TopBar.tsx`: `CYCLE = ["light", "dark", "system"]`, ikon per mode `ph:sun` / `ph:moon` / `ph:laptop`, label `Terang` / `Gelap` / `Ikuti sistem`. Klik → `cycle()` → `setTheme(next)` → `applyTheme`.
7. **Transisi halus**: `applyTheme()` sempat menaruh class `theme-transition` di `<html>` lalu membuangnya 320 ms kemudian (dikontrol `setTimeout`). Class itu ada di luar `@layer` Tailwind di `index.css` supaya transisi_apply `!important` dan tidak menunda interaksi.
8. **Dark-nativeUA widget**: `html { color-scheme: light }` dan `html.dark { color-scheme: dark }` → scrollbar & form control ikut gelap.

**Cara menambah token warna baru supaya dark-safe (WAJIB ikut):**

1. Tambahkan nama token di `theme.extend.colors` (`tailwind.config.js`) dengan pola `rgb(var(--c-<nama>) / <alpha-value>)`.
2. Tambahkan blok **dua** nilai di `src/index.css`: satu di dalam `:root { ... }` (washi) dan satu di dalam `.dark { ... }` (sumi), sebagai tiga angka RGB **tanpa koma** (contoh `--c-foo: 12 34 56;`).
3. Pakai di JSX sebagai `text-foo`, `bg-foo`, `border-foo/20`, dll.
4. Kalau token itu butuh pasangan "latar lembut", buat juga versi `-soft` seperti `accent-soft` / `success-soft` / `danger-soft`, karena di mode gelap warna solid terang akan menyilaukan.

Jangan pernah menulis hex langsung (mis. `text-[#1b2d4a]` atau `bg-[#fff]`) — warna itu tidak bereaksi ke `.dark` dan merusak light/dark parity.

### Design tokens & font

Token warna semantic di `tailwind.config.js` + `src/index.css` (angka RGB tanpa koma, karena dipakai `rgb(var(--c-x) / <alpha-value>)`):

| Token Tailwind | RGB (washi / light) | Hex light | RGB (sumi / dark) | Hex dark |
| --- | --- | --- | --- | --- |
| `bg` | `244 240 230` | `#F4F0E6` | `18 20 25` | `#121419` |
| `surface` | `252 250 244` | `#FCFAF4` | `27 30 37` | `#1B1E25` |
| `raised` | `255 254 250` | `#FFFEFA` | `34 38 47` | `#22262F` |
| `sunken` | `228 221 204` | `#E4DDCC` | `14 16 20` | `#0E1014` |
| `ink` | `27 45 74` | `#1B2D4A` | `226 232 240` | `#E2E8F0` |
| `ink-soft` | `74 103 140` | `#4A678C` | `150 170 200` | `#96AAC8` |
| `body` | `58 53 44` | `#3A352C` | `214 212 205` | `#D6D4CD` |
| `muted` | `110 102 87` | `#6E6657` | `140 144 154` | `#8C909A` |
| `line` | `27 45 74` | `#1B2D4A` | `226 232 240` | `#E2E8F0` |
| `accent` | `178 106 58` | `#B26A3A` | `224 168 96` | `#E0A860` |
| `accent-soft` | `240 227 205` | `#F0E3CD` | `58 48 34` | `#3A3022` |
| `seal` | `186 63 51` | `#BA3F33` | `200 78 66` | `#C84E42` |
| `success` | `58 112 79` | `#3A704F` | `116 190 140` | `#74BE8C` |
| `success-soft` | `219 235 221` | `#DBEBDD` | `30 52 40` | `#1E3428` |
| `danger` | `178 58 48` | `#B23A30` | `235 110 98` | `#EB6E62` |
| `danger-soft` | `247 222 218` | `#F7DEDA` | `58 30 28` | `#3A1E1C` |
| `warn` | `190 138 20` | `#BE8A14` | `226 182 96` | `#E2B660` |

Variabel pendukung per mode: `--paper-line`, `--paper-line-alpha`, `--grain-alpha`, `--grain-angle`, `--shadow-soft`, `--shadow-lift`, `--shadow-deep`.

Font (3 keluarga, dimuat via Google Fonts di `index.html`):

| Token | Family | Fallback chain | Dipakai untuk |
| --- | --- | --- | --- |
| `font-display` | `"Shippori Mincho"` | `Yu Mincho` → `Hiragino Mincho ProN` → `serif` | Kanji/kana besar, judul, heading, angka display — **WAJIB untuk teks Jepang besar** |
| `font-sans` | `"Manrope"` | `system-ui`, `sans-serif` | Body text, tombol, placeholder (default `body` via `@apply font-sans`) |
| `font-mono` | `"IBM Plex Mono"` | `ui-monospace`, `monospace` | Label kecil, nomor bab, angka tabular |

Bobot yang dimuat: Shippori Mincho 400/500/600/700/800, Manrope 400/500/600/700/800, IBM Plex Mono 400/500/600. Ada `preconnect` ke `fonts.googleapis.com` dan `fonts.gstatic.com`.

Lain-lain dari `tailwind.config.js`: `borderRadius.card = "1rem"`, `borderRadius.pill = "999px"`, `boxShadow` = `soft` / `lift` / `deep` (dari CSS variable) + `seal` (`0 2px 10px rgb(var(--c-seal) / 0.28)`), `transitionTimingFunction.spring = "cubic-bezier(0.34, 1.56, 0.64, 1)"`, dan keyframes `stamp-in`, `fade-rise`, `ink-spread`, `draw-line` dengan animation masing-masing `animate-stamp-in`, `animate-fade-rise`, `animate-ink-spread`, `animate-draw-line`.

### Ikon

Semua ikon lewat `src/components/Icon.tsx` (export default, sering di-import sebagai `AppIcon` atau `Icon`):

```tsx
import { Icon } from "@iconify/react";
export type IconName = `ph:${string}`;
export default function AppIcon({ icon, className, label }: Props) { ... }
```

- **`@iconify/react`** untuk render, **`@iconify-json/ph`** (collection Phosphor) di-bundle lokal sebagai dependency runtime — makanya ikon tetap tampil **tanpa koneksi internet** dan tidak ada request ke API Iconify.
- Format nama ikon: **`ph:<nama>`**. Collection Phosphor di repo ini **tidak punya prefix `ph:` di dalam datanya** — prefix itu penanda collection untuk Iconify. Karena itu `IconName` sengaja dibuat sebagai **template literal type** (`` `ph:${string}` ``) supaya TypeScript tetap autocompletion dan tetap menolak string ikon yang tidak berawalan `ph:`.
- Tipe `IconName` juga sengaja bukan union literal, supaya kolom `icon` pada array data (mis. daftar mode di `Home.tsx`) tidak perlu `as const` di setiap tempat.
- `label` opsional: kalau diisi, ikon dibungkus `<span role="img" aria-label=...>`; kalau tidak, ikon diberi `aria-hidden="true"`.
- Ukuran ikon lewat `className` (`text-lg`, `text-2xl`, `text-[22px]`, ...), bukan prop `width`.

Daftar ikon yang benar-benar dipakai (semua sudah diverifikasi ada di `node_modules/@iconify-json/ph/icons.json`):

| Halaman / komponen | Ikon |
| --- | --- |
| `TopBar` | `ph:caret-left`, `ph:sun`, `ph:moon`, `ph:laptop` |
| `Home` | `ph:cards`, `ph:check-circle`, `ph:keyboard`, `ph:magnifying-glass`, `ph:chart-bar`, `ph:shuffle`, `ph:arrow-right` |
| `Flashcard` | `ph:caret-left`, `ph:caret-right`, `ph:star`, `ph:check-circle`, `ph:arrow-right` |
| `QuizPG` | `ph:check-circle`, `ph:x-circle`, `ph:target`, `ph:arrow-counter-clockwise`, `ph:arrow-right` |
| `QuizKetik` | `ph:keyboard`, `ph:check-circle`, `ph:x-circle`, `ph:arrow-counter-clockwise`, `ph:arrow-right` |
| `Search` | `ph:magnifying-glass`, `ph:x`, `ph:book-open`, `ph:check` |
| `Progress` | `ph:target`, `ph:notebook`, `ph:seal-check`, `ph:trash` |

### Data & Logika kuis

`src/data/index.ts` melakukan `import raw from "./kotoba.json"` lalu `const data = raw as { babs: Bab[] }` (`resolveJsonModule: true` di `tsconfig.json` yang membuatnya bekerja). Yang di-export:

- `BABS: Bab[]` — array bab apa adanya (Home untuk grid pilihan bab, Progress untuk bar per bab, App untuk `allPool`).
- `ALL_KOTOBA: KotobaWithBab[]` — semua entri digabung datar dengan info bab, hasil `BABS.flatMap`. Dipakai Search untuk mencari lintas seluruh bank kata.
- `TOTAL_KOTOBA: number` — `ALL_KOTOBA.length`, dipakai Home dan Progress.
- `getBab(bab: number): Bab | undefined` — cari satu bab. (Saat ini tidak dipanggil dari mana pun di `src/`.)
- `getKotobaByBabs(babList: number[]): KotobaWithBab[]` — filter `ALL_KOTOBA` berdasarkan himpunan bab terpilih; inilah yang jadi `pool` di `App.tsx`.

Tipe `KotobaWithBab extends Kotoba { bab: number }` ada karena model data asli tidak menyimpan asal kata. Semua mode latihan bekerja pada **gabungan beberapa bab**, jadi setiap entri harus membawa `bab`-nya sendiri agar UI bisa menampilkan "bab 12" dan agar progres tetap unik per kata.

`src/lib/utils.ts`:

| Fungsi | Perilaku | Dipakai di |
| --- | --- | --- |
| `shuffleArray<T>(arr)` | Fisher-Yates, mengembalikan array **baru** (tidak memutasi input) | `Flashcard` (acak deck), `QuizPG` (acak opsi & sumber pengecoh) |
| `sampleN<T>(arr, n)` | `shuffleArray(arr).slice(0, n)` | `QuizPG` & `QuizKetik` (pilih soal) |
| `normalize(s)` | lowercase, buang tanda baca CJK & latin (`。、．，,.\s～〜~()（）【】\[\]"'` + backtick + `!?！？:：;；…`), trim | `Search` (pencarian), `QuizPG` (perbandingan jawaban), internal `isAnswerCorrect` |
| `artiVariants(arti)` | pecah arti jadi daftar alternatif dengan split `/[,，/;；、]\|\.\s\|\s{2,}/`, buang yang kosong | dipakai `isAnswerCorrect` di mode `kana-arti` |
| `isAnswerCorrect(userInput, target: KotobaWithBab, mode)` | mode `kana-arti`: cocokkan input ke salah satu varian arti (sama persis **atau** substring dua arah); mode `arti-kana`: cocokkan persis ke kana atau kanji | `QuizKetik` |

Catatan perilaku `isAnswerCorrect` yang mungkin dianggap "aneh" tapi disengaja: pencocokan memakai `includes` dua arah, jadi mengetik sebagian kata (mis. "saya" untuk "saya/kami") tetap dianggap benar. Signature-nya menerima **objek entri**, bukan string target.

Kedua mode kuis punya `const QUIZ_LEN = 10` dan membangun daftar soal di dalam `useMemo` yang bergantung pada `pool, shuffle, viewMode`; daftar soal di-reset (index, skor, salah) setiap kali `questions` berubah. `QuizPG` punya `LETTERS = ["A", "B", "C", "D"]` untuk badge opsi.

### PWA

`VitePWA` dari `vite-plugin-pwa` di `vite.config.ts`:

- `registerType: "autoUpdate"` — service worker mengambil versi baru otomatis, tanpa prompt.
- `includeAssets: ["favicon.svg"]`.
- `manifest` inline di config (bukan file terpisah): `name: "Kotoba - Hafalan Minna no Nihongo"`, `short_name: "Kotoba"`, `display: "standalone"`, `orientation: "portrait"`, `theme_color: #2b4c7e`, `background_color: #f5efe0`, ikon `icon-192.png`, `icon-512.png`, dan `icon-512-maskable.png` (`purpose: "maskable"`). **Catatan: warna manifest ini masih palet lama, belum diselaraskan dengan CSS variable light/dark.**
- Build menghasilkan `dist/sw.js` + `dist/workbox-*.js` dengan 9 entri precache (±450,67 KiB). `index.html` tidak mengimpor `virtual:pwa-register` secara manual; registrasi ditangani `registerType: "autoUpdate"`.

## Fitur

- **Home** (`pages/Home.tsx`) — Hero bergaya sampul buku (`PaperCard` + `tape` + `k-margin`, kanji `言葉` besar + `HankoSeal` `言` size `lg` dengan animasi stamp), bar statistik Kosakata/Bab/Dihafal, 2 `ModeCard` besar (Flashcard, Kuis Pilihan Ganda) + 3 `ModeRow` (Kuis Ketik, Cari, Progres), toggle "Urutan acak", grid pilihan bab 1–50 (dengan Semua/Kosongkan), dan progress hafalan untuk bab terpilih. Ikon: `ph:cards`, `ph:check-circle`, `ph:keyboard`, `ph:magnifying-glass`, `ph:chart-bar`, `ph:shuffle`, `ph:arrow-right`.
- **Flashcard** — Satu kartu besar yang bisa dibalik (tap atau Space/Enter, `role="button"` + `tabIndex=0`), tinggi `clamp(280px, 52vh, 420px)`, arah kartu mengikuti `viewMode` (`Kana → Arti` / `Arti → Kana`), kanji sebagai sub-teks, badge posisi `Kartu i / n`, progress hafalan deck, tombol `caret-left`/`caret-right`, dan tombol hafal (ikon `ph:check-circle` saat sudah hafal, `ph:star` saat belum + `HankoSeal` kecil di pojok kartu). Deck di-reset ke kartu pertama tiap `pool`/`shuffle` berubah. Empty state memakai `HankoSeal` `空`.
- **QuizPG** (kuis pilihan ganda) — 10 soal, 4 opsi berlabel A–D; 3 pengecoh diambil dari seluruh bank kata (`allPool`, bukan cuma `pool`) supaya lebih beragam, opsi diacak, dan koreksi memakai `normalize`. Opsi benar/salah diberi tone `success`/`danger` + ikon `ph:check-circle`/`ph:x-circle` dan animasi `animate-stamp-in`; ada panel feedback `role="status" aria-live="polite"`. Jawaban benar otomatis menandai kata sebagai hafal. Di akhir tampil skor (dengan `HankoSeal` `満` kalau sempurna) + daftar "Perlu diulang". Ikon: `ph:target`, `ph:arrow-counter-clockwise`, `ph:arrow-right`, `ph:check-circle`, `ph:x-circle`.
- **QuizKetik** — 10 soal, user mengetik jawaban; input `font-display text-2xl` di dalam `k-card-raised` dengan ikon `ph:keyboard`, autofocus tiap soal (`inputRef` + `useEffect`), submit via `<form onSubmit>`/Enter (bukan onClick), `spellCheck={false}` + `autoComplete/Correct/Capitalize="off"`. Menampilkan "kamu tulis" vs "jawaban benar" saat salah. Di akhir juga skor + daftar "Perlu diulang" dengan `HankoSeal` `満` kalau sempurna. Ikon: `ph:keyboard`, `ph:check-circle`, `ph:x-circle`, `ph:arrow-counter-clockwise`, `ph:arrow-right`.
- **Search** (`pages/Search.tsx`, judul TopBar "Cari Kosakata") — Pencarian live di `ALL_KOTOBA` (kana, kanji, atau arti Indonesia) setelah di-normalize, maksimum 120 hasil (`MAX_HASIL`), input sticky dengan ikon `ph:magnifying-glass` dan tombol hapus `ph:x`, badge `BAB 07` (pad 2 digit, font-mono), dan tombol hafal per hasil (`HankoSeal` `済` size `sm` kalau sudah hafal, `ph:check` kalau belum). Empty state `ことばをさがす` + chip contoh; no-result `見つかりません`. Ikon juga `ph:book-open`.
- **Progress** — Ringkasan total (jumlah hafal / `TOTAL_KOTOBA`, benar, salah, akurasi), progress bar hafalan dengan `tone="ink"`, progress bar akurasi kuis (`tone` success/accent/seal tergantung ambang 80/50%), bar per bab 1–50 dengan `HankoSeal`/ikon `ph:seal-check` untuk bab tuntas, hitungan "N bab tuntas", empty state `ph:notebook`, dan tombol reset progres dengan konfirmasi dua langkah (ikon `ph:trash`, konfirmasi `variant="seal"`). Ringkasan diberi `HankoSeal` `記` kalau ada hafalan.

## Sistem Desain

### Dua mode: washi & sumi

- **Light "washi"** — kertas hangat `#F4F0E6`, tinta indigo `#1B2D4A`, aksen kinari/amber `#B26A3A`, stempel merah shu `#BA3F33`.
- **Dark "sumi"** — tinta pekat `#121419`, permukaan `#1B1E25`–`#22262F`, teks krem `#E2E8F0`, aksen jadi amber terang `#E0A860`, stempel jadi `#C84E42`.
- Transisi antar mode halus lewat class `theme-transition` (0,25 s) yang dilepas otomatis setelah 320 ms.

### HankoSeal sebagai signature element

`src/components/HankoSeal.tsx` menggambar cap/hanko merah secara **CSS shape** (bukan glyph font): kotak `rounded-[28%]` `bg-seal text-white` + cincin dalam `border border-white/45` + `shadow-seal`, berisi karakter ber-`font-display`. Prop: `mark` (default `言`), `size` (`sm` `h-7 w-7`, `md` `h-12 w-12`, `lg` `h-20 w-20`), `stamp` (animasi `animate-stamp-in`), `className`, `children` (override isi). Karakter yang dipakai: `言` (hero Home & default), `空` (empty state mode latihan), `満` (skor sempurna), `済` (sudah hafal di Search), `記` (ringkasan Progress).

### Estetika & utilitas kustom

- `body` punya background `rgb(var(--c-bg))` + `linear-gradient` garis buku tulis tiap 32px (`--paper-line` dengan `--paper-line-alpha`) + `repeating-linear-gradient` serat 45° (`--grain-angle`, `--grain-alpha`), `background-attachment: fixed`, `overscroll-behavior-y: none`, `-webkit-tap-highlight-color: transparent`, dan `transition` background/color 0,3 s.
- `@layer components` (`src/index.css`):
  - `.k-card` — `relative rounded-card border bg-surface`, border `rgb(var(--c-line) / 0.1)`, `box-shadow: var(--shadow-soft)`.
  - `.k-card-raised` — `@apply k-card` + `var(--shadow-lift)`; dipakai untuk elemen fokus/hover.
  - `.k-margin` — `position: relative` + `::before` garis merah 1,5px di `left: 1.75rem` dengan warna `rgb(var(--c-seal) / 0.4)` (margin merah buku tulis).
  - `.k-eyebrow` — label kecil: `font-mono text-[11px] uppercase tracking-[0.16em] text-muted`.
  - `.k-num` — `font-variant-numeric: tabular-nums` supaya angka tidak bergeser.
  - `.k-underline` — sapuan stabilo linear-gradient 68%–92% dengan `rgb(var(--c-accent) / 0.42)`.
- `@layer utilities`:
  - Flip card 3D: `.flip-perspective` (perspective 1600px), `.flip-inner` (`preserve-3d`, transisi 0,6 s, `.flipped` → `rotateY(180deg)`), `.flip-face` (`backface-visibility: hidden`), `.flip-back` (`rotateY(180deg)`).
  - `.writing-vertical` (`writing-mode: vertical-rl`, `text-orientation: upright`) — sudah disiapkan tapi **belum dipakai di mana pun** di `src/`.
  - `.scroll-slim` — scrollbar tipis 8px dengan thumb `rgb(var(--c-ink) / 0.22)`.
- `@layer base`: `:focus-visible` memberi `outline: 2px solid rgb(var(--c-accent))` dengan `outline-offset: 2px`; `::selection` memakai `rgb(var(--c-accent) / 0.28)`.
- `@media (prefers-reduced-motion: reduce)` mematikan semua animasi/transisi (`0.01ms`, `iteration-count: 1`) dan secara eksplisit men-disable transisi `.flip-inner`.
- `PaperCard` mendukung `raised`, `tape` (selotip accent di atas kartu), `tilt` (derajat rotasi inline style), dan `onClick` (menjadikan seluruh kartu elemen `<button type="button">`).

### PENTING untuk agent yang edit JSX

- **Jangan hardcode warna.** Selalu pakai token semantic (`bg-surface`, `text-ink`, `bg-seal/10`, `text-success-soft`, `border-line/20`). Warna literal `text-[#...]`/`bg-[#...]` **tidak bereaksi ke `.dark`** dan merusak light/dark parity.
- **Kelas dengan warna/font/shadow kustom tidak dikenali Tailwind IntelliSense** karena warnanya bukan palet default. Ini normal dan disengaja. **Jangan "memperbaiki"** `bg-surface` menjadi `bg-white`, `text-ink` menjadi `text-blue-900`, dan sejenisnya.
- **Utilitas CSS kustom bukan Tailwind dan tidak boleh ditulis ulang sebagai Tailwind:** `k-card`, `k-card-raised`, `k-margin`, `k-eyebrow`, `k-num`, `k-underline`, `flip-perspective`, `flip-inner`, `flip-face`, `flip-back`, `writing-vertical`, `scroll-slim`, `theme-transition`. Kalau butuh variasi, tambah properti CSS-nya di `src/index.css`, jangan ganti ke kelas Tailwind seadanya.
- **Angka besar (kanji/kana) WAJIB `font-display`.** Memakai `font-sans` untuk teks Jepang besar menghilangkan identitas mincho dan membuat desain kehilangan unsur Jepang.
- Class `.animate-ink-spread` dan `.animate-draw-line` sudah didefinisikan tapi belum dipakai — aman dibiarkan.

## Deployment (Vercel)

`vercel.json` hanya berisi rewrite SPA:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Rewrite ini penting karena aplikasi tidak punya routing berbasis path — semua halaman di-render dari satu `index.html`.

Output build = **`dist/`**. Framework preset Vercel untuk Vite sudah mengenali ini, jadi `dist/` tidak perlu disebut manual di dashboard.

Deploy manual lewat Vercel CLI:

```bash
npm install -g vercel      # sekali saja
vercel                    # preview deployment  (jalankan dari folder app)
vercel --prod             # production
```

Lewat git: remote `origin` sudah diarahkan ke `https://github.com/amirudinR/kotoba50bab.git`. Hubungkan project di dashboard Vercel ke remote itu — Vercel akan auto-build pada setiap push ke `main`. Pastikan `node_modules` dan `dist` tidak ikut ter-commit (`.gitignore` sudah menutup keduanya) dan build command default Vercel (`npm run build`) sudah benar.

**Perkara data yang perlu diingat saat menambah fitur:** karena seluruh progres hanya di `localStorage` (`kotoba-progress`, `kotoba-settings`, `kotoba-theme`), progres bersifat **per-browser/per-device**. Tidak ada sinkronisasi antar perangkat, dan mengganti browser atau menghapus site data akan menghapus progres. Kalau suatu hari butuh sinkron, itu butuh backend/akun — belum ada di proyek ini sama sekali.

## Gotcha & Perhatian

- **`npm run build` menjalankan `tsc -b` lebih dulu.** Error TypeScript akan menggagalkan build, bukan hanya reddening di editor. Karena tidak ada script `lint`/`typecheck`/`test`, **`npm run build` adalah satu-satunya verifikasi** — selalu jalankan setelah mengubah kode. (Sudah diverifikasi lulus pada dokumen ini ditulis: 52 modules, `✓ built in 1.93s`.)
- **`tsconfig.json` menyalakan `noUnusedLocals: true` dan `noUnusedParameters: true`** (plus `strict` dan `noFallthroughCasesInSwitch`). Import tak pakai, variabel tak pakai, atau parameter yang sengaja diabaikan akan menggagalkan build. Kalau memang perlu, awali dengan `_` atau hapus.
- **Jangan pakai `cd` di command shell**; gunakan parameter working directory agent. Path di dalam dokumen ini mengandung spasi (`Kotoba N5danN4`, `kotoba minna no nihonggo bab 1-50-1.pdf`) — selalu kutip.
- **Jangan pernah commit `node_modules` atau `dist`.** Sudah ada di `.gitignore`; pertahankan begitu.
- **Jangan hardcode warna — WAJIB token semantic.** Kalau ada `text-[#xxxxxx]`, `bg-[#xxxxxx]`, atau hex warna langsung di dalam `style`, light/dark parity langsung rusak.
- **Token lama sudah DIHAPUS, jangan dipakai.** `paper`, `paper-dark`, `ink` (versi hex lama `#2b4c7e`), `margin`, `pencil`, `highlight`, `note-yellow`, `note-green`, `note-pink`, `note-blue`, `shadow-paper`, `shadow-note`, `shadow-card`, `font-hand`, `font-body`, `animate-pop`, `animate-shake`, dan utility CSS `paper-lines` / `paper-margin` / `paper-grain` / `hl` **tidak ada lagi** di `tailwind.config.js` maupun `src/index.css`. Menggunakannya = kelas yang tidak di-generate = elemen tanpa styling. Peta penggantinya ada di tabel token dan tabel komponen/utilitas di atas. (Class `tape` sebagai utility juga sudah tidak ada, tapi **prop `tape` di `PaperCard` masih valid** dan dipakai di Home.)
  - Catatan: substring `paper-` masih muncul sebagai **nama CSS variable** `--paper-line`, `--paper-line-alpha` (dipakai untuk tekstur garis buku) dan kata `pencil` muncul di dalam data kosakata (`"arti": "Terpencil, jauh"`). Itu bukan token warna.
- **Font sudah diganti total.** Shippori Mincho + Manrope + IBM Plex Mono adalah font aktif. `Caveat` dan `Nunito` **tidak lagi dimuat** dan tidak boleh disebut sebagai font aktif. Untuk teks Jepang besar (kana/kanji, judul, angka display) **wajib `font-display`** — memakai `font-sans` menghilangkan identitas Jepang.
- **Iconify: nama ikon WAJIB berawalan `ph:` dan harus benar-benar ada di collection.** Kalau nama salah, Iconify merender kotak kosong **tanpa error**. Cara cek sebelum dipakai:
  ```bash
  node -e "console.log(Object.keys(require('./node_modules/@iconify-json/ph/icons.json').icons).includes('cards'))"
  ```
  Format `ph:<nama>` itu wajib karena `IconName` adalah template literal type; string tanpa `ph:` tidak akan lolos type-check.
- **`HankoSeal` memakai CSS shape, bukan glyph font** — bentuknya konsisten di semua perangkat dan tidak bergantung font CJK terpasang. Kalau butuh cap baru, ganti `mark` dengan karakter; jangan mengganti implementasi ke glyph/teks dekoratif.
- **Form `QuizKetik` memakai `<form onSubmit>` dengan `Button type="submit"`, bukan `onClick`.** Kalau mengubahnya, jaga perilaku tekan Enter.
- **`App.tsx` punya guard `selectedBabs` kosong.** Halaman latihan (`flashcard`, `quiz-pg`, `quiz-ketik`) otomatis dialihkan ke `home` kalau `selectedBabs` kosong. Kalau menambah mode latihan baru, masukkan ke array `needsBabs` agar guard-nya berlaku. Selain itu ketiga halaman punya empty state sendiri dengan `HankoSeal` `空` kalau `pool`/daftar soal kosong.
- **Reduced-motion dihormati via CSS**, bukan JS. `@media (prefers-reduced-motion: reduce)` di `src/index.css` mematikan animasi/transisi global dan transisi `.flip-inner`. Jangan menambahkan animasi JS/Framer Motion tanpa memedulikan blok ini.
- **`framer-motion` terpasang tapi tidak dipakai.** Tidak ada satu pun import di `src/`. Kalau nanti memakainya, perhatikan `noUnusedLocals`.
- **Data JSON di-bundle, bukan import dinamis.** `src/data/kotoba.json` (±416 KiB) di-import statis via `src/data/index.ts` dan ikut ter-bundle ke `assets/index-*.js` (±427,6 kB sebelum gzip). Semua 50 bab tersedia di memori sejak app start. Kalau nanti terasa lambat di perangkat lama, opsi perbaikan: pecah JSON per-bab dan `import()` dinamis saat bab dipilih, atau precompute `ALL_KOTOBA` saat build.
- **`getKotobaByBabs` dipanggil tanpa memo di `App.tsx`** (`const pool = getKotobaByBabs(selectedBabs)`), jadi array `pool` identitasnya baru setiap render. Halaman anak melakukan `useMemo` dengan `pool` sebagai dependensi, jadi deck/daftar soal ikut dibangun ulang tiap render — tidak fatal untuk 2.910 entri, tapi perlu diingat kalau nanti menambah komputasi berat.
- **Angka 50 hardcoded di beberapa tempat**: `Array.from({ length: 50 }, ...)` di `selectAll()` (`store/settings.ts`), `set(range(1, 51))` + `missing = sorted(set(range(1, 51)) - found)` di `tools/extract_pdf.py`, dan teks UI `"bab 1–50"`, `aria-label="Daftar bab 1 sampai 50"`, `<span className="k-eyebrow">50 bab</span>`, plus deskripsi di `package.json` dan `index.html`. Kalau dataset berubah, semuanya harus diubah bersamaan. (Angka `50` lain di kode — `duration-150`, `bg-ink/[0.07]`, `bg-success/15`, `pct >= 50` — bukan referensi jumlah bab.)
- **Palette PWA masih lagging.** `theme_color: "#2b4c7e"` dan `background_color: "#f5efe0"` di `vite.config.ts`, `INK/CREAM/RED` di `scripts/gen_icons.py`, serta latar `#f4f0e6`/`#121419` di inline `<style>` `index.html` adalah nilai tetap — tidak otomatis mengikuti token. Kalau palet diubah, enam nilai itu perlu diselaraskan manual.
- **`vite-plugin-pwa` menghasilkan service worker**, jadi setelah `npm run build` + `npm run preview`, perubahan kode bisa tertahan cache SW. Gunakan hard-reload saat dev.
- **`index.html` memuat Google Fonts lewat CDN**, jadi aplikasi butuh koneksi internet untuk tipografi. Offline (PWA terpasang), font fallback ke `"Yu Mincho"` / `system-ui` / `ui-monospace`. Ikon **tidak** terpengaruh — Iconify di-bundle lokal.
- **`index.html` mengaktifkan `user-scalable=no` dan `maximum-scale=1.0`.** Ini keputusan sadar (app mobile-like, mencegah zoom saat mengetik di kuis). Hati-hati mengubahnya.
- **Anti-flash script di `index.html` membaca bentuk JSON zustand persist** (`JSON.parse(raw).state.theme`). Kalau nama key `kotoba-theme` atau struktur middleware berubah, script itu **harus ikut diubah** — kalau tidak, tema akan berkedip saat load.
- **Working tree belum bersih.** `git status` menunjukkan 16 file termodifikasi dan 3 file baru belum di-track (`src/components/HankoSeal.tsx`, `src/components/Icon.tsx`, `src/store/theme.ts`) — hasil redesign yang belum di-commit.

## Task yang Tersedia

Belum ada task template atau command agent yang terdefinisi di repo — tidak ditemukan file `AGENTS.md`/`CLAUDE.md` lain, `.github/`, atau direktori task. **Propose dulu ke user** sebelum mengerjakan pekerjaan baru, dan update bagian ini kalau nanti sudah ada.