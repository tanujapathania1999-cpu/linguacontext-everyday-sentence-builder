import React, { useState } from 'react';
import { History, ArrowRight, Trash2, Globe, Clock, Search } from 'lucide-react';
import { HistoryItem, SentenceResult } from '../types';

interface HistoryViewProps {
  history: HistoryItem[];
  onSelectHistoryItem: (result: SentenceResult) => void;
  onClearHistory: () => void;
  onGoToGenerator: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onSelectHistoryItem,
  onClearHistory,
  onGoToGenerator,
}) => {
  const [searchFilter, setSearchFilter] = useState('');

  const filteredHistory = history.filter((item) =>
    item.word.toLowerCase().includes(searchFilter.toLowerCase()) ||
    item.detectedLanguage.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const formatTimestamp = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Word Search History
            </h2>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Revisit previously generated sentences instantly with one click
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-10 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400 mb-3">
            <History className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            No search history yet
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Words you search and their 10 everyday sentences will be archived here for instant recall.
          </p>
          <button
            onClick={onGoToGenerator}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
          >
            <span>Search First Word</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          {/* Search box */}
          <div className="relative mb-5">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter history by word or language..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectHistoryItem(item.result)}
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 rounded-2xl p-4 sm:p-5 transition-all shadow-xs cursor-pointer hover:shadow-sm"
              >
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <div className="flex items-center gap-1.5 font-medium text-indigo-600 dark:text-indigo-400">
                    <Globe className="w-3.5 h-3.5" />
                    <span>{item.detectedLanguage}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimestamp(item.timestamp)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {item.word}
                  </h3>
                  <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950 text-slate-400 group-hover:text-indigo-600 transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                <div className="mt-1 space-y-0.5">
                  {item.result.primaryMeaning && (
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-1 italic">
                      "{item.result.primaryMeaning}"
                    </p>
                  )}
                  {item.result.hindiMeaning && (
                    <p className="text-xs text-orange-800 dark:text-orange-300 font-medium line-clamp-1">
                      हिन्दी: {item.result.hindiMeaning}
                    </p>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>{item.result.sentences.length} conversational sentences</span>
                  <span className="font-medium text-indigo-600 dark:text-indigo-400 group-hover:underline">
                    View & Listen →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
