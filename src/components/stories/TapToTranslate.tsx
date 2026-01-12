import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Plus, X } from 'lucide-react';
import { audioService } from '../../services/audioService';
import type { StoryVocab } from '../../data/stories';

interface TapToTranslateProps {
  text: string;
  vocabulary: StoryVocab[];
  onAddWord?: (word: string) => void;
}

interface PopupState {
  word: string;
  translation: string;
  partOfSpeech?: string;
  x: number;
  y: number;
}

export function TapToTranslate({
  text,
  vocabulary,
  onAddWord,
}: TapToTranslateProps) {
  const [popup, setPopup] = useState<PopupState | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Create a map for quick vocabulary lookup
  const vocabMap = new Map<string, StoryVocab>();
  vocabulary.forEach(v => {
    vocabMap.set(v.word.toLowerCase(), v);
  });

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setPopup(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleWordClick = (e: React.MouseEvent, word: string) => {
    e.stopPropagation();

    // Clean the word
    const cleanWord = word.toLowerCase().replace(/[.,!?;:'"¿¡«»]/g, '');

    // Check if word is in vocabulary
    const vocab = vocabMap.get(cleanWord);
    if (!vocab) {
      // Try partial matches for phrases
      for (const [key, v] of vocabMap.entries()) {
        if (key.includes(cleanWord) || cleanWord.includes(key.split(' ')[0])) {
          const rect = (e.target as HTMLElement).getBoundingClientRect();
          const containerRect = containerRef.current?.getBoundingClientRect();

          setPopup({
            word: v.word,
            translation: v.translation,
            partOfSpeech: v.partOfSpeech,
            x: rect.left - (containerRect?.left || 0) + rect.width / 2,
            y: rect.top - (containerRect?.top || 0) - 10,
          });
          return;
        }
      }
      return;
    }

    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();

    setPopup({
      word: vocab.word,
      translation: vocab.translation,
      partOfSpeech: vocab.partOfSpeech,
      x: rect.left - (containerRect?.left || 0) + rect.width / 2,
      y: rect.top - (containerRect?.top || 0) - 10,
    });
  };

  const handlePlayAudio = async () => {
    if (!popup || isPlaying) return;
    setIsPlaying(true);
    try {
      await audioService.speakCatalan(popup.word);
    } finally {
      setIsPlaying(false);
    }
  };

  const handleAddWord = () => {
    if (popup && onAddWord) {
      onAddWord(popup.word);
      setPopup(null);
    }
  };

  // Split text into words while preserving spaces and punctuation
  const renderText = () => {
    const words = text.split(/(\s+)/);

    return words.map((word, index) => {
      // Check if this is a space
      if (/^\s+$/.test(word)) {
        return <span key={index}>{word}</span>;
      }

      // Check if word is in vocabulary (clean it first for comparison)
      const cleanWord = word.toLowerCase().replace(/[.,!?;:'"¿¡«»]/g, '');
      const isVocab = vocabMap.has(cleanWord) ||
        Array.from(vocabMap.keys()).some(k => k.includes(cleanWord) || cleanWord.includes(k.split(' ')[0]));

      return (
        <span
          key={index}
          onClick={(e) => handleWordClick(e, word)}
          className={`
            cursor-pointer transition-colors rounded px-0.5 -mx-0.5
            ${isVocab
              ? 'text-miro-blue dark:text-miro-yellow hover:bg-miro-yellow/30 dark:hover:bg-miro-yellow/20 underline decoration-dotted decoration-miro-blue/40 dark:decoration-miro-yellow/40 underline-offset-4'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }
          `}
        >
          {word}
        </span>
      );
    });
  };

  return (
    <div ref={containerRef} className="relative">
      <p className="text-lg leading-relaxed text-gray-800 dark:text-gray-200">
        {renderText()}
      </p>

      {/* Translation Popup */}
      <AnimatePresence>
        {popup && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            style={{
              position: 'absolute',
              left: popup.x,
              top: popup.y,
              transform: 'translate(-50%, -100%)',
            }}
            className="z-50"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border-2 border-miro-blue dark:border-miro-yellow p-3 min-w-[180px]">
              {/* Close button */}
              <button
                onClick={() => setPopup(null)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                <X className="w-3 h-3 text-gray-600 dark:text-gray-400" />
              </button>

              {/* Word */}
              <div className="flex items-center gap-2 mb-2">
                <span className="font-bold text-miro-blue dark:text-miro-yellow text-lg">
                  {popup.word}
                </span>
                <button
                  onClick={handlePlayAudio}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <Volume2 className={`w-4 h-4 ${isPlaying ? 'text-miro-red animate-pulse' : 'text-gray-500'}`} />
                </button>
              </div>

              {/* Part of speech */}
              {popup.partOfSpeech && (
                <span className="text-xs text-gray-500 dark:text-gray-400 italic block mb-1">
                  {popup.partOfSpeech}
                </span>
              )}

              {/* Translation */}
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                {popup.translation}
              </p>

              {/* Add to study button */}
              {onAddWord && (
                <button
                  onClick={handleAddWord}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-miro-green/10 hover:bg-miro-green/20 text-miro-green rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add to Study
                </button>
              )}

              {/* Arrow pointer */}
              <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-gray-800 border-r-2 border-b-2 border-miro-blue dark:border-miro-yellow transform rotate-45" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
