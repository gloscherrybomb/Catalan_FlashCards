import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { logger } from '../../services/logger';
import { Lightbulb, Volume2, ImageOff, BookOpen } from 'lucide-react';
import type { StudyCard } from '../../types/flashcard';
import { CategoryIcon, Badge, CardDecoration } from './CategoryIcon';
import { audioService } from '../../services/audioService';
import { imageService, type CachedImage } from '../../services/imageService';
import { MnemonicHint } from './MnemonicHint';
import { stripBracketedContent } from '../../utils/textUtils';
import { EXAMPLE_SENTENCES, type SentenceData } from '../../data/exampleSentences';
import { getRelatedGrammar, grammarLessonExists } from '../../utils/grammarMapping';

// Find an example sentence containing the target word
function findExampleSentence(word: string, catalanWord: string): SentenceData | null {
  const lowerWord = word.toLowerCase();
  const lowerCatalan = catalanWord.toLowerCase();

  // First try matching Catalan word in Catalan sentence
  const match = EXAMPLE_SENTENCES.find(sentence => {
    const catalanSentence = sentence.catalan.toLowerCase();
    const englishSentence = sentence.english.toLowerCase();

    // Check if Catalan word appears in the sentence
    const catalanWords = catalanSentence.split(/\s+/).map(w => w.replace(/[.,!?;:'"]/g, ''));
    const hasWord = catalanWords.includes(lowerCatalan) || catalanSentence.includes(lowerCatalan);

    // Also check English
    const hasEnglish = englishSentence.includes(lowerWord);

    return hasWord || hasEnglish;
  });

  return match || null;
}

interface FlashCardProps {
  studyCard: StudyCard;
  onRate: (quality: number) => void;
  showHints?: boolean;
}

export function FlashCard({ studyCard, onRate, showHints = true }: FlashCardProps) {
  const navigate = useNavigate();
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [cardImage, setCardImage] = useState<CachedImage | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const { flashcard, direction } = studyCard;

  // Get related grammar lesson
  const relatedGrammar = useMemo(() => {
    const grammar = getRelatedGrammar(flashcard);
    if (grammar && grammarLessonExists(grammar.lessonId)) {
      return grammar;
    }
    return null;
  }, [flashcard]);

  // Fetch image for the card on mount
  useEffect(() => {
    let mounted = true;

    const fetchImage = async () => {
      // Reset state for new card
      setCardImage(null);
      setImageFailed(false);
      setImageLoading(false);

      // Use existing image data from flashcard if available
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

      // Only fetch if service is configured
      if (!imageService.isConfigured()) {
        // No API key - skip images silently
        return;
      }

      setImageLoading(true);
      try {
        // Use the English word (front) for searching
        const image = await imageService.fetchImageForWord(flashcard.front);
        if (mounted) {
          if (image) {
            setCardImage(image);
          } else {
            // No image found for this word
            setImageFailed(true);
          }
        }
      } catch (error) {
        logger.error('Failed to fetch image', 'FlashCard', { error: String(error) });
        if (mounted) {
          setImageFailed(true);
        }
      } finally {
        if (mounted) {
          setImageLoading(false);
        }
      }
    };

    fetchImage();

    return () => {
      mounted = false;
    };
  }, [flashcard.id, flashcard.front, flashcard.imageUrl, flashcard.imageThumbUrl, flashcard.imageAttribution]);

  const front = stripBracketedContent(direction === 'english-to-catalan' ? flashcard.front : flashcard.back);
  const back = stripBracketedContent(direction === 'english-to-catalan' ? flashcard.back : flashcard.front);
  const frontLabel = direction === 'english-to-catalan' ? 'English' : 'Catala';
  const backLabel = direction === 'english-to-catalan' ? 'Catala' : 'English';

  // Find example sentence for context
  const exampleSentence = useMemo(
    () => findExampleSentence(flashcard.front, flashcard.back),
    [flashcard.front, flashcard.back]
  );

  const handleFlip = () => {
    if (!isFlipped) {
      setIsFlipped(true);
    }
  };

  const handleRate = (quality: number) => {
    setIsFlipped(false);
    setShowHint(false);
    onRate(quality);
  };

  const handlePlayAudio = async (e: React.MouseEvent, text: string, isCatalan: boolean) => {
    e.stopPropagation();
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    try {
      if (isCatalan) {
        await audioService.speakCatalan(text);
      } else {
        await audioService.speakEnglish(text);
      }
    } finally {
      setIsPlayingAudio(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isFlipped) {
        handleFlip();
      }
    }
    // Number keys for rating when card is flipped
    if (isFlipped) {
      if (e.key === '1') handleRate(1);
      if (e.key === '2' || e.key === '3') handleRate(3);
      if (e.key === '4') handleRate(4);
      if (e.key === '5') handleRate(5);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Card container with perspective */}
      <div
        className="perspective-1000 cursor-pointer"
        onClick={handleFlip}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`Flashcard: ${front}. Press Enter or Space to flip${isFlipped ? ', or use number keys 1-5 to rate' : ''}`}
      >
        <motion.div
          className="relative w-full h-80 preserve-3d"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 80, damping: 15 }}
        >
          {/* Front of card */}
          <div className="absolute inset-0 backface-hidden">
            <div className="w-full h-full bg-white dark:bg-gray-800 rounded-3xl border-3 border-miro-blue dark:border-ink-light/50 shadow-playful p-6 flex flex-col items-center justify-center relative overflow-hidden">
              {/* Decorative elements */}
              <CardDecoration category={flashcard.category} />

              {/* Corner blobs */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-miro-yellow/30 blob" />
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-miro-red/20 blob-2" />

              <div className="absolute top-4 left-4">
                <CategoryIcon category={flashcard.category} word={front} size="md" />
              </div>

              <span className="absolute top-4 right-4 text-xs font-bold text-miro-blue/50 dark:text-ink-light/50 uppercase tracking-wider">
                {frontLabel}
              </span>

              <div className="flex-1 flex items-center justify-center w-full">
                <div className="text-center w-full">
                  {/* Card Image - only show when English is on front (don't give away Catalan answer) */}
                  {direction === 'english-to-catalan' && cardImage && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mb-4 mx-auto"
                    >
                      <div className="relative w-32 h-32 mx-auto rounded-2xl overflow-hidden border-3 border-miro-yellow/50 shadow-playful-sm">
                        <img
                          src={cardImage.thumbUrl || cardImage.imageUrl}
                          alt={front}
                          className="w-full h-full object-cover"
                          onError={() => setImageFailed(true)}
                        />
                        {/* Loading shimmer overlay */}
                        {imageLoading && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                        )}
                      </div>
                      {cardImage.attribution && (
                        <p className="text-[10px] text-miro-blue/30 dark:text-ink-light/30 mt-1 truncate max-w-[200px] mx-auto">
                          {cardImage.attribution}
                        </p>
                      )}
                    </motion.div>
                  )}

                  {/* Loading state - only show when English is on front */}
                  {direction === 'english-to-catalan' && imageLoading && !cardImage && (
                    <div className="mb-4 mx-auto">
                      <div className="w-32 h-32 mx-auto rounded-2xl bg-gray-100 dark:bg-gray-700 animate-pulse flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-miro-yellow border-t-transparent rounded-full animate-spin" />
                      </div>
                    </div>
                  )}

                  {/* Failed image state - only show when English is on front */}
                  {direction === 'english-to-catalan' && imageFailed && !cardImage && (
                    <div className="mb-4 mx-auto">
                      <div className="w-24 h-24 mx-auto rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <ImageOff className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                      </div>
                    </div>
                  )}

                  <motion.h2
                    className="text-3xl md:text-4xl font-display font-bold text-miro-blue dark:text-ink-light text-center px-4"
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {front}
                  </motion.h2>

                  {/* Example sentence for context */}
                  {exampleSentence && direction === 'english-to-catalan' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="mt-3 px-4 py-2 bg-miro-yellow/10 dark:bg-miro-yellow/5 rounded-lg max-w-xs mx-auto"
                    >
                      <p className="text-xs text-miro-blue/60 dark:text-ink-light/60 italic">
                        "{exampleSentence.english}"
                      </p>
                    </motion.div>
                  )}

                  <div className="flex flex-col items-center gap-1">
                    <motion.button
                      onClick={(e) => handlePlayAudio(e, front, direction === 'catalan-to-english')}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm text-miro-blue/70 dark:text-ink-light/70 hover:text-miro-red hover:bg-miro-red/10 rounded-xl transition-colors font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label={`Listen to pronunciation of "${front}"`}
                    >
                      <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'animate-pulse text-miro-red' : ''}`} aria-hidden="true" />
                      Listen
                    </motion.button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {flashcard.gender && (
                  <Badge
                    text={flashcard.gender === 'masculine' ? 'M' : 'F'}
                    variant={flashcard.gender}
                  />
                )}
                <Badge text={flashcard.category} />
              </div>

              <p className="mt-4 text-sm text-miro-blue/40 dark:text-ink-light/40 font-medium">
                Tap to reveal ✦
              </p>
            </div>
          </div>

          {/* Back of card */}
          <div className="absolute inset-0 backface-hidden rotate-y-180">
            <div className="w-full h-full bg-miro-green rounded-3xl border-3 border-miro-blue dark:border-ink-light/50 shadow-playful p-6 flex flex-col items-center justify-center relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute -top-6 -left-6 w-20 h-20 bg-miro-yellow/30 blob" />
              <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-miro-blue/20 blob-2" />
              <motion.span
                className="absolute top-6 left-6 text-2xl text-white/30"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                ✦
              </motion.span>

              <span className="absolute top-4 right-4 text-xs font-bold text-white/60 uppercase tracking-wider">
                {backLabel}
              </span>

              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <motion.h2
                    className="text-3xl md:text-4xl font-display font-bold text-white text-center px-4"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                  >
                    {back}
                  </motion.h2>
                  <div className="flex flex-col items-center gap-1">
                    <motion.button
                      onClick={(e) => handlePlayAudio(e, back, direction === 'english-to-catalan')}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label={`Listen to pronunciation of "${back}"`}
                    >
                      <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'animate-pulse' : ''}`} aria-hidden="true" />
                      Listen
                    </motion.button>
                  </div>
                </div>
              </div>

              {flashcard.notes && showHints && (
                <AnimatePresence>
                  {showHint ? (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-sm text-white/90 text-center mb-4 bg-white/10 px-4 py-2 rounded-xl"
                    >
                      {flashcard.notes}
                    </motion.p>
                  ) : (
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowHint(true);
                      }}
                      className="flex items-center gap-2 text-white/70 hover:text-white text-sm mb-4 font-medium"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Lightbulb size={16} />
                      Show hint
                    </motion.button>
                  )}
                </AnimatePresence>
              )}

              {/* Mnemonic hints - shown expanded by default */}
              <MnemonicHint
                catalanWord={flashcard.back}
                englishWord={flashcard.front}
                userMnemonic={flashcard.userMnemonic}
                className="mb-2"
                defaultExpanded={true}
              />

              {/* Related grammar lesson link */}
              {relatedGrammar && (
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/grammar/${relatedGrammar.lessonId}`);
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 hover:text-white text-sm font-medium transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{relatedGrammar.title}</span>
                  <span className="text-xs text-white/60">- {relatedGrammar.reason}</span>
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Rating buttons (shown after flip) */}
      <AnimatePresence>
        {isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 100 }}
            className="mt-8 space-y-4"
          >
            <p className="text-center text-miro-blue/70 dark:text-ink-light/70 text-sm font-medium">
              How well did you know this?
            </p>

            <div className="grid grid-cols-4 gap-3">
              <motion.button
                className="flex flex-col items-center py-3 px-2 bg-miro-red/10 hover:bg-miro-red/20 text-miro-red rounded-xl border-2 border-miro-red/30 transition-colors"
                onClick={() => handleRate(1)}
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-label="I didn't remember this card - show it again soon (press 1)"
              >
                <span className="text-2xl mb-1" aria-hidden="true">😵</span>
                <span className="text-xs font-semibold">Again</span>
                <span className="text-[10px] opacity-50 mt-0.5">1</span>
              </motion.button>

              <motion.button
                className="flex flex-col items-center py-3 px-2 bg-miro-orange/10 hover:bg-miro-orange/20 text-miro-orange rounded-xl border-2 border-miro-orange/30 transition-colors"
                onClick={() => handleRate(3)}
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-label="This was hard - I struggled to remember (press 2 or 3)"
              >
                <span className="text-2xl mb-1" aria-hidden="true">😅</span>
                <span className="text-xs font-semibold">Hard</span>
                <span className="text-[10px] opacity-50 mt-0.5">2-3</span>
              </motion.button>

              <motion.button
                className="flex flex-col items-center py-3 px-2 bg-miro-blue/10 hover:bg-miro-blue/20 text-miro-blue dark:text-ink-light rounded-xl border-2 border-miro-blue/30 dark:border-ink-light/30 transition-colors"
                onClick={() => handleRate(4)}
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-label="Good - I remembered it with some effort (press 4)"
              >
                <span className="text-2xl mb-1" aria-hidden="true">🙂</span>
                <span className="text-xs font-semibold">Good</span>
                <span className="text-[10px] opacity-50 mt-0.5">4</span>
              </motion.button>

              <motion.button
                className="flex flex-col items-center py-3 px-2 bg-miro-green/10 hover:bg-miro-green/20 text-miro-green rounded-xl border-2 border-miro-green/30 transition-colors"
                onClick={() => handleRate(5)}
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-label="Easy - I knew it instantly (press 5)"
              >
                <span className="text-2xl mb-1" aria-hidden="true">🤩</span>
                <span className="text-xs font-semibold">Easy</span>
                <span className="text-[10px] opacity-50 mt-0.5">5</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
