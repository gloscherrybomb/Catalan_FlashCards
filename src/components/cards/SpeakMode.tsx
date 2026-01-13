import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { logger } from '../../services/logger';
import { Mic, Volume2, StopCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { PronunciationFeedback } from '../ui/PronunciationFeedback';
import { SimpleWaveform } from '../ui/WaveformVisualizer';
import {
  speechRecognitionService,
  calculatePronunciationScore,
  getCatalanPronunciationTips,
  type SpeechResult,
} from '../../services/speechRecognitionService';
import { audioService } from '../../services/audioService';
import type { StudyCard } from '../../types/flashcard';
import { stripBracketedContent } from '../../utils/textUtils';

interface SpeakModeProps {
  studyCard: StudyCard;
  onComplete: (score: number, correct: boolean) => void;
  onSkip?: () => void;
}

type Phase = 'intro' | 'listen' | 'record' | 'result';

export function SpeakMode({ studyCard, onComplete, onSkip }: SpeakModeProps) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [interimText, setInterimText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    score: number;
    feedback: string;
    isAcceptable: boolean;
  } | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const { flashcard } = studyCard;

  // For pronunciation practice, we always speak Catalan
  const textToSpeak = stripBracketedContent(flashcard.back); // Catalan text
  const translationHint = stripBracketedContent(flashcard.front); // English translation

  // Check for speech recognition support
  const isSupported = speechRecognitionService.isSupported();

  useEffect(() => {
    // Check microphone permission on mount
    checkPermission();

    return () => {
      speechRecognitionService.abort();
      audioService.stop();
    };
  }, []);

  const checkPermission = async () => {
    if (!isSupported) {
      setHasPermission(false);
      return;
    }

    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      setHasPermission(result.state === 'granted');
    } catch {
      // Some browsers don't support permission query for microphone
      setHasPermission(null);
    }
  };

  const requestPermission = async () => {
    const granted = await speechRecognitionService.requestPermission();
    setHasPermission(granted);
    if (granted) {
      setPhase('intro');
    }
  };

  const playNativeAudio = useCallback(async () => {
    setIsPlaying(true);
    setError(null);
    try {
      await audioService.speakCatalan(textToSpeak);
    } catch (err) {
      logger.error('Audio playback error', 'SpeakMode', { error: String(err) });
    } finally {
      setIsPlaying(false);
    }
  }, [textToSpeak]);

  const handleListenFirst = async () => {
    setPhase('listen');
    await playNativeAudio();
    setPhase('record');
  };

  const startRecording = useCallback(async () => {
    setError(null);
    setSpokenText('');
    setInterimText('');

    // Set up callbacks
    speechRecognitionService.onResult((result: SpeechResult) => {
      if (result.isFinal) {
        setSpokenText(result.transcript);
        setInterimText('');
      } else {
        setInterimText(result.transcript);
      }
    });

    speechRecognitionService.onError((errorMsg: string) => {
      setError(errorMsg);
      setIsListening(false);
    });

    speechRecognitionService.onEnd(() => {
      setIsListening(false);
    });

    try {
      await speechRecognitionService.startListening({
        language: 'ca-ES',
        continuous: false,
        interimResults: true,
      });
      setIsListening(true);
    } catch (err) {
      setError('Failed to start recording. Please check microphone access.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    speechRecognitionService.stopListening();
    setIsListening(false);
  }, []);

  const evaluatePronunciation = useCallback(() => {
    if (!spokenText) {
      setError('No speech detected. Please try again.');
      return;
    }

    const pronunciationResult = calculatePronunciationScore(spokenText, textToSpeak);
    setResult(pronunciationResult);
    setPhase('result');
    setAttempts(prev => prev + 1);
  }, [spokenText, textToSpeak]);

  // Auto-evaluate when speech is finalized
  useEffect(() => {
    if (spokenText && phase === 'record' && !isListening) {
      evaluatePronunciation();
    }
  }, [spokenText, phase, isListening, evaluatePronunciation]);

  const handleTryAgain = () => {
    setResult(null);
    setSpokenText('');
    setInterimText('');
    setPhase('record');
  };

  const handleContinue = () => {
    if (result) {
      // Convert score to 0-5 scale
      const quality = Math.round((result.score / 100) * 5);
      onComplete(quality, result.isAcceptable);
    } else {
      onComplete(0, false);
    }
  };

  // Show unsupported message
  if (!isSupported) {
    return (
      <Card className="p-6 max-w-lg mx-auto text-center">
        <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Speech Recognition Not Available
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Your browser doesn't support speech recognition. Please try Chrome or Edge for this feature.
        </p>
        <Button onClick={onSkip} variant="outline">
          Skip to Next Card
        </Button>
      </Card>
    );
  }

  // Permission denied state
  if (hasPermission === false) {
    return (
      <Card className="p-6 max-w-lg mx-auto text-center">
        <Mic className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Microphone Access Required
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Please allow microphone access to use pronunciation practice.
        </p>
        <div className="flex gap-2 justify-center">
          <Button onClick={requestPermission}>
            Allow Microphone
          </Button>
          <Button onClick={onSkip} variant="outline">
            Skip
          </Button>
        </div>
      </Card>
    );
  }

  const tips = getCatalanPronunciationTips(textToSpeak);

  return (
    <div className="max-w-lg mx-auto">
      <AnimatePresence mode="wait">
        {phase !== 'result' ? (
          <motion.div
            key="practice"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="overflow-hidden">
              {/* Header gradient */}
              <div className="h-2 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />

              <div className="p-6">
                {/* Word to pronounce */}
                <div className="text-center mb-6">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Say this in Catalan
                  </span>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-2 mb-1">
                    {textToSpeak}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    ({translationHint})
                  </p>
                </div>

                {/* Listen first button */}
                {phase === 'intro' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                  >
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Listen to the native pronunciation first, then try saying it yourself.
                    </p>
                    <Button
                      onClick={handleListenFirst}
                      disabled={isPlaying}
                      className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
                    >
                      {isPlaying ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Playing...
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-5 h-5 mr-2" />
                          Listen First
                        </>
                      )}
                    </Button>
                  </motion.div>
                )}

                {/* Listen phase */}
                {phase === 'listen' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                  >
                    <div className="flex items-center justify-center gap-2 text-violet-600 dark:text-violet-400">
                      <Volume2 className="w-5 h-5 animate-pulse" />
                      <span>Playing native audio...</span>
                    </div>
                  </motion.div>
                )}

                {/* Record phase */}
                {phase === 'record' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    {/* Waveform / status area */}
                    <div className="h-16 flex items-center justify-center">
                      {isListening ? (
                        <div className="text-violet-600 dark:text-violet-400">
                          <SimpleWaveform isActive={isListening} barCount={7} />
                          <p className="text-sm mt-2 text-center">Listening...</p>
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 dark:text-gray-400">
                          {interimText || spokenText ? (
                            <p className="text-lg">{interimText || spokenText}</p>
                          ) : (
                            <p className="text-sm">Press and hold to speak</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Recording button */}
                    <div className="flex justify-center">
                      <motion.button
                        onMouseDown={startRecording}
                        onMouseUp={stopRecording}
                        onMouseLeave={stopRecording}
                        onTouchStart={startRecording}
                        onTouchEnd={stopRecording}
                        whileTap={{ scale: 0.95 }}
                        className={`
                          w-20 h-20 rounded-full flex items-center justify-center
                          transition-all duration-200 shadow-lg
                          ${isListening
                            ? 'bg-red-500 text-white scale-110'
                            : 'bg-gradient-to-br from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700'
                          }
                        `}
                      >
                        {isListening ? (
                          <StopCircle className="w-10 h-10" />
                        ) : (
                          <Mic className="w-10 h-10" />
                        )}
                      </motion.button>
                    </div>

                    {/* Helper buttons */}
                    <div className="flex justify-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={playNativeAudio}
                        disabled={isPlaying || isListening}
                      >
                        <Volume2 className="w-4 h-4 mr-1" />
                        Replay
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onSkip}
                      >
                        Skip
                      </Button>
                    </div>

                    {/* Error message */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-3 rounded-lg text-sm text-center"
                      >
                        {error}
                      </motion.div>
                    )}

                    {/* Pronunciation tips (show after first attempt) */}
                    {attempts > 0 && tips.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3"
                      >
                        <p className="text-xs font-medium text-amber-800 dark:text-amber-200 mb-1">
                          💡 Tips for this word:
                        </p>
                        <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-0.5">
                          {tips.slice(0, 2).map((tip, i) => (
                            <li key={i}>• {tip}</li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            {result && (
              <PronunciationFeedback
                score={result.score}
                feedback={result.feedback}
                isAcceptable={result.isAcceptable}
                spokenText={spokenText}
                expectedText={textToSpeak}
                tips={tips}
                onTryAgain={handleTryAgain}
                onListenAgain={playNativeAudio}
                onContinue={handleContinue}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
