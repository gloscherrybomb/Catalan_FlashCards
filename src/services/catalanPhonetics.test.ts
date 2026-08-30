import { describe, it, expect } from 'vitest';
import {
  transcribeWord,
  soundsAlike,
  phonemeDistance,
  diagnoseWord,
  splitWords,
} from './catalanPhonetics';

/** Readable assertion helper: the phoneme string for a word. */
const ipa = (word: string) => transcribeWord(word).join('');

describe('catalanPhonetics', () => {
  describe('digraphs', () => {
    it('treats ny as one palatal sound', () => {
      expect(ipa('any')).toBe('aɲ');
      expect(transcribeWord('any')).toHaveLength(2);
    });

    it('treats ll as one sound, distinct from a plain l', () => {
      expect(ipa('lluna')).toBe('ʎunə'.replace('ə', 'a'));
      expect(ipa('ll')).toBe('ʎ');
      expect(ipa('l')).toBe('l');
    });

    it('distinguishes the geminate l·l from ll', () => {
      // novel·la vs *novella - different sounds, and the previous
      // character-level comparison could not tell them apart at all.
      expect(ipa('l·l')).toBe('lː');
      expect(ipa('l·l')).not.toBe(ipa('ll'));
    });

    it('maps tx and word-final -ig to the same affricate', () => {
      expect(ipa('tx')).toBe('tʃ');
      expect(ipa('maig')).toBe('matʃ');
    });

    it('maps ix to a single sh sound', () => {
      expect(ipa('caixa')).toBe('kaʃa');
      expect(ipa('peix')).toBe('peʃ');
    });

    it('maps tg and tj to the voiced affricate', () => {
      expect(ipa('tg')).toBe('dʒ');
      expect(ipa('tj')).toBe('dʒ');
    });

    it('silences the u of qu and gu before a front vowel', () => {
      expect(ipa('que')).toBe('ke');
      expect(ipa('qui')).toBe('ki');
      expect(ipa('guerra')).toBe('ɡera');
    });

    it('keeps the w of qu before a back vowel', () => {
      expect(ipa('quatre')).toBe('kwatɾe');
    });
  });

  describe('single graphemes', () => {
    it('makes c soft before e and i, hard elsewhere', () => {
      expect(ipa('cel')).toBe('sel');
      expect(ipa('cinc')).toBe('sink');
      expect(ipa('casa')).toBe('kaza');
    });

    it('always makes ç an s', () => {
      expect(ipa('ç')).toBe('s');
      expect(ipa('força')).toBe('foɾsa');
    });

    it('makes g soft before e and i', () => {
      expect(ipa('gel')).toBe('ʒel');
      expect(ipa('gat')).toBe('ɡat');
    });

    it('drops h entirely', () => {
      expect(ipa('hora')).toBe('oɾa');
      expect(ipa('hola')).toBe('ola');
    });

    it('voices s between vowels', () => {
      expect(ipa('casa')).toBe('kaza');
      expect(ipa('sol')).toBe('sol');
    });

    it('trills r at the start of a word and taps it between vowels', () => {
      expect(ipa('rosa')).toBe('roza');
      expect(ipa('cara')).toBe('kaɾa');
      expect(ipa('carro')).toBe('karo');
    });
  });

  describe('Central Catalan b/v merger', () => {
    /**
     * The single most consequential rule here. In Central Catalan b and v are
     * the same sound, so the recogniser hearing "bi" for "vi" is a spelling
     * coincidence, not a pronunciation error - but character comparison scored
     * it 50% wrong on a two-letter word.
     */
    it('treats b and v as the same sound', () => {
      expect(soundsAlike('vi', 'bi')).toBe(true);
      expect(soundsAlike('vaca', 'baca')).toBe(true);
      expect(phonemeDistance('vi', 'bi')).toBe(0);
    });
  });

  describe('vowel quality', () => {
    /**
     * The previous scorer stripped diacritics before comparing, making these
     * identical - discarding the contrast that most needs practice.
     */
    it('distinguishes open è from closed é', () => {
      expect(ipa('è')).toBe('ɛ');
      expect(ipa('é')).toBe('e');
      expect(soundsAlike('sec', 'sèc')).toBe(false);
    });

    it('distinguishes open ò from closed ó', () => {
      expect(ipa('ò')).toBe('ɔ');
      expect(ipa('ó')).toBe('o');
    });

    it('treats à as a plain a - the accent marks stress, not quality', () => {
      expect(ipa('à')).toBe('a');
      expect(soundsAlike('mà', 'ma')).toBe(true);
    });
  });

  describe('final devoicing', () => {
    it('devoices final b, d and g', () => {
      expect(ipa('fred')).toBe('fɾet');
      expect(ipa('amb')).toBe('amp');
    });
  });

  describe('final r', () => {
    it('drops a word-final r, which Central Catalan usually does', () => {
      // A learner who says "cantar" and one who says "canta" both match, which
      // is right: pronouncing it is not an error, and neither is dropping it.
      expect(soundsAlike('cantar', 'canta')).toBe(true);
    });
  });

  describe('phonemeDistance', () => {
    it('is zero for identical words', () => {
      expect(phonemeDistance('hola', 'hola')).toBe(0);
    });

    it('counts a digraph mistake once, not once per character', () => {
      // "ny" is two characters but one sound; charwise this would cost 2.
      expect(phonemeDistance('any', 'an')).toBe(1);
    });

    it('grows with genuine difference', () => {
      expect(phonemeDistance('hola', 'adeu')).toBeGreaterThan(2);
    });
  });

  describe('diagnoseWord', () => {
    it('says nothing when the words sound the same', () => {
      expect(diagnoseWord('vi', 'bi')).toBeNull();
      expect(diagnoseWord('hola', 'hola')).toBeNull();
    });

    it('names an open/closed vowel confusion specifically', () => {
      const tip = diagnoseWord('sèc', 'sec');
      expect(tip).not.toBeNull();
      expect(tip!.tip).toMatch(/open/i);
    });

    it('names ll flattened to a plain l', () => {
      const tip = diagnoseWord('lluna', 'luna');
      expect(tip).not.toBeNull();
      expect(tip!.tip).toMatch(/palate|ll/i);
    });

    it('names ny flattened to a plain n', () => {
      const tip = diagnoseWord('any', 'an');
      expect(tip).not.toBeNull();
      expect(tip!.sound).toBe('ny');
    });

    it('returns one tip, not a wall of them', () => {
      const tip = diagnoseWord('lluny', 'lun');
      expect(tip === null || typeof tip.tip === 'string').toBe(true);
    });
  });

  describe('splitWords', () => {
    it('drops punctuation and keeps the interpunct', () => {
      expect(splitWords('Bon dia, com estàs?')).toEqual(['bon', 'dia', 'com', 'estàs']);
      expect(splitWords('novel·la')).toEqual(['novel·la']);
    });

    it('returns nothing for empty or punctuation-only input', () => {
      expect(splitWords('')).toEqual([]);
      expect(splitWords('...!')).toEqual([]);
    });
  });
});
