// Daily Challenge Types and Definitions
import { useUserStore } from '../stores/userStore';

export type ChallengeType =
  | 'review_cards'
  | 'perfect_streak'
  | 'speed_round'
  | 'category_focus'
  | 'accuracy_goal'
  | 'typing_practice';

export interface DailyChallenge {
  id: string;
  type: ChallengeType;
  title: string;
  description: string;
  icon: string;
  target: number;
  current: number;
  xpReward: number;
  bonusMultiplier: number;
  expiresAt: Date;
  completedAt?: Date;
  category?: string; // For category_focus challenges
}

export interface DailyChallengeProgress {
  date: string; // YYYY-MM-DD
  challenges: DailyChallenge[];
  allCompleted: boolean;
  bonusXPEarned: number;
}

// Challenge templates
export const CHALLENGE_TEMPLATES: Omit<DailyChallenge, 'id' | 'expiresAt' | 'current'>[] = [
  {
    type: 'review_cards',
    title: 'Card Collector',
    description: 'Review {target} cards today',
    icon: '📚',
    target: 20,
    xpReward: 50,
    bonusMultiplier: 1.2,
  },
  {
    type: 'review_cards',
    title: 'Dedicated Learner',
    description: 'Review {target} cards today',
    icon: '📖',
    target: 30,
    xpReward: 75,
    bonusMultiplier: 1.3,
  },
  {
    type: 'perfect_streak',
    title: 'Perfectionist',
    description: 'Get {target} perfect answers in a row',
    icon: '🎯',
    target: 5,
    xpReward: 60,
    bonusMultiplier: 1.25,
  },
  {
    type: 'perfect_streak',
    title: 'Flawless',
    description: 'Get {target} perfect answers in a row',
    icon: '💎',
    target: 10,
    xpReward: 100,
    bonusMultiplier: 1.4,
  },
  {
    type: 'speed_round',
    title: 'Speed Demon',
    description: 'Answer {target} cards in under 3 seconds each',
    icon: '⚡',
    target: 10,
    xpReward: 70,
    bonusMultiplier: 1.3,
  },
  {
    type: 'accuracy_goal',
    title: 'Sharp Mind',
    description: 'Achieve {target}% accuracy in a session',
    icon: '🧠',
    target: 90,
    xpReward: 80,
    bonusMultiplier: 1.35,
  },
  {
    type: 'typing_practice',
    title: 'Keyboard Warrior',
    description: 'Type {target} correct answers',
    icon: '⌨️',
    target: 10,
    xpReward: 65,
    bonusMultiplier: 1.25,
  },
  {
    type: 'category_focus',
    title: 'Verb Master',
    description: 'Review {target} verb cards',
    icon: '🏃',
    target: 10,
    xpReward: 55,
    bonusMultiplier: 1.2,
    category: 'Verbs',
  },
  {
    type: 'category_focus',
    title: 'Number Ninja',
    description: 'Review {target} number cards',
    icon: '🔢',
    target: 8,
    xpReward: 50,
    bonusMultiplier: 1.2,
    category: 'Numbers',
  },
];

// Helper functions
export function generateDailyChallenges(): DailyChallenge[] {
  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  // Select 3 random challenges
  const shuffled = [...CHALLENGE_TEMPLATES].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 3);

  return selected.map((template, index) => ({
    ...template,
    id: `daily-${now.toISOString().split('T')[0]}-${index}`,
    description: template.description.replace('{target}', String(template.target)),
    current: 0,
    expiresAt: endOfDay,
  }));
}

export function isChallengeComplete(challenge: DailyChallenge): boolean {
  return challenge.current >= challenge.target;
}

export function getChallengeProgress(challenge: DailyChallenge): number {
  return Math.min(100, Math.round((challenge.current / challenge.target) * 100));
}

export interface SessionResultsForChallenges {
  cardsReviewed: number;
  perfectStreak: number;
  fastAnswers: number; // Answers under 3 seconds
  accuracy: number; // Percentage 0-100
  typedCorrectAnswers: number;
  categoriesReviewed: Record<string, number>; // category -> count
}

export function updateDailyChallenges(results: SessionResultsForChallenges): DailyChallenge[] {
  const stored = localStorage.getItem('daily-challenges');
  if (!stored) return [];

  const { date, challenges } = JSON.parse(stored) as { date: string; challenges: DailyChallenge[] };
  const today = new Date().toISOString().split('T')[0];

  // Don't update if challenges are from a different day
  if (date !== today) return challenges;

  const updatedChallenges = challenges.map((challenge) => {
    // Skip already completed challenges (they already got XP)
    if (challenge.completedAt) return challenge;

    let newCurrent = challenge.current;

    switch (challenge.type) {
      case 'review_cards':
        newCurrent += results.cardsReviewed;
        break;
      case 'perfect_streak':
        // Perfect streak tracks max consecutive perfect answers
        newCurrent = Math.max(challenge.current, results.perfectStreak);
        break;
      case 'speed_round':
        newCurrent += results.fastAnswers;
        break;
      case 'accuracy_goal':
        // Accuracy goal: if accuracy meets target, mark as complete
        if (results.accuracy >= challenge.target && results.cardsReviewed >= 5) {
          newCurrent = challenge.target;
        }
        break;
      case 'typing_practice':
        newCurrent += results.typedCorrectAnswers;
        break;
      case 'category_focus':
        if (challenge.category && results.categoriesReviewed[challenge.category]) {
          newCurrent += results.categoriesReviewed[challenge.category];
        }
        break;
    }

    const wasIncomplete = challenge.current < challenge.target;
    const isNowComplete = newCurrent >= challenge.target;

    // Award XP when challenge completes for the first time
    if (wasIncomplete && isNowComplete) {
      useUserStore.getState().addXP(challenge.xpReward);
    }

    return {
      ...challenge,
      current: Math.min(newCurrent, challenge.target),
      completedAt: isNowComplete && !challenge.completedAt ? new Date() : challenge.completedAt,
    };
  });

  // Save updated challenges
  localStorage.setItem('daily-challenges', JSON.stringify({
    date,
    challenges: updatedChallenges,
  }));

  return updatedChallenges;
}

export function getDailyChallenges(): DailyChallenge[] {
  const stored = localStorage.getItem('daily-challenges');
  if (!stored) return [];

  const { date, challenges } = JSON.parse(stored) as { date: string; challenges: DailyChallenge[] };
  const today = new Date().toISOString().split('T')[0];

  // Return empty if challenges are from a different day (they'll be regenerated)
  if (date !== today) return [];

  return challenges;
}
