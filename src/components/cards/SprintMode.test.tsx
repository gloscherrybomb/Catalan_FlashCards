import { StrictMode } from 'react';
import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SprintMode } from './SprintMode';
import type { StudyCard } from '../../types/flashcard';

/**
 * Sprint runs on a 100ms interval and grades a card when the clock expires.
 * The expiry used to happen *inside* the setTimeLeft updater, and React
 * deliberately double-invokes updaters under StrictMode to surface impure
 * ones - so a single timeout graded the card twice.
 */

vi.mock('../ui/Confetti', () => ({ Confetti: () => null }));

function makeCard(id: string): StudyCard {
  return {
    flashcard: {
      id,
      front: `front-${id}`,
      back: `back-${id}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    direction: 'english-to-catalan',
  } as unknown as StudyCard;
}

describe('SprintMode', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('grades a timed-out card exactly once', () => {
    const onAnswer = vi.fn();

    render(
      <StrictMode>
        <SprintMode
          cards={[makeCard('a'), makeCard('b')]}
          timeLimit={1}
          onAnswer={onAnswer}
          onComplete={vi.fn()}
          onExit={vi.fn()}
        />
      </StrictMode>
    );

    // Run the clock past the one-second limit.
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(onAnswer).toHaveBeenCalledTimes(1);
  });
});
