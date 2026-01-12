import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, X, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface StudyReminderProps {
  lastStudyDate: Date | null;
  currentStreak: number;
  dueCards: number;
}

export function StudyReminder({ lastStudyDate, currentStreak, dueCards }: StudyReminderProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user hasn't studied today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastStudy = lastStudyDate ? new Date(lastStudyDate) : null;
    if (lastStudy) {
      lastStudy.setHours(0, 0, 0, 0);
    }

    const hasStudiedToday = lastStudy && lastStudy.getTime() === today.getTime();
    const shouldShow = !hasStudiedToday && dueCards > 0 && !isDismissed;

    // Show reminder after a short delay
    if (shouldShow) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [lastStudyDate, dueCards, isDismissed]);

  const getMessage = () => {
    if (currentStreak > 0) {
      return {
        title: `Don't break your ${currentStreak}-day streak!`,
        subtitle: `You have ${dueCards} cards waiting for you today.`,
        icon: '🔥',
        urgency: currentStreak >= 7 ? 'high' : 'medium',
      };
    }
    if (dueCards > 20) {
      return {
        title: 'Time for a review session!',
        subtitle: `${dueCards} cards are ready - let's keep that momentum!`,
        icon: '📚',
        urgency: 'medium',
      };
    }
    return {
      title: 'Ready to learn some Catalan?',
      subtitle: `${dueCards} cards are waiting for you.`,
      icon: '👋',
      urgency: 'low',
    };
  };

  const message = getMessage();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="fixed top-4 right-4 left-4 md:left-auto md:w-96 z-50"
        >
          <Card className={`relative shadow-lg border-l-4 ${
            message.urgency === 'high'
              ? 'border-l-orange-500 bg-orange-50 dark:bg-orange-950/20'
              : message.urgency === 'medium'
              ? 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20'
              : 'border-l-gray-300 dark:border-l-gray-600'
          }`}>
            <button
              onClick={() => {
                setIsVisible(false);
                setIsDismissed(true);
              }}
              className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3 pr-6">
              <span className="text-3xl">{message.icon}</span>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-1">
                  {message.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  {message.subtitle}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      setIsVisible(false);
                      window.location.href = '/study';
                    }}
                  >
                    Start Studying
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsVisible(false);
                      setIsDismissed(true);
                    }}
                  >
                    Later
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Notification permission request component
export function NotificationSetup() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('Notification' in window);
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) return;

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === 'granted') {
      // Schedule a test notification
      new Notification('Catalan Cards', {
        body: 'Notifications enabled! We\'ll remind you to study.',
        icon: '/favicon.ico',
      });
    }
  };

  if (!isSupported || permission === 'granted') {
    return null;
  }

  if (permission === 'denied') {
    return (
      <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-400">
        <BellOff className="w-4 h-4" />
        <span>Notifications are blocked. Enable them in your browser settings.</span>
      </div>
    );
  }

  return (
    <div className="p-4 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/20">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Bell className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-1">
            Enable Study Reminders
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Get friendly reminders to maintain your streak and never miss a study session.
          </p>
          <Button size="sm" onClick={requestPermission}>
            Enable Notifications
          </Button>
        </div>
      </div>
    </div>
  );
}

// Streak warning banner
export function StreakWarning({ currentStreak, hasStudiedToday }: { currentStreak: number; hasStudiedToday: boolean }) {
  if (hasStudiedToday || currentStreak === 0) return null;

  const hoursLeft = 24 - new Date().getHours();

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className={`p-3 rounded-xl flex items-center gap-3 ${
        hoursLeft <= 6
          ? 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300'
          : 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300'
      }`}
    >
      <Clock className="w-5 h-5 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium">
          {hoursLeft <= 6
            ? `Only ${hoursLeft} hours left to keep your ${currentStreak}-day streak!`
            : `Study today to extend your ${currentStreak}-day streak!`}
        </p>
      </div>
    </motion.div>
  );
}
