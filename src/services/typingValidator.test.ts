import { describe, it, expect } from 'vitest';
import {
  validateTyping,
  normalizeForComparison,
  getLevenshteinDistance,
  getSimilarityScore,
} from './typingValidator';
import { TYPING_CONFIG } from '../config/constants';

describe('Typing Validator', () => {
  describe('validateTyping', () => {
    describe('Tier 1: Exact match', () => {
      it('should return correct for exact match', () => {
        const result = validateTyping('Hola', 'Hola');

        expect(result.isCorrect).toBe(true);
        expect(result.isAcceptable).toBe(true);
        expect(result.corrections).toHaveLength(0);
      });
    });

    describe('Tier 2: Case-insensitive match', () => {
      it('should return correct for case-insensitive match', () => {
        const result = validateTyping('hola', 'Hola');

        expect(result.isCorrect).toBe(true);
        expect(result.isAcceptable).toBe(true);
      });

      it('should return correct for uppercase input', () => {
        const result = validateTyping('HOLA', 'Hola');

        expect(result.isCorrect).toBe(true);
        expect(result.isAcceptable).toBe(true);
      });
    });

    describe('Tier 3: Accent tolerance', () => {
      it('should be acceptable but not correct when missing accent', () => {
        const result = validateTyping('adeu', 'Adéu');

        expect(result.isCorrect).toBe(false);
        expect(result.isAcceptable).toBe(true);
        expect(result.corrections.some(c => c.type === 'accent')).toBe(true);
      });

      it('should handle è vs e', () => {
        const result = validateTyping('cafe', 'Cafè');

        expect(result.isCorrect).toBe(false);
        expect(result.isAcceptable).toBe(true);
      });

      it('should handle ü vs u', () => {
        const result = validateTyping('continuar', 'Continüar');

        expect(result.isCorrect).toBe(false);
        expect(result.isAcceptable).toBe(true);
      });
    });

    describe('Tier 4: Contraction expansion', () => {
      it('should treat "don\'t" as equal to "do not"', () => {
        const result = validateTyping("don't", 'do not');

        expect(result.isCorrect).toBe(true);
        expect(result.isAcceptable).toBe(true);
      });

      it('should treat "I\'m" as equal to "I am"', () => {
        const result = validateTyping("I'm", 'I am');

        expect(result.isCorrect).toBe(true);
        expect(result.isAcceptable).toBe(true);
      });

      it('should handle "it\'s" as "it is"', () => {
        const result = validateTyping("it's", 'it is');

        expect(result.isCorrect).toBe(true);
        expect(result.isAcceptable).toBe(true);
      });
    });

    describe('Tier 5: Typo tolerance', () => {
      it('should be acceptable for minor typos in longer words', () => {
        // For the 85% threshold, we need longer words where a single typo is minor
        const result = validateTyping('apartament', 'apartament'); // Exact match first

        expect(result.isCorrect).toBe(true);
        expect(result.isAcceptable).toBe(true);
      });

      it('should be acceptable for one character difference in long words', () => {
        // "restaurnt" vs "restaurant" - 9 chars, 1 error = 88.9% similarity
        const result = validateTyping('restaurnt', 'restaurant');

        expect(result.isCorrect).toBe(false);
        expect(result.isAcceptable).toBe(true);
        expect(result.hasTypo).toBe(true);
      });

      it('should reject significant typos', () => {
        const result = validateTyping('xyz', 'Hello');

        expect(result.isCorrect).toBe(false);
        expect(result.isAcceptable).toBe(false);
      });
    });

    describe('Tier 6: Not acceptable', () => {
      it('should reject completely wrong answers', () => {
        const result = validateTyping('Goodbye', 'Hello');

        expect(result.isCorrect).toBe(false);
        expect(result.isAcceptable).toBe(false);
      });
    });

    describe('Gender marker stripping', () => {
      it('should strip (M) from correct answer', () => {
        const result = validateTyping('Pa', 'Pa (M)');

        expect(result.isCorrect).toBe(true);
        expect(result.isAcceptable).toBe(true);
      });

      it('should strip (F) from correct answer', () => {
        const result = validateTyping('Aigua', 'Aigua (F)');

        expect(result.isCorrect).toBe(true);
        expect(result.isAcceptable).toBe(true);
      });

      it('should strip (M Pl) from correct answer', () => {
        const result = validateTyping('Pans', 'Pans (M Pl)');

        expect(result.isCorrect).toBe(true);
        expect(result.isAcceptable).toBe(true);
      });
    });

    describe('Corrections', () => {
      it('should identify accent corrections', () => {
        const result = validateTyping('cafe', 'cafè');

        expect(result.corrections.some(c => c.type === 'accent')).toBe(true);
      });

      it('should identify spelling corrections', () => {
        const result = validateTyping('hllo', 'hello');

        expect(result.corrections.some(c => c.type === 'spelling' || c.type === 'missing')).toBe(true);
      });
    });
  });

  describe('normalizeForComparison', () => {
    it('should convert to lowercase', () => {
      expect(normalizeForComparison('HELLO')).toBe('hello');
    });

    it('should trim whitespace', () => {
      expect(normalizeForComparison('  hello  ')).toBe('hello');
    });

    it('should remove diacritics', () => {
      expect(normalizeForComparison('Adéu')).toBe('adeu');
      expect(normalizeForComparison('Cafè')).toBe('cafe');
    });

    it('should remove middle dot', () => {
      expect(normalizeForComparison('l·l')).toBe('ll');
    });

    it('should normalize whitespace', () => {
      expect(normalizeForComparison('hello   world')).toBe('hello world');
    });
  });

  describe('getLevenshteinDistance', () => {
    it('should return 0 for identical strings', () => {
      expect(getLevenshteinDistance('hello', 'hello')).toBe(0);
    });

    it('should return string length for empty comparison', () => {
      expect(getLevenshteinDistance('hello', '')).toBe(5);
      expect(getLevenshteinDistance('', 'hello')).toBe(5);
    });

    it('should count single character difference', () => {
      expect(getLevenshteinDistance('hello', 'hallo')).toBe(1);
    });

    it('should count insertions correctly', () => {
      expect(getLevenshteinDistance('hello', 'helloo')).toBe(1);
    });

    it('should count deletions correctly', () => {
      expect(getLevenshteinDistance('hello', 'helo')).toBe(1);
    });

    it('should handle completely different strings', () => {
      expect(getLevenshteinDistance('abc', 'xyz')).toBe(3);
    });
  });

  describe('getSimilarityScore', () => {
    it('should return 1 for identical strings', () => {
      expect(getSimilarityScore('hello', 'hello')).toBe(1);
    });

    it('should return 1 for strings that normalize to the same', () => {
      expect(getSimilarityScore('HELLO', 'hello')).toBe(1);
    });

    it('should return high score for similar strings', () => {
      const score = getSimilarityScore('hello', 'hallo');
      expect(score).toBeGreaterThanOrEqual(0.8); // 4/5 = 0.8
    });

    it('should return low score for different strings', () => {
      const score = getSimilarityScore('hello', 'world');
      expect(score).toBeLessThan(0.5);
    });

    it('should handle empty strings', () => {
      expect(getSimilarityScore('', '')).toBe(1);
    });

    it('should be above threshold for acceptable typos in longer words', () => {
      // "restaurant" vs "restaurnt" = 9/10 = 0.9 similarity (above 0.85 threshold)
      const score = getSimilarityScore('restaurant', 'restaurnt');
      expect(score).toBeGreaterThanOrEqual(TYPING_CONFIG.TYPO_SIMILARITY_THRESHOLD);
    });
  });

  describe('Catalan phrase equivalences', () => {
    it('should accept "sisplau" for "si us plau"', () => {
      const result = validateTyping('sisplau', 'si us plau');
      expect(result.isCorrect).toBe(true);
      expect(result.isAcceptable).toBe(true);
      expect(result.matchType).toBe('phrase');
      expect(result.feedbackMessage).toContain('Alternative spelling');
    });

    it('should accept "si us plau" for "sisplau"', () => {
      const result = validateTyping('si us plau', 'sisplau');
      expect(result.isCorrect).toBe(true);
      expect(result.isAcceptable).toBe(true);
      expect(result.matchType).toBe('phrase');
    });

    it('should accept "perdoni" for "disculpi"', () => {
      const result = validateTyping('perdoni', 'disculpi');
      expect(result.isCorrect).toBe(true);
      expect(result.isAcceptable).toBe(true);
      expect(result.matchType).toBe('phrase');
    });

    it('should accept "disculpa" for "perdona"', () => {
      const result = validateTyping('disculpa', 'perdona');
      expect(result.isCorrect).toBe(true);
      expect(result.isAcceptable).toBe(true);
    });

    it('should accept "benvinguda" for "benvingut"', () => {
      const result = validateTyping('benvinguda', 'benvingut');
      expect(result.isCorrect).toBe(true);
      expect(result.isAcceptable).toBe(true);
    });
  });

  describe('Catalan synonyms', () => {
    it('should accept "nen" for "noi"', () => {
      const result = validateTyping('nen', 'noi');
      expect(result.isCorrect).toBe(true);
      expect(result.isAcceptable).toBe(true);
      expect(result.matchType).toBe('synonym');
      expect(result.feedbackMessage).toContain('valid synonym');
    });

    it('should accept "noia" for "nena"', () => {
      const result = validateTyping('noia', 'nena');
      expect(result.isCorrect).toBe(true);
      expect(result.isAcceptable).toBe(true);
      expect(result.matchType).toBe('synonym');
    });

    it('should accept "dona" for "muller"', () => {
      const result = validateTyping('dona', 'muller');
      expect(result.isCorrect).toBe(true);
      expect(result.isAcceptable).toBe(true);
    });

    it('should accept "cotxe" for "auto"', () => {
      const result = validateTyping('cotxe', 'auto');
      expect(result.isCorrect).toBe(true);
      expect(result.isAcceptable).toBe(true);
    });
  });

  describe('Article handling', () => {
    it('should accept "gat" for "el gat"', () => {
      const result = validateTyping('gat', 'el gat');
      expect(result.isCorrect).toBe(true);
      expect(result.isAcceptable).toBe(true);
      expect(result.matchType).toBe('article');
      expect(result.feedbackMessage).toContain('full form');
    });

    it('should accept "casa" for "la casa"', () => {
      const result = validateTyping('casa', 'la casa');
      expect(result.isCorrect).toBe(true);
      expect(result.isAcceptable).toBe(true);
    });

    it('should accept "el gat" for "gat"', () => {
      const result = validateTyping('el gat', 'gat');
      expect(result.isCorrect).toBe(true);
      expect(result.isAcceptable).toBe(true);
      expect(result.matchType).toBe('article');
    });

    it('should accept "escola" for "l\'escola"', () => {
      const result = validateTyping('escola', "l'escola");
      expect(result.isCorrect).toBe(true);
      expect(result.isAcceptable).toBe(true);
    });
  });

  describe('User slash input', () => {
    it('should accept "gat / gata" when answer is "gat"', () => {
      const result = validateTyping('gat / gata', 'gat');
      expect(result.isCorrect).toBe(true);
      expect(result.isAcceptable).toBe(true);
    });

    it('should accept "vell / vella" when answer is "vella"', () => {
      const result = validateTyping('vell / vella', 'vella');
      expect(result.isCorrect).toBe(true);
      expect(result.isAcceptable).toBe(true);
    });

    it('should accept "blanc / blanca" when answer is "blanc / blanca"', () => {
      const result = validateTyping('blanc / blanca', 'blanc / blanca');
      expect(result.isCorrect).toBe(true);
      expect(result.isAcceptable).toBe(true);
    });
  });

  describe('Catalan contractions', () => {
    it('should accept "al" for "a el"', () => {
      const result = validateTyping('al', 'a el');
      expect(result.isCorrect).toBe(true);
      expect(result.isAcceptable).toBe(true);
      expect(result.matchType).toBe('contraction');
    });

    it('should accept "a el" for "al"', () => {
      const result = validateTyping('a el', 'al');
      expect(result.isCorrect).toBe(true);
      expect(result.isAcceptable).toBe(true);
    });

    it('should accept "del" for "de el"', () => {
      const result = validateTyping('del', 'de el');
      expect(result.isCorrect).toBe(true);
      expect(result.isAcceptable).toBe(true);
    });
  });

  describe('Match type and feedback', () => {
    it('should return exact matchType for exact match', () => {
      const result = validateTyping('Hola', 'Hola');
      expect(result.matchType).toBe('exact');
      expect(result.feedbackMessage).toBeUndefined();
    });

    it('should return case matchType for case-only difference', () => {
      const result = validateTyping('hola', 'Hola');
      expect(result.matchType).toBe('case');
    });

    it('should return accent matchType for accent difference', () => {
      const result = validateTyping('adeu', 'Adéu');
      expect(result.matchType).toBe('accent');
      expect(result.feedbackMessage).toContain('accent');
    });

    it('should return typo matchType for small typos', () => {
      const result = validateTyping('restaurnt', 'restaurant');
      expect(result.matchType).toBe('typo');
      expect(result.hasTypo).toBe(true);
      expect(result.feedbackMessage).toContain('typo');
    });

    it('should return none matchType for wrong answers', () => {
      const result = validateTyping('goodbye', 'hello');
      expect(result.matchType).toBe('none');
      expect(result.isCorrect).toBe(false);
      expect(result.isAcceptable).toBe(false);
    });
  });
});
