// Speech Recognition Service for Pronunciation Practice
// Uses Web Speech API for speech-to-text recognition

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

// Use any for the recognition instance since Web Speech API types vary by browser
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionInstance = any;

class SpeechRecognitionService {
  private recognition: SpeechRecognitionInstance = null;
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const windowWithSpeech = window as any;
    const SpeechRecognitionAPI =
      windowWithSpeech.SpeechRecognition ||
      windowWithSpeech.webkitSpeechRecognition;

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.recognition.onresult = (event: any) => {
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.recognition.onerror = (event: any) => {
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
      console.error('Microphone permission denied:', error);
      return false;
    }
  }
}

// Calculate pronunciation similarity score
export function calculatePronunciationScore(
  spoken: string,
  expected: string
): { score: number; feedback: string; isAcceptable: boolean } {
  const normalizedSpoken = normalizeText(spoken);
  const normalizedExpected = normalizeText(expected);

  // Exact match
  if (normalizedSpoken === normalizedExpected) {
    return {
      score: 100,
      feedback: 'Perfect pronunciation!',
      isAcceptable: true,
    };
  }

  // Calculate similarity using Levenshtein distance
  const distance = levenshteinDistance(normalizedSpoken, normalizedExpected);
  const maxLength = Math.max(normalizedSpoken.length, normalizedExpected.length);
  const similarity = maxLength > 0 ? ((maxLength - distance) / maxLength) * 100 : 0;

  let feedback: string;
  let isAcceptable: boolean;

  if (similarity >= 90) {
    feedback = 'Excellent! Very close to native pronunciation.';
    isAcceptable = true;
  } else if (similarity >= 75) {
    feedback = 'Good pronunciation! Keep practicing for perfection.';
    isAcceptable = true;
  } else if (similarity >= 60) {
    feedback = 'Getting there! Focus on the sounds you\'re missing.';
    isAcceptable = false;
  } else if (similarity >= 40) {
    feedback = 'Needs work. Listen to the native audio and try again.';
    isAcceptable = false;
  } else {
    feedback = 'Let\'s try again. Listen carefully to each sound.';
    isAcceptable = false;
  }

  return {
    score: Math.round(similarity),
    feedback,
    isAcceptable,
  };
}

// Normalize text for comparison
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Remove punctuation
    .replace(/[.,!?;:'"¿¡]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Normalize common Catalan characters for comparison
    // Keep accents but normalize variations
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics for fuzzy matching
    .normalize('NFC');
}

// Levenshtein distance for similarity calculation
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
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
