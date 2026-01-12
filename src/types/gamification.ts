export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'mastery' | 'speed' | 'dedication' | 'special';
  requirement: AchievementRequirement;
  xpReward: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export type AchievementRequirement =
  | { type: 'streak'; days: number }
  | { type: 'cards_reviewed'; count: number }
  | { type: 'cards_mastered'; count: number }
  | { type: 'perfect_streak'; count: number }
  | { type: 'category_mastered'; category: string }
  | { type: 'level'; level: number }
  | { type: 'xp'; amount: number }
  | { type: 'first_action'; action: string }
  | { type: 'speaking_exercises'; count: number }
  | { type: 'perfect_pronunciations'; count: number };

export interface UnlockedAchievement {
  achievementId: string;
  unlockedAt: Date;
}

export interface Level {
  level: number;
  title: string;
  titleCatalan: string;
  xpRequired: number;
  color: string;
}

export const LEVELS: Level[] = [
  { level: 1, title: 'Beginner', titleCatalan: 'Principiant', xpRequired: 0, color: '#94A3B8' },
  { level: 2, title: 'Apprentice', titleCatalan: 'Aprenent', xpRequired: 100, color: '#22C55E' },
  { level: 3, title: 'Student', titleCatalan: 'Estudiant', xpRequired: 300, color: '#3B82F6' },
  { level: 4, title: 'Scholar', titleCatalan: 'Erudit', xpRequired: 600, color: '#8B5CF6' },
  { level: 5, title: 'Linguist', titleCatalan: 'Lingüista', xpRequired: 1000, color: '#EC4899' },
  { level: 6, title: 'Expert', titleCatalan: 'Expert', xpRequired: 1500, color: '#F59E0B' },
  { level: 7, title: 'Master', titleCatalan: 'Mestre', xpRequired: 2200, color: '#EF4444' },
  { level: 8, title: 'Sage', titleCatalan: 'Savi', xpRequired: 3000, color: '#14B8A6' },
  { level: 9, title: 'Virtuoso', titleCatalan: 'Virtuós', xpRequired: 4000, color: '#6366F1' },
  { level: 10, title: 'Polyglot', titleCatalan: 'Poliglot', xpRequired: 5500, color: '#F97316' },
  { level: 11, title: 'Ambassador', titleCatalan: 'Ambaixador', xpRequired: 7500, color: '#06B6D4' },
  { level: 12, title: 'Catalan Champion', titleCatalan: 'Campió Català', xpRequired: 10000, color: '#FBBF24' },
];

export const XP_VALUES = {
  CARD_CORRECT: 10,
  CARD_PERFECT: 25,
  CARD_DIFFICULT: 5,
  CARD_WRONG: 2,
  STREAK_BONUS_7: 1.1,
  STREAK_BONUS_14: 1.15,
  STREAK_BONUS_30: 1.25,
  STREAK_BONUS_60: 1.4,
  STREAK_BONUS_100: 1.5,
  DAILY_GOAL_BONUS: 50,
  FIRST_CARD_OF_DAY: 15,
} as const;

export function getLevelForXP(xp: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xpRequired) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}

export function getXPForNextLevel(xp: number): { current: number; required: number; progress: number } {
  const currentLevel = getLevelForXP(xp);
  const nextLevel = LEVELS.find(l => l.level === currentLevel.level + 1);

  if (!nextLevel) {
    return { current: xp, required: xp, progress: 100 };
  }

  const xpInCurrentLevel = xp - currentLevel.xpRequired;
  const xpNeededForNext = nextLevel.xpRequired - currentLevel.xpRequired;

  return {
    current: xpInCurrentLevel,
    required: xpNeededForNext,
    progress: Math.round((xpInCurrentLevel / xpNeededForNext) * 100),
  };
}
