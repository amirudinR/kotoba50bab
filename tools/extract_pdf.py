# -*- coding: utf-8 -*-
"""
Ekstrak kosakata Minna no Nihongo bab 1-50 dari PDF ke JSON terstruktur.

Struktur PDF: setiap bab berisi tabel dengan kolom:
    番号 (nomor) | 日本語 (kana) | 漢字 (kanji) | インドネシア語 (arti)

Teks PDF ter-ekstrak baris demi baris, jadi kita pakai state machine:
  - "BAB N"                     -> mulai bab baru
  - baris hanya angka           -> nomor entri baru
  - setelah nomor: kana, (kanji opsional/kosong), lalu arti (bisa multi-baris)

Kompleksitas yang ditangani:
  - Nomor halaman (footer "By: Agus Hinji" + angka) harus dibuang.
  - Label "BAB N" tidak boleh ikut terbaca sebagai kana.
  - Arti panjang yang terpecah ke beberapa baris digabung.
  - Ukuran satu bab bisa > 1 halaman, dan satu halaman bisa memuat 2 bab.
"""

import fitz  # PyMuPDF
import json
import re
import sys
import os

PDF_PATH = (
    sys.argv[1] if len(sys.argv) > 1 else "kotoba minna no nihonggo bab 1-50-1.pdf"
)
OUT_PATH = sys.argv[2] if len(sys.argv) > 2 else "src/data/kotoba.json"

FOOTER_RE = re.compile(r"^By:\s*Agus\s*Hinji", re.IGNORECASE)
# Header tabel selalu muncul berurutan sebagai 4 baris ini.
HEADER_SEQ = ("番号", "日本語", "漢字", "インドネシア語")
BAB_RE = re.compile(r"^BAB\s+(\d+)\s*$")
NUM_RE = re.compile(r"^\d+$")


def is_noise(line: str) -> bool:
    """True untuk baris yang pasti bukan data (judul besar/footer).

    Catatan: kata seperti 日本語 / 漢字 bisa jadi bagian dari header tabel
    SEKALIGUS kanji kosakata, jadi TIDAK dihapus di sini. Header tabel
    dihapus sebagai satu rangkaian (lihat strip_header_rows).
    """
    s = line.strip()
    if not s:
        return False  # baris kosong tetap dipakai sebagai penanda kanji kosong
    if FOOTER_RE.match(s):
        return True
    if s.startswith("みんなのにほんご"):
        return True
    if "だい１か" in s or "だい50か" in s:
        return True
    return False


def strip_header_rows(lines):
    """Hapus baris header tabel (番号/日本語/漢字/インドネシア語) hanya ketika
    muncul sebagai rangkaian 4 baris berurutan."""
    out = []
    i = 0
    n = len(lines)
    while i < n:
        if (
            i + 3 < n
            and lines[i].strip() == HEADER_SEQ[0]
            and lines[i + 1].strip() == HEADER_SEQ[1]
            and lines[i + 2].strip() == HEADER_SEQ[2]
            and lines[i + 3].strip() == HEADER_SEQ[3]
        ):
            i += 4
            continue
        out.append(lines[i])
        i += 1
    return out


def extract_lines(doc):
    """Ambil baris teks per halaman, buang noise, dan buang nomor halaman."""
    out = []
    for pno, page in enumerate(doc):
        page_no_str = str(pno + 1)
        raw_lines = [l.rstrip() for l in page.get_text().split("\n")]

        # Nomor halaman muncul sebagai angka tunggal di baris yang sama
        # atau berdekatan dengan footer "By: Agus Hinji". Kita tandai indeks
        # baris yang berisi footer, lalu angka tepat sebelum/sesudahnya dibuang.
        footer_idx = [i for i, l in enumerate(raw_lines) if FOOTER_RE.match(l.strip())]
        drop = set()
        for fi in footer_idx:
            for di in (fi, fi - 1, fi + 1, fi - 2, fi + 2):
                if 0 <= di < len(raw_lines):
                    if raw_lines[di].strip() == page_no_str:
                        drop.add(di)

        for i, l in enumerate(raw_lines):
            if i in drop:
                continue
            if is_noise(l):
                continue
            out.append(l)
    return strip_header_rows(out)


def parse(lines):
    babs = []
    current_bab = None
    i = 0
    n = len(lines)

    def flush_bab():
        nonlocal current_bab
        if current_bab is not None:
            current_bab["items"] = [it for it in current_bab["items"] if it.get("kana")]
            babs.append(current_bab)
        current_bab = None

    while i < n:
        s = lines[i].strip()

        m_bab = BAB_RE.match(s)
        if m_bab:
            flush_bab()
            current_bab = {"bab": int(m_bab.group(1)), "items": []}
            i += 1
            continue

        # hanya mulai entri jika sedang di dalam bab
        if current_bab is not None and NUM_RE.match(s):
            no = int(s)
            i += 1

            # kana: baris non-kosong berikutnya, tapi JANGAN ambil label BAB
            kana = ""
            while i < n and lines[i].strip() == "":
                i += 1
            if i < n and not BAB_RE.match(lines[i].strip()):
                kana = lines[i].strip()
                i += 1

            # kanji: baris berikutnya; kosong jika baris kosong atau label BAB
            kanji = ""
            if i < n and lines[i].strip() == "":
                i += 1
            elif i < n:
                nxt = lines[i].strip()
                if NUM_RE.match(nxt) or BAB_RE.match(nxt):
                    kanji = ""
                else:
                    kanji = nxt
                    i += 1

            # arti: gabung baris sampai nomor / BAB berikutnya
            arti_parts = []
            while i < n:
                nxt = lines[i].strip()
                if NUM_RE.match(nxt) or BAB_RE.match(nxt):
                    break
                arti_parts.append(nxt)
                i += 1

            arti = re.sub(r"\s+", " ", " ".join(p for p in arti_parts if p)).strip()

            if kana:
                current_bab["items"].append(
                    {"no": no, "kana": kana, "kanji": kanji, "arti": arti}
                )
            continue

        i += 1

    flush_bab()
    return babs


def main():
    if not os.path.exists(PDF_PATH):
        print(f"ERROR: PDF tidak ditemukan: {PDF_PATH}")
        sys.exit(1)

    doc = fitz.open(PDF_PATH)
    lines = extract_lines(doc)
    babs = parse(lines)

    total = sum(len(b["items"]) for b in babs)
    print(f"Total bab: {len(babs)}")
    print(f"Total kosakata: {total}")

    found = {b["bab"] for b in babs}
    missing = sorted(set(range(1, 51)) - found)
    if missing:
        print("PERINGATAN bab hilang:", missing)

    os.makedirs(os.path.dirname(OUT_PATH) or ".", exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump({"babs": babs}, f, ensure_ascii=False, indent=2)
    print(f"Ditulis ke: {OUT_PATH}")


if __name__ == "__main__":
    main()
