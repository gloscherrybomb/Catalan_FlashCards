import { motion } from 'framer-motion';
import { Check, X, AlertCircle, Volume2, RefreshCw, Lightbulb } from 'lucide-react';
import { Button } from './Button';

interface PronunciationFeedbackProps {
  score: number;
  feedback: string;
  isAcceptable: boolean;
  spokenText: string;
  expectedText: string;
  tips?: string[];
  onTryAgain: () => void;
  onListenAgain: () => void;
  onContinue: () => void;
  className?: string;
}

export function PronunciationFeedback({
  score,
  feedback,
  isAcceptable,
  spokenText,
  expectedText,
  tips = [],
  onTryAgain,
  onListenAgain,
  onContinue,
  className = '',
}: PronunciationFeedbackProps) {
  const getScoreColor = () => {
    if (score >= 90) return 'text-green-500';
    if (score >= 75) return 'text-lime-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreGradient = () => {
    if (score >= 90) return 'from-green-500 to-emerald-500';
    if (score >= 75) return 'from-lime-500 to-green-500';
    if (score >= 60) return 'from-yellow-500 to-lime-500';
    if (score >= 40) return 'from-orange-500 to-yellow-500';
    return 'from-red-500 to-orange-500';
  };

  const getIcon = () => {
    if (score >= 75) return <Check className="w-8 h-8" />;
    if (score >= 40) return <AlertCircle className="w-8 h-8" />;
    return <X className="w-8 h-8" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 ${className}`}
    >
      {/* Score Display */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          {/* Circular progress ring */}
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />
            <motion.circle
              cx="64"
              cy="64"
              r="56"
              stroke="url(#scoreGradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 56}
              initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
              animate={{
                strokeDashoffset: 2 * Math.PI * 56 * (1 - score / 100),
              }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" className={`${getScoreGradient().split(' ')[0].replace('from-', 'text-')}`} stopColor="currentColor" />
                <stop offset="100%" className={`${getScoreGradient().split(' ')[1].replace('to-', 'text-')}`} stopColor="currentColor" />
              </linearGradient>
            </defs>
          </svg>

          {/* Score number */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className={`text-4xl font-bold ${getScoreColor()}`}
            >
              {score}%
            </motion.span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              accuracy
            </span>
          </div>
        </div>
      </div>

      {/* Result icon and feedback */}
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-3 ${
            isAcceptable
              ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
              : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600'
          }`}
        >
          {getIcon()}
        </motion.div>
        <p className="text-lg font-medium text-gray-900 dark:text-white">
          {feedback}
        </p>
      </div>

      {/* Comparison */}
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 mb-6 space-y-3">
        <div>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            You said:
          </span>
          <p className="text-gray-700 dark:text-gray-300 mt-1 font-medium">
            "{spokenText || '...'}"
          </p>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Target:
          </span>
          <p className="text-gray-900 dark:text-white mt-1 font-medium">
            "{expectedText}"
          </p>
        </div>
      </div>

      {/* Tips */}
      {tips.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 mb-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
              Pronunciation Tips
            </span>
          </div>
          <ul className="space-y-1">
            {tips.map((tip, index) => (
              <li
                key={index}
                className="text-sm text-amber-700 dark:text-amber-200 flex items-start gap-2"
              >
                <span className="text-amber-500">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col gap-2">
        {isAcceptable ? (
          <Button
            onClick={onContinue}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            <Check className="w-4 h-4 mr-2" />
            Continue
          </Button>
        ) : (
          <Button
            onClick={onTryAgain}
            className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onListenAgain}
            className="flex-1"
          >
            <Volume2 className="w-4 h-4 mr-2" />
            Listen Again
          </Button>
          {!isAcceptable && (
            <Button
              variant="ghost"
              onClick={onContinue}
              className="flex-1 text-gray-500"
            >
              Skip
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
