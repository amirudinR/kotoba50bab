"""Bangun file data aplikasi dari satu sumber JSON hasil ekstraksi PDF.

Membaca ``src/data/kotoba.json`` (output ``tools/extract_pdf.py``), lalu
menghasilkan:

* ``src/data/bab/NN.json``  — satu bab penuh, lengkap dengan ``romaji``
* ``src/data/index.json``   — metadata ringan (bab + jumlah kata)
* ``src/data/search.json``  — seluruh entri TANPA romaji, untuk pencarian saja

Pecah per bab supaya aplikasi bisa memuat data saat dibutuhkan (lazy load)
alih-alih mengunduh semua 2.910 kata di awal.

Jalankan ulang setiap kali ``kotoba.json`` berubah::

    python tools/build_data.py

Butuh ``pykakasi`` untuk mengisi ``romaji``. Kalau belum terpasang::

    pip install pykakasi
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src" / "data"
SOURCE = SRC / "kotoba.json"
BAB_DIR = SRC / "bab"
INDEX = SRC / "index.json"
SEARCH = SRC / "search.json"


def build_romaji(kana_list: list[str]) -> dict[str, str]:
    """Petakan kana -> romaji. Semua kana unik dikonversi sekali."""
    try:
        from pykakasi import Kakasi
    except ImportError:
        print(
            "pykakasi tidak terpasang -> field romaji kosong.\n"
            "Pasang dulu:  pip install pykakasi",
            file=sys.stderr,
        )
        return {}

    conv = Kakasi().convert
    out: dict[str, str] = {}
    for text in dict.fromkeys(k for k in kana_list if k):
        out[text] = "".join(t["hepburn"] for t in conv(text)).strip()
    return out


def main() -> int:
    if not SOURCE.exists():
        print(f"sumber tidak ditemukan: {SOURCE}", file=sys.stderr)
        return 1

    data = json.loads(SOURCE.read_text(encoding="utf-8"))
    babs = data["babs"]

    romaji = build_romaji([i["kana"] for b in babs for i in b["items"]])

    BAB_DIR.mkdir(parents=True, exist_ok=True)
    for old in BAB_DIR.glob("*.json"):
        old.unlink()

    index = []
    for b in babs:
        items = []
        for it in b["items"]:
            row = {
                "no": it["no"],
                "kana": it["kana"],
                "kanji": it.get("kanji", ""),
                "arti": it.get("arti", ""),
                "romaji": it.get("romaji") or romaji.get(it["kana"], ""),
            }
            items.append(row)

        (BAB_DIR / f"{b['bab']:02d}.json").write_text(
            json.dumps({"bab": b["bab"], "items": items}, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        index.append({"bab": b["bab"], "count": len(items)})

    flat = [
        {
            "bab": b["bab"],
            "no": it["no"],
            "kana": it["kana"],
            "kanji": it.get("kanji", ""),
            "arti": it.get("arti", ""),
        }
        for b in babs
        for it in b["items"]
    ]

    INDEX.write_text(json.dumps(index, ensure_ascii=False, indent=2), encoding="utf-8")
    SEARCH.write_text(json.dumps(flat, ensure_ascii=False, indent=2), encoding="utf-8")

    tanpa = sum(1 for i in flat if not i["romaji"]) if "romaji" in flat[0] else 0
    total = sum(x["count"] for x in index)
    print(f"bab     : {len(index)}")
    print(f"entri   : {total}")
    print(f"romaji  : {len(romaji)} kana unik")
    print(f"bab/    : {len(list(BAB_DIR.glob('*.json')))} file")

    # Validasi: nomor entri harus berurutan 1..n di tiap bab.
    salah = []
    for b in babs:
        n = len(b["items"])
        if b["items"] and max(i["no"] for i in b["items"]) != n:
            salah.append(b["bab"])
    print(
        "nomor entri :", f"babi {salah}" if salah else "berurutan (tidak ada mismatch)"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
