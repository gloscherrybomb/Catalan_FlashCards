import { describe, it, expect } from 'vitest';
import { validateSentenceOrder, tokenizeSentence } from './sentenceService';

const words = (sentence: string) =>
  tokenizeSentence(sentence).map((word, i) => ({ id: String(i), word, originalIndex: i }));

describe('sentenceService.validateSentenceOrder', () => {
  it('scores a correct ordering as 100%', () => {
    const result = validateSentenceOrder(words('Bon dia com estàs'), 'Bon dia com estàs');
    expect(result.accuracy).toBe(100);
    expect(result.isCorrect).toBe(true);
  });

  it('scores a wrong ordering below 100%', () => {
    const result = validateSentenceOrder(words('dia Bon com estàs'), 'Bon dia com estàs');
    expect(result.accuracy).toBeLessThan(100);
    expect(result.isCorrect).toBe(false);
  });

  it('tolerates missing accents', () => {
    const result = validateSentenceOrder(words('Bon dia com estas'), 'Bon dia com estàs');
    expect(result.accuracy).toBe(100);
  });

  /**
   * An empty target divided zero by zero, so accuracy came out NaN and rendered
   * as "NaN%" in the exercise instead of failing visibly.
   */
  it('returns 0 rather than NaN for an empty target sentence', () => {
    const result = validateSentenceOrder([], '');
    expect(Number.isNaN(result.accuracy)).toBe(false);
    expect(result.accuracy).toBe(0);
    expect(result.isCorrect).toBe(false);
  });

  it('does not call an empty answer to an empty target correct', () => {
    expect(validateSentenceOrder([], '   ').isCorrect).toBe(false);
  });

  it('never reports NaN for any input shape', () => {
    const cases: Array<[ReturnType<typeof words>, string]> = [
      [[], 'Bon dia'],
      [words('Bon dia'), ''],
      [words('extra words here'), 'Bon dia'],
    ];
    for (const [order, target] of cases) {
      expect(Number.isNaN(validateSentenceOrder(order, target).accuracy)).toBe(false);
    }
  });
});
