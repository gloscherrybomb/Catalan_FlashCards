import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCardStore } from './cardStore';
import { createInitialProgress } from '../services/sm2Algorithm';
import { SESSION_CONFIG, SM2_CONFIG } from '../config/constants';
import type { Flashcard, CardProgress, StudyDirection } from '../types/flashcard';

// The store imports firebase for sync; none of that is exercised here.
vi.mock('../services/firebase', () => ({
  isDemoMode: true,
  saveFlashcards: vi.fn(),
  getFlashcards: vi.fn(async () => []),
  deleteFlashcard: vi.fn(),
  getCardProgress: vi.fn(async () => []),
  updateCardProgress: vi.fn(),
}));

function card(id: string): Flashcard {
  return {
    id,
    front: `english-${id}`,
    back: `catala-${id}`,
    notes: '',
    category: 'Test',
    iconKey: 'default',
    createdAt: new Date(),
  };
}

/** Progress for a card that is well established: reviewed, easy, and due. */
function establishedProgress(cardId: string, direction: StudyDirection): CardProgress {
  return {
    ...createInitialProgress(cardId, direction),
    repetitions: 5,
    easeFactor: 2.5,
    interval: 10,
    nextReviewDate: new Date(Date.now() - 86_400_000), // due yesterday
  };
}

function seed(cards: Flashcard[], progress: Map<string, CardProgress>) {
  useCardStore.setState({ flashcards: cards, cardProgress: progress });
}

describe('cardStore.getStudyDeck - session composition', () => {
  beforeEach(() => {
    useCardStore.setState({ flashcards: [], cardProgress: new Map(), mistakeHistory: [] });
  });

  it('returns nothing when there are no cards', () => {
    expect(useCardStore.getState().getStudyDeck(20)).toEqual([]);
  });

  it('never returns more cards than the limit', () => {
    seed(Array.from({ length: 50 }, (_, i) => card(`c${i}`)), new Map());
    expect(useCardStore.getState().getStudyDeck(20)).toHaveLength(20);
  });

  it('includes both directions of a card as separate study items', () => {
    seed([card('a')], new Map());
    const deck = useCardStore.getState().getStudyDeck(20);
    expect(deck.map(c => c.direction).sort()).toEqual([
      'catalan-to-english',
      'english-to-catalan',
    ]);
  });

  /**
   * The core regression. requiresTyping() is true for any card under two
   * successful reps, so with a mixed deck the old
   * `slice(0, Math.max(minTyping, typingRequired.length))` took *every* typing
   * card and left no room for the rest - a new learner's entire session became
   * typing drills and MIN_TYPING_PERCENTAGE had no effect whatsoever.
   */
  it('does not let typing cards crowd out the rest of the session', () => {
    const limit = 20;
    const cards: Flashcard[] = [];
    const progress = new Map<string, CardProgress>();

    // 40 brand new cards (all typing-required) ...
    for (let i = 0; i < 40; i++) cards.push(card(`new${i}`));

    // ... and 40 well-established ones (not typing-required).
    for (let i = 0; i < 40; i++) {
      const c = card(`old${i}`);
      cards.push(c);
      for (const dir of ['english-to-catalan', 'catalan-to-english'] as StudyDirection[]) {
        progress.set(`${c.id}_${dir}`, establishedProgress(c.id, dir));
      }
    }

    seed(cards, progress);
    const deck = useCardStore.getState().getStudyDeck(limit);
    const typingCount = deck.filter(c => c.requiresTyping).length;

    expect(deck).toHaveLength(limit);
    // There is ample non-typing supply, so typing must sit at the target
    // rather than consuming the whole session.
    expect(typingCount).toBe(Math.ceil(limit * SESSION_CONFIG.MIN_TYPING_PERCENTAGE));
    expect(typingCount).toBeLessThan(limit);
  });

  it('still meets the typing quota when typing cards are scarce', () => {
    const limit = 20;
    const cards: Flashcard[] = [];
    const progress = new Map<string, CardProgress>();

    // Only two new cards; everything else is established.
    cards.push(card('new0'), card('new1'));
    for (let i = 0; i < 40; i++) {
      const c = card(`old${i}`);
      cards.push(c);
      for (const dir of ['english-to-catalan', 'catalan-to-english'] as StudyDirection[]) {
        progress.set(`${c.id}_${dir}`, establishedProgress(c.id, dir));
      }
    }

    seed(cards, progress);
    const deck = useCardStore.getState().getStudyDeck(limit);

    // 2 new cards x 2 directions = 4 typing items available; take them all.
    expect(deck.filter(c => c.requiresTyping)).toHaveLength(4);
    expect(deck).toHaveLength(limit);
  });

  it('fills the session from typing cards when nothing else is available', () => {
    // A brand new deck: every card is typing-required. A short session would be
    // worse than a full one, so typing is allowed to fill it.
    seed(Array.from({ length: 30 }, (_, i) => card(`c${i}`)), new Map());
    const deck = useCardStore.getState().getStudyDeck(20);

    expect(deck).toHaveLength(20);
    expect(deck.every(c => c.requiresTyping)).toBe(true);
  });

  it('treats struggling cards as typing-required', () => {
    const c = card('hard');
    const progress = new Map<string, CardProgress>();
    for (const dir of ['english-to-catalan', 'catalan-to-english'] as StudyDirection[]) {
      progress.set(`${c.id}_${dir}`, {
        ...establishedProgress(c.id, dir),
        // Below the struggling threshold, so it needs production practice.
        easeFactor: SM2_CONFIG.STRUGGLING_EASE_THRESHOLD - 0.1,
      });
    }

    seed([c], progress);
    expect(useCardStore.getState().getStudyDeck(20).every(x => x.requiresTyping)).toBe(true);
  });

  it('excludes cards that are not yet due', () => {
    const c = card('future');
    const progress = new Map<string, CardProgress>();
    for (const dir of ['english-to-catalan', 'catalan-to-english'] as StudyDirection[]) {
      progress.set(`${c.id}_${dir}`, {
        ...establishedProgress(c.id, dir),
        nextReviewDate: new Date(Date.now() + 7 * 86_400_000),
      });
    }

    seed([c], progress);
    expect(useCardStore.getState().getStudyDeck(20)).toEqual([]);
  });

  it('filters by category when asked', () => {
    const a = { ...card('a'), category: 'Food' };
    const b = { ...card('b'), category: 'Travel' };
    seed([a, b], new Map());

    const deck = useCardStore.getState().getStudyDeck(20, ['Food']);
    expect(deck.every(c => c.flashcard.category === 'Food')).toBe(true);
    expect(deck.length).toBeGreaterThan(0);
  });
});
