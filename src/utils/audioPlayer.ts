// Audio and Text-To-Speech utility with Web Speech API and Gemini TTS support

let currentAudioElement: HTMLAudioElement | null = null;

export interface SpeakOptions {
  text: string;
  languageCode?: string;
  rate?: number; // 0.8 to 1.0
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

/**
 * Halts any ongoing speech or audio playback
 */
export function stopAudio(): void {
  if (typeof window !== 'undefined') {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }
  if (currentAudioElement) {
    currentAudioElement.pause();
    currentAudioElement.currentTime = 0;
    currentAudioElement = null;
  }
}

/**
 * Play speech using browser's native SpeechSynthesis API
 */
function speakWithBrowserTTS(options: SpeakOptions): boolean {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return false;
  }

  stopAudio();

  const utterance = new SpeechSynthesisUtterance(options.text);
  utterance.rate = options.rate || 1.0;

  if (options.languageCode) {
    // Standardize language code format (e.g. "es" -> "es-ES", "ja" -> "ja-JP", "fr" -> "fr-FR")
    const codeMap: Record<string, string> = {
      es: 'es-ES',
      fr: 'fr-FR',
      de: 'de-DE',
      it: 'it-IT',
      ja: 'ja-JP',
      zh: 'zh-CN',
      ko: 'ko-KR',
      pt: 'pt-BR',
      ru: 'ru-RU',
      ar: 'ar-SA',
      hi: 'hi-IN',
      nl: 'nl-NL',
      tr: 'tr-TR',
      sv: 'sv-SE',
      en: 'en-US',
      vi: 'vi-VN',
      el: 'el-GR',
      pl: 'pl-PL',
    };
    const targetTag = codeMap[options.languageCode.toLowerCase()] || options.languageCode;
    utterance.lang = targetTag;

    // Pick best matching voice if available
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(
      (v) =>
        v.lang.toLowerCase() === targetTag.toLowerCase() ||
        v.lang.toLowerCase().startsWith(options.languageCode!.toLowerCase())
    );
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
  }

  utterance.onstart = () => {
    options.onStart?.();
  };

  utterance.onend = () => {
    options.onEnd?.();
  };

  utterance.onerror = (e) => {
    // Ignore canceled errors from user clicking stop
    if (e.error === 'canceled' || e.error === 'interrupted') {
      options.onEnd?.();
      return;
    }
    options.onError?.(e);
  };

  window.speechSynthesis.speak(utterance);
  return true;
}

/**
 * Play audio: Try server-side Gemini TTS first if feasible, or immediately use native browser speech
 */
export async function speakSentence(options: SpeakOptions): Promise<void> {
  stopAudio();

  // Try Web Speech API first as default for instantaneous zero-latency feedback
  const success = speakWithBrowserTTS(options);
  if (success) {
    return;
  }

  // Fallback to server TTS if Web Speech API is absent
  try {
    options.onStart?.();
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: options.text,
        languageCode: options.languageCode,
      }),
    });

    const data = await res.json();
    if (data.audio) {
      const audio = new Audio(data.audio);
      currentAudioElement = audio;
      audio.playbackRate = options.rate || 1.0;
      audio.onended = () => {
        currentAudioElement = null;
        options.onEnd?.();
      };
      audio.onerror = (e) => {
        currentAudioElement = null;
        options.onError?.(e);
      };
      await audio.play();
    } else {
      options.onEnd?.();
    }
  } catch (err) {
    options.onError?.(err);
  }
}
