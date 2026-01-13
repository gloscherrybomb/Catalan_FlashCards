// Weekly Challenge Types and Definitions
import { useUserStore } from '../stores/userStore';

export type WeeklyChallengeType =
  | 'review_cards'
  | 'master_cards'
  | 'streak_days'
  | 'perfect_sessions'
  | 'category_focus'
  | 'speaking_practice'
  | 'speed_mastery'
  | 'accuracy_champion';

export interface WeeklyChallenge {
  id: string;
  type: WeeklyChallengeType;
  title: string;
  description: string;
  icon: string;
  target: number;
  current: number;
  xpReward: number;
  bonusMultiplier: number;
  startsAt: Date;
  expiresAt: Date;
  completedAt?: Date;
  category?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface WeeklyChallengeProgress {
  weekStart: string; // YYYY-MM-DD (Monday)
  challenges: WeeklyChallenge[];
  allCompleted: boolean;
  bonusXPEarned: number;
  streakWeeks: number; // Consecutive weeks completing all challenges
}

// Weekly challenge templates - more ambitious than daily
export const WEEKLY_CHALLENGE_TEMPLATES: Omit<WeeklyChallenge, 'id' | 'startsAt' | 'expiresAt' | 'current'>[] = [
  // Easy challenges
  {
    type: 'review_cards',
    title: 'Weekly Explorer',
    description: 'Review {target} cards this week',
    icon: '📚',
    target: 100,
    xpReward: 150,
    bonusMultiplier: 1.3,
    difficulty: 'easy',
  },
  {
    type: 'streak_days',
    title: 'Consistent Learner',
    description: 'Study for {target} days this week',
    icon: '📅',
    target: 5,
    xpReward: 125,
    bonusMultiplier: 1.25,
    difficulty: 'easy',
  },
  {
    type: 'accuracy_champion',
    title: 'Precision Player',
    description: 'Maintain {target}% average accuracy',
    icon: '🎯',
    target: 80,
    xpReward: 100,
    bonusMultiplier: 1.2,
    difficulty: 'easy',
  },

  // Medium challenges
  {
    type: 'review_cards',
    title: 'Weekly Warrior',
    description: 'Review {target} cards this week',
    icon: '⚔️',
    target: 200,
    xpReward: 300,
    bonusMultiplier: 1.5,
    difficulty: 'medium',
  },
  {
    type: 'master_cards',
    title: 'Knowledge Builder',
    description: 'Master {target} new cards',
    icon: '🏗️',
    target: 10,
    xpReward: 250,
    bonusMultiplier: 1.4,
    difficulty: 'medium',
  },
  {
    type: 'streak_days',
    title: 'Perfect Week',
    description: 'Study every day this week',
    icon: '🌟',
    target: 7,
    xpReward: 200,
    bonusMultiplier: 1.35,
    difficulty: 'medium',
  },
  {
    type: 'perfect_sessions',
    title: 'Flawless Performance',
    description: 'Complete {target} sessions with 90%+ accuracy',
    icon: '💎',
    target: 5,
    xpReward: 275,
    bonusMultiplier: 1.45,
    difficulty: 'medium',
  },
  {
    type: 'speaking_practice',
    title: 'Voice Training',
    description: 'Complete {target} speaking exercises',
    icon: '🎤',
    target: 20,
    xpReward: 225,
    bonusMultiplier: 1.35,
    difficulty: 'medium',
  },
  {
    type: 'category_focus',
    title: 'Verb Veteran',
    description: 'Review {target} verb cards',
    icon: '🏃',
    target: 50,
    xpReward: 200,
    bonusMultiplier: 1.3,
    category: 'Verbs',
    difficulty: 'medium',
  },

  // Hard challenges
  {
    type: 'review_cards',
    title: 'Weekly Champion',
    description: 'Review {target} cards this week',
    icon: '👑',
    target: 350,
    xpReward: 500,
    bonusMultiplier: 1.75,
    difficulty: 'hard',
  },
  {
    type: 'master_cards',
    title: 'Mastery Machine',
    description: 'Master {target} new cards',
    icon: '🚀',
    target: 25,
    xpReward: 450,
    bonusMultiplier: 1.6,
    difficulty: 'hard',
  },
  {
    type: 'speed_mastery',
    title: 'Speed Demon',
    description: 'Answer {target} cards in under 3 seconds each',
    icon: '⚡',
    target: 100,
    xpReward: 400,
    bonusMultiplier: 1.55,
    difficulty: 'hard',
  },
  {
    type: 'accuracy_champion',
    title: 'Perfectionist',
    description: 'Maintain {target}% average accuracy',
    icon: '🎯',
    target: 95,
    xpReward: 425,
    bonusMultiplier: 1.6,
    difficulty: 'hard',
  },
];

// Helper functions
export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getWeekEnd(date: Date = new Date()): Date {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return weekEnd;
}

export function generateWeeklyChallenges(): WeeklyChallenge[] {
  const weekStart = getWeekStart();
  const weekEnd = getWeekEnd();

  // Select challenges: 1 easy, 1 medium, 1 hard
  const easyTemplates = WEEKLY_CHALLENGE_TEMPLATES.filter(t => t.difficulty === 'easy');
  const mediumTemplates = WEEKLY_CHALLENGE_TEMPLATES.filter(t => t.difficulty === 'medium');
  const hardTemplates = WEEKLY_CHALLENGE_TEMPLATES.filter(t => t.difficulty === 'hard');

  const shuffleAndPick = <T>(arr: T[]): T => {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled[0];
  };

  const selected = [
    shuffleAndPick(easyTemplates),
    shuffleAndPick(mediumTemplates),
    shuffleAndPick(hardTemplates),
  ];

  return selected.map((template, index) => ({
    ...template,
    id: `weekly-${weekStart.toISOString().split('T')[0]}-${index}`,
    description: template.description.replace('{target}', String(template.target)),
    current: 0,
    startsAt: weekStart,
    expiresAt: weekEnd,
  }));
}

export function isWeeklyChallengeComplete(challenge: WeeklyChallenge): boolean {
  return challenge.current >= challenge.target;
}

export function getWeeklyChallengeProgress(challenge: WeeklyChallenge): number {
  return Math.min(100, Math.round((challenge.current / challenge.target) * 100));
}

export interface WeeklySessionResults {
  cardsReviewed: number;
  cardsMastered: number;
  studiedToday: boolean;
  sessionAccuracy: number;
  isPerfectSession: boolean; // 90%+ accuracy
  fastAnswers: number;
  speakingExercises: number;
  categoriesReviewed: Record<string, number>;
}

export function updateWeeklyChallenges(results: WeeklySessionResults): WeeklyChallenge[] {
  const stored = localStorage.getItem('weekly-challenges');
  if (!stored) return [];

  const { weekStart, challenges, daysStudied = [] } = JSON.parse(stored) as {
    weekStart: string;
    challenges: WeeklyChallenge[];
    daysStudied: string[];
  };

  const currentWeekStart = getWeekStart().toISOString().split('T')[0];

  // Don't update if challenges are from a different week
  if (weekStart !== currentWeekStart) return challenges;

  // Track study days
  const today = new Date().toISOString().split('T')[0];
  const updatedDaysStudied = daysStudied.includes(today) ? daysStudied : [...daysStudied, today];

  // Track if all challenges were already complete before this update
  const wereAllComplete = challenges.every(c => c.completedAt);

  const updatedChallenges = challenges.map((challenge) => {
    // Skip already completed challenges (they already got XP)
    if (challenge.completedAt) return challenge;

    let newCurrent = challenge.current;

    switch (challenge.type) {
      case 'review_cards':
        newCurrent += results.cardsReviewed;
        break;
      case 'master_cards':
        newCurrent += results.cardsMastered;
        break;
      case 'streak_days':
        newCurrent = updatedDaysStudied.length;
        break;
      case 'perfect_sessions':
        if (results.isPerfectSession) newCurrent += 1;
        break;
      case 'speed_mastery':
        newCurrent += results.fastAnswers;
        break;
      case 'speaking_practice':
        newCurrent += results.speakingExercises;
        break;
      case 'accuracy_champion':
        // Calculate running average - store as current best
        if (results.sessionAccuracy > 0) {
          newCurrent = Math.max(challenge.current, Math.round(results.sessionAccuracy));
        }
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

  // Check if all challenges are now complete and award 500 XP bonus
  const areAllNowComplete = updatedChallenges.every(c => c.current >= c.target);
  if (!wereAllComplete && areAllNowComplete) {
    useUserStore.getState().addXP(500);
  }

  // Save updated challenges
  localStorage.setItem('weekly-challenges', JSON.stringify({
    weekStart,
    challenges: updatedChallenges,
    daysStudied: updatedDaysStudied,
  }));

  return updatedChallenges;
}

export function getWeeklyChallenges(): WeeklyChallenge[] {
  const stored = localStorage.getItem('weekly-challenges');
  if (!stored) return [];

  const { weekStart, challenges } = JSON.parse(stored) as {
    weekStart: string;
    challenges: WeeklyChallenge[];
  };

  const currentWeekStart = getWeekStart().toISOString().split('T')[0];

  // Return empty if challenges are from a different week
  if (weekStart !== currentWeekStart) return [];

  return challenges.map(c => ({
    ...c,
    startsAt: new Date(c.startsAt),
    expiresAt: new Date(c.expiresAt),
    completedAt: c.completedAt ? new Date(c.completedAt) : undefined,
  }));
}

export function initializeWeeklyChallenges(): WeeklyChallenge[] {
  const existing = getWeeklyChallenges();
  if (existing.length > 0) return existing;

  const newChallenges = generateWeeklyChallenges();
  const weekStart = getWeekStart().toISOString().split('T')[0];

  localStorage.setItem('weekly-challenges', JSON.stringify({
    weekStart,
    challenges: newChallenges,
    daysStudied: [],
  }));

  return newChallenges;
}
