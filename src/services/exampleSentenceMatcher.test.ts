import { describe, it, expect } from 'vitest';
import { containsWord, tokenise, findExampleSentence } from './exampleSentenceMatcher';
import type { SentenceData } from '../data/exampleSentences';

function sentence(catalan: string, english: string): SentenceData {
  return {
    id: catalan.slice(0, 12),
    categoryId: 'test',
    catalan,
    english,
    vocabularyIndices: [],
    hasAudio: false,
  };
}

describe('exampleSentenceMatcher', () => {
  describe('tokenise', () => {
    it('splits on whitespace and punctuation', () => {
      expect(tokenise('Bon dia! Com estàs?')).toEqual(['bon', 'dia', 'com', 'estàs']);
    });

    it('treats an apostrophe as a word boundary', () => {
      // `l'aigua` is the elided article plus the noun.
      expect(tokenise("Vull l'aigua")).toEqual(['vull', 'l', 'aigua']);
    });

    it('keeps hyphenated clitics as one token', () => {
      expect(tokenise('Encantada de conèixer-te!')).toContain('conèixer-te');
      expect(tokenise('Encantada de conèixer-te!')).not.toContain('te');
    });

    it('keeps accented characters and ç inside words', () => {
      expect(tokenise('El català és fàcil')).toEqual(['el', 'català', 'és', 'fàcil']);
    });

    it("keeps the interpunct of l·l", () => {
      expect(tokenise('Una novel·la')).toEqual(['una', 'novel·la']);
    });
  });

  describe('containsWord', () => {
    /**
     * The original substring bug: `catalanSentence.includes(word)` matched
     * "all" (garlic) inside "Treballo", "vi" (wine) inside "viatjarem", and
     * "on" (where) inside "Barcelona".
     */
    it('does not match a word inside a longer word', () => {
      expect(containsWord('Treballo en una oficina', 'all')).toBe(false);
      expect(containsWord('Aquest estiu viatjarem a Menorca', 'vi')).toBe(false);
      expect(containsWord('Soc de Barcelona', 'on')).toBe(false);
      expect(containsWord('Demà aniré a la platja', 'plat')).toBe(false);
      expect(containsWord('Faig esport tres vegades', 'port')).toBe(false);
    });

    it('matches a genuine whole word', () => {
      expect(containsWord('Bon dia! Com estàs?', 'dia')).toBe(true);
      expect(containsWord('Vull una cervesa', 'cervesa')).toBe(true);
    });

    it('matches regardless of trailing punctuation', () => {
      expect(containsWord('Com estàs?', 'estàs')).toBe(true);
      expect(containsWord('Hola, què tal!', 'hola')).toBe(true);
    });

    it('is case-insensitive', () => {
      expect(containsWord('Bon dia', 'BON')).toBe(true);
      expect(containsWord('Soc de Barcelona', 'barcelona')).toBe(true);
    });

    /**
     * The second defect: multi-word entries could never match, because the old
     * code compared a phrase against individual tokens.
     */
    it('matches a multi-word phrase appearing contiguously', () => {
      expect(containsWord('Bon dia! Com estàs?', 'bon dia')).toBe(true);
      expect(containsWord('Molt bé, gràcies', 'molt bé')).toBe(true);
    });

    it('does not match phrase words that are merely both present', () => {
      expect(containsWord('Bon vespre i bona nit', 'bon dia')).toBe(false);
    });

    it('matches a noun after an elided article', () => {
      expect(containsWord("Vull beure l'aigua", 'aigua')).toBe(true);
      expect(containsWord("És millor arribar d'hora", 'hora')).toBe(true);
    });

    it('does not match a clitic pronoun as a standalone noun', () => {
      // "te" the noun (tea) must not match "-te" the pronoun.
      expect(containsWord('Encantada de conèixer-te!', 'te')).toBe(false);
    });

    it('returns false for empty or punctuation-only targets', () => {
      expect(containsWord('Bon dia', '')).toBe(false);
      expect(containsWord('Bon dia', '...')).toBe(false);
    });
  });

  describe('findExampleSentence', () => {
    const sentences = [
      sentence('Bon dia! Com estàs?', 'Good morning! How are you?'),
      sentence('Vull una cervesa, si us plau.', 'I want a beer, please.'),
      sentence('Treballo en una oficina.', 'I work in an office.'),
    ];

    it('finds a sentence containing the Catalan word', () => {
      const match = findExampleSentence({ front: 'beer', back: 'cervesa' }, sentences);
      expect(match?.catalan).toBe('Vull una cervesa, si us plau.');
    });

    it('finds a sentence for a multi-word phrase', () => {
      const match = findExampleSentence({ front: 'good morning', back: 'bon dia' }, sentences);
      expect(match?.catalan).toBe('Bon dia! Com estàs?');
    });

    it('does not return a spurious substring match', () => {
      // The reported bug: "all" (garlic) matching "Treballo en una oficina".
      expect(findExampleSentence({ front: 'garlic', back: 'all' }, sentences)).toBeNull();
    });

    it('accepts either gender form', () => {
      const withForms = [sentence('El got és vell.', 'The glass is old.')];
      expect(findExampleSentence({ front: 'old', back: 'vell / vella' }, withForms)).not.toBeNull();

      const feminine = [sentence('La casa és vella.', 'The house is old.')];
      expect(findExampleSentence({ front: 'old', back: 'vell / vella' }, feminine)).not.toBeNull();
    });

    it('ignores gender markers in brackets', () => {
      const s = [sentence('Vaig a la platja.', 'I am going to the beach.')];
      expect(findExampleSentence({ front: 'beach', back: 'platja (F)' }, s)).not.toBeNull();
    });

    it('falls back to the English side', () => {
      const match = findExampleSentence({ front: 'office', back: 'despatx' }, sentences);
      expect(match?.english).toBe('I work in an office.');
    });

    it('returns null when nothing matches', () => {
      expect(findExampleSentence({ front: 'giraffe', back: 'girafa' }, sentences)).toBeNull();
    });

    it('prefers a Catalan match over an English one', () => {
      const both = [
        sentence('Treballo en una oficina.', 'I work in an office.'),
        sentence('Bec aigua cada dia.', 'I drink water every day.'),
      ];
      // "aigua" appears in Catalan in the second; "water" in English there too.
      const match = findExampleSentence({ front: 'water', back: 'aigua' }, both);
      expect(match?.catalan).toBe('Bec aigua cada dia.');
    });
  });
});
