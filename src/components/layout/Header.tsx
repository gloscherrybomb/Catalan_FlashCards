import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  BookOpen,
  BarChart3,
  Upload,
  Trophy,
  LogIn,
  LogOut,
  User,
} from 'lucide-react';
import { useUserStore } from '../../stores/userStore';
import { XPBar } from '../gamification/XPBar';
import { StreakCounter } from '../gamification/StreakCounter';
import { ThemeToggle } from '../ui/ThemeToggle';

const NAV_ITEMS = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/study', icon: BookOpen, label: 'Study' },
  { path: '/browse', icon: BookOpen, label: 'Cards' },
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
    <header className="bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-900/20 sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="font-bold text-xl gradient-text hidden sm:block">
              Catalan Cards
            </span>
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
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm font-medium">{item.label}</span>
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
                  <img
                    src={profile.photoURL}
                    alt={profile.displayName}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <User size={16} className="text-gray-500 dark:text-gray-400" />
                  </div>
                )}
                <button
                  onClick={logout}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  title="Sign out"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={login}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-600 transition-colors"
              >
                <LogIn size={18} />
                <span className="text-sm font-medium">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
