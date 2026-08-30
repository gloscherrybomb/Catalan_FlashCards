import { useUserStore } from '../../stores/userStore';
import { getLevelForXP, LEVELS } from '../../types/gamification';
import { LevelUpCelebration } from './LevelUpCelebration';

/**
 * Shows the level-up celebration when the user store reports a crossing.
 *
 * addXP wrote the new level but never compared it to the old one, so levelling
 * up - the payoff of the entire XP system - happened silently, and the
 * celebration component was never rendered anywhere in the app.
 *
 * Mounted in Layout rather than on a page because XP is awarded from study,
 * games, grammar and conversation alike; a page-level mount would celebrate
 * only some of them.
 */
export function LevelUpWatcher() {
  const pendingLevelUp = useUserStore((state) => state.pendingLevelUp);
  const clearLevelUp = useUserStore((state) => state.clearLevelUp);

  if (!pendingLevelUp) return null;

  const from = LEVELS.find(l => l.level === pendingLevelUp.from) ?? getLevelForXP(0);
  const to = LEVELS.find(l => l.level === pendingLevelUp.to) ?? from;

  return (
    <LevelUpCelebration
      show
      previousLevel={from}
      newLevel={to}
      onClose={clearLevelUp}
    />
  );
}
