// Audio Service for Text-to-Speech Pronunciation
// Uses Google Cloud TTS via Firebase Functions with Storage caching
// Falls back to Web Speech API if cloud fails

import { generateAudioFunction, isDemoMode } from './firebase';

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
  forceWebSpeech?: boolean; // Set true to skip Cloud TTS
  playbackRate?: number; // Playback speed for audio element (0.5 to 2.0)
}

type Language = 'catalan' | 'english';

// Simple LRU Cache implementation to prevent unbounded memory growth
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private readonly maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;
    // Move to end (most recently used)
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    // Delete first to refresh position if exists
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove oldest (first) entry
      const firstKey = this.cache.keys().next().value as K;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

class AudioService {
  private synthesis: SpeechSynthesis | null = null;
  private catalanVoice: SpeechSynthesisVoice | null = null;
  private englishVoice: SpeechSynthesisVoice | null = null;
  private isInitialized = false;
  private _isUsingFallbackVoice = false;
  private audioElement: HTMLAudioElement | null = null;
  private audioUrlCache = new LRUCache<string, string>(100); // LRU cache with max 100 entries

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.synthesis = window.speechSynthesis;
        this.initVoices();
      }
      this.audioElement = new Audio();
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

  /**
   * Main speak method - tries Cloud TTS first, falls back to Web Speech API
   */
  async speak(text: string, language: Language, options: AudioOptions = {}): Promise<void> {
    const cleanText = cleanTextForSpeech(text);
    const useCloud = !options.forceWebSpeech && !isDemoMode;

    if (useCloud) {
      try {
        await this.speakWithCloudTTS(cleanText, language, options.playbackRate);
        return;
      } catch (error) {
        console.warn('Cloud TTS failed, falling back to Web Speech API:', error);
      }
    }

    // Fallback to Web Speech API
    await this.speakWithWebSpeech(cleanText, language, options);
  }

  /**
   * Speak using Google Cloud TTS via Firebase Functions
   */
  private async speakWithCloudTTS(text: string, language: Language, playbackRate?: number): Promise<void> {
    const langCode = language === 'catalan' ? 'ca-ES' : 'en-US';
    const cacheKey = `${langCode}:${text.toLowerCase()}`;

    // Check in-memory URL cache first
    let audioUrl = this.audioUrlCache.get(cacheKey);

    if (!audioUrl) {
      // Call Firebase Function
      const result = await generateAudioFunction({ text, language: langCode });
      audioUrl = result.data.url;

      // Cache the URL in memory for this session
      this.audioUrlCache.set(cacheKey, audioUrl);
    }

    // Play the audio
    await this.playAudioUrl(audioUrl, playbackRate);
  }

  /**
   * Play audio from a URL using HTML Audio element
   */
  private playAudioUrl(url: string, playbackRate?: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.audioElement) {
        reject(new Error('Audio element not available'));
        return;
      }

      // Remove previous listeners
      this.audioElement.onended = null;
      this.audioElement.onerror = null;

      this.audioElement.src = url;
      // Set playback rate (0.5 to 2.0, default 1.0)
      this.audioElement.playbackRate = Math.max(0.5, Math.min(2.0, playbackRate ?? 1.0));
      this.audioElement.onended = () => resolve();
      this.audioElement.onerror = (e) => reject(e);
      this.audioElement.play().catch(reject);
    });
  }

  /**
   * Speak using Web Speech API (fallback)
   */
  private async speakWithWebSpeech(text: string, language: Language, options: AudioOptions): Promise<void> {
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

    const utterance = new SpeechSynthesisUtterance(text);

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

  /**
   * Speak Catalan at a specific speed (for dictation mode)
   * @param speed - 'slow' (0.6x), 'normal' (1.0x), or 'fast' (1.25x)
   */
  speakCatalanAtSpeed(text: string, speed: 'slow' | 'normal' | 'fast'): Promise<void> {
    const playbackRate = speed === 'slow' ? 0.6 : speed === 'fast' ? 1.25 : 1.0;
    return this.speakCatalan(text, { playbackRate });
  }

  /**
   * Get current playback rate setting
   */
  getPlaybackRate(): number {
    return this.audioElement?.playbackRate ?? 1.0;
  }

  stop(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  get isSupported(): boolean {
    return this.synthesis !== null || this.audioElement !== null;
  }

  get hasCatalanVoice(): boolean {
    // Cloud TTS always has Catalan, so return true unless in demo mode
    return !isDemoMode || this.catalanVoice !== null;
  }

  get isUsingFallbackVoice(): boolean {
    // Cloud TTS uses native Catalan, so no fallback needed unless in demo mode
    return isDemoMode && this._isUsingFallbackVoice;
  }

  get catalanVoiceName(): string | null {
    if (!isDemoMode) {
      return 'Google Cloud TTS (Catalan)';
    }
    return this.catalanVoice?.name || null;
  }

  /**
   * Preload audio for a list of texts (for better UX during study sessions)
   */
  async preloadAudio(texts: Array<{ text: string; language: Language }>): Promise<void> {
    if (isDemoMode) return;

    const promises = texts.map(async ({ text, language }) => {
      const langCode = language === 'catalan' ? 'ca-ES' : 'en-US';
      const cleanText = cleanTextForSpeech(text);
      const cacheKey = `${langCode}:${cleanText.toLowerCase()}`;

      if (!this.audioUrlCache.has(cacheKey)) {
        try {
          const result = await generateAudioFunction({ text: cleanText, language: langCode });
          this.audioUrlCache.set(cacheKey, result.data.url);
        } catch (error) {
          console.warn('Failed to preload audio:', text, error);
        }
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Clear the in-memory URL cache
   */
  clearCache(): void {
    this.audioUrlCache.clear();
  }
}

export const audioService = new AudioService();
