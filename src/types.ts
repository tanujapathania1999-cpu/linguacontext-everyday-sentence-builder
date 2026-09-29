export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Sentence {
  id: string;
  original: string;
  english: string;
  hindi?: string;
  targetWordForm: string;
  difficulty: Difficulty;
  situation: string;
  word?: string;
  language?: string;
  savedAt?: number;
}

export interface SentenceResult {
  word: string;
  detectedLanguage: string;
  languageCode: string;
  normalizedWord: string;
  partOfSpeech: string;
  primaryMeaning: string;
  hindiMeaning?: string;
  sentences: Sentence[];
  createdAt: number;
}

export interface HistoryItem {
  id: string;
  word: string;
  detectedLanguage: string;
  languageCode: string;
  timestamp: number;
  result: SentenceResult;
}

export interface LanguageOption {
  code: string;
  name: string;
  nativeName?: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'auto', name: 'Auto Detect (Any Language)' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'zh', name: 'Chinese (Mandarin)', nativeName: '中文' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
];
