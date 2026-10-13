# -*- coding: utf-8 -*-
"""Bangun src/data/keiyoushi_konjugasi.ts dari src/data/keiyoushi.ts.

Menambahkan 4 bentuk konjugasi (positif/negatif x kini/lampau) + bentuk
atributif na-adjektiva. Jalankan ulang setiap kali keiyoushi.ts berubah:

    python tools/build_keiyoushi_konjugasi.py

Aturan:
  i-adj :  ~い -> ~かった / ~くない / ~くなかった
  na-adj:  ~   -> ~だ / ~だった / ~じゃない / ~じゃなかった  (atributif: ~な)
  Khusus:  いい -> いい / よかった / よくない / よくなかった  (juga よい, かっこいい)
"""

import io, re, json

ROOT = r"D:\LPK\Kotoba N5danN4\kotoba-app"
SRC = ROOT + r"\src\data\keiyoushi.ts"
OUT = ROOT + r"\src\data\keiyoushi_konjugasi.ts"

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
    if kana in IRREGULAR:
        return IRREGULAR[kana]
    if kind == "na":
        return (kana + "だ", kana + "だった", kana + "じゃない", kana + "じゃなかった")
    if kana.endswith("い"):
        stem = kana[:-1]
        return (kana, stem + "かった", stem + "くない", stem + "くなかった")
    return (kana, kana, kana, kana)


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
        "// Bentuk konjugasi kata sifat (keiyoushi): positif/negatif, kini/lampau."
    )
    L.append(
        "// FILE GENERATE — jangan diedit per baris. Sumber: src/data/keiyoushi.ts"
    )
    L.append("// Jalankan: python tools/build_keiyoushi_konjugasi.py")
    L.append("//")
    L.append("// Aturan:")
    L.append("//   i-adj :  ~い -> ~かった / ~くない / ~くなかった")
    L.append(
        "//   na-adj:  ~   -> ~だ / ~だった / ~じゃない / ~じゃなかった (atributif: ~な)"
    )
    L.append(
        "//   Khusus:  いい -> よかった / よくない / よくなかった (tidak beraturan)"
    )
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
    L.append("}")
    L.append("")
    L.append("export const KEIYOUSHI_BENTUK: KeiyoushiBentuk[] = [")

    n_na = n_i = 0
    for bab, no, kana, kanji, arti, kind in rows:
        pk, pl, nk, nl = konjugasi(kana, kind)
        attr = (kana + "な") if kind == "na" else ""
        if kind == "na":
            n_na += 1
        else:
            n_i += 1
        L.append(
            "  {{ bab: {b}, no: {n}, kana: {k}, attributif: {at}, kanji: {kj}, arti: {a}, "
            "kind: {kd}, positifKini: {pk}, positifLampau: {pl}, negatifKini: {nk}, "
            "negatifLampau: {nl} }},".format(
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
