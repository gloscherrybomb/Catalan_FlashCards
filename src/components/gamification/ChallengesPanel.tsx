import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { DailyChallenge } from '../../types/challenges';
import type { WeeklyChallenge } from '../../types/weeklyChallenges';
import { getDailyChallenges } from '../../types/challenges';
import { getWeeklyChallenges } from '../../types/weeklyChallenges';
import { DailyChallenges } from './DailyChallenges';
import { WeeklyChallenges } from './WeeklyChallenges';
import { logger } from '../../services/logger';

/**
 * Daily and weekly challenges on the home page.
 *
 * These were rendered only by an older tabbed home page that nothing routed to.
 * Removing that dead page revealed the consequence: challenges have been
 * generated, updated after every session and awarding XP on completion - all
 * repaired earlier in this pass - while being completely invisible to the
 * learner. A challenge nobody can see is not a challenge.
 */
export function ChallengesPanel() {
  const navigate = useNavigate();
  const [daily, setDaily] = useState<DailyChallenge[]>([]);
  const [weekly, setWeekly] = useState<WeeklyChallenge[]>([]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [d, w] = await Promise.all([getDailyChallenges(), getWeeklyChallenges()]);
        if (mounted) {
          setDaily(d);
          setWeekly(w);
        }
      } catch (error) {
        // Challenges are a bonus; a storage failure must not break the home page.
        logger.warn('Could not load challenges', 'ChallengesPanel', {
          error: String(error),
        });
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  if (daily.length === 0 && weekly.length === 0) return null;

  return (
    <div className="space-y-6">
      {daily.length > 0 && (
        <DailyChallenges challenges={daily} onChallengeClick={() => navigate('/study')} />
      )}
      {weekly.length > 0 && <WeeklyChallenges challenges={weekly} />}
    </div>
  );
}
