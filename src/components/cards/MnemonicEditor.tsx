import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Lightbulb,
  BookOpen,
  Globe,
  AlertTriangle,
  Save,
  X,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { getMnemonicData, getPronunciationTip, suggestMemoryImage } from '../../services/mnemonicService';
import { audioService } from '../../services/audioService';

interface MnemonicEditorProps {
  catalanWord: string;
  englishWord: string;
  currentMnemonic?: string;
  onSave: (mnemonic: string) => void;
  onClose: () => void;
}

export function MnemonicEditor({
  catalanWord,
  englishWord,
  currentMnemonic = '',
  onSave,
  onClose,
}: MnemonicEditorProps) {
  const [mnemonic, setMnemonic] = useState(currentMnemonic);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const mnemonicData = getMnemonicData(catalanWord, englishWord);
  const pronunciationTip = getPronunciationTip(catalanWord);
  const visualSuggestion = suggestMemoryImage(englishWord);

  useEffect(() => {
    setMnemonic(currentMnemonic);
  }, [currentMnemonic]);

  const handlePlayAudio = async () => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    try {
      await audioService.speakCatalan(catalanWord);
    } finally {
      setIsPlayingAudio(false);
    }
  };

  const handleSave = () => {
    onSave(mnemonic.trim());
    onClose();
  };

  // Suggestion templates for user
  const suggestionTemplates = [
    mnemonicData.phoneticHook && `Sounds like: ${mnemonicData.phoneticHook}`,
    mnemonicData.etymology?.notes,
    visualSuggestion,
    pronunciationTip && `Pronunciation: ${pronunciationTip}`,
  ].filter(Boolean) as string[];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-miro-yellow/20 to-miro-orange/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-miro-yellow rounded-xl flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-gray-800" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 dark:text-white">Memory Hook</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Create your own mnemonic</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
          {/* Word display */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
            <div>
              <p className="text-lg font-bold text-miro-blue dark:text-miro-yellow">{catalanWord}</p>
              <p className="text-gray-500 dark:text-gray-400">{englishWord}</p>
            </div>
            <button
              onClick={handlePlayAudio}
              className={`p-3 rounded-full transition-colors ${
                isPlayingAudio
                  ? 'bg-miro-red/20 text-miro-red'
                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'
              }`}
            >
              <Volume2 className={`w-5 h-5 ${isPlayingAudio ? 'animate-pulse' : ''}`} />
            </button>
          </div>

          {/* Auto-generated hints */}
          {(mnemonicData.phoneticHook || mnemonicData.etymology || mnemonicData.cognate || mnemonicData.falseFriend) && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-miro-yellow" />
                Available Memory Aids
              </p>

              {/* Phonetic hook */}
              {mnemonicData.phoneticHook && (
                <div className="flex items-start gap-3 p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                  <Volume2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">{mnemonicData.phoneticHook}</p>
                </div>
              )}

              {/* Etymology */}
              {mnemonicData.etymology && (
                <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">{mnemonicData.etymology.notes}</p>
                </div>
              )}

              {/* Cognates */}
              {mnemonicData.cognate && (
                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Related words in other languages:</p>
                    <div className="flex flex-wrap gap-2">
                      {mnemonicData.cognate.spanish && (
                        <span className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-600">
                          Spanish: {mnemonicData.cognate.spanish}
                        </span>
                      )}
                      {mnemonicData.cognate.french && (
                        <span className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-600">
                          French: {mnemonicData.cognate.french}
                        </span>
                      )}
                      {mnemonicData.cognate.italian && (
                        <span className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-600">
                          Italian: {mnemonicData.cognate.italian}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* False friend warning */}
              {mnemonicData.falseFriend && (
                <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">False Friend Warning!</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{mnemonicData.falseFriend.tip}</p>
                  </div>
                </div>
              )}

              {/* Pronunciation tip */}
              {pronunciationTip && (
                <div className="flex items-start gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium mb-1">Pronunciation</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{pronunciationTip}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User's custom mnemonic */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-miro-yellow" />
              Your Personal Memory Hook
            </label>
            <textarea
              value={mnemonic}
              onChange={(e) => setMnemonic(e.target.value)}
              placeholder="Write your own mnemonic, story, or association to remember this word..."
              className="w-full h-24 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-miro-yellow focus:outline-none bg-white dark:bg-gray-900 text-gray-800 dark:text-white placeholder-gray-400 resize-none"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Tip: The sillier or more personal your mnemonic, the easier it is to remember!
            </p>
          </div>

          {/* Quick suggestion templates */}
          {suggestionTemplates.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">Quick suggestions (click to use):</p>
              <div className="flex flex-wrap gap-2">
                {suggestionTemplates.slice(0, 3).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setMnemonic(suggestion)}
                    className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg transition-colors truncate max-w-[200px]"
                    title={suggestion}
                  >
                    {suggestion.length > 40 ? suggestion.slice(0, 40) + '...' : suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <Button variant="ghost" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button
            fullWidth
            onClick={handleSave}
            leftIcon={<Save className="w-4 h-4" />}
            className="bg-gradient-to-r from-miro-yellow to-miro-orange text-gray-800"
          >
            Save Mnemonic
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
