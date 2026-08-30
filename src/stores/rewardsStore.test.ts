import { describe, it, expect, beforeEach, vi } from 'vitest';

const grantStreakFreeze = vi.fn(async () => {});
let mockProgress = { xp: 0, level: 1 };

vi.mock('./userStore', () => ({
  useUserStore: {
    getState: () => ({ progress: mockProgress, grantStreakFreeze }),
  },
}));

import { useRewardsStore } from './rewardsStore';
import { getRewardById, ALL_REWARDS } from '../types/rewards';

const AVATAR_CAT = 'avatar_cat';        // 100 XP
const AVATAR_CROWN = 'avatar_crown';    // 4000 XP, level 9

describe('rewardsStore', () => {
  beforeEach(() => {
    mockProgress = { xp: 0, level: 1 };
    grantStreakFreeze.mockClear();
    useRewardsStore.getState().reset();
  });

  describe('spendable balance', () => {
    /**
     * Levels are derived from progress.xp, so spending must not deduct from it -
     * buying an avatar would otherwise demote the learner.
     */
    it('is lifetime XP minus what has been spent', async () => {
      mockProgress = { xp: 500, level: 5 };
      expect(useRewardsStore.getState().getAvailableXP()).toBe(500);

      await useRewardsStore.getState().purchase(AVATAR_CAT);

      expect(useRewardsStore.getState().getAvailableXP()).toBe(400);
      // Lifetime XP, and therefore the level, is untouched.
      expect(mockProgress.xp).toBe(500);
    });

    it('never goes negative', () => {
      mockProgress = { xp: 0, level: 1 };
      useRewardsStore.setState({ totalXPSpent: 9999 });
      expect(useRewardsStore.getState().getAvailableXP()).toBe(0);
    });
  });

  describe('purchase', () => {
    it('refuses when XP is short, and spends nothing', async () => {
      mockProgress = { xp: 50, level: 1 };

      const result = await useRewardsStore.getState().purchase(AVATAR_CAT);

      expect(result).toEqual({ ok: false, reason: 'insufficient-xp' });
      expect(useRewardsStore.getState().totalXPSpent).toBe(0);
      expect(useRewardsStore.getState().isOwned(AVATAR_CAT)).toBe(false);
    });

    it('grants ownership when affordable', async () => {
      mockProgress = { xp: 1000, level: 10 };

      const result = await useRewardsStore.getState().purchase(AVATAR_CAT);

      expect(result.ok).toBe(true);
      expect(useRewardsStore.getState().isOwned(AVATAR_CAT)).toBe(true);
    });

    it('refuses to buy the same cosmetic twice', async () => {
      mockProgress = { xp: 5000, level: 20 };
      await useRewardsStore.getState().purchase(AVATAR_CAT);
      const spentAfterFirst = useRewardsStore.getState().totalXPSpent;

      const second = await useRewardsStore.getState().purchase(AVATAR_CAT);

      expect(second).toEqual({ ok: false, reason: 'already-owned' });
      expect(useRewardsStore.getState().totalXPSpent).toBe(spentAfterFirst);
    });

    it('rejects an unknown reward', async () => {
      const result = await useRewardsStore.getState().purchase('not_a_reward');
      expect(result).toEqual({ ok: false, reason: 'unknown-reward' });
    });

    it('charges the listed price', async () => {
      mockProgress = { xp: 50_000, level: 20 };
      await useRewardsStore.getState().purchase(AVATAR_CROWN);
      expect(useRewardsStore.getState().totalXPSpent).toBe(
        getRewardById(AVATAR_CROWN)!.xpCost
      );
    });
  });

  describe('power-ups', () => {
    /** Each consumable maps to a real mechanic, not a badge that does nothing. */
    it('streak freeze restores the flag updateStreak consumes', async () => {
      mockProgress = { xp: 1000, level: 10 };
      await useRewardsStore.getState().purchase('powerup_streak_freeze');
      expect(grantStreakFreeze).toHaveBeenCalled();
    });

    it('XP boost applies a multiplier that later expires', async () => {
      mockProgress = { xp: 1000, level: 10 };
      expect(useRewardsStore.getState().getXPMultiplier()).toBe(1);

      await useRewardsStore.getState().purchase('powerup_xp_boost');
      expect(useRewardsStore.getState().getXPMultiplier()).toBeGreaterThan(1);

      useRewardsStore.setState({ xpBoostUntil: Date.now() - 1000 });
      expect(useRewardsStore.getState().getXPMultiplier()).toBe(1);
    });

    it('hint pack adds credits that can be spent once each', async () => {
      mockProgress = { xp: 1000, level: 10 };
      await useRewardsStore.getState().purchase('powerup_hint_pack');

      const credits = useRewardsStore.getState().hintCredits;
      expect(credits).toBeGreaterThan(0);

      expect(useRewardsStore.getState().consumeHint()).toBe(true);
      expect(useRewardsStore.getState().hintCredits).toBe(credits - 1);
    });

    it('does not spend a hint that is not there', () => {
      useRewardsStore.setState({ hintCredits: 0 });
      expect(useRewardsStore.getState().consumeHint()).toBe(false);
    });

    it('can be bought more than once, unlike cosmetics', async () => {
      mockProgress = { xp: 5000, level: 20 };
      const first = await useRewardsStore.getState().purchase('powerup_hint_pack');
      const second = await useRewardsStore.getState().purchase('powerup_hint_pack');
      expect(first.ok).toBe(true);
      expect(second.ok).toBe(true);
    });
  });

  describe('equip', () => {
    it('equips something owned', async () => {
      mockProgress = { xp: 1000, level: 10 };
      await useRewardsStore.getState().purchase(AVATAR_CAT);
      useRewardsStore.getState().equip(AVATAR_CAT);
      expect(useRewardsStore.getState().equippedAvatar).toBe(AVATAR_CAT);
    });

    it('refuses to equip something not owned', () => {
      useRewardsStore.getState().equip(AVATAR_CROWN);
      expect(useRewardsStore.getState().equippedAvatar).toBe('avatar_default');
    });

    it('allows only one item per slot', async () => {
      mockProgress = { xp: 5000, level: 20 };
      await useRewardsStore.getState().purchase(AVATAR_CAT);
      await useRewardsStore.getState().purchase(AVATAR_CROWN);

      useRewardsStore.getState().equip(AVATAR_CAT);
      useRewardsStore.getState().equip(AVATAR_CROWN);

      expect(useRewardsStore.getState().equippedAvatar).toBe(AVATAR_CROWN);
      const equipped = useRewardsStore
        .getState()
        .ownedRewards.filter(r => r.isEquipped && r.rewardId.startsWith('avatar_'));
      expect(equipped).toHaveLength(1);
    });

    it('starts with the free defaults owned and equipped', () => {
      const state = useRewardsStore.getState();
      expect(state.isOwned('avatar_default')).toBe(true);
      expect(state.equippedTheme).toBe('theme_default');
      expect(state.equippedCardBack).toBe('cardback_default');
    });
  });
});

describe('reward economy balance', () => {
  beforeEach(() => {
    mockProgress = { xp: 0, level: 1 };
    useRewardsStore.getState().reset();
  });

  /**
   * A beginner could previously buy almost the whole catalogue. Between card
   * XP, achievements, daily and weekly challenges and the practice caps, an
   * engaged learner earns well over ten thousand XP in their first week, and
   * the entire shop cost 17,350.
   */
  it('prices the catalogue beyond a beginner’s reach', () => {
    const total = ALL_REWARDS.reduce((sum, r) => sum + r.xpCost, 0);
    expect(total).toBeGreaterThan(50_000);
  });

  it('gates prestige rewards behind a level, not just XP', () => {
    const prestige = ALL_REWARDS.filter(
      r =>
        ['rare', 'epic', 'legendary'].includes(r.rarity) &&
        // Consumables are deliberately ungated: a streak freeze is no use to a
        // learner if it only unlocks at level 12.
        !['power_up', 'streak_freeze'].includes(r.type)
    );
    // Every one of them must require progression, so hoarding XP alone is not
    // enough to own the best items on day one.
    expect(prestige.every(r => (r.unlockLevel ?? 0) > 1)).toBe(true);
  });

  it('leaves the free starter items free and ungated', () => {
    for (const id of ['avatar_default', 'theme_default', 'cardback_default']) {
      const reward = ALL_REWARDS.find(r => r.id === id)!;
      expect(reward.xpCost).toBe(0);
      expect(reward.unlockLevel).toBeUndefined();
    }
  });

  it('refuses a purchase above the learner’s level even with the XP', () => {
    // Rich but low-level: XP alone must not buy a legendary item.
    mockProgress = { xp: 999_999, level: 2 };
    const legendary = ALL_REWARDS.find(r => r.rarity === 'legendary')!;

    return expect(useRewardsStore.getState().purchase(legendary.id)).resolves.toEqual({
      ok: false,
      reason: 'level-locked',
    });
  });

  it('keeps consumable power-ups ungated and affordable', () => {
    // A streak freeze is no use if it only unlocks at level 12.
    const consumables = ALL_REWARDS.filter(r =>
      ['power_up', 'streak_freeze'].includes(r.type)
    );
    expect(consumables.length).toBeGreaterThan(0);
    expect(consumables.every(r => r.unlockLevel === undefined)).toBe(true);
    expect(consumables.every(r => r.xpCost <= 1000)).toBe(true);
  });
});
