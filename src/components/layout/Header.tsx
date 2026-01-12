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
    <header className="sticky top-0 z-40">
      {/* Main header bar */}
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b-2 border-miro-blue/10 dark:border-ink-light/10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex items-center h-16 gap-6">

            {/* Logo & Brand - Fixed width to prevent layout shifts */}
            <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
              <motion.div
                className="relative flex-shrink-0"
                whileHover={{ rotate: [0, -8, 8, -4, 0] }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                {/* Layered blob backgrounds for depth */}
                <motion.div
                  className="absolute -inset-2 bg-miro-yellow/40 blob"
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="absolute -inset-1 bg-miro-orange/30 blob-2"
                  animate={{ scale: [1, 1.05, 1], rotate: [0, -3, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                />
                <div className="relative w-10 h-10 bg-gradient-to-br from-miro-red to-miro-red/90 blob flex items-center justify-center shadow-lg">
                  <span className="text-white font-display font-bold text-xl tracking-tight">C</span>
                </div>
                {/* Decorative Miró dots */}
                <motion.div
                  className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-miro-blue rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  className="absolute -bottom-0.5 -left-1 w-2 h-2 bg-miro-green rounded-full opacity-80"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }}
                />
              </motion.div>

              <div className="hidden sm:flex items-baseline gap-1">
                <span className="font-display font-bold text-xl lg:text-2xl text-miro-blue dark:text-ink-light tracking-tight">
                  Catalan
                </span>
                <span className="font-display font-bold text-xl lg:text-2xl gradient-text tracking-tight">
                  Cards
                </span>
              </div>
            </Link>

            {/* Decorative separator - Miró-style vertical element */}
            <div className="hidden md:flex items-center h-8 ml-2">
              <div className="w-px h-full bg-gradient-to-b from-transparent via-miro-blue/20 to-transparent" />
              <motion.div
                className="w-1.5 h-1.5 bg-miro-red rounded-full -ml-[3px]"
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>

            {/* Desktop Navigation - Centered with flex-1 */}
            <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
              {NAV_ITEMS.map((item, index) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="relative group"
                  >
                    <motion.div
                      className={`
                        flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-300
                        ${isActive
                          ? 'bg-miro-yellow text-miro-blue shadow-sm'
                          : 'text-miro-blue/60 dark:text-ink-light/60 hover:text-miro-blue dark:hover:text-ink-light hover:bg-miro-yellow/10'
                        }
                      `}
                      whileHover={{ y: -2 }}
                      whileTap={{ y: 0, scale: 0.98 }}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                    >
                      <Icon
                        size={17}
                        className={isActive ? 'text-miro-blue' : ''}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                      <span className={`
                        text-sm tracking-tight
                        ${isActive ? 'font-semibold' : 'font-medium'}
                        hidden lg:inline
                      `}>
                        {item.label}
                      </span>
                    </motion.div>

                    {/* Artistic underline decoration on hover */}
                    {!isActive && (
                      <motion.div
                        className="absolute -bottom-0.5 left-1/2 h-0.5 bg-gradient-to-r from-miro-red via-miro-orange to-miro-yellow rounded-full origin-center"
                        initial={{ width: 0, x: '-50%', opacity: 0 }}
                        whileHover={{ width: '70%', opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}

                    {/* Active indicator dot */}
                    {isActive && (
                      <motion.div
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-miro-red rounded-full"
                        layoutId="activeNavDot"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right side - Stats & Auth */}
            <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
              {isAuthenticated && (
                <>
                  <motion.div
                    className="hidden sm:block"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <StreakCounter size="sm" />
                  </motion.div>
                  <motion.div
                    className="hidden lg:block w-28"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <XPBar compact />
                  </motion.div>

                  {/* Subtle separator */}
                  <div className="hidden lg:block w-px h-6 bg-miro-blue/10 dark:bg-ink-light/10" />
                </>
              )}

              {/* Theme Toggle */}
              <ThemeToggle />

              {isAuthenticated ? (
                <div className="flex items-center gap-1.5">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {profile?.photoURL ? (
                      <img
                        src={profile.photoURL}
                        alt={profile.displayName}
                        className="w-8 h-8 rounded-full border-2 border-miro-yellow shadow-sm object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-miro-yellow to-miro-orange rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-sm">
                        <User size={14} className="text-miro-blue" />
                      </div>
                    )}
                  </motion.div>
                  <motion.button
                    onClick={logout}
                    className="p-2 text-miro-blue/40 dark:text-ink-light/40 hover:text-miro-red hover:bg-miro-red/10 rounded-lg transition-all duration-200"
                    title="Sign out"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <LogOut size={16} />
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  onClick={login}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-miro-red to-miro-red/90 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-300"
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ y: 0, scale: 0.98 }}
                >
                  <LogIn size={16} />
                  <span className="hidden sm:inline">Sign In</span>
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Subtle gradient line at bottom - Miró color accent */}
      <div className="h-0.5 bg-gradient-to-r from-miro-red via-miro-yellow via-50% to-miro-green opacity-60" />
    </header>
  );
}
