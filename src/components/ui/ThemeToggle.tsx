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
        whileHover={{ scale: 1.05 }}
        onClick={toggleTheme}
        className={`p-2 rounded-xl bg-miro-yellow/20 dark:bg-ink-light/10 hover:bg-miro-yellow/30 dark:hover:bg-ink-light/20
                   transition-colors border-2 border-miro-yellow/30 dark:border-ink-light/20 ${className}`}
        aria-label={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}
      >
        <motion.div
          initial={false}
          animate={{ rotate: resolvedTheme === 'dark' ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {resolvedTheme === 'light' ? (
            <Sun className="w-5 h-5 text-miro-orange" />
          ) : (
            <Moon className="w-5 h-5 text-miro-yellow" />
          )}
        </motion.div>
      </motion.button>
    );
  }

  // Full toggle with labels
  return (
    <div className={`flex items-center gap-1 p-1 bg-miro-blue/10 dark:bg-ink-light/10 rounded-xl border-2 border-miro-blue/20 dark:border-ink-light/20 ${className}`}>
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
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                 transition-all ${active
                   ? 'bg-miro-yellow text-miro-blue shadow-sm'
                   : 'text-miro-blue/60 dark:text-ink-light/60 hover:text-miro-blue dark:hover:text-ink-light'
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
      className="p-2 text-miro-blue/60 dark:text-ink-light/60 hover:text-miro-blue dark:hover:text-ink-light"
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
