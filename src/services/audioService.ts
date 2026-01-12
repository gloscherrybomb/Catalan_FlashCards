// Audio Service for Text-to-Speech Pronunciation
// Uses Web Speech API with Catalan voice support

/**
 * Cleans text for speech by removing auxiliary notation.
 * Strips gender markers like (M), (F), (M Pl), (F Singular), etc.
 */
function cleanTextForSpeech(text: string): string {
  return text
    .replace(/\s*\([MF]\s*(?:Pl|Singular|Plural)?\)/gi, '')
    .trim();
}

interface AudioOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
}

class AudioService {
  private synthesis: SpeechSynthesis | null = null;
  private catalanVoice: SpeechSynthesisVoice | null = null;
  private englishVoice: SpeechSynthesisVoice | null = null;
  private isInitialized = false;
  private _isUsingFallbackVoice = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      this.initVoices();
    }
  }

  private initVoices() {
    if (!this.synthesis) return;

    const loadVoices = () => {
      const voices = this.synthesis!.getVoices();

      // Find Catalan voice (ca-ES or ca)
      const nativeCatalanVoice = voices.find(
        v => v.lang.startsWith('ca') || v.lang === 'ca-ES'
      );
      const spanishFallback = voices.find(
        v => v.lang.startsWith('es')
      );

      this.catalanVoice = nativeCatalanVoice || spanishFallback || null;
      this._isUsingFallbackVoice = !nativeCatalanVoice && !!spanishFallback;

      // Find English voice
      this.englishVoice = voices.find(
        v => v.lang.startsWith('en-GB') || v.lang.startsWith('en-US')
      ) || voices.find(
        v => v.lang.startsWith('en')
      ) || null;

      this.isInitialized = true;
    };

    // Voices may not be loaded immediately
    if (this.synthesis.getVoices().length > 0) {
      loadVoices();
    } else {
      this.synthesis.addEventListener('voiceschanged', loadVoices, { once: true });
    }
  }

  async speak(text: string, language: 'catalan' | 'english', options: AudioOptions = {}): Promise<void> {
    if (!this.synthesis) {
      console.warn('Speech synthesis not supported');
      return;
    }

    // Wait for voices to load
    if (!this.isInitialized) {
      await new Promise<void>(resolve => {
        const checkInterval = setInterval(() => {
          if (this.isInitialized) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
        // Timeout after 2 seconds
        setTimeout(() => {
          clearInterval(checkInterval);
          resolve();
        }, 2000);
      });
    }

    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanTextForSpeech(text));

    // Set voice based on language
    if (language === 'catalan' && this.catalanVoice) {
      utterance.voice = this.catalanVoice;
      utterance.lang = 'ca-ES';
    } else if (language === 'english' && this.englishVoice) {
      utterance.voice = this.englishVoice;
      utterance.lang = 'en-US';
    }

    // Apply options
    utterance.rate = options.rate ?? 0.9; // Slightly slower for learning
    utterance.pitch = options.pitch ?? 1;
    utterance.volume = options.volume ?? 1;

    return new Promise((resolve) => {
      utterance.onend = () => resolve();
      utterance.onerror = (event) => {
        console.error('Speech error:', event);
        resolve(); // Don't reject, just log
      };
      this.synthesis!.speak(utterance);
    });
  }

  speakCatalan(text: string, options?: AudioOptions): Promise<void> {
    return this.speak(text, 'catalan', options);
  }

  speakEnglish(text: string, options?: AudioOptions): Promise<void> {
    return this.speak(text, 'english', options);
  }

  stop(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  get isSupported(): boolean {
    return this.synthesis !== null;
  }

  get hasCatalanVoice(): boolean {
    return this.catalanVoice !== null;
  }

  get isUsingFallbackVoice(): boolean {
    return this._isUsingFallbackVoice;
  }

  get catalanVoiceName(): string | null {
    return this.catalanVoice?.name || null;
  }
}

export const audioService = new AudioService();
