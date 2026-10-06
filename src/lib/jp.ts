/**
 * Segmentasi skrip Jepang untuk pewarnaan kana.
 *
 * Pemecah ini dipakai `JpText` untuk memberi tanda pada bagian katakana saja. Hiragana, kanji, romaji, dan teks Indonesia dibiarkan
 * apa adanya — jadi pemanggil tidak perlu tahu apa isi teksnya.
 *
 * Contoh:
 *   "けしゴム"       -> [{けし,false}, {ゴム,true}]
 *   "ノート"         -> [{ノート,true}]        (ー ikut, itu prolongation mark)
 *   "プラスチック製品" -> [{プラスチック,true}, {製品,false}]
 *   "Penghapus"      -> [{Penghapus,false}]    (tidak ada span tambahan)
 */

export interface KanaSegment {
  text: string;
  /** true bila segment ini seluruhnya katakana. */
  katakana: boolean;
}

/**
 * Katakana penuh: ァ-ヺ (U+30A1–U+30FA).
 * Ditambah ー (U+30FC) karena tanda panjang hanya dipakai di katakana —
 * tanpa ini `ノート` akan terpecah jadi `ノ` + `ト` dan `ト` tak ditandai.
 * Ditambah ゛゜ (U+309B/9C, voicing mark) dan ヽヾ (U+30FD/FE, iteration mark).
 * Terakhir halfwidth ｦ-ﾝ (U+FF66–U+FF9F) supaya teks lama tidak lolos.
 */
const KATAKANA_RE =
  /[\u30A1-\u30FA\u30FC\u309B\u309C\u30FD\u30FE\uFF66-\uFF9F]/;

/**
 * Pecah `text` jadi segment katakana / bukan-katakana yang berurutan.
 * Run katakana yang berdampingan digabung jadi satu segment supaya
 * `プラスチック製品` tidak menghasilkan lima span terpisah.
 */
export function splitKana(text: string): KanaSegment[] {
  const out: KanaSegment[] = [];

  for (const ch of text) {
    const isKata = KATAKANA_RE.test(ch);
    const last = out[out.length - 1];

    if (last && last.katakana === isKata) {
      last.text += ch;
    } else {
      out.push({ text: ch, katakana: isKata });
    }
  }

  return out;
}

/** True bila teks memuat minimal satu huruf katakana. */
export function hasKatakana(text: string): boolean {
  return KATAKANA_RE.test(text);
}