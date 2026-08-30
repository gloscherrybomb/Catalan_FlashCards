import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Coins } from 'lucide-react';
import type { Reward } from '../types/rewards';
import { useRewardsStore } from '../stores/rewardsStore';
import { XPShop } from '../components/gamification/XPShop';
import { Card } from '../components/ui/Card';

/**
 * The XP shop.
 *
 * XPShop was a complete 308-line component with no importer anywhere, and no
 * spend logic behind it - its purchase handler was a comment. This gives it a
 * route, a real economy (see rewardsStore) and feedback on what happened.
 */
export function RewardsPage() {
  const ownedRewards = useRewardsStore((state) => state.ownedRewards);
  const equippedAvatar = useRewardsStore((state) => state.equippedAvatar);
  const equippedTheme = useRewardsStore((state) => state.equippedTheme);
  const equippedCardBack = useRewardsStore((state) => state.equippedCardBack);
  const purchase = useRewardsStore((state) => state.purchase);
  const equip = useRewardsStore((state) => state.equip);
  const getAvailableXP = useRewardsStore((state) => state.getAvailableXP);
  const totalXPSpent = useRewardsStore((state) => state.totalXPSpent);

  const [notice, setNotice] = useState<{ tone: 'good' | 'bad'; text: string } | null>(null);

  // Recomputed on every render so it tracks both XP earned and XP spent.
  const availableXP = getAvailableXP();

  const handlePurchase = useCallback(
    async (reward: Reward) => {
      const result = await purchase(reward.id);

      if (result.ok) {
        setNotice({ tone: 'good', text: `${reward.name} unlocked!` });
        return;
      }

      setNotice({
        tone: 'bad',
        text:
          result.reason === 'insufficient-xp'
            ? `You need ${reward.xpCost - availableXP} more XP for ${reward.name}.`
            : result.reason === 'level-locked'
              ? `${reward.name} unlocks at level ${reward.unlockLevel}.`
              : result.reason === 'already-owned'
                ? `You already own ${reward.name}.`
                : 'That reward could not be found.',
      });
    },
    [purchase, availableXP]
  );

  const handleEquip = useCallback(
    (reward: Reward) => {
      equip(reward.id);
      setNotice({ tone: 'good', text: `${reward.name} equipped.` });
    },
    [equip]
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-miro-yellow/20 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-miro-yellow" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-display font-bold text-miro-blue dark:text-ink-light">
            Rewards
          </h1>
          <p className="text-miro-blue/60 dark:text-ink-light/60">
            Spend XP on avatars, themes, card backs and power-ups.
          </p>
        </div>
      </div>

      <Card className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Coins className="w-6 h-6 text-miro-yellow" aria-hidden="true" />
            <div>
              <p className="text-2xl font-bold text-miro-blue dark:text-ink-light tabular-nums">
                {availableXP.toLocaleString()} XP
              </p>
              <p className="text-sm text-miro-blue/60 dark:text-ink-light/60">
                Available to spend
              </p>
            </div>
          </div>
          <p className="text-sm text-miro-blue/50 dark:text-ink-light/50 max-w-xs">
            Spending never reduces your level — it comes out of a separate
            balance, so your {totalXPSpent.toLocaleString()} XP spent still counts
            toward levelling up.
          </p>
        </div>
      </Card>

      {notice && (
        <motion.p
          key={notice.text}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          role="status"
          className={`mb-4 text-center text-sm font-medium px-4 py-3 rounded-xl border ${
            notice.tone === 'good'
              ? 'bg-miro-green/10 border-miro-green/30 text-miro-green'
              : 'bg-miro-red/10 border-miro-red/30 text-miro-red'
          }`}
        >
          {notice.text}
        </motion.p>
      )}

      <XPShop
        userRewards={{
          ownedRewards: ownedRewards.map(({ rewardId }) => ({ rewardId })),
          equippedAvatar,
          equippedTheme,
          equippedCardBack,
        }}
        availableXP={availableXP}
        onPurchase={handlePurchase}
        onEquip={handleEquip}
      />
    </div>
  );
}
