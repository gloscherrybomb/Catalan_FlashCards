import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  BookOpen,
  BarChart3,
  Upload,
  Trophy,
  LogIn,
  LogOut,
  User,
  Sparkles,
  BookText,
  MessageCircle,
} from 'lucide-react';
import { useUserStore } from '../../stores/userStore';
import { XPBar } from '../gamification/XPBar';
import { StreakCounter } from '../gamification/StreakCounter';
import { ThemeToggle } from '../ui/ThemeToggle';

const NAV_ITEMS = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/study', icon: BookOpen, label: 'Study' },
  { path: '/conversation', icon: MessageCircle, label: 'Chat' },
  { path: '/grammar', icon: BookText, label: 'Grammar' },
  { path: '/browse', icon: Sparkles, label: 'Cards' },
  { path: '/stats', icon: BarChart3, label: 'Stats' },
  { path: '/achievements', icon: Trophy, label: 'Badges' },
  { path: '/import', icon: Upload, label: 'Import' },
];

export function Header() {
  const location = useLocation();
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const profile = useUserStore((state) => state.profile);
  const login = useUserStore((state) => state.login);
  const logout = useUserStore((state) => state.logout);

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b-3 border-miro-blue dark:border-ink-light/30 sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-4 group flex-shrink-0">
            <motion.div
              className="relative flex-shrink-0"
              whileHover={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.5 }}
            >
              {/* Blob background */}
              <div className="absolute -inset-1 bg-miro-yellow blob opacity-60 group-hover:opacity-80 transition-opacity" />
              <div className="relative w-10 h-10 bg-miro-red blob flex items-center justify-center shadow-playful-sm">
                <span className="text-white font-display font-bold text-xl">C</span>
              </div>
              {/* Decorative dot */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-miro-blue rounded-full" />
            </motion.div>
            <div className="hidden sm:block flex-shrink-0">
              <span className="font-display font-bold text-2xl text-miro-blue dark:text-ink-light">
                Catalan
              </span>
              <span className="font-display font-bold text-2xl gradient-text ml-1">
                Cards
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative group"
                >
                  <motion.div
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-miro-yellow text-miro-blue font-semibold shadow-playful-sm'
                        : 'text-miro-blue/70 dark:text-ink-light/70 hover:text-miro-blue dark:hover:text-ink-light hover:bg-miro-yellow/20'
                    }`}
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 0 }}
                  >
                    <Icon size={18} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </motion.div>
                  {/* Hand-drawn underline on hover */}
                  {!isActive && (
                    <motion.div
                      className="absolute -bottom-1 left-1/2 h-0.5 bg-miro-red rounded-full"
                      initial={{ width: 0, x: '-50%' }}
                      whileHover={{ width: '60%' }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right side - Stats & Auth */}
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <>
                <div className="hidden sm:block">
                  <StreakCounter size="sm" />
                </div>
                <div className="hidden lg:block w-32">
                  <XPBar compact />
                </div>
              </>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {profile?.photoURL ? (
                  <motion.img
                    src={profile.photoURL}
                    alt={profile.displayName}
                    className="w-9 h-9 rounded-full border-2 border-miro-blue dark:border-ink-light"
                    whileHover={{ scale: 1.1 }}
                  />
                ) : (
                  <div className="w-9 h-9 bg-miro-yellow rounded-full flex items-center justify-center border-2 border-miro-blue">
                    <User size={16} className="text-miro-blue" />
                  </div>
                )}
                <motion.button
                  onClick={logout}
                  className="p-2 text-miro-blue/60 dark:text-ink-light/60 hover:text-miro-red hover:bg-miro-red/10 rounded-lg transition-colors"
                  title="Sign out"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LogOut size={18} />
                </motion.button>
              </div>
            ) : (
              <motion.button
                onClick={login}
                className="flex items-center gap-2 px-4 py-2 bg-miro-red text-white rounded-xl font-semibold shadow-playful-sm hover:shadow-playful transition-shadow"
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
              >
                <LogIn size={18} />
                <span className="text-sm">Sign In</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
