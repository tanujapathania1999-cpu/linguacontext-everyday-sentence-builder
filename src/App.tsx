import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { WordInput } from './components/WordInput';
import { SentenceCard } from './components/SentenceCard';
import { ResultsToolbar } from './components/ResultsToolbar';
import { FavoritesView } from './components/FavoritesView';
import { HistoryView } from './components/HistoryView';
import { SequentialAudioPlayer } from './components/SequentialAudioPlayer';
import { SentenceResult, Sentence, Difficulty, HistoryItem } from './types';
import {
  getFavorites,
  saveFavorite,
  removeFavorite,
  isFavorite,
  getHistory,
  addToHistory,
  clearHistory,
  getStoredTheme,
  setStoredTheme,
} from './utils/storage';
import { stopAudio } from './utils/audioPlayer';
import { MessageSquare, Sparkles, Volume2, Bookmark, CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'generator' | 'favorites' | 'history'>('generator');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Search & Results state
  const [currentWord, setCurrentWord] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('auto');
  const [result, setResult] = useState<SentenceResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingAgain, setIsGeneratingAgain] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Results display controls
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'All'>('All');
  const [hideEnglish, setHideEnglish] = useState(false);
  const [isAllCopied, setIsAllCopied] = useState(false);

  // Audio player state
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [activePlaybackIndex, setActivePlaybackIndex] = useState<number | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Storage state
  const [favorites, setFavorites] = useState<Sentence[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Initialize theme and load persisted data
  useEffect(() => {
    const initialTheme = getStoredTheme();
    setTheme(initialTheme);
    setStoredTheme(initialTheme);

    setFavorites(getFavorites());
    setHistory(getHistory());
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    setStoredTheme(nextTheme);
  };

  // Generate sentences
  const handleGenerate = async (wordToSearch: string, langToUse: string, isVariation = false) => {
    stopAudio();
    setIsPlayingAll(false);
    setActivePlaybackIndex(null);
    setIsPlayingAudio(false);

    if (isVariation) {
      setIsGeneratingAgain(true);
    } else {
      setIsLoading(true);
    }
    setErrorMessage(null);
    setCurrentWord(wordToSearch);
    setSelectedLanguage(langToUse);

    try {
      const response = await fetch('/api/generate-sentences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: wordToSearch,
          language: langToUse,
          seedModifier: isVariation ? Math.random().toString(36).substring(7) : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate sentences');
      }

      const newResult: SentenceResult = {
        word: data.word,
        detectedLanguage: data.detectedLanguage,
        languageCode: data.languageCode,
        normalizedWord: data.normalizedWord,
        partOfSpeech: data.partOfSpeech,
        primaryMeaning: data.primaryMeaning,
        sentences: data.sentences,
        createdAt: Date.now(),
      };

      setResult(newResult);
      addToHistory(newResult);
      setHistory(getHistory());
      setCurrentTab('generator');

      // Scroll to results smoothly
      setTimeout(() => {
        const resultsEl = document.getElementById('sentence-results-section');
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err: any) {
      console.error('Error generating sentences:', err);
      setErrorMessage(
        err?.message || 'Could not connect to the generator. Please check your connection and try again.'
      );
    } finally {
      setIsLoading(false);
      setIsGeneratingAgain(false);
    }
  };

  // Generate again for current word
  const handleGenerateAgain = () => {
    if (!result) return;
    handleGenerate(result.word, selectedLanguage, true);
  };

  // Toggle favorite
  const handleToggleFavorite = (sentence: Sentence) => {
    if (isFavorite(sentence.id, sentence.original)) {
      removeFavorite(sentence.id);
    } else {
      saveFavorite({
        ...sentence,
        word: result?.word || currentWord,
        language: result?.languageCode || 'en',
      });
    }
    setFavorites(getFavorites());
  };

  // Copy all sentences
  const handleCopyAll = () => {
    if (!result) return;
    const header = [
      `Word: ${result.normalizedWord || result.word} (${result.detectedLanguage})`,
      result.primaryMeaning ? `Meaning: ${result.primaryMeaning}` : null,
      result.hindiMeaning ? `Hindi Meaning: ${result.hindiMeaning}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    const body = result.sentences
      .map(
        (s, i) =>
          `${i + 1}. [${s.situation} - ${s.difficulty}]\n${s.original}\nEN: ${s.english}${s.hindi ? `\nHI: ${s.hindi}` : ''}`
      )
      .join('\n\n');

    navigator.clipboard.writeText(`${header}\n\n${body}`);
    setIsAllCopied(true);
    setTimeout(() => setIsAllCopied(false), 2000);
  };

  // Listen to all sentences toggle
  const handleTogglePlayAll = () => {
    if (isPlayingAll) {
      stopAudio();
      setIsPlayingAll(false);
      setActivePlaybackIndex(null);
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAll(true);
      setIsPlayingAudio(true);
    }
  };

  // Filter sentences by difficulty
  const displayedSentences = result
    ? result.sentences.filter(
        (s) => selectedDifficulty === 'All' || s.difficulty === selectedDifficulty
      )
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/80 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* 3-Zone Top Bar Navigation */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          stopAudio();
          setIsPlayingAll(false);
          setIsPlayingAudio(false);
          setCurrentTab(tab);
        }}
        favoritesCount={favorites.length}
        historyCount={history.length}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        isPlayingAudio={isPlayingAudio}
        onStopAudio={() => {
          setIsPlayingAll(false);
          setActivePlaybackIndex(null);
          setIsPlayingAudio(false);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-4">
        {currentTab === 'generator' && (
          <div>
            {/* Word Input & Hero */}
            <WordInput
              onGenerate={(w, l) => handleGenerate(w, l, false)}
              isLoading={isLoading}
              initialWord={currentWord}
              initialLanguage={selectedLanguage}
            />

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="max-w-2xl mx-auto mt-4 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="flex-1 text-sm">
                  <p className="font-semibold">Unable to generate sentences</p>
                  <p className="mt-0.5 text-xs text-rose-600 dark:text-rose-400">
                    {errorMessage}
                  </p>
                  <button
                    onClick={() => handleGenerate(currentWord, selectedLanguage, false)}
                    className="mt-2 text-xs font-semibold underline hover:no-underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

            {/* Generated Results Section */}
            {result && (
              <section id="sentence-results-section" className="mt-8 pb-16">
                {/* Results Toolbar */}
                <ResultsToolbar
                  result={result}
                  onGenerateAgain={handleGenerateAgain}
                  isGeneratingAgain={isGeneratingAgain}
                  onCopyAll={handleCopyAll}
                  isAllCopied={isAllCopied}
                  isPlayingAll={isPlayingAll}
                  onTogglePlayAll={handleTogglePlayAll}
                  hideEnglish={hideEnglish}
                  onToggleHideEnglish={() => setHideEnglish(!hideEnglish)}
                  selectedDifficulty={selectedDifficulty}
                  onSelectDifficulty={setSelectedDifficulty}
                />

                {/* 10 Sentence Cards Stack */}
                <div className="grid grid-cols-1 gap-4">
                  {displayedSentences.map((sentence, idx) => (
                    <div
                      key={sentence.id}
                      id={`sentence-card-${idx}`}
                      className="transition-all"
                    >
                      <SentenceCard
                        sentence={sentence}
                        index={idx + 1}
                        languageCode={result.languageCode}
                        isFavorite={isFavorite(sentence.id, sentence.original)}
                        onToggleFavorite={handleToggleFavorite}
                        hideEnglish={hideEnglish}
                        isActivePlayback={activePlaybackIndex === idx}
                        onAudioStart={() => setIsPlayingAudio(true)}
                        onAudioEnd={() => setIsPlayingAudio(false)}
                      />
                    </div>
                  ))}
                </div>

                {displayedSentences.length === 0 && (
                  <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <p className="text-slate-500 text-sm">
                      No sentences found for difficulty: "{selectedDifficulty}".
                    </p>
                    <button
                      onClick={() => setSelectedDifficulty('All')}
                      className="mt-2 text-xs font-semibold text-indigo-600 hover:underline"
                    >
                      Reset filter to All
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* Empty State / Educational Showcase Banner when no search yet */}
            {!result && !isLoading && (
              <section className="mt-10 mb-16 max-w-4xl mx-auto">
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xs overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                      <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                        <Sparkles className="w-4 h-4" />
                        <span>Natural Polyglot Engine</span>
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-snug">
                        Master words the way native speakers actually talk
                      </h2>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        Instead of memorizing dry dictionary definitions, learn words embedded inside authentic everyday spoken sentences—ordering coffee, chatting with friends, work conversations, and casual encounters.
                      </p>

                      <ul className="mt-5 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>Any language supported with intelligent auto-detection</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>Accurate, colloquial English translations for every sentence</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>Natural voice pronunciation with regular and slow playback speeds</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>Save favorites and copy formatted flashcard study notes</span>
                        </li>
                      </ul>
                    </div>

                    {/* Editorial asset with zero-broken-image fallback container */}
                    <div className="relative rounded-2xl overflow-hidden aspect-video bg-gradient-to-tr from-indigo-50 to-violet-50 dark:from-slate-800 dark:to-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center p-4">
                      <img
                        src="/src/assets/images/hero_conversation_languages_1790699161587.jpg"
                        alt="Conversational language learning visualization"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-xl"
                        onError={(e) => {
                          // Styled fallback container if image asset fails
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        )}

        {/* Favorites View */}
        {currentTab === 'favorites' && (
          <FavoritesView
            favorites={favorites}
            onRemoveFavorite={(id) => {
              removeFavorite(id);
              setFavorites(getFavorites());
            }}
            onGoToGenerator={() => setCurrentTab('generator')}
          />
        )}

        {/* History View */}
        {currentTab === 'history' && (
          <HistoryView
            history={history}
            onSelectHistoryItem={(itemResult) => {
              setResult(itemResult);
              setCurrentWord(itemResult.word);
              setSelectedLanguage(itemResult.languageCode || 'auto');
              setCurrentTab('generator');
            }}
            onClearHistory={() => {
              clearHistory();
              setHistory([]);
            }}
            onGoToGenerator={() => setCurrentTab('generator')}
          />
        )}
      </main>

      {/* Sequential Audio Floating Player */}
      {isPlayingAll && result && (
        <SequentialAudioPlayer
          sentences={result.sentences}
          languageCode={result.languageCode}
          onClose={() => {
            setIsPlayingAll(false);
            setActivePlaybackIndex(null);
            setIsPlayingAudio(false);
          }}
          onSentenceChange={(idx) => {
            setActivePlaybackIndex(idx);
            const el = document.getElementById(`sentence-card-${idx}`);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          }}
        />
      )}

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>LinguaContext · Natural language learning through everyday conversational immersion</p>
          <div className="flex items-center gap-3">
            <span>Everyday Situations</span>
            <span>·</span>
            <span>Native Pronunciation</span>
            <span>·</span>
            <span>Bilingual Translations</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
