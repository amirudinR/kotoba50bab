# -*- coding: utf-8 -*-
"""Bangun src/data/doushi_te.ts dari src/data/doushi.ts.

Menambahkan bentuk て (te-form) yang dihitung dari bentuk KAMUS + golongan.
Jalankan ulang setiap kali doushi.ts berubah:

    python tools/build_doushi_te.py

Aturan て-form (dari bentuk kamus):
  Gol 2 (ichidan) : buang る -> + て        (たべる -> たべて)
  Gol 3 (fukisoku): する -> して, くる -> きて, ~する -> ~して
  Gol 1 (godan)   : う・つ・る -> って, む・ぶ・ぬ -> んで,
                    く -> いて, ぐ -> いで, す -> して
  Khusus          : いく -> いって (bukan いいて)

PENTING: godan yang berakhir -eru/-iru itu SAH (かえる 帰る, きる 切る,
はいる 入る, しる 知る, すべる 滑る, まいる 参る). Jangan pindah ke gol 2.
"""

import io, re, json

ROOT = r"D:\LPK\Kotoba N5danN4\kotoba-app"
SRC = ROOT + r"\src\data\doushi.ts"
OUT = ROOT + r"\src\data\doushi_te.ts"


def bentuk_te(kamus, kind):
    kind = int(kind)
    # tak beraturan khusus
    if kamus == "いく":
        return "いって"
    if kamus == "くる":
        return "きて"
    if kamus == "する":
        return "して"
    if kind == 3:
        if kamus.endswith("する"):
            return kamus[:-2] + "して"
        if kamus.endswith("る"):
            return kamus[:-1] + "て"
        if kamus.endswith("す"):
            return kamus[:-1] + "して"
        return kamus + "て"
    if kind == 2:
        if kamus.endswith("る"):
            return kamus[:-1] + "て"
        return kamus + "て"
    # gol 1 godan
    if kamus.endswith(("う", "つ", "る")):
        return kamus[:-1] + "って"
    if kamus.endswith(("む", "ぶ", "ぬ")):
        return kamus[:-1] + "んで"
    if kamus.endswith("く"):
        return kamus[:-1] + "いて"
    if kamus.endswith("ぐ"):
        return kamus[:-1] + "いで"
    if kamus.endswith("す"):
        return kamus[:-1] + "して"
    return kamus + "て"


def js(s):
    return json.dumps(s, ensure_ascii=False)


def main():
    text = io.open(SRC, encoding="utf-8").read()
    pat = re.compile(
        r'\{\s*bab:\s*(\d+),\s*no:\s*(\d+),\s*kana:\s*"([^"]*)",\s*kanji:\s*"([^"]*)",'
        r'\s*arti:\s*"((?:[^"\\]|\\.)*)",\s*romaji:\s*"([^"]*)",\s*kind:\s*([123]),'
        r'\s*kamus:\s*"([^"]*)"\s*\}'
    )
    rows = pat.findall(text)
    print("kata kerja ditemukan:", len(rows))

    entries = []
    for bab, no, kana, kanji, arti, romaji, kind, kamus in rows:
        entries.append(
            {
                "bab": int(bab),
                "no": int(no),
                "kana": kana,
                "kanji": kanji,
                "arti": arti,
                "romaji": romaji,
                "kind": int(kind),
                "kamus": kamus,
                "te": bentuk_te(kamus, kind),
            }
        )

    L = []
    L.append(
        "// Bentuk て (te-form) kata kerja, dibentuk dari bentuk kamus + golongan."
    )
    L.append("// FILE GENERATE — jangan diedit per baris. Sumber: src/data/doushi.ts")
    L.append("// Jalankan: python tools/build_doushi_te.py")
    L.append("//")
    L.append("// Aturan:")
    L.append("//   Gol 2 (ichidan) : buang る -> + て        (たべる -> たべて)")
    L.append("//   Gol 3 (fukisoku): する -> して, くる -> きて, ~する -> ~して")
    L.append("//   Gol 1 (godan)   : う・つ・る -> って, む・ぶ・ぬ -> んで,")
    L.append("//                     く -> いて, ぐ -> いで, す -> して")
    L.append("//   Khusus          : いく -> いって (bukan いいて)")
    L.append("")
    L.append('import type { DoushiKind } from "./doushi";')
    L.append("")
    L.append("export interface DoushiTe {")
    L.append("  bab: number;")
    L.append("  no: number;")
    L.append('  /** Bentuk ます, mis. "いきます". */')
    L.append("  kana: string;")
    L.append("  kanji: string;")
    L.append("  arti: string;")
    L.append("  romaji: string;")
    L.append("  /** Golongan: 1 (五段), 2 (一段), 3 (不規則). */")
    L.append("  kind: DoushiKind;")
    L.append('  /** Bentuk kamus, mis. "いく". */')
    L.append("  kamus: string;")
    L.append('  /** Bentuk て, mis. "いって". */')
    L.append("  te: string;")
    L.append("}")
    L.append("")
    L.append("export const DOUSHI_TE: DoushiTe[] = [")
    for e in entries:
        L.append(
            "  {{ bab: {b}, no: {n}, kana: {k}, kanji: {kj}, arti: {a}, romaji: {r}, "
            "kind: {kd}, kamus: {km}, te: {t} }},".format(
                b=e["bab"],
                n=e["no"],
                k=js(e["kana"]),
                kj=js(e["kanji"]),
                a=js(e["arti"]),
                r=js(e["romaji"]),
                kd=e["kind"],
                km=js(e["kamus"]),
                t=js(e["te"]),
            )
        )
    L.append("];")
    L.append("")
    L.append("export const DOUSHI_TE_COUNT = {")
    for g in (1, 2, 3):
        L.append(f"  g{g}: DOUSHI_TE.filter((d) => d.kind === {g}).length,")
    L.append("  total: DOUSHI_TE.length,")
    L.append("};")
    L.append("")

    io.open(OUT, "w", encoding="utf-8").write("\n".join(L))
    print("written", len(entries), "entries ->", OUT)


if __name__ == "__main__":
    main()
