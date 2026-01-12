import { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { audioService } from '../../services/audioService';
import type { ConversationMessage, GrammarCorrection } from '../../services/conversationService';

interface MessageBubbleProps {
  message: ConversationMessage;
  showTranslation?: boolean;
}

export function MessageBubble({ message, showTranslation = false }: MessageBubbleProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCorrections, setShowCorrections] = useState(false);
  const [showTrans, setShowTrans] = useState(showTranslation);

  const isUser = message.role === 'user';
  const hasCorrections = message.corrections && message.corrections.length > 0;

  const handlePlayAudio = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      await audioService.speakCatalan(message.content);
    } finally {
      setIsPlaying(false);
    }
  };

  const getCorrectionColor = (type: GrammarCorrection['type']) => {
    switch (type) {
      case 'grammar': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      case 'spelling': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300';
      case 'accent': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      case 'word-choice': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[85%] ${isUser ? 'order-1' : 'order-2'}`}>
        {/* Main bubble */}
        <div
          className={`
            rounded-2xl px-4 py-3 shadow-sm
            ${isUser
              ? 'bg-miro-blue text-white rounded-br-sm'
              : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-bl-sm'
            }
          `}
        >
          <p className="text-sm leading-relaxed">{message.content}</p>

          {/* Translation toggle for assistant messages */}
          {!isUser && message.translation && (
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={() => setShowTrans(!showTrans)}
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center gap-1"
              >
                {showTrans ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {showTrans ? 'Hide' : 'Show'} translation
              </button>
              {showTrans && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-xs text-gray-500 dark:text-gray-400 italic mt-1"
                >
                  {message.translation}
                </motion.p>
              )}
            </div>
          )}

          {/* Corrections indicator for user messages */}
          {isUser && hasCorrections && (
            <button
              onClick={() => setShowCorrections(!showCorrections)}
              className="mt-2 pt-2 border-t border-white/20 flex items-center gap-1 text-xs text-white/80 hover:text-white"
            >
              <AlertCircle className="w-3 h-3" />
              {message.corrections!.length} suggestion{message.corrections!.length > 1 ? 's' : ''}
              {showCorrections ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>

        {/* Actions */}
        <div className={`flex items-center gap-2 mt-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <button
            onClick={handlePlayAudio}
            className={`p-1.5 rounded-full transition-colors ${
              isPlaying
                ? 'bg-miro-red/20 text-miro-red'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Listen"
          >
            <Volume2 className={`w-3.5 h-3.5 ${isPlaying ? 'animate-pulse' : ''}`} />
          </button>
          <span className="text-xs text-gray-400">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Corrections panel */}
        {isUser && hasCorrections && showCorrections && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-2 space-y-2"
          >
            {message.corrections!.map((correction, index) => (
              <div
                key={index}
                className={`text-xs p-2 rounded-lg ${getCorrectionColor(correction.type)}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="line-through opacity-70">{correction.original}</span>
                  <span className="font-medium">→ {correction.corrected}</span>
                </div>
                <p className="text-xs opacity-80">{correction.explanation}</p>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
