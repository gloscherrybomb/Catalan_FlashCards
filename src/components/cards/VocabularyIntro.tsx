/**
 * VocabularyIntro Component
 * Teaches new vocabulary before flashcard testing
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2,
  ArrowRight,
  BookOpen,
  Sparkles,
  Languages,
  ImageOff,
  CheckCircle2,
} from 'lucide-react';
import type { StudyCard, Flashcard } from '../../types/flashcard';
import { CategoryIcon, Badge } from './CategoryIcon';
import { audioService } from '../../services/audioService';
import { imageService, type CachedImage } from '../../services/imageService';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressRing';
import { EXAMPLE_SENTENCES, type SentenceData } from '../../data/exampleSentences';
import { getCognates, getEtymology, getFalseFriend } from '../../data/etymology';

interface VocabularyIntroProps {
  cards: StudyCard[];
  onComplete: () => void;
  unitTitle?: string;
}

// Find an example sentence that contains the target word
function findExampleSentence(card: Flashcard): SentenceData | null {
  // First try to find by matching the Catalan word in the sentence
  const catalanWord = card.back.toLowerCase();
  const englishWord = card.front.toLowerCase();

  const match = EXAMPLE_SENTENCES.find(sentence => {
    const catalanSentence = sentence.catalan.toLowerCase();
    const englishSentence = sentence.english.toLowerCase();

    // Check if the Catalan word appears in the sentence
    const words = catalanSentence.split(/\s+/);
    const hasWord = words.some(w =>
      w.replace(/[.,!?;:]/g, '') === catalanWord ||
      catalanSentence.includes(catalanWord)
    );

    // Also check English for compound phrases
    const hasEnglish = englishSentence.includes(englishWord);

    return hasWord || hasEnglish;
  });

  return match || null;
}

// Escape special regex characters in a string
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Highlight the target word in a sentence
function HighlightedSentence({
  sentence,
  targetWord,
}: {
  sentence: string;
  targetWord: string;
}) {
  const escapedWord = escapeRegex(targetWord);
  const parts = sentence.split(new RegExp(`(${escapedWord})`, 'gi'));

  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === targetWord.toLowerCase() ? (
          <mark
            key={i}
            className="bg-miro-yellow/40 px-1 rounded text-miro-blue dark:text-ink-light font-semibold"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

// Single vocabulary introduction card
function VocabIntroCard({
  studyCard,
  onNext,
  isLast,
}: {
  studyCard: StudyCard;
  onNext: () => void;
  isLast: boolean;
}) {
  const { flashcard } = studyCard;
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [cardImage, setCardImage] = useState<CachedImage | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [hasPlayedAudio, setHasPlayedAudio] = useState(false);

  // Get teaching content
  const exampleSentence = useMemo(
    () => findExampleSentence(flashcard),
    [flashcard]
  );
  const cognate = useMemo(() => getCognates(flashcard.back), [flashcard.back]);
  const etymology = useMemo(() => getEtymology(flashcard.back), [flashcard.back]);
  const falseFriend = useMemo(
    () => getFalseFriend(flashcard.back),
    [flashcard.back]
  );

  // Fetch image
  useEffect(() => {
    let mounted = true;

    const fetchImage = async () => {
      if (flashcard.imageUrl) {
        setCardImage({
          word: flashcard.front,
          imageUrl: flashcard.imageUrl,
          thumbUrl: flashcard.imageThumbUrl || flashcard.imageUrl,
          attribution: flashcard.imageAttribution || '',
          cachedAt: Date.now(),
        });
        return;
      }

      if (!imageService.isConfigured()) return;

      setImageLoading(true);
      try {
        const image = await imageService.fetchImageForWord(flashcard.front);
        if (mounted && image) {
          setCardImage(image);
        }
      } catch {
        // Silently fail - image is optional
      } finally {
        if (mounted) setImageLoading(false);
      }
    };

    fetchImage();
    return () => {
      mounted = false;
    };
  }, [flashcard]);

  // Auto-play audio on mount
  useEffect(() => {
    const playAudio = async () => {
      if (!hasPlayedAudio) {
        setIsPlayingAudio(true);
        try {
          await audioService.speakCatalan(flashcard.back);
          setHasPlayedAudio(true);
        } finally {
          setIsPlayingAudio(false);
        }
      }
    };

    // Small delay before auto-play
    const timer = setTimeout(playAudio, 500);
    return () => clearTimeout(timer);
  }, [flashcard.back, hasPlayedAudio]);

  const handlePlayAudio = async () => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    try {
      await audioService.speakCatalan(flashcard.back);
    } finally {
      setIsPlayingAudio(false);
    }
  };

  const handlePlaySentence = async () => {
    if (!exampleSentence || isPlayingAudio) return;
    setIsPlayingAudio(true);
    try {
      await audioService.speakCatalan(exampleSentence.catalan);
    } finally {
      setIsPlayingAudio(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full"
    >
      <Card className="p-6 bg-gradient-to-br from-white to-miro-yellow/5 dark:from-gray-800 dark:to-miro-yellow/10 border-2 border-miro-yellow/30">
        {/* Header with category */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CategoryIcon category={flashcard.category} size="md" />
            <span className="text-sm font-medium text-miro-blue/60 dark:text-ink-light/60">
              {flashcard.category}
            </span>
          </div>
          {flashcard.gender && (
            <Badge
              text={flashcard.gender === 'masculine' ? 'M' : 'F'}
              variant={flashcard.gender}
            />
          )}
        </div>

        {/* Main word display */}
        <div className="text-center mb-6">
          {/* English word */}
          <h2 className="text-2xl font-bold text-miro-blue dark:text-ink-light mb-2">
            {flashcard.front}
          </h2>

          {/* Catalan translation - visible immediately */}
          <div className="flex items-center justify-center gap-3">
            <p className="text-3xl font-bold text-miro-green">
              {flashcard.back}
            </p>
            <button
              onClick={handlePlayAudio}
              disabled={isPlayingAudio}
              className={`p-2 rounded-full transition-colors ${
                isPlayingAudio
                  ? 'bg-miro-green text-white'
                  : 'bg-miro-green/10 hover:bg-miro-green/20 text-miro-green'
              }`}
              aria-label="Play pronunciation"
            >
              <Volume2
                className={`w-5 h-5 ${isPlayingAudio ? 'animate-pulse' : ''}`}
              />
            </button>
          </div>
        </div>

        {/* Image if available */}
        {(cardImage || imageLoading) && (
          <div className="mb-6 flex justify-center">
            {imageLoading ? (
              <div className="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse flex items-center justify-center">
                <ImageOff className="w-8 h-8 text-gray-400" />
              </div>
            ) : cardImage ? (
              <img
                src={cardImage.thumbUrl}
                alt={flashcard.front}
                className="w-32 h-32 object-cover rounded-xl shadow-md"
              />
            ) : null}
          </div>
        )}

        {/* Example sentence */}
        {exampleSentence && (
          <div className="mb-6 p-4 bg-miro-blue/5 dark:bg-miro-blue/10 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-miro-blue dark:text-ink-light" />
              <span className="text-sm font-medium text-miro-blue/60 dark:text-ink-light/60">
                Example Sentence
              </span>
              <button
                onClick={handlePlaySentence}
                disabled={isPlayingAudio}
                className="p-1 rounded-full hover:bg-miro-blue/10"
                aria-label="Play sentence"
              >
                <Volume2 className="w-3 h-3 text-miro-blue/60" />
              </button>
            </div>
            <p className="text-miro-blue dark:text-ink-light font-medium mb-1">
              <HighlightedSentence
                sentence={exampleSentence.catalan}
                targetWord={flashcard.back}
              />
            </p>
            <p className="text-sm text-miro-blue/60 dark:text-ink-light/60 italic">
              {exampleSentence.english}
            </p>
          </div>
        )}

        {/* Etymology and Cognates */}
        {(etymology || cognate || falseFriend) && (
          <div className="mb-6 space-y-3">
            {etymology && (
              <div className="p-3 bg-miro-orange/10 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-miro-orange" />
                  <span className="text-sm font-medium text-miro-orange">
                    Word Origin
                  </span>
                </div>
                <p className="text-sm text-miro-blue/80 dark:text-ink-light/80">
                  From {etymology.origin}{etymology.notes ? `: ${etymology.notes}` : ''}
                </p>
              </div>
            )}

            {cognate && (
              <div className="p-3 bg-miro-green/10 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Languages className="w-4 h-4 text-miro-green" />
                  <span className="text-sm font-medium text-miro-green">
                    Similar in Other Languages
                  </span>
                </div>
                <p className="text-sm text-miro-blue/80 dark:text-ink-light/80">
                  {cognate.spanish && <span>Spanish: <strong>{cognate.spanish}</strong> | </span>}
                  {cognate.french && <span>French: <strong>{cognate.french}</strong> | </span>}
                  {cognate.italian && <span>Italian: <strong>{cognate.italian}</strong></span>}
                </p>
              </div>
            )}

            {falseFriend && (
              <div className="p-3 bg-miro-red/10 rounded-lg border border-miro-red/20">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-miro-red font-bold">!</span>
                  <span className="text-sm font-medium text-miro-red">
                    False Friend Warning
                  </span>
                </div>
                <p className="text-sm text-miro-blue/80 dark:text-ink-light/80">
                  Don't confuse with "{falseFriend.looksLike}" which means "
                  {falseFriend.actualMeaning}"
                </p>
              </div>
            )}
          </div>
        )}

        {/* Notes if available */}
        {flashcard.notes && (
          <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-sm text-miro-blue/70 dark:text-ink-light/70">
              {flashcard.notes}
            </p>
          </div>
        )}

        {/* Continue button */}
        <Button
          fullWidth
          onClick={onNext}
          rightIcon={
            isLast ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <ArrowRight className="w-5 h-5" />
            )
          }
        >
          {isLast ? 'Start Practice' : 'Got it!'}
        </Button>
      </Card>
    </motion.div>
  );
}

export function VocabularyIntro({
  cards,
  onComplete,
  unitTitle,
}: VocabularyIntroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Guard against empty cards
  if (!cards || cards.length === 0) {
    onComplete();
    return null;
  }

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  const progress = Math.round(((currentIndex + 1) / cards.length) * 100);

  return (
    <div className="w-full max-w-md mx-auto px-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-miro-yellow" />
          <h1 className="text-lg font-bold text-miro-blue dark:text-ink-light">
            Learn New Words
          </h1>
        </div>
        {unitTitle && (
          <p className="text-sm text-miro-blue/60 dark:text-ink-light/60">
            {unitTitle}
          </p>
        )}
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-miro-blue/60 dark:text-ink-light/60">
            Word {currentIndex + 1} of {cards.length}
          </span>
          <span className="text-sm font-medium text-miro-green">{progress}%</span>
        </div>
        <ProgressBar progress={progress} />
      </div>

      {/* Current word card */}
      <AnimatePresence mode="wait">
        <VocabIntroCard
          key={cards[currentIndex].flashcard.id}
          studyCard={cards[currentIndex]}
          onNext={handleNext}
          isLast={currentIndex === cards.length - 1}
        />
      </AnimatePresence>
    </div>
  );
}
