import { motion } from 'framer-motion';
import { Lock, Check } from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { Card } from '../components/ui/Card';
import type { Achievement } from '../types/gamification';

// Achievement definitions
const ACHIEVEMENTS: Achievement[] = [
  // First actions
  { id: 'first_card', name: 'First Steps', description: 'Review your first card', icon: '🐣', category: 'special', requirement: { type: 'first_action', action: 'review' }, xpReward: 10, rarity: 'common' },
  { id: 'first_import', name: 'Collector', description: 'Import your first flashcard set', icon: '📚', category: 'special', requirement: { type: 'first_action', action: 'import' }, xpReward: 15, rarity: 'common' },

  // Streaks
  { id: 'streak_3', name: 'Getting Started', description: '3-day study streak', icon: '✨', category: 'streak', requirement: { type: 'streak', days: 3 }, xpReward: 25, rarity: 'common' },
  { id: 'streak_7', name: 'Week Warrior', description: '7-day study streak', icon: '🔥', category: 'streak', requirement: { type: 'streak', days: 7 }, xpReward: 50, rarity: 'uncommon' },
  { id: 'streak_14', name: 'Fortnight Fighter', description: '14-day study streak', icon: '💪', category: 'streak', requirement: { type: 'streak', days: 14 }, xpReward: 100, rarity: 'rare' },
  { id: 'streak_30', name: 'Monthly Master', description: '30-day study streak', icon: '💎', category: 'streak', requirement: { type: 'streak', days: 30 }, xpReward: 200, rarity: 'epic' },
  { id: 'streak_100', name: 'Century Champion', description: '100-day study streak', icon: '👑', category: 'streak', requirement: { type: 'streak', days: 100 }, xpReward: 500, rarity: 'legendary' },

  // Cards reviewed
  { id: 'cards_10', name: 'Warm Up', description: 'Review 10 cards', icon: '📝', category: 'dedication', requirement: { type: 'cards_reviewed', count: 10 }, xpReward: 15, rarity: 'common' },
  { id: 'cards_50', name: 'Getting Serious', description: 'Review 50 cards', icon: '📖', category: 'dedication', requirement: { type: 'cards_reviewed', count: 50 }, xpReward: 30, rarity: 'common' },
  { id: 'cards_100', name: 'Century', description: 'Review 100 cards', icon: '💯', category: 'dedication', requirement: { type: 'cards_reviewed', count: 100 }, xpReward: 50, rarity: 'uncommon' },
  { id: 'cards_500', name: 'Half Thousand', description: 'Review 500 cards', icon: '🎯', category: 'dedication', requirement: { type: 'cards_reviewed', count: 500 }, xpReward: 100, rarity: 'rare' },
  { id: 'cards_1000', name: 'Millennium', description: 'Review 1000 cards', icon: '🏆', category: 'dedication', requirement: { type: 'cards_reviewed', count: 1000 }, xpReward: 250, rarity: 'epic' },

  // Cards mastered
  { id: 'master_10', name: 'Apprentice', description: 'Master 10 cards', icon: '🌱', category: 'mastery', requirement: { type: 'cards_mastered', count: 10 }, xpReward: 40, rarity: 'common' },
  { id: 'master_25', name: 'Rising Star', description: 'Master 25 cards', icon: '⭐', category: 'mastery', requirement: { type: 'cards_mastered', count: 25 }, xpReward: 75, rarity: 'uncommon' },
  { id: 'master_50', name: 'Knowledge Keeper', description: 'Master 50 cards', icon: '🧠', category: 'mastery', requirement: { type: 'cards_mastered', count: 50 }, xpReward: 150, rarity: 'rare' },
  { id: 'master_100', name: 'Sage', description: 'Master 100 cards', icon: '🦉', category: 'mastery', requirement: { type: 'cards_mastered', count: 100 }, xpReward: 300, rarity: 'epic' },

  // Perfect streaks
  { id: 'perfect_5', name: 'Sharp Mind', description: '5 perfect answers in a row', icon: '✅', category: 'speed', requirement: { type: 'perfect_streak', count: 5 }, xpReward: 25, rarity: 'common' },
  { id: 'perfect_10', name: 'Flawless', description: '10 perfect answers in a row', icon: '💫', category: 'speed', requirement: { type: 'perfect_streak', count: 10 }, xpReward: 50, rarity: 'uncommon' },
  { id: 'perfect_20', name: 'Untouchable', description: '20 perfect answers in a row', icon: '🌟', category: 'speed', requirement: { type: 'perfect_streak', count: 20 }, xpReward: 100, rarity: 'rare' },

  // Levels
  { id: 'level_5', name: 'Linguist', description: 'Reach level 5', icon: '📈', category: 'mastery', requirement: { type: 'level', level: 5 }, xpReward: 75, rarity: 'uncommon' },
  { id: 'level_10', name: 'Polyglot', description: 'Reach level 10', icon: '🗣️', category: 'mastery', requirement: { type: 'level', level: 10 }, xpReward: 200, rarity: 'epic' },

  // Special
  { id: 'verbs_master', name: 'Verb Virtuoso', description: 'Master all verb cards', icon: '⚡', category: 'special', requirement: { type: 'category_mastered', category: 'Verbs' }, xpReward: 150, rarity: 'rare' },
];

export function AchievementsPage() {
  const achievements = useUserStore((state) => state.achievements);

  const unlockedIds = new Set(achievements.map(a => a.achievementId));

  // Group achievements by category
  const categories = {
    streak: ACHIEVEMENTS.filter(a => a.category === 'streak'),
    mastery: ACHIEVEMENTS.filter(a => a.category === 'mastery'),
    dedication: ACHIEVEMENTS.filter(a => a.category === 'dedication'),
    speed: ACHIEVEMENTS.filter(a => a.category === 'speed'),
    special: ACHIEVEMENTS.filter(a => a.category === 'special'),
  };

  const categoryNames: Record<string, string> = {
    streak: 'Streak Achievements',
    mastery: 'Mastery Achievements',
    dedication: 'Dedication Achievements',
    speed: 'Speed Achievements',
    special: 'Special Achievements',
  };

  const rarityColors: Record<string, string> = {
    common: 'from-gray-400 to-gray-500',
    uncommon: 'from-green-400 to-green-500',
    rare: 'from-blue-400 to-blue-500',
    epic: 'from-purple-400 to-purple-500',
    legendary: 'from-yellow-400 to-orange-500',
  };

  const rarityBg: Record<string, string> = {
    common: 'bg-gray-100',
    uncommon: 'bg-green-50',
    rare: 'bg-blue-50',
    epic: 'bg-purple-50',
    legendary: 'bg-gradient-to-br from-yellow-50 to-orange-50',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Achievements</h1>
      <p className="text-gray-500 mb-8">
        {achievements.length} of {ACHIEVEMENTS.length} unlocked
      </p>

      {/* Progress summary */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {(['common', 'uncommon', 'rare', 'epic'] as const).map((rarity) => {
          const total = ACHIEVEMENTS.filter(a => a.rarity === rarity).length;
          const unlocked = ACHIEVEMENTS.filter(
            a => a.rarity === rarity && unlockedIds.has(a.id)
          ).length;

          return (
            <Card key={rarity} className="text-center">
              <p className={`text-lg font-bold bg-gradient-to-r ${rarityColors[rarity]} bg-clip-text text-transparent`}>
                {unlocked}/{total}
              </p>
              <p className="text-xs text-gray-500 capitalize">{rarity}</p>
            </Card>
          );
        })}
      </div>

      {/* Achievement categories */}
      {Object.entries(categories).map(([category, categoryAchievements]) => (
        <motion.div
          key={category}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {categoryNames[category]}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryAchievements.map((achievement) => {
              const isUnlocked = unlockedIds.has(achievement.id);
              const unlockData = achievements.find(
                a => a.achievementId === achievement.id
              );

              return (
                <motion.div
                  key={achievement.id}
                  whileHover={{ scale: 1.02 }}
                  className={`relative rounded-2xl p-4 transition-all ${
                    isUnlocked
                      ? rarityBg[achievement.rarity]
                      : 'bg-gray-50 opacity-60'
                  }`}
                >
                  {/* Rarity indicator */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r ${
                      rarityColors[achievement.rarity]
                    }`}
                  />

                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${
                        isUnlocked ? 'bg-white shadow-sm' : 'bg-gray-200'
                      }`}
                    >
                      {isUnlocked ? achievement.icon : <Lock size={24} className="text-gray-400" />}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-bold ${isUnlocked ? 'text-gray-800' : 'text-gray-400'}`}>
                          {achievement.name}
                        </h3>
                        {isUnlocked && (
                          <Check size={16} className="text-green-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {achievement.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-medium text-primary">
                          +{achievement.xpReward} XP
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize bg-gradient-to-r ${rarityColors[achievement.rarity]} text-white`}>
                          {achievement.rarity}
                        </span>
                      </div>
                    </div>
                  </div>

                  {unlockData && (
                    <p className="text-xs text-gray-400 mt-2">
                      Unlocked {new Date(unlockData.unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
