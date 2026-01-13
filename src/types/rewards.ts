// Unlockable Rewards System Types

export type RewardType = 'avatar' | 'theme' | 'card_back' | 'badge' | 'streak_freeze' | 'power_up';

export type RewardRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface Reward {
  id: string;
  name: string;
  description: string;
  type: RewardType;
  rarity: RewardRarity;
  xpCost: number;
  icon: string;
  preview?: string; // CSS class or image URL
  unlockLevel?: number; // Minimum level to purchase
  isLimited?: boolean; // Limited time only
}

export interface OwnedReward {
  rewardId: string;
  purchasedAt: Date;
  isEquipped: boolean;
}

export interface UserRewards {
  ownedRewards: OwnedReward[];
  equippedAvatar: string | null;
  equippedTheme: string | null;
  equippedCardBack: string | null;
  totalXPSpent: number;
}

// Avatars
export const AVATARS: Reward[] = [
  {
    id: 'avatar_default',
    name: 'Beginner',
    description: 'Default learner avatar',
    type: 'avatar',
    rarity: 'common',
    xpCost: 0,
    icon: '👤',
  },
  {
    id: 'avatar_cat',
    name: 'El Gat',
    description: 'A curious Catalan cat',
    type: 'avatar',
    rarity: 'common',
    xpCost: 100,
    icon: '🐱',
  },
  {
    id: 'avatar_book',
    name: 'Bookworm',
    description: 'For the dedicated learner',
    type: 'avatar',
    rarity: 'common',
    xpCost: 150,
    icon: '📚',
  },
  {
    id: 'avatar_dragon',
    name: 'Sant Jordi Dragon',
    description: 'Legendary Catalan dragon',
    type: 'avatar',
    rarity: 'uncommon',
    xpCost: 300,
    icon: '🐉',
  },
  {
    id: 'avatar_rose',
    name: 'La Rosa',
    description: 'Symbol of Sant Jordi',
    type: 'avatar',
    rarity: 'uncommon',
    xpCost: 250,
    icon: '🌹',
  },
  {
    id: 'avatar_castle',
    name: 'Castell Builder',
    description: 'Human tower enthusiast',
    type: 'avatar',
    rarity: 'rare',
    xpCost: 500,
    icon: '🏰',
  },
  {
    id: 'avatar_fire',
    name: 'Correfoc Runner',
    description: 'Fire run participant',
    type: 'avatar',
    rarity: 'rare',
    xpCost: 600,
    icon: '🔥',
  },
  {
    id: 'avatar_crown',
    name: 'Language Royalty',
    description: 'For the truly dedicated',
    type: 'avatar',
    rarity: 'epic',
    xpCost: 1000,
    icon: '👑',
    unlockLevel: 8,
  },
  {
    id: 'avatar_star',
    name: 'Catalan Champion',
    description: 'The ultimate learner',
    type: 'avatar',
    rarity: 'legendary',
    xpCost: 2500,
    icon: '⭐',
    unlockLevel: 10,
  },
];

// Themes
export const THEMES: Reward[] = [
  {
    id: 'theme_default',
    name: 'Classic',
    description: 'Default Miró-inspired theme',
    type: 'theme',
    rarity: 'common',
    xpCost: 0,
    icon: '🎨',
    preview: 'theme-default',
  },
  {
    id: 'theme_ocean',
    name: 'Mediterranean',
    description: 'Calm blue ocean vibes',
    type: 'theme',
    rarity: 'uncommon',
    xpCost: 400,
    icon: '🌊',
    preview: 'theme-ocean',
  },
  {
    id: 'theme_sunset',
    name: 'Costa Brava Sunset',
    description: 'Warm sunset colors',
    type: 'theme',
    rarity: 'uncommon',
    xpCost: 400,
    icon: '🌅',
    preview: 'theme-sunset',
  },
  {
    id: 'theme_forest',
    name: 'Pyrenees Forest',
    description: 'Deep forest greens',
    type: 'theme',
    rarity: 'rare',
    xpCost: 750,
    icon: '🌲',
    preview: 'theme-forest',
  },
  {
    id: 'theme_gaudi',
    name: 'Gaudí Mosaic',
    description: 'Colorful mosaic patterns',
    type: 'theme',
    rarity: 'epic',
    xpCost: 1200,
    icon: '🏛️',
    preview: 'theme-gaudi',
    unlockLevel: 6,
  },
  {
    id: 'theme_night',
    name: 'Barcelona Nights',
    description: 'Elegant dark theme',
    type: 'theme',
    rarity: 'epic',
    xpCost: 1500,
    icon: '🌙',
    preview: 'theme-night',
    unlockLevel: 7,
  },
  {
    id: 'theme_gold',
    name: 'Golden Champion',
    description: 'Luxurious gold accents',
    type: 'theme',
    rarity: 'legendary',
    xpCost: 3000,
    icon: '✨',
    preview: 'theme-gold',
    unlockLevel: 11,
  },
];

// Card Backs
export const CARD_BACKS: Reward[] = [
  {
    id: 'cardback_default',
    name: 'Classic',
    description: 'Default card design',
    type: 'card_back',
    rarity: 'common',
    xpCost: 0,
    icon: '🃏',
    preview: 'cardback-default',
  },
  {
    id: 'cardback_senyera',
    name: 'Senyera',
    description: 'Catalan flag pattern',
    type: 'card_back',
    rarity: 'uncommon',
    xpCost: 200,
    icon: '🚩',
    preview: 'cardback-senyera',
  },
  {
    id: 'cardback_mosaic',
    name: 'Mosaic',
    description: 'Barcelona mosaic tiles',
    type: 'card_back',
    rarity: 'uncommon',
    xpCost: 250,
    icon: '🔷',
    preview: 'cardback-mosaic',
  },
  {
    id: 'cardback_sagrada',
    name: 'Sagrada Família',
    description: 'Inspired by Gaudí',
    type: 'card_back',
    rarity: 'rare',
    xpCost: 450,
    icon: '⛪',
    preview: 'cardback-sagrada',
  },
  {
    id: 'cardback_miro',
    name: 'Miró Art',
    description: 'Abstract art style',
    type: 'card_back',
    rarity: 'rare',
    xpCost: 500,
    icon: '🎭',
    preview: 'cardback-miro',
  },
  {
    id: 'cardback_stars',
    name: 'Starry Night',
    description: 'Cosmic Barcelona',
    type: 'card_back',
    rarity: 'epic',
    xpCost: 800,
    icon: '🌟',
    preview: 'cardback-stars',
    unlockLevel: 5,
  },
  {
    id: 'cardback_dragon',
    name: 'Dragon Scale',
    description: 'Sant Jordi dragon scales',
    type: 'card_back',
    rarity: 'legendary',
    xpCost: 1500,
    icon: '🐲',
    preview: 'cardback-dragon',
    unlockLevel: 9,
  },
];

// Power-ups and special items
export const POWER_UPS: Reward[] = [
  {
    id: 'powerup_streak_freeze',
    name: 'Streak Freeze',
    description: 'Protect your streak for one missed day',
    type: 'streak_freeze',
    rarity: 'uncommon',
    xpCost: 300,
    icon: '❄️',
  },
  {
    id: 'powerup_xp_boost',
    name: 'XP Boost (24h)',
    description: '1.5x XP for 24 hours',
    type: 'power_up',
    rarity: 'rare',
    xpCost: 500,
    icon: '⚡',
  },
  {
    id: 'powerup_hint_pack',
    name: 'Hint Pack',
    description: '10 extra hints for difficult cards',
    type: 'power_up',
    rarity: 'uncommon',
    xpCost: 200,
    icon: '💡',
  },
];

export const ALL_REWARDS: Reward[] = [...AVATARS, ...THEMES, ...CARD_BACKS, ...POWER_UPS];

// Helper functions
export function getRewardById(id: string): Reward | undefined {
  return ALL_REWARDS.find((r) => r.id === id);
}

export function getRewardsByType(type: RewardType): Reward[] {
  return ALL_REWARDS.filter((r) => r.type === type);
}

export function getRarityColor(rarity: RewardRarity): string {
  switch (rarity) {
    case 'common':
      return 'text-gray-500 bg-gray-100';
    case 'uncommon':
      return 'text-green-600 bg-green-100';
    case 'rare':
      return 'text-blue-600 bg-blue-100';
    case 'epic':
      return 'text-purple-600 bg-purple-100';
    case 'legendary':
      return 'text-yellow-600 bg-yellow-100';
  }
}

export function getRarityGradient(rarity: RewardRarity): string {
  switch (rarity) {
    case 'common':
      return 'from-gray-200 to-gray-300';
    case 'uncommon':
      return 'from-green-300 to-green-400';
    case 'rare':
      return 'from-blue-300 to-blue-500';
    case 'epic':
      return 'from-purple-400 to-purple-600';
    case 'legendary':
      return 'from-yellow-300 via-yellow-400 to-orange-400';
  }
}

export function canPurchaseReward(reward: Reward, userXP: number, userLevel: number): boolean {
  if (reward.unlockLevel && userLevel < reward.unlockLevel) return false;
  return userXP >= reward.xpCost;
}

export const DEFAULT_USER_REWARDS: UserRewards = {
  ownedRewards: [
    { rewardId: 'avatar_default', purchasedAt: new Date(), isEquipped: true },
    { rewardId: 'theme_default', purchasedAt: new Date(), isEquipped: true },
    { rewardId: 'cardback_default', purchasedAt: new Date(), isEquipped: true },
  ],
  equippedAvatar: 'avatar_default',
  equippedTheme: 'theme_default',
  equippedCardBack: 'cardback_default',
  totalXPSpent: 0,
};
