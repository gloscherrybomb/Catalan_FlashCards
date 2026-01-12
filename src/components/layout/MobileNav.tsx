import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  BookOpen,
  BarChart3,
  Trophy,
  GraduationCap,
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/study', icon: BookOpen, label: 'Study' },
  { path: '/learn', icon: GraduationCap, label: 'Learn' },
  { path: '/stats', icon: BarChart3, label: 'Stats' },
  { path: '/achievements', icon: Trophy, label: 'Badges' },
];

export function MobileNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-t-3 border-miro-blue dark:border-ink-light/30 z-40 pb-safe">
      <div className="flex items-center justify-around h-18">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center justify-center w-16 h-full py-2"
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute -top-0.5 w-10 h-1.5 bg-miro-red rounded-b-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`p-2 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-miro-yellow text-miro-blue'
                    : 'text-miro-blue/50 dark:text-ink-light/50'
                }`}
              >
                <Icon size={22} />
              </motion.div>
              <span
                className={`text-xs mt-0.5 font-medium ${
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
