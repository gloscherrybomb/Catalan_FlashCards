import { motion } from 'framer-motion';

export interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className = '' }: TabsProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Scrollable container for mobile */}
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
        <div className="flex gap-2 min-w-max pb-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`
                  relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm
                  transition-colors duration-200
                  ${isActive
                    ? 'bg-miro-blue text-white dark:bg-ink-light dark:text-miro-blue'
                    : 'bg-miro-blue/5 text-miro-blue/60 hover:bg-miro-blue/10 dark:bg-ink-light/5 dark:text-ink-light/60 dark:hover:bg-ink-light/10'
                  }
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-miro-blue dark:bg-ink-light rounded-xl -z-10"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Gradient fade indicators for scroll */}
      <div className="absolute left-0 top-0 bottom-1 w-4 bg-gradient-to-r from-canvas dark:from-canvas-dark to-transparent pointer-events-none md:hidden" />
      <div className="absolute right-0 top-0 bottom-1 w-4 bg-gradient-to-l from-canvas dark:from-canvas-dark to-transparent pointer-events-none md:hidden" />
    </div>
  );
}
