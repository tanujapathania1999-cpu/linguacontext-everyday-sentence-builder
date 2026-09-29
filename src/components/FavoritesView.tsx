import React, { useState } from 'react';
import { Star, Trash2, Copy, Check, Volume2, Search, ArrowRight, Download } from 'lucide-react';
import { Sentence } from '../types';
import { speakSentence, stopAudio } from '../utils/audioPlayer';

interface FavoritesViewProps {
  favorites: Sentence[];
  onRemoveFavorite: (id: string) => void;
  onGoToGenerator: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favorites,
  onRemoveFavorite,
  onGoToGenerator,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const filteredFavorites = favorites.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.original.toLowerCase().includes(query) ||
      item.english.toLowerCase().includes(query) ||
      (item.word && item.word.toLowerCase().includes(query)) ||
      item.situation.toLowerCase().includes(query)
    );
  });

  const handlePlay = async (sentence: Sentence) => {
    if (playingId === sentence.id) {
      stopAudio();
      setPlayingId(null);
      return;
    }

    setPlayingId(sentence.id);
    await speakSentence({
      text: sentence.original,
      languageCode: sentence.language || 'auto',
      onEnd: () => setPlayingId(null),
      onError: () => setPlayingId(null),
    });
  };

  const handleCopy = (sentence: Sentence) => {
    const text = [
      sentence.original,
      `EN: ${sentence.english}`,
      sentence.hindi ? `HI: ${sentence.hindi}` : null,
    ]
      .filter(Boolean)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedId(sentence.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAll = () => {
    if (favorites.length === 0) return;
    const text = favorites
      .map((f, i) => `${i + 1}. ${f.original}\n   EN: ${f.english}${f.hindi ? `\n   HI: ${f.hindi}` : ''}`)
      .join('\n\n');
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleExportText = () => {
    if (favorites.length === 0) return;
    const text = favorites
      .map((f, i) => `${i + 1}. [${f.situation || 'General'} - ${f.difficulty || 'Everyday'}]\n${f.original}\nEN: ${f.english}${f.hindi ? `\nHI: ${f.hindi}` : ''}\n`)
      .join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `linguacontext-favorites-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Saved Favorite Sentences
            </h2>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {favorites.length} {favorites.length === 1 ? 'sentence' : 'sentences'} saved for study and review
          </p>
        </div>

        {favorites.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAll}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
            >
              {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedAll ? 'Copied All' : 'Copy All'}</span>
            </button>
            <button
              onClick={handleExportText}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .txt</span>
            </button>
          </div>
        )}
      </div>

      {/* Empty State */}
      {favorites.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-10 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center mx-auto text-amber-500 mb-3">
            <Star className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            No saved sentences yet
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Click the star icon ⭐ on any generated sentence card to save it here for future reference and practice.
          </p>
          <button
            onClick={onGoToGenerator}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
          >
            <span>Explore Sentences</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          {/* Search bar within favorites */}
          <div className="relative mb-5">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search through saved sentences..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500"
            />
          </div>

          {/* Favorites List */}
          <div className="space-y-3">
            {filteredFavorites.map((sentence, idx) => (
              <div
                key={sentence.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-xs"
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-mono text-slate-400">#{idx + 1}</span>
                    <span aria-hidden="true">·</span>
                    <span>{sentence.situation}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-medium text-indigo-600 dark:text-indigo-400">
                      {sentence.difficulty}
                    </span>
                  </div>

                  <button
                    onClick={() => onRemoveFavorite(sentence.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-md transition-colors"
                    title="Remove from favorites"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  {sentence.original}
                </p>
                <div className="space-y-1 mb-3">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    <span className="text-xs font-semibold text-slate-400 mr-1">EN:</span>
                    {sentence.english}
                  </p>
                  {sentence.hindi && (
                    <p className="text-sm text-orange-900 dark:text-orange-300">
                      <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 mr-1">हिन्दी:</span>
                      {sentence.hindi}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={() => handlePlay(sentence)}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300 transition-colors"
                  >
                    <Volume2 className={`w-3.5 h-3.5 ${playingId === sentence.id ? 'animate-pulse text-indigo-600' : ''}`} />
                    <span>{playingId === sentence.id ? 'Playing…' : 'Listen'}</span>
                  </button>

                  <button
                    onClick={() => handleCopy(sentence)}
                    className="px-2.5 py-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    {copiedId === sentence.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}

            {filteredFavorites.length === 0 && searchQuery && (
              <p className="text-center py-6 text-sm text-slate-500 dark:text-slate-400">
                No saved sentences matched "{searchQuery}"
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};
