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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40 pb-safe">
      <div className="flex items-center justify-around h-16">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center justify-center w-16 h-full"
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute top-0 w-12 h-1 bg-primary rounded-b-full"
                />
              )}
              <Icon
                size={22}
                className={isActive ? 'text-primary' : 'text-gray-400'}
              />
              <span
                className={`text-xs mt-1 ${
                  isActive ? 'text-primary font-medium' : 'text-gray-400'
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
