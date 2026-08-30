import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

/**
 * What a store writes to local storage is a design decision, and getting it
 * wrong is invisible until it bites.
 *
 * storyStore and curriculumStore had no partialize at all, so they persisted
 * their entire state - including currentUserId, which is identity rather than
 * progress. On a shared device a stale id could survive into another person's
 * session before auth resolved. They also persisted in-flight UI state: a
 * half-finished placement test followed the learner across a reload.
 */
const STORES = [
  'src/stores/userStore.ts',
  'src/stores/cardStore.ts',
  'src/stores/sessionStore.ts',
  'src/stores/curriculumStore.ts',
  'src/stores/grammarStore.ts',
  'src/stores/storyStore.ts',
  'src/stores/rewardsStore.ts',
];

function partializeBlock(source: string): string | null {
  const start = source.indexOf('partialize:');
  if (start === -1) return null;

  // Read to the end of the returned object literal.
  const end = source.indexOf('}),', start);
  const block = end === -1 ? source.slice(start) : source.slice(start, end);

  // Strip comments: sessionStore documents inside its partialize that isEnding
  // is deliberately NOT persisted, and a naive scan reads that as a violation.
  return block.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
}

describe('store persistence', () => {
  it('every persisted store declares what it saves', () => {
    const missing = STORES.filter(file => {
      const source = readFileSync(file, 'utf8');
      // Only stores that actually use persist() need one.
      return source.includes('persist(') && !source.includes('partialize:');
    });

    expect(missing).toEqual([]);
  });

  it('no store persists the signed-in user id', () => {
    // Identity comes from auth on every load; persisting it invites writing one
    // person's progress under another person's id.
    const offenders = STORES.filter(file => {
      const block = partializeBlock(readFileSync(file, 'utf8'));
      return block !== null && /currentUserId|user:/.test(block);
    });

    expect(offenders).toEqual([]);
  });

  it('no store persists in-flight UI state', () => {
    // Transient flags that should reset on reload rather than resume.
    const TRANSIENT = /placementInProgress|placementAnswers|isEnding|isLoading|currentParagraphIndex/;

    const offenders = STORES.filter(file => {
      const block = partializeBlock(readFileSync(file, 'utf8'));
      return block !== null && TRANSIENT.test(block);
    });

    expect(offenders).toEqual([]);
  });
});
