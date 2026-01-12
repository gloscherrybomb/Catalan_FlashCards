import { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Sparkles } from 'lucide-react';
import type { ConjugationTable as ConjugationTableType } from '../../data/grammarLessons';
import { audioService } from '../../services/audioService';

interface ConjugationTableProps {
  table: ConjugationTableType;
  showAudio?: boolean;
}

export function ConjugationTable({ table, showAudio = true }: ConjugationTableProps) {
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  const handlePlayAudio = async (form: string, index: number) => {
    setPlayingIndex(index);
    try {
      await audioService.speakCatalan(form);
    } finally {
      setPlayingIndex(null);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative"
    >
      {/* Decorative background blob */}
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-miro-yellow/10 rounded-blob -z-10 blur-xl" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-lg font-bold text-miro-blue dark:text-ink-light flex items-center gap-2">
            <span className="text-2xl">{table.verb}</span>
            <span className="text-sm font-normal text-miro-blue/60 dark:text-ink-light/60">
              ({table.verbEnglish})
            </span>
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 bg-miro-blue/10 dark:bg-miro-blue/20 rounded-full text-xs font-medium text-miro-blue dark:text-ink-light">
              {table.tense}
            </span>
          </div>
        </div>
        <Sparkles className="w-6 h-6 text-miro-yellow animate-pulse" />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border-3 border-miro-blue/20 dark:border-ink-light/20 bg-white dark:bg-gray-800">
        {/* Table Header */}
        <div className="grid grid-cols-3 bg-miro-blue/5 dark:bg-miro-blue/10 border-b-2 border-miro-blue/10 dark:border-ink-light/10">
          <div className="px-4 py-3 text-sm font-bold text-miro-blue/70 dark:text-ink-light/70 uppercase tracking-wider">
            Pronoun
          </div>
          <div className="px-4 py-3 text-sm font-bold text-miro-blue/70 dark:text-ink-light/70 uppercase tracking-wider">
            Form
          </div>
          {showAudio && (
            <div className="px-4 py-3 text-sm font-bold text-miro-blue/70 dark:text-ink-light/70 uppercase tracking-wider text-center">
              Listen
            </div>
          )}
        </div>

        {/* Table Body */}
        <div className="divide-y divide-miro-blue/10 dark:divide-ink-light/10">
          {table.conjugations.map((conj, index) => (
            <motion.div
              key={conj.pronoun}
              variants={rowVariants}
              className={`grid grid-cols-3 items-center transition-colors hover:bg-miro-yellow/5 dark:hover:bg-miro-yellow/10 ${
                conj.irregular
                  ? 'bg-miro-orange/5 dark:bg-miro-orange/10'
                  : ''
              }`}
            >
              {/* Pronoun */}
              <div className="px-4 py-3">
                <span className="text-miro-blue/60 dark:text-ink-light/60 text-sm">
                  {conj.pronoun}
                </span>
              </div>

              {/* Form */}
              <div className="px-4 py-3">
                <span
                  className={`font-bold text-lg ${
                    conj.irregular
                      ? 'text-miro-orange'
                      : 'text-miro-blue dark:text-ink-light'
                  }`}
                >
                  {conj.form}
                </span>
                {conj.irregular && (
                  <span className="ml-2 text-xs px-1.5 py-0.5 bg-miro-orange/20 text-miro-orange rounded-full">
                    irregular
                  </span>
                )}
              </div>

              {/* Audio Button */}
              {showAudio && (
                <div className="px-4 py-3 text-center">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePlayAudio(conj.form, index)}
                    disabled={playingIndex !== null}
                    className={`p-2 rounded-xl transition-all ${
                      playingIndex === index
                        ? 'bg-miro-green text-white'
                        : 'bg-miro-blue/10 dark:bg-miro-blue/20 text-miro-blue dark:text-ink-light hover:bg-miro-blue/20 dark:hover:bg-miro-blue/30'
                    }`}
                  >
                    <Volume2
                      className={`w-4 h-4 ${
                        playingIndex === index ? 'animate-pulse' : ''
                      }`}
                    />
                  </motion.button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Pattern hint */}
      <div className="mt-4 p-3 bg-miro-green/5 dark:bg-miro-green/10 rounded-xl border border-miro-green/20">
        <p className="text-sm text-miro-blue/70 dark:text-ink-light/70">
          <span className="font-bold text-miro-green">Pattern:</span> Remove{' '}
          <span className="font-mono bg-miro-blue/10 dark:bg-miro-blue/20 px-1 rounded">
            -{table.verb.slice(-2)}
          </span>{' '}
          and add the endings shown above.
        </p>
      </div>
    </motion.div>
  );
}
