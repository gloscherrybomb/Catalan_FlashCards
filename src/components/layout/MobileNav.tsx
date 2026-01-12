import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  BookOpen,
  BarChart3,
  Trophy,
  Settings,
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/study', icon: BookOpen, label: 'Study' },
  { path: '/stats', icon: BarChart3, label: 'Stats' },
  { path: '/achievements', icon: Trophy, label: 'Badges' },
  { path: '/settings', icon: Settings, label: 'More' },
];

export function MobileNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-miro-blue/10 dark:border-ink-light/10 z-40 safe-area-bottom">
      {/* Gradient accent line at top */}
      <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-miro-red via-miro-yellow to-miro-green opacity-50" />

      <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center justify-center flex-1 min-w-0 h-full py-1.5"
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute -top-0.5 w-8 h-1 bg-miro-red rounded-b-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`p-1.5 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-miro-yellow text-miro-blue'
                    : 'text-miro-blue/50 dark:text-ink-light/50'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </motion.div>
              <span
                className={`text-[10px] mt-0.5 font-medium truncate ${
                  isActive
                    ? 'text-miro-blue dark:text-ink-light'
                    : 'text-miro-blue/50 dark:text-ink-light/50'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
