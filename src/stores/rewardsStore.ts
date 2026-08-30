import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Reward, UserRewards, OwnedReward } from '../types/rewards';
import { getRewardById, DEFAULT_USER_REWARDS } from '../types/rewards';
import { getPersistStorage } from '../utils/persistStorage';
import { logger } from '../services/logger';
import { useUserStore } from './userStore';

/**
 * The XP economy.
 *
 * XPShop existed as a 308-line component with no importer, and its only
 * purchase logic was a comment reading "Celebrate purchase". The rewards data -
 * nine avatars, seven themes, seven card backs and three power-ups - was
 * likewise unreachable. Nothing could be bought, owned or equipped.
 *
 * Spendable XP is lifetime XP minus what has been spent, rather than a balance
 * that decreases. Levels are derived from `progress.xp`, so deducting from it
 * would demote a learner for buying an avatar. `UserRewards.totalXPSpent`
 * already existed in the type, which is the model this restores.
 */

/** A power-up that is consumed on purchase rather than owned and equipped. */
const CONSUMABLE_TYPES = new Set(['streak_freeze', 'power_up']);

/** XP multiplier and duration granted by the XP boost power-up. */
const XP_BOOST_MULTIPLIER = 1.5;
const XP_BOOST_HOURS = 24;

export type PurchaseResult =
  | { ok: true; reward: Reward }
  | { ok: false; reason: 'already-owned' | 'insufficient-xp' | 'level-locked' | 'unknown-reward' };

interface RewardsState extends UserRewards {
  /** Epoch ms until which the XP boost applies, or null. */
  xpBoostUntil: number | null;
  /** Unused hint credits from the hint pack. */
  hintCredits: number;

  purchase: (rewardId: string) => Promise<PurchaseResult>;
  equip: (rewardId: string) => void;
  isOwned: (rewardId: string) => boolean;
  getAvailableXP: () => number;
  /** Active XP multiplier, 1 when no boost is running. */
  getXPMultiplier: () => number;
  consumeHint: () => boolean;
  reset: () => void;
}

/** Free rewards are owned from the start; otherwise the defaults are unequippable. */
function initialOwned(): OwnedReward[] {
  return ['avatar_default', 'theme_default', 'cardback_default'].map(rewardId => ({
    rewardId,
    purchasedAt: new Date(),
    isEquipped: true,
  }));
}

export const useRewardsStore = create<RewardsState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_USER_REWARDS,
      ownedRewards: initialOwned(),
      equippedAvatar: 'avatar_default',
      equippedTheme: 'theme_default',
      equippedCardBack: 'cardback_default',
      xpBoostUntil: null,
      hintCredits: 0,

      getAvailableXP: () => {
        const lifetime = useUserStore.getState().progress.xp ?? 0;
        return Math.max(0, lifetime - get().totalXPSpent);
      },

      getXPMultiplier: () => {
        const { xpBoostUntil } = get();
        return xpBoostUntil && xpBoostUntil > Date.now() ? XP_BOOST_MULTIPLIER : 1;
      },

      isOwned: (rewardId: string) =>
        get().ownedRewards.some(owned => owned.rewardId === rewardId),

      purchase: async (rewardId: string) => {
        const reward = getRewardById(rewardId);
        if (!reward) return { ok: false, reason: 'unknown-reward' };

        const state = get();
        const consumable = CONSUMABLE_TYPES.has(reward.type);

        // Consumables can be bought repeatedly; cosmetics cannot.
        if (!consumable && state.isOwned(rewardId)) {
          return { ok: false, reason: 'already-owned' };
        }

        const userProgress = useUserStore.getState().progress;
        if (reward.unlockLevel && (userProgress.level ?? 1) < reward.unlockLevel) {
          return { ok: false, reason: 'level-locked' };
        }
        if (state.getAvailableXP() < reward.xpCost) {
          return { ok: false, reason: 'insufficient-xp' };
        }

        // Spend first, then grant, so a failure cannot hand out a free reward.
        set({ totalXPSpent: state.totalXPSpent + reward.xpCost });

        if (consumable) {
          await applyConsumable(reward, set, get);
        } else {
          set({
            ownedRewards: [
              ...get().ownedRewards,
              { rewardId, purchasedAt: new Date(), isEquipped: false },
            ],
          });
        }

        logger.info('Reward purchased', 'RewardsStore', { rewardId, cost: reward.xpCost });
        return { ok: true, reward };
      },

      equip: (rewardId: string) => {
        const reward = getRewardById(rewardId);
        if (!reward || !get().isOwned(rewardId)) return;

        // One equipped item per slot.
        const slot =
          reward.type === 'avatar'
            ? 'equippedAvatar'
            : reward.type === 'theme'
              ? 'equippedTheme'
              : reward.type === 'card_back'
                ? 'equippedCardBack'
                : null;
        if (!slot) return;

        set({
          [slot]: rewardId,
          ownedRewards: get().ownedRewards.map(owned =>
            getRewardById(owned.rewardId)?.type === reward.type
              ? { ...owned, isEquipped: owned.rewardId === rewardId }
              : owned
          ),
        } as Partial<RewardsState>);
      },

      consumeHint: () => {
        const { hintCredits } = get();
        if (hintCredits <= 0) return false;
        set({ hintCredits: hintCredits - 1 });
        return true;
      },

      reset: () =>
        set({
          ...DEFAULT_USER_REWARDS,
          ownedRewards: initialOwned(),
          equippedAvatar: 'avatar_default',
          equippedTheme: 'theme_default',
          equippedCardBack: 'cardback_default',
          xpBoostUntil: null,
          hintCredits: 0,
        }),
    }),
    {
      name: 'catalan-rewards-storage',
      storage: getPersistStorage(),
      partialize: state => ({
        ownedRewards: state.ownedRewards,
        equippedAvatar: state.equippedAvatar,
        equippedTheme: state.equippedTheme,
        equippedCardBack: state.equippedCardBack,
        totalXPSpent: state.totalXPSpent,
        xpBoostUntil: state.xpBoostUntil,
        hintCredits: state.hintCredits,
      }),
      merge: (persisted, current) => {
        const saved = persisted as Partial<RewardsState> | undefined;
        return {
          ...current,
          ...saved,
          // Dates survive JSON as strings.
          ownedRewards: (saved?.ownedRewards ?? current.ownedRewards).map(owned => ({
            ...owned,
            purchasedAt: new Date(owned.purchasedAt),
          })),
        };
      },
    }
  )
);

/**
 * Grant a consumable's effect.
 *
 * Each of the three power-ups maps onto a mechanic that already exists, so none
 * of them is a badge that does nothing: the streak freeze sets the flag
 * updateStreak already checks, the boost multiplies XP for a day, and the hint
 * pack adds credits.
 */
async function applyConsumable(
  reward: Reward,
  set: (partial: Partial<RewardsState>) => void,
  get: () => RewardsState
): Promise<void> {
  switch (reward.id) {
    case 'powerup_streak_freeze':
      await useUserStore.getState().grantStreakFreeze();
      break;

    case 'powerup_xp_boost':
      set({ xpBoostUntil: Date.now() + XP_BOOST_HOURS * 60 * 60 * 1000 });
      break;

    case 'powerup_hint_pack':
      set({ hintCredits: get().hintCredits + 5 });
      break;

    default:
      logger.warn('Consumable has no effect defined', 'RewardsStore', { id: reward.id });
  }
}
