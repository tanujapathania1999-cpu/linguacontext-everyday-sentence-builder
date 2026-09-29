import React, { useState } from 'react';
import {
  RotateCcw,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Filter,
} from 'lucide-react';
import { SentenceResult, Difficulty } from '../types';

interface ResultsToolbarProps {
  result: SentenceResult;
  onGenerateAgain: () => void;
  isGeneratingAgain: boolean;
  onCopyAll: () => void;
  isAllCopied: boolean;
  isPlayingAll: boolean;
  onTogglePlayAll: () => void;
  hideEnglish: boolean;
  onToggleHideEnglish: () => void;
  selectedDifficulty: Difficulty | 'All';
  onSelectDifficulty: (difficulty: Difficulty | 'All') => void;
}

export const ResultsToolbar: React.FC<ResultsToolbarProps> = ({
  result,
  onGenerateAgain,
  isGeneratingAgain,
  onCopyAll,
  isAllCopied,
  isPlayingAll,
  onTogglePlayAll,
  hideEnglish,
  onToggleHideEnglish,
  selectedDifficulty,
  onSelectDifficulty,
}) => {
  return (
    <div className="w-full mb-6">
      {/* Word Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs mb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Word info */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <span>{result.detectedLanguage}</span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-slate-500 dark:text-slate-400 font-normal">
                {result.partOfSpeech}
              </span>
            </div>

            <div className="flex items-baseline flex-wrap gap-x-3 gap-y-1 mt-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {result.normalizedWord || result.word}
              </h2>
              {result.primaryMeaning && (
                <span className="text-base sm:text-lg text-slate-600 dark:text-slate-300 italic">
                  "{result.primaryMeaning}"
                </span>
              )}
              {result.hindiMeaning && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-orange-50 dark:bg-orange-950/60 border border-orange-200/80 dark:border-orange-900/60 text-orange-800 dark:text-orange-300 text-sm sm:text-base font-medium">
                  <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">हिन्दी:</span>
                  <span>{result.hindiMeaning}</span>
                </span>
              )}
            </div>

            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              10 natural everyday sentences in daily conversational context
            </p>
          </div>

          {/* Action buttons on the header */}
          <div className="flex items-center flex-wrap gap-2">
            {/* 🔄 Generate Again */}
            <button
              onClick={onGenerateAgain}
              disabled={isGeneratingAgain}
              className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className={`w-4 h-4 ${isGeneratingAgain ? 'animate-spin' : ''}`} />
              <span>{isGeneratingAgain ? 'Generating…' : 'Generate Again'}</span>
            </button>

            {/* 🔊 Listen to All */}
            <button
              onClick={onTogglePlayAll}
              className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer ${
                isPlayingAll
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-600/20'
              }`}
            >
              {isPlayingAll ? (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span>Stop Player</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>Listen to All</span>
                </>
              )}
            </button>

            {/* 📋 Copy All */}
            <button
              onClick={onCopyAll}
              className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-xl transition-colors flex items-center gap-2 cursor-pointer border ${
                isAllCopied
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 text-emerald-600 dark:text-emerald-400'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {isAllCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>All Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>Copy All</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Filter Bar & Practice toggles */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          {/* Difficulty filter tabs (functional buttons with active states) */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter:</span>
            </span>
            {(['All', 'Beginner', 'Intermediate', 'Advanced'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => onSelectDifficulty(diff)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  selectedDifficulty === diff
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          {/* Practice Toggle: Hide/Show English */}
          <button
            onClick={onToggleHideEnglish}
            className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer self-start sm:self-auto"
            title="Toggle hiding English translations to practice comprehension"
          >
            {hideEnglish ? (
              <>
                <Eye className="w-4 h-4 text-indigo-500" />
                <span>Show All Translations</span>
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4 text-slate-400" />
                <span>Hide English (Practice Mode)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
