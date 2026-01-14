import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lightbulb,
  BookOpen,
  Globe,
  AlertTriangle,
  Volume2,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { getMnemonicData, getPronunciationTip } from '../../services/mnemonicService';
import { audioService } from '../../services/audioService';

interface MnemonicHintProps {
  catalanWord: string;
  englishWord: string;
  userMnemonic?: string;
  className?: string;
  defaultExpanded?: boolean;
}

export function MnemonicHint({
  catalanWord,
  englishWord,
  userMnemonic,
  className = '',
  defaultExpanded = false,
}: MnemonicHintProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const mnemonicData = getMnemonicData(catalanWord, englishWord);
  const pronunciationTip = getPronunciationTip(catalanWord);

  // Check if there's any data to show
  const hasContent =
    userMnemonic ||
    mnemonicData.phoneticHook ||
    mnemonicData.etymology ||
    mnemonicData.cognate ||
    mnemonicData.falseFriend ||
    mnemonicData.autoMnemonic ||
    pronunciationTip;

  if (!hasContent) {
    return null;
  }

  const handlePlayAudio = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    try {
      await audioService.speakCatalan(catalanWord);
    } finally {
      setIsPlayingAudio(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Toggle button */}
      <motion.button
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
        className="flex items-center gap-2 text-miro-yellow/80 hover:text-miro-yellow text-sm font-medium transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Lightbulb className={`w-4 h-4 ${isExpanded ? 'fill-miro-yellow' : ''}`} />
        <span>Memory Hints</span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </motion.button>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 p-4 bg-white/10 dark:bg-black/20 backdrop-blur-sm rounded-xl border border-white/20 space-y-3">
              {/* User's custom mnemonic */}
              {userMnemonic && (
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-miro-yellow mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-white/60 uppercase tracking-wide mb-1">Your Note</p>
                    <p className="text-white/90 text-sm">{userMnemonic}</p>
                  </div>
                </div>
              )}

              {/* Phonetic hook */}
              {mnemonicData.phoneticHook && (
                <div className="flex items-start gap-2">
                  <Volume2
                    className={`w-4 h-4 mt-0.5 flex-shrink-0 cursor-pointer transition-colors ${
                      isPlayingAudio ? 'text-miro-red animate-pulse' : 'text-cyan-400 hover:text-cyan-300'
                    }`}
                    onClick={handlePlayAudio}
                  />
                  <div>
                    <p className="text-xs text-white/60 uppercase tracking-wide mb-1">Sound Connection</p>
                    <p className="text-white/90 text-sm">{mnemonicData.phoneticHook}</p>
                  </div>
                </div>
              )}

              {/* Auto-generated mnemonic */}
              {mnemonicData.autoMnemonic && !mnemonicData.phoneticHook && (
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-miro-yellow mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-white/60 uppercase tracking-wide mb-1">Tip</p>
                    <p className="text-white/90 text-sm">{mnemonicData.autoMnemonic}</p>
                  </div>
                </div>
              )}

              {/* Etymology */}
              {mnemonicData.etymology && (
                <div className="flex items-start gap-2">
                  <BookOpen className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-white/60 uppercase tracking-wide mb-1">Origin</p>
                    <p className="text-white/90 text-sm">{mnemonicData.etymology.notes}</p>
                  </div>
                </div>
              )}

              {/* Cognate info */}
              {mnemonicData.cognate && (
                <div className="flex items-start gap-2">
                  <Globe className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-white/60 uppercase tracking-wide mb-1">Related Words</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {mnemonicData.cognate.spanish && (
                        <span className="text-xs bg-white/10 px-2 py-0.5 rounded">
                          ES: {mnemonicData.cognate.spanish}
                        </span>
                      )}
                      {mnemonicData.cognate.french && (
                        <span className="text-xs bg-white/10 px-2 py-0.5 rounded">
                          FR: {mnemonicData.cognate.french}
                        </span>
                      )}
                      {mnemonicData.cognate.italian && (
                        <span className="text-xs bg-white/10 px-2 py-0.5 rounded">
                          IT: {mnemonicData.cognate.italian}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* False friend warning */}
              {mnemonicData.falseFriend && (
                <div className="flex items-start gap-2 p-2 bg-miro-red/20 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-miro-red mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-white/60 uppercase tracking-wide mb-1">Watch Out!</p>
                    <p className="text-white/90 text-sm">{mnemonicData.falseFriend.tip}</p>
                  </div>
                </div>
              )}

              {/* Pronunciation tip */}
              {pronunciationTip && (
                <div className="flex items-start gap-2">
                  <Volume2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-white/60 uppercase tracking-wide mb-1">Pronunciation</p>
                    <p className="text-white/90 text-sm">{pronunciationTip}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
