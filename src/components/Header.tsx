import React from 'react';
import { BookOpen, Star, History, Moon, Sun, VolumeX } from 'lucide-react';
import { stopAudio } from '../utils/audioPlayer';

interface HeaderProps {
  currentTab: 'generator' | 'favorites' | 'history';
  onSelectTab: (tab: 'generator' | 'favorites' | 'history') => void;
  favoritesCount: number;
  historyCount: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  isPlayingAudio: boolean;
  onStopAudio: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  favoritesCount,
  historyCount,
  theme,
  onToggleTheme,
  isPlayingAudio,
  onStopAudio,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single element Wordmark */}
        <button
          onClick={() => onSelectTab('generator')}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            LinguaContext
          </span>
        </button>

        {/* Zone 2: Clean text navigation links / tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onSelectTab('generator')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              currentTab === 'generator'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Generator
          </button>

          <button
            onClick={() => onSelectTab('favorites')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              currentTab === 'favorites'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
            <span>Favorites</span>
            {favoritesCount > 0 && (
              <span className="text-xs font-semibold px-1.5 py-0.2 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full tabular-nums">
                {favoritesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('history')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              currentTab === 'history'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                ({historyCount})
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: Actions & Theme toggle */}
        <div className="flex items-center gap-2">
          {isPlayingAudio && (
            <button
              onClick={() => {
                stopAudio();
                onStopAudio();
              }}
              title="Stop audio playback"
              className="px-2.5 py-1.5 text-xs font-medium bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors flex items-center gap-1.5"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Stop Audio</span>
            </button>
          )}

          <button
            onClick={onToggleTheme}
            aria-label="Toggle dark mode"
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
