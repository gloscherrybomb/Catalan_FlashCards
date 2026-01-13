import { logger } from './logger';

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
const CACHE_DB_NAME = 'catalan-flashcards-images';
const CACHE_STORE_NAME = 'images';
const CACHE_EXPIRY_DAYS = 30;

interface UnsplashImage {
  id: string;
  urls: {
    small: string;
    regular: string;
    thumb: string;
  };
  alt_description: string | null;
  user: {
    name: string;
    links: { html: string };
  };
}

export interface CachedImage {
  word: string;
  imageUrl: string;
  thumbUrl: string;
  attribution: string;
  cachedAt: number;
}

class ImageService {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(CACHE_DB_NAME, 1);

      request.onerror = () => {
        logger.error('Failed to open IndexedDB', 'ImageService', { error: request.error });
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(CACHE_STORE_NAME)) {
          db.createObjectStore(CACHE_STORE_NAME, { keyPath: 'word' });
        }
      };
    });

    return this.initPromise;
  }

  async getCachedImage(word: string): Promise<CachedImage | null> {
    try {
      await this.init();
      if (!this.db) return null;

      return new Promise((resolve) => {
        const transaction = this.db!.transaction(CACHE_STORE_NAME, 'readonly');
        const store = transaction.objectStore(CACHE_STORE_NAME);
        const request = store.get(word.toLowerCase());

        request.onerror = () => {
          logger.error('Failed to get cached image', 'ImageService', { error: request.error });
          resolve(null);
        };

        request.onsuccess = () => {
          const result = request.result as CachedImage | undefined;
          // Check if cache is expired
          if (result && Date.now() - result.cachedAt < CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000) {
            resolve(result);
          } else {
            resolve(null);
          }
        };
      });
    } catch {
      return null;
    }
  }

  async cacheImage(image: CachedImage): Promise<void> {
    try {
      await this.init();
      if (!this.db) return;

      return new Promise((resolve) => {
        const transaction = this.db!.transaction(CACHE_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(CACHE_STORE_NAME);
        const request = store.put({ ...image, word: image.word.toLowerCase() });

        request.onerror = () => {
          logger.error('Failed to cache image', 'ImageService', { error: request.error });
          resolve();
        };

        request.onsuccess = () => resolve();
      });
    } catch {
      // Silently fail caching
    }
  }

  async fetchImageForWord(word: string, fallbackSearchTerm?: string): Promise<CachedImage | null> {
    // Check cache first
    const cached = await this.getCachedImage(word);
    if (cached) {
      logger.debug(`Cache hit for "${word}"`, 'ImageService', { word });
      return cached;
    }

    // Skip if no API key configured
    if (!UNSPLASH_ACCESS_KEY) {
      logger.warn('Unsplash API key not configured. Set VITE_UNSPLASH_ACCESS_KEY in your .env file.', 'ImageService', {});
      return null;
    }

    logger.debug(`Fetching image for "${word}"...`, 'ImageService', { word });

    try {
      // Clean the search term
      const searchTerm = this.cleanSearchTerm(word, fallbackSearchTerm);

      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchTerm)}&per_page=1&orientation=landscape`,
        {
          headers: {
            Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 403) {
          logger.error('Unsplash API rate limit exceeded', 'ImageService', { error: response.status });
        } else {
          logger.error(`Unsplash API error: ${response.status}`, 'ImageService', { error: response.status });
        }
        return null;
      }

      const data = await response.json();
      const results = data.results as UnsplashImage[];
      logger.debug(`Found ${results.length} results for "${word}"`, 'ImageService', { word, resultCount: results.length });

      if (results.length === 0) {
        // Try with fallback if available
        if (fallbackSearchTerm && fallbackSearchTerm !== searchTerm) {
          return this.fetchImageForWord(word + '_fallback', word);
        }
        return null;
      }

      const image = results[0];
      const cachedImage: CachedImage = {
        word: word.toLowerCase(),
        imageUrl: image.urls.small,
        thumbUrl: image.urls.thumb,
        attribution: `Photo by ${image.user.name} on Unsplash`,
        cachedAt: Date.now(),
      };

      // Cache the result
      await this.cacheImage(cachedImage);

      return cachedImage;
    } catch (error) {
      logger.error('Failed to fetch image', 'ImageService', { error });
      return null;
    }
  }

  /**
   * Fetch images for multiple words in batch
   * Respects rate limits by processing sequentially with delays
   */
  async fetchImagesForWords(
    words: Array<{ word: string; fallback?: string }>,
    onProgress?: (completed: number, total: number) => void
  ): Promise<Map<string, CachedImage>> {
    const results = new Map<string, CachedImage>();
    const total = words.length;

    for (let i = 0; i < words.length; i++) {
      const { word, fallback } = words[i];

      // Check cache first (no delay needed)
      const cached = await this.getCachedImage(word);
      if (cached) {
        results.set(word.toLowerCase(), cached);
        onProgress?.(i + 1, total);
        continue;
      }

      // Fetch from API with rate limiting
      const image = await this.fetchImageForWord(word, fallback);
      if (image) {
        results.set(word.toLowerCase(), image);
      }

      onProgress?.(i + 1, total);

      // Rate limiting: wait 100ms between API calls to stay under Unsplash limits
      if (i < words.length - 1 && !cached) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    return results;
  }

  /**
   * Clean search term for better results
   */
  private cleanSearchTerm(word: string, fallback?: string): string {
    // Remove parenthetical notes like "(M)" or "(F)"
    let cleaned = word.replace(/\s*\([^)]*\)\s*/g, '').trim();

    // Remove articles for better search
    cleaned = cleaned.replace(/^(the|a|an|el|la|els|les|un|una|uns|unes)\s+/i, '');

    // Use fallback if cleaned is too short
    if (cleaned.length < 3 && fallback) {
      return fallback;
    }

    return cleaned || fallback || word;
  }

  async clearCache(): Promise<void> {
    try {
      await this.init();
      if (!this.db) return;

      return new Promise((resolve) => {
        const transaction = this.db!.transaction(CACHE_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(CACHE_STORE_NAME);
        const request = store.clear();

        request.onerror = () => {
          logger.error('Failed to clear cache', 'ImageService', { error: request.error });
          resolve();
        };

        request.onsuccess = () => resolve();
      });
    } catch {
      // Silently fail
    }
  }

  /**
   * Check if Unsplash API is configured
   */
  isConfigured(): boolean {
    return !!UNSPLASH_ACCESS_KEY;
  }
}

export const imageService = new ImageService();
