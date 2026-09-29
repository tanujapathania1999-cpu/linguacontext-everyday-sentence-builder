import React, { useEffect, useState, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, X, Volume2 } from 'lucide-react';
import { Sentence } from '../types';
import { speakSentence, stopAudio } from '../utils/audioPlayer';

interface SequentialAudioPlayerProps {
  sentences: Sentence[];
  languageCode: string;
  onClose: () => void;
  onSentenceChange?: (index: number) => void;
}

export const SequentialAudioPlayer: React.FC<SequentialAudioPlayerProps> = ({
  sentences,
  languageCode,
  onClose,
  onSentenceChange,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const isMountedRef = useRef(true);
  const isPlayingRef = useRef(true);

  isPlayingRef.current = isPlaying;

  const currentSentence = sentences[currentIndex];

  const playCurrentSentence = (index: number) => {
    if (!isMountedRef.current || index >= sentences.length) {
      setIsPlaying(false);
      onClose();
      return;
    }

    const sentence = sentences[index];
    onSentenceChange?.(index);

    speakSentence({
      text: sentence.original,
      languageCode: languageCode,
      rate: 0.95,
      onStart: () => {},
      onEnd: () => {
        if (!isMountedRef.current || !isPlayingRef.current) return;
        // Wait 900ms between sentences for natural listening cadence
        setTimeout(() => {
          if (!isMountedRef.current || !isPlayingRef.current) return;
          if (index + 1 < sentences.length) {
            setCurrentIndex(index + 1);
            playCurrentSentence(index + 1);
          } else {
            setIsPlaying(false);
            onClose();
          }
        }, 900);
      },
      onError: () => {
        if (!isMountedRef.current || !isPlayingRef.current) return;
        if (index + 1 < sentences.length) {
          setCurrentIndex(index + 1);
          playCurrentSentence(index + 1);
        } else {
          setIsPlaying(false);
        }
      },
    });
  };

  useEffect(() => {
    isMountedRef.current = true;
    playCurrentSentence(0);

    return () => {
      isMountedRef.current = false;
      stopAudio();
    };
  }, []);

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopAudio();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      playCurrentSentence(currentIndex);
    }
  };

  const handleNext = () => {
    stopAudio();
    if (currentIndex + 1 < sentences.length) {
      const next = currentIndex + 1;
      setCurrentIndex(next);
      setIsPlaying(true);
      playCurrentSentence(next);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    stopAudio();
    if (currentIndex > 0) {
      const prev = currentIndex - 1;
      setCurrentIndex(prev);
      setIsPlaying(true);
      playCurrentSentence(prev);
    }
  };

  const handleStopAndClose = () => {
    stopAudio();
    setIsPlaying(false);
    onClose();
  };

  if (!currentSentence) return null;

  return (
    <aside
      aria-label="Audio playback controls"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-xl bg-slate-900/95 text-white backdrop-blur-md rounded-2xl shadow-xl border border-slate-700 p-4 transition-all"
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold">
          <Volume2 className="w-4 h-4 animate-pulse text-indigo-400" />
          <span>Continuous Audio Playback</span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-300 tabular-nums">
            Sentence {currentIndex + 1} of {sentences.length}
          </span>
        </div>

        <button
          onClick={handleStopAndClose}
          className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          title="Close player"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Current sentence preview */}
      <div className="mb-3 space-y-0.5">
        <p className="text-sm font-semibold text-white truncate">
          {currentSentence.original}
        </p>
        <p className="text-xs text-slate-400 truncate">
          <span className="text-slate-500 mr-1">EN:</span>
          {currentSentence.english}
        </p>
        {currentSentence.hindi && (
          <p className="text-xs text-orange-300 truncate">
            <span className="text-orange-400/80 mr-1">HI:</span>
            {currentSentence.hindi}
          </p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 rounded-full h-1.5 mb-3 overflow-hidden">
        <div
          className="bg-indigo-500 h-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / sentences.length) * 100}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="p-2 text-slate-300 hover:text-white disabled:opacity-30 rounded-lg transition-colors"
          title="Previous sentence"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          onClick={handleTogglePlay}
          className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-md transition-all cursor-pointer"
          title={isPlaying ? 'Pause' : 'Resume'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex === sentences.length - 1}
          className="p-2 text-slate-300 hover:text-white disabled:opacity-30 rounded-lg transition-colors"
          title="Next sentence"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
