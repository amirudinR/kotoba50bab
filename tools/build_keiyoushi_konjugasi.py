# -*- coding: utf-8 -*-
"""Bangun src/data/keiyoushi_konjugasi.ts dari src/data/keiyoushi.ts.

Menambahkan 8 bentuk konjugasi (kasual & formal, positif/negatif x kini/lampau)
+ bentuk atributif na-adjektiva. Jalankan ulang setiap kali keiyoushi.ts berubah:

    python tools/build_keiyoushi_konjugasi.py

Aturan kasual:
  i-adj :  ~い -> ~かった / ~くない / ~くなかった
  na-adj:  ~   -> ~だ / ~だった / ~じゃない / ~じゃなかった  (atributif: ~な)
  Khusus:  いい -> いい / よかった / よくない / よくなかった  (juga よい, かっこいい)

Aturan formal (sopan, +です):
  i-adj :  bentuk kasual + です
  na-adj:  ~です / ~でした / ~じゃないです / ~じゃなかったです
  Khusus:  mengikuti bentuk kasual tidak beraturan + です

Negatif formal versi tambahan (hanya na-adj):
  na-adj:  ~じゃありません / ~じゃありませんでした  (variasi sopan)
           ~ではありません / ~ではありませんでした  (lebih formal/tulis)
  i-adj :  kosong (tidak punya bentuk ini)
"""

import io, os, re, json

# Path relatif ke root proyek (folder tempat script ini berada/.. )
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "src", "data", "keiyoushi.ts")
OUT = os.path.join(ROOT, "src", "data", "keiyoushi_konjugasi.ts")

# Bentuk tak beraturan: kana -> (posKini, posLampau, negKini, negLampau)
IRREGULAR = {
    "いい": ("いい", "よかった", "よくない", "よくなかった"),
    "よい": ("よい", "よかった", "よくない", "よくなかった"),
    "かっこいい": (
        "かっこいい",
        "かっこよかった",
        "かっこよくない",
        "かっこよくなかった",
    ),
}


def konjugasi(kana, kind):
    """Bentuk kasual: (posKini, posLampau, negKini, negLampau)."""
    if kana in IRREGULAR:
        return IRREGULAR[kana]
    if kind == "na":
        return (kana + "だ", kana + "だった", kana + "じゃない", kana + "じゃなかった")
    if kana.endswith("い"):
        stem = kana[:-1]
        return (kana, stem + "かった", stem + "くない", stem + "くなかった")
    return (kana, kana, kana, kana)


def konjugasi_formal(kana, kind):
    """Bentuk formal/sopan (+です): (posKini, posLampau, negKini, negLampau)."""
    if kind == "na":
        return (
            kana + "です",
            kana + "でした",
            kana + "じゃないです",
            kana + "じゃなかったです",
        )
    # i-adj (termasuk tidak beraturan): bentuk kasual + です
    pk, pl, nk, nl = konjugasi(kana, kind)
    return (pk + "です", pl + "です", nk + "です", nl + "です")


def konjugasi_formal2(kana, kind):
    """Negatif formal alternatif versi sopan: (negKini, negLampau).

    - na-adj: ~じゃありません / ~じゃありませんでした
    - i-adj : ~くありません / ~くありませんでした
              (dibentuk dari negatif kasual: ganti akhiran ない -> ありません,
               jadi いい -> よくない -> よくありません, benar untuk kata tak beraturan)
    """
    if kind == "na":
        return (kana + "じゃありません", kana + "じゃありませんでした")
    # i-adj: pakai basis negatif kasual (menangani いい -> よくない)
    nk, nl = konjugasi(kana, kind)[2], konjugasi(kana, kind)[3]
    if nk.endswith("ない") and nl.endswith("なかった"):
        return (nk[:-2] + "ありません", nl[:-4] + "ありませんでした")
    return ("", "")


def konjugasi_formal3(kana, kind):
    """Negatif formal alternatif (ではありません): (negKini, negLampau).

    Hanya untuk na-adj. i-adj -> ("", "").
    """
    if kind != "na":
        return ("", "")
    return (kana + "ではありません", kana + "ではありませんでした")


def js(s):
    return json.dumps(s, ensure_ascii=False)


def main():
    text = io.open(SRC, encoding="utf-8").read()
    pat = re.compile(
        r'\{\s*bab:\s*(\d+),\s*no:\s*(\d+),\s*kana:\s*"([^"]*)",\s*kanji:\s*"([^"]*)",'
        r'\s*arti:\s*"((?:[^"\\]|\\.)*)",\s*kind:\s*"(na|i)"\s*\}'
    )
    rows = pat.findall(text)
    print("entries ditemukan:", len(rows))

    L = []
    L.append(
        "// Bentuk konjugasi kata sifat (keiyoushi): kasual & formal, positif/negatif, kini/lampau."
    )
    L.append(
        "// FILE GENERATE — jangan diedit per baris. Sumber: src/data/keiyoushi.ts"
    )
    L.append("// Jalankan: python tools/build_keiyoushi_konjugasi.py")
    L.append("//")
    L.append("// Aturan kasual:")
    L.append("//   i-adj :  ~い -> ~かった / ~くない / ~くなかった")
    L.append(
        "//   na-adj:  ~   -> ~だ / ~だった / ~じゃない / ~じゃなかった (atributif: ~な)"
    )
    L.append(
        "//   Khusus:  いい -> よかった / よくない / よくなかった (tidak beraturan)"
    )
    L.append("// Aturan formal (+です):")
    L.append("//   i-adj :  bentuk kasual + です")
    L.append("//   na-adj:  ~です / ~でした / ~じゃないです / ~じゃなかったです")
    L.append("// Negatif formal versi tambahan (na-adj saja):")
    L.append("//   ~じゃありません / ~じゃありませんでした")
    L.append("//   ~ではありません / ~ではありませんでした")
    L.append("")
    L.append('import type { KeiyoushiKind } from "./keiyoushi";')
    L.append("")
    L.append("export interface KeiyoushiBentuk {")
    L.append("  bab: number;")
    L.append("  no: number;")
    L.append("  kana: string;")
    L.append('  /** Bentuk atributif na-adj (mis. "げんきな"); kosong untuk i-adj. */')
    L.append("  attributif: string;")
    L.append("  kanji: string;")
    L.append("  arti: string;")
    L.append("  kind: KeiyoushiKind;")
    L.append("  positifKini: string;")
    L.append("  positifLampau: string;")
    L.append("  negatifKini: string;")
    L.append("  negatifLampau: string;")
    L.append("  formalPositifKini: string;")
    L.append("  formalPositifLampau: string;")
    L.append("  formalNegatifKini: string;")
    L.append("  formalNegatifLampau: string;")
    L.append(
        '  /** Negatif formal alt. "じゃありません" (na-adj saja; kosong untuk i-adj). */'
    )
    L.append("  formalNegatif2Kini: string;")
    L.append("  formalNegatif2Lampau: string;")
    L.append(
        '  /** Negatif formal alt. "ではありません" (na-adj saja; kosong untuk i-adj). */'
    )
    L.append("  formalNegatif3Kini: string;")
    L.append("  formalNegatif3Lampau: string;")
    L.append("}")
    L.append("")
    L.append("export const KEIYOUSHI_BENTUK: KeiyoushiBentuk[] = [")

    n_na = n_i = 0
    for bab, no, kana, kanji, arti, kind in rows:
        pk, pl, nk, nl = konjugasi(kana, kind)
        fpk, fpl, fnk, fnl = konjugasi_formal(kana, kind)
        f2k, f2l = konjugasi_formal2(kana, kind)
        f3k, f3l = konjugasi_formal3(kana, kind)
        attr = (kana + "な") if kind == "na" else ""
        if kind == "na":
            n_na += 1
        else:
            n_i += 1
        L.append(
            "  {{ bab: {b}, no: {n}, kana: {k}, attributif: {at}, kanji: {kj}, arti: {a}, "
            "kind: {kd}, positifKini: {pk}, positifLampau: {pl}, negatifKini: {nk}, "
            "negatifLampau: {nl}, formalPositifKini: {fpk}, formalPositifLampau: {fpl}, "
            "formalNegatifKini: {fnk}, formalNegatifLampau: {fnl}, "
            "formalNegatif2Kini: {f2k}, formalNegatif2Lampau: {f2l}, "
            "formalNegatif3Kini: {f3k}, formalNegatif3Lampau: {f3l} }},".format(
                b=bab,
                n=no,
                k=js(kana),
                at=js(attr),
                kj=js(kanji),
                a=js(arti),
                kd=js(kind),
                pk=js(pk),
                pl=js(pl),
                nk=js(nk),
                nl=js(nl),
                fpk=js(fpk),
                fpl=js(fpl),
                fnk=js(fnk),
                fnl=js(fnl),
                f2k=js(f2k),
                f2l=js(f2l),
                f3k=js(f3k),
                f3l=js(f3l),
            )
        )

    L.append("];")
    L.append("")
    L.append("export const KEIYOUSHI_BENTUK_COUNT = {")
    L.append('  na: KEIYOUSHI_BENTUK.filter((k) => k.kind === "na").length,')
    L.append('  i: KEIYOUSHI_BENTUK.filter((k) => k.kind === "i").length,')
    L.append("  total: KEIYOUSHI_BENTUK.length,")
    L.append("};")
    L.append("")

    io.open(OUT, "w", encoding="utf-8").write("\n".join(L))
    print("na:", n_na, "i:", n_i, "total:", n_na + n_i)
    print("OK ->", OUT)


if __name__ == "__main__":
    main()
