import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellOff, Clock, Sun, Moon, Sunset, AlertCircle, Check } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { notificationService } from '../../services/notificationService';
import type { NotificationSettings as NotificationSettingsType } from '../../types/notifications';

export function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettingsType>(
    notificationService.getSettings()
  );
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [isRequesting, setIsRequesting] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  const isSupported = notificationService.isSupported();

  useEffect(() => {
    setPermissionStatus(notificationService.getPermissionStatus());
  }, []);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    const granted = await notificationService.requestPermission();
    setPermissionStatus(notificationService.getPermissionStatus());
    if (granted) {
      setSettings(prev => ({ ...prev, enabled: true }));
    }
    setIsRequesting(false);
  };

  const handleToggle = (key: keyof NotificationSettingsType) => {
    const newSettings = {
      ...settings,
      [key]: !settings[key],
    };
    setSettings(newSettings);
    notificationService.updateSettings({ [key]: newSettings[key] });
    showSavedIndicator();
  };

  const handlePreferredTimeChange = (time: 'morning' | 'afternoon' | 'evening') => {
    const newSettings = { ...settings, preferredTime: time };
    setSettings(newSettings);
    notificationService.updateSettings({ preferredTime: time });
    showSavedIndicator();
  };

  const handleQuietHoursChange = (start: number, end: number) => {
    const newSettings = { ...settings, quietHoursStart: start, quietHoursEnd: end };
    setSettings(newSettings);
    notificationService.updateSettings({ quietHoursStart: start, quietHoursEnd: end });
    showSavedIndicator();
  };

  const showSavedIndicator = () => {
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  const sendTestNotification = async () => {
    await notificationService.showNotification(
      'Test Notification',
      'Notifications are working! You\'ll receive reminders to study Catalan.'
    );
  };

  if (!isSupported) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
          <AlertCircle className="w-5 h-5" />
          <div>
            <p className="font-medium">Notifications Not Available</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your browser doesn't support notifications. Try using Chrome or Firefox.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Permission Status */}
      {permissionStatus !== 'granted' && (
        <Card className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 border-violet-200 dark:border-violet-800">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center flex-shrink-0">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Enable Study Reminders
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Get notified when you have cards due and protect your streak with timely reminders.
              </p>
              <Button
                onClick={handleRequestPermission}
                disabled={isRequesting || permissionStatus === 'denied'}
                size="sm"
              >
                {isRequesting ? 'Requesting...' : permissionStatus === 'denied' ? 'Permission Denied' : 'Enable Notifications'}
              </Button>
              {permissionStatus === 'denied' && (
                <p className="text-xs text-red-500 mt-2">
                  Please enable notifications in your browser settings.
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Main Settings */}
      {permissionStatus === 'granted' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Master Toggle */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {settings.enabled ? (
                  <Bell className="w-5 h-5 text-violet-500" />
                ) : (
                  <BellOff className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Notifications
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {settings.enabled ? 'Reminders are active' : 'All reminders disabled'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('enabled')}
                className={`
                  relative w-12 h-6 rounded-full transition-colors
                  ${settings.enabled ? 'bg-violet-500' : 'bg-gray-300 dark:bg-gray-600'}
                `}
              >
                <span
                  className={`
                    absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow
                    ${settings.enabled ? 'translate-x-6' : 'translate-x-0'}
                  `}
                />
              </button>
            </div>
          </Card>

          {settings.enabled && (
            <>
              {/* Reminder Types */}
              <Card className="p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                  Reminder Types
                </h4>
                <div className="space-y-3">
                  <ToggleRow
                    label="Cards Due"
                    description="Remind when cards are ready for review"
                    enabled={settings.dueCardReminders}
                    onChange={() => handleToggle('dueCardReminders')}
                  />
                  <ToggleRow
                    label="Streak Protection"
                    description="Alert before your streak resets"
                    enabled={settings.streakReminders}
                    onChange={() => handleToggle('streakReminders')}
                  />
                  <ToggleRow
                    label="Daily Goal"
                    description="Reminder to reach your daily goal"
                    enabled={settings.dailyGoalReminders}
                    onChange={() => handleToggle('dailyGoalReminders')}
                  />
                </div>
              </Card>

              {/* Preferred Time */}
              <Card className="p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  Preferred Time
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  When would you like to receive study reminders?
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <TimeButton
                    icon={<Sun className="w-4 h-4" />}
                    label="Morning"
                    sublabel="9 AM"
                    selected={settings.preferredTime === 'morning'}
                    onClick={() => handlePreferredTimeChange('morning')}
                  />
                  <TimeButton
                    icon={<Sunset className="w-4 h-4" />}
                    label="Afternoon"
                    sublabel="2 PM"
                    selected={settings.preferredTime === 'afternoon'}
                    onClick={() => handlePreferredTimeChange('afternoon')}
                  />
                  <TimeButton
                    icon={<Moon className="w-4 h-4" />}
                    label="Evening"
                    sublabel="7 PM"
                    selected={settings.preferredTime === 'evening'}
                    onClick={() => handlePreferredTimeChange('evening')}
                  />
                </div>
              </Card>

              {/* Quiet Hours */}
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Quiet Hours
                  </h4>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  No notifications during these hours
                </p>
                <div className="flex items-center gap-3">
                  <select
                    value={settings.quietHoursStart}
                    onChange={(e) =>
                      handleQuietHoursChange(parseInt(e.target.value), settings.quietHoursEnd)
                    }
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  >
                    {Array.from({ length: 24 }).map((_, i) => (
                      <option key={i} value={i}>
                        {formatHour(i)}
                      </option>
                    ))}
                  </select>
                  <span className="text-gray-500">to</span>
                  <select
                    value={settings.quietHoursEnd}
                    onChange={(e) =>
                      handleQuietHoursChange(settings.quietHoursStart, parseInt(e.target.value))
                    }
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  >
                    {Array.from({ length: 24 }).map((_, i) => (
                      <option key={i} value={i}>
                        {formatHour(i)}
                      </option>
                    ))}
                  </select>
                </div>
              </Card>

              {/* Test Notification */}
              <Button
                variant="outline"
                fullWidth
                onClick={sendTestNotification}
              >
                Send Test Notification
              </Button>
            </>
          )}
        </motion.div>
      )}

      {/* Saved indicator */}
      {showSaved && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-green-500 text-white rounded-full text-sm flex items-center gap-2 shadow-lg"
        >
          <Check className="w-4 h-4" />
          Settings saved
        </motion.div>
      )}
    </div>
  );
}

// Helper Components
function ToggleRow({
  label,
  description,
  enabled,
  onChange,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="font-medium text-gray-800 dark:text-gray-200">{label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`
          relative w-10 h-5 rounded-full transition-colors
          ${enabled ? 'bg-violet-500' : 'bg-gray-300 dark:bg-gray-600'}
        `}
      >
        <span
          className={`
            absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow
            ${enabled ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
    </div>
  );
}

function TimeButton({
  icon,
  label,
  sublabel,
  selected,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        p-3 rounded-xl border-2 transition-all text-center
        ${
          selected
            ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }
      `}
    >
      <div
        className={`
          flex justify-center mb-1
          ${selected ? 'text-violet-500' : 'text-gray-400'}
        `}
      >
        {icon}
      </div>
      <p
        className={`
          text-sm font-medium
          ${selected ? 'text-violet-700 dark:text-violet-300' : 'text-gray-700 dark:text-gray-300'}
        `}
      >
        {label}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{sublabel}</p>
    </button>
  );
}

function formatHour(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:00 ${period}`;
}
