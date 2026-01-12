import { motion } from 'framer-motion';
import {
  User,
  LogOut,
  ChevronRight,
  Upload,
  Download,
  Bell,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../stores/userStore';
import { useCardStore } from '../stores/cardStore';
import { Card, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { exportToCSV } from '../services/csvParser';
import { NotificationSettings } from '../components/settings/NotificationSettings';

export function SettingsPage() {
  const navigate = useNavigate();
  const profile = useUserStore((state) => state.profile);
  const progress = useUserStore((state) => state.progress);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const logout = useUserStore((state) => state.logout);
  const updateSettings = useUserStore((state) => state.updateSettings);
  const flashcards = useCardStore((state) => state.flashcards);

  const handleExport = () => {
    const csv = exportToCSV(flashcards);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `catalan-flashcards-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Settings</h1>

      {/* Profile section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="mb-6">
          <CardTitle>Profile</CardTitle>

          {isAuthenticated && profile ? (
            <div className="mt-4 flex items-center gap-4">
              {profile.photoURL ? (
                <img
                  src={profile.photoURL}
                  alt={profile.displayName}
                  className="w-16 h-16 rounded-full"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                  <User size={28} className="text-white" />
                </div>
              )}
              <div>
                <p className="font-bold text-gray-800">{profile.displayName}</p>
                <p className="text-sm text-gray-500">{profile.email}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Level {progress.level} • {progress.xp} XP
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-4 text-center py-4">
              <p className="text-gray-500 mb-4">
                Sign in to sync your progress across devices
              </p>
              <Button onClick={() => navigate('/')}>Sign In</Button>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Study preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="mb-6">
          <CardTitle>Study Preferences</CardTitle>

          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Daily Goal</p>
                <p className="text-sm text-gray-500">Cards to review per day</p>
              </div>
              <select
                value={profile?.settings.dailyGoal || 20}
                onChange={(e) => updateSettings({ dailyGoal: Number(e.target.value) })}
                className="px-3 py-2 rounded-lg border border-gray-200 focus:border-primary focus:outline-none"
              >
                <option value={10}>10 cards</option>
                <option value={20}>20 cards</option>
                <option value={30}>30 cards</option>
                <option value={50}>50 cards</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Preferred Mode</p>
                <p className="text-sm text-gray-500">Default study mode</p>
              </div>
              <select
                value={profile?.settings.preferredMode || 'mixed'}
                onChange={(e) => updateSettings({ preferredMode: e.target.value as any })}
                className="px-3 py-2 rounded-lg border border-gray-200 focus:border-primary focus:outline-none"
              >
                <option value="mixed">Mixed</option>
                <option value="flip">Flip Cards</option>
                <option value="multiple-choice">Multiple Choice</option>
                <option value="type-answer">Type Answer</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Show Hints</p>
                <p className="text-sm text-gray-500">Display grammar hints on cards</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile?.settings.showHints ?? true}
                  onChange={(e) => updateSettings({ showHints: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card className="mb-6">
          <CardTitle>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </div>
          </CardTitle>
          <div className="mt-4">
            <NotificationSettings />
          </div>
        </Card>
      </motion.div>

      {/* Data management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="mb-6">
          <CardTitle>Data Management</CardTitle>

          <div className="mt-4 space-y-3">
            <button
              onClick={() => navigate('/import')}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Upload size={20} className="text-gray-400" />
                <span className="font-medium text-gray-700">Import Cards</span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>

            <button
              onClick={handleExport}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Download size={20} className="text-gray-400" />
                <div className="text-left">
                  <span className="font-medium text-gray-700 block">Export Cards</span>
                  <span className="text-sm text-gray-400">
                    {flashcards.length} cards
                  </span>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>
          </div>
        </Card>
      </motion.div>

      {/* Stats summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="mb-6">
          <CardTitle>Your Stats</CardTitle>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-gray-800">{flashcards.length}</p>
              <p className="text-sm text-gray-500">Total Cards</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-gray-800">
                {progress.totalCardsReviewed}
              </p>
              <p className="text-sm text-gray-500">Reviews</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-gray-800">
                {progress.currentStreak}
              </p>
              <p className="text-sm text-gray-500">Current Streak</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-gray-800">{progress.xp}</p>
              <p className="text-sm text-gray-500">Total XP</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Sign out */}
      {isAuthenticated && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            variant="ghost"
            fullWidth
            className="text-red-500 hover:bg-red-50"
            onClick={handleLogout}
            leftIcon={<LogOut size={20} />}
          >
            Sign Out
          </Button>
        </motion.div>
      )}

      {/* App info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 text-center text-sm text-gray-400"
      >
        <p>Catalan FlashCards v1.0.0</p>
        <p className="mt-1">Made with ❤️ for Catalan learners</p>
      </motion.div>
    </div>
  );
}
