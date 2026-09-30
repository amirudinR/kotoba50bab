# AGENTS.md

Aplikasi hafalan kosakata Jepang **Kotoba** — kumpulan 2.910 kata dari *Minna no Nihongo* bab 1–50, ekstraksi otomatis dari satu file PDF. Tujuannya dipakai pelajar/pemula yang sedang belajar bahasa Jepang: memilih bab mana saja yang mau dilatih, lalu menghafal lewat flashcard, kuis pilihan ganda, kuis ketik, atau mencari kata. Tampilan bergaya buku tulis (kertas krem, garis buku, margin merah, tulisan tangan) supaya terasa seperti catatan, bukan aplikasi kuis generik.

Progres hafalan dan statistik kuis disimpan **di perangkat masing-masing** (`localStorage`), jadi aplikasi ini sepenuhnya statis: tidak ada backend, tidak ada akun, tidak ada database. Semua logika belajar berjalan di browser. Dokumen ini adalah panduan untuk AI agent (atau developer) yang akan mengerjakan perubahan di proyek ini.

## Ringkasan Proyek

| Item | Nilai |
| --- | --- |
| Nama paket | `kotoba-app` (private, `version` 1.0.0) |
| Fungsi | Hafalan kosakata Minna no Nihongo bab 1–50 |
| Target deploy | Static site di Vercel |
| Repository git | **Belum ada repository git** — folder ini bukan working tree git (`git status` gagal). Ada `.gitignore` tapi belum pernah `git init`. |
| Bahasa UI | Indonesia (beberapa label Jepang) |
| Root folder kerja | `D:\LPK\Kotoba N5danN4\kotoba-app` |
| Data sumber | `../kotoba minna no nihonggo bab 1-50-1.pdf` (di folder induk, ~5 MB) |

## Tech Stack

Versi diambil persis dari `package.json` (kolicy: caret range). Versi terpasang aktual berasal dari `npm ls`:

| Teknologi | Versi di `package.json` | Terpasang | Gunanya |
| --- | --- | --- | --- |
| react | `^18.3.1` | 18.3.1 | UI library |
| react-dom | `^18.3.1` | 18.3.1 | Mount React ke DOM |
| zustand | `^5.0.1` | 5.0.15 | Store global + routing + persistensi `localStorage` |
| framer-motion | `^11.11.17` | 11.18.2 | **Dependensi tapi belum dipakai** — tidak ada import di seluruh `src/` (animasi saat ini murni CSS/framer-class di `index.css`) |
| vite | `^6.0.3` | 6.4.3 | Dev server + bundler |
| @vitejs/plugin-react | `^4.3.4` | 4.7.0 | Fast refresh / transform JSX |
| vite-plugin-pwa | `^0.21.1` | 0.21.2 | Manifest + service worker (mode `generateSW`) |
| typescript | `^5.6.3` | 5.9.3 | Typing + type-check saat build |
| tailwindcss | `^3.4.15` | 3.4.19 | Utility CSS + token warna/font/box-shadow kustom |
| postcss | `^8.4.49` | 8.5.28 | Pipeline CSS |
| autoprefixer | `^10.4.20` | 10.6.1 | Vendor prefix |
| @types/react, @types/react-dom | `^18.3.12`, `^18.3.1` | 18.3.31, 18.3.7 | Typing React |

Python (di luar `package.json`) dipakai untuk tooling: **PyMuPDF** (`fitz`) untuk ekstraksi PDF dan **Pillow** untuk membuat ikon PWA.

## Cara Menjalankan

```bash
# dari folder D:\LPK\Kotoba N5danN4\kotoba-app
npm install        # pasang dependency sesuai package-lock.json
npm run dev        # dev server Vite (localhost:5173, otomatis pindah port bila dipakai)
npm run build      # tsc -b lalu vite build -> output dist/
npm run preview    # serve hasil build dari dist/
```

Catatan:

- Hanya ada tiga script: `dev`, `build`, `preview`. Tidak ada script `test`, `lint`, atau `typecheck` — verifikasi pakai `npm run build` saja (lihat bagian Gotcha).
- Output build ada di **`dist/`** dan itu juga output produksi untuk Vercel. Isi `dist/` saat ini: `index.html`, `assets/index-*.css` (~18 KB), `assets/index-*.js` (~387 KB, ~112 KB gzip), plus `manifest.webmanifest`, `sw.js`, `registerSW.js`, `workbox-*.js` dari PWA.
- `base: "./"` di `vite.config.ts` membuat semua path aset relatif, jadi `dist/` bisa dipublish dari path mana pun (subpath Vercel, GitHub Pages, file lokal) tanpa rewrite base.
- Kalau menjalankan perintah shell dari agent, jangan pakai `cd`; set working directory ke folder app.
- Ada `dev.log`, `dev.err.log`, dan `dev.pid` di root — artefak dari sesi dev sebelumnya yang dipakai manual dengan `vite --port 5199`. Bukan bagian dari script resmi.

## Regenerasi Data Kosakata (PENTING)

Sumber kebenaran data adalah PDF di **folder induk**:

```
D:\LPK\Kotoba N5danN4\kotoba minna no nihonggo bab 1-50-1.pdf
```

Skrip ekstraksi ada di luar folder app, di `D:\LPK\Kotoba N5danN4\tools\extract_pdf.py` (butuh PyMuPDF). Skrip menerima dua argumen opsional: path PDF dan path output, default-nya `kotoba minna no nihonggo bab 1-50-1.pdf` dan `src/data/kotoba.json`.

```bash
# jalankan dari folder app (output & input relatif ke folder ini)
python ../tools/extract_pdf.py "../kotoba minna no nihonggo bab 1-50-1.pdf" "src/data/kotoba.json"
```

Dari folder induk juga bisa: `python tools/extract_pdf.py "kotoba minna no nihonggo bab 1-50-1.pdf" "kotoba-app/src/data/kotoba.json"`.

Output: JSON `{ "babs": [ { "bab": 1, "items": [ { "no", "kana", "kanji", "arti" } ] } ] }`, ditulis dengan `ensure_ascii=False, indent=2` (besar ±416 KB).

### Gotcha teknis ekstraksi (sudah pernah ketemu, jangan diulang)

Struktur PDF: tiap bab punya tabel dengan kolom `番号 | 日本語 | 漢字 | インドネシア語`. Teks diekstrak **per baris**, jadi tabel harus diparse dengan **state machine**, bukan regex per entri.

- **Nomor halaman harus dibuang.** Angka halaman muncul sebagai baris angka tunggal di dekat footer `By: Agus Hinji`. Kalau tidak dibuang, angka itu dibaca state machine sebagai nomor entri dan **seluruh entri setelahnya bergeser** (nomor melompat, baris jadi tidak sinkron). Solusinya di kode: `extract_lines` mencari indeks baris footer lalu membuang baris pada offset `-2..+2` yang isinya sama dengan nomor halaman. Pola footer: `FOOTER_RE = ^By:\s*Agus\s*Hinji` (case-insensitive).
- **Jangan hapus kata `番号` / `日本語` / `漢字` / `インドネシア語` secara global.** Kata-kata itu bisa jadi header tabel **dan** kanji kosakata yang sah. Hapus HANYA sebagai rangkaian 4 baris berurutan lewat `strip_header_rows` dengan konstanta `HEADER_SEQ = ("番号", "日本語", "漢字", "インドネシア語")`.
- **Label `BAB N` tidak boleh terparse sebagai kana.** Pola `BAB_RE = ^BAB\s+(\d+)\s*$`. Saat membaca kana maupun kanji, baris yang cocok `BAB_RE` harus dilewati (kodi `if i < n and not BAB_RE.match(...)`).
- **Arti boleh terpecah multi-baris dan harus digabung** sampai ketemu baris angka berikutnya atau `BAB N`, lalu whitespace-nya dirapikan (`arti_parts` → join → `re.sub(r"\s+", " ", ...)`).
- **Satu bab bisa melebihi satu halaman, dan satu halaman bisa memuat dua bab.** Jangan mengasumsikan 1 bab = 1 halaman atau memproses per halaman sebagai unit bab.
- **Baris kosong itu bermakna**: kana yang kosong berarti entri punya kanji kosong. `is_noise` sengaja `return False` untuk baris kosong supaya penandanya tidak hilang.
- Entri tanpa kana dibuang saat `flush_bab()` (`filter(it.get("kana"))`).

### Gejala bug yang pernah muncul

- Hanya **29 dari 50 bab** terbaca → biasanya `strip_header_rows` terlalu agresif (menghapus kata kanji secara global) sehingga state machine kehilangan penanda `BAB`.
- `no` tidak sama dengan `max(no)` per bab → indikasi nomor halaman tidak terbuang, atau nomor entri bergeser.

Skrip sudah mencetak ringkasan sendiri (`Total bab`, `Total kosakata`, `PERINGATAN bab hilang`). Validasi tambahan:

```bash
python -c "import json; d=json.load(open('src/data/kotoba.json',encoding='utf-8')); b=d['babs']; print('bab:',len(b),'total:',sum(len(x['items']) for x in b)); bad=[(x['bab'],max(i['no'] for i in x['items'])) for x in b if x['items'] and max(i['no'] for i in x['items'])!=len(x['items'])]; print('mismatch:', bad if bad else 'tidak ada')"
```

Nilai yang diharapkan saat ini: **bab: 50, total: 2910, mismatch: tidak ada**.

### Ikon PWA

`scripts/gen_icons.py` (Pillow, di dalam folder app) menggambar ulang `public/icon-192.png` dan `public/icon-512.png` — kartu kertas krem dengan kanji `言` di tengah. Butuh font CJK dari `C:\Windows\Fonts` (Yu Gothic, MS Gothic, dll).

```bash
python scripts/gen_icons.py
```

## Struktur Proyek

```
kotoba-app/
├─ index.html                 # shell, judul app, link Google Fonts Caveat + Nunito
├─ package.json               # 3 script: dev / build / preview
├─ tsconfig.json              # strict + noUnusedLocals + noUnusedParameters
├─ vite.config.ts             # base "./" + VitePWA (registerType autoUpdate)
├─ tailwind.config.js         # token warna, font, box-shadow kustom
├─ postcss.config.js          # tailwindcss + autoprefixer
├─ vercel.json                # rewrite SPA ke /index.html
├─ .gitignore                 # sudah ada, tapi repo belum di-init
├─ public/
│  ├─ favicon.svg
│  ├─ icon-192.png
│  └─ icon-512.png
├─ scripts/
│  └─ gen_icons.py            # generator ikon PWA (Pillow)
├─ src/
│  ├─ main.tsx                # mount React StrictMode ke #root
│  ├─ App.tsx                 # router berbasis switch (state), validasi bab terpilih
│  ├─ index.css               # Tailwind + utilitas kertas, flip card, animasi
│  ├─ types.ts                # Kotoba, Bab, KotobaWithBab
│  ├─ data/
│  │  ├─ kotoba.json          # 50 bab / 2910 entri (~416 KB) — hasil ekstraksi PDF
│  │  └─ index.ts             # BABS, ALL_KOTOBA, TOTAL_KOTOBA, getBab, getKotobaByBabs
│  ├─ lib/
│  │  └─ utils.ts             # shuffleArray, sampleN, normalize, artiVariants, isAnswerCorrect
│  ├─ store/
│  │  ├─ app.ts               # route + go() (TIDAK persist)
│  │  ├─ settings.ts          # selectedBabs, shuffle, viewMode (persist)
│  │  └─ progress.ts          # hafal, stats (persist) + kataKey()
│  ├─ components/
│  │  ├─ Button.tsx           # variant: ink | red | ghost | note
│  │  ├─ PaperCard.tsx        # kartu kertas, props tilt & tape (selotip)
│  │  ├─ ProgressBar.tsx     # baris persentase sederhana
│  │  └─ TopBar.tsx           # header sticky + tombol kembali (SVG)
│  └─ pages/
│     ├─ Home.tsx             # pilih bab, pilih mode, ringkasan hafalan
│     ├─ Flashcard.tsx        # kartu balik 3D
│     ├─ QuizPG.tsx           # kuis pilihan ganda (4 opsi)
│     ├─ QuizKetik.tsx        # kuis ketik jawaban
│     ├─ Search.tsx           # cari kana/kanji/arti
│     └─ Progress.tsx         # statistik + reset progres
├─ dist/                      # output build (jangan di-commit)
└─ tools/../extract_pdf.py    # skrip ekstraksi PDF (di folder INDUK, bukan di dalam app)
```

## Arsitektur

### Routing — tanpa react-router

Aplikasi **tidak memakai** `react-router`. Navigasi sepenuhnya lewat Zustand: `useApp` menyimpan field `route` bertipe `Route`, dan `App.tsx` melakukan `switch (route)` untuk me-render halaman. Perpindahan halaman dipicu `go(route)`, yang sekaligus melakukan `window.scrollTo({ top: 0 })`.

Route yang ada (union type di `src/store/app.ts`):

| Nilai route | Komponen |
| --- | --- |
| `"home"` | `Home` (default) |
| `"flashcard"` | `Flashcard` |
| `"quiz-pg"` | `QuizPG` |
| `"quiz-ketik"` | `QuizKetik` |
| `"search"` | `Search` |
| `"progress"` | `Progress` |

Konsekuensi untuk agent: menambah halaman = tambah union type di `store/app.ts`, tambah komponen di `src/pages/`, tambah `case` di `App.tsx`. Tidak ada URL, tidak ada history, tidak ada deep-link. `App.tsx` juga memvalidasi: kalau masuk `flashcard` / `quiz-pg` / `quiz-ketik` sementara `selectedBabs` kosong, otomatis balik ke `home`.

### State & persistensi

Tiga store Zustand, dua di antaranya memakai middleware `persist` yang menulis ke `localStorage`:

| Store | File | Dipersist? | Nama key `localStorage` | Isi |
| --- | --- | --- | --- | --- |
| `useApp` | `store/app.ts` | Tidak | — (tidak ada key) | `route`, `go()` |
| `useSettings` | `store/settings.ts` | Ya, `persist` | **`kotoba-settings`** | `selectedBabs: number[]` (default `[1]`), `shuffle: boolean` (default `true`), `viewMode: "kana-arti" \| "arti-kana"` (default `"kana-arti"`) + aksi `setSelectedBabs`, `toggleBab`, `selectAll` (1–50), `clearBabs`, `setShuffle`, `setViewMode` |
| `useProgress` | `store/progress.ts` | Ya, `persist` | **`kotoba-progress`** | `hafal: string[]` (daftar key kata yang ditandai hafal) dan `stats: Record<string, {benar: number; salah: number}>` + aksi `toggleHafal`, `isHafal`, `recordAnswer`, `resetProgress` |

Dua key localStorage itu (**`kotoba-settings`** dan **`kotoba-progress`**) adalah satu-satunya key yang dipakai aplikasi.

`hafal` disimpan sebagai array of string, bukan `Set`, supaya bisa di-serialize JSON. Kunci unik tiap kata dibuat oleh helper `kataKey(bab, no)` → `` `${bab}-${no}` `` (format `"1-3"`). Pola ini dipakai ulang sebagai `key` React di Search, QuizPG, dan QuizKetik — konsisten dengan `kataKey`, tapi di beberapa tempat ditulis langsung sebagai template literal.

### Data

`src/data/index.ts` melakukan `import raw from "./kotoba.json"` lalu `const data = raw as { babs: Bab[] }`. `resolveJsonModule: true` di `tsconfig.json` yang membuatnya bekerja. Yang di-export:

- `BABS: Bab[]` — array bab apa adanya (dipakai Home untuk grid pilihan bab, Progress untuk baris per bab, App untuk `allPool`).
- `ALL_KOTOBA: KotobaWithBab[]` — semua entri digabung datar dengan info bab, hasil `BABS.flatMap`. Dipakai Search untuk mencari lintas seluruh bank kata.
- `TOTAL_KOTOBA: number` — `ALL_KOTOBA.length`, dipakai Home dan Progress.
- `getBab(bab: number): Bab | undefined` — cari satu bab.
- `getKotobaByBabs(babList: number[]): KotobaWithBab[]` — filter `ALL_KOTOBA` berdasarkan himpunan bab terpilih; inilah yang jadi `pool` di `App.tsx`.

Tipe `KotobaWithBab extends Kotoba { bab: number }` ada karena model data asli tidak menyimpan asal kata. Semua mode latihan bekerja pada **gabungan beberapa bab** (pengguna bisa pilih 1–50 bab sekaligus), jadi setiap entri harus membawa `bab`-nya sendiri agar UI bisa menampilkan "bab 12" dan agar progres tetap unik per kata.

### Logika kuis — `src/lib/utils.ts`

| Fungsi | Perilaku | Dipakai di |
| --- | --- | --- |
| `shuffleArray<T>(arr)` | Fisher-Yates, mengembalikan array **baru** (tidak memutasi input) | `Flashcard` (acak deck), `QuizPG` (acak opsi & sumber pengecoh) |
| `sampleN<T>(arr, n)` | `shuffleArray(arr).slice(0, n)` | `QuizPG` & `QuizKetik` (pilih soal) |
| `normalize(s)` | lowercase, buang tanda baca CJK & latin (`。、．，,.\s～〜~()（）【】\[\]"'`!?！？:：;；…`), trim | `Search` (pencarian), `QuizPG` (perbandingan jawaban), dan dipakai internal `isAnswerCorrect` |
| `artiVariants(arti)` | pecah arti jadi daftar alternatif dengan split `/[,，/;；、]|\.\s|\s{2,}/`, buang yang kosong | dipakai `isAnswerCorrect` di mode `kana-arti` |
| `isAnswerCorrect(input, target, mode)` | mode `kana-arti`: cocokkan input ke salah satu varian arti (sama persis **atau** substring dua arah); mode `arti-kana`: cocokkan persis ke kana atau kanji | `QuizKetik` |

Catatan perilaku `isAnswerCorrect` yang mungkin dianggap "aneh" tapi disengaja: pencocokan memakai `includes` dua arah, jadi mengetik sebagian kata (mis. "saya" untuk "saya/kami") tetap dianggap benar.

Keduanya mode kuis punya `const QUIZ_LEN = 10` dan membangun daftar soal di dalam `useMemo` yang bergantung pada `pool, shuffle, viewMode`; daftar soal di-reset (index, skor, salah) setiap kali `questions` berubah.

### PWA

`VitePWA` dari `vite-plugin-pwa` di `vite.config.ts`:

- `registerType: "autoUpdate"` — service worker mengambil versi baru otomatis, tanpa prompt.
- `includeAssets: ["favicon.svg"]`.
- `manifest` inline di config (bukan file terpisah): `name: "Kotoba - Hafalan Minna no Nihongo"`, `short_name: "Kotoba"`, `display: "standalone"`, `orientation: "portrait"`, `theme_color: #2b4c7e`, `background_color: #f5efe0`, ikon `icon-192.png`, `icon-512.png`, dan `icon-512.png` dengan `purpose: "any maskable"`.
- Build menghasilkan `dist/sw.js` + `dist/workbox-*.js` dengan 8 entri precache. `index.html` tidak mengimpor `virtual:pwa-register` secara manual; registrasi ditangani `registerType: "autoUpdate"`.

## Fitur

- **Home** (`pages/Home.tsx`) — Judul tulisan tangan, 5 tombol mode, toggle "Urutan acak", grid pilihan bab 1–50 (dengan tombol Semua/Kosongkan), dan bar kemajuan hafalan untuk bab yang terpilih.
- **Flashcard** — Satu kartu besar yang bisa dibalik (tap), arah kartu mengikuti `viewMode` (kana→arti atau arti→kana), kanji ditampilkan sebagai sub-teks, tombol Sebelumnya/Berikutnya, dan tombol ☆/✓ untuk menandai hafal. Deck di-reset ke kartu pertama tiap pool berubah.
- **QuizPG** (kuis pilihan ganda) — 10 soal, 4 opsi per soal; 3 pengecoh diambil dari seluruh bank kata (`allPool`, bukan cuma `pool`) supaya lebih beragam, opsi diacak, dan koreksi memakai `normalize`. Jawaban benar otomatis menandai kata sebagai hafal. Di akhir tampil skor + daftar "Perlu diulang".
- **QuizKetik** — 10 soal, user mengetik jawaban; autofocus input tiap soal, submit via form/Enter, komponen `<form onSubmit>` bukan onClick. Menampilkan jawaban user vs jawaban benar saat salah. Di akhir juga skor + daftar ulangan.
- **Search** — Pencarian live di `ALL_KOTOBA` (kana, kanji, atau arti Indonesia) setelah di-normalize, maksimum 120 hasil, dengan badge "bab N" dan tombol ☆/✓ hafal per hasil.
- **Progress** — Ringkasan total (jumlah hafal, benar, salah, akurasi), progress bar hafalan terhadap `TOTAL_KOTOBA`, bar per bab, dan tombol reset progres dengan konfirmasi dua langkah.

## Sistem Desain

### Palet warna (dari `tailwind.config.js`)

| Token Tailwind | Hex | Dipakai untuk |
| --- | --- | --- |
| `paper` | `#f5efe0` | warna kertas latar (juga `background_color` manifest) |
| `paper-dark` | `#e8dfc9` | kartu/sel tidak aktif |
| `ink` | `#2b4c7e` | warna biru tinta: teks utama, aksen, tombol |
| `ink-soft` | `#4a6fa5` | biru muda untuk sub-teks arti |
| `margin` | `#c0392b` | merah margin buku tulis, teks error |
| `pencil` | `#6b6456` | abu-abu teks sekunder |
| `highlight` | `#f7d774` | kuning stabilo |
| `note-yellow` | `#fff3b0` | kartu sticky kuning |
| `note-green` | `#d4e8c4` | kartu jawaban benar / sudah hafal |
| `note-pink` | `#f8d7da` | kartu jawaban salah |
| `note-blue` | `#cfe2f3` | kartu sticky biru |

Font: `font-hand` = `"Caveat", cursive` (judul, kana besar — gaya tulisan tangan), `font-body` = `"Nunito", system-ui, sans-serif` (teks isi). Keduanya dimuat via Google Fonts di `index.html` dengan bobot 400/600/700 (dan 800 untuk Nunito), plus `preconnect` ke fonts.googleapis.com dan fonts.gstatic.com.

Box shadow kustom: `shadow-paper` (lembut, untuk kartu kecil), `shadow-note` (untuk sticky note), `shadow-card` (lebih dalam, untuk kartu besar).

### Estetika kertas

- `body` punya background cream `#f5efe0` dengan `linear-gradient` garis horizontal tiap 32px (warna biru 6%) plus `radial-gradient` titik-titik halus — kesan kertas buku tulis. `overscroll-behavior-y: none` dan `-webkit-tap-highlight-color: transparent` untuk nuansa app mobile.
- Utilitas kustom di `@layer utilities` (`src/index.css`): `.font-hand`, `.paper-lines` (garis 30px), `.paper-margin` (garis merah via `::before` di `left: 2rem`), `.paper-grain` (serat kertas 45°), `.tape` (selotip 68×22px).
- Flip card 3D murni CSS: `.flip-perspective` (perspective 1600px), `.flip-inner` (+`.flipped` → `rotateY(180deg)`, transisi 0.55s), `.flip-face` (`backface-visibility: hidden`), `.flip-back`.
- Animasi: `@keyframes pop` (`.animate-pop`, benar) dan `@keyframes shake` (`.animate-shake`, salah). Kelas `.hl` memberi sapuan stabilo.
- Scrollbar custom (`::-webkit-scrollbar` + thumb biru transparan).
- `PaperCard` mendukung `tilt` (derajat rotasi) dan `tape` (selotip di atas kartu); dipakai dengan `tape` di Home dan Progress.

### PENTING untuk agent yang/edit JSX

Kelas Tailwind dengan **warna/font/shadow kustom** seperti `bg-paper`, `text-ink`, `bg-ink/10`, `text-note-green`, `font-hand`, `shadow-paper` **tidak akan dikenali autocomplete/Tailwind IntelliSense**, karena warnanya bukan palet default Tailwind. Ini normal dan disengaja. **Jangan "memperbaiki"** kelas-kelas itu menjadi nama warna default (mis. `bg-blue-100`, `text-gray-500`) — kontras dan estetika kertas akan rusak. Kelas utilitas murni CSS (`paper-grain`, `paper-margin`, `flip-inner`, `animate-pop`, `tape`, `hl`) juga bukan Tailwind; jangan ditulis ulang sebagai Tailwind.

## Deployment (Vercel)

`vercel.json` hanya berisi rewrite SPA:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Rewrite ini penting karena aplikasi tidak punya routing berbasis path — semua halaman di-render dari satu `index.html`. Tanpa rewrite, request langsung ke file lain akan 404. (Dengan `base: "./"` dan aplikasi tanpa URL routing, rewrite tetap aman dan tetap sesuai konvensi Vercel untuk SPA Vite.)

Output build = **`dist/`**. Framework preset Vercel untuk Vite sudah mengenali ini, jadi `dist/` tidak perlu disebut manual di dashboard.

Deploy manual lewat Vercel CLI:

```bash
npm install -g vercel      # sekali saja
cd D:\LPK\Kotoba N5danN4\kotoba-app   # atau set workdir
vercel                    # preview deployment
vercel --prod             # production
```

Lewat git: repo belum ada. Kalau nanti `git init` + `git remote add origin <url>`, hubungkan project di dashboard Vercel ke remote itu — Vercel akan auto-build pada setiap push. Saat itu pastikan `node_modules` dan `dist` tidak ikut ter-commit (`.gitignore` sudah menutup keduanya) dan build command default Vercel (`npm run build`) sudah benar.

**Perousal data yang perlu diingat saat menambah fitur:** karena seluruh progres hanya di `localStorage`, progres bersifat **per-browser/per-device**. Tidak ada sinkronisasi antar perangkat, dan mengganti browser atau menghapus site data akan menghapus progres. Kalau suatu hari butuh sinkron, itu butuh backend/akun — belum ada di proyek ini sama sekali.

## Gotcha & Perhatian

- **Data JSON bukan import dinamis.** `src/data/kotoba.json` (~416 KB) di-import statis via `src/data/index.ts` dan ikut ter-bundle ke `assets/index-*.js` (~387 KB sebelum gzip). Semua 50 bab tersedia di memori sejak app start. Kalau nanti terasa lambat di perangkat lama, opsi perbaikan: pecah JSON per-bab dan `import()` dinamis saat bab dipilih, atau precompute `ALL_KOTOBA` saat build.
- **`npm run build` menjalankan `tsc -b` lebih dulu.** Artinya error TypeScript akan menggagalkan build, bukan hanya reddening di editor. Karena tidak ada script `lint`/`typecheck`/`test`, **`npm run build` adalah satu-satunya verifikasi** — selalu jalankan setelah mengubah kode.
- **`tsconfig.json` menyalakan `noUnusedLocals: true` dan `noUnusedParameters: true`.** Variabel atau parameter yang tidak terpakai (termasuk import yang tak dipakai, dan argumen yang sengaja diabaikan) akan menggagalkan build. Kalau memang perlu, awali dengan `_` atau memang hapus.
- **Jangan pakai `cd` di command shell**; gunakan parameter working directory agent. Path di dalam dokumen ini mengandung spasi (`Kotoba N5danN4`, `kotoba minna no nihonggo bab 1-50-1.pdf`) — selalu kutip.
- **Jangan pernah commit `node_modules` atau `dist`.** Sudah ada di `.gitignore`; pertahankan begitu.
- **Jangan hapus `src/data/kotoba.json` saat scaffold ulang.** `npm create vite` atau commands generator sejenis bisa mereplace folder; data hasil ekstraksi PDF itu expensive untuk direproduksi dan tidak ada salinan di dalam repo. Commit/salinasikan file ini sebelum scaffold apa pun.
- **`framer-motion` terpasang tapi tidak dipakai.** Tidak ada satu pun import di `src/`. Animasi sekarang murni CSS. Kalau nanti memakai animasi Framer Motion, perhatikan `noUnusedLocals` dan jangan mengimpornya di halaman yang memang tidak membutuhkannya.
- **`vite-plugin-pwa` menghasilkan service worker**, jadi setelah `npm run build` + `npm run preview`, perubahan kode bisa tertahan cache SW. Gunakan `registerType: "autoUpdate"` (sudah) atau hard-reload saat dev.
- **`index.html` memuat Google Fonts lewat CDN**, jadi aplikasi butuh koneksi internet untuk tampilan font Caveat/Nunito. Offline (mode PWA terpasang), font akan fallback ke `cursive` / `system-ui`.
- **Form `QuizKetik` memakai `<form onSubmit>` dengan tombol `type="submit"`, bukan `onClick`.** Kalau mengubahnya, jaga perilaku tekan Enter.
- **`index.html` mengaktifkan `user-scalable=no` dan `maximum-scale=1.0`.** Ini keputusan sadar (app mobile-like, mencegah zoom saat mengetik di kuis). Hati-hati mengubahnya: zoom browser akan mengganggu pengalaman ketik.
- **`App.tsx` punya guard**: halaman latihan otomatis dialihkan ke `home` kalau `selectedBabs` kosong. Kalau menambah mode latihan baru, masukkan ke array `needsBabs` agar guard-nya berlaku.
- **Angka hard-coded 50 muncul di beberapa tempat**: `Array.from({ length: 50 }, ...)` di `selectAll()` (`store/settings.ts`), `set(range(1, 51))` di skrip Python, dan teks "bab 1–50" di UI. Kalau dataset berubah, ketiganya harus diubah bersamaan.
- **`getKotobaByBabs` dipanggil tanpa memo di `App.tsx`** (`const pool = getKotobaByBabs(selectedBabs)`), jadi array `pool` identitasnya baru setiap render. Halaman anak melakukan `useMemo` dengan `pool` sebagai dependensi, jadi deck/daftar soal ikut dibangun ulang tiap render — tidak fatal untuk 2.910 entri, tapi perlu diingat kalau nanti menambah komputasi berat.
- **Ada artefak development di root**: `dev.log`, `dev.err.log`, `dev.pid`. Tidak di-README dan bukan bagian dari build; boleh diabaikan atau dihapus.

## Task yang Tersedia

Belum ada — propose dulu ke user.