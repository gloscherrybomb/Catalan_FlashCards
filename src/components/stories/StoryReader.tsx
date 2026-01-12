import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Volume2,
  BookOpen,
  Check,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { TapToTranslate } from './TapToTranslate';
import { audioService } from '../../services/audioService';
import type { Story } from '../../data/stories';
import { useStoryStore } from '../../stores/storyStore';

interface StoryReaderProps {
  story: Story;
  onComplete: () => void;
  onBack: () => void;
}

export function StoryReader({ story, onComplete, onBack }: StoryReaderProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const {
    currentParagraphIndex,
    showTranslations,
    fontSize,
    nextParagraph,
    previousParagraph,
    goToParagraph,
    toggleTranslations,
    setFontSize,
    addLearnedWord,
  } = useStoryStore();

  const currentParagraph = story.paragraphs[currentParagraphIndex];
  const isLastParagraph = currentParagraphIndex === story.paragraphs.length - 1;
  const progress = ((currentParagraphIndex + 1) / story.paragraphs.length) * 100;

  const handlePlayAudio = async () => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    try {
      await audioService.speakCatalan(currentParagraph.catalan);
    } finally {
      setIsPlayingAudio(false);
    }
  };

  const handleAddWord = (word: string) => {
    addLearnedWord(story.id, word);
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'small': return 'text-base';
      case 'large': return 'text-xl';
      default: return 'text-lg';
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Font size selector */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {(['small', 'medium', 'large'] as const).map(size => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className={`
                  px-2 py-1 rounded text-xs font-medium transition-colors
                  ${fontSize === size
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }
                `}
              >
                {size === 'small' ? 'A' : size === 'medium' ? 'A' : 'A'}
                <span className="sr-only">{size} font</span>
              </button>
            ))}
          </div>

          {/* Translation toggle */}
          <button
            onClick={toggleTranslations}
            className={`
              p-2 rounded-lg transition-colors
              ${showTranslations
                ? 'bg-miro-blue text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }
            `}
            title={showTranslations ? 'Hide translations' : 'Show translations'}
          >
            {showTranslations ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
          <span>{story.title}</span>
          <span>{currentParagraphIndex + 1} / {story.paragraphs.length}</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-miro-blue to-miro-green rounded-full"
          />
        </div>
      </div>

      {/* Story content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentParagraphIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="p-6 mb-6">
            {/* Catalan text with tap-to-translate */}
            <div className={`mb-4 ${getFontSizeClass()}`}>
              <TapToTranslate
                text={currentParagraph.catalan}
                vocabulary={story.vocabulary}
                onAddWord={handleAddWord}
              />
            </div>

            {/* Audio button */}
            <button
              onClick={handlePlayAudio}
              className="flex items-center gap-2 text-sm text-miro-blue dark:text-miro-yellow hover:underline mb-4"
            >
              <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'animate-pulse text-miro-red' : ''}`} />
              Listen to this paragraph
            </button>

            {/* English translation (toggleable) */}
            <AnimatePresence>
              {showTranslations && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pt-4 border-t border-gray-200 dark:border-gray-700"
                >
                  <p className="text-gray-600 dark:text-gray-400 italic">
                    {currentParagraph.english}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Paragraph navigation dots */}
      <div className="flex justify-center gap-2 mb-6">
        {story.paragraphs.map((_, index) => (
          <button
            key={index}
            onClick={() => goToParagraph(index)}
            className={`
              w-2.5 h-2.5 rounded-full transition-all
              ${index === currentParagraphIndex
                ? 'bg-miro-blue dark:bg-miro-yellow w-6'
                : index < currentParagraphIndex
                  ? 'bg-miro-green'
                  : 'bg-gray-300 dark:bg-gray-600'
              }
            `}
            aria-label={`Go to paragraph ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={previousParagraph}
          disabled={currentParagraphIndex === 0}
          leftIcon={<ChevronLeft className="w-5 h-5" />}
        >
          Previous
        </Button>

        {isLastParagraph ? (
          <Button
            onClick={onComplete}
            rightIcon={<Check className="w-5 h-5" />}
            className="bg-gradient-to-r from-miro-green to-emerald-500"
          >
            Take Quiz
          </Button>
        ) : (
          <Button
            onClick={nextParagraph}
            rightIcon={<ChevronRight className="w-5 h-5" />}
          >
            Next
          </Button>
        )}
      </div>

      {/* Vocabulary hint */}
      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
        <BookOpen className="w-4 h-4 inline mr-1" />
        Tap highlighted words for translations
      </p>
    </div>
  );
}
