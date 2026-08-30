import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../services/firebase', () => ({
  isDemoMode: true,
  getCurriculumProgress: vi.fn(async () => null),
  updateCurriculumProgress: vi.fn(),
}));

import { useCurriculumStore } from './curriculumStore';

/**
 * Placement has to actually change where you start.
 *
 * The curriculum is a strict linear prerequisite chain, and isUnitUnlocked only
 * asked whether prerequisites were *completed*. A learner placed at A2 with
 * nothing completed therefore had every unit locked except unit-1-welcome, and
 * getNextLesson() fell through every level and returned null - so the placement
 * result was a label and nothing more.
 */
describe('curriculumStore placement', () => {
  beforeEach(() => {
    useCurriculumStore.setState({
      lessonProgress: {},
      currentLevel: 'A1',
      placementResult: null,
      currentUserId: null,
    });
  });

  describe('a learner placed at A2, with nothing completed', () => {
    beforeEach(() => {
      useCurriculumStore.getState().setCurrentLevel('A2');
    });

    it('unlocks the first A2 unit', () => {
      // unit-9-ramblas is the entry point of A2. Its only prerequisite is the
      // last A1 unit, which a placed-out learner has deliberately not done.
      expect(useCurriculumStore.getState().isUnitUnlocked('unit-9-ramblas')).toBe(true);
    });

    it('offers an A2 lesson as the next lesson, not null', () => {
      const next = useCurriculumStore.getState().getNextLesson();
      expect(next).not.toBeNull();
      expect(next?.unitId).toBe('unit-9-ramblas');
    });

    it('leaves earlier A1 units open for optional review', () => {
      expect(useCurriculumStore.getState().isUnitUnlocked('unit-4-wants')).toBe(true);
    });

    it('still requires progression within the placed level', () => {
      // unit-10 follows unit-9, both A2. Placement gets you to the level, it
      // does not hand you the whole level.
      expect(useCurriculumStore.getState().isUnitUnlocked('unit-10-market')).toBe(false);
    });

    it('does not unlock levels above the placement', () => {
      expect(useCurriculumStore.getState().isUnitUnlocked('unit-15-conversation')).toBe(false);
    });

    it('does not claim the skipped lessons were completed', () => {
      // Placing out is not the same as having done the work; inflating this
      // would corrupt progress and XP.
      const { getLevelProgress } = useCurriculumStore.getState();
      expect(getLevelProgress('A1').completed).toBe(0);
    });
  });

  describe('a learner placed at B1', () => {
    beforeEach(() => {
      useCurriculumStore.getState().setCurrentLevel('B1');
    });

    it('unlocks the first B1 unit', () => {
      expect(useCurriculumStore.getState().isUnitUnlocked('unit-15-conversation')).toBe(true);
    });

    it('opens both A1 and A2 for review', () => {
      const { isUnitUnlocked } = useCurriculumStore.getState();
      expect(isUnitUnlocked('unit-3-cafe')).toBe(true);
      expect(isUnitUnlocked('unit-12-restaurant')).toBe(true);
    });
  });

  describe('a learner starting at A1', () => {
    it('still has to go in order', () => {
      const { isUnitUnlocked } = useCurriculumStore.getState();
      expect(isUnitUnlocked('unit-1-welcome')).toBe(true);
      expect(isUnitUnlocked('unit-2-introductions')).toBe(false);
      expect(isUnitUnlocked('unit-9-ramblas')).toBe(false);
    });

    it('starts at the very first lesson', () => {
      expect(useCurriculumStore.getState().getNextLesson()?.unitId).toBe('unit-1-welcome');
    });
  });
});
