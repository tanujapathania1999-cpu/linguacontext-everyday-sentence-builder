import { Sentence, HistoryItem, SentenceResult } from '../types';

const FAVORITES_KEY = 'linguacontext_favorites';
const HISTORY_KEY = 'linguacontext_history';
const THEME_KEY = 'linguacontext_theme';
const SETTINGS_KEY = 'linguacontext_settings';

export interface AppSettings {
  slowSpeech: boolean;
  hideEnglishByDefault: boolean;
}

export function getFavorites(): Sentence[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load favorites', e);
    return [];
  }
}

export function saveFavorite(sentence: Sentence): boolean {
  try {
    const favs = getFavorites();
    const exists = favs.some((f) => f.id === sentence.id || (f.original === sentence.original && f.english === sentence.english));
    if (exists) return false;

    const updated = [{ ...sentence, savedAt: Date.now() }, ...favs];
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    return true;
  } catch (e) {
    console.error('Failed to save favorite', e);
    return false;
  }
}

export function removeFavorite(id: string): void {
  try {
    const favs = getFavorites();
    const updated = favs.filter((f) => f.id !== id);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to remove favorite', e);
  }
}

export function isFavorite(sentenceId: string, original?: string): boolean {
  const favs = getFavorites();
  return favs.some((f) => f.id === sentenceId || (original && f.original === original));
}

export function getHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load history', e);
    return [];
  }
}

export function addToHistory(result: SentenceResult): void {
  try {
    const history = getHistory();
    // Remove if already exists with same word and language
    const filtered = history.filter(
      (h) =>
        h.word.toLowerCase() !== result.word.toLowerCase() ||
        h.languageCode !== result.languageCode
    );

    const newItem: HistoryItem = {
      id: `hist-${Date.now()}`,
      word: result.word,
      detectedLanguage: result.detectedLanguage,
      languageCode: result.languageCode,
      timestamp: Date.now(),
      result,
    };

    // Store up to 30 history items
    const updated = [newItem, ...filtered].slice(0, 30);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to add to history', e);
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (e) {
    console.error('Failed to clear history', e);
  }
}

export function getStoredTheme(): 'light' | 'dark' {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    if (raw === 'dark' || raw === 'light') return raw;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  } catch {
    return 'light';
  }
}

export function setStoredTheme(theme: 'light' | 'dark'): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {
    console.error('Failed to set theme', e);
  }
}

export function getStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to get settings', e);
  }
  return { slowSpeech: false, hideEnglishByDefault: false };
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}
