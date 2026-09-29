import React, { useState } from 'react';
import { Search, Sparkles, X, Globe, ArrowRight } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../types';

interface WordInputProps {
  onGenerate: (word: string, language: string) => void;
  isLoading: boolean;
  initialWord?: string;
  initialLanguage?: string;
}

const SAMPLE_WORDS = [
  { word: 'café', lang: 'es', label: 'café', langName: 'Spanish' },
  { word: 'beautiful', lang: 'en', label: 'beautiful', langName: 'English' },
  { word: 'दोस्त', lang: 'hi', label: 'दोस्त', langName: 'Hindi' },
  { word: 'rendez-vous', lang: 'fr', label: 'rendez-vous', langName: 'French' },
  { word: 'gemütlich', lang: 'de', label: 'gemütlich', langName: 'German' },
  { word: 'komorebi', lang: 'ja', label: 'komorebi', langName: 'Japanese' },
  { word: 'saudade', lang: 'pt', label: 'saudade', langName: 'Portuguese' },
  { word: 'passeggiata', lang: 'it', label: 'passeggiata', langName: 'Italian' },
];

export const WordInput: React.FC<WordInputProps> = ({
  onGenerate,
  isLoading,
  initialWord = '',
  initialLanguage = 'auto',
}) => {
  const [word, setWord] = useState(initialWord);
  const [language, setLanguage] = useState(initialLanguage);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = word.trim();
    if (!trimmed) {
      setValidationError('Please enter a word to get sentences.');
      return;
    }
    setValidationError(null);
    onGenerate(trimmed, language);
  };

  const handleSampleClick = (sampleWord: string, sampleLang: string) => {
    setWord(sampleWord);
    setLanguage(sampleLang);
    setValidationError(null);
    onGenerate(sampleWord, sampleLang);
  };

  return (
    <section className="w-full pt-8 pb-6 sm:pt-12 sm:pb-8">
      <div className="max-w-3xl mx-auto text-center px-4">
        {/* Main Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight sm:leading-tight">
          Learn Words Through{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
            Real Conversations
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-3 sm:mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto font-normal">
          Enter any word and get 10 everyday sentences using it.
        </p>

        {/* Input Card */}
        <form
          onSubmit={handleSubmit}
          className="mt-8 bg-white dark:bg-slate-900 p-2 sm:p-2.5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 focus-within:border-indigo-500 dark:focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all text-left"
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Word Input Box */}
            <div className="relative flex-1 flex items-center min-w-0">
              <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0 pointer-events-none" />
              <input
                type="text"
                value={word}
                onChange={(e) => {
                  setWord(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="Enter a word…"
                disabled={isLoading}
                className="w-full pl-3 pr-9 py-3 text-base sm:text-lg text-slate-900 dark:text-white bg-transparent placeholder-slate-400 focus:outline-none disabled:opacity-60"
                autoFocus
              />
              {word && !isLoading && (
                <button
                  type="button"
                  onClick={() => {
                    setWord('');
                    setValidationError(null);
                  }}
                  className="absolute right-2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
                  title="Clear input"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Language Selector */}
            <div className="relative shrink-0 flex items-center border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 pt-2 sm:pt-0 sm:pl-2">
              <Globe className="w-4 h-4 text-slate-400 ml-2 sm:ml-1 shrink-0 pointer-events-none" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={isLoading}
                className="w-full sm:w-auto appearance-none bg-transparent pl-2.5 pr-8 py-2.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer disabled:opacity-60"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option
                    key={lang.code}
                    value={lang.code}
                    className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  >
                    {lang.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                ▼
              </div>
            </div>

            {/* Generate Button */}
            <button
              type="submit"
              disabled={isLoading || !word.trim()}
              className="px-5 py-3 rounded-xl font-semibold text-sm sm:text-base text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:pointer-events-none shadow-sm shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Generating…</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Sentences</span>
                  <ArrowRight className="w-4 h-4 hidden sm:inline" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Validation error message */}
        {validationError && (
          <p className="mt-2 text-xs sm:text-sm text-rose-500 font-medium text-left px-2">
            {validationError}
          </p>
        )}

        {/* Inspiration Sample Words */}
        <div className="mt-5 flex items-center justify-center flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-medium mr-1 text-slate-400 dark:text-slate-500">
            Try popular examples:
          </span>
          {SAMPLE_WORDS.map((sample) => (
            <button
              key={sample.word}
              type="button"
              onClick={() => handleSampleClick(sample.word, sample.lang)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-lg bg-slate-100/90 dark:bg-slate-800/80 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-700/80 dark:hover:text-indigo-300 text-slate-700 dark:text-slate-300 transition-colors font-medium border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800"
            >
              {sample.label}
              <span className="ml-1 text-[10px] text-slate-400">({sample.langName})</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
