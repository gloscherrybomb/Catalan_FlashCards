import { describe, it, expect, vi } from 'vitest';

vi.mock('./firebase', () => ({ isDemoMode: true, generateAudioFunction: vi.fn() }));

import { calculatePronunciationScore } from './speechRecognitionService';
import { PRONUNCIATION_THRESHOLDS } from '../config/constants';

/**
 * The scorer itself, as opposed to the phonetics it is built on.
 *
 * It previously compared raw characters after stripping diacritics, which both
 * punished differences that are not differences and ignored the ones that
 * matter most. These lock in the behaviour that replaced it.
 */
describe('calculatePronunciationScore', () => {
  it('scores an exact match perfectly', () => {
    const result = calculatePronunciationScore('bon dia', 'bon dia');
    expect(result.score).toBe(100);
    expect(result.isAcceptable).toBe(true);
    expect(result.words.every(w => w.correct)).toBe(true);
  });

  it('is not fooled by case or punctuation', () => {
    expect(calculatePronunciationScore('Bon dia!', 'bon dia').score).toBe(100);
  });

  /**
   * Central Catalan merges b and v, so this is a correct pronunciation and a
   * spelling coincidence. The old character-level scorer marked it 50% wrong on
   * a two-letter word.
   */
  it('accepts the b/v merger as correct', () => {
    const result = calculatePronunciationScore('bi', 'vi');
    expect(result.score).toBe(100);
    expect(result.words[0].correct).toBe(true);
  });

  /**
   * The old scorer stripped diacritics before comparing, so these were
   * identical - discarding the open/closed vowel contrast that most needs
   * practice.
   */
  it('does not treat a missing open-vowel accent as correct', () => {
    const result = calculatePronunciationScore('sec', 'sèc');
    expect(result.score).toBeLessThan(100);
  });

  it('reports a word-by-word breakdown', () => {
    const result = calculatePronunciationScore('bon nit', 'bon dia');
    expect(result.words).toHaveLength(2);
    expect(result.words[0]).toMatchObject({ expected: 'bon', correct: true });
    expect(result.words[1].correct).toBe(false);
  });

  it('names what went wrong instead of offering generic encouragement', () => {
    const result = calculatePronunciationScore('luna', 'lluna');
    expect(result.tips.length).toBeGreaterThan(0);
    expect(result.tips.join(' ')).toMatch(/ll|palate/i);
  });

  it('offers no tips when everything was right', () => {
    expect(calculatePronunciationScore('bon dia', 'bon dia').tips).toEqual([]);
  });

  it('marks a word that was not heard at all', () => {
    const result = calculatePronunciationScore('bon', 'bon dia');
    const missing = result.words.find(w => w.expected === 'dia');
    expect(missing?.heard).toBeNull();
    expect(missing?.correct).toBe(false);
  });

  it('caps the damage one wrong word can do', () => {
    // A single wild guess should cost that word, not the whole phrase.
    const result = calculatePronunciationScore(
      'bon dia com estàs xxxxxxxxxxxxxxxx',
      'bon dia com estàs bé'
    );
    expect(result.score).toBeGreaterThan(50);
  });

  it('scores an empty attempt at zero without throwing', () => {
    const result = calculatePronunciationScore('', 'bon dia');
    expect(result.score).toBe(0);
    expect(result.isAcceptable).toBe(false);
  });

  it('handles an empty target without producing NaN', () => {
    const result = calculatePronunciationScore('bon dia', '');
    expect(Number.isNaN(result.score)).toBe(false);
    expect(result.score).toBe(0);
  });

  it('describes what it measured rather than claiming perfect pronunciation', () => {
    // The scorer compares the recogniser's transcript, not delivery, so the
    // wording must not overclaim.
    const feedback = calculatePronunciationScore('bon dia', 'bon dia').feedback;
    expect(feedback.toLowerCase()).not.toContain('perfect pronunciation');
    expect(feedback.length).toBeGreaterThan(0);
  });

  it('uses the configured acceptability threshold', () => {
    const good = calculatePronunciationScore('bon dia com estàs', 'bon dia com estàs');
    expect(good.score).toBeGreaterThanOrEqual(PRONUNCIATION_THRESHOLDS.GOOD);
    expect(good.isAcceptable).toBe(true);
  });
});
