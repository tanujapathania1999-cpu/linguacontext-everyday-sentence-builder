import React, { useState } from 'react';
import { Volume2, Copy, Check, Star, Snail } from 'lucide-react';
import { Sentence } from '../types';
import { speakSentence, stopAudio } from '../utils/audioPlayer';

interface SentenceCardProps {
  sentence: Sentence;
  index: number;
  languageCode: string;
  isFavorite: boolean;
  onToggleFavorite: (sentence: Sentence) => void;
  hideEnglish?: boolean;
  isActivePlayback?: boolean;
  onAudioStart?: () => void;
  onAudioEnd?: () => void;
}

export const SentenceCard: React.FC<SentenceCardProps> = ({
  sentence,
  index,
  languageCode,
  isFavorite,
  onToggleFavorite,
  hideEnglish = false,
  isActivePlayback = false,
  onAudioStart,
  onAudioEnd,
}) => {
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSlowPlaying, setIsSlowPlaying] = useState(false);
  const [revealedTranslation, setRevealedTranslation] = useState(false);

  // Play audio
  const handleListen = async (slow = false) => {
    if (isPlaying || isSlowPlaying) {
      stopAudio();
      setIsPlaying(false);
      setIsSlowPlaying(false);
      onAudioEnd?.();
      return;
    }

    if (slow) {
      setIsSlowPlaying(true);
    } else {
      setIsPlaying(true);
    }
    onAudioStart?.();

    await speakSentence({
      text: sentence.original,
      languageCode: languageCode,
      rate: slow ? 0.75 : 1.0,
      onStart: () => {},
      onEnd: () => {
        setIsPlaying(false);
        setIsSlowPlaying(false);
        onAudioEnd?.();
      },
      onError: () => {
        setIsPlaying(false);
        setIsSlowPlaying(false);
        onAudioEnd?.();
      },
    });
  };

  // Copy sentence, English & Hindi translation
  const handleCopy = () => {
    const textToCopy = [
      sentence.original,
      `EN: ${sentence.english}`,
      sentence.hindi ? `HI: ${sentence.hindi}` : null,
    ]
      .filter(Boolean)
      .join('\n');
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Highlight target word in sentence
  const renderHighlightedSentence = () => {
    const original = sentence.original;
    const wordToFind = sentence.targetWordForm || '';

    if (!wordToFind) {
      return <span>{original}</span>;
    }

    try {
      // Escape special regex characters
      const escaped = wordToFind.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escaped})`, 'gi');
      const parts = original.split(regex);

      return (
        <span>
          {parts.map((part, i) => {
            if (part.toLowerCase() === wordToFind.toLowerCase()) {
              return (
                <mark
                  key={i}
                  className="bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-200 font-semibold px-1 py-0.5 rounded mx-0.5 underline decoration-indigo-400 decoration-2 underline-offset-4"
                >
                  {part}
                </mark>
              );
            }
            return <span key={i}>{part}</span>;
          })}
        </span>
      );
    } catch {
      return <span>{original}</span>;
    }
  };

  const isCurrentActive = isPlaying || isSlowPlaying || isActivePlayback;

  return (
    <article
      className={`group relative bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border transition-all duration-200 ${
        isCurrentActive
          ? 'border-indigo-500 dark:border-indigo-400 shadow-md ring-2 ring-indigo-500/10'
          : 'border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
      }`}
    >
      {/* Top Header: Unboxed metadata (anti-slop rule) + Actions */}
      <div className="flex items-center justify-between gap-3 mb-3">
        {/* Unboxed Metadata with typographic separators */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <span className="font-mono font-semibold text-slate-400 dark:text-slate-500 tabular-nums">
            {String(index).padStart(2, '0')}
          </span>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
          <span>{sentence.situation}</span>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
          <span
            className={
              sentence.difficulty === 'Beginner'
                ? 'text-emerald-600 dark:text-emerald-400'
                : sentence.difficulty === 'Advanced'
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-indigo-600 dark:text-indigo-400'
            }
          >
            {sentence.difficulty}
          </span>
        </div>

        {/* Favorite Button */}
        <button
          onClick={() => onToggleFavorite(sentence)}
          aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
          className={`p-1.5 rounded-lg transition-colors ${
            isFavorite
              ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title={isFavorite ? 'Saved in favorites' : 'Save to favorites'}
        >
          <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400' : ''}`} />
        </button>
      </div>

      {/* Main Sentence in Target Language */}
      <div className="my-2">
        <p className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100 leading-relaxed tracking-tight">
          {renderHighlightedSentence()}
        </p>
      </div>

      {/* Translations: English & Hindi */}
      <div className="mt-2 mb-4 space-y-1.5">
        {hideEnglish && !revealedTranslation ? (
          <button
            onClick={() => setRevealedTranslation(true)}
            className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline py-1"
          >
            Show translations (English & हिन्दी)
          </button>
        ) : (
          <>
            <div className="flex items-start gap-2 text-sm sm:text-base text-slate-700 dark:text-slate-300 font-normal leading-normal">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 mt-0.5">
                EN:
              </span>
              <span>{sentence.english}</span>
            </div>

            {sentence.hindi && (
              <div className="flex items-start gap-2 text-sm sm:text-base text-orange-950 dark:text-orange-200/90 font-normal leading-normal bg-orange-50/70 dark:bg-orange-950/30 px-2.5 py-1.5 rounded-lg border border-orange-100/80 dark:border-orange-900/40">
                <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider shrink-0 mt-0.5">
                  हिन्दी:
                </span>
                <span>{sentence.hindi}</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Card Controls: Audio & Copy */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
        {/* Audio buttons */}
        <div className="flex items-center gap-1.5">
          {/* Standard Listen */}
          <button
            onClick={() => handleListen(false)}
            disabled={isSlowPlaying}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isPlaying
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300'
            }`}
            title="Listen to pronunciation"
          >
            <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-pulse' : ''}`} />
            <span>{isPlaying ? 'Playing…' : 'Listen'}</span>
          </button>

          {/* Slower Listen for learners */}
          <button
            onClick={() => handleListen(true)}
            disabled={isPlaying}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
              isSlowPlaying
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
            title="Listen at slower speed (0.75x)"
          >
            <Snail className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Slow</span>
          </button>
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
            copied
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Copy sentence and English translation"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
};
