export interface Kotoba {
  no: number;
  kana: string;
  kanji: string;
  arti: string;
}

export interface Bab {
  bab: number;
  items: Kotoba[];
}

/** Entri kosakata dengan info bab asalnya (untuk mode gabungan). */
export interface KotobaWithBab extends Kotoba {
  bab: number;
}
