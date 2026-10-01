# AGENTS.md

Aplikasi hafalan kosakata Jepang **Kotoba** — 2.910 kata dari *Minna no Nihongo* bab 1–50, diekstraksi otomatis dari satu file PDF. Untuk pelajar pemula bahasa Jepang: pilih bab mana saja, lalu menghafal lewat flashcard, kuis pilihan ganda, kuis ketik, atau pencarian.

Tampilan bergaya buku tulis Jepang: mode terang (*washi*, kertas hangat) dan mode gelap (*sumi*, tinta pekat), dengan cap merah *hanko* (印章) sebagai elemen visual signature.

Progres hafalan dan statistik kuis disimpan **di perangkat masing-masing** (`localStorage`). Tidak ada backend, akun, atau database — seluruh aplikasi statis dan berjalan di browser. Dokumen ini adalah panduan untuk AI agent (atau developer) yang akan mengerjakan perubahan di proyek ini.

## Ringkasan Proyek

| Item | Nilai |
| --- | --- |
| Nama paket | `kotoba-app` (private, `version` 1.0.0) |
| Fungsi | Hafalan kosakata Minna no Nihongo bab 1–50 |
| Target deploy | Static site di Vercel |
| Repository | `https://github.com/amirudinR/kotoba50bab.git` (branch `main`, public) |
| Bahasa UI | Indonesia, dengan label Jepang sebagai elemen visual |
| Root folder kerja | `D:\LPK\Kotoba N5danN4\kotoba-app` |
| Data sumber | `../kotoba minna no nihonggo bab 1-50-1.pdf` (folder induk, ~5 MB, **tidak** masuk repo) |

## Tech Stack

Versi diambil persis dari `package.json`. Versi terpasang aktual dari `npm ls`.

| Teknologi | package.json | Terpasang | Gunanya |
| --- | --- | --- | --- |
| react / react-dom | `^18.3.1` | 18.3.1 | UI library |
| zustand | `^5.0.1` | 5.0.15 | Store global + routing + persistensi `localStorage` |
| @iconify/react | `^6.0.2` | 6.0.2 | Rendering ikon SVG |
| @iconify-json/ph | `^1.2.2` | 1.2.2 | Koleksi ikon Phosphor, di-bundle lokal (offline) |
| vite | `^6.0.3` | 6.4.3 | Dev server + bundler |
| @vitejs/plugin-react | `^4.3.4` | 4.7.0 | Transform JSX + fast refresh |
| vite-plugin-pwa | `^0.21.1` | 0.21.2 | Manifest + service worker (`generateSW`) |
| typescript | `^5.6.3` | 5.9.3 | Typing + type-check saat build |
| tailwindcss | `^3.4.15` | 3.4.19 | Utility CSS, driven by CSS variables |
| postcss / autoprefixer | `^8.4.49` / `^10.4.20` | 8.5.28 / 10.6.1 | Pipeline CSS |
| framer-motion | `^11.11.17` | 11.18.2 | **Terpasang tapi TIDAK dipakai** — nol import di `src/` |

Python (di luar `package.json`): **PyMuPDF** (`fitz`) untuk ekstraksi PDF, **Pillow** untuk ikon PWA.

## Cara Menjalankan

```bash
# dari D:\LPK\Kotoba N5danN4\kotoba-app
npm install        # pasang dependency sesuai package-lock.json
npm run dev        # dev server Vite
npm run build      # tsc -b lalu vite build -> output dist/
npm run preview    # serve hasil build dari dist/
```

Hanya ada tiga script. **Tidak ada** `test`, `lint`, atau `typecheck` — verifikasi memakai `npm run build`.

Output build ada di **`dist/`** dan itu juga output produksi untuk Vercel. Ukuran terakhir (dapat berubah tiap build):

| Aset | Mentah | gzip |
| --- | --- | --- |
| `assets/index-*.js` | ~236 KB | ~73 KB |
| `assets/index-*.css` | ~33 KB | ~7 KB |

plus `index.html`, `manifest.webmanifest`, `sw.js`, `registerSW.js`, `workbox-*.js` dari PWA.

`base: "./"` di `vite.config.ts` membuat semua path aset relatif, jadi `dist/` bisa dipublish dari path mana pun tanpa rewrite base.

## Regenerasi Data Kosakata

Ada **dua langkah**. Ekstraksi PDF menghasilkan satu file monolitik, lalu
`build_data.py` memecahnya menjadi file per bab + search index.

### Langkah 1 — ekstraksi PDF

Sumber kebenaran adalah PDF di **folder induk**:

```
D:\LPK\Kotoba N5danN4\kotoba minna no nihonggo bab 1-50-1.pdf
```

Skrip `tools/extract_pdf.py` (PyMuPDF) menerima dua argumen opsional: path PDF
dan path output; default-nya `kotoba minna no nihonggo bab 1-50-1.pdf` dan
`src/data/kotoba.json`.

```bash
python tools/extract_pdf.py "../kotoba minna no nihonggo bab 1-50-1.pdf" "src/data/kotoba.json"
```

Output: `{ "babs": [ { "bab": 1, "items": [ { "no", "kana", "kanji", "arti" } ] } ] }`.

### Langkah 2 — pecah per bab + romaji

```bash
pip install pykakasi
python tools/build_data.py
```

Membaca `src/data/kotoba.json`, lalu menulis:

| File | Isi | Ukuran |
| --- | --- | --- |
| `src/data/bab/01.json` … `50.json` | satu bab penuh, + `romaji` | 5–15 KB each (±430 KB total) |
| `src/data/index.json` | `{ bab, count }` 50 baris | 2.1 KB |
| `src/data/search.json` | 2.910 entri **tanpa** `romaji` | 356 KB (61 KB gzip) |

`romaji` diisi PyKakasi (mode Hepburn), satu konversi per kana unik (2.612 dari
2.910 entri karena banyak kana berulang antar bab). Kalau `pykakasi` tidak
terpasang, skrip tetap jalan tetapi `romaji` kosong — lalu jalankan ulang setelah
memasangnya.

Skrip juga memvalidasi nomor entri harus berurutan `1..n` per bab.

**Jangan edit file di `src/data/bab/` atau `index.json`/`search.json` secara
manual** — semuanya hasil generate. Edit `kotoba.json` (atau PDF) lalu jalankan
`build_data.py`. `src/data/kotoba.json` sendiri **juga** jangan dihapus, itu
sumber untuk langkah 2.

### Angka data saat ini (verified)

| Metrik | Nilai |
| --- | --- |
| Jumlah bab | 50 |
| Total entri | 2.910 |
| Entri **dengan** kanji | 1.959 |
| Entri tanpa kanji | 951 |
| Entri tanpa arti | 1 (`われものちゅうい`, memang kosong di PDF asli) |
| Entri dengan `romaji` | 2.910 (**nol** yang kosong) |
| Kana unik | 2.612 (298 kana muncul di lebih dari satu bab) |

UI menampilkan kanji hanya bila `kanji` terisi — jadi sekitar⅓kartu sengaja tidak punya baris kanji. Ini bukan bug.

### Gotcha ekstraksi PDF — jangan diulang

Struktur PDF: tiap bab punya tabel `番号 | 日本語 | 漢字 | インドネシア語`. Teks diekstrak **per baris**, jadi harus diparse dengan **state machine**, bukan regex per entri.

- **Nomor halaman harus dibuang.** Angka halaman muncul sebagai baris angka tunggal di dekat footer `By: Agus Hinji`. Kalau tidak dibuang, angka itu dibaca sebagai nomor entri dan **seluruh entri berikutnya bergeser**. Solusi di kode: `extract_lines` mencari indeks baris footer, lalu membuang baris pada offset `-2..+2` yang isinya sama dengan nomor halaman. Pola: `FOOTER_RE = ^By:\s*Agus\s*Hinji` (case-insensitive).
- **Jangan hapus kata `番号` / `日本語` / `漢字` / `インドネシア語` secara global.** Kata-kata itu bisa jadi header tabel **dan** kanji kosakata yang sah — misalnya `日本語` adalah kanji untuk "bahasa Jepang". Hapus HANYA sebagai rangkaian 4 baris berurutan lewat `strip_header_rows` dengan `HEADER_SEQ`.
- **Label `BAB N` tidak boleh terparse sebagai kana.** Saat membaca kana maupun kanji, baris yang cocok `BAB_RE = ^BAB\s+(\d+)\s*$` harus dilewati.
- **Arti boleh terpecah multi-baris dan harus digabung** sampai ketemu baris angka berikutnya atau `BAB N`, lalu whitespace dirapikan.
- **Satu bab bisa melebihi satu halaman, dan satu halaman bisa memuat dua bab.** Jangan mengasumsikan 1 bab = 1 halaman.
- **Baris kosong itu bermakna:** kana kosong berarti entri punya kanji kosong. `is_noise` sengaja `return False` untuk baris kosong.
- Entri tanpa kana dibuang saat `flush_bab()`.

### Gejala bug yang pernah muncul

- Hanya **29 dari 50 bab** terbaca → `strip_header_rows` terlalu agresif (menghapus kanji secara global) sehingga penanda `BAB` hilang.
- `no` tidak sama dengan `max(no)` per bab → nomor halaman tidak terbuang, atau nomor entri bergeser.

Validasi:

```bash
python -c "import json; d=json.load(open('src/data/kotoba.json',encoding='utf-8')); b=d['babs']; print('bab:',len(b),'total:',sum(len(x['items']) for x in b)); bad=[(x['bab'],max(i['no'] for i in x['items'])) for x in b if x['items'] and max(i['no'] for i in x['items'])!=len(x['items'])]; print('mismatch:', bad if bad else 'tidak ada')"
```

Harapan: **bab: 50, total: 2910, mismatch: tidak ada**. Setelahnya tetap jalankan
`python tools/build_data.py` agar file per bab ikut ter-update.

## Struktur Proyek

```
kotoba-app/
├─ index.html               # shell, Google Fonts, script anti-flash tema
├─ AGENTS.md                # dokumen ini
├─ vercel.json              # rewrite SPA
├─ .gitignore
├─ public/
│  ├─ favicon.svg           # kanji 言 sebagai path vektor (bukan <text>)
│  ├─ icon-192.png
│  ├─ icon-512.png
│  └─ icon-512-maskable.png # aman dari crop Android (safe-circle)
├─ scripts/gen_icons.py     # generator ikon (Pillow)
├─ tools/extract_pdf.py     # ekstraktor PDF → kotoba.json (PyMuPDF)
├─ tools/build_data.py      # kotoba.json → bab/*.json + index.json + search.json + romaji
├─ src/
│  ├─ main.tsx              # mount + initTheme()
│  ├─ App.tsx               # switch(route), pool data async + loading state
│  ├─ index.css             # CSS variables, base, components, utilities
│  ├─ types.ts              # Kotoba (no, kana, kanji, arti, romaji), Bab, KotobaWithBab
│  ├─ vite-env.d.ts         # deklarasi `import.meta.glob`
│  ├─ data/
│  │  ├─ index.ts           # API async: BABS_META, TOTAL_KOTOBA, useBab, useKotobaByBabs, useAllKotoba, useSearchIndex
│  │  ├─ index.json         # metadata 50 bab (2.1 KB) — import statis
│  │  ├─ search.json        # 2.910 entri tanpa romaji (356 KB) — lazy
│  │  ├─ kotoba.json        # sumber monolitik hasil ekstraksi PDF (523 KB)
│  │  └─ bab/01.json … 50.json  # 50 chunk per bab (±430 KB total) — lazy
│  ├─ lib/utils.ts          # shuffleArray, sampleN, normalize, artiVariants, isAnswerCorrect
│  ├─ lib/speech.ts         # useSpeech() — Web Speech API ja-JP + voice picker
│  ├─ store/
│  │  ├─ app.ts             # route + go() (TIDAK persist)
│  │  ├─ settings.ts        # selectedBabs, shuffle, viewMode (persist)
│  │  ├─ progress.ts        # hafal, stats (persist) + kataKey()
│  │  ├─ list.ts            # collapsed, visible, katakanaMode, query, filter, sort (persist)
│  │  └─ theme.ts           # light/dark/system (persist) + initTheme()
│  ├─ components/
│  │  ├─ Icon.tsx           # wrapper Iconify, tipe IconName = `ph:${string}`
│  │  ├─ HankoSeal.tsx      # cap merah Jepang (CSS shape, bukan font)
│  │  ├─ Button.tsx         # variant: ink|seal|ghost|quiet|accent
│  │  ├─ PaperCard.tsx      # k-card, props raised/tape/tilt/onClick
│  │  ├─ ProgressBar.tsx    # tone: ink|accent|seal|success|danger|warn
│  │  ├─ TopBar.tsx         # header sticky + tombol tema
│  │  ├─ KotobaTable.tsx    # tabel kosakata (colgroup + table-fixed + kolom audio)
│  │  ├─ BabAccordion.tsx   # satu blok bab: header + tabel, animasi buka/tutup
│  │  ├─ Controls.tsx       # Chip (toggle) + Segmented (radio, ←/→) yang dipakai bersama
│  │  ├─ ListControls.tsx   # panel kontrol List: bulk kolom, bulk 50 bab, kana, terpilih
│  │  └─ LoadingRows.tsx    # skeleton baris saat data dimuat
│  └─ pages/
│     ├─ Home.tsx           # hero, statistik, mode, pilih bab
│     ├─ Flashcard.tsx      # kartu flip 3D + baris kanji
│     ├─ QuizPG.tsx         # kuis pilihan ganda
│     ├─ QuizKetik.tsx      # kuis ketik jawaban
│     ├─ Search.tsx         # cari kana/kanji/arti (pakai search.json)
│     ├─ Progress.tsx       # statistik + reset
│     └─ List.tsx           # daftar lengkap per bab + cari/filter/sort/audio
└─ dist/                    # output build (jangan di-commit)
```

## Arsitektur

### Routing — tanpa react-router

Aplikasi **tidak memakai** `react-router`. Navigasi lewat Zustand: `useApp` menyimpan `route` bertipe `Route`, dan `App.tsx` melakukan `switch (route)`. `go(route)` sekaligus `window.scrollTo({ top: 0 })`.

Route (`src/store/app.ts`): `home`, `flashcard`, `quiz-pg`, `quiz-ketik`, `search`, `progress`, `list`.

Menambah halaman = tambah union type di `store/app.ts`, komponen di `src/pages/`, dan `case` di `App.tsx`. Tidak ada URL, history, atau deep-link.

`App.tsx` punya guard: masuk `flashcard` / `quiz-pg` / `quiz-ketik` sementara `selectedBabs` kosong → balik ke `home`. Mode yang butuh bab harus masuk array `needsBabs`.

### State & persistensi

Tiga store memakai middleware `persist` dari Zustand. Nama key `localStorage`:

| Store | File | Key `localStorage` | Isi |
| --- | --- | --- | --- |
| `useApp` | `store/app.ts` | — (tidak persist) | `route`, `go()` |
| `useSettings` | `store/settings.ts` | **`kotoba-settings`** | `selectedBabs` (default `[1]`), `shuffle` (default `true`), `viewMode` (`"kana-arti"`) + `setSelectedBabs`, `toggleBab`, `selectAll`, `clearBabs`, `setShuffle`, `setViewMode` |
| `useProgress` | `store/progress.ts` | **`kotoba-progress`** | `hafal: string[]`, `stats: Record<string, {benar, salah}>` + `toggleHafal`, `isHafal`, `recordAnswer`, `resetProgress` |
| `useTheme` | `store/theme.ts` | **`kotoba-theme`** | `theme: "light" \| "dark" \| "system"` + `setTheme`, `cycle`, `syncFromSystem` |
| `useList` | `store/list.ts` | **`kotoba-list`** | `collapsed` (default **semua 50 bab tertutup**), `visible` (kolom), `katakanaMode`, `focusBabs`, `query`, `onlyWithKanji`, `sortBy` + `toggleBab`, `expandAll`, `collapseAll`, `expandOnly`, `toggleCol`, `setCol`, `setCols` (bulk kolom), `showAllCols`, `resetCols`, `setKatakanaMode` |

Lima key itu satu-satunya yang dipakai aplikasi. `query` / `onlyWithKanji` /
`sortBy` ikut ter-persist, jadi pencarian yang belum dibersihkan akan tetap ada
saat aplikasi dibuka lagi. Kalau itu terasa mengganggu, pindahkan ketiga field
itu ke `partialize`/`omit` pada middleware `persist`.

`hafal` disimpan sebagai array of string (bukan `Set`) agar bisa di-serialize. Kunci unik kata dibuat `kataKey(bab, no)` → `` `${bab}-${no}` ``.

### Tema & Dark Mode

Strategi **class-based** (`darkMode: "class"` di `tailwind.config.js`). Semua warna didefinisikan sebagai CSS variable di `src/index.css`, jadi light/dark hanya dibedakan oleh satu kelas `dark` di `<html>`.

Flow:
1. Script inline di `index.html` (sebelum React mount) membaca `localStorage["kotoba-theme"]` dan menambah kelas `dark` lebih dulu — mencegah kilatan putih.
2. `initTheme()` di `main.tsx` memanggil `applyTheme()` untuk konsistenkan state.
3. `applyTheme()` toggle kelas `dark`, menambah kelas `theme-transition` sementara (300 ms) lalu membuangnya, dan menyinkronkan `<meta name="theme-color">`.
4. `matchMedia("(prefers-color-scheme: dark)")` di-listen; kalau `theme === "system"`, perubahan sistem otomatis diterapkan.
5. Tombol tema di `TopBar` meng-cycle `light → dark → system`.

**Menambah token warna baru:** tambahkan CSS variable `--c-nama` di blok `:root` DAN `.dark` di `src/index.css`, lalu daftarkan di `tailwind.config.js` sebagai `nama: "rgb(var(--c-nama) / <alpha-value>)"`. Bentuk `<alpha-value>` wajib dipertahankan supaya modifier opacity (`bg-ink/10`) berfungsi.

### Design tokens

17 token semantik, semua dark-mode-aware. Nilai hex di-tailwind tidak ada — semuanya via variable.

| Token | Light | Dark | Dipakai untuk |
| --- | --- | --- | --- |
| `bg` | #f4f0e6 | #101218 | Latar utama |
| `surface` | #fcfaf4 | #1a1d24 | Permukaan kartu |
| `raised` | #fffefa | #21252e | Permukaan lebih terang saat hover |
| `sunken` | #e4ddcc | #0c0e13 | Cekungan, track ProgressBar, badge |
| `ink` | #1b2d4a | #e9eef5 | Teks utama, aksen kuat |
| `ink-soft` | #4a678c | #a3b4ce | Teks sekunder |
| `body` | #3a352c | #d7dae0 | Teks paragraf |
| `muted` | #6e6657 | #9198a5 | Teks paling redup, label |
| `line` | #1b2d4a | #e9eef5 | Garis & border (selalu dengan /opacity) |
| `accent` | #b26a3a | #e2af6b | CTA, aksen hangat |
| `accent-soft` | #f0e3cd | #3b3123 | Latar aksen lembut |
| `seal` | #ba3f33 | #cd584b | Merah stempel hanko |
| `success` | #3a704f | #78c391 | Benar / sudah hafal |
| `success-soft` | #dbebdd | #1e3428 | Latar jawaban benar |
| `danger` | #b23a30 | #ee766a | Salah |
| `danger-soft` | #f7deda | #3a1e1c | Latar jawaban salah |
| `warn` | #be8a14 | #e6bd69 | Peringatan |

Nilai dark disetel ulang agar gelapnya **sumi**, bukan hitam pekat: `bg` #101218
bersifat hangat-kabut, bukan #000. Semua pasangan teks utama sudah diukur
lolos WCAG 2.2 AA (rasio ≥ 4.5:1 untuk teks kecil) di kedua tema — kalau
mengubah nilai token, ulangi pengukuran itu, jangan asal eyedropper.

**Token lama yang sudah DIHAPUS — jangan dipakai:** `paper`, `paper-dark`, `pencil`, `highlight`, `note-yellow`, `note-green`, `note-pink`, `note-blue`, `font-hand`, `font-body`, `shadow-paper`, `shadow-note`, `shadow-card`.

### Tipografi

| Role | Class | Font | Dipakai untuk |
| --- | --- | --- | --- |
| Display | `font-display` / `font-mincho` | **Shippori Mincho** (serif Jepang) | Kana/kanji besar, judul, angka besar, HankoSeal |
| Body | `font-sans` | **Manrope** | Body text, UI |
| Mono | `font-mono` | **IBM Plex Mono** | Eyebrow, label, angka tabular |
| Baca | `font-jp` | **Noto Sans JP** → Hiragino/Yu Gothic → system | Teks kana/kanji yang harus dibaca cepat (tabel, daftar) |

`font-display`, `font-mono`, dan `font-sans` dimuat dari Google Fonts di
`index.html`. `font-jp` juga memuat **Noto Sans JP** dari CDN, lalu jatuh ke
Hiragino/Yu Gothic sebelum `system-ui`.

Perbedaan penting: `font-display` (mincho) itu **hiasan** — untuk kanji besar
dan judul. `font-jp` (sans/meta) itu **fungsional** — untuk teks belajar di
dalam tabel. Mincho serif sulit dibaca cepat dalam ukuran kecil, jadi jangan
dipakai untuk isi tabel.

### Ikon

Iconify dengan koleksi Phosphor, **di-bundle lokal** (`@iconify-json/ph`) sehingga tetap tampil tanpa internet.

`src/components/Icon.tsx` mengekspor `IconName` bertipe template literal:

```ts
export type IconName = `ph:${string}`;
```

Semua pemakaian ikon wajib berawalan `ph:`. Tipe sengaja `string`, bukan union literal, supaya kolom ikon pada array data (mis. daftar mode di `Home.tsx`) tidak butuh `as const`.

Semua nama ikon yang dipakai, sudah diverifikasi ada di `@iconify-json/ph`
(34 ikon, dicek otomatis — lihat gotcha di bawah):

`ph:cards`, `ph:chart-bar`, `ph:shuffle`, `ph:arrow-right`, `ph:arrow-counter-clockwise`, `ph:caret-left`, `ph:caret-right`, `ph:check`, `ph:check-circle`, `ph:x`, `ph:x-circle`, `ph:star`, `ph:target`, `ph:keyboard`, `ph:magnifying-glass`, `ph:book-open`, `ph:seal-check`, `ph:trash`, `ph:notebook`, trio tema `ph:sun` / `ph:moon` / `ph:laptop` (di `TopBar`), plus `ph:square` / `ph:check-square` (pilih bab), `ph:text-t` (kolom teks), `ph:speaker-high` dan `ph:waveform` (audio), `ph:caret-down` (buka/tutup), dan `ph:funnel` (filter).

Cara cek nama ikon sebelum dipakai:

```bash
node -e "console.log(Object.keys(require('./node_modules/@iconify-json/ph/icons.json').icons).includes('cards'))"
```

Kalau `false`, ikon akan muncul sebagai kotak kosong.

### Data — lazy load per bab

Data 2.910 entri **tidak** di-bundle statis. `src/data/index.ts`sóleh
menyediakan metadata ringan (`index.json`, 2.1 KB) dan API async; sisanya
diambil saat dibutuhkan.

| Export | Bentuk | Kapan data diambil |
| --- | --- | --- |
| `BABS_META` | `{ bab, count }[]` (50) | selalu, dari `index.json` |
| `TOTAL_KOTOBA` | `number` (2.910) | selalu |
| `useBab(bab, enabled)` | `{ items, loading }` | saat `enabled` true (default true) |
| `useKotobaByBabs(list)` | `{ pool, loading }` | saat `App` render untuk mode latihan |
| `useAllKotoba()` | `{ all, loading }` | untuk halaman yang butuh seluruh bank kata |
| `useSearchIndex()` | `{ query, setQuery, results, loading }` | saat halaman `Search` dibuka |
| `getBabCached(bab)` | `Bab \| undefined` | sinkron, hanya untuk data yang sudah ter-cache |

Cara kerjanya:

- URL tiap file JSON diambil dengan `import.meta.glob("./bab/*.json", { query: "?url" })`.
  Plugin `?url` membuat Vite memindahkan JSON menjadi **file `.json` terpisah**,
  bukan potongan JS — itu yang memungkinkan data dikecualikan dari precache PWA.
- Isi diambil dengan `fetch()`, bukan `import()`, supaya tidak memblokir render.
- Hasil fetch disimpan di `Map` level modul (`cache`), jadi membuka bab yang
  sama dua kali tidak mengunduh ulang.
- `KotobaWithBab extends Kotoba { bab: number }` tetap dipakai karena model
  data asli tidak menyimpan asal kata, sedangkan mode latihan menggabungkan
  beberapa bab.

**Halaman yang hanya butuh jumlah kata tidak boleh memuat isi bab.** `Home`
(bar kemajuan hafalan) dan `Progress` (bar per bab) memakai `BABS_META` dan
menghitung dari awalan key `hafal` (`"${bab}-${no}"`), bukan dari isi bab.

### Audio pelafalan

`src/lib/speech.ts` membungkus Web Speech API:

```ts
const { supported, hasVoice, isSpeaking, voice, speak, stop } = useSpeech();
```

- `supported` = API browser ada **dan** pengecekan voice sudah selesai. Baut
  render berdasarkan `supported && hasVoice` — kalau hanya `supported`, tombol
  muncul sebelum voice terdeteksi lalu hilang sesaat.
- `hasVoice` = ada minimal satu voice `ja`. Tanpa ini tombolnya jadi tombol mati.
- `pickJapaneseVoice()` (diekspor, murni) memilih voice `ja-JP` kalau ada, lalu
  `ja-*` lain, dengan tie-break nama (`Kyoko`, `Otoya`, `Google`, `Microsoft`).
- `speak(text)` selalu `cancel()` dulu supaya tidak numpuk, `rate: 0.9`, dan
  dibungkus `try/catch` — tidak pernah melempar ke pemanggil.
- Daftar voice di-*poll* 400 ms selama 3 detik karena beberapa browser
  mengisinya terlambat tanpa event `voiceschanged`.

Tidak ada file audio statis — pelafalan dibuat on-demand oleh browser, jadi
tidak menambah ukuran bundel.

### Data & logika kuis

`src/data/index.ts` sudah tidak lagi mengekspor `BABS`/`ALL_KOTOBA` sinkron —
lihat bagian "Data — lazy load per bab" di atas.

`src/lib/utils.ts`:

| Fungsi | Perilaku | Dipakai di |
| --- | --- | --- |
| `shuffleArray` | Fisher-Yates, array baru, tidak memutasi input | Flashcard, QuizPG |
| `sampleN` | `shuffleArray(arr).slice(0, n)` | QuizPG, QuizKetik |
| `normalize` | lowercase + buang tanda baca CJK & latin, trim | Search, QuizPG, isAnswerCorrect |
| `artiVariants` | pecah arti jadi alternatif (split koma/slash/titik) | isAnswerCorrect |
| `isAnswerCorrect` | mode `kana-arti`: cocok ke varian arti; mode `arti-kana`: cocok persis ke kana atau kanji | QuizKetik |`isAnswerCorrect` memakai `includes` dua arah, jadi mengetik sebagian kata tetap dianggap benar. Itu disengaja.

Kedua mode kuis memakai `const QUIZ_LEN = 10`.

### PWA

`VitePWA` di `vite.config.ts`, `registerType: "autoUpdate"`, `includeAssets: ["favicon.svg"]`. Manifest inline di config: `name: "Kotoba - Hafalan Minna no Nihongo"`, `short_name: "Kotoba"`, `display: "standalone"`, `orientation: "portrait"`, `theme_color`, `background_color`, ikon 192/512 plus varian maskable.

Blok `workbox` sengaja mengatur `globPatterns` hanya untuk aset aplikasi
(`js, css, html, svg, png, ico, webmanifest`) sehingga **50 chunk data + search
index tidak ikut di-precache**. Kalau semuanya ikut ter-precache, service worker
akan mengunduh ±780 KB saat instalasi dan seluruh usaha lazy-load jadi sia-sia.

Sebagai gantinya, file `.json` ditangani `runtimeCaching` dengan
`StaleWhileRevalidate` + `expiration` (60 entri, 90 hari): chunk yang pernah
dibuka tetap bisa diakses offline, dan tidak diunduh sebelum benar-benar perlu.

Ukuran saat ini:

| Aset | Mentah | gzip |
| --- | --- | --- |
| `assets/index-*.js` | ~236 KB | **~73 KB** |
| `assets/index-*.css` | ~33 KB | ~7 KB |
| `assets/bab/NN.json` (50 file) | ~430 KB total | ~1,2–1,8 KB each |
| `assets/search-*.json` | ~356 KB | ~61 KB |
| precache service worker | 14 entri | ~293 KB |

Sebelum pemecahan data, bundle JS adalah ~494 KB / **~142 KB** gzip. Angka itu
yang tertulis di catatan lama — jangan pakai lagi sebagai acuan.

## Fitur

- **Home** — Hero dengan kanji 「言葉」 88px + HankoSeal, baris statistik (total kata / bab / dihafal), kartu mode (2 utama + 3 pendukung), grid pilih bab 1–50, toggle urutan acak, bar kemajuan hafalan.
- **Flashcard** — Kartu flip 3D. Tap / Enter / Space untuk membalik. Teks **benar-benar center** (horizontal & vertikal); hint "ketuk untuk membalik" diposisikan absolute di bawah agar tidak menggeser teks utama. Baris kanji tampil bila `card.kanji` terisi, dengan label mono "Kanji", dan dilewati kalau isinya sama dengan teks utama. Tombol ☆/✓ menandai hafal. Arah kartu mengikuti `viewMode`.
- **QuizPG** — 10 soal, 4 opsi berlabel A/B/C/D, 3 pengecoh dari seluruh bank kata. Opsi benar jadi `success-soft` + centang, salah dipilih jadi `danger-soft` + cross, sisanya redup. Panel feedback `role="status"`. Ringkasan akhir + daftar "Perlu diulang". Skor 100% dapat HankoSeal 「満」.
- **QuizKetik** — 10 soal, user mengetik jawaban. Memakai `<form onSubmit>` + tombol `type="submit"` (tekan Enter berfungsi) — **jangan diubah jadi onClick**. Menampilkan jawaban user vs jawaban benar saat salah. Ringkasan + HankoSeal 「満」 kalau sempurna.
- **Search** — Pencarian live di `search.json` (kana, kanji, atau arti), maks 120 hasil, badge "bab N", tombol hafal per hasil, dua empty state. Index-nya sendiri dimuat saat halaman dibuka, dengan state loading.
- **Progress** — Statistik besar (sudah dihafal, benar, salah, akurasi), bar per bab (50 bab, dua kolom di desktop), tombol reset dengan konfirmasi dua langkah. Empty state yang hangat kalau belum ada progres.
- **List** (`route: list`,dibuka dari Home "Daftar") — Daftar lengkap 2.910 kata, **satu tabel per bab** (50 blok), masing-masing bisa dibuka/tutup. Kolom: No / Hiragana / Katakana / Romaji / Kanji / Arti, plus tombol audio di setiap baris.
  - Pencarian live di 4 field (kana, kanji, romaji, arti) + filter "hanya yang punya kanji" + sortir per bab / abjad romaji, dengan hitungan "N dari M" dan tombol bersihkan.
  - Bab tanpa hasil otomatis disembunyikan; **saat searching/filtering tabel dipaksa terbuka** walau babnya tertutup, karena kalau tidak hasil pencarian tidak terlihat sama sekali.
  - Tampilan dibungkus `overflow-x-auto` dengan `min-width`, jadi di iPhone tabel bisa di-scroll mendatar tanpa membuat halaman ikut melebar.
  - Kolom bisa dimunculkan/dihilangkan per kolom, dan lebar tiap kolom dipatuhi lewat `<colgroup>` + `table-layout: fixed`.
  - Kontrol dipecah jadi `ListControls.tsx` dengan hierarchy: aksi utama (Buka/Tutup semua **kolom**) memakai tombol pekat, sisanya chip/segmented/outline. Panel sengaja dibuat compact — bukan kartu besar berisi kartu-kartu kecil.
  - **"Buka semua / Tutup semua" itu untuk KOLOM, bukan untuk 50 bab.** "Tutup semua" menyembunyikan 4 kolom isi — `kana`, `romaji`, `kanji`, `arti` — sehingga tabel tetap punya kolom `No` sebagai jangkar. Kontrol untuk 50 bab karena itu berlabel eksplisit **"Buka semua bab" / "Tutup semua bab"**. Jangan tukar lagi dua kelompok tombol ini; sempat tertukar dan jadi ambigu.
  - `disabled` pada "Buka semua" dihitung dari **semua** kolom chip (termasuk Katakana), bukan hanya 4 kolom utama. Kalau hanya cek 4 kolom utama, tombol mati padahal Kolom masih ada yang belum tampil.
  - Kolom Romaji **tidak** punya lebar px tetap: ia memakai sisa ruang (`0`) agar kolom Arti yang paling memerlukan ruang tetap lega di layar lebar.

## Sistem Desain

Dua mode, satu bahasa visual:

- **Light (*washi*)** — kertas hangat, garis buku tulis halus tiap 32px, margin merah, kartu dengan tepi seperti serat kertas.
- **Dark (*sumi*)** — tinta pekat, garis tetap ada tapi jauh lebih redup, bayangan lebih dalam.

Elemen signature adalah **HankoSeal** — cap merah Jepang (印章) yang muncul dengan animasi `stamp-in` saat kata ditandai hafal, di skor kuis sempurna, dan sebagai ornamen di Home. Bentuknya digambar dengan CSS (`rounded-[28%]` + `bg-seal` + cincin dalam), **bukan glyph font**, sehingga konsisten di semua perangkat.

Utilitas CSS kustom di `src/index.css` (layer `@layer components` dan `@layer utilities`) — **bukan Tailwind, jangan ditulis ulang sebagai Tailwind**:

| Utilitas | Fungsi |
| --- | --- |
| `.k-card` / `.k-card-raised` | Permukaan kartu + bayangan |
| `.k-margin` | Garis merah margin buku tulis via `::before` |
| `.k-eyebrow` | Label kecil mono uppercase |
| `.k-num` | Angka tabular (`font-variant-numeric`) |
| `.k-underline` | Garis bawah seperti stabilo |
| `.k-chip` / `.k-chip-on` / `.k-chip-off` | Tombol pil untuk toggle (state aktif = latar pekat + centang, bukan cuma warna) |
| `.k-seg` / `.k-seg-item` / `.k-seg-on` | Segmented control `role="radio"`, keyboard ←/→ |
| `.k-collapse` / `.k-collapse-open` | Accordion via `grid-template-rows: 0fr → 1fr` (transisi height tanpa JS) |
| `.k-rownum` / `.k-kana` / `.k-kanji` / `.k-romaji` / `.k-arti` | Hierarchy tipografi kolom tabel (16.5 / 15.5 / 12.5 / 14 px) |
| `.k-icon-round` | Penanda tombol ikon bulat — dipakai agar aturan target sentuh 44px bisa mengecualikan tabel |
| `.writing-vertical` | `writing-mode: vertical-rl` — **terdefinisi tapi belum dipakai** di `src/` |
| `.scroll-slim` | Scrollbar tipis |
| `.flip-perspective` / `.flip-inner` / `.flip-face` / `.flip-back` | Kartu flip 3D |
| `.theme-transition` | Transisi warna halus saat ganti tema |

Keyframes Tailwind: `stamp-in`, `fade-rise`, `ink-spread`, `draw-line`. Yang benar-benar terpakai baru `stamp-in` dan `fade-rise` — `ink-spread` & `draw-line` terdefinisi tapi belum dipakai. Reduced motion dihormati lewat media query global.

### Untuk agent yang edit JSX

Kelas dengan warna/font kustom (`bg-paper`, `text-ink`, `text-ink-soft`, `bg-surface`, `font-display`, `shadow-soft`) **tidak akan dikenali Tailwind IntelliSense**. Itu normal dan disengaja. **Jangan "memperbaiki"** menjadi nama warna default Tailwind (`bg-blue-100`, `text-gray-500`) — kontras dan identitas visual akan rusak.

## Deployment (Vercel)

`vercel.json` hanya berisi rewrite SPA:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

Rewrite wajib karena aplikasi tidak punya routing berbasis path — semua halaman dari satu `index.html`. Output build = **`dist/`**; preset Vite di Vercel mengenali ini otomatis.

```bash
vercel                    # preview
vercel --prod             # production
```

Untuk auto-build per push, hubungkan repo di dashboard Vercel. Pastikan `node_modules` dan `dist` tidak ikut ter-commit (`.gitignore` sudah menutup keduanya, termasuk `*.tsbuildinfo`, `dev.pid`, `__pycache__/`).

**Progres bersifat per-browser/per-device.** Tidak ada sinkronisasi. Mengganti browser atau menghapus site data akan menghapus progres.

## Gotcha & Perhatian

- **`npm run build` adalah satu-satunya verifikasi.** Script-nya `tsc -b && vite build`, jadi error TypeScript menggagalkan build sebelum bundling. Tidak ada `lint`/`test`/`typecheck`.
- **`noUnusedLocals` dan `noUnusedParameters` = true** di `tsconfig.json`. Import, variabel, atau parameter tak terpakai akan menggagalkan build.
- **Jangan hardcode warna.** Hex, `bg-white`, `text-black`, `text-gray-*`, `bg-blue-*` bikin dark mode rusak. Selalu pakai token semantik.
- **Token lama sudah dihapus:** `paper`, `paper-dark`, `pencil`, `highlight`, `note-*`, `font-hand`, `font-body`, `shadow-paper/note/card`.
- **Kana/kanji besar wajib `font-display`.** Jangan pakai `font-sans` untuk teks Jepang besar.
- **Nama ikon harus berawalan `ph:` dan benar-benar ada** di `@iconify-json/ph`, kalau tidak muncul kotak kosong. Verifikasi seluruh ikon sekaligus (bukan satu per satu):
  ```bash
  python -c "import io,glob,re,json; s=set(); [s.update(re.findall(r'\"(ph:[a-z0-9-]+)\"', io.open(f,encoding='utf-8').read())) for f in glob.glob('src/**/*.tsx',recursive=True)]; a=set(json.load(io.open('node_modules/@iconify-json/ph/icons.json',encoding='utf-8'))['icons']); print([i for i in sorted(s) if i.split(':')[1] not in a] or 'semua ikon ada')"
  ```
  Nama yang pernah salah dan menghasilkan kotak kosong: `ph:speaker-simple` (yang benar `ph:speaker-high` atau `ph:waveform`) dan `ph:ideogram` (yang benar `ph:text-t`).
- **HankoSeal memakai CSS shape, bukan glyph font** — jangan diubah jadi teks kanji, supaya tidak bergantung font.
- **Posisi teks di flashcard:** hint di-`absolute bottom`, konten di dalam wrapper `flex-1 justify-center`. Kalau hint dipasang sebagai elemen flow (mis. dengan `mt-auto`), seluruh teks tergeser ke atas — ini bug yang sudah pernah terjadi.
- **Baris kanji hanya tampil bila `kanji` terisi.** 951 dari 2.910 entri memang tanpa kanji. Kalau ingin kanji selalu ada, itu perubahan data, bukan UI.
- **`QuizKetik` memakai `<form onSubmit>` + `type="submit"`.** Mengubahnya ke `onClick` mematikan submit tekan Enter.
- **`getKotobaByBabs` sudah tidak ada.** API data sekarang berbasis hook (`useKotobaByBabs`, `useBab`, `useSearchIndex`). Fungsi async tidak boleh dipanggil langsung di badan render — harus lewat hook, kalau tidak akan renderloop.
- **Flashcard & kuis hanya menerima `pool` setelah siap.** `App.tsx` memanggil `useKotobaByBabs(selectedBabs)` dan menampilkan `Frame` + `LoadingRows` selama `loading`, jadi halaman anak baru dirender setelah `pool` tersedia. Jangan diubah supaya halaman anak ikut di-render saat `pool` masih kosong.
- **Data JSON tidak lagi di-bundle statis.** Kalau butuh menambah data, jalankan `python tools/build_data.py` — jangan mengexport langsung dari `kotoba.json` di `src/data/index.ts`, karena itu membatalkan lazy-load dan menaikkan bundle ±70 KB gzip.
- **`useBab(bab, enabled)`** — kalau tabel sedang tidak tampil, teruskan `enabled: false` supaya chunk tidak diunduh. Kalau `enabled` selalu `true`, 50 file terambil begitu halaman List dibuka.
- **Pencarian di List memuat banyak chunk.** Mengetik di kotak cari mengaktifkan `showTable` untuk semua bab, jadi loader ikut mengambil hampir 50 file. Ini perilaku yang diharapkan (pencarian harus lintas bab), tapi jangan dianggap bug.
- **`table-layout: fixed` harus dipakai bersama `<colgroup>`.** `table-fixed` tanpa `colgroup` membuat browser membagi rata seluruh lebar — itu penyebab kolom "No" berisi 1–2 digit menyisakan ruang kosong ±180px. Sebaliknya, `table-auto` **mengabaikan** `width` di `<col>`, jadi lebar yang ditulis tidak dipatuhi. Kombinasi yang benar: `style={{ tableLayout: "fixed" }}` + `<colgroup>` berisi `width` px.
- **Opacity di dalam `@apply` harus pakai skala default Tailwind.** `border-line/25` jalan, tapi `border-line/12` atau `/18` **gagal build** (`The class does not exist`). Tulis bracket: `border-line/[0.12]`. Aturan yang sama berlaku untuk class string di JSX.
- **Accordion harus meng-unmount isi saat tertutup.** Kalau isi hanya dipotong dengan `grid-template-rows: 0fr`, seluruh baris bab yang pernah dibuka tetap ada di DOM — setelah "Buka semua" itu 2.910 `<tr>` yang tidak terlihat tapi tetap di-memory. Pola yang dipakai `BabAccordion.tsx`: `mounted` state + `setTimeout(280ms)` mengikuti `open`. Data tetap aman karena `useBab` menyimpan cache modul, jadi membuka lagi instan.
- **Target sentuh minimal 44px di perangkat sentuh.** Ada aturan global `@media (pointer: coarse)` di `src/index.css` yang menaikkan `min-height` semua `button` dan `[role="radio"]`. Tombol audio di dalam tabel dikecualikan lewat `aria-label^="Dengarkan"` supaya tinggi baris tetap padat.
- **Kolom yang disembunyikan harus ikut hilang dari `<colgroup>`,** kalau tidak lebarnya tidak terpakai dan tabel melebar.
- **Tombol audio hanya dirender kalau `speech.supported && speech.hasVoice`.** Kalau hanya `supported`, tombol muncul sebelum voice terdeteksi lalu hilang sesaat. Di browser tanpa voice `ja` (mis. Firefox sebagian), tombol harus disembunyikan, bukan ditampilkan mati.
- **Tidak ada aset audio.** Pelafalan dibuat Web Speech API saat runtime — jangan tambahkan file mp3 untuk mempercepat, itu langsung menambah ukuran repo dan bundel.
- **`pykakasi` harus terpasang** untuk `tools/build_data.py` mengisi `romaji`. Bukan dependency `package.json`, jadi `pip install pykakasi` setiap environment baru.
- **`selectAll()` memakai `Array.from({ length: 50 })`** dan UI menampilkan "1–50". Kalau dataset berubah, keduanya harus diubah bersamaan.
- **Jangan pakai `cd` di command shell**; pakai working directory. Path mengandung spasi — selalu kutip.
- **Jangan commit `node_modules`, `dist`, `*.log`, `*.tsbuildinfo`, `dev.pid`, `__pycache__`.**
- **Jangan hapus `src/data/kotoba.json`** saat scaffold ulang. Regenerasinya mahal dan tidak ada salinan di dalam repo.
- **`index.html` mengaktifkan `user-scalable=no`.** Keputusan sadar untuk mencegah zoom saat mengetik kuis. Hati-hati mengubahnya.
- **Service worker bisa menahan cache** setelah build + preview. `registerType: "autoUpdate"` sudah ada, tapi tetap lakukan hard-reload saat dev.
- **Google Fonts dimuat via CDN** — butuh internet untuk Shippori Mincho/Manrope/IBM Plex Mono. Offline, font jatuh ke fallback.

## Task yang Tersedia

Belum ada. Propose dulu ke user.
