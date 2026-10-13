// Bentuk konjugasi kata sifat (keiyoushi): positif/negatif, kini/lampau.
// Digenerate dari src/data/keiyoushi.ts — jangan diedit per baris,
// edit keiyoushi.ts lalu jalankan ulang skrip pembentuknya.
//
// Aturan:
//   i-adj :  ～い -> ～かった / ～くない / ～くなかった
//   na-adj:  ～   -> ～だ / ～だった / ～じゃない / ～じゃなかった
//           (bentuk な dipakai saat menerangkan kata benda: げんきな人)
//   Khusus: いい -> よかった / よくない / よくなかった (tidak beraturan)

import type { KeiyoushiKind } from "./keiyoushi";

export interface KeiyoushiBentuk {
  /** Bab asal kata. */
  bab: number;
  /** Nomor urut kata di dalam babnya (kunci hafal sama seperti data lain). */
  no: number;
  kana: string;
  /** Bentuk atributif na-adj (mis. "げんきな"); kosong untuk i-adj. */
  attributif: string;
  kanji: string;
  arti: string;
  kind: KeiyoushiKind;
  /** Positif kini (mis. "たかい" / "げんきだ"). */
  positifKini: string;
  /** Positif lampau (mis. "たかかった" / "げんきだった"). */
  positifLampau: string;
  /** Negatif kini (mis. "たかくない" / "げんきじゃない"). */
  negatifKini: string;
  /** Negatif lampau (mis. "たかくなかった" / "げんきじゃなかった"). */
  negatifLampau: string;
}

export const KEIYOUSHI_BENTUK: KeiyoushiBentuk[] = [
  { bab: 8, no: 1, kana: "ハンサム", attributif: "ハンサムな", kanji: "", arti: "Tampan / gagah / ganteng", kind: "na", positifKini: "ハンサムだ", positifLampau: "ハンサムだった", negatifKini: "ハンサムじゃない", negatifLampau: "ハンサムじゃなかった" },
  { bab: 8, no: 2, kana: "きれい", attributif: "きれいな", kanji: "", arti: "Cantik / bersih", kind: "na", positifKini: "きれいだ", positifLampau: "きれいだった", negatifKini: "きれいじゃない", negatifLampau: "きれいじゃなかった" },
  { bab: 8, no: 3, kana: "しずか", attributif: "しずかな", kanji: "静か", arti: "Sunyi / tenang", kind: "na", positifKini: "しずかだ", positifLampau: "しずかだった", negatifKini: "しずかじゃない", negatifLampau: "しずかじゃなかった" },
  { bab: 8, no: 4, kana: "にぎやか", attributif: "にぎやかな", kanji: "", arti: "Ramai", kind: "na", positifKini: "にぎやかだ", positifLampau: "にぎやかだった", negatifKini: "にぎやかじゃない", negatifLampau: "にぎやかじゃなかった" },
  { bab: 8, no: 5, kana: "ゆうめい", attributif: "ゆうめいな", kanji: "有名", arti: "Terkenal", kind: "na", positifKini: "ゆうめいだ", positifLampau: "ゆうめいだった", negatifKini: "ゆうめいじゃない", negatifLampau: "ゆうめいじゃなかった" },
  { bab: 8, no: 6, kana: "しんせつ", attributif: "しんせつな", kanji: "親切", arti: "Baik hati", kind: "na", positifKini: "しんせつだ", positifLampau: "しんせつだった", negatifKini: "しんせつじゃない", negatifLampau: "しんせつじゃなかった" },
  { bab: 8, no: 7, kana: "げんき", attributif: "げんきな", kanji: "元気", arti: "Sehat", kind: "na", positifKini: "げんきだ", positifLampau: "げんきだった", negatifKini: "げんきじゃない", negatifLampau: "げんきじゃなかった" },
  { bab: 8, no: 8, kana: "ひま", attributif: "ひまな", kanji: "暇", arti: "Senggang", kind: "na", positifKini: "ひまだ", positifLampau: "ひまだった", negatifKini: "ひまじゃない", negatifLampau: "ひまじゃなかった" },
  { bab: 8, no: 9, kana: "べんり", attributif: "べんりな", kanji: "便利", arti: "Praktis", kind: "na", positifKini: "べんりだ", positifLampau: "べんりだった", negatifKini: "べんりじゃない", negatifLampau: "べんりじゃなかった" },
  { bab: 8, no: 10, kana: "すてき", attributif: "すてきな", kanji: "", arti: "Bagus", kind: "na", positifKini: "すてきだ", positifLampau: "すてきだった", negatifKini: "すてきじゃない", negatifLampau: "すてきじゃなかった" },
  { bab: 9, no: 3, kana: "すき", attributif: "すきな", kanji: "好き", arti: "Suka, gemar", kind: "na", positifKini: "すきだ", positifLampau: "すきだった", negatifKini: "すきじゃない", negatifLampau: "すきじゃなかった" },
  { bab: 9, no: 4, kana: "きらい", attributif: "きらいな", kanji: "嫌い", arti: "Benci", kind: "na", positifKini: "きらいだ", positifLampau: "きらいだった", negatifKini: "きらいじゃない", negatifLampau: "きらいじゃなかった" },
  { bab: 9, no: 5, kana: "じょうず", attributif: "じょうずな", kanji: "上手", arti: "Pandai, pintar", kind: "na", positifKini: "じょうずだ", positifLampau: "じょうずだった", negatifKini: "じょうずじゃない", negatifLampau: "じょうずじゃなかった" },
  { bab: 9, no: 6, kana: "へた", attributif: "へたな", kanji: "下手", arti: "Tidak pandai, bodoh", kind: "na", positifKini: "へただ", positifLampau: "へただった", negatifKini: "へたじゃない", negatifLampau: "へたじゃなかった" },
  { bab: 10, no: 3, kana: "いろいろ", attributif: "いろいろな", kanji: "", arti: "Berbagai / macam-macam", kind: "na", positifKini: "いろいろだ", positifLampau: "いろいろだった", negatifKini: "いろいろじゃない", negatifLampau: "いろいろじゃなかった" },
  { bab: 12, no: 1, kana: "かんたん", attributif: "かんたんな", kanji: "簡単", arti: "Mudah, gampang", kind: "na", positifKini: "かんたんだ", positifLampau: "かんたんだった", negatifKini: "かんたんじゃない", negatifLampau: "かんたんじゃなかった" },
  { bab: 13, no: 9, kana: "たいへん", attributif: "たいへんな", kanji: "大変", arti: "Susah, berat", kind: "na", positifKini: "たいへんだ", positifLampau: "たいへんだった", negatifKini: "たいへんじゃない", negatifLampau: "たいへんじゃなかった" },
  { bab: 8, no: 11, kana: "おおきい", attributif: "", kanji: "大きい", arti: "Besar", kind: "i", positifKini: "おおきい", positifLampau: "おおきかった", negatifKini: "おおきくない", negatifLampau: "おおきくなかった" },
  { bab: 8, no: 12, kana: "ちいさい", attributif: "", kanji: "小さい", arti: "Kecil", kind: "i", positifKini: "ちいさい", positifLampau: "ちいさかった", negatifKini: "ちいさくない", negatifLampau: "ちいさくなかった" },
  { bab: 8, no: 13, kana: "あたらしい", attributif: "", kanji: "新しい", arti: "Baru", kind: "i", positifKini: "あたらしい", positifLampau: "あたらしかった", negatifKini: "あたらしくない", negatifLampau: "あたらしくなかった" },
  { bab: 8, no: 14, kana: "ふるい", attributif: "", kanji: "古い", arti: "Lama / tua", kind: "i", positifKini: "ふるい", positifLampau: "ふるかった", negatifKini: "ふるくない", negatifLampau: "ふるくなかった" },
  { bab: 8, no: 16, kana: "わるい", attributif: "", kanji: "悪い", arti: "Jelek", kind: "i", positifKini: "わるい", positifLampau: "わるかった", negatifKini: "わるくない", negatifLampau: "わるくなかった" },
  { bab: 8, no: 17, kana: "あつい", attributif: "", kanji: "暑い、熱い", arti: "Panas", kind: "i", positifKini: "あつい", positifLampau: "あつかった", negatifKini: "あつくない", negatifLampau: "あつくなかった" },
  { bab: 8, no: 18, kana: "さむい", attributif: "", kanji: "寒い", arti: "Dingin suhu", kind: "i", positifKini: "さむい", positifLampau: "さむかった", negatifKini: "さむくない", negatifLampau: "さむくなかった" },
  { bab: 8, no: 19, kana: "つめたい", attributif: "", kanji: "冷たい", arti: "Dingin benda", kind: "i", positifKini: "つめたい", positifLampau: "つめたかった", negatifKini: "つめたくない", negatifLampau: "つめたくなかった" },
  { bab: 8, no: 20, kana: "むずかしい", attributif: "", kanji: "難しい", arti: "Sulit / susah", kind: "i", positifKini: "むずかしい", positifLampau: "むずかしかった", negatifKini: "むずかしくない", negatifLampau: "むずかしくなかった" },
  { bab: 8, no: 21, kana: "やさしい", attributif: "", kanji: "易しい", arti: "Mudah / gampang", kind: "i", positifKini: "やさしい", positifLampau: "やさしかった", negatifKini: "やさしくない", negatifLampau: "やさしくなかった" },
  { bab: 8, no: 22, kana: "たかい", attributif: "", kanji: "高い", arti: "Mahal / tinggi", kind: "i", positifKini: "たかい", positifLampau: "たかかった", negatifKini: "たかくない", negatifLampau: "たかくなかった" },
  { bab: 8, no: 23, kana: "やすい", attributif: "", kanji: "安い", arti: "Murah", kind: "i", positifKini: "やすい", positifLampau: "やすかった", negatifKini: "やすくない", negatifLampau: "やすくなかった" },
  { bab: 8, no: 24, kana: "ひくい", attributif: "", kanji: "低い", arti: "Rendah", kind: "i", positifKini: "ひくい", positifLampau: "ひくかった", negatifKini: "ひくくない", negatifLampau: "ひくくなかった" },
  { bab: 8, no: 25, kana: "おもしろい", attributif: "", kanji: "", arti: "Menarik", kind: "i", positifKini: "おもしろい", positifLampau: "おもしろかった", negatifKini: "おもしろくない", negatifLampau: "おもしろくなかった" },
  { bab: 8, no: 26, kana: "おいしい", attributif: "", kanji: "", arti: "Enak", kind: "i", positifKini: "おいしい", positifLampau: "おいしかった", negatifKini: "おいしくない", negatifLampau: "おいしくなかった" },
  { bab: 8, no: 27, kana: "いそがしい", attributif: "", kanji: "忙しい", arti: "Sibuk", kind: "i", positifKini: "いそがしい", positifLampau: "いそがしかった", negatifKini: "いそがしくない", negatifLampau: "いそがしくなかった" },
  { bab: 8, no: 28, kana: "たのしい", attributif: "", kanji: "楽しい", arti: "Senang", kind: "i", positifKini: "たのしい", positifLampau: "たのしかった", negatifKini: "たのしくない", negatifLampau: "たのしくなかった" },
  { bab: 8, no: 29, kana: "しろい", attributif: "", kanji: "白い", arti: "Putih", kind: "i", positifKini: "しろい", positifLampau: "しろかった", negatifKini: "しろくない", negatifLampau: "しろくなかった" },
  { bab: 8, no: 30, kana: "くろい", attributif: "", kanji: "黒い", arti: "Hitam", kind: "i", positifKini: "くろい", positifLampau: "くろかった", negatifKini: "くろくない", negatifLampau: "くろくなかった" },
  { bab: 8, no: 31, kana: "あかい", attributif: "", kanji: "赤い", arti: "Merah", kind: "i", positifKini: "あかい", positifLampau: "あかかった", negatifKini: "あかくない", negatifLampau: "あかくなかった" },
  { bab: 8, no: 32, kana: "あおい", attributif: "", kanji: "青い", arti: "Biru", kind: "i", positifKini: "あおい", positifLampau: "あおかった", negatifKini: "あおくない", negatifLampau: "あおくなかった" },
  { bab: 8, no: 58, kana: "きいろい", attributif: "", kanji: "", arti: "Kuning", kind: "i", positifKini: "きいろい", positifLampau: "きいろかった", negatifKini: "きいろくない", negatifLampau: "きいろくなかった" },
  { bab: 8, no: 59, kana: "ちゃいろい", attributif: "", kanji: "", arti: "coklat", kind: "i", positifKini: "ちゃいろい", positifLampau: "ちゃいろかった", negatifKini: "ちゃいろくない", negatifLampau: "ちゃいろくなかった" },
  { bab: 12, no: 2, kana: "ちかい", attributif: "", kanji: "近い", arti: "Dekat", kind: "i", positifKini: "ちかい", positifLampau: "ちかかった", negatifKini: "ちかくない", negatifLampau: "ちかくなかった" },
  { bab: 12, no: 3, kana: "とおい", attributif: "", kanji: "遠い", arti: "Jauh", kind: "i", positifKini: "とおい", positifLampau: "とおかった", negatifKini: "とおくない", negatifLampau: "とおくなかった" },
  { bab: 12, no: 4, kana: "はやい", attributif: "", kanji: "早い，速い", arti: "Cepat", kind: "i", positifKini: "はやい", positifLampau: "はやかった", negatifKini: "はやくない", negatifLampau: "はやくなかった" },
  { bab: 12, no: 5, kana: "おそい", attributif: "", kanji: "遅い", arti: "Lambat", kind: "i", positifKini: "おそい", positifLampau: "おそかった", negatifKini: "おそくない", negatifLampau: "おそくなかった" },
  { bab: 12, no: 6, kana: "おおい", attributif: "", kanji: "多い", arti: "Banyak", kind: "i", positifKini: "おおい", positifLampau: "おおかった", negatifKini: "おおくない", negatifLampau: "おおくなかった" },
  { bab: 12, no: 7, kana: "すくない", attributif: "", kanji: "少ない", arti: "Sedikit", kind: "i", positifKini: "すくない", positifLampau: "すくなかった", negatifKini: "すくなくない", negatifLampau: "すくなくなかった" },
  { bab: 12, no: 8, kana: "あたたかい", attributif: "", kanji: "暖かい、温かい", arti: "Hangat", kind: "i", positifKini: "あたたかい", positifLampau: "あたたかかった", negatifKini: "あたたかくない", negatifLampau: "あたたかくなかった" },
  { bab: 12, no: 9, kana: "すずしい", attributif: "", kanji: "涼しい", arti: "Sejuk", kind: "i", positifKini: "すずしい", positifLampau: "すずしかった", negatifKini: "すずしくない", negatifLampau: "すずしくなかった" },
  { bab: 12, no: 10, kana: "あまい", attributif: "", kanji: "甘い", arti: "Manis", kind: "i", positifKini: "あまい", positifLampau: "あまかった", negatifKini: "あまくない", negatifLampau: "あまくなかった" },
  { bab: 12, no: 11, kana: "からい", attributif: "", kanji: "辛い", arti: "Pedas", kind: "i", positifKini: "からい", positifLampau: "からかった", negatifKini: "からくない", negatifLampau: "からくなかった" },
  { bab: 12, no: 12, kana: "おもい", attributif: "", kanji: "重い", arti: "Berat", kind: "i", positifKini: "おもい", positifLampau: "おもかった", negatifKini: "おもくない", negatifLampau: "おもくなかった" },
  { bab: 12, no: 13, kana: "かるい", attributif: "", kanji: "軽い", arti: "Ringan", kind: "i", positifKini: "かるい", positifLampau: "かるかった", negatifKini: "かるくない", negatifLampau: "かるくなかった" },
  { bab: 12, no: 14, kana: "いい", attributif: "", kanji: "", arti: "Lebih baik", kind: "i", positifKini: "いい", positifLampau: "よかった", negatifKini: "よくない", negatifLampau: "よくなかった" },
  { bab: 13, no: 10, kana: "ほしい", attributif: "", kanji: "欲しい", arti: "Ingin", kind: "i", positifKini: "ほしい", positifLampau: "ほしかった", negatifKini: "ほしくない", negatifLampau: "ほしくなかった" },
  { bab: 13, no: 11, kana: "ひろい", attributif: "", kanji: "広い", arti: "Luas", kind: "i", positifKini: "ひろい", positifLampau: "ひろかった", negatifKini: "ひろくない", negatifLampau: "ひろくなかった" },
  { bab: 13, no: 12, kana: "せまい", attributif: "", kanji: "狭い", arti: "Sempit", kind: "i", positifKini: "せまい", positifLampau: "せまかった", negatifKini: "せまくない", negatifLampau: "せまくなかった" },
  { bab: 16, no: 15, kana: "わかい", attributif: "", kanji: "若い", arti: "Muda", kind: "i", positifKini: "わかい", positifLampau: "わかかった", negatifKini: "わかくない", negatifLampau: "わかくなかった" },
  { bab: 16, no: 16, kana: "ながい", attributif: "", kanji: "長い", arti: "Panjang", kind: "i", positifKini: "ながい", positifLampau: "ながかった", negatifKini: "ながくない", negatifLampau: "ながくなかった" },
  { bab: 16, no: 17, kana: "みじかい", attributif: "", kanji: "短い", arti: "Pendek", kind: "i", positifKini: "みじかい", positifLampau: "みじかかった", negatifKini: "みじかくない", negatifLampau: "みじかくなかった" },
  { bab: 16, no: 18, kana: "あかるい", attributif: "", kanji: "明るい", arti: "Terang", kind: "i", positifKini: "あかるい", positifLampau: "あかるかった", negatifKini: "あかるくない", negatifLampau: "あかるくなかった" },
  { bab: 16, no: 19, kana: "くらい", attributif: "", kanji: "暗い", arti: "Gelap", kind: "i", positifKini: "くらい", positifLampau: "くらかった", negatifKini: "くらくない", negatifLampau: "くらくなかった" },
  { bab: 17, no: 15, kana: "あぶない", attributif: "", kanji: "危ない", arti: "Berbahaya", kind: "i", positifKini: "あぶない", positifLampau: "あぶなかった", negatifKini: "あぶなくない", negatifLampau: "あぶなくなかった" },
  { bab: 17, no: 28, kana: "いたい", attributif: "", kanji: "痛い", arti: "Sakit (nyeri)", kind: "i", positifKini: "いたい", positifLampau: "いたかった", negatifKini: "いたくない", negatifLampau: "いたくなかった" },
  { bab: 17, no: 49, kana: "かゆい", attributif: "", kanji: "", arti: "Gatal", kind: "i", positifKini: "かゆい", positifLampau: "かゆかった", negatifKini: "かゆくない", negatifLampau: "かゆくなかった" },
  { bab: 19, no: 6, kana: "ねむい", attributif: "", kanji: "眠い", arti: "Mengantuk", kind: "i", positifKini: "ねむい", positifLampau: "ねむかった", negatifKini: "ねむくない", negatifLampau: "ねむくなかった" },
  { bab: 19, no: 7, kana: "つよい", attributif: "", kanji: "強い", arti: "Kuat", kind: "i", positifKini: "つよい", positifLampau: "つよかった", negatifKini: "つよくない", negatifLampau: "つよくなかった" },
  { bab: 19, no: 8, kana: "よわい", attributif: "", kanji: "弱い", arti: "Lemah", kind: "i", positifKini: "よわい", positifLampau: "よわかった", negatifKini: "よわくない", negatifLampau: "よわくなかった" },
  { bab: 21, no: 12, kana: "すごい", attributif: "", kanji: "", arti: "Hebat", kind: "i", positifKini: "すごい", positifLampau: "すごかった", negatifKini: "すごくない", negatifLampau: "すごくなかった" },
  { bab: 23, no: 10, kana: "さびしい", attributif: "", kanji: "寂しい", arti: "Sepi", kind: "i", positifKini: "さびしい", positifLampau: "さびしかった", negatifKini: "さびしくない", negatifLampau: "さびしくなかった" },
  { bab: 26, no: 43, kana: "こわい", attributif: "", kanji: "怖い", arti: "Takut", kind: "i", positifKini: "こわい", positifLampau: "こわかった", negatifKini: "こわくない", negatifLampau: "こわくなかった" },
  { bab: 27, no: 35, kana: "すばらしい", attributif: "", kanji: "", arti: "Sangat menarik,cemerlang,hebat", kind: "i", positifKini: "すばらしい", positifLampau: "すばらしかった", negatifKini: "すばらしくない", negatifLampau: "すばらしくなかった" },
  { bab: 28, no: 10, kana: "やさしい", attributif: "", kanji: "優しい", arti: "Lemah lembut, baik hati", kind: "i", positifKini: "やさしい", positifLampau: "やさしかった", negatifKini: "やさしくない", negatifLampau: "やさしくなかった" },
  { bab: 28, no: 11, kana: "えらい", attributif: "", kanji: "偉い", arti: "Hebat", kind: "i", positifKini: "えらい", positifLampau: "えらかった", negatifKini: "えらくない", negatifLampau: "えらくなかった" },
  { bab: 30, no: 46, kana: "まるい", attributif: "", kanji: "丸い", arti: "Bulat", kind: "i", positifKini: "まるい", positifLampau: "まるかった", negatifKini: "まるくない", negatifLampau: "まるくなかった" },
  { bab: 30, no: 49, kana: "うれしい", attributif: "", kanji: "", arti: "Senang, gembira", kind: "i", positifKini: "うれしい", positifLampau: "うれしかった", negatifKini: "うれしくない", negatifLampau: "うれしくなかった" },
  { bab: 31, no: 38, kana: "うつくしい", attributif: "", kanji: "美しい", arti: "Indah", kind: "i", positifKini: "うつくしい", positifLampau: "うつくしかった", negatifKini: "うつくしくない", negatifLampau: "うつくしくなかった" },
  { bab: 32, no: 17, kana: "おかしい", attributif: "", kanji: "", arti: "Lucu, aneh", kind: "i", positifKini: "おかしい", positifLampau: "おかしかった", negatifKini: "おかしくない", negatifLampau: "おかしくなかった" },
  { bab: 32, no: 18, kana: "うるさい", attributif: "", kanji: "", arti: "Berisik, cerewet", kind: "i", positifKini: "うるさい", positifLampau: "うるさかった", negatifKini: "うるさくない", negatifLampau: "うるさくなかった" },
  { bab: 32, no: 69, kana: "むしあつい", attributif: "", kanji: "蒸し暑い", arti: "Panas lembab", kind: "i", positifKini: "むしあつい", positifLampau: "むしあつかった", negatifKini: "むしあつくない", negatifLampau: "むしあつくなかった" },
  { bab: 34, no: 9, kana: "ほそい", attributif: "", kanji: "細い", arti: "Tipis", kind: "i", positifKini: "ほそい", positifLampau: "ほそかった", negatifKini: "ほそくない", negatifLampau: "ほそくなかった" },
  { bab: 34, no: 10, kana: "ふとい", attributif: "", kanji: "太い", arti: "Tebal", kind: "i", positifKini: "ふとい", positifLampau: "ふとかった", negatifKini: "ふとくない", negatifLampau: "ふとくなかった" },
  { bab: 34, no: 37, kana: "にがい", attributif: "", kanji: "苦い", arti: "Pahit", kind: "i", positifKini: "にがい", positifLampau: "にがかった", negatifKini: "にがくない", negatifLampau: "にがくなかった" },
  { bab: 35, no: 8, kana: "ただしい", attributif: "", kanji: "正しい", arti: "Betul,benar", kind: "i", positifKini: "ただしい", positifLampau: "ただしかった", negatifKini: "ただしくない", negatifLampau: "ただしくなかった" },
  { bab: 35, no: 9, kana: "めずらしい", attributif: "", kanji: "珍しい", arti: "Aneh,langka", kind: "i", positifKini: "めずらしい", positifLampau: "めずらしかった", negatifKini: "めずらしくない", negatifLampau: "めずらしくなかった" },
  { bab: 35, no: 39, kana: "くわしい", attributif: "", kanji: "詳しい", arti: "Terperinci,detail", kind: "i", positifKini: "くわしい", positifLampau: "くわしかった", negatifKini: "くわしくない", negatifLampau: "くわしくなかった" },
  { bab: 36, no: 9, kana: "かたい", attributif: "", kanji: "硬い", arti: "Keras", kind: "i", positifKini: "かたい", positifLampau: "かたかった", negatifKini: "かたくない", negatifLampau: "かたくなかった" },
  { bab: 36, no: 10, kana: "やわらかい", attributif: "", kanji: "軟らかい", arti: "Lunak", kind: "i", positifKini: "やわらかい", positifLampau: "やわらかかった", negatifKini: "やわらかくない", negatifLampau: "やわらかくなかった" },
  { bab: 38, no: 36, kana: "おとなしい", attributif: "", kanji: "", arti: "Pendiam, patuh", kind: "i", positifKini: "おとなしい", positifLampau: "おとなしかった", negatifKini: "おとなしくない", negatifLampau: "おとなしくなかった" },
  { bab: 39, no: 15, kana: "きたない", attributif: "", kanji: "汚い", arti: "Kotor", kind: "i", positifKini: "きたない", positifLampau: "きたなかった", negatifKini: "きたなくない", negatifLampau: "きたなくなかった" },
  { bab: 39, no: 16, kana: "うれしい", attributif: "", kanji: "", arti: "Senang", kind: "i", positifKini: "うれしい", positifLampau: "うれしかった", negatifKini: "うれしくない", negatifLampau: "うれしくなかった" },
  { bab: 39, no: 17, kana: "かなしい", attributif: "", kanji: "悲しい", arti: "Sedih", kind: "i", positifKini: "かなしい", positifLampau: "かなしかった", negatifKini: "かなしくない", negatifLampau: "かなしくなかった" },
  { bab: 39, no: 18, kana: "はずかしい", attributif: "", kanji: "恥ずかしい", arti: "Malu", kind: "i", positifKini: "はずかしい", positifLampau: "はずかしかった", negatifKini: "はずかしくない", negatifLampau: "はずかしくなかった" },
  { bab: 39, no: 45, kana: "たのしい", attributif: "", kanji: "楽しい", arti: "Senang, gembira", kind: "i", positifKini: "たのしい", positifLampau: "たのしかった", negatifKini: "たのしくない", negatifLampau: "たのしくなかった" },
  { bab: 39, no: 46, kana: "さびしい", attributif: "", kanji: "寂しい", arti: "Kesepian", kind: "i", positifKini: "さびしい", positifLampau: "さびしかった", negatifKini: "さびしくない", negatifLampau: "さびしくなかった" },
  { bab: 39, no: 47, kana: "うらやましい", attributif: "", kanji: "", arti: "Iri", kind: "i", positifKini: "うらやましい", positifLampau: "うらやましかった", negatifKini: "うらやましくない", negatifLampau: "うらやましくなかった" },
  { bab: 39, no: 48, kana: "なつかしい", attributif: "", kanji: "懐かしい", arti: "Rindu,kangen", kind: "i", positifKini: "なつかしい", positifLampau: "なつかしかった", negatifKini: "なつかしくない", negatifLampau: "なつかしくなかった" },
  { bab: 41, no: 7, kana: "かわいい", attributif: "", kanji: "", arti: "Manis (wajah), cantik", kind: "i", positifKini: "かわいい", positifLampau: "かわいかった", negatifKini: "かわいくない", negatifLampau: "かわいくなかった" },
  { bab: 42, no: 5, kana: "あつい", attributif: "", kanji: "厚い", arti: "Tebal", kind: "i", positifKini: "あつい", positifLampau: "あつかった", negatifKini: "あつくない", negatifLampau: "あつくなかった" },
  { bab: 42, no: 6, kana: "うすい", attributif: "", kanji: "薄い", arti: "Tipis", kind: "i", positifKini: "うすい", positifLampau: "うすかった", negatifKini: "うすくない", negatifLampau: "うすくなかった" },
  { bab: 43, no: 12, kana: "うまい", attributif: "", kanji: "", arti: "Enak, ahli dalam", kind: "i", positifKini: "うまい", positifLampau: "うまかった", negatifKini: "うまくない", negatifLampau: "うまくなかった" },
  { bab: 43, no: 13, kana: "まずい", attributif: "", kanji: "", arti: "Tidak enak", kind: "i", positifKini: "まずい", positifLampau: "まずかった", negatifKini: "まずくない", negatifLampau: "まずくなかった" },
  { bab: 43, no: 14, kana: "つまらない", attributif: "", kanji: "", arti: "Bosan, tidak menarik", kind: "i", positifKini: "つまらない", positifLampau: "つまらなかった", negatifKini: "つまらなくない", negatifLampau: "つまらなくなかった" },
  { bab: 43, no: 30, kana: "あかるい", attributif: "", kanji: "明るい", arti: "Ceria", kind: "i", positifKini: "あかるい", positifLampau: "あかるかった", negatifKini: "あかるくない", negatifLampau: "あかるくなかった" },
  { bab: 43, no: 31, kana: "くらい", attributif: "", kanji: "暗い", arti: "Muram", kind: "i", positifKini: "くらい", positifLampau: "くらかった", negatifKini: "くらくない", negatifLampau: "くらくなかった" },
  { bab: 43, no: 35, kana: "つめたい", attributif: "", kanji: "冷たい", arti: "Kaku, dingin", kind: "i", positifKini: "つめたい", positifLampau: "つめたかった", negatifKini: "つめたくない", negatifLampau: "つめたくなかった" },
  { bab: 43, no: 36, kana: "きびしい", attributif: "", kanji: "厳しい", arti: "Keras, disiplin", kind: "i", positifKini: "きびしい", positifLampau: "きびしかった", negatifKini: "きびしくない", negatifLampau: "きびしくなかった" },
  { bab: 44, no: 10, kana: "こまかい", attributif: "", kanji: "細かい", arti: "Kecil, receh", kind: "i", positifKini: "こまかい", positifLampau: "こまかかった", negatifKini: "こまかくない", negatifLampau: "こまかくなかった" },
  { bab: 44, no: 11, kana: "こい", attributif: "", kanji: "濃い", arti: "Kental (rasa), tua (warna)", kind: "i", positifKini: "こい", positifLampau: "こかった", negatifKini: "こくない", negatifLampau: "こくなかった" },
  { bab: 44, no: 12, kana: "うすい", attributif: "", kanji: "薄い", arti: "Encer (rasa), tua (warna)", kind: "i", positifKini: "うすい", positifLampau: "うすかった", negatifKini: "うすくない", negatifLampau: "うすくなかった" },
  { bab: 47, no: 9, kana: "ひどい", attributif: "", kanji: "", arti: "Luar biasa", kind: "i", positifKini: "ひどい", positifLampau: "ひどかった", negatifKini: "ひどくない", negatifLampau: "ひどくなかった" },
  { bab: 48, no: 5, kana: "きびしい", attributif: "", kanji: "厳しい", arti: "Disiplin,galak,keras", kind: "i", positifKini: "きびしい", positifLampau: "きびしかった", negatifKini: "きびしくない", negatifLampau: "きびしくなかった" },
];

export const KEIYOUSHI_BENTUK_COUNT = {
  na: KEIYOUSHI_BENTUK.filter((k) => k.kind === "na").length,
  i: KEIYOUSHI_BENTUK.filter((k) => k.kind === "i").length,
  total: KEIYOUSHI_BENTUK.length,
};
