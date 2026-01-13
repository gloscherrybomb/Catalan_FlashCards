import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, Star, ArrowUp } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Level, LEVELS } from '../../types/gamification';

interface LevelUpCelebrationProps {
  show: boolean;
  previousLevel: Level;
  newLevel: Level;
  onClose: () => void;
}

export function LevelUpCelebration({
  show,
  previousLevel,
  newLevel,
  onClose,
}: LevelUpCelebrationProps) {
  const [, setStage] = useState<'entering' | 'revealed' | 'closing'>('entering');

  useEffect(() => {
    if (show) {
      setStage('entering');

      // Trigger confetti
      const duration = 3000;
      const end = Date.now() + duration;

      const colors = ['#E63946', '#F4A261', '#2A9D8F', '#264653', '#E9C46A'];

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();

      // Progress through stages
      const timer1 = setTimeout(() => setStage('revealed'), 500);
      const timer2 = setTimeout(() => {
        setStage('closing');
        setTimeout(onClose, 500);
      }, 4000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
            className="relative bg-gradient-to-br from-miro-blue via-miro-green to-miro-yellow p-1 rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white dark:bg-ink-dark rounded-3xl p-8 min-w-[320px] relative overflow-hidden">
              {/* Background decorations */}
              <motion.div
                className="absolute -top-10 -right-10 w-32 h-32 bg-miro-yellow/20 blob"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute -bottom-10 -left-10 w-28 h-28 bg-miro-red/10 blob-2"
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              />

              {/* Stars */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    top: `${20 + Math.random() * 60}%`,
                    left: `${10 + Math.random() * 80}%`,
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
                  transition={{
                    duration: 2,
                    delay: i * 0.3,
                    repeat: Infinity,
                  }}
                >
                  <Star className="w-4 h-4 text-miro-yellow fill-miro-yellow" />
                </motion.div>
              ))}

              {/* Level up icon */}
              <motion.div
                className="mx-auto w-20 h-20 bg-gradient-to-br from-miro-yellow to-miro-orange rounded-2xl flex items-center justify-center mb-4 relative"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="w-10 h-10 text-white" />
                </motion.div>
                <motion.div
                  className="absolute -top-2 -right-2 bg-miro-red rounded-full p-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ delay: 0.5, duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                >
                  <ArrowUp className="w-4 h-4 text-white" />
                </motion.div>
              </motion.div>

              {/* Title */}
              <motion.h2
                className="text-3xl font-display font-bold text-center text-miro-blue dark:text-ink-light mb-2"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Level Up!
              </motion.h2>

              {/* Level transition */}
              <motion.div
                className="flex items-center justify-center gap-4 my-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="text-center opacity-50">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold text-white mx-auto mb-1"
                    style={{ backgroundColor: previousLevel.color }}
                  >
                    {previousLevel.level}
                  </div>
                  <p className="text-xs text-miro-blue/60 dark:text-ink-light/60">
                    {previousLevel.title}
                  </p>
                </div>

                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <ArrowUp className="w-6 h-6 text-miro-green rotate-90" />
                </motion.div>

                <motion.div
                  className="text-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ delay: 0.7, type: 'spring' }}
                >
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl font-bold text-white mx-auto mb-1 shadow-lg"
                    style={{ backgroundColor: newLevel.color }}
                  >
                    {newLevel.level}
                  </div>
                  <p className="font-semibold text-miro-blue dark:text-ink-light">
                    {newLevel.title}
                  </p>
                  <p className="text-xs text-miro-blue/60 dark:text-ink-light/60">
                    {newLevel.titleCatalan}
                  </p>
                </motion.div>
              </motion.div>

              {/* XP info */}
              <motion.div
                className="bg-miro-blue/5 dark:bg-ink-light/5 rounded-xl p-4 text-center"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <p className="text-sm text-miro-blue/60 dark:text-ink-light/60">
                  {newLevel.level < 12 ? (
                    <>
                      Next level at{' '}
                      <span className="font-bold text-miro-blue dark:text-ink-light">
                        {LEVELS[newLevel.level]?.xpRequired.toLocaleString()} XP
                      </span>
                    </>
                  ) : (
                    <span className="font-bold text-miro-yellow">
                      Maximum level reached!
                    </span>
                  )}
                </p>
              </motion.div>

              {/* Trophy for high levels */}
              {newLevel.level >= 10 && (
                <motion.div
                  className="absolute top-4 right-4"
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 1.2, type: 'spring' }}
                >
                  <Trophy className="w-8 h-8 text-miro-yellow" />
                </motion.div>
              )}

              {/* Tap to continue */}
              <motion.p
                className="text-center text-xs text-miro-blue/40 dark:text-ink-light/40 mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0.5, 1] }}
                transition={{ delay: 2, duration: 2, repeat: Infinity }}
              >
                Tap anywhere to continue
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook to track level changes
export function useLevelUpCelebration() {
  const [celebration, setCelebration] = useState<{
    show: boolean;
    previousLevel: Level;
    newLevel: Level;
  } | null>(null);

  const triggerCelebration = (previousLevel: Level, newLevel: Level) => {
    setCelebration({ show: true, previousLevel, newLevel });
  };

  const closeCelebration = () => {
    setCelebration(null);
  };

  return { celebration, triggerCelebration, closeCelebration };
}
