"""Generate the Kotoba app icon set: favicon.svg, icon-192.png, icon-512.png.

NO FONT DEPENDENCY. The kanji U+8A00 (gen = "word") is drawn from explicit
vector primitives (rectangles / a ring), never from <text> or Pillow .text().

Geometry provenance
-------------------
The proportions below were MEASURED from the real outline of U+8A00 in fonts
installed on this machine, then cross-checked across four families. All of
Yu Gothic (Bold/Medium/Regular), MS Gothic, MS PGothic and MS UI Gothic agree
on the same gothic skeleton (fractions of the glyph box, width W, height H):

    band 1  top bar      y 0.00..0.10   x 0.146..0.852
    gap                                                   0.06
    band 2  long bar     y 0.16..0.27   x 0.000..0.998   <- widest
    gap                                                   0.06
    band 3  bar          y 0.33..0.43   x 0.165..0.835
    gap                                                   0.06
    band 4  bar          y 0.49..0.59   x 0.165..0.835
    gap                                                   0.06
    band 5  box (kou)    y 0.65..1.00   x 0.140..0.856
                          wall 0.117 W,  hollow 0.10..0.13 H
    overall aspect W/H ~= 1.00 .. 1.02

That is the 7-stroke structure of the kanji: dot + long bar + two bars + box.
For 16 px legibility the strokes are optically BOLDENED (bars thicker relative
to the gaps) and the box hollow is opened up, so the mark degrades into a bold
cream glyph instead of grey mush.

Design
------
  * ink-blue rounded square (dark field) + cream kanji  -> max contrast at 16 px
  * one red rule under the kanji = the vocabulary-card underline / paper accent
  * card geometry and kanji geometry are byte-identical across all three files;
    only the 512 px version adds the faint "ruled paper" texture.
"""

from __future__ import annotations

import os

from PIL import Image, ImageDraw

# --------------------------------------------------------------------------
# palette
# --------------------------------------------------------------------------
INK = (43, 76, 126)  # #2b4c7e  blue ink / notebook cover
INK_HEX = "#2b4c7e"
CREAM = (245, 239, 224)  # #f5efe0  paper
CREAM_HEX = "#f5efe0"
RED = (192, 57, 43)  # #c0392b  accent
RED_HEX = "#c0392b"

# --------------------------------------------------------------------------
# geometry, in a 512 x 512 user-space (shared by SVG and PNG)
# --------------------------------------------------------------------------
CARD = 512  # full-bleed square
CARD_R = 118  # corner radius, 23% -> reads as a squircle at 16 px

CX = 256  # optical centre of the mark

BAR = 40  # uniform stroke thickness of every kanji stroke
GAP = 25  # clear space between strokes
HOLLOW = 56  # clear space inside the box (kou)
SY = 18  # top of the kanji

# horizontal extents (centre +- half width), from the measured fractions
W_LONG = 368  # long bar (band 2), full symbol width
W_TOP = 260  # top bar (band 1),  0.706 * W_LONG
W_MID = 248  # middle bars (band 3 & 4), 0.670 * W_LONG
W_BOX = 280  # box outer width, 0.761 * W_LONG (widened for optical weight)
BOX_WALL = 40  # box wall thickness == BAR

X_LONG = (CX - W_LONG // 2, CX + W_LONG // 2)  # 72, 440
X_TOP = (CX - W_TOP // 2, CX + W_TOP // 2)  # 126, 386
X_MID = (CX - W_MID // 2, CX + W_MID // 2)  # 132, 380
X_BOX = (CX - W_BOX // 2, CX + W_BOX // 2)  # 116, 396

# vertical stack: 4 bars, 4 gaps, then the box (2 walls + hollow)
Y_TOP = (SY, SY + BAR)  # 18, 58
Y_LONG = (SY + BAR + GAP, SY + 2 * BAR + GAP)  # 83, 123
Y_MID1 = (SY + 2 * (BAR + GAP), SY + 3 * BAR + 2 * GAP)  # 148, 188
Y_MID2 = (SY + 3 * (BAR + GAP), SY + 4 * BAR + 3 * GAP)  # 213, 253
BOX_Y0 = SY + 4 * (BAR + GAP)  # 278
BOX_Y1 = BOX_Y0 + 2 * BAR + HOLLOW  # 414
Y_MID = ((Y_MID1[0] + Y_MID1[1]) // 2, (Y_MID2[0] + Y_MID2[1]) // 2)

# red rule: the vocabulary-card underline
RULE = (84, 446, 428, 486)
RULE_R = 20

# 512-only paper texture: ruled lines in the SIDE MARGINS only, so the texture
# never crosses the kanji and never fills in its gaps.
# Inset 10 units so the rules never touch the card's antialiased corner arc
# (touching it produced a faint light fringe on the icon's outer edge).
PAPER_MARGIN_X = (10, 56, 456, 502)  # left strip, right strip
PAPER_RULES_Y = (100, 180, 260, 340, 420)
PAPER_RULE_ALPHA = 13  # ~5% of 255
HAIRLINE_INSET = 15
HAIRLINE_ALPHA = 20  # ~8%

SS = 4  # supersampling factor

# Android maskable icons are cropped to a circle of 80% of the icon width, so
# all essential content must live inside a circle of radius 0.4 * 512 = 204.8
# centred on (256, 256). Our full-bleed mark does not, so the maskable icon
# scales the whole composition down by this factor to sit inside the safe zone.
MASKABLE_SCALE = 0.68


# --------------------------------------------------------------------------
# shape description (single source of truth)
# --------------------------------------------------------------------------
def _scale_shapes(shapes, f):
    """Scale every coordinate about the canvas centre."""
    out = []
    for s in shapes:
        if s[0] == "rect":
            _, x0, y0, x1, y1 = s
            out.append(
                ("rect",) + tuple(round(CX + (v - CX) * f) for v in (x0, y0, x1, y1))
            )
        else:
            _, x0, y0, x1, y1, ix0, iy0, ix1, iy1 = s
            out.append(
                ("ring",)
                + tuple(
                    round(CX + (v - CX) * f)
                    for v in (x0, y0, x1, y1, ix0, iy0, ix1, iy1)
                )
            )
    return out


def _scale_rect(r, f):
    x0, y0, x1, y1 = r
    return (
        round(CX + (x0 - CX) * f),
        round(CX + (y0 - CX) * f),
        round(CX + (x1 - CX) * f),
        round(CX + (y1 - CX) * f),
    )


def mark_shapes(scale: float = 1.0):
    """Return [(kind, x0, y0, x1, y1), ...] for the whole logo mark.

    The box is emitted as a ring (outer + inner) so the renderer can use a
    single even-odd path in SVG and a single colour fill in Pillow.
    """
    x_lt, x_rt = X_BOX
    shapes = [
        ("rect", X_TOP[0], Y_TOP[0], X_TOP[1], Y_TOP[1]),
        ("rect", X_LONG[0], Y_LONG[0], X_LONG[1], Y_LONG[1]),
        ("rect", X_MID[0], Y_MID1[0], X_MID[1], Y_MID1[1]),
        ("rect", X_MID[0], Y_MID2[0], X_MID[1], Y_MID2[1]),
        (
            "ring",
            X_BOX[0],
            BOX_Y0,
            X_BOX[1],
            BOX_Y1,
            x_lt + BOX_WALL,
            BOX_Y0 + BAR,
            x_rt - BOX_WALL,
            BOX_Y1 - BAR,
        ),
    ]
    return _scale_shapes(shapes, scale) if scale != 1.0 else shapes


def ring_rects(s):
    """Expand the box ring into 4 plain rects (top, bottom, left, right walls).

    Used by the Pillow renderer so it never has to erase pixels, which would
    also erase the paper texture showing through the hollow.
    """
    _, x0, y0, x1, y1, ix0, iy0, ix1, iy1 = s
    return [
        ("rect", x0, y0, x1, iy0),  # top wall
        ("rect", x0, iy1, x1, y1),  # bottom wall
        ("rect", x0, iy0, ix0, iy1),  # left wall
        ("rect", ix1, iy0, x1, iy1),  # right wall
    ]


def flatten_shapes(scale: float = 1.0):
    """mark_shapes() with every ring expanded to rects (used by Pillow)."""
    out = []
    for s in mark_shapes(scale):
        out.extend(ring_rects(s) if s[0] == "ring" else [s])
    return out


def _r(x0, y0, x1, y1):
    return "M%d %d H%d V%d H%d Z" % (x0, y0, x1, y1, x0)


def svg_mark_group(colour: str) -> str:
    """The kanji + red rule as <path> elements. No <text> anywhere."""
    out = ['  <g fill="%s">' % colour]
    for s in mark_shapes():
        if s[0] == "rect":
            _, x0, y0, x1, y1 = s
            out.append('    <path d="%s" />' % _r(x0, y0, x1, y1))
        else:
            _, x0, y0, x1, y1, ix0, iy0, ix1, iy1 = s
            out.append(
                '    <path fill-rule="evenodd" d="%s %s" />'
                % (_r(x0, y0, x1, y1), _r(ix0, iy0, ix1, iy1))
            )
    out.append("  </g>")
    return "\n".join(out)


def build_svg() -> str:
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" '
        'width="%d" height="%d" role="img" aria-label="Kotoba">\n'
        "  <title>Kotoba</title>\n"
        "  <!-- Kanji U+8A00 (gen = word) redrawn as vector paths: dot, long\n"
        "       bar, two bars, box. No font dependency, identical in every\n"
        "       browser and OS. -->\n"
        '  <rect width="%d" height="%d" rx="%d" ry="%d" fill="%s" />\n'
        "%s\n"
        '  <rect x="%d" y="%d" width="%d" height="%d" rx="%d" ry="%d" fill="%s" />\n'
        "</svg>\n"
        % (
            CARD,
            CARD,
            CARD,
            CARD,
            CARD,
            CARD,
            CARD_R,
            CARD_R,
            INK_HEX,
            svg_mark_group(CREAM_HEX),
            RULE[0],
            RULE[1],
            RULE[2] - RULE[0],
            RULE[3] - RULE[1],
            RULE_R,
            RULE_R,
            RED_HEX,
        )
    )


# --------------------------------------------------------------------------
# Pillow rendering (vector primitives only)
# --------------------------------------------------------------------------
def _card_mask(px: int) -> Image.Image:
    m = Image.new("L", (px, px), 0)
    ImageDraw.Draw(m).rounded_rectangle(
        [0, 0, px - 1, px - 1], radius=round(CARD_R * px / CARD), fill=255
    )
    return m


def draw_icon(size: int, texture: bool, mark_scale: float = 1.0) -> Image.Image:
    """Render the mark at `size`.

    texture    -- add the faint ruled-paper texture (512 only)
    mark_scale -- shrink the mark about the centre, for the maskable variant
    """
    px = size * SS
    k = px / CARD
    sc = lambda v: round(v * k)  # noqa: E731  user units -> device px

    img = Image.new("RGBA", (px, px), INK + (255,))

    if texture:
        # faint ruled-paper lines, confined to the side margins and clipped to
        # the card by the alpha mask applied at the end
        layer = Image.new("RGBA", (px, px), (0, 0, 0, 0))
        ld = ImageDraw.Draw(layer)
        t = max(1, sc(PAPER_RULE_ALPHA))
        lx0, lx1, rx0, rx1 = PAPER_MARGIN_X
        for y in PAPER_RULES_Y:
            for xa, xb in ((lx0, lx1), (rx0, rx1)):
                ld.rectangle(
                    [sc(xa), sc(y) - t // 2, sc(xb), sc(y) + t // 2],
                    fill=CREAM + (PAPER_RULE_ALPHA,),
                )
        img = Image.alpha_composite(img, layer)

    d = ImageDraw.Draw(img)
    for _, x0, y0, x1, y1 in flatten_shapes(mark_scale):
        d.rectangle([sc(x0), sc(y0), sc(x1) - 1, sc(y1) - 1], fill=CREAM + (255,))

    rx0, ry0, rx1, ry1 = _scale_rect(RULE, mark_scale)
    d.rounded_rectangle(
        [sc(rx0), sc(ry0), sc(rx1) - 1, sc(ry1) - 1],
        radius=sc(RULE_R * mark_scale),
        fill=RED + (255,),
    )

    img.putalpha(_card_mask(px))  # round the corners off
    out = img.resize((size, size), Image.Resampling.LANCZOS)
    return out.convert("RGB")


# --------------------------------------------------------------------------
HERE = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(HERE, os.pardir, "public")


def main() -> None:
    os.makedirs(OUT_DIR, exist_ok=True)

    svg_path = os.path.join(OUT_DIR, "favicon.svg")
    with open(svg_path, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(build_svg())
    print("wrote %s (%d bytes)" % (svg_path, os.path.getsize(svg_path)))

    for size in (192, 512):
        p = os.path.join(OUT_DIR, "icon-%d.png" % size)
        draw_icon(size, texture=(size == 512)).save(p, "PNG", optimize=True)
        print("wrote %s (%d bytes)" % (p, os.path.getsize(p)))

    # Maskable variant: mark scaled into Android's 80%-diameter safe circle.
    p = os.path.join(OUT_DIR, "icon-512-maskable.png")
    draw_icon(512, texture=False, mark_scale=MASKABLE_SCALE).save(
        p, "PNG", optimize=True
    )
    print("wrote %s (%d bytes)" % (p, os.path.getsize(p)))


if __name__ == "__main__":
    main()
