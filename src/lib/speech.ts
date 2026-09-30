import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_LANG = "ja-JP";
/** Sedikit lambat, agar pelajar pemula lebih jelas menangkap bunyi. */
const DEFAULT_RATE = 0.9;
/** Nama voice yang umumnya lebih jernih — hanya pemutus seri. */
const PREFERRED_NAMES = ["Kyoko", "Otoya", "Google", "Microsoft"] as const;

function hasSpeechApi(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.speechSynthesis !== "undefined" &&
    typeof window.SpeechSynthesisUtterance !== "undefined"
  );
}

function isJapanese(voice: SpeechSynthesisVoice): boolean {
  return voice.lang.toLowerCase().startsWith("ja");
}

function preferredScore(voice: SpeechSynthesisVoice): number {
  return PREFERRED_NAMES.reduce(
    (n, key) => (voice.name.includes(key) ? n + 1 : n),
    0
  );
}

/** Pilih voice `ja-JP` bila ada, kalau tidak voice `ja-*` lain; nama jadi pembeda. */
export function pickJapaneseVoice(
  voices: SpeechSynthesisVoice[]
): SpeechSynthesisVoice | null {
  const japanese = voices.filter(isJapanese);
  if (japanese.length === 0) return null;
  const exact = japanese.filter((v) => v.lang.toLowerCase() === DEFAULT_LANG);
  const pool = exact.length > 0 ? exact : japanese;
  let best = pool[0];
  for (const v of pool) {
    if (preferredScore(v) > preferredScore(best)) best = v;
  }
  return best;
}

export interface UseSpeech {
  /**
   * `true` bila browser punya Web Speech API. `false` berarti tombol
   * speaker harus disembunyikan sama sekali.
   */
  supported: boolean;
  /** Voice Jepang sudah ditemukan — dipakai untuk menyalakan tombol. */
  hasVoice: boolean;
  isSpeaking: boolean;
  voice: SpeechSynthesisVoice | null;
  /** Mengembalikan `true` bila utterance benar-benar dikirim. */
  speak: (text: string) => boolean;
  stop: () => void;
}

export function useSpeech(): UseSpeech {
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [apiReady, setApiReady] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (!hasSpeechApi()) {
      setApiReady(true);
      return;
    }
    const synth = window.speechSynthesis;
    const sync = () => {
      const picked = pickJapaneseVoice(synth.getVoices());
      voiceRef.current = picked;
      setVoice(picked);
      // Daftar voice sudah diperiksa — baik itu voice-ja ketemu atau tidak.
      setApiReady(true);
    };
    sync();
    synth.addEventListener("voiceschanged", sync);
    // Beberapa browser mengisi daftar voice terlambat tanpa event.
    const poll = window.setInterval(sync, 400);
    const stopPoll = window.setTimeout(() => window.clearInterval(poll), 3000);
    return () => {
      synth.removeEventListener("voiceschanged", sync);
      window.clearInterval(poll);
      window.clearTimeout(stopPoll);
      synth.cancel();
    };
  }, []);

  const stop = useCallback(() => {
    if (!hasSpeechApi()) return;
    try {
      window.speechSynthesis.cancel();
    } catch {
      // abaikan: cancel tidak selalu tersedia
    }
    setIsSpeaking(false);
  }, []);

  const speak = useCallback((text: string): boolean => {
    if (!hasSpeechApi() || text.trim().length === 0) return false;
    try {
      const synth = window.speechSynthesis;
      synth.cancel();
      const utter = new window.SpeechSynthesisUtterance(text);
      utter.lang = DEFAULT_LANG;
      utter.rate = DEFAULT_RATE;
      if (voiceRef.current) utter.voice = voiceRef.current;
      utter.onend = () => setIsSpeaking(false);
      utter.onerror = () => setIsSpeaking(false);
      synth.speak(utter);
      setIsSpeaking(true);
      return true;
    } catch {
      setIsSpeaking(false);
      return false;
    }
  }, []);

  return {
    supported: apiReady,
    hasVoice: voice !== null,
    isSpeaking,
    voice,
    speak,
    stop,
  };
}