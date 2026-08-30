import { describe, it, expect } from 'vitest';
import { findExampleSentence } from '../services/exampleSentenceMatcher';
import { tokenise } from '../utils/textUtils';
import { COURSE_UNITS } from './colloquialVocabulary';
import { EXAMPLE_SENTENCES } from './exampleSentences';
import { SENTENCE_CATEGORIES } from './exampleSentences';

/**
 * A guard on content, not on code.
 *
 * The example-sentence set had drifted badly out of step with the vocabulary:
 * 53 sentences for 455 words, so 86% of the course reached the "learn in
 * context" step with nothing to show and the panel silently rendered empty.
 * Nothing surfaced that, because a missing sentence is invisible rather than
 * broken.
 *
 * These tests fail when vocabulary is added without a sentence to teach it.
 */
describe('example sentence coverage', () => {
  const uniqueWords = [
    ...new Map(
      COURSE_UNITS.flatMap(u => u.words).map(w => [w.back.toLowerCase(), w])
    ).values(),
  ];

  const uncovered = uniqueWords.filter(
    w => !findExampleSentence({ front: w.front, back: w.back })
  );

  it('has an example sentence for every course vocabulary word', () => {
    // Reported by word so a failure names exactly what needs writing.
    expect(uncovered.map(w => `${w.back} (${w.front})`)).toEqual([]);
  });

  it('covers the whole course vocabulary', () => {
    expect(uniqueWords.length).toBeGreaterThan(400);
    expect(uncovered).toHaveLength(0);
  });

  it('gives every sentence a category that exists', () => {
    const categoryIds = new Set(SENTENCE_CATEGORIES.map(c => c.id));
    const orphans = EXAMPLE_SENTENCES
      .filter(s => !categoryIds.has(s.categoryId))
      .map(s => `${s.id} -> ${s.categoryId}`);

    expect(orphans).toEqual([]);
  });

  it('uses unique sentence ids', () => {
    const seen = new Set<string>();
    const duplicates = EXAMPLE_SENTENCES
      .map(s => s.id)
      .filter(id => (seen.has(id) ? true : (seen.add(id), false)));

    expect(duplicates).toEqual([]);
  });

  it('gives every sentence both languages', () => {
    const incomplete = EXAMPLE_SENTENCES
      .filter(s => !s.catalan.trim() || !s.english.trim())
      .map(s => s.id);

    expect(incomplete).toEqual([]);
  });

  it('keeps vocabulary indices inside the whitespace token range', () => {
    // These index into sentenceService.tokenizeSentence, which splits on
    // whitespace. An out-of-range index makes Fill-in-the-Blank silently fall
    // back to a random word.
    const outOfRange = EXAMPLE_SENTENCES
      .filter(s =>
        s.vocabularyIndices.some(
          i => i < 0 || i >= s.catalan.split(/\s+/).filter(Boolean).length
        )
      )
      .map(s => `${s.id} -> [${s.vocabularyIndices}]`);

    expect(outOfRange).toEqual([]);
  });

  it('points each index at a word that really contains one of its targets', () => {
    // Exact check, mirroring how the indices are derived: the target's tokens
    // must appear in the whitespace token at that position (or the run of
    // tokens starting there, for a phrase).
    const wrong: string[] = [];

    for (const sentence of EXAMPLE_SENTENCES) {
      if (!sentence.targetWords?.length) continue;
      const words = sentence.catalan.split(/\s+/).filter(Boolean);

      for (const index of sentence.vocabularyIndices) {
        const hits = sentence.targetWords.some(target => {
          const targetTokens = tokenise(target);
          if (targetTokens.length === 0) return false;

          for (let span = 1; span <= words.length - index; span++) {
            const windowTokens = tokenise(words.slice(index, index + span).join(' '));
            if (windowTokens.length < targetTokens.length) continue;
            if (
              windowTokens.some((_, offset) =>
                targetTokens.every((t, k) => windowTokens[offset + k] === t)
              )
            ) {
              return true;
            }
            if (windowTokens.length > targetTokens.length + 1) break;
          }
          return false;
        });

        if (!hits) {
          wrong.push(`${sentence.id} index ${index} -> "${words[index]}"`);
        }
      }
    }

    expect(wrong).toEqual([]);
  });
});
