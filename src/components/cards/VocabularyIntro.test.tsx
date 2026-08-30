import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { StudyCard, StudyDirection } from '../../types/flashcard';
import { createInitialProgress } from '../../services/sm2Algorithm';

vi.mock('../../services/firebase', () => ({
  isDemoMode: true,
  generateAudioFunction: vi.fn(),
}));
vi.mock('../../services/imageService', () => ({
  imageService: { isConfigured: () => false, fetchImageForWord: vi.fn() },
}));

import { VocabularyIntro } from './VocabularyIntro';

function card(id: string, direction: StudyDirection = 'english-to-catalan'): StudyCard {
  return {
    flashcard: {
      id,
      front: `english-${id}`,
      back: `catala-${id}`,
      notes: '',
      category: 'Greetings',
      iconKey: 'x',
      createdAt: new Date(),
    },
    progress: createInitialProgress(id, direction),
    direction,
    requiresTyping: false,
  };
}

/** Click "Got it!" and wait for the word counter to actually move. */
async function advanceTo(word: number) {
  await userEvent.click(screen.getByRole('button', { name: /got it|start practice/i }));
  await waitFor(
    () => expect(screen.getByText(new RegExp(`Word ${word} of`, 'i'))).toBeTruthy(),
    { timeout: 3000 }
  );
}

describe('VocabularyIntro', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * The reported bug: study could not get past the first card.
   *
   * The card is rendered inside AnimatePresence mode="wait", which keeps the
   * outgoing child mounted until its exit animation completes. That child holds
   * the onNext from the render it mounted in, so `setCurrentIndex(currentIndex
   * + 1)` recomputed the same value on every press - the introduction advanced
   * once and then stuck forever.
   */
  it('advances through every word, not just the first', async () => {
    render(
      <VocabularyIntro
        cards={[card('a'), card('b'), card('c'), card('d')]}
        onComplete={vi.fn()}
      />
    );

    expect(screen.getByText(/Word 1 of 4/i)).toBeTruthy();
    await advanceTo(2);
    await advanceTo(3);
    await advanceTo(4);
  });

  /**
   * The introduction legitimately contains the same flashcard twice, once per
   * study direction, because the session deck holds both. Keying the animated
   * child by flashcard id alone made those two words share a key.
   */
  it('advances between two directions of the same card', async () => {
    render(
      <VocabularyIntro
        cards={[card('same', 'english-to-catalan'), card('same', 'catalan-to-english')]}
        onComplete={vi.fn()}
      />
    );

    expect(screen.getByText(/Word 1 of 2/i)).toBeTruthy();
    await advanceTo(2);
  });

  it('calls onComplete after the last word', async () => {
    const onComplete = vi.fn();
    render(<VocabularyIntro cards={[card('a'), card('b')]} onComplete={onComplete} />);

    await advanceTo(2);
    // Matches either label: AnimatePresence mode="wait" can still be showing
    // the outgoing card's button while the counter has already moved on.
    await userEvent.click(screen.getByRole('button', { name: /got it|start practice/i }));

    await waitFor(() => expect(onComplete).toHaveBeenCalled());
  });

  it('completes immediately for a single-word introduction', async () => {
    const onComplete = vi.fn();
    render(<VocabularyIntro cards={[card('only')]} onComplete={onComplete} />);

    await userEvent.click(screen.getByRole('button', { name: /start practice/i }));
    await waitFor(() => expect(onComplete).toHaveBeenCalled());
  });
});
