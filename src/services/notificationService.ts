// Notification Service for Study Reminders
// Uses Web Notification API and Service Worker for push notifications

import { logger } from './logger';
import type { NotificationSettings } from '../types/notifications';
import { getUiPreferences, updateUiPreferences, isDemoMode } from './firebase';

export interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  scheduledTime: Date;
  type: 'due_cards' | 'streak' | 'daily_goal';
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  dueCardReminders: true,
  streakReminders: true,
  dailyGoalReminders: true,
  preferredTime: 'morning',
  quietHoursStart: 22, // 10 PM
  quietHoursEnd: 8,    // 8 AM
};

class NotificationService {
  private settings: NotificationSettings;
  private scheduledNotifications: Map<string, NodeJS.Timeout> = new Map();
  private currentUserId: string | null = null;

  constructor() {
    this.settings = { ...DEFAULT_SETTINGS };
  }

  async initialize(userId: string | null): Promise<void> {
    this.currentUserId = userId;
    if (!userId || isDemoMode) {
      this.settings = { ...DEFAULT_SETTINGS };
      return;
    }

    try {
      const prefs = await getUiPreferences(userId);
      if (prefs?.notificationSettings) {
        this.settings = { ...DEFAULT_SETTINGS, ...prefs.notificationSettings };
      } else {
        this.settings = { ...DEFAULT_SETTINGS };
      }
    } catch (error) {
      logger.error('Error loading notification settings', 'NotificationService', { error: String(error) });
      this.settings = { ...DEFAULT_SETTINGS };
    }
  }

  clearUser(): void {
    this.currentUserId = null;
    this.settings = { ...DEFAULT_SETTINGS };
  }

  /**
   * Check if notifications are supported
   */
  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  /**
   * Get current permission status
   */
  getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      logger.warn('Notifications not supported', 'NotificationService');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';

      if (granted) {
        this.settings.enabled = true;
        await this.saveSettings();
      }

      return granted;
    } catch (error) {
      logger.error('Error requesting notification permission', 'NotificationService', { error: String(error) });
      return false;
    }
  }

  /**
   * Save settings to Firebase
   */
  private async saveSettings(): Promise<void> {
    if (!this.currentUserId || isDemoMode) return;

    try {
      await updateUiPreferences(this.currentUserId, {
        notificationSettings: this.settings,
      });
    } catch (error) {
      logger.error('Error saving notification settings', 'NotificationService', { error: String(error) });
    }
  }

  /**
   * Get current settings
   */
  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  /**
   * Update settings
   */
  updateSettings(newSettings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    void this.saveSettings();

    // Re-schedule notifications based on new settings
    if (this.settings.enabled) {
      this.rescheduleAllNotifications();
    } else {
      this.cancelAllNotifications();
    }
  }

  /**
   * Check if current time is within quiet hours
   */
  private isQuietHours(): boolean {
    const now = new Date();
    const currentHour = now.getHours();
    const { quietHoursStart, quietHoursEnd } = this.settings;

    if (quietHoursStart < quietHoursEnd) {
      // Normal range (e.g., 22 to 8 doesn't apply here)
      return currentHour >= quietHoursStart && currentHour < quietHoursEnd;
    } else {
      // Overnight range (e.g., 22 to 8)
      return currentHour >= quietHoursStart || currentHour < quietHoursEnd;
    }
  }

  /**
   * Get the preferred notification time for today
   */
  getPreferredNotificationTime(): Date {
    const now = new Date();
    const preferredHour = this.getHourForPreference();

    const notificationTime = new Date(now);
    notificationTime.setHours(preferredHour, 0, 0, 0);

    // If the time has passed today, schedule for tomorrow
    if (notificationTime <= now) {
      notificationTime.setDate(notificationTime.getDate() + 1);
    }

    return notificationTime;
  }

  /**
   * Convert preference to hour
   */
  private getHourForPreference(): number {
    switch (this.settings.preferredTime) {
      case 'morning':
        return 9;
      case 'afternoon':
        return 14;
      case 'evening':
        return 19;
      default:
        return 9;
    }
  }

  /**
   * Show a notification immediately
   */
  async showNotification(title: string, body: string, options?: NotificationOptions): Promise<void> {
    if (!this.settings.enabled || this.getPermissionStatus() !== 'granted') {
      logger.debug('Notifications disabled or permission not granted', 'NotificationService');
      return;
    }

    if (this.isQuietHours()) {
      logger.debug('Skipping notification during quiet hours', 'NotificationService');
      return;
    }

    try {
      // Try to use service worker for better mobile support
      const registration = await navigator.serviceWorker?.ready;
      if (registration) {
        await registration.showNotification(title, {
          body,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          tag: 'catalan-flashcards',
          ...options,
        });
      } else {
        // Fallback to regular notification
        new Notification(title, {
          body,
          icon: '/icons/icon-192x192.png',
          ...options,
        });
      }
    } catch (error) {
      logger.error('Error showing notification', 'NotificationService', { error: String(error) });
    }
  }

  /**
   * Schedule a due cards reminder
   */
  scheduleDueCardReminder(dueCount: number): void {
    if (!this.settings.enabled || !this.settings.dueCardReminders) return;
    if (dueCount === 0) return;

    const notificationTime = this.getPreferredNotificationTime();
    const notificationId = 'due_cards_reminder';

    // Cancel existing reminder
    this.cancelNotification(notificationId);

    const timeUntilNotification = notificationTime.getTime() - Date.now();
    if (timeUntilNotification <= 0) return;

    const timeout = setTimeout(() => {
      this.showNotification(
        '📚 Cards Ready for Review!',
        `You have ${dueCount} card${dueCount !== 1 ? 's' : ''} waiting. Keep your streak alive!`,
        {
          data: { action: 'open_study' },
        }
      );
    }, timeUntilNotification);

    this.scheduledNotifications.set(notificationId, timeout);
  }

  /**
   * Schedule a streak protection reminder
   */
  scheduleStreakReminder(currentStreak: number): void {
    if (!this.settings.enabled || !this.settings.streakReminders) return;
    if (currentStreak === 0) return;

    // Schedule for evening if they haven't studied today
    const now = new Date();
    const reminderTime = new Date(now);
    reminderTime.setHours(19, 0, 0, 0);

    if (reminderTime <= now) {
      return; // Too late for today
    }

    const notificationId = 'streak_reminder';
    this.cancelNotification(notificationId);

    const timeUntilNotification = reminderTime.getTime() - Date.now();

    const timeout = setTimeout(() => {
      this.showNotification(
        `🔥 Protect Your ${currentStreak}-Day Streak!`,
        "Don't lose your progress! A quick study session will keep your streak going.",
        {
          data: { action: 'open_study' },
        }
      );
    }, timeUntilNotification);

    this.scheduledNotifications.set(notificationId, timeout);
  }

  /**
   * Schedule a daily goal reminder
   */
  scheduleDailyGoalReminder(cardsStudiedToday: number, dailyGoal: number): void {
    if (!this.settings.enabled || !this.settings.dailyGoalReminders) return;
    if (cardsStudiedToday >= dailyGoal) return;

    const remaining = dailyGoal - cardsStudiedToday;
    const now = new Date();
    const reminderTime = new Date(now);
    reminderTime.setHours(18, 0, 0, 0);

    if (reminderTime <= now) {
      return;
    }

    const notificationId = 'daily_goal_reminder';
    this.cancelNotification(notificationId);

    const timeUntilNotification = reminderTime.getTime() - Date.now();

    const timeout = setTimeout(() => {
      this.showNotification(
        '🎯 Daily Goal Progress',
        `Just ${remaining} more card${remaining !== 1 ? 's' : ''} to reach your daily goal!`,
        {
          data: { action: 'open_study' },
        }
      );
    }, timeUntilNotification);

    this.scheduledNotifications.set(notificationId, timeout);
  }

  /**
   * Cancel a specific scheduled notification
   */
  cancelNotification(notificationId: string): void {
    const timeout = this.scheduledNotifications.get(notificationId);
    if (timeout) {
      clearTimeout(timeout);
      this.scheduledNotifications.delete(notificationId);
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  cancelAllNotifications(): void {
    for (const [, timeout] of this.scheduledNotifications) {
      clearTimeout(timeout);
    }
    this.scheduledNotifications.clear();
  }

  /**
   * Reschedule all notifications based on current settings
   */
  private rescheduleAllNotifications(): void {
    // This would be called when settings change
    // Actual scheduling would happen from the app based on user progress
  }

  /**
   * Get optimal study time based on user's history
   */
  getOptimalStudyTime(studyHistory: Array<{ date: Date; timeOfDay: number }>): string {
    if (studyHistory.length < 7) {
      return 'Not enough data yet';
    }

    // Calculate most common study hour
    const hourCounts: Record<number, number> = {};
    for (const entry of studyHistory) {
      const hour = entry.timeOfDay;
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    }

    let maxCount = 0;
    let optimalHour = 9;
    for (const [hour, count] of Object.entries(hourCounts)) {
      if (count > maxCount) {
        maxCount = count;
        optimalHour = parseInt(hour);
      }
    }

    // Format as time range
    const formatHour = (h: number) => {
      const period = h >= 12 ? 'PM' : 'AM';
      const hour12 = h % 12 || 12;
      return `${hour12} ${period}`;
    };

    return `${formatHour(optimalHour)} - ${formatHour((optimalHour + 1) % 24)}`;
  }
}

export const notificationService = new NotificationService();
