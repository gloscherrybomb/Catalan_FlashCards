import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Volume2 } from 'lucide-react';
import type { StudyCard } from '../../types/flashcard';
import { CategoryIcon, Badge, CardDecoration } from './CategoryIcon';
import { Button } from '../ui/Button';
import { audioService } from '../../services/audioService';

interface FlashCardProps {
  studyCard: StudyCard;
  onRate: (quality: number) => void;
  showHints?: boolean;
}

export function FlashCard({ studyCard, onRate, showHints = true }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const { flashcard, direction } = studyCard;

  const front = direction === 'english-to-catalan' ? flashcard.front : flashcard.back;
  const back = direction === 'english-to-catalan' ? flashcard.back : flashcard.front;
  const frontLabel = direction === 'english-to-catalan' ? 'English' : 'Català';
  const backLabel = direction === 'english-to-catalan' ? 'Català' : 'English';

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

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Card container with perspective */}
      <div
        className="perspective-1000 cursor-pointer"
        onClick={handleFlip}
      >
        <motion.div
          className="relative w-full h-72 preserve-3d"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
        >
          {/* Front of card */}
          <div className="absolute inset-0 backface-hidden">
            <div className="w-full h-full bg-white rounded-3xl shadow-playful p-6 flex flex-col items-center justify-center relative overflow-hidden">
              <CardDecoration category={flashcard.category} />

              <div className="absolute top-4 left-4">
                <CategoryIcon category={flashcard.category} word={front} size="md" />
              </div>

              <span className="absolute top-4 right-4 text-xs font-medium text-gray-400 uppercase">
                {frontLabel}
              </span>

              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-800 text-center px-4">
                    {front}
                  </h2>
                  <button
                    onClick={(e) => handlePlayAudio(e, front, direction === 'catalan-to-english')}
                    className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-500 hover:text-primary hover:bg-primary/5 rounded-full transition-colors"
                  >
                    <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'animate-pulse text-primary' : ''}`} />
                    Listen
                  </button>
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

              <p className="mt-4 text-sm text-gray-400">Tap to reveal</p>
            </div>
          </div>

          {/* Back of card */}
          <div className="absolute inset-0 backface-hidden rotate-y-180">
            <div className="w-full h-full bg-gradient-to-br from-secondary to-secondary-600 rounded-3xl shadow-playful p-6 flex flex-col items-center justify-center">
              <span className="absolute top-4 right-4 text-xs font-medium text-white/70 uppercase">
                {backLabel}
              </span>

              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-white text-center px-4">
                    {back}
                  </h2>
                  <button
                    onClick={(e) => handlePlayAudio(e, back, direction === 'english-to-catalan')}
                    className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                  >
                    <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'animate-pulse' : ''}`} />
                    Listen
                  </button>
                </div>
              </div>

              {flashcard.notes && showHints && (
                <AnimatePresence>
                  {showHint ? (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-sm text-white/80 text-center mb-4"
                    >
                      {flashcard.notes}
                    </motion.p>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowHint(true);
                      }}
                      className="flex items-center gap-1 text-white/70 hover:text-white text-sm mb-4"
                    >
                      <Lightbulb size={14} />
                      Show hint
                    </button>
                  )}
                </AnimatePresence>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Rating buttons (shown after flip) */}
      <AnimatePresence>
        {isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-6 space-y-4"
          >
            <p className="text-center text-gray-600 text-sm">How well did you know this?</p>

            <div className="grid grid-cols-4 gap-2">
              <Button
                variant="ghost"
                className="flex-col py-3 bg-red-50 hover:bg-red-100 text-red-600"
                onClick={() => handleRate(1)}
              >
                <span className="text-lg">😵</span>
                <span className="text-xs">Again</span>
              </Button>

              <Button
                variant="ghost"
                className="flex-col py-3 bg-orange-50 hover:bg-orange-100 text-orange-600"
                onClick={() => handleRate(3)}
              >
                <span className="text-lg">😅</span>
                <span className="text-xs">Hard</span>
              </Button>

              <Button
                variant="ghost"
                className="flex-col py-3 bg-blue-50 hover:bg-blue-100 text-blue-600"
                onClick={() => handleRate(4)}
              >
                <span className="text-lg">🙂</span>
                <span className="text-xs">Good</span>
              </Button>

              <Button
                variant="ghost"
                className="flex-col py-3 bg-green-50 hover:bg-green-100 text-green-600"
                onClick={() => handleRate(5)}
              >
                <span className="text-lg">🤩</span>
                <span className="text-xs">Easy</span>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
