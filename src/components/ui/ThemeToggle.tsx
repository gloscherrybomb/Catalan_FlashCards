import { motion } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemeToggleProps {
  showLabels?: boolean;
  className?: string;
}

export function ThemeToggle({ showLabels = false, className = '' }: ThemeToggleProps) {
  const { theme, setTheme, toggleTheme, resolvedTheme } = useTheme();

  // Simple toggle button
  if (!showLabels) {
    return (
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={toggleTheme}
        className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700
                   transition-colors ${className}`}
        aria-label={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}
      >
        <motion.div
          initial={false}
          animate={{ rotate: resolvedTheme === 'dark' ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {resolvedTheme === 'light' ? (
            <Sun className="w-5 h-5 text-amber-500" />
          ) : (
            <Moon className="w-5 h-5 text-blue-400" />
          )}
        </motion.div>
      </motion.button>
    );
  }

  // Full toggle with labels
  return (
    <div className={`flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}>
      <ThemeButton
        active={theme === 'light'}
        onClick={() => setTheme('light')}
        icon={<Sun className="w-4 h-4" />}
        label="Light"
      />
      <ThemeButton
        active={theme === 'dark'}
        onClick={() => setTheme('dark')}
        icon={<Moon className="w-4 h-4" />}
        label="Dark"
      />
      <ThemeButton
        active={theme === 'system'}
        onClick={() => setTheme('system')}
        icon={<Monitor className="w-4 h-4" />}
        label="System"
      />
    </div>
  );
}

interface ThemeButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function ThemeButton({ active, onClick, icon, label }: ThemeButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium
                 transition-all ${active
                   ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm'
                   : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                 }`}
    >
      {icon}
      {label}
    </button>
  );
}

// Mini version for mobile nav
export function ThemeToggleMini() {
  const { toggleTheme, resolvedTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
      aria-label="Toggle theme"
    >
      {resolvedTheme === 'light' ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
}
