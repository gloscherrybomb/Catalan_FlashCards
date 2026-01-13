import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Lock,
  Check,
  Sparkles,
  User,
  Palette,
  CreditCard,
  Zap,
} from 'lucide-react';
import { Button } from '../ui/Button';
import {
  Reward,
  RewardType,
  AVATARS,
  THEMES,
  CARD_BACKS,
  POWER_UPS,
  getRarityColor,
  getRarityGradient,
} from '../../types/rewards';
import { useUserStore } from '../../stores/userStore';
import confetti from 'canvas-confetti';

interface XPShopProps {
  userRewards: {
    ownedRewards: { rewardId: string }[];
    equippedAvatar: string | null;
    equippedTheme: string | null;
    equippedCardBack: string | null;
  };
  onPurchase: (reward: Reward) => void;
  onEquip: (reward: Reward) => void;
}

const TABS: { type: RewardType | 'all'; label: string; icon: React.ReactNode }[] = [
  { type: 'all', label: 'All', icon: <ShoppingBag className="w-4 h-4" /> },
  { type: 'avatar', label: 'Avatars', icon: <User className="w-4 h-4" /> },
  { type: 'theme', label: 'Themes', icon: <Palette className="w-4 h-4" /> },
  { type: 'card_back', label: 'Cards', icon: <CreditCard className="w-4 h-4" /> },
  { type: 'power_up', label: 'Power-ups', icon: <Zap className="w-4 h-4" /> },
];

function RewardCard({
  reward,
  isOwned,
  isEquipped,
  canAfford,
  canUnlock,
  onPurchase,
  onEquip,
}: {
  reward: Reward;
  isOwned: boolean;
  isEquipped: boolean;
  canAfford: boolean;
  canUnlock: boolean;
  onPurchase: () => void;
  onEquip: () => void;
}) {
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handlePurchase = async () => {
    setIsPurchasing(true);
    await new Promise((r) => setTimeout(r, 500));
    onPurchase();
    setIsPurchasing(false);

    // Celebrate purchase
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`relative rounded-2xl overflow-hidden border-2 ${
        isEquipped
          ? 'border-miro-green'
          : isOwned
          ? 'border-miro-blue/20'
          : 'border-miro-blue/10'
      }`}
    >
      {/* Rarity gradient background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${getRarityGradient(
          reward.rarity
        )} opacity-10`}
      />

      <div className="relative p-4">
        {/* Rarity badge */}
        <div
          className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium ${getRarityColor(
            reward.rarity
          )}`}
        >
          {reward.rarity}
        </div>

        {/* Icon */}
        <motion.div
          className="w-16 h-16 mx-auto mb-3 rounded-xl bg-white dark:bg-ink-dark shadow-lg flex items-center justify-center text-4xl"
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          {reward.icon}
        </motion.div>

        {/* Info */}
        <h3 className="font-semibold text-center text-miro-blue dark:text-ink-light">
          {reward.name}
        </h3>
        <p className="text-xs text-center text-miro-blue/60 dark:text-ink-light/60 mt-1">
          {reward.description}
        </p>

        {/* Level requirement */}
        {reward.unlockLevel && !canUnlock && (
          <div className="flex items-center justify-center gap-1 mt-2 text-xs text-miro-red">
            <Lock className="w-3 h-3" />
            <span>Level {reward.unlockLevel}+</span>
          </div>
        )}

        {/* Price / Status */}
        <div className="mt-4">
          {isOwned ? (
            <Button
              variant={isEquipped ? 'primary' : 'secondary'}
              size="sm"
              className="w-full"
              onClick={onEquip}
              disabled={isEquipped}
              leftIcon={isEquipped ? <Check className="w-4 h-4" /> : undefined}
            >
              {isEquipped ? 'Equipped' : 'Equip'}
            </Button>
          ) : (
            <Button
              variant={canAfford && canUnlock ? 'primary' : 'secondary'}
              size="sm"
              className="w-full"
              onClick={handlePurchase}
              disabled={!canAfford || !canUnlock || isPurchasing}
              leftIcon={
                !canUnlock ? (
                  <Lock className="w-4 h-4" />
                ) : isPurchasing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                ) : undefined
              }
            >
              {reward.xpCost === 0 ? 'Free' : `${reward.xpCost} XP`}
            </Button>
          )}
        </div>
      </div>

      {/* Equipped indicator */}
      {isEquipped && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 left-2"
        >
          <div className="bg-miro-green text-white p-1 rounded-full">
            <Check className="w-3 h-3" />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export function XPShop({ userRewards, onPurchase, onEquip }: XPShopProps) {
  const [activeTab, setActiveTab] = useState<RewardType | 'all'>('all');
  const progress = useUserStore((state) => state.progress);

  const ownedIds = new Set(userRewards.ownedRewards.map((r) => r.rewardId));

  const getRewardsForTab = (): Reward[] => {
    switch (activeTab) {
      case 'avatar':
        return AVATARS;
      case 'theme':
        return THEMES;
      case 'card_back':
        return CARD_BACKS;
      case 'power_up':
      case 'streak_freeze':
        return POWER_UPS;
      default:
        return [...AVATARS, ...THEMES, ...CARD_BACKS, ...POWER_UPS];
    }
  };

  const rewards = getRewardsForTab();

  const isEquipped = (reward: Reward): boolean => {
    switch (reward.type) {
      case 'avatar':
        return userRewards.equippedAvatar === reward.id;
      case 'theme':
        return userRewards.equippedTheme === reward.id;
      case 'card_back':
        return userRewards.equippedCardBack === reward.id;
      default:
        return false;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-miro-yellow rounded-xl flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-miro-blue" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-miro-blue dark:text-ink-light">
              XP Shop
            </h2>
            <p className="text-sm text-miro-blue/60 dark:text-ink-light/60">
              Spend your hard-earned XP
            </p>
          </div>
        </div>

        {/* XP Balance */}
        <div className="bg-miro-yellow/20 rounded-xl px-4 py-2 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-miro-orange" />
          <span className="font-bold text-xl text-miro-blue dark:text-ink-light">
            {progress.xp.toLocaleString()}
          </span>
          <span className="text-sm text-miro-blue/60 dark:text-ink-light/60">XP</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.type}
            onClick={() => setActiveTab(tab.type)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
              activeTab === tab.type
                ? 'bg-miro-blue text-white'
                : 'bg-miro-blue/5 dark:bg-ink-light/5 text-miro-blue/60 dark:text-ink-light/60 hover:bg-miro-blue/10'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Rewards Grid */}
      <motion.div
        layout
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        <AnimatePresence mode="popLayout">
          {rewards.map((reward) => (
            <motion.div
              key={reward.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <RewardCard
                reward={reward}
                isOwned={ownedIds.has(reward.id)}
                isEquipped={isEquipped(reward)}
                canAfford={progress.xp >= reward.xpCost}
                canUnlock={!reward.unlockLevel || progress.level >= reward.unlockLevel}
                onPurchase={() => onPurchase(reward)}
                onEquip={() => onEquip(reward)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty state */}
      {rewards.length === 0 && (
        <div className="text-center py-12">
          <ShoppingBag className="w-12 h-12 mx-auto text-miro-blue/20 mb-4" />
          <p className="text-miro-blue/60 dark:text-ink-light/60">
            No rewards available in this category
          </p>
        </div>
      )}
    </div>
  );
}
