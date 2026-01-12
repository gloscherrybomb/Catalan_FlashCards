import { ACHIEVEMENTS } from '../data/achievements';
import type { Achievement, UnlockedAchievement, AchievementRequirement } from '../types/gamification';
import type { UserProgress } from '../types/user';
import type { CardProgress, Flashcard } from '../types/flashcard';
import { unlockAchievement, isDemoMode } from './firebase';

export interface AchievementContext {
  progress: UserProgress;
  cardProgress: Map<string, CardProgress>;
  flashcards: Flashcard[];
  perfectStreak: number;
  unlockedAchievements: UnlockedAchievement[];
  userId?: string;
  hasImported?: boolean;
}

/**
 * Check all achievements and return newly unlocked ones
 */
export async function checkAchievements(context: AchievementContext): Promise<Achievement[]> {
  const { unlockedAchievements, userId } = context;
  const unlockedIds = new Set(unlockedAchievements.map(a => a.achievementId));
  const newlyUnlocked: Achievement[] = [];

  for (const achievement of ACHIEVEMENTS) {
    // Skip already unlocked
    if (unlockedIds.has(achievement.id)) continue;

    if (isAchievementMet(achievement.requirement, context)) {
      newlyUnlocked.push(achievement);

      // Save to Firebase if authenticated
      if (userId && !isDemoMode) {
        try {
          await unlockAchievement(userId, achievement.id);
        } catch (error) {
          console.error(`Failed to save achievement ${achievement.id}:`, error);
        }
      }
    }
  }

  return newlyUnlocked;
}

/**
 * Check if a specific achievement requirement is met
 */
function isAchievementMet(req: AchievementRequirement, ctx: AchievementContext): boolean {
  const { progress, cardProgress, flashcards, perfectStreak, hasImported } = ctx;

  switch (req.type) {
    case 'streak':
      return progress.currentStreak >= req.days;

    case 'cards_reviewed':
      return progress.totalCardsReviewed >= req.count;

    case 'cards_mastered':
      return countMasteredCards(cardProgress) >= req.count;

    case 'perfect_streak':
      return perfectStreak >= req.count;

    case 'level':
      return progress.level >= req.level;

    case 'xp':
      return progress.xp >= req.amount;

    case 'first_action':
      if (req.action === 'review') {
        return progress.totalCardsReviewed >= 1;
      }
      if (req.action === 'import') {
        return hasImported || flashcards.length > 0;
      }
      return false;

    case 'category_mastered':
      return isCategoryMastered(cardProgress, flashcards, req.category);

    default:
      return false;
  }
}

/**
 * Count the number of mastered cards (interval >= 21 days)
 * A card is considered mastered when both directions are mastered
 */
function countMasteredCards(cardProgress: Map<string, CardProgress>): number {
  const cardMastery = new Map<string, { engToCat: boolean; catToEng: boolean }>();

  for (const [, progress] of cardProgress) {
    const isMastered = progress.interval >= 21;
    const cardId = progress.cardId;

    if (!cardMastery.has(cardId)) {
      cardMastery.set(cardId, { engToCat: false, catToEng: false });
    }

    const mastery = cardMastery.get(cardId)!;
    if (progress.direction === 'english-to-catalan') {
      mastery.engToCat = isMastered;
    } else {
      mastery.catToEng = isMastered;
    }
  }

  // Count cards where at least one direction is mastered
  // (being strict: both directions would be too hard initially)
  let count = 0;
  for (const mastery of cardMastery.values()) {
    if (mastery.engToCat || mastery.catToEng) {
      count++;
    }
  }

  return count;
}

/**
 * Check if all cards in a category are mastered
 */
function isCategoryMastered(
  cardProgress: Map<string, CardProgress>,
  flashcards: Flashcard[],
  category: string
): boolean {
  const categoryCards = flashcards.filter(c => c.category === category);

  if (categoryCards.length === 0) return false;

  for (const card of categoryCards) {
    const engToCatKey = `${card.id}_english-to-catalan`;
    const catToEngKey = `${card.id}_catalan-to-english`;

    const engToCat = cardProgress.get(engToCatKey);
    const catToEng = cardProgress.get(catToEngKey);

    // Both directions must be mastered
    if (!engToCat || engToCat.interval < 21) return false;
    if (!catToEng || catToEng.interval < 21) return false;
  }

  return true;
}

/**
 * Get progress towards an achievement (0-100)
 */
export function getAchievementProgress(
  achievement: Achievement,
  context: Omit<AchievementContext, 'userId'>
): number {
  const { progress, cardProgress, flashcards, perfectStreak } = context;
  const req = achievement.requirement;

  switch (req.type) {
    case 'streak':
      return Math.min(100, Math.round((progress.currentStreak / req.days) * 100));

    case 'cards_reviewed':
      return Math.min(100, Math.round((progress.totalCardsReviewed / req.count) * 100));

    case 'cards_mastered':
      const mastered = countMasteredCards(cardProgress);
      return Math.min(100, Math.round((mastered / req.count) * 100));

    case 'perfect_streak':
      return Math.min(100, Math.round((perfectStreak / req.count) * 100));

    case 'level':
      return Math.min(100, Math.round((progress.level / req.level) * 100));

    case 'xp':
      return Math.min(100, Math.round((progress.xp / req.amount) * 100));

    case 'first_action':
      if (req.action === 'review') {
        return progress.totalCardsReviewed >= 1 ? 100 : 0;
      }
      if (req.action === 'import') {
        return flashcards.length > 0 ? 100 : 0;
      }
      return 0;

    case 'category_mastered':
      const categoryCards = flashcards.filter(c => c.category === req.category);
      if (categoryCards.length === 0) return 0;

      let masteredInCategory = 0;
      for (const card of categoryCards) {
        const engToCatKey = `${card.id}_english-to-catalan`;
        const catToEngKey = `${card.id}_catalan-to-english`;

        const engToCat = cardProgress.get(engToCatKey);
        const catToEng = cardProgress.get(catToEngKey);

        if ((engToCat?.interval ?? 0) >= 21 && (catToEng?.interval ?? 0) >= 21) {
          masteredInCategory++;
        }
      }

      return Math.round((masteredInCategory / categoryCards.length) * 100);

    default:
      return 0;
  }
}
