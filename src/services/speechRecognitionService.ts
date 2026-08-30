// Speech Recognition Service for Pronunciation Practice
// Uses Web Speech API for speech-to-text recognition

import type {
  SpeechRecognition,
  SpeechRecognitionEvent,
  SpeechRecognitionErrorEvent,
} from '../types/webSpeech';
import { logger } from './logger';
import { PRONUNCIATION_THRESHOLDS } from '../config/constants';
import {
  splitWords,
  transcribeWord,
  phonemeDistance,
  diagnoseWord,
} from './catalanPhonetics';

export interface SpeechResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface RecognitionOptions {
  language: 'ca-ES' | 'en-US';
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

class SpeechRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private onResultCallback: ((result: SpeechResult) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;
  private onEndCallback: (() => void) | null = null;

  constructor() {
    this.initRecognition();
  }

  private initRecognition(): void {
    if (typeof window === 'undefined') return;

    // Access Web Speech API with proper browser prefixes
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognitionAPI) {
      this.recognition = new SpeechRecognitionAPI();
    }
  }

  /**
   * Check if speech recognition is supported
   */
  isSupported(): boolean {
    return this.recognition !== null;
  }

  /**
   * Check if Catalan is likely supported
   * Note: Browser support for Catalan varies
   */
  isCatalanSupported(): boolean {
    // Most browsers support ca-ES, but recognition quality varies
    // Chrome has good support, Firefox and Safari have limited support
    return this.isSupported();
  }

  /**
   * Start listening for speech
   */
  startListening(options: RecognitionOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      if (this.isListening) {
        this.stopListening();
      }

      // Configure recognition
      this.recognition.lang = options.language;
      this.recognition.continuous = options.continuous ?? false;
      this.recognition.interimResults = options.interimResults ?? true;
      this.recognition.maxAlternatives = options.maxAlternatives ?? 3;

      // Set up event handlers
      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        const result = event.results[event.results.length - 1];
        const alternative = result[0];

        const speechResult: SpeechResult = {
          transcript: alternative.transcript.trim(),
          confidence: alternative.confidence,
          isFinal: result.isFinal,
        };

        if (this.onResultCallback) {
          this.onResultCallback(speechResult);
        }
      };

      this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        let errorMessage = 'Speech recognition error';

        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try again.';
            break;
          case 'audio-capture':
            errorMessage = 'No microphone found. Please check your microphone.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone access.';
            break;
          case 'network':
            errorMessage = 'Network error. Please check your connection.';
            break;
          case 'aborted':
            errorMessage = 'Recognition aborted.';
            break;
          case 'language-not-supported':
            errorMessage = 'Language not supported by your browser.';
            break;
          default:
            errorMessage = `Speech error: ${event.error}`;
        }

        if (this.onErrorCallback) {
          this.onErrorCallback(errorMessage);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.onEndCallback) {
          this.onEndCallback();
        }
      };

      this.recognition.onstart = () => {
        this.isListening = true;
        resolve();
      };

      try {
        this.recognition.start();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Stop listening
   */
  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * Abort recognition immediately
   */
  abort(): void {
    if (this.recognition) {
      this.recognition.abort();
      this.isListening = false;
    }
  }

  /**
   * Set callback for speech results
   */
  onResult(callback: (result: SpeechResult) => void): void {
    this.onResultCallback = callback;
  }

  /**
   * Set callback for errors
   */
  onError(callback: (error: string) => void): void {
    this.onErrorCallback = callback;
  }

  /**
   * Set callback for when recognition ends
   */
  onEnd(callback: () => void): void {
    this.onEndCallback = callback;
  }

  /**
   * Check if currently listening
   */
  getIsListening(): boolean {
    return this.isListening;
  }

  /**
   * Request microphone permission
   */
  async requestPermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop all tracks after getting permission
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      logger.error('Microphone permission denied', 'SpeechRecognition', { error: String(error) });
      return false;
    }
  }
}

/** Per-word outcome, so feedback can point at the word that went wrong. */
export interface WordScore {
  expected: string;
  heard: string | null;
  correct: boolean;
  /** One targeted tip, when we can name what differed. */
  tip?: { sound: string; tip: string };
}

export interface PronunciationScore {
  score: number;
  feedback: string;
  isAcceptable: boolean;
  /** Word-by-word breakdown driving the detailed feedback. */
  words: WordScore[];
  /** The most useful tips across the phrase, most specific first. */
  tips: string[];
}

/**
 * Score a spoken attempt against the expected Catalan.
 *
 * Compares phoneme sequences rather than raw characters (see catalanPhonetics).
 * Two consequences worth knowing:
 *
 *   - Spellings that sound the same in Central Catalan score as correct. "vi"
 *     heard as "bi" is a b/v merger, not a mistake, and the previous
 *     character-level scorer marked it 50% wrong on a two-letter word.
 *   - Accents are no longer discarded. The previous version stripped diacritics
 *     before comparing, so `cafè` and `cafe` were identical - throwing away the
 *     open/closed vowel contrast that most needs practice.
 *
 * The score reflects whether the recogniser heard the right words, which is not
 * the same as how native the delivery sounded. The wording says so rather than
 * claiming "perfect pronunciation" for what is really a transcript match.
 */
export function calculatePronunciationScore(
  spoken: string,
  expected: string
): PronunciationScore {
  const expectedWords = splitWords(expected);
  const spokenWords = splitWords(spoken);

  if (expectedWords.length === 0) {
    return { score: 0, feedback: 'Nothing to compare.', isAcceptable: false, words: [], tips: [] };
  }

  // Align at the word level so a dropped or inserted word shifts the rest
  // rather than corrupting every subsequent comparison.
  const words: WordScore[] = [];
  let totalPhonemes = 0;
  let totalErrors = 0;
  let matched = 0;

  const used = new Set<number>();
  for (const expectedWord of expectedWords) {
    // Nearest unused spoken word, preferring order.
    let bestIndex = -1;
    let bestDistance = Infinity;
    for (let j = 0; j < spokenWords.length; j++) {
      if (used.has(j)) continue;
      const d = phonemeDistance(expectedWord, spokenWords[j]);
      if (d < bestDistance) {
        bestDistance = d;
        bestIndex = j;
      }
    }

    const heard = bestIndex >= 0 ? spokenWords[bestIndex] : null;
    const expectedLength = Math.max(1, transcribeWord(expectedWord).length);
    totalPhonemes += expectedLength;

    if (heard === null) {
      totalErrors += expectedLength;
      words.push({ expected: expectedWord, heard: null, correct: false });
      continue;
    }

    used.add(bestIndex);
    // Errors in one word cannot exceed that word's length, so a wildly wrong
    // guess costs the word and no more.
    const errors = Math.min(bestDistance, expectedLength);
    totalErrors += errors;

    const correct = errors === 0;
    if (correct) matched++;

    words.push({
      expected: expectedWord,
      heard,
      correct,
      tip: correct ? undefined : diagnoseWord(expectedWord, heard) ?? undefined,
    });
  }

  const similarity = Math.max(0, ((totalPhonemes - totalErrors) / totalPhonemes) * 100);
  const score = Math.round(similarity);

  const tips = words
    .map(w => w.tip)
    .filter((t): t is { sound: string; tip: string } => Boolean(t))
    .map(t => t.tip);

  const allWordsMatched = matched === expectedWords.length && spokenWords.length === expectedWords.length;

  let feedback: string;
  let isAcceptable: boolean;

  if (allWordsMatched) {
    feedback = 'Recognised exactly - every word came through clearly.';
    isAcceptable = true;
  } else if (score >= PRONUNCIATION_THRESHOLDS.EXCELLENT) {
    feedback = 'Very close. Almost every sound landed.';
    isAcceptable = true;
  } else if (score >= PRONUNCIATION_THRESHOLDS.GOOD) {
    feedback = 'Understandable, with a few sounds to tighten up.';
    isAcceptable = true;
  } else if (score >= PRONUNCIATION_THRESHOLDS.ACCEPTABLE) {
    feedback = 'Recognisable, but several sounds drifted.';
    isAcceptable = false;
  } else if (score >= PRONUNCIATION_THRESHOLDS.NEEDS_WORK) {
    feedback = 'Hard to make out. Listen again and copy the rhythm.';
    isAcceptable = false;
  } else {
    feedback = "That didn't come through. Play the audio and try once more.";
    isAcceptable = false;
  }

  // Deduplicate: the same tip repeated across words reads as nagging.
  return { score, feedback, isAcceptable, words, tips: [...new Set(tips)].slice(0, 3) };
}

// Get specific feedback for Catalan sounds
export function getCatalanPronunciationTips(word: string): string[] {
  const tips: string[] = [];
  const lowerWord = word.toLowerCase();

  // Common Catalan pronunciation challenges
  if (lowerWord.includes('ll')) {
    tips.push('The "ll" sound is similar to English "y" in "yes"');
  }
  if (lowerWord.includes('ny')) {
    tips.push('The "ny" sound is like Spanish "ñ" or "ni" in "onion"');
  }
  if (lowerWord.includes('ç')) {
    tips.push('The "ç" is pronounced like "s" in "sun"');
  }
  if (lowerWord.includes('tx')) {
    tips.push('The "tx" is pronounced like "ch" in "church"');
  }
  if (lowerWord.includes('ig')) {
    tips.push('The "ig" at the end sounds like "ch" in "beach"');
  }
  if (/[àáâ]/.test(lowerWord)) {
    tips.push('Stressed "à/á" is an open "a" sound');
  }
  if (/[èé]/.test(lowerWord)) {
    tips.push('è is open (like "bed"), é is closed (like "bay")');
  }
  if (/[òó]/.test(lowerWord)) {
    tips.push('ò is open (like "dog"), ó is closed (like "go")');
  }
  if (lowerWord.includes('x')) {
    tips.push('Initial "x" is like "sh", between vowels it can be "ks"');
  }
  if (lowerWord.includes('j') || lowerWord.includes('g')) {
    tips.push('Catalan "j" and soft "g" sound like French "j" in "bonjour"');
  }

  return tips;
}

export const speechRecognitionService = new SpeechRecognitionService();
