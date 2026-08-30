import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Gamepad2,
  Dumbbell,
  BarChart3,
  LineChart,
  Trophy,
  Upload,
  Settings,
  MessageCircle,
  BookText,
  ChevronRight,
  Gift,
} from 'lucide-react';
import { Card } from '../components/ui/Card';

/**
 * Mobile hub for everything outside the primary five-tab bar.
 *
 * The bottom bar previously sent "More" straight to /settings, which left
 * Browse, Games, Drills, Analytics and Stories with no route into them on a
 * phone at all - /stories and /analytics had no link anywhere in the app.
 */
const SECTIONS: Array<{
  title: string;
  items: Array<{ path: string; icon: typeof Sparkles; label: string; description: string }>;
}> = [
  {
    title: 'Practise',
    items: [
      {
        path: '/conversation',
        icon: MessageCircle,
        label: 'Conversation',
        description: 'Role-play everyday situations in Catalan',
      },
      {
        path: '/grammar',
        icon: BookText,
        label: 'Grammar',
        description: 'Lessons and exercises, from articles to the subjunctive',
      },
      {
        path: '/games',
        icon: Gamepad2,
        label: 'Mini games',
        description: 'Word scramble, memory match and hangman',
      },
      {
        path: '/drills',
        icon: Dumbbell,
        label: 'Practice drills',
        description: 'Targeted training on your weak spots',
      },
    ],
  },
  {
    title: 'Progress',
    items: [
      {
        path: '/stats',
        icon: BarChart3,
        label: 'Statistics',
        description: 'Streak, activity and mastery over time',
      },
      {
        path: '/analytics',
        icon: LineChart,
        label: 'Analytics',
        description: 'Mistake patterns and what to work on next',
      },
      {
        path: '/achievements',
        icon: Trophy,
        label: 'Achievements',
        description: 'Badges you have unlocked',
      },
      {
        path: '/rewards',
        icon: Gift,
        label: 'Rewards',
        description: 'Spend XP on avatars, themes, card backs and power-ups',
      },
    ],
  },
  {
    title: 'Your cards',
    items: [
      {
        path: '/browse',
        icon: Sparkles,
        label: 'Browse cards',
        description: 'Search and manage your vocabulary',
      },
      {
        path: '/import',
        icon: Upload,
        label: 'Import cards',
        description: 'Add vocabulary from a CSV file',
      },
      {
        path: '/settings',
        icon: Settings,
        label: 'Settings',
        description: 'Daily goal, audio, theme and notifications',
      },
    ],
  },
];

export function MorePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold text-miro-blue dark:text-ink-light mb-8">
        More
      </h1>

      <div className="space-y-8">
        {SECTIONS.map((section, sectionIndex) => (
          <motion.section
            key={section.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.06 }}
          >
            <h2 className="text-sm font-semibold uppercase tracking-wider text-miro-blue/50 dark:text-ink-light/50 mb-3">
              {section.title}
            </h2>

            <Card variant="bordered" className="p-0 overflow-hidden">
              <ul className="divide-y divide-miro-blue/10 dark:divide-ink-light/10">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className="flex items-center gap-4 px-4 py-4 hover:bg-miro-yellow/10 transition-colors"
                      >
                        <span className="w-10 h-10 flex-shrink-0 rounded-xl bg-miro-blue/5 dark:bg-ink-light/10 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-miro-blue dark:text-ink-light" aria-hidden="true" />
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block font-semibold text-miro-blue dark:text-ink-light">
                            {item.label}
                          </span>
                          <span className="block text-sm text-miro-blue/60 dark:text-ink-light/60">
                            {item.description}
                          </span>
                        </span>
                        <ChevronRight
                          className="w-5 h-5 flex-shrink-0 text-miro-blue/30 dark:text-ink-light/30"
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </Card>
          </motion.section>
        ))}
      </div>
    </div>
  );
}
